/**
 * Service for wallet-native ticketing and access verification.
 * Client-safe: uses fetch to invoke /api/tickets.
 */

export async function claimTicket({ authToken, eventId, eventTitle, walletAddress, ticketType = 'general' }) {
  const res = await fetch('/api/tickets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      action: 'claim',
      eventId,
      eventTitle,
      walletAddress,
      ticketType,
    }),
  })

  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.error || 'Failed to claim ticket')
  }

  return json.ticket
}

export async function listUserTickets(authToken) {
  const res = await fetch('/api/tickets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ action: 'list' }),
  })

  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.error || 'Failed to fetch tickets')
  }

  return json.tickets || []
}

export async function verifyTicketAccess({ eventId, walletAddress, signature = null, challenge = null }) {
  const res = await fetch('/api/tickets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'verify',
      eventId,
      walletAddress,
      signature,
      challenge,
    }),
  })

  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.error || 'Failed to verify ticket access')
  }

  return json
}
