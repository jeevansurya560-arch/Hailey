import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { createPublicClient, http, isAddress } from 'viem'
import { computeCommunityId } from '../../shared/crypto/hashing.js'
import { HAILEY_CONTRIBUTIONS_ABI } from '../../shared/contracts/HaileyContributions.abi.js'

function loadEnv(filePath) {
  const fullPath = path.resolve(process.cwd(), filePath)
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim()
        const val = trimmed.slice(eqIdx + 1).trim()
        if (!process.env[key]) {
          process.env[key] = val
        }
      }
    }
  }
}

loadEnv('.env.local')
loadEnv('.env')

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials missing.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz'] },
  },
}

export async function reconcileAttestations() {
  console.log('🔄 Starting Attestation DB vs. Onchain Reconciliation...\n')

  const contractAddress =
    process.env.CONTRACT_ADDRESS ||
    process.env.VITE_CONTRACT_ADDRESS ||
    '0x0000000000000000000000000000000000000000'

  if (!isAddress(contractAddress) || contractAddress === '0x0000000000000000000000000000000000000000') {
    return {
      status: 'BLOCKED',
      reason: 'CONTRACT_ADDRESS is not deployed or configured (0x0). Cannot query live onchain state.',
      discrepancies: 0,
      repaired: 0,
    }
  }

  const client = createPublicClient({
    chain: monadTestnet,
    transport: http(),
  })

  // Verify bytecode
  const bytecode = await client.getBytecode({ address: contractAddress })
  if (!bytecode || bytecode === '0x') {
    return {
      status: 'BLOCKED',
      reason: `No bytecode deployed at ${contractAddress} on Monad Testnet.`,
      discrepancies: 0,
      repaired: 0,
    }
  }

  // Fetch all contributions
  const { data: contributions, error: fetchErr } = await supabase
    .from('contributions')
    .select(`
      id,
      item_id,
      user_id,
      community_id,
      content_hash,
      status,
      tx_hash,
      attested_at,
      communities ( slug ),
      profiles:user_id ( wallet_address )
    `)

  if (fetchErr) {
    throw new Error('Failed to query contributions: ' + fetchErr.message)
  }

  let discrepancies = 0
  let repaired = 0

  for (const contrib of contributions || []) {
    const wallet = contrib.profiles?.wallet_address
    const slug = contrib.communities?.slug || 'general'
    const communityIdBytes = computeCommunityId(slug)

    if (contrib.status === 'submitted' && contrib.tx_hash) {
      try {
        const receipt = await client.getTransactionReceipt({ hash: contrib.tx_hash })
        if (receipt && receipt.status === 'success') {
          // Repair DB state: transaction actually succeeded onchain
          await supabase
            .from('contributions')
            .update({
              status: 'attested',
              attested_at: new Date().toISOString(),
            })
            .eq('id', contrib.id)

          repaired++
          console.log(`[Reconciled] Fixed contribution ${contrib.id}: 'submitted' -> 'attested' based on onchain receipt.`)
        }
      } catch {
        // Transaction may still be in mempool or pending
      }
    } else if (contrib.status === 'attested') {
      if (wallet) {
        try {
          const onchainCount = await client.readContract({
            address: contractAddress,
            abi: HAILEY_CONTRIBUTIONS_ABI,
            functionName: 'count',
            args: [wallet, communityIdBytes],
          })

          if (Number(onchainCount) === 0) {
            discrepancies++
            console.warn(`[Inconsistency Alert] Contribution ${contrib.id} marked 'attested' in DB, but onchain count for ${wallet} in ${slug} is 0.`)
          }
        } catch (err) {
          console.error(`[Error] Failed to read onchain count for ${wallet}:`, err.message)
        }
      }
    }
  }

  return {
    status: 'COMPLETE',
    totalChecked: contributions?.length || 0,
    discrepancies,
    repaired,
  }
}

if (process.argv[1]?.endsWith('reconcile-attestations.js')) {
  reconcileAttestations()
    .then((res) => {
      console.log('\n📊 Reconciliation Result:', JSON.stringify(res, null, 2))
      if (res.status === 'BLOCKED') {
        console.warn(`⚠️ Reconciliation BLOCKED: ${res.reason}`)
      } else if (res.discrepancies > 0) {
        console.error(`❌ Found ${res.discrepancies} discrepancies between DB and chain.`)
        process.exit(1)
      } else {
        console.log(`✅ Reconciliation completed cleanly with 0 discrepancies.`)
      }
    })
    .catch((err) => {
      console.error('Fatal reconciliation error:', err)
      process.exit(1)
    })
}
