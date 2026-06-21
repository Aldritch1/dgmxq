# Vue 个人主页/作品集 Demo 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 清空现有仓库，使用 Vite + Vue 3 创建一个明亮卡片风格的个人主页/作品集静态站点，并配置为 EdgeOne Pages 可部署的 demo。

**Architecture:** 采用 Vue 3 Composition API 单文件组件，按功能拆分为 Navbar / Hero / ProjectGrid / Footer 等组件；数据通过 `src/data/profile.js` 集中管理；Vite 构建输出 `dist` 目录供 EdgeOne Pages 托管；无后端依赖。

**Tech Stack:** Vue 3, Vite, 原生 CSS Variables, EdgeOne Pages（静态托管）

## Global Constraints

- Node.js >= 20
- 使用 Vue 3 Composition API 与 `<script setup>` 语法
- 不使用全局状态管理库
- 不使用 UI 组件库，样式使用原生 CSS
- 构建输出目录必须为 `dist`
- 无后端 API，所有数据为静态 JS 导出
- 页面必须响应式适配移动端、平板、桌面
- 基础动效包括：导航链接悬停、卡片悬停上浮、平滑滚动、滚动时导航栏阴影

---

## File Structure

```text
.
├── public/
│   ├── avatar.svg              # Hero 头像/装饰图
│   └── projects/
│       ├── project-1.svg
│       ├── project-2.svg
│       └── project-3.svg
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
├── package-lock.json
└── README.md
```

---

### Task 1: 清空旧项目文件

**Files:**
- Delete: `functions/[[default]].js`
- Delete: `public/style.css`
- Delete: `scripts/build.js`
- Delete: `src/app.js`
- Delete: `src/crypto.js`
- Delete: `src/env.js`
- Delete: `src/pages.js`
- Delete: `src/server.js`
- Delete: `src/storage.js`
- Delete: `test/user-management.test.js`
- Delete: `.env.example`
- Modify: `.gitignore`
- Modify: `README.md`（后续任务覆盖）

**Interfaces:**
- Produces: 干净的仓库根目录，仅保留 `.git/`、`docs/`、`package.json`、`package-lock.json`、`.gitignore`。

- [ ] **Step 1: 删除旧源码、测试、函数目录和配置文件**

```bash
rm -rf functions public scripts src test .env.example
```

- [ ] **Step 2: 清理 package.json 为空的 Vite 项目模板做准备**

保留 `package.json` 和 `package-lock.json` 文件本身，但后续任务会覆盖内容。这里不需要手动修改内容。

- [ ] **Step 3: 更新 .gitignore**

`.gitignore` 内容替换为：

```text
node_modules
dist
.env
.env.local
.DS_Store
```

- [ ] **Step 4: 验证目录状态**

运行：

```bash
ls -la
```

Expected: 根目录下仅剩 `.git/`、`docs/`、`package.json`、`package-lock.json`、`.gitignore`。

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove legacy user management codebase"
```

---

### Task 2: 初始化 Vite + Vue 3 项目骨架

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.js`
- Create: `src/App.vue`
- Modify: `package-lock.json`（由 npm install 自动生成）

**Interfaces:**
- Consumes: 干净的仓库根目录。
- Produces: 可运行的最小 Vite + Vue 3 应用，访问根路径时渲染 `App.vue`。

- [ ] **Step 1: 写入 package.json**

```json
{
  "name": "vue-portfolio-demo",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.4.21"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.4",
    "vite": "^5.2.0"
  },
  "engines": {
    "node": ">=20"
  }
}
```

- [ ] **Step 2: 写入 vite.config.js**

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist'
  }
})
```

- [ ] **Step 3: 写入 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/avatar.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vue Portfolio Demo</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

- [ ] **Step 4: 写入 src/main.js**

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import './assets/styles.css'

createApp(App).mount('#app')
```

- [ ] **Step 5: 写入最小 App.vue**

```vue
<script setup>
</script>

<template>
  <div class="app">
    <h1>Hello Vue</h1>
  </div>
</template>
```

- [ ] **Step 6: 安装依赖并验证构建**

运行：

```bash
npm install
npm run build
```

