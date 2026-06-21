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
