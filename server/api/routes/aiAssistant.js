import { aiAssistantService } from '../../services/ai/aiProviderService.js'
import { rateLimiter } from '../../security/rateLimit.js'
import { logAuditEvent } from '../../observability/auditLogger.js'

/**
 * Handles POST /api/ai/query
 */
export default async function aiAssistantRoute(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' })
  }

  // Rate Limiting (30 requests per minute per IP)
  const ip =
    req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    '127.0.0.1'

  const limitResult = rateLimiter.check(`ai:${ip}`, 30, 60000)
  if (!limitResult.allowed) {
    return res.status(429).json({
      error: 'AI query rate limit exceeded. Please wait a moment before trying again.',
      retryAfterSeconds: Math.ceil(limitResult.resetMs / 1000),
    })
  }

  try {
    const { query } = req.body || {}

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ error: 'Field "query" is required and must be a string.' })
    }

    if (query.length > 500) {
      return res.status(400).json({ error: 'Query exceeds maximum allowed length of 500 characters.' })
    }

    const response = await aiAssistantService.answerCulturalQuery(query)

    await logAuditEvent({
      who: ip,
      what: 'AI_CULTURAL_QUERY',
      target: query.slice(0, 50),
      result: 'SUCCESS',
      ipAddress: ip,
      metadata: { grounded: response.grounded, provider: response.provider },
    })

    return res.status(200).json({
      success: true,
      data: response,
    })
  } catch (err) {
    console.error('[aiAssistantRoute] Internal error processing inquiry:', err)
    return res.status(500).json({
      error: 'An internal error occurred while processing the cultural inquiry.',
    })
  }
}