Expected: 命令成功退出，`dist/` 目录生成，包含 `index.html` 和 `assets/`。

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite + Vue 3 project"
```

---

### Task 3: 创建全局样式与 CSS 变量

**Files:**
- Create: `src/assets/styles.css`

**Interfaces:**
- Consumes: `src/main.js` 中已引入该文件。
- Produces: 全局 reset、CSS variables、工具类、响应式基础样式。

- [ ] **Step 1: 写入 styles.css**

```css
:root {
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-bg: #ffffff;
  --color-bg-alt: #f8fafc;
  --color-text: #1e293b;
  --color-text-muted: #64748b;
  --color-border: rgba(0, 0, 0, 0.05);
  --color-card-shadow: rgba(0, 0, 0, 0.08);
  --color-card-shadow-hover: rgba(0, 0, 0, 0.12);

  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;

  --container-max: 1200px;
  --section-padding-y: 5rem;
  --section-padding-x: 1.5rem;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-sans);
  background-color: var(--color-bg);
  color: var(--color-text);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

a {
  color: inherit;
  text-decoration: none;
}

img {
  max-width: 100%;
  display: block;
}

.container {
  width: 100%;
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--section-padding-x);
}

.section {
  padding: var(--section-padding-y) 0;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 2.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  transition: background-color 0.2s ease, transform 0.2s ease;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background-color: var(--color-primary);
  color: #ffffff;
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
  transform: translateY(-2px);
}

@media (min-width: 768px) {
  :root {
    --section-padding-y: 6rem;
    --section-padding-x: 2rem;
  }

  .section-title {
    font-size: 2.25rem;
  }
}

@media (min-width: 1024px) {
  :root {
    --section-padding-y: 7rem;
    --section-padding-x: 2.5rem;
  }
}
```

- [ ] **Step 2: 验证构建**

运行：

```bash
npm run build
```

Expected: 构建成功，`dist/` 更新。

- [ ] **Step 3: Commit**

```bash
git add src/assets/styles.css
git commit -m "feat: add global styles and CSS variables"
```

---

### Task 4: 创建静态数据模块

**Files:**
- Create: `src/data/profile.js`

**Interfaces:**
- Produces: `profile` 对象和 `projects` 数组，供 App.vue 及子组件通过 props 消费。
- Exports:
  - `profile: { name, title, bio, avatar, social }`
  - `projects: Array<{ id, title, description, tags, link, image }>`

- [ ] **Step 1: 写入 profile.js**

```javascript
export const profile = {
  name: 'Alex Chen',
  title: 'Frontend Developer',
  bio: '热爱构建简洁、可访问且高性能的 Web 体验。专注于 Vue 生态与现代 CSS，喜欢把复杂的问题变成优雅的界面。',
  avatar: '/avatar.svg',
  social: {
    github: 'https://github.com/example',
    twitter: 'https://twitter.com/example',
    email: 'mailto:hello@example.com'
  }
}

