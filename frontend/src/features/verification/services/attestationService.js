import { createPublicClient, http, isAddress } from 'viem'
import { monadTestnet } from '@/lib/wallet/chain'
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
  const { supabase } = await import('@/lib/supabase/client')
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

/**
 * Directly verifies whether a specific cryptographic content hash (v1 or v2) is attested onchain.
 * Rejects perceptual hashes or invalid lengths.
 *
 * @param {string} contentHash 0x-prefixed 32-byte (64 hex char) content hash
 * @param {string} contractAddress Deployed HaileyContributions contract address
 * @returns {Promise<{ contentHash: string, attested: boolean, status: 'verified' | 'unconfigured' | 'unavailable' | 'invalid_hash', errorMessage: string | null }>}
 */
export async function verifyContentHashOnchain(contentHash, contractAddress) {
  if (!contentHash || typeof contentHash !== 'string' || !/^0x[0-9a-fA-F]{64}$/.test(contentHash)) {
    return {
      contentHash,
      attested: false,
      status: 'invalid_hash',
      errorMessage: 'Invalid cryptographic content hash. Must be a 32-byte hex string (perceptual hashes cannot be verified onchain).',
    }
  }

  if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
    return {
      contentHash,
      attested: false,
      status: 'unconfigured',
      errorMessage: 'Contract address not configured',
    }
  }

  const client = getPublicClient()

  try {
    const isAttested = await client.readContract({
      address: contractAddress,
      abi: HAILEY_CONTRIBUTIONS_ABI,
      functionName: 'attested',
      args: [contentHash],
    })

    return {
      contentHash,
      attested: Boolean(isAttested),
      status: 'verified',
      errorMessage: null,
    }
  } catch (err) {
    return {
      contentHash,
      attested: false,
      status: 'unavailable',
      errorMessage: err?.shortMessage || err?.message || 'Onchain verification query unavailable',
    }
  }
}
