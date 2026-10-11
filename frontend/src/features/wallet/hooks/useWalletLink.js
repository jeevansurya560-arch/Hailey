import { useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { requestChallengeNonce, verifyAndLinkWallet } from '../services/walletService'

export function useWalletLink() {
  const { address, isConnected } = useAccount()
  const { session } = useAuth()
  const { signMessageAsync } = useSignMessage()
  const queryClient = useQueryClient()

  const [isLinking, setIsLinking] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const linkWallet = async () => {
    setError(null)
    setSuccess(false)

    if (!isConnected || !address) {
      setError('Please connect your Web3 wallet first.')
      return false
    }

    if (!session?.access_token) {
      setError('You must be signed in to link your wallet to your profile.')
      return false
    }

    setIsLinking(true)

    try {
      // 1. Request cryptographic challenge nonce from server
      const { message } = await requestChallengeNonce(session.access_token)
      if (!message) {
        throw new Error('Failed to retrieve signing challenge from server')
      }

      // 2. Request EIP-191 personal_sign signature from connected browser wallet
      const signature = await signMessageAsync({ message })
      if (!signature) {
        throw new Error('Wallet signature request was cancelled or declined.')
      }

      // 3. Submit signature for onchain address verification & profile binding
      await verifyAndLinkWallet({
        authToken: session.access_token,
        address,
        signature,
      })

      setSuccess(true)

      // Invalidate queries so UI immediately reflects verified linked wallet
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['profile_contributions'] })

      return true
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Wallet linking failed'
      console.warn('[useWalletLink] Verification error:', msg)
      setError(msg)
      return false
    } finally {
      setIsLinking(false)
    }
  }

  return {
    linkWallet,
    isLinking,
    error,
    success,
    connectedAddress: address,
    isConnected,
  }
}
