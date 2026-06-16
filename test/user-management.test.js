import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createApp } from '../src/server.js';

async function withServer(run) {
  const dataDir = await mkdtemp(path.join(tmpdir(), 'dgmxq-users-'));
  const admin = {
    username: `owner-${Date.now()}`,
    password: `secret-${Date.now()}`,
    nickname: 'System Owner',
  };
  const app = await createApp({
    dataFile: path.join(dataDir, 'users.json'),
    sessionSecret: 'test-secret',
    adminUsername: admin.username,
    adminPassword: admin.password,
    adminNickname: admin.nickname,
  });
  const server = app.listen(0);

  try {
    await new Promise((resolve) => server.once('listening', resolve));
    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    const jar = new CookieJar();
    await run({ baseUrl, jar, admin });
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    await rm(dataDir, { recursive: true, force: true });
  }
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

async function request(baseUrl, jar, pathname, options = {}) {
  const headers = new Headers(options.headers);
  if (jar.header()) {
    headers.set('cookie', jar.header());
  }

  const response = await fetch(`${baseUrl}${pathname}`, {
    redirect: 'manual',
    ...options,
    headers,
  });
  jar.save(response);
  return response;
}

function form(data) {
  return new URLSearchParams(data).toString();
}

test('registers a user with username password and nickname, then shows profile', async () => {
  await withServer(async ({ baseUrl, jar }) => {
    const response = await request(baseUrl, jar, '/register', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form({ username: 'alice', password: 'secret123', nickname: 'Alice' }),
    });

    assert.equal(response.status, 303);
    assert.equal(response.headers.get('location'), '/profile');

    const profile = await request(baseUrl, jar, '/profile');
    assert.equal(profile.status, 200);
    assert.match(await profile.text(), /Alice/);
  });
});

test('logs in with valid credentials', async () => {
  await withServer(async ({ baseUrl, jar }) => {
    await request(baseUrl, jar, '/register', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form({ username: 'bob', password: 'secret123', nickname: 'Bob' }),
    });

    const loginJar = new CookieJar();
    const response = await request(baseUrl, loginJar, '/login', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form({ username: 'bob', password: 'secret123' }),
    });

    assert.equal(response.status, 303);
    assert.equal(response.headers.get('location'), '/profile');
  });
});

test('updates the current user nickname and password', async () => {
  await withServer(async ({ baseUrl, jar }) => {
    await request(baseUrl, jar, '/register', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form({ username: 'carol', password: 'oldsecret', nickname: 'Carol' }),
    });

    const update = await request(baseUrl, jar, '/profile', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form({ nickname: 'New Carol', password: 'newsecret' }),
    });

    assert.equal(update.status, 303);
    assert.equal(update.headers.get('location'), '/profile');

    const loginJar = new CookieJar();
    const login = await request(baseUrl, loginJar, '/login', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form({ username: 'carol', password: 'newsecret' }),
    });
    assert.equal(login.status, 303);

    const profile = await request(baseUrl, loginJar, '/profile');
    assert.match(await profile.text(), /New Carol/);
  });
});

test('blocks ordinary users from the admin user list', async () => {
  await withServer(async ({ baseUrl, jar }) => {
    await request(baseUrl, jar, '/register', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form({ username: 'dave', password: 'secret123', nickname: 'Dave' }),
    });

    const response = await request(baseUrl, jar, '/admin/users');

    assert.equal(response.status, 403);
  });
});

test('allows the configured administrator to delete an ordinary user', async () => {
  await withServer(async ({ baseUrl, jar, admin }) => {
    await request(baseUrl, jar, '/register', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form({ username: 'erin', password: 'secret123', nickname: 'Erin' }),
    });

    const adminJar = new CookieJar();
    await request(baseUrl, adminJar, '/login', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form({ username: admin.username, password: admin.password }),
    });

    const list = await request(baseUrl, adminJar, '/admin/users');
    const html = await list.text();
    const userId = html.match(/data-username="erin" data-user-id="(\d+)"/)?.[1];

    assert.ok(userId);

    const deletion = await request(baseUrl, adminJar, `/admin/users/${userId}/delete`, {
      method: 'POST',
    });
    assert.equal(deletion.status, 303);

    const updatedList = await request(baseUrl, adminJar, '/admin/users');
    assert.doesNotMatch(await updatedList.text(), /Erin/);
  });
});

test('prevents administrators from deleting themselves or other administrators', async () => {
  await withServer(async ({ baseUrl, jar, admin }) => {
    await request(baseUrl, jar, '/login', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form({ username: admin.username, password: admin.password }),
    });

    const list = await request(baseUrl, jar, '/admin/users');
    const adminId = (await list.text()).match(new RegExp(`data-username="${admin.username}" data-user-id="(\\d+)"`))?.[1];

    assert.ok(adminId);

    const deletion = await request(baseUrl, jar, `/admin/users/${adminId}/delete`, {
      method: 'POST',
    });
    assert.equal(deletion.status, 403);
  });
});
