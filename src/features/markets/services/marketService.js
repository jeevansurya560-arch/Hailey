/**
 * Service for Cultural Outcome Markets.
 * Client-safe: uses fetch to invoke /api/markets.
 */

export async function listMarkets({ status = null, category = null } = {}) {
  const res = await fetch('/api/markets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'list', status, category }),
  })

  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.error || 'Failed to list markets')
  }

  return json.markets || []
}

export async function getMarket(marketId) {
  const res = await fetch('/api/markets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'get', marketId }),
  })

  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.error || 'Failed to fetch market')
  }

  return json.market
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
