# 用户管理系统

一个无需外部依赖的 Node.js 网页应用，支持用户注册、登录、修改个人信息，以及管理员删除普通用户。

## 功能

- 用户注册：只需要用户名、密码、昵称
- 用户登录和退出
- 修改个人信息：昵称和密码
- 管理员查看用户列表
- 管理员删除普通用户
- 管理员不能删除自己或其他管理员

## 运行

```bash
npm start
```

浏览器打开：

```text
http://localhost:3000
```

首次启动前，复制 `.env.example` 为 `.env`，并填写初始管理员信息：

```text
ADMIN_USERNAME=your-admin-name
ADMIN_PASSWORD=your-admin-password
ADMIN_NICKNAME=管理员
```

也可以继续通过系统环境变量覆盖 `.env` 中的值。

## 测试

```bash
npm test
```

## 数据

用户数据保存在 `data/users.json`。第一次启动时，如果没有管理员账户，系统会自动创建一个初始管理员。
