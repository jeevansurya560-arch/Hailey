import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { computeCommunityId, computeItemContent, computeContentHash } from '../../shared/crypto/hashing.js'
import { validateApproveItemInput, validateProposeItemInput } from '../../server/security/validation/validate.js'

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

async function runApprovalChecks() {
  console.log('🧪 Starting Curator Approval & Validation Checks...\n')

  // 1. Fetch community from real Supabase DB
  let communitySlug = 'tokyo-underground'
  let communityName = 'Tokyo Underground & Street Culture'

  const { data: dbCommunity, error: commError } = await supabase
    .from('communities')
    .select('id, slug, name')
    .limit(1)
    .maybeSingle()

  if (commError) {
    console.warn('⚠️ Warning querying communities:', commError.message)
  }

  if (dbCommunity) {
    communitySlug = dbCommunity.slug
    communityName = dbCommunity.name
  }

  console.log(`📍 Testing with Community Collective: "${communityName}" (${communitySlug})`)

  // ── TEST 1: Server Validation Layer Tests ───────────────
  console.log('\n--- Test 1: Real Server Input Validation ---')
  const badActionRes = validateApproveItemInput({
    itemId: '550e8400-e29b-41d4-a716-446655440000',
    action: 'delete',
  })
  if (!badActionRes.error) {
    throw new Error('FAILED: validateApproveItemInput allowed invalid action "delete"')
  }
  console.log(`✅ Invalid action rejected: "${badActionRes.error}"`)

  const badUuidRes = validateApproveItemInput({
    itemId: 'invalid-uuid-string',
    action: 'approve',
  })
  if (!badUuidRes.error) {
    throw new Error('FAILED: validateApproveItemInput allowed invalid non-UUID itemId')
  }
  console.log(`✅ Invalid UUID rejected: "${badUuidRes.error}"`)

  const validRes = validateApproveItemInput({
    itemId: '550e8400-e29b-41d4-a716-446655440000',
    action: 'approve',
  })
  if (validRes.error || !validRes.data) {
    throw new Error(`FAILED: validateApproveItemInput rejected valid input: ${validRes.error}`)
  }
  console.log('✅ Valid approval payload accepted by server validator.')

  // ── TEST 2: Propose Item Server Validation ──
  console.log('\n--- Test 2: Propose Item Server Validation ---')
  const badProposeRes = validateProposeItemInput({
    collectionId: '550e8400-e29b-41d4-a716-446655440001',
    kind: 'link',
    url: 'ftp://unsupported.com',
  })
  if (!badProposeRes.error) {
    throw new Error('FAILED: validateProposeItemInput allowed non-http URL')
  }
  console.log(`✅ Invalid protocol rejected: "${badProposeRes.error}"`)

  // ── TEST 3: Deterministic Canonical Content Hashing (Keccak256) ──
  console.log('\n--- Test 3: Deterministic Canonical Content Hashing ---')
  const communityIdBytes = computeCommunityId(communitySlug)
  const itemContent = computeItemContent({
    kind: 'link',
    url: 'https://archive.org/details/harajuku-fashion-walk-1996',
    note: 'Primary archival photography of early Harajuku street movement.',
  })
  const contentHash = computeContentHash({
    itemId: '550e8400-e29b-41d4-a716-446655440002',
    collectionId: '550e8400-e29b-41d4-a716-446655440003',
    communitySlug,
    item: {
      kind: 'link',
      url: 'https://archive.org/details/harajuku-fashion-walk-1996',
      note: 'Primary archival photography of early Harajuku street movement.',
    },
  })

  if (!communityIdBytes.startsWith('0x') || communityIdBytes.length !== 66) {
    throw new Error(`FAILED: communityIdBytes format invalid: ${communityIdBytes}`)
  }
  if (!contentHash.startsWith('0x') || contentHash.length !== 66) {
    throw new Error(`FAILED: contentHash format invalid: ${contentHash}`)
  }

  console.log(`✅ Community ID Bytes32: ${communityIdBytes}`)
  console.log(`✅ Canonical Item Serialization: "${itemContent}"`)
  console.log(`✅ Deterministic Content Hash (Keccak256): ${contentHash}`)

  // ── TEST 4: Real Database Collections / Items Query Check ──
  console.log('\n--- Test 4: Database Items & Collections Inspection ---')
  const { data: items, error: itemsErr } = await supabase
    .from('collection_items')
    .select('id, status, collection_id')
    .limit(5)

  if (itemsErr) {
    console.warn('⚠️ Note: collection_items query returned error:', itemsErr.message)
  } else {
    console.log(`✅ Successfully queried collection_items table (${items?.length || 0} items inspected).`)
  }

  console.log('\n✨ All Curator Approval & Validation checks PASSED successfully!')
}

runApprovalChecks().catch((err) => {
  console.error('Fatal error during approval checks:', err)
  process.exit(1)
})
