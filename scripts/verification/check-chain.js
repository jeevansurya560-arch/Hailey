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

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://ycftnowviqyapxycirwz.supabase.co'

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseKey) {
  console.error('Error: Supabase key is required in .env.local or .env.')
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

const CONTRACT_ABI = HAILEY_CONTRIBUTIONS_ABI

async function runChainChecks() {
  console.log('🧪 Starting Strict Onchain Monad Verification Checks...\n')

  const testAddress = process.argv[2] || '0x1234567890123456789012345678901234567890'
  const contractAddress =
    process.env.CONTRACT_ADDRESS ||
    process.env.VITE_CONTRACT_ADDRESS ||
    '0x0000000000000000000000000000000000000000'

  if (!isAddress(contractAddress) || contractAddress === '0x0000000000000000000000000000000000000000') {
    throw new Error(
      `CONTRACT_ADDRESS is not deployed or configured (${contractAddress}). Cannot verify onchain state against zero address.`
    )
  }

  console.log(`📍 Contributor Address: ${testAddress}`)
  console.log(`📍 Contract Address:    ${contractAddress}`)

  const client = createPublicClient({
    chain: monadTestnet,
    transport: http(),
  })

  // 1. Verify contract deployed on network by querying bytecode
  const bytecode = await client.getBytecode({ address: contractAddress })
  if (!bytecode || bytecode === '0x') {
    throw new Error(`Target address ${contractAddress} has no contract bytecode deployed on Monad Testnet.`)
  }

  // 2. Fetch DB contributions count for this address
  const { data: profile, error: profErr } = await supabase
    .from('profiles')
    .select('id, handle')
    .eq('wallet_address', testAddress.toLowerCase())
    .maybeSingle()

  if (profErr) {
    throw new Error(`Failed to query database profiles: ${profErr.message}`)
  }

  let dbAttestedCount = 0
  if (profile) {
    const { count, error: countErr } = await supabase
      .from('contributions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id)
      .eq('status', 'attested')

    if (countErr) {
      throw new Error(`Failed to query database contributions count: ${countErr.message}`)
    }
    dbAttestedCount = count || 0
  }

  console.log(`📊 Database Attested Count: ${dbAttestedCount}`)

  // 3. Fetch communities and query onchain counts
  const { data: communities, error: commsErr } = await supabase
    .from('communities')
    .select('id, name, slug')

  if (commsErr) {
    throw new Error(`Failed to fetch communities from DB: ${commsErr.message}`)
  }

  const commsList = communities || []
  let onchainTotal = 0

  for (const comm of commsList) {
    const communityIdBytes = computeCommunityId(comm.slug)
    const onchainCount = await client.readContract({
      address: contractAddress,
      abi: CONTRACT_ABI,
      functionName: 'count',
      args: [testAddress, communityIdBytes],
    })
    const countNum = Number(onchainCount)
    console.log(`   • Collective "${comm.name}" (${comm.slug}): ${countNum} onchain attestations`)
    onchainTotal += countNum
  }

  console.log(`📊 Onchain Total Count:     ${onchainTotal}`)

  // 4. Mathematical consistency verification
  if (dbAttestedCount !== onchainTotal) {
    throw new Error(
      `Mathematical inconsistency detected: Database attested count (${dbAttestedCount}) does not match Onchain count (${onchainTotal}).`
    )
  }

  console.log(`\n✅ Mathematical Equality Verified: DB count (${dbAttestedCount}) === Chain count (${onchainTotal}).`)
  console.log('✨ All onchain verification checks PASSED!')
}

runChainChecks().catch((err) => {
  console.error('\n❌ Onchain Verification FAILED:', err.message || err)
  process.exit(1)
})
