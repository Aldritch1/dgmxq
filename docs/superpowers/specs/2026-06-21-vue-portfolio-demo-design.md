# Vue 个人主页/作品集 Demo 设计文档

## 1. 项目目标

清空现有仓库，创建一个基于 **Vite + Vue 3** 的个人主页/作品集 demo，构建为纯静态站点后部署到 **EdgeOne Pages**。

## 2. 需求摘要

- **类型**：静态展示型 demo
- **主题**：个人主页 / 作品集
- **风格**：明亮 / 卡片风格
- **动效**：基础动效（导航高亮、卡片悬停、平滑滚动）
- **页面模块**：
  1. 顶部导航栏（固定顶部，移动端折叠菜单）
  2. Hero 区域（姓名、职位、简介、CTA、头像）
  3. 项目作品集（网格卡片）
  4. 页脚（版权、社交链接）

## 3. 技术栈

- **框架**：Vue 3（Composition API）
- **构建工具**：Vite
- **样式**：原生 CSS（CSS Variables + 响应式）
- **数据**：静态 JS 模块（`src/data/profile.js`）
- **后端**：无

## 4. 文件结构

```text
.
├── public/
│   ├── avatar.svg              # Hero 头像/装饰图
│   └── projects/               # 项目截图占位图
├── src/
│   ├── assets/
│   │   └── styles.css          # 全局样式、CSS 变量
│   ├── components/
│   │   ├── Navbar.vue          # 顶部导航 + 移动端菜单
│   │   ├── Hero.vue            # Hero 区域
│   │   ├── ProjectCard.vue     # 单个项目卡片
│   │   ├── ProjectGrid.vue     # 项目网格
│   │   └── Footer.vue          # 页脚
│   ├── data/
│   │   └── profile.js          # 个人资料、项目列表数据
│   ├── App.vue                 # 根组件，组合各区块
│   └── main.js                 # 应用入口
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## 5. 组件设计

### 5.1 App.vue

- 作为页面布局容器。
- 按顺序组合 `Navbar` / `Hero` / `ProjectGrid` / `Footer`。
- 引入全局样式。

### 5.2 Navbar.vue

- 固定顶部，背景使用半透明 + 模糊效果。
- 左侧显示姓名/Logo。
- 右侧导航链接：Home、Projects、Contact。
- 滚动时添加底部阴影。
- 移动端显示汉堡菜单，点击展开/收起导航链接。

### 5.3 Hero.vue

- 两栏布局：左侧文字，右侧头像。
- 文字包含：
  - 问候语（如 "Hi, I'm"）
  - 姓名
  - 职位/身份
  - 一句话简介
  - CTA 按钮（跳转到 Projects 区域）
- 响应式：移动端改为单栏，头像在上或在下。

### 5.4 ProjectCard.vue

- Props：`title`、`description`、`tags`、`link`、`image`
- 卡片包含：
  - 项目截图/占位图
  - 标题
  - 描述
  - 技术栈标签
  - 查看详情/源码链接
- 悬停时轻微上浮并增强阴影。

### 5.5 ProjectGrid.vue

- Props：`projects`（数组）
- 使用 CSS Grid 渲染项目卡片。
- 标题为 "Projects" 或 "Selected Works"。
- 响应式：移动端单列，平板双列，桌面三列。

### 5.6 Footer.vue

- 显示版权信息。
- 社交链接图标（GitHub、Twitter/X、Email 等）。
- 简洁居中对齐。

## 6. 数据流

- 所有展示数据集中在 `src/data/profile.js`。
- 结构示例：

```javascript
export const profile = {
  name: 'Your Name',
  title: 'Frontend Developer',
  bio: 'I build accessible and performant web experiences with Vue and modern CSS.',
  avatar: '/avatar.svg',
  social: {
    github: 'https://github.com/...',
    twitter: 'https://twitter.com/...',
    email: 'mailto:...'
  }
}

export const projects = [
  {
    id: 1,
    title: 'Project One',
    description: 'A short description of the project.',
    tags: ['Vue', 'Vite', 'CSS'],
    link: 'https://example.com',
    image: '/projects/project-1.svg'
  }
  // ...
]
```

- `App.vue` 导入数据并通过 props 传递给子组件。
- 无全局状态管理，保持简单。

## 7. 样式方案

- 使用 CSS Variables 定义明亮主题：
  - 主色：`#3b82f6`
  - 背景：`#ffffff` / `#f8fafc`
  - 文字：`#1e293b` / `#64748b`
  - 卡片背景：`#ffffff`
  - 边框/阴影：`rgba(0, 0, 0, 0.05)`
- 响应式断点：
  - 移动端：< 768px
  - 平板：768px - 1023px
  - 桌面：>= 1024px
- 基础动效：
  - 导航链接悬停变色。
  - 卡片悬停 `transform: translateY(-4px)` + 阴影增强。
  - 页面平滑滚动 `scroll-behavior: smooth`。

## 8. EdgeOne Pages 部署配置

- **安装命令**：`npm install`
- **构建命令**：`npm run build`
- **输出目录**：`dist`
- 无需环境变量或后端函数。

## 9. 本地开发

```bash
npm install
npm run dev     # Vite 开发服务器
npm run build   # 生产构建
npm run preview # 预览构建产物
```

## 10. 验收标准

- [ ] `npm run build` 成功生成 `dist` 目录。
- [ ] `dist/index.html` 可直接打开或预览，页面正常显示。
- [ ] 页面包含 Navbar、Hero、Projects、Footer 四个区域。
- [ ] 移动端导航菜单可正常展开/收起。
- [ ] 项目卡片网格在不同屏幕尺寸下响应式排列。
- [ ] README 包含本地开发和 EdgeOne Pages 部署说明。
