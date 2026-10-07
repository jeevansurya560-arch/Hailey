import { verifyAuth } from '../server/auth.js'
import {
  createPaymentIntent,
  confirmCryptoPayment,
  getCuratorEarnings,
  getPayerHistory,
} from '../server/payments/paymentService.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' })
  }

  try {
    const { user, error: authError } = await verifyAuth(req.headers.authorization)
    if (authError || !user) {
      return res.status(401).json({ error: authError || 'Unauthorized. Valid Bearer token required.' })
    }

    const { action } = req.body || {}

    // 1. Create Payment Intent
    if (action === 'intent') {
      const { curatorUserId, collectionId, postId, amount, currency, paymentMethod } = req.body || {}

      const payment = await createPaymentIntent({
        payerUserId: user.id,
        curatorUserId,
        collectionId,
        postId,
        amount,
        currency,
        paymentMethod,
      })

      return res.status(200).json({ ok: true, payment })
    }

    // 2. Confirm Crypto / Onchain Payment
    if (action === 'confirm') {
      const { paymentId, txHash } = req.body || {}

      const result = await confirmCryptoPayment({
        paymentId,
        txHash,
        payerUserId: user.id,
      })

      return res.status(200).json(result)
    }

    // 3. Curator Earnings Breakdown
    if (action === 'earnings') {
      const earnings = await getCuratorEarnings(user.id)
      return res.status(200).json({ ok: true, earnings })
    }

    // 4. Payer Support History
    if (action === 'history') {
      const history = await getPayerHistory(user.id)
      return res.status(200).json({ ok: true, history })
    }

    return res.status(400).json({
      error: `Unsupported action '${action}'. Valid actions: 'intent', 'confirm', 'earnings', 'history'`,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    console.error('[api/payments] Error:', err)
    return res.status(500).json({ error: msg })
  }
}
