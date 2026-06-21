# Vue Portfolio Demo

一个基于 Vue 3 + Vite 的个人主页/作品集 demo，明亮卡片风格，响应式布局，可部署到 EdgeOne Pages。

## 功能

- 固定顶部导航栏，支持移动端折叠菜单
- Hero 个人介绍区域
- 项目作品集卡片网格
- 页脚社交链接
- 响应式适配移动端、平板、桌面

## 项目结构

```text
public/                 静态资源（头像、项目图）
src/
  assets/styles.css     全局样式与 CSS 变量
  components/           Vue 组件
  data/profile.js       个人资料与项目数据
  App.vue               页面根组件
  main.js               应用入口
index.html              HTML 入口
vite.config.js          Vite 配置
```

## 本地开发

```bash
npm install
npm run dev
```

浏览器打开终端输出的地址，通常为 `http://localhost:5173`。

## 构建

```bash
npm run build
```

构建产物输出到 `dist` 目录。

## EdgeOne Pages 部署

在 EdgeOne Pages 控制台创建项目并关联仓库，使用以下配置：

- 安装命令：`npm install`
- 构建命令：`npm run build`
- 输出目录：`dist`

无需额外环境变量或后端函数。

## 自定义内容

修改 `src/data/profile.js` 中的 `profile` 和 `projects` 对象，即可更新个人信息和展示项目。
