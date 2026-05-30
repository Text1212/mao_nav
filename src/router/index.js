import { createRouter, createWebHistory } from 'vue-router'
import NavHomeView from '../views/NavHomeView.vue'
import TestView from '../views/TestView.vue'

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://mao-nav.pages.dev'
const DEFAULT_TITLE = '风向标 - 找到好站的方向'
const DEFAULT_DESCRIPTION = '风向标是一个简洁美观的导航网站，收录优质视频、二次元、AI工具、开发资源等网站，支持分类管理和自定义收藏夹。'

// SEO meta 配置
const routeMeta = {
  home: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  admin: {
    title: '管理后台 - 风向标导航',
    description: '风向标导航后台管理系统，管理导航分类和站点资源。',
  },
  test: {
    title: '环境变量测试 - 风向标导航',
    description: '风向标导航环境变量配置测试页面。',
  },
}

function updateMeta(routeName) {
  const meta = routeMeta[routeName] || routeMeta.home

  document.title = meta.title

  const setMetaTag = (name, content, isProperty = false) => {
    const attr = isProperty ? 'property' : 'name'
    let el = document.querySelector(`meta[${attr}="${name}"]`)
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute(attr, name)
      document.head.appendChild(el)
    }
    el.setAttribute('content', content)
  }

  setMetaTag('description', meta.description)
  setMetaTag('title', meta.title)
  setMetaTag('og:title', meta.title, true)
  setMetaTag('og:description', meta.description, true)
  setMetaTag('og:url', `${SITE_URL}${window.location.pathname}`, true)
  setMetaTag('twitter:title', meta.title)
  setMetaTag('twitter:description', meta.description)
  setMetaTag('twitter:url', `${SITE_URL}${window.location.pathname}`)
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: NavHomeView,
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/test',
      name: 'test',
      component: TestView,
    },
  ],
})

router.beforeEach((to, from, next) => {
  updateMeta(to.name)
  next()
})

export default router
