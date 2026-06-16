import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultDataFile = join(__dirname, '..', 'data', 'users.json');
const defaultSessionSecret = process.env.SESSION_SECRET ?? randomBytes(32).toString('hex');
const sessions = new Map();

export async function createApp(options = {}) {
  const dataFile = options.dataFile ?? defaultDataFile;
  const sessionSecret = options.sessionSecret ?? defaultSessionSecret;
  const adminCredentials = {
    username: options.adminUsername ?? process.env.ADMIN_USERNAME ?? 'admin',
    password: options.adminPassword ?? process.env.ADMIN_PASSWORD ?? randomBytes(18).toString('base64url'),
    nickname: options.adminNickname ?? process.env.ADMIN_NICKNAME ?? '管理员',
  };
  const store = createStore(dataFile, adminCredentials);
  await store.initialize();

  return createServer(async (request, response) => {
    try {
      await route(request, response, store, sessionSecret);
    } catch (error) {
      console.error(error);
      sendHtml(response, 500, page('系统错误', '<p class="message error">服务器暂时无法处理请求。</p>'));
    }
  });
}

async function route(request, response, store, sessionSecret) {
  const url = new URL(request.url, 'http://localhost');
  const currentUser = await getCurrentUser(request, store, sessionSecret);

  if (request.method === 'GET' && url.pathname === '/') {
    redirect(response, currentUser ? '/profile' : '/login');
    return;
  }

  if (request.method === 'GET' && url.pathname === '/style.css') {
    send(response, 200, css(), 'text/css; charset=utf-8');
    return;
  }

  if (request.method === 'GET' && url.pathname === '/register') {
    sendHtml(response, 200, registerPage());
    return;
  }

  if (request.method === 'POST' && url.pathname === '/register') {
    const form = await readForm(request);
    const result = await register(store, form);
    if (!result.ok) {
      sendHtml(response, 400, registerPage(result.message, form));
      return;
    }
    createSession(response, result.user.id, sessionSecret);
    redirect(response, '/profile');
    return;
  }

  if (request.method === 'GET' && url.pathname === '/login') {
    sendHtml(response, 200, loginPage());
    return;
  }

  if (request.method === 'POST' && url.pathname === '/login') {
    const form = await readForm(request);
    const user = await store.findByUsername(value(form, 'username'));
    if (!user || !(await verifyPassword(value(form, 'password'), user.passwordHash))) {
      sendHtml(response, 401, loginPage('用户名或密码错误。', form));
      return;
    }
    createSession(response, user.id, sessionSecret);
    redirect(response, '/profile');
    return;
  }

  if (request.method === 'POST' && url.pathname === '/logout') {
    destroySession(request, response, sessionSecret);
    redirect(response, '/login');
    return;
  }

  if (url.pathname === '/profile') {
    if (!currentUser) {
      redirect(response, '/login');
      return;
    }

    if (request.method === 'GET') {
      sendHtml(response, 200, profilePage(currentUser, url.searchParams.get('saved') === '1'));
      return;
    }

    if (request.method === 'POST') {
      const form = await readForm(request);
      const result = await updateProfile(store, currentUser, form);
      if (!result.ok) {
        sendHtml(response, 400, profilePage(currentUser, false, result.message));
        return;
      }
      redirect(response, '/profile');
      return;
    }
  }

  if (request.method === 'GET' && url.pathname === '/admin/users') {
    if (!currentUser) {
      redirect(response, '/login');
      return;
    }
    if (currentUser.role !== 'admin') {
      sendHtml(response, 403, page('无权访问', '<p class="message error">只有管理员可以访问用户管理。</p>'));
      return;
    }
    sendHtml(response, 200, adminUsersPage(currentUser, await store.listUsers()));
    return;
  }

  const deleteMatch = url.pathname.match(/^\/admin\/users\/(\d+)\/delete$/);
  if (request.method === 'POST' && deleteMatch) {
    if (!currentUser) {
      redirect(response, '/login');
      return;
    }
    if (currentUser.role !== 'admin') {
      sendHtml(response, 403, page('无权访问', '<p class="message error">只有管理员可以删除用户。</p>'));
      return;
    }

    const target = await store.findById(Number(deleteMatch[1]));
    if (!target || target.id === currentUser.id || target.role === 'admin') {
      sendHtml(response, 403, page('无法删除', '<p class="message error">管理员不能删除自己或其他管理员。</p>'));
      return;
    }
    await store.deleteUser(target.id);
    redirect(response, '/admin/users');
    return;
  }

  sendHtml(response, 404, page('未找到', '<p class="message error">页面不存在。</p>'));
}

