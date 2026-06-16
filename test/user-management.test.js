import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createRequestHandler } from '../src/app.js';
import { createMemoryStorage } from '../src/storage.js';
import { loadEnvFile } from '../src/env.js';

function createTestApp(options = {}) {
  const admin = options.admin ?? {
    username: `owner-${Date.now()}`,
    password: `secret-${Date.now()}`,
    nickname: 'System Owner',
  };
  const handler = createRequestHandler({
    env: {
      ADMIN_USERNAME: admin.username,
      ADMIN_PASSWORD: admin.password,
      ADMIN_NICKNAME: admin.nickname,
      SESSION_SECRET: 'test-secret',
      ...options.env,
    },
    storage: createMemoryStorage(),
  });
  return { admin, handler };
}

class CookieJar {
  #value = '';

  save(response) {
    const setCookie = response.headers.getSetCookie();
    if (setCookie.length > 0) {
      this.#value = setCookie.map((cookie) => cookie.split(';')[0]).join('; ');
    }
  }

  header() {
    return this.#value;
  }
}

async function request(handler, jar, pathname, options = {}) {
  const headers = new Headers(options.headers);
  if (jar.header()) {
    headers.set('cookie', jar.header());
  }

  const response = await handler(
    new Request(`https://example.com${pathname}`, {
      redirect: 'manual',
      ...options,
      headers,
    }),
  );
  jar.save(response);
  return response;
}

function form(data) {
  return new URLSearchParams(data).toString();
}

test('registers a user with username password and nickname, then shows profile', async () => {
  const { handler } = createTestApp();
  const jar = new CookieJar();
  const response = await request(handler, jar, '/register', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: form({ username: 'alice', password: 'secret123', nickname: 'Alice' }),
  });

  assert.equal(response.status, 303);
  assert.equal(response.headers.get('location'), '/profile');

  const profile = await request(handler, jar, '/profile');
  assert.equal(profile.status, 200);
  assert.match(await profile.text(), /Alice/);
});

test('logs in with valid credentials', async () => {
  const { handler } = createTestApp();
  const jar = new CookieJar();
  await request(handler, jar, '/register', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: form({ username: 'bob', password: 'secret123', nickname: 'Bob' }),
  });

  const loginJar = new CookieJar();
  const response = await request(handler, loginJar, '/login', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: form({ username: 'bob', password: 'secret123' }),
  });

  assert.equal(response.status, 303);
  assert.equal(response.headers.get('location'), '/profile');
});

test('updates the current user nickname and password', async () => {
  const { handler } = createTestApp();
  const jar = new CookieJar();
  await request(handler, jar, '/register', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: form({ username: 'carol', password: 'oldsecret', nickname: 'Carol' }),
  });

  const update = await request(handler, jar, '/profile', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: form({ nickname: 'New Carol', password: 'newsecret' }),
  });

  assert.equal(update.status, 303);
  assert.equal(update.headers.get('location'), '/profile');

  const loginJar = new CookieJar();
  const login = await request(handler, loginJar, '/login', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: form({ username: 'carol', password: 'newsecret' }),
  });
  assert.equal(login.status, 303);

  const profile = await request(handler, loginJar, '/profile');
  assert.match(await profile.text(), /New Carol/);
});

test('blocks ordinary users from the admin user list', async () => {
  const { handler } = createTestApp();
  const jar = new CookieJar();
  await request(handler, jar, '/register', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: form({ username: 'dave', password: 'secret123', nickname: 'Dave' }),
  });

  const response = await request(handler, jar, '/admin/users');

  assert.equal(response.status, 403);
});

test('allows the configured administrator to delete an ordinary user', async () => {
  const { admin, handler } = createTestApp();
  const jar = new CookieJar();
  await request(handler, jar, '/register', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: form({ username: 'erin', password: 'secret123', nickname: 'Erin' }),
  });

  const adminJar = new CookieJar();
  await request(handler, adminJar, '/login', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: form({ username: admin.username, password: admin.password }),
  });

  const list = await request(handler, adminJar, '/admin/users');
  const html = await list.text();
  const userId = html.match(/data-username="erin" data-user-id="(\d+)"/)?.[1];

  assert.ok(userId);

  const deletion = await request(handler, adminJar, `/admin/users/${userId}/delete`, {
    method: 'POST',
  });
  assert.equal(deletion.status, 303);

  const updatedList = await request(handler, adminJar, '/admin/users');
  assert.doesNotMatch(await updatedList.text(), /Erin/);
});

test('prevents administrators from deleting themselves or other administrators', async () => {
  const { admin, handler } = createTestApp();
  const jar = new CookieJar();
  await request(handler, jar, '/login', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: form({ username: admin.username, password: admin.password }),
  });

  const list = await request(handler, jar, '/admin/users');
  const adminId = (await list.text()).match(new RegExp(`data-username="${admin.username}" data-user-id="(\\d+)"`))?.[1];

  assert.ok(adminId);

  const deletion = await request(handler, jar, `/admin/users/${adminId}/delete`, {
    method: 'POST',
  });
  assert.equal(deletion.status, 403);
});

test('loads administrator credentials from an env file', async () => {
  const dataDir = await mkdtemp(path.join(tmpdir(), 'dgmxq-env-'));
  try {
    const envFile = path.join(dataDir, '.env');
    const admin = {
      username: `env-owner-${Date.now()}`,
      password: `env-secret-${Date.now()}`,
      nickname: 'Env Owner',
    };
    await writeFile(
      envFile,
      [
        `ADMIN_USERNAME=${admin.username}`,
        `ADMIN_PASSWORD=${admin.password}`,
        `ADMIN_NICKNAME=${admin.nickname}`,
        '',
      ].join('\n'),
      'utf8',
    );
    const { handler } = createTestApp({ env: await loadEnvFile(envFile) });
    const jar = new CookieJar();
    const login = await request(handler, jar, '/login', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form({ username: admin.username, password: admin.password }),
    });
    assert.equal(login.status, 303);

    const users = await request(handler, jar, '/admin/users');
    assert.equal(users.status, 200);
    assert.match(await users.text(), new RegExp(admin.nickname));
  } finally {
    await rm(dataDir, { recursive: true, force: true });
  }
});

test('exports an EdgeOne Pages onRequest handler', async () => {
  const mod = await import('../functions/[[default]].js');
  assert.equal(typeof mod.onRequest, 'function');
});
