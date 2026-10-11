import { supabaseAdmin } from '../../config/supabaseAdmin.js'
import { relayer } from '../../blockchain/relayer/relayer.js'

/**
 * Health check endpoint supporting LIVENESS and READINESS verification.
 * - Liveness: /api/health or /api/health?type=live
 * - Readiness: /api/health?type=ready (verifies DB connection, RPC, environment)
 */
export default async function healthRoute(req, res) {
  // Safe extraction of query parameters
  const host = req.headers?.host || 'localhost'
  const parsedUrl = new URL(req.url, `http://${host}`)
  const checkType = parsedUrl.searchParams.get('type') || 'live'

  if (checkType === 'live') {
    return res.status(200).json({
      status: 'alive',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    })
  }

  if (checkType === 'ready') {
    const checks = {
      database: 'checking',
      blockchainRpc: 'checking',
      environment: 'configured',
    }

    let isReady = true

    // 1. Verify Database Connectivity
    try {
      const { error } = await supabaseAdmin
        .from('profiles')
        .select('count', { count: 'exact', head: true })

      if (error && error.code !== 'PGRST116') {
        checks.database = `degraded: ${error.message}`
        isReady = false
      } else {
        checks.database = 'connected'
      }
    } catch (err) {
      checks.database = `unreachable: ${err instanceof Error ? err.message : String(err)}`
      isReady = false
    }

    // 2. Verify Blockchain RPC Connectivity
    try {
      const client = relayer.getPublicClient()
      const blockNumber = await client.getBlockNumber()
      checks.blockchainRpc = `connected (block: ${blockNumber.toString()})`
    } catch (err) {
      checks.blockchainRpc = `unreachable: ${err instanceof Error ? err.message : String(err)}`
      // Non-blocking warning if remote testnet RPC is temporarily rate-limiting
      checks.blockchainRpcWarning = true
    }

    // 3. Verify Environment Configuration (without secret leakage)
    const requiredEnv = ['SUPABASE_URL']
    const missing = requiredEnv.filter(
      (k) => !process.env[k] && !process.env[`VITE_${k}`]
    )
    if (missing.length > 0) {
      checks.environment = `missing: ${missing.join(', ')}`
      isReady = false
    }

    const statusCode = isReady ? 200 : 503
    return res.status(statusCode).json({
      status: isReady ? 'ready' : 'not_ready',
      checks,
      timestamp: new Date().toISOString(),
    })
  }

  return res.status(400).json({
    error: 'Invalid check type. Supported values: live, ready',
  })
}
