import { fileURLToPath, URL } from 'node:url'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import crypto from 'crypto'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

const __dirname = dirname(fileURLToPath(import.meta.url))

// SEO：构建时将 __SITE_URL__ 替换为环境变量中的域名
function siteUrlPlugin() {
  let siteUrl = 'https://mao-nav.pages.dev'
  let outDir = 'dist'

  return {
    name: 'site-url-replace',
    configResolved(config) {
      if (process.env.VITE_SITE_URL) {
        siteUrl = process.env.VITE_SITE_URL
      }
      outDir = config.build.outDir
    },
    transformIndexHtml(html) {
      return html.replace(/__SITE_URL__/g, siteUrl)
    },
    closeBundle() {
      for (const file of ['robots.txt', 'sitemap.xml']) {
        const filePath = resolve(__dirname, outDir, file)
        if (existsSync(filePath)) {
          let content = readFileSync(filePath, 'utf-8')
          content = content.replace(/__SITE_URL__/g, siteUrl)
          writeFileSync(filePath, content)
        }
      }
    },
  }
}

// https://vite.dev/config/
// 本地开发 API 中间件（读取 .dev.vars 模拟服务端函数）
function localApiPlugin() {
  const loadEnv = () => {
    const vars = {}
    const varsPath = resolve(__dirname, '.dev.vars')
    if (existsSync(varsPath)) {
      readFileSync(varsPath, 'utf-8').split('\n').forEach(line => {
        const idx = line.indexOf('=')
        if (idx > 0) vars[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
      })
    }
    return vars
  }

  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use('/api/verify', (req, res) => {
        if (req.method === 'OPTIONS') {
          res.writeHead(200, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type' })
          return res.end()
        }
        if (req.method !== 'POST') {
          res.writeHead(405)
          return res.end(JSON.stringify({ success: false, error: 'Method not allowed' }))
        }
        let body = ''
        req.on('data', c => body += c)
        req.on('end', () => {
          const { password } = JSON.parse(body || '{}')
          const adminPassword = loadEnv().ADMIN_PASSWORD
          res.setHeader('Content-Type', 'application/json')
          if (!adminPassword) {
            return res.end(JSON.stringify({ success: false, error: '服务端未配置管理员密钥' }))
          }
          if (!password || password !== adminPassword) {
            return res.end(JSON.stringify({ success: false, error: '密钥错误，请重新输入' }))
          }
          const token = crypto.createHash('sha256').update(adminPassword + ':mao-nav-auth').digest('hex')
          res.end(JSON.stringify({ success: true, token }))
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    siteUrlPlugin(),
    localApiPlugin(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    historyApiFallback: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router'],
          'admin': ['./src/views/AdminView.vue']
        }
      }
    }
  }
})
