import { verifyAuth } from '../server/auth.js'
import {
  issueTicket,
  verifyTicketAccess,
  revokeTicket,
  consumeTicket,
} from '../server/tickets/ticketService.js'
import { supabaseAdmin } from '../server/supabaseAdmin.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' })
  }

  const { action } = req.body || {}

  try {
    // Public/Wallet-based verification endpoint (can be verified with or without user login)
    if (action === 'verify') {
      const { eventId, walletAddress, signature, challenge } = req.body || {}
      if (!eventId || !walletAddress) {
        return res.status(400).json({ error: 'eventId and walletAddress are required' })
      }

      const result = await verifyTicketAccess({
        eventId,
        walletAddress,
        signature,
        challenge,
      })

      return res.status(200).json(result)
    }

    // Authenticated endpoints
    const { user, error: authError } = await verifyAuth(req.headers.authorization)
    if (authError || !user) {
      return res.status(401).json({ error: authError || 'Unauthorized. Valid Bearer token required.' })
    }

    if (action === 'issue' || action === 'claim') {
      const { eventId, eventTitle, walletAddress, ticketType, metadata, expiresAt } = req.body || {}
      if (!eventId || !eventTitle) {
        return res.status(400).json({ error: 'eventId and eventTitle are required' })
      }

      // If walletAddress is not supplied, look up the user's linked wallet
      let targetWallet = walletAddress
      if (!targetWallet) {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('wallet_address')
          .eq('id', user.id)
          .single()
        targetWallet = profile?.wallet_address
      }

      if (!targetWallet) {
        return res.status(400).json({
          error: 'No wallet address provided and user has no linked wallet. Connect wallet first.',
        })
      }

      const ticket = await issueTicket({
        eventId,
        eventTitle,
        ownerWalletAddress: targetWallet,
        ownerUserId: user.id,
        ticketType: ticketType || 'general',
        metadata: metadata || {},
        expiresAt: expiresAt || null,
      })

      return res.status(200).json({ ok: true, ticket })
    }

    if (action === 'list') {
      const { data: tickets, error } = await supabaseAdmin
        .from('tickets')
        .select('*')
        .eq('owner_user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch tickets: ' + error.message })
      }

      return res.status(200).json({ ok: true, tickets })
    }

    if (action === 'consume') {
      const { ticketId } = req.body || {}
      if (!ticketId) {
        return res.status(400).json({ error: 'ticketId is required' })
      }

      const consumed = await consumeTicket(ticketId)
      return res.status(200).json({ ok: true, ticket: consumed })
    }

    if (action === 'revoke') {
      const { ticketId } = req.body || {}
      if (!ticketId) {
        return res.status(400).json({ error: 'ticketId is required' })
      }

      const revoked = await revokeTicket(ticketId)
      return res.status(200).json({ ok: true, ticket: revoked })
    }

    return res.status(400).json({
      error: `Unsupported action '${action}'. Valid actions: 'verify', 'claim', 'issue', 'list', 'consume', 'revoke'`,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    console.error('[api/tickets] Error:', err)
    return res.status(500).json({ error: msg })
  }
}
