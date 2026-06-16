export function registerPage(message = '', form = new URLSearchParams()) {
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

export function loginPage(message = '', form = new URLSearchParams()) {
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

export function profilePage(user, error = '') {
  return page(
    '个人信息',
    `<section class="panel">
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

export function adminUsersPage(currentUser, users) {
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

export function page(title, body) {
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

function value(form, name) {
  return String(form.get(name) ?? '');
}

function escapeHtml(input) {
  return String(input)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
