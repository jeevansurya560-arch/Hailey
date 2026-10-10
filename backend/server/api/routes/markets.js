import { verifyAuth } from '../../security/authorization/auth.js'
import {
  createMarket,
  listMarkets,
  getMarket,
  takePosition,
  resolveMarket,
} from '../../services/markets/marketService.js'
import { rateLimiter } from '../../security/rateLimit.js'
import { logAuditEvent } from '../../observability/auditLogger.js'

export default async function marketsRoute(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' })
  }

  const ip =
    req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    '127.0.0.1'

  const limit = rateLimiter.check(`markets:${ip}`, 40, 60000)
  if (!limit.allowed) {
    return res.status(429).json({
      error: 'Market operation rate limit exceeded. Please wait a moment.',
      retryAfterSeconds: Math.ceil(limit.resetMs / 1000),
    })
  }

  const { action } = req.body || {}

  try {
    // Public queries: list & get
    if (action === 'list') {
      const { status, category } = req.body || {}
      const markets = await listMarkets({ status, category })
      return res.status(200).json({ ok: true, markets })
    }

    if (action === 'get') {
      const { marketId } = req.body || {}
      if (!marketId) {
        return res.status(400).json({ error: 'marketId is required' })
      }
      const market = await getMarket(marketId)
      return res.status(200).json({ ok: true, market })
    }

    // Authenticated operations
    const { user, error: authError } = await verifyAuth(req.headers.authorization)
    if (authError || !user) {
      return res.status(401).json({ error: authError || 'Unauthorized. Valid Bearer token required.' })
    }

    if (action === 'create') {
      const { title, description, category, resolutionSource, resolutionDeadline, options } =
        req.body || {}

      const created = await createMarket({
        creatorId: user.id,
        title,
        description,
        category,
        resolutionSource,
        resolutionDeadline,
        options,
      })

      await logAuditEvent({
        who: user.id,
        what: 'MARKET_CREATED',
        target: created.id,
        result: 'SUCCESS',
        ipAddress: ip,
      })

      return res.status(200).json({ ok: true, market: created })
    }

    if (action === 'position') {
      const { marketId, optionId, amount } = req.body || {}
      if (!marketId || !optionId || !amount) {
        return res.status(400).json({ error: 'marketId, optionId, and amount are required' })
      }

      const position = await takePosition({
        marketId,
        optionId,
        userId: user.id,
        amount,
      })

      await logAuditEvent({
        who: user.id,
        what: 'MARKET_POSITION_TAKEN',
        target: position.id,
        result: 'SUCCESS',
        ipAddress: ip,
        metadata: { marketId, optionId, amount },
      })

      return res.status(200).json({ ok: true, position })
    }

    if (action === 'resolve') {
      const { marketId, winningOptionId, evidenceUrl, sourceDescription } = req.body || {}
      if (!marketId) {
        return res.status(400).json({ error: 'marketId is required.' })
      }

      // Authorization check: Caller must be market creator or editorial admin
      const market = await getMarket(marketId)
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('is_editorial')
        .eq('id', user.id)
        .single()

      const isCreator = market.creator_id === user.id
      const isEditorial = Boolean(profile?.is_editorial)

      if (!isCreator && !isEditorial) {
        return res.status(403).json({
          error: 'Forbidden. Only the market creator or an editorial administrator can resolve this market.',
        })
      }

      const result = await resolveMarket({
        marketId,
        winningOptionId,
        evidenceUrl,
        sourceDescription,
        resolvedByUserId: user.id,
      })

      await logAuditEvent({
        who: user.id,
        what: 'MARKET_RESOLVED',
        target: marketId,
        result: 'SUCCESS',
        ipAddress: ip,
        metadata: { winningOptionId },
      })

      return res.status(200).json(result)
    }

    return res.status(400).json({
      error: `Unsupported action '${action}'. Valid actions: 'list', 'get', 'create', 'position', 'resolve'`,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    console.error('[api/markets] Error:', err)
    return res.status(500).json({ error: msg })
  }
}