function createStore(dataFile, adminCredentials) {
  return {
    async initialize() {
      await mkdir(dirname(dataFile), { recursive: true });
      let data = await this.read();
      if (!data.users.some((user) => user.role === 'admin')) {
        data = {
          ...data,
          nextId: Math.max(data.nextId, 2),
          users: [
            ...data.users,
            {
              id: 1,
              username: adminCredentials.username,
              nickname: adminCredentials.nickname,
              role: 'admin',
              passwordHash: await hashPassword(adminCredentials.password),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        };
        await this.write(data);
      }
    },
    async read() {
      try {
        return JSON.parse(await readFile(dataFile, 'utf8'));
      } catch (error) {
        if (error.code === 'ENOENT') {
          return { nextId: 1, users: [] };
        }
        throw error;
      }
    },
    async write(data) {
      await writeFile(dataFile, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
    },
    async listUsers() {
      const data = await this.read();
      return data.users.toSorted((a, b) => a.id - b.id);
    },
    async findById(id) {
      const data = await this.read();
      return data.users.find((user) => user.id === id) ?? null;
    },
    async findByUsername(username) {
      const data = await this.read();
      return data.users.find((user) => user.username === username) ?? null;
    },
    async createUser({ username, password, nickname }) {
      const data = await this.read();
      const now = new Date().toISOString();
      const user = {
        id: data.nextId,
        username,
        nickname,
        role: 'user',
        passwordHash: await hashPassword(password),
        createdAt: now,
        updatedAt: now,
      };
      data.nextId += 1;
      data.users.push(user);
      await this.write(data);
      return user;
    },
    async updateUser(id, changes) {
      const data = await this.read();
      const user = data.users.find((item) => item.id === id);
      if (!user) {
        return null;
      }
      Object.assign(user, changes, { updatedAt: new Date().toISOString() });
      await this.write(data);
      return user;
    },
    async deleteUser(id) {
      const data = await this.read();
      data.users = data.users.filter((user) => user.id !== id);
      await this.write(data);
    },
  };
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

  return { ok: true, user: await store.createUser({ username, password, nickname }) };
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

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, 64);
  return `${salt}:${hash.toString('hex')}`;
}

async function verifyPassword(password, passwordHash) {
  const [salt, stored] = passwordHash.split(':');
  if (!salt || !stored) {
    return false;
  }
  const hash = await scrypt(password, salt, 64);
  const storedBuffer = Buffer.from(stored, 'hex');
  return storedBuffer.length === hash.length && timingSafeEqual(storedBuffer, hash);
}

function createSession(response, userId, sessionSecret) {
  const sessionId = randomBytes(24).toString('hex');
  sessions.set(sessionId, userId);
  response.setHeader('set-cookie', cookie('session', sign(sessionId, sessionSecret), { httpOnly: true }));
}

function destroySession(request, response, sessionSecret) {
  const session = readSignedCookie(request, 'session', sessionSecret);
  if (session) {
    sessions.delete(session);
  }
  response.setHeader('set-cookie', cookie('session', '', { maxAge: 0, httpOnly: true }));
}

async function getCurrentUser(request, store, sessionSecret) {
  const session = readSignedCookie(request, 'session', sessionSecret);
  if (!session) {
    return null;
  }
  const userId = sessions.get(session);
  return userId ? store.findById(userId) : null;
}

function sign(value, secret) {
  const signature = createHmac('sha256', secret).update(value).digest('base64url');
  return `${value}.${signature}`;
}

function readSignedCookie(request, name, secret) {
  const raw = parseCookies(request.headers.cookie ?? '')[name];
  if (!raw) {
    return null;
  }
  const [value, signature] = raw.split('.');
  return signature && sign(value, secret) === raw ? value : null;
}

function cookie(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`, 'Path=/', 'SameSite=Lax'];
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

async function readForm(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
  }
  return new URLSearchParams(body);
}

function value(form, name) {
  return String(form.get(name) ?? '');
}

function normalizeUsername(username) {
  return username.trim().toLowerCase();
}

function registerPage(message = '', form = new URLSearchParams()) {
  return page(
    '注册',
    `<form method="post" class="panel">
      ${messageHtml(message, 'error')}
      <label>用户名<input name="username" value="${escapeHtml(value(form, 'username'))}" autocomplete="username" required></label>
      <label>密码<input name="password" type="password" autocomplete="new-password" required></label>
      <label>昵称<input name="nickname" value="${escapeHtml(value(form, 'nickname'))}" required></label>
      <button type="submit">注册</button>
      <p class="switch">已有账户？<a href="/login">去登录</a></p>
    </form>`,
  );
}

function loginPage(message = '', form = new URLSearchParams()) {
  return page(
    '登录',
    `<form method="post" class="panel">
      ${messageHtml(message, 'error')}
      <label>用户名<input name="username" value="${escapeHtml(value(form, 'username'))}" autocomplete="username" required></label>
      <label>密码<input name="password" type="password" autocomplete="current-password" required></label>
      <button type="submit">登录</button>
      <p class="switch">没有账户？<a href="/register">去注册</a></p>
    </form>`,
  );
}

function profilePage(user, saved = false, error = '') {
  return page(
    '个人信息',
    `<section class="panel">
      ${saved ? messageHtml('个人信息已保存。', 'success') : ''}
      ${messageHtml(error, 'error')}
      <dl class="meta">
        <div><dt>用户名</dt><dd>${escapeHtml(user.username)}</dd></div>
        <div><dt>角色</dt><dd>${roleText(user.role)}</dd></div>
      </dl>
      <form method="post">
        <label>昵称<input name="nickname" value="${escapeHtml(user.nickname)}" required></label>
        <label>新密码<input name="password" type="password" autocomplete="new-password" placeholder="不修改请留空"></label>
        <button type="submit">保存</button>
      </form>
      <div class="actions">
        ${user.role === 'admin' ? '<a class="button secondary" href="/admin/users">管理用户</a>' : ''}
        <form method="post" action="/logout"><button class="secondary" type="submit">退出登录</button></form>
      </div>
    </section>`,
  );
}

function adminUsersPage(currentUser, users) {
  const rows = users
    .map((user) => {
      const canDelete = user.role !== 'admin' && user.id !== currentUser.id;
      return `<tr data-username="${escapeHtml(user.username)}" data-user-id="${user.id}">
        <td>${escapeHtml(user.username)}</td>
        <td>${escapeHtml(user.nickname)}</td>
        <td><span class="badge">${roleText(user.role)}</span></td>
        <td>${new Date(user.createdAt).toLocaleString('zh-CN')}</td>
        <td>${
          canDelete
            ? `<form method="post" action="/admin/users/${user.id}/delete"><button class="danger" type="submit">删除</button></form>`
            : '<span class="muted">不可删除</span>'
        }</td>
      </tr>`;
    })
    .join('');

  return page(
    '用户管理',
    `<section class="wide-panel">
      <div class="toolbar"><a class="button secondary" href="/profile">返回个人信息</a></div>
      <table>
        <thead><tr><th>用户名</th><th>昵称</th><th>角色</th><th>注册时间</th><th>操作</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </section>`,
  );
}

function page(title, body) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} - 用户管理系统</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <main>
    <header>
      <h1>${escapeHtml(title)}</h1>
      <p>用户管理系统</p>
    </header>
    ${body}
  </main>
</body>
</html>`;
}

function messageHtml(message, type) {
  return message ? `<p class="message ${type}">${escapeHtml(message)}</p>` : '';
}

function roleText(role) {
  return role === 'admin' ? '管理员' : '普通用户';
}

function escapeHtml(input) {
  return String(input)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function sendHtml(response, status, html) {
  send(response, status, html, 'text/html; charset=utf-8');
}

function send(response, status, body, contentType) {
  response.writeHead(status, {
    'content-type': contentType,
    'content-length': Buffer.byteLength(body),
  });
  response.end(body);
}

function redirect(response, location) {
  response.writeHead(303, { location });
  response.end();
}

function css() {
  return `
* { box-sizing: border-box; }
body {
  margin: 0;
  min-height: 100vh;
  font-family: Arial, "Microsoft YaHei", sans-serif;
  color: #18212f;
  background: #f4f6f8;
}
main {
  width: min(960px, calc(100% - 32px));
  margin: 0 auto;
  padding: 48px 0;
}
header { margin-bottom: 24px; }
h1 { margin: 0 0 6px; font-size: 32px; }
header p, .muted { color: #687386; }
.panel, .wide-panel {
  background: #fff;
  border: 1px solid #dce2ea;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 12px 30px rgba(21, 31, 45, 0.08);
}
.panel { max-width: 460px; }
form { margin: 0; }
label {
  display: grid;
  gap: 8px;
  margin-bottom: 16px;
  font-weight: 700;
}
input {
  width: 100%;
  border: 1px solid #c8d1dc;
  border-radius: 6px;
  padding: 11px 12px;
  font: inherit;
}
button, .button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  border: 0;
  border-radius: 6px;
  padding: 0 16px;
  color: #fff;
  background: #2563eb;
  font: inherit;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}
.secondary { color: #1f2a37; background: #e7edf4; }
.danger { background: #dc2626; }
.switch { margin: 16px 0 0; }
.message {
  margin: 0 0 16px;
  border-radius: 6px;
  padding: 12px;
  font-weight: 700;
}
.error { color: #7f1d1d; background: #fee2e2; }
.success { color: #14532d; background: #dcfce7; }
.meta {
  display: grid;
  gap: 10px;
  margin: 0 0 18px;
}
.meta div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid #eef2f6;
  padding-bottom: 10px;
}
dt { color: #687386; }
dd { margin: 0; font-weight: 700; }
.actions, .toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border-bottom: 1px solid #e5eaf0;
  padding: 12px;
  text-align: left;
}
.badge {
  display: inline-flex;
  border-radius: 999px;
  padding: 4px 10px;
  background: #eef2ff;
  color: #3730a3;
  font-size: 13px;
  font-weight: 700;
}
@media (max-width: 640px) {
  main { width: min(100% - 20px, 960px); padding: 24px 0; }
  .panel, .wide-panel { padding: 18px; }
  table { display: block; overflow-x: auto; white-space: nowrap; }
}
`;
}

if (process.argv[1] && basename(process.argv[1]) === 'server.js') {
  const port = Number(process.env.PORT ?? 3000);
  const app = await createApp();
  app.listen(port, () => {
    console.log(`用户管理系统已启动：http://localhost:${port}`);
    console.log('请通过 ADMIN_USERNAME、ADMIN_PASSWORD 和 ADMIN_NICKNAME 配置初始管理员。');
  });
}
