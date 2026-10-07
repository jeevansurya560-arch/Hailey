import crypto from 'node:crypto'
import { recoverMessageAddress } from 'viem'
import { verifyAuth } from '../server/auth.js'
import { supabaseAdmin } from '../server/supabaseAdmin.js'

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' })
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
        .select('nonce, expires_at')
        .eq('user_id', user.id)
        .single()

      if (fetchErr || !nonceRow) {
        return res.status(400).json({ error: 'No active challenge nonce found. Request a new nonce first.' })
      }

      if (new Date(nonceRow.expires_at).getTime() < Date.now()) {
        return res.status(400).json({ error: 'Nonce has expired. Please request a new nonce.' })
      }

      const expectedMessage = `Sign this message to link your wallet to Hailey:\n\nNonce: ${nonceRow.nonce}\nUser: ${user.id}\nTimestamp: ${nonceRow.expires_at}`

      // Cryptographically recover signing public address
      const recoveredAddress = await recoverMessageAddress({
        message: expectedMessage,
        signature,
      })

      const normalizedAddress = address.toLowerCase()
      if (recoveredAddress.toLowerCase() !== normalizedAddress) {
        return res.status(400).json({
          error: 'Signature verification failed. Recovered address does not match provided address.',
          recovered: recoveredAddress,
        })
      }

      // Check if address is already linked to another profile (409 Conflict)
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id, handle')
        .eq('wallet_address', normalizedAddress)
        .neq('id', user.id)
        .maybeSingle()

      if (existingProfile) {
        return res.status(409).json({
          error: `Wallet address is already linked to another profile (@${existingProfile.handle}).`,
        })
      }

      // Update profiles with lowercase wallet address
      const { error: updateErr } = await supabaseAdmin
        .from('profiles')
        .update({ wallet_address: normalizedAddress })
        .eq('id', user.id)

      if (updateErr) {
        return res.status(500).json({ error: 'Failed to update profile wallet address: ' + updateErr.message })
      }

      // Delete used nonce (single-use)
      await supabaseAdmin.from('wallet_nonces').delete().eq('user_id', user.id)

      // Promote any existing contributions waiting for wallet to 'submitted'
      await supabaseAdmin
        .from('contributions')
        .update({ status: 'submitted' })
        .eq('user_id', user.id)
        .eq('status', 'awaiting_wallet')

      return res.status(200).json({
        ok: true,
        linkedAddress: normalizedAddress,
      })
    }

    return res.status(400).json({ error: "Invalid action. Supported actions are 'nonce' and 'link'." })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    console.error('[api/wallet] Unhandled error:', err)
    return res.status(500).json({ error: message })
  }
}
