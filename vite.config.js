import { fileURLToPath, URL, pathToFileURL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Populate process.env with local environment variables for dev serverless handlers
const loadedEnv = loadEnv('development', process.cwd(), '')
Object.assign(process.env, loadedEnv)

function apiDevPlugin() {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const urlPath = req.url?.split('?')[0] || ''
        if (!urlPath.startsWith('/api/')) return next()

        const endpoint = urlPath.replace('/api/', '')
        let absPath = path.resolve(__dirname, 'backend', 'api', `${endpoint}.js`)
        if (!fs.existsSync(absPath)) {
          absPath = path.resolve(__dirname, 'api', `${endpoint}.js`)
        }
        if (!fs.existsSync(absPath)) return next()

        try {
          const { default: handler } = await import(pathToFileURL(absPath).href)
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', async () => {
            try {
              req.body = body ? JSON.parse(body) : {}
            } catch {
              req.body = {}
            }

            res.status = (code) => {
              res.statusCode = code
              return res
            }
            res.json = (data) => {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(data))
              return res
            }

            try {
              await handler(req, res)
            } catch (err) {
              console.error('[API handler error]', err)
              if (!res.writableEnded) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }))
              }
            }
          })
        } catch (err) {
          console.error('[API Dev Server]', err)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: err.message || 'Handler load error' }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  root: path.resolve(__dirname, 'frontend'),
  publicDir: path.resolve(__dirname, 'frontend', 'public'),
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  plugins: [tailwindcss(), react(), apiDevPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./frontend/src', import.meta.url)),
      '@shared': fileURLToPath(new URL('./shared', import.meta.url)),
    },
  },
  test: {
    root: __dirname,
    include: ['tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
})
