# 用户管理系统

一个面向 EdgeOne Pages 的用户管理系统，支持用户注册、登录、修改个人信息，以及管理员删除普通用户。

## 功能

- 用户注册：只需要用户名、密码、昵称
- 用户登录和退出
- 修改个人信息：昵称和密码
- 管理员查看用户列表
- 管理员删除普通用户
- 管理员不能删除自己或其他管理员

## 项目结构

```text
functions/[[default]].js  EdgeOne Pages Functions 入口
public/style.css          静态样式资源
src/app.js                路由和业务流程
src/storage.js            EdgeOne KV / 内存存储适配
src/server.js             本地 Node 预览入口
```

## 本地运行

复制 `.env.example` 为 `.env`，并填写初始管理员信息：

```text
ADMIN_USERNAME=your-admin-name
ADMIN_PASSWORD=your-admin-password
ADMIN_NICKNAME=管理员
SESSION_SECRET=your-session-secret
```

启动本地预览：

```bash
npm start
```

浏览器打开：

```text
http://localhost:3000
```

## 测试和构建

```bash
npm test
npm run build
```

## EdgeOne Pages 部署

在 EdgeOne Pages 中使用以下配置：

```text
安装命令：npm install
构建命令：npm run build
输出目录：public
函数目录：functions
```

在 Pages 项目中配置环境变量：

```text
ADMIN_USERNAME
ADMIN_PASSWORD
ADMIN_NICKNAME
SESSION_SECRET
```

用户数据需要绑定 EdgeOne KV。建议绑定名使用：

```text
USER_STORE_KV
```

代码也兼容 `USERS_KV` 或 `KV` 作为绑定名。第一次请求时，如果 KV 中还没有管理员账户，系统会使用环境变量创建初始管理员。