export const projects = [
  {
    id: 1,
    title: '任务管理应用',
    description: '一个支持拖拽排序和本地持久化的任务看板，帮助用户高效管理日常待办。',
    tags: ['Vue 3', 'Pinia', 'LocalStorage'],
    link: 'https://example.com/project-1',
    image: '/projects/project-1.svg'
  },
  {
    id: 2,
    title: '天气仪表盘',
    description: '基于地理位置的实时天气展示，支持多日 forecast 与主题切换。',
    tags: ['Vue 3', 'Composition API', 'Fetch API'],
    link: 'https://example.com/project-2',
    image: '/projects/project-2.svg'
  },
  {
    id: 3,
    title: '个人博客主题',
    description: '为静态站点生成器设计的极简博客主题，注重排版与阅读体验。',
    tags: ['Vue 3', 'Vite', 'Markdown'],
    link: 'https://example.com/project-3',
    image: '/projects/project-3.svg'
  }
]
```

- [ ] **Step 2: 验证数据模块可导入**

运行：

```bash
node -e "import('./src/data/profile.js').then(m => console.log(m.profile.name, m.projects.length))"
```

Expected: 输出 `Alex Chen 3`。

- [ ] **Step 3: Commit**

```bash
git add src/data/profile.js
git commit -m "feat: add profile and projects data module"
```

---

### Task 5: 创建 Navbar 组件

**Files:**
- Create: `src/components/Navbar.vue`

**Interfaces:**
- Consumes: `profile.name`（String）作为 logo 文本。
- Produces: 固定顶部导航，支持锚点跳转和移动端菜单切换。

- [ ] **Step 1: 写入 Navbar.vue**

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

defineProps({
  name: {
    type: String,
    required: true
  }
})

const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)

function handleScroll() {
  isScrolled.value = window.scrollY > 10
}

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <header
    class="navbar"
    :class="{ 'navbar--scrolled': isScrolled }"
  >
    <div class="navbar__container container">
      <a href="#home" class="navbar__logo" @click="closeMobileMenu">
        {{ name }}
      </a>

      <button
        class="navbar__toggle"
        aria-label="Toggle menu"
        aria-expanded="isMobileMenuOpen"
        @click="toggleMobileMenu"
      >
        <span class="navbar__toggle-bar" :class="{ 'open': isMobileMenuOpen }"></span>
        <span class="navbar__toggle-bar" :class="{ 'open': isMobileMenuOpen }"></span>
        <span class="navbar__toggle-bar" :class="{ 'open': isMobileMenuOpen }"></span>
      </button>

      <nav class="navbar__nav" :class="{ 'navbar__nav--open': isMobileMenuOpen }">
        <a href="#home" class="navbar__link" @click="closeMobileMenu">Home</a>
        <a href="#projects" class="navbar__link" @click="closeMobileMenu">Projects</a>
        <a href="#contact" class="navbar__link" @click="closeMobileMenu">Contact</a>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  transition: box-shadow 0.2s ease;
}

.navbar--scrolled {
  box-shadow: 0 1px 3px var(--color-border);
}

.navbar__container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4rem;
}

.navbar__logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
}

.navbar__toggle {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.35rem;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: none;
  cursor: pointer;
}

.navbar__toggle-bar {
  display: block;
  width: 100%;
  height: 2px;
  background-color: var(--color-text);
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.navbar__toggle-bar.open:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.navbar__toggle-bar.open:nth-child(2) {
  opacity: 0;
}

.navbar__toggle-bar.open:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

.navbar__nav {
  position: absolute;
  top: 4rem;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  background-color: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.navbar__nav--open {
  max-height: 200px;
}

.navbar__link {
  padding: 1rem 1.5rem;
  font-weight: 500;
  color: var(--color-text-muted);
  transition: color 0.2s ease;
}

.navbar__link:hover {
  color: var(--color-primary);
}

@media (min-width: 768px) {
  .navbar__toggle {
    display: none;
  }

  .navbar__nav {
    position: static;
    flex-direction: row;
    gap: 2rem;
    background-color: transparent;
    border-bottom: none;
    max-height: none;
    overflow: visible;
  }

  .navbar__link {
    padding: 0;
  }
}
</style>
```

- [ ] **Step 2: 验证构建**

运行：

```bash
npm run build
```

Expected: 构建成功。

- [ ] **Step 3: Commit**

```bash
git add src/components/Navbar.vue
git commit -m "feat: add responsive Navbar component"
```

---

### Task 6: 创建 Hero 组件

**Files:**
- Create: `src/components/Hero.vue`
- Create: `public/avatar.svg`

**Interfaces:**
- Consumes:
  - `name: String`
  - `title: String`
  - `bio: String`
  - `avatar: String`
- Produces: 居中的 Hero 展示区域，带 CTA 按钮跳转至 Projects。

- [ ] **Step 1: 写入 Hero.vue**

