import { verifyAuth } from '../server/auth.js'
import {
  createMarket,
  listMarkets,
  getMarket,
  takePosition,
  resolveMarket,
} from '../server/markets/marketService.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' })
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

      return res.status(200).json({ ok: true, position })
    }

    if (action === 'resolve') {
      const { marketId, winningOptionId, evidenceUrl, sourceDescription } = req.body || {}

      const result = await resolveMarket({
        marketId,
        winningOptionId,
        evidenceUrl,
        sourceDescription,
        resolvedByUserId: user.id,
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
