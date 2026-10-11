/**
 * Service for Cryptographic Wallet Challenge Nonces & EIP-191 Linking
 */

export async function requestChallengeNonce(authToken) {
  if (!authToken) {
    throw new Error('Authentication token is required to request a wallet challenge')
  }

  const response = await fetch('/api/wallet', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ action: 'nonce' }),
  })

  const payload = await response.json()
  if (!response.ok) {
    throw new Error(payload.error || 'Failed to generate challenge nonce')
  }

  return payload
}

export async function verifyAndLinkWallet({ authToken, address, signature }) {
  if (!authToken) {
    throw new Error('Authentication token is required to link wallet')
  }
  if (!address || !signature) {
    throw new Error('Address and signature are required to link wallet')
  }

  const response = await fetch('/api/wallet', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      action: 'link',
      address,
      signature,
    }),
  })

  const payload = await response.json()
  if (!response.ok) {
    throw new Error(payload.error || 'Failed to verify wallet signature')
  }

  return payload
}