```vue
<script setup>
defineProps({
  name: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    required: true
  }
})
</script>

<template>
  <section id="home" class="hero section">
    <div class="hero__container container">
      <div class="hero__content">
        <p class="hero__greeting">Hi, I'm</p>
        <h1 class="hero__name">{{ name }}</h1>
        <p class="hero__title">{{ title }}</p>
        <p class="hero__bio">{{ bio }}</p>
        <a href="#projects" class="hero__cta btn btn-primary">View My Work</a>
      </div>
      <div class="hero__image-wrapper">
        <img :src="avatar" :alt="name" class="hero__image" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding-top: 6rem;
  background-color: var(--color-bg-alt);
}

.hero__container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
  align-items: center;
}

.hero__content {
  text-align: center;
}

.hero__greeting {
  font-size: 1.125rem;
  color: var(--color-primary);
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.hero__name {
  font-size: 2.75rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 0.75rem;
}

.hero__title {
  font-size: 1.25rem;
  color: var(--color-text-muted);
  margin-bottom: 1.25rem;
}

.hero__bio {
  font-size: 1rem;
  color: var(--color-text-muted);
  max-width: 500px;
  margin: 0 auto 1.75rem;
}

.hero__cta {
  font-size: 1rem;
}

.hero__image-wrapper {
  display: flex;
  justify-content: center;
}

.hero__image {
  width: 240px;
  height: 240px;
  border-radius: 50%;
  object-fit: cover;
  background-color: #e2e8f0;
}

@media (min-width: 768px) {
  .hero__name {
    font-size: 3.5rem;
  }

  .hero__image {
    width: 300px;
    height: 300px;
  }
}

@media (min-width: 1024px) {
  .hero__container {
    grid-template-columns: 1.2fr 1fr;
  }

  .hero__content {
    text-align: left;
  }

  .hero__bio {
    margin-left: 0;
  }

  .hero__name {
    font-size: 4rem;
  }

  .hero__image {
    width: 360px;
    height: 360px;
  }
}
</style>
```

- [ ] **Step 2: 写入 public/avatar.svg**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <circle cx="100" cy="100" r="100" fill="#3b82f6"/>
  <circle cx="100" cy="80" r="40" fill="#ffffff"/>
  <path d="M40 170c0-40 25-70 60-70s60 30 60 70" fill="#ffffff"/>
