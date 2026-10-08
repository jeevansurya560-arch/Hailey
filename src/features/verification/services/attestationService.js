import { createPublicClient, http, isAddress } from 'viem'
import { monadTestnet } from '@/lib/wallet/chain'
import { supabase } from '@/lib/supabase/client'
import { computeCommunityId } from '@shared/crypto/hashing.js'
import { HAILEY_CONTRIBUTIONS_ABI } from '@shared/contracts/HaileyContributions.abi.js'

let publicClientInstance = null

function getPublicClient() {
  if (!publicClientInstance) {
    publicClientInstance = createPublicClient({
      chain: monadTestnet,
      transport: http(),
    })
  }
  return publicClientInstance
}

/**
 * Fetch active communities to check attestations against
 */
export async function fetchCommunitiesForVerification() {
  const { data, error } = await supabase
    .from('communities')
    .select('id, name, slug')
    .order('name')

  if (error) {
    throw new Error(`Failed to fetch communities: ${error.message}`)
  }

  return data || []
}

/**
 * Query onchain attestation counts for an address across communities
 * Safely distinguishes RPC errors from actual zero counts.
 */
export async function getCommunityAttestationCounts(contributorAddress, communities, contractAddress) {
  if (!isAddress(contributorAddress) || !contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
    return (communities || []).map((comm) => ({
      community: comm,
      count: 0,
      status: 'unconfigured',
      errorMessage: !isAddress(contributorAddress) ? 'Invalid contributor address' : 'Contract address not configured',
    }))
  }

  const client = getPublicClient()
  const normalizedAddress = contributorAddress.toLowerCase()

  const results = await Promise.all(
    communities.map(async (comm) => {
      const communityIdBytes = computeCommunityId(comm.slug)
      try {
        const count = await client.readContract({
          address: contractAddress,
          abi: HAILEY_CONTRIBUTIONS_ABI,
          functionName: 'count',
          args: [normalizedAddress, communityIdBytes],
        })

        return {
          community: comm,
          count: Number(count),
          status: 'success',
          errorMessage: null,
        }
      } catch (err) {
        // Do NOT convert failure to 0. Report verification unavailable.
        return {
          community: comm,
          count: null,
          status: 'unavailable',
          errorMessage: err?.shortMessage || err?.message || 'Verification unavailable',
        }
      }
    })
  )

  return results
}
