import { fileURLToPath, URL } from 'node:url'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'

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
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    siteUrlPlugin(),
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
