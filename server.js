import './loadEnv.js'
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { processAttestationJobs } from './backend/server/jobs/attestation/attestationWorker.js'

// Route handlers (canonical adapters)
import healthRoute from './backend/api/health.js'
import walletRoute from './backend/api/wallet.js'
import aiAssistantRoute from './backend/api/ai.js'
import searchRoute from './backend/api/search.js'
import culturesRoute from './backend/api/cultures.js'
import marketsRoute from './backend/api/markets.js'
import ticketsRoute from './backend/api/tickets.js'
import paymentsRoute from './backend/api/payments.js'
import moderationRoute from './backend/api/moderation.js'
import approveItemRoute from './backend/api/approve-item.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load local environment variables if available
function loadEnvFile(envPath) {
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim()
        let val = trimmed.slice(eqIdx + 1).trim()
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1)
        }
        if (!process.env[key]) {
          process.env[key] = val
        }
      }
    }
  }
}

loadEnvFile(path.resolve(__dirname, '.env.local'))
loadEnvFile(path.resolve(__dirname, '.env'))

const PORT = process.env.PORT || 3000

// Route Map
const routes = {
  '/health': healthRoute,
  '/api/health': healthRoute,
  '/api/wallet': walletRoute,
  '/api/ai': aiAssistantRoute,
  '/api/search': searchRoute,
  '/api/cultures': culturesRoute,
  '/api/markets': marketsRoute,
  '/api/tickets': ticketsRoute,
  '/api/payments': paymentsRoute,
  '/api/moderation': moderationRoute,
  '/api/approve-item': approveItemRoute,
}

// Global CORS headers
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  res.setHeader('Access-Control-Max-Age', '86400')
}

const server = http.createServer((req, res) => {
  setCorsHeaders(res)

  // Preflight check
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    return res.end()
  }

  const urlPath = req.url.split('?')[0]
  const handler = routes[urlPath]

  if (!handler) {
    res.statusCode = 404
    res.setHeader('Content-Type', 'application/json')
    return res.end(JSON.stringify({ error: `Not found: ${urlPath}` }))
  }

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

    // Express-compatible helpers
    res.status = (code) => {
      res.statusCode = code
      return res
    }

    res.json = (data) => {
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'application/json')
      }
      res.end(JSON.stringify(data))
      return res
    }

    try {
      await handler(req, res)
    } catch (err) {
      console.error(`[Server Error ${urlPath}]`, err)
      if (!res.writableEnded) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }))
      }
    }
  })
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Hailey Backend API Server listening on port ${PORT}`)
  console.log(`📡 Healthcheck available at /health and /api/health`)
  
  // Background Attestation Worker loop (every 30 seconds)
  console.log(`⚙️  Initializing Background Attestation Worker...`)
  setInterval(async () => {
    try {
      const result = await processAttestationJobs(10)
      if (result && result.processed > 0) {
        console.log(`[AttestationWorker] Batch completed:`, result)
      }
    } catch (err) {
      console.warn(`[AttestationWorker] Execution warning:`, err.message)
    }
  }, 30000)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, closing server...')
  server.close(() => process.exit(0))
})
process.on('SIGINT', () => {
  console.log('Received SIGINT, closing server...')
  server.close(() => process.exit(0))
})
