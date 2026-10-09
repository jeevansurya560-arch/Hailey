/**
 * Service for Paid Curation economic flow.
 * Client-safe: uses fetch to invoke /api/payments.
 */

export async function createPaymentIntent({
  authToken,
  curatorUserId,
  collectionId = null,
  postId = null,
  amount,
  currency = 'USDC',
  paymentMethod = 'crypto_monad',
}) {
  const res = await fetch('/api/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      action: 'intent',
      curatorUserId,
      collectionId,
      postId,
      amount,
      currency,
      paymentMethod,
    }),
  })

  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.error || 'Failed to initialize payment intent')
  }

  return json.payment
}

export async function confirmCryptoPayment({ authToken, paymentId, txHash }) {
  const res = await fetch('/api/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      action: 'confirm',
      paymentId,
      txHash,
    }),
  })

  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.error || 'Payment confirmation failed')
  }

  return json
}

export async function getCuratorEarnings(authToken) {
  const res = await fetch('/api/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ action: 'earnings' }),
  })

  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.error || 'Failed to fetch curator earnings')
  }

  return json.earnings
}

export async function getPayerHistory(authToken) {
  const res = await fetch('/api/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ action: 'history' }),
  })

  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.error || 'Failed to fetch payment history')
  }

  return json.history || []
}
