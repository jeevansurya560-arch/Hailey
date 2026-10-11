import crypto from 'node:crypto'
import { recoverMessageAddress } from 'viem'
import { verifyAuth } from '../../security/authorization/auth.js'
import { supabaseAdmin } from '../../config/supabaseAdmin.js'
import { rateLimiter, resolveTrustedIp } from '../../security/rateLimit.js'
import { logAuditEvent } from '../../observability/auditLogger.js'

export default async function walletRoute(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' })
  }

  const ip = resolveTrustedIp(req)

  // Apply rate limiter: 20 challenge/link attempts per minute
  const limit = await rateLimiter.check(`wallet:${ip}`, 20, 60000)

  if (limit.isServiceUnavailable) {
    res.setHeader('Retry-After', '30')
    return res.status(503).json({
      error: 'Rate limit service unavailable. Please retry shortly.',
      retryAfterSeconds: 30,
    })
  }

  if (!limit.allowed) {
    const retrySec = Math.ceil(limit.resetMs / 1000)
    res.setHeader('Retry-After', retrySec.toString())
    return res.status(429).json({
      error: 'Too many wallet challenge requests. Please wait a moment before trying again.',
      retryAfterSeconds: retrySec,
    })
  }

  try {
    // 1. Authenticate caller via Supabase JWT
    const { user, error: authError } = await verifyAuth(req.headers.authorization)
    if (authError || !user) {
      return res.status(401).json({ error: authError || 'Unauthorized. Valid Bearer token required.' })
    }

    const { action } = req.body || {}

    // 2. Action: 'nonce' -> Generate single-use nonce
    if (action === 'nonce') {
      const nonce = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes

      const { error: nonceErr } = await supabaseAdmin
        .from('wallet_nonces')
        .upsert(
          {
            user_id: user.id,
            nonce,
            expires_at: expiresAt,
          },
          { onConflict: 'user_id' }
        )

      if (nonceErr) {
        return res.status(500).json({ error: 'Failed to generate wallet challenge nonce: ' + nonceErr.message })
      }

      const message = `Sign this message to link your wallet to Hailey:\n\nNonce: ${nonce}\nUser: ${user.id}\nTimestamp: ${expiresAt}`

      await logAuditEvent({
        who: user.id,
        what: 'WALLET_NONCE_GENERATED',
        target: user.id,
        result: 'SUCCESS',
        ipAddress: ip,
      })

      return res.status(200).json({
        ok: true,
        nonce,
        message,
        expiresAt,
      })
    }

    // 3. Action: 'link' -> Verify cryptographic signature and link address
    if (action === 'link') {
      const { signature, address } = req.body || {}
      if (!signature || !address || typeof signature !== 'string' || typeof address !== 'string') {
        return res.status(400).json({ error: 'signature and address are required' })
      }

      // Fetch stored nonce for this user
      const { data: nonceRow, error: fetchErr } = await supabaseAdmin
        .from('wallet_nonces')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (fetchErr || !nonceRow) {
        return res.status(400).json({ error: 'No active challenge found. Request a nonce first.' })
      }

      // Check nonce expiration
      if (new Date(nonceRow.expires_at).getTime() < Date.now()) {
        await supabaseAdmin.from('wallet_nonces').delete().eq('user_id', user.id)
        return res.status(400).json({ error: 'Challenge expired. Please request a new nonce.' })
      }

      // Reconstruct expected message
      const expectedMessage = `Sign this message to link your wallet to Hailey:\n\nNonce: ${nonceRow.nonce}\nUser: ${user.id}\nTimestamp: ${nonceRow.expires_at}`

      // Recover signer address using viem
      let recoveredAddress
      try {
        recoveredAddress = await recoverMessageAddress({
          message: expectedMessage,
          signature,
        })
      } catch (recErr) {
        return res.status(400).json({ error: 'Invalid cryptographic signature format: ' + recErr.message })
      }

      // Verify that recovered address matches the claimed address
      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        return res.status(401).json({
          error: 'Signature verification failed: signer address does not match claimed address.',
        })
      }

      // Invalidate the nonce immediately (single-use)
      await supabaseAdmin.from('wallet_nonces').delete().eq('user_id', user.id)

      // Update user's profile with verified wallet address
      const normalizedAddress = recoveredAddress.toLowerCase()
      const { error: updateErr } = await supabaseAdmin
        .from('profiles')
        .update({
          wallet_address: normalizedAddress,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateErr) {
        return res.status(500).json({ error: 'Failed to save linked wallet address: ' + updateErr.message })
      }

      // 4. Retroactive Attestation Trigger (Day 7)
      // Check for any approved contributions by this user still waiting for a wallet
      try {
        const { data: pendingContribs } = await supabaseAdmin
          .from('contributions')
          .select('id, item_id')
          .eq('user_id', user.id)
          .eq('status', 'awaiting_wallet')

        if (pendingContribs && pendingContribs.length > 0) {
          console.log(`[api/wallet] Found ${pendingContribs.length} contributions awaiting wallet for user ${user.id}. Queuing attestations.`)

          // Mark contributions as submitted
          const contribIds = pendingContribs.map((c) => c.id)
          await supabaseAdmin
            .from('contributions')
            .update({ status: 'submitted' })
            .in('id', contribIds)

          // Queue attestation jobs
          const jobInserts = pendingContribs.map((c) => ({
            contribution_id: c.id,
            status: 'queued',
          }))

          await supabaseAdmin
            .from('attestation_jobs')
            .upsert(jobInserts, { onConflict: 'contribution_id' })
        }
      } catch (retroErr) {
        console.warn('[api/wallet] Error queuing retroactive attestations:', retroErr)
      }

      await logAuditEvent({
        who: user.id,
        what: 'WALLET_LINKED',
        target: normalizedAddress,
        result: 'SUCCESS',
        ipAddress: ip,
      })

      return res.status(200).json({
        ok: true,
        address: normalizedAddress,
      })
    }

    return res.status(400).json({ error: `Unsupported action '${action}'. Valid actions: 'nonce', 'link'` })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    console.error('[api/wallet] Unhandled error:', err)
    return res.status(500).json({ error: message })
  }
}
