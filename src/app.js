import { hashPassword, randomToken, sign, verifyPassword } from './crypto.js';
import { adminUsersPage, loginPage, page, profilePage, registerPage } from './pages.js';
import { createEdgeKvStorage, createUserStore } from './storage.js';

export function createRequestHandler(options = {}) {
  const env = options.env ?? {};
  const storage = options.storage ?? createEdgeKvStorage(env);
  const sessionSecret = env.SESSION_SECRET ?? randomToken(32);
  let storePromise;

  return async function handleRequest(request) {
    const store = await getStore();
    try {
      return await route(request, store, sessionSecret);
    } catch (error) {
      console.error(error);
      return htmlResponse(500, page('系统错误', '<p class="message error">服务器暂时无法处理请求。</p>'));
    }
  };

  async function getStore() {
    if (!storePromise) {
      const adminPassword = env.ADMIN_PASSWORD ?? randomToken(18);
      const store = createUserStore(storage, {
        username: env.ADMIN_USERNAME ?? 'admin',
        passwordHash: await hashPassword(adminPassword),
        nickname: env.ADMIN_NICKNAME ?? '管理员',
      });
      storePromise = store.initialize().then(() => store);
    }
    return storePromise;
  }
}

async function route(request, store, sessionSecret) {
  const url = new URL(request.url);
  const currentUser = await getCurrentUser(request, store, sessionSecret);

  if (request.method === 'GET' && url.pathname === '/') {
    return redirect(currentUser ? '/profile' : '/login');
  }

  if (request.method === 'GET' && url.pathname === '/register') {
    return htmlResponse(200, registerPage());
  }

  if (request.method === 'POST' && url.pathname === '/register') {
    const form = await request.formData();
    const result = await register(store, form);
    if (!result.ok) {
      return htmlResponse(400, registerPage(result.message, form));
    }
    return withSession(redirect('/profile'), result.user.id, sessionSecret);
  }

  if (request.method === 'GET' && url.pathname === '/login') {
    return htmlResponse(200, loginPage());
  }

  if (request.method === 'POST' && url.pathname === '/login') {
    const form = await request.formData();
    const user = await store.findByUsername(value(form, 'username'));
    if (!user || !(await verifyPassword(value(form, 'password'), user.passwordHash))) {
      return htmlResponse(401, loginPage('用户名或密码错误。', form));
    }
    return withSession(redirect('/profile'), user.id, sessionSecret);
  }

  if (request.method === 'POST' && url.pathname === '/logout') {
    return withoutSession(redirect('/login'));
  }

  if (url.pathname === '/profile') {
    if (!currentUser) {
      return redirect('/login');
    }

    if (request.method === 'GET') {
      return htmlResponse(200, profilePage(currentUser));
    }

    if (request.method === 'POST') {
      const form = await request.formData();
      const result = await updateProfile(store, currentUser, form);
      if (!result.ok) {
        return htmlResponse(400, profilePage(currentUser, result.message));
      }
      return redirect('/profile');
    }
  }

  if (request.method === 'GET' && url.pathname === '/admin/users') {
    if (!currentUser) {
      return redirect('/login');
    }
    if (currentUser.role !== 'admin') {
      return htmlResponse(403, page('无权访问', '<p class="message error">只有管理员可以访问用户管理。</p>'));
    }
    return htmlResponse(200, adminUsersPage(currentUser, await store.listUsers()));
  }

  const deleteMatch = url.pathname.match(/^\/admin\/users\/(\d+)\/delete$/);
  if (request.method === 'POST' && deleteMatch) {
    if (!currentUser) {
      return redirect('/login');
    }
    if (currentUser.role !== 'admin') {
      return htmlResponse(403, page('无权访问', '<p class="message error">只有管理员可以删除用户。</p>'));
    }

    const target = await store.findById(Number(deleteMatch[1]));
    if (!target || target.id === currentUser.id || target.role === 'admin') {
      return htmlResponse(403, page('无法删除', '<p class="message error">管理员不能删除自己或其他管理员。</p>'));
    }
    await store.deleteUser(target.id);
    return redirect('/admin/users');
  }

  return htmlResponse(404, page('未找到', '<p class="message error">页面不存在。</p>'));
}

async function register(store, form) {
  const username = normalizeUsername(value(form, 'username'));
  const password = value(form, 'password');
  const nickname = value(form, 'nickname').trim();

  if (!username || !password || !nickname) {
    return { ok: false, message: '用户名、密码和昵称都不能为空。' };
  }
  if (username.length < 3) {
    return { ok: false, message: '用户名至少需要 3 个字符。' };
  }
  if (password.length < 6) {
    return { ok: false, message: '密码至少需要 6 个字符。' };
  }
  if (await store.findByUsername(username)) {
    return { ok: false, message: '用户名已存在。' };
  }

  return {
    ok: true,
    user: await store.createUser({ username, passwordHash: await hashPassword(password), nickname }),
  };
}

async function updateProfile(store, currentUser, form) {
  const nickname = value(form, 'nickname').trim();
  const password = value(form, 'password');

  if (!nickname) {
    return { ok: false, message: '昵称不能为空。' };
  }
  if (password && password.length < 6) {
    return { ok: false, message: '新密码至少需要 6 个字符。' };
  }

  const changes = { nickname };
  if (password) {
    changes.passwordHash = await hashPassword(password);
  }
  await store.updateUser(currentUser.id, changes);
  return { ok: true };
}

async function getCurrentUser(request, store, sessionSecret) {
  const session = await readSignedCookie(request, 'session', sessionSecret);
  if (!session) {
    return null;
  }
  const [userId] = session.split(':');
  return store.findById(Number(userId));
}

async function withSession(response, userId, sessionSecret) {
  const session = `${userId}:${randomToken(16)}`;
  response.headers.append('set-cookie', cookie('session', await sign(session, sessionSecret), { httpOnly: true }));
  return response;
}

function withoutSession(response) {
  response.headers.append('set-cookie', cookie('session', '', { maxAge: 0, httpOnly: true }));
  return response;
}

async function readSignedCookie(request, name, secret) {
  const raw = parseCookies(request.headers.get('cookie') ?? '')[name];
  if (!raw) {
    return null;
  }
  const index = raw.lastIndexOf('.');
  if (index === -1) {
    return null;
  }
  const value = raw.slice(0, index);
  return (await sign(value, secret)) === raw ? value : null;
}

function cookie(name, cookieValue, options = {}) {
  const parts = [`${name}=${encodeURIComponent(cookieValue)}`, 'Path=/', 'SameSite=Lax'];
  if (options.httpOnly) {
    parts.push('HttpOnly');
  }
  if (Number.isInteger(options.maxAge)) {
    parts.push(`Max-Age=${options.maxAge}`);
  }
  return parts.join('; ');
}

function parseCookies(header) {
  return Object.fromEntries(
    header
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [name, ...rest] = part.split('=');
        return [name, decodeURIComponent(rest.join('='))];
      }),
  );
}

function htmlResponse(status, body) {
  return new Response(body, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}

function redirect(location) {
  return new Response(null, { status: 303, headers: { location } });
}

function value(form, name) {
  return String(form.get(name) ?? '');
}

function normalizeUsername(username) {
  return username.trim().toLowerCase();
}
