import { isAddress, recoverMessageAddress } from 'viem'
import { supabaseAdmin } from '../supabaseAdmin.js'

/**
 * Normalizes an EVM address to lowercase hex string.
 * @param {string} addr
 * @returns {string}
 */
export function normalizeAddress(addr) {
  if (!addr || typeof addr !== 'string') {
    throw new Error('Invalid Ethereum address format.')
  }
  const lower = addr.trim().toLowerCase()
  if (!isAddress(lower)) {
    throw new Error('Invalid Ethereum address format.')
  }
  return lower
}

/**
 * Issues or claims a wallet-native access ticket.
 */
export async function issueTicket({
  eventId,
  eventTitle,
  ownerWalletAddress,
  ownerUserId = null,
  ticketType = 'general',
  metadata = {},
  expiresAt = null,
}) {
  const normalizedWallet = normalizeAddress(ownerWalletAddress)

  if (!eventId || !eventTitle) {
    throw new Error('eventId and eventTitle are required.')
  }

  const { data: ticket, error } = await supabaseAdmin
    .from('tickets')
    .insert({
      event_id: eventId,
      event_title: eventTitle,
      owner_wallet_address: normalizedWallet,
      owner_user_id: ownerUserId,
      ticket_type: ticketType,
      status: 'issued',
      metadata,
      expires_at: expiresAt,
    })
    .select('*')
    .single()

  if (error) {
    throw new Error('Failed to issue ticket: ' + error.message)
  }

  return ticket
}

/**
 * Verifies wallet-native access entitlement for an event.
 * If signature and challenge are provided, cryptographically proves wallet possession.
 */
export async function verifyTicketAccess({
  eventId,
  walletAddress,
  signature = null,
  challenge = null,
}) {
  const normalizedWallet = normalizeAddress(walletAddress)

  // 1. If cryptographic challenge signature is provided, verify ownership of private key
  if (signature && challenge) {
    const recovered = await recoverMessageAddress({
      message: challenge,
      signature,
    })
    if (recovered.toLowerCase() !== normalizedWallet) {
      return {
        granted: false,
        reason: 'Signature address mismatch. Cryptographic wallet proof failed.',
      }
    }
  }

  // 2. Query tickets for this wallet and event
  const { data: tickets, error } = await supabaseAdmin
    .from('tickets')
    .select('*')
    .eq('event_id', eventId)
    .eq('owner_wallet_address', normalizedWallet)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Failed to query tickets: ' + error.message)
  }

  if (!tickets || tickets.length === 0) {
    return {
      granted: false,
      reason: 'No ticket found for this wallet address.',
    }
  }

  // Find active, unexpired ticket
  const now = new Date().getTime()
  const validTicket = tickets.find((t) => {
    if (t.status === 'revoked') return false
    if (t.expires_at && new Date(t.expires_at).getTime() < now) return false
    return t.status === 'issued' || t.status === 'claimed'
  })

  if (!validTicket) {
    const revoked = tickets.find((t) => t.status === 'revoked')
    if (revoked) {
      return { granted: false, reason: 'Ticket has been revoked.' }
    }
    return { granted: false, reason: 'Ticket is expired or already used.' }
  }

  return {
    granted: true,
    ticket: validTicket,
  }
}

/**
 * Revokes a ticket by ID.
 */
export async function revokeTicket(ticketId) {
  const { data: updated, error } = await supabaseAdmin
    .from('tickets')
    .update({ status: 'revoked', updated_at: new Date().toISOString() })
    .eq('id', ticketId)
    .select('*')
    .single()

  if (error) {
    throw new Error('Failed to revoke ticket: ' + error.message)
  }

  return updated
}

/**
 * Consumes/uses a ticket for event entry.
 */
export async function consumeTicket(ticketId) {
  const { data: updated, error } = await supabaseAdmin
    .from('tickets')
    .update({ status: 'used', updated_at: new Date().toISOString() })
    .eq('id', ticketId)
    .in('status', ['issued', 'claimed'])
    .select('*')
    .single()

  if (error || !updated) {
    throw new Error('Ticket could not be consumed (already used, expired, or invalid).')
  }

  return updated
}