</svg>
```

- [ ] **Step 3: 验证构建**

运行：

```bash
npm run build
```

Expected: 构建成功，`dist/avatar.svg` 存在。

- [ ] **Step 4: Commit**

```bash
git add src/components/Hero.vue public/avatar.svg
git commit -m "feat: add Hero section and avatar asset"
```

---

### Task 7: 创建 ProjectCard 与 ProjectGrid 组件

**Files:**
- Create: `src/components/ProjectCard.vue`
- Create: `src/components/ProjectGrid.vue`
- Create: `public/projects/project-1.svg`
- Create: `public/projects/project-2.svg`
- Create: `public/projects/project-3.svg`

**Interfaces:**
- Consumes:
  - `ProjectGrid` 接收 `projects: Array<{ id, title, description, tags, link, image }>`
  - `ProjectCard` 接收单个 `project` 对象
- Produces: 响应式项目卡片网格。

- [ ] **Step 1: 写入 ProjectCard.vue**

```vue
<script setup>
defineProps({
  project: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <article class="project-card">
    <img :src="project.image" :alt="project.title" class="project-card__image" />
    <div class="project-card__body">
      <h3 class="project-card__title">{{ project.title }}</h3>
      <p class="project-card__description">{{ project.description }}</p>
      <div class="project-card__tags">
        <span v-for="tag in project.tags" :key="tag" class="project-card__tag">
          {{ tag }}
        </span>
      </div>
      <a :href="project.link" target="_blank" rel="noopener noreferrer" class="project-card__link">
        View Project →
      </a>
    </div>
  </article>
</template>

<style scoped>
.project-card {
  background-color: var(--color-bg);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 4px 12px var(--color-card-shadow);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px var(--color-card-shadow-hover);
}

.project-card__image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  background-color: #e2e8f0;
}

.project-card__body {
  padding: 1.5rem;
}

.project-card__title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.project-card__description {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  margin-bottom: 1rem;
}

.project-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.project-card__tag {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  background-color: rgba(59, 130, 246, 0.1);
  color: var(--color-primary);
}

.project-card__link {
  font-weight: 600;
  color: var(--color-primary);
  transition: color 0.2s ease;
}

.project-card__link:hover {
  color: var(--color-primary-hover);
}
</style>
```

- [ ] **Step 2: 写入 ProjectGrid.vue**

```vue
<script setup>
import ProjectCard from './ProjectCard.vue'

defineProps({
  projects: {
    type: Array,
    required: true
  }
})
</script>

<template>
  <section id="projects" class="project-grid section">
    <div class="container">
      <h2 class="section-title">Selected Works</h2>
      <div class="project-grid__list">
        <ProjectCard
          v-for="project in projects"
          :key="project.id"
          :project="project"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.project-grid {
  background-color: var(--color-bg);
}

.project-grid__list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .project-grid__list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .project-grid__list {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
```

- [ ] **Step 3: 写入项目占位图**

`public/projects/project-1.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">
  <rect width="400" height="240" fill="#dbeafe"/>
  <rect x="40" y="60" width="120" height="120" rx="12" fill="#3b82f6"/>
  <rect x="200" y="70" width="160" height="16" rx="8" fill="#93c5fd"/>
  <rect x="200" y="110" width="120" height="16" rx="8" fill="#bfdbfe"/>
</svg>
```

`public/projects/project-2.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">
  <rect width="400" height="240" fill="#e0e7ff"/>
  <circle cx="320" cy="80" r="40" fill="#6366f1"/>
  <rect x="40" y="160" width="320" height="40" rx="8" fill="#a5b4fc"/>
</svg>
```

`public/projects/project-3.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">
  <rect width="400" height="240" fill="#dcfce7"/>
  <rect x="40" y="40" width="320" height="160" rx="12" fill="#22c55e"/>
  <rect x="80" y="80" width="240" height="16" rx="8" fill="#ffffff" opacity="0.8"/>
  <rect x="80" y="120" width="180" height="16" rx="8" fill="#ffffff" opacity="0.6"/>
</svg>
```

- [ ] **Step 4: 验证构建**

运行：

```bash
npm run build
```

Expected: 构建成功，`dist/projects/` 下有三个 svg 文件。

- [ ] **Step 5: Commit**

```bash
git add src/components/ProjectCard.vue src/components/ProjectGrid.vue public/projects
git commit -m "feat: add project grid and card components"
```

---

### Task 8: 创建 Footer 组件

**Files:**
- Create: `src/components/Footer.vue`

**Interfaces:**
- Consumes: `social: { github, twitter, email }`。
- Produces: 页脚区域，展示社交链接和版权信息。

- [ ] **Step 1: 写入 Footer.vue**

```vue
<script setup>
defineProps({
  social: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <footer id="contact" class="footer section">
    <div class="footer__container container">
      <div class="footer__social">
        <a v-if="social.github" :href="social.github" target="_blank" rel="noopener noreferrer" class="footer__link" aria-label="GitHub">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
        </a>
        <a v-if="social.twitter" :href="social.twitter" target="_blank" rel="noopener noreferrer" class="footer__link" aria-label="Twitter">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </a>
        <a v-if="social.email" :href="social.email" class="footer__link" aria-label="Email">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
        </a>
      </div>
      <p class="footer__copyright">
        © {{ new Date().getFullYear() }} Portfolio Demo. Built with Vue 3 & Vite.
      </p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: var(--color-bg-alt);
  padding: 3rem 0;
  text-align: center;
}

.footer__social {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.footer__link {
  color: var(--color-text-muted);
  transition: color 0.2s ease;
}

.footer__link:hover {
  color: var(--color-primary);
}

.footer__copyright {
  color: var(--color-text-muted);
  font-size: 0.875rem;
}
</style>
```

- [ ] **Step 2: 验证构建**

运行：

```bash
npm run build
```

Expected: 构建成功。

- [ ] **Step 3: Commit**

```bash
git add src/components/Footer.vue
git commit -m "feat: add Footer component with social links"
```

---

### Task 9: 组装 App.vue

**Files:**
- Modify: `src/App.vue`

**Interfaces:**
- Consumes: `profile` 和 `projects` 从 `src/data/profile.js`。
- Produces: 完整页面组合，传递 props 给各子组件。

- [ ] **Step 1: 重写 App.vue**

```vue
<script setup>
import Navbar from './components/Navbar.vue'
import Hero from './components/Hero.vue'
import ProjectGrid from './components/ProjectGrid.vue'
import Footer from './components/Footer.vue'
import { profile, projects } from './data/profile.js'
</script>

<template>
  <Navbar :name="profile.name" />
  <Hero
    :name="profile.name"
    :title="profile.title"
    :bio="profile.bio"
    :avatar="profile.avatar"
  />
  <ProjectGrid :projects="projects" />
  <Footer :social="profile.social" />
</template>

<style scoped>
.app {
  min-height: 100vh;
}
</style>
```

- [ ] **Step 2: 验证开发服务器可渲染**

运行：

```bash
npm run build
```

Expected: 构建成功，`dist/index.html` 可正常打开，页面包含导航、Hero、Projects、Footer。

- [ ] **Step 3: Commit**

```bash
git add src/App.vue
git commit -m "feat: compose App.vue with all sections"
```

---

### Task 10: 响应式与视觉验收

**Files:**
- Modify: `src/assets/styles.css`（如需要微调）
- Modify: 各组件 `.vue` 文件（如需要微调）

**Interfaces:**
- Consumes: 完整页面组合。
- Produces: 在常见视口下无布局问题、视觉一致。

- [ ] **Step 1: 使用 Vite preview 启动预览**

运行：

```bash
npm run build
npm run preview
```

Expected: 终端显示本地预览地址，无构建错误。

- [ ] **Step 2: 手动检查响应式**

通过浏览器 DevTools 检查以下断点：

- 375px：导航显示汉堡菜单，Hero 单栏，项目卡片单列。
- 768px：导航显示横向链接，Hero 单栏，项目卡片双列。
- 1024px：Hero 双栏，项目卡片三列。

Expected: 各断点下布局正常，无元素溢出或重叠。

- [ ] **Step 3: 修复发现的问题**

记录并修复任何视觉或响应式问题，确保构建通过。

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "style: polish responsive layout and visual details"
```

---

### Task 11: 更新 README 与部署说明

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: 最终项目结构和部署配置。
- Produces: 清晰的 README，包含本地开发、构建和 EdgeOne Pages 部署说明。

- [ ] **Step 1: 重写 README.md**

```markdown
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
```

- [ ] **Step 2: 验证 README 格式**

运行：

```bash
npm run build
```

Expected: 构建成功（README 不影响构建，但确保此时仓库状态干净）。

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: update README with setup and deployment instructions"
```

---

### Task 12: 最终构建与部署前验证

**Files:**
- Verify: `dist/` 目录
- Verify: `package.json`
- Verify: `vite.config.js`

**Interfaces:**
- Consumes: 完整项目。
- Produces: 可直接部署到 EdgeOne Pages 的构建产物。

- [ ] **Step 1: 运行生产构建**

运行：

```bash
npm run build
```

Expected: 构建成功，`dist/` 目录包含 `index.html`、`assets/`、`avatar.svg`、`projects/`。

- [ ] **Step 2: 预览生产构建**

运行：

```bash
npm run preview
```

Expected: 终端显示预览地址，页面可正常访问。

- [ ] **Step 3: 检查产物清单**

运行：

```bash
ls -R dist
```

Expected: `dist/index.html`、`dist/assets/`（JS/CSS）、`dist/avatar.svg`、`dist/projects/project-1.svg` 等存在。

- [ ] **Step 4: 最终提交（如有改动）**

如果上一步没有产生未提交改动，则无需提交。否则：

```bash
git add -A
git commit -m "chore: final build artifacts check"
```

---

## Self-Review

### 1. Spec Coverage

| 设计文档章节 | 实现任务 |
|-------------|---------|
| 清空旧项目 | Task 1 |
| Vite + Vue 3 骨架 | Task 2 |
| 全局样式与 CSS 变量 | Task 3 |
| 静态数据模块 | Task 4 |
| Navbar 组件 | Task 5 |
| Hero 组件 | Task 6 |
| ProjectCard / ProjectGrid | Task 7 |
| Footer 组件 | Task 8 |
| App.vue 组装 | Task 9 |
| 响应式与动效 | Task 3, Task 10 |
| README 与部署说明 | Task 11 |
| EdgeOne Pages 构建输出 | Task 2, Task 12 |

无遗漏。

### 2. Placeholder Scan

- 无 TBD / TODO。
- 所有步骤包含完整代码或命令。
- 无模糊描述。

### 3. Type Consistency

- `profile.name`、`profile.title`、`profile.bio`、`profile.avatar`、`profile.social` 在各组件中保持一致。
- `projects` 数组结构在 `profile.js`、`ProjectGrid.vue`、`ProjectCard.vue` 中一致。
- 构建输出目录统一为 `dist`。

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-06-21-vue-portfolio-demo-plan.md`.**

Two execution options:

1. **Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach would you like?
