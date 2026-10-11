import { CURATED_CULTURAL_MARKETS } from './culturalMarketsData'

/**
 * Service for Cultural Outcome Markets.
 * Client-safe: uses fetch to invoke /api/markets, with rich fallback to curated cultural products.
 */

export async function listMarkets({ status = null, category = null } = {}) {
  let apiMarkets = []

  try {
    const res = await fetch('/api/markets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'list', status, category }),
    })

    if (res.ok) {
      const json = await res.json()
      apiMarkets = json.markets || []
    }
  } catch (err) {
    console.warn('[marketService] Backend API offline, serving curated cultural markets:', err.message)
  }

  // Combine backend markets with curated cultural product markets
  const apiIds = new Set(apiMarkets.map((m) => m.id))
  const enrichedCurated = CURATED_CULTURAL_MARKETS.filter((m) => !apiIds.has(m.id))

  let combined = [...apiMarkets, ...enrichedCurated]

  // Apply filters
  if (category) {
    combined = combined.filter((m) => m.category === category)
  }
  if (status) {
    combined = combined.filter((m) => m.status === status)
  }

  return combined
}

export async function getMarket(marketId) {
  try {
    const res = await fetch('/api/markets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get', marketId }),
    })

    if (res.ok) {
      const json = await res.json()
      if (json.market) return json.market
    }
  } catch {
    // Fallback to local curated
  }

  const match = CURATED_CULTURAL_MARKETS.find((m) => m.id === marketId)
  if (match) return match

  throw new Error('Market not found')
}

export async function createMarket({
  authToken,
  title,
  description,
  category,
  resolutionSource,
  resolutionDeadline,
  options,
}) {
  const res = await fetch('/api/markets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      action: 'create',
      title,
      description,
      category,
      resolutionSource,
      resolutionDeadline,
      options,
    }),
  })

  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.error || 'Failed to create market')
  }

  return json.market
}

export async function takePosition({ authToken, marketId, optionId, amount }) {
  const res = await fetch('/api/markets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      action: 'position',
      marketId,
      optionId,
      amount,
    }),
  })

  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.error || 'Failed to take position')
  }

  return json.position
}

export async function resolveMarket({
  authToken,
  marketId,
  winningOptionId,
  evidenceUrl,
  sourceDescription,
}) {
  const res = await fetch('/api/markets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      action: 'resolve',
      marketId,
      winningOptionId,
      evidenceUrl,
      sourceDescription,
    }),
  })

  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.error || 'Failed to resolve market')
  }

  return json
}
