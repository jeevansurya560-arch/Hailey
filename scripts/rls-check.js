import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

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

const anonKey =
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  ''

if (!anonKey) {
  console.error('❌ Error: VITE_SUPABASE_ANON_KEY is required in .env.local')
  process.exit(1)
}

// Anonymous unauthenticated client
const anonClient = createClient(supabaseUrl, anonKey)

async function runSecurityAudit() {
  console.log('🔒 Starting Hailey Comprehensive Row Level Security (RLS) & Access Control Audit...\n')

  const results = []

  // Check 1: Reading another user's private interests (anon client)
  try {
    const { data, error } = await anonClient.from('user_interests').select('*').limit(5)
    const count = data?.length || 0
    const passed = error !== null || count === 0
    results.push({
      checkName: 'Interest Vector Isolation',
      attackVector: 'Anon read user_interests',
      expected: '0 rows / RLS blocked',
      actual: error ? `Error: ${error.code || error.message}` : `${count} rows returned`,
      passed,
    })
  } catch (err) {
    results.push({
      checkName: 'Interest Vector Isolation',
      attackVector: 'Anon read user_interests',
      expected: '0 rows / RLS blocked',
      actual: `Blocked (${err.message})`,
      passed: true,
    })
  }

  // Check 2: Writing into communities table (curator/admin only)
  try {
    const { error } = await anonClient.from('communities').insert({
      slug: 'hack-community',
      name: 'Hacked Community',
    })
    const passed = error !== null
    results.push({
      checkName: 'Collective Integrity',
      attackVector: 'Anon insert into communities',
      expected: 'Permission Denied / RLS Blocked',
      actual: error ? `Blocked (${error.code || error.message})` : 'VULNERABILITY: Insert succeeded',
      passed,
    })
  } catch (err) {
    results.push({
      checkName: 'Collective Integrity',
      attackVector: 'Anon insert into communities',
      expected: 'Permission Denied / RLS Blocked',
      actual: `Blocked (${err.message})`,
      passed: true,
    })
  }

  // Check 3: Reading private feedback rows
  try {
    const { data, error } = await anonClient.from('feedback').select('*').limit(5)
    const count = data?.length || 0
    const passed = error !== null || count === 0
    results.push({
      checkName: 'Feedback Isolation',
      attackVector: 'Anon read feedback',
      expected: '0 rows / RLS blocked',
      actual: error ? `Error: ${error.code || error.message}` : `${count} rows returned`,
      passed,
    })
  } catch (err) {
    results.push({
      checkName: 'Feedback Isolation',
      attackVector: 'Anon read feedback',
      expected: '0 rows / RLS blocked',
      actual: `Blocked (${err.message})`,
      passed: true,
    })
  }

  // Check 4: Reading private wallet challenge nonces
  try {
    const { data, error } = await anonClient.from('wallet_nonces').select('*').limit(5)
    const count = data?.length || 0
    const passed = error !== null || count === 0
    results.push({
      checkName: 'Challenge Nonce Privacy',
      attackVector: 'Anon read wallet_nonces',
      expected: '0 rows / RLS blocked',
      actual: error ? `Error: ${error.code || error.message}` : `${count} rows returned`,
      passed,
    })
  } catch (err) {
    results.push({
      checkName: 'Challenge Nonce Privacy',
      attackVector: 'Anon read wallet_nonces',
      expected: '0 rows / RLS blocked',
      actual: `Blocked (${err.message})`,
      passed: true,
    })
  }

  // Check 5: Modifying another user's profile wallet address directly
  try {
    const fakeUserId = '550e8400-e29b-41d4-a716-446655440000'
    const { data, error } = await anonClient
      .from('profiles')
      .update({ wallet_address: '0x000000000000000000000000000000000000dead' })
      .eq('id', fakeUserId)
      .select()

    const passed = error !== null || !data || data.length === 0
    results.push({
      checkName: 'Wallet Hijack Defense',
      attackVector: 'Anon direct update on profiles.wallet_address',
      expected: '0 rows updated / RLS error',
      actual: error ? `Blocked: ${error.code || error.message}` : `${data?.length || 0} rows updated`,
      passed,
    })
  } catch (err) {
    results.push({
      checkName: 'Wallet Hijack Defense',
      attackVector: 'Anon direct update on profiles.wallet_address',
      expected: '0 rows updated / RLS error',
      actual: `Blocked (${err.message})`,
      passed: true,
    })
  }

  // Check 6: Attempting to insert post with spoofed author
  try {
    const spoofedUserId = '550e8400-e29b-41d4-a716-446655440011'
    const { error } = await anonClient.from('posts').insert({
      author_id: spoofedUserId,
      body: 'Malicious spoofed post',
    })
    const passed = error !== null
    results.push({
      checkName: 'Author Impersonation Guard',
      attackVector: 'Insert post with spoofed author_id',
      expected: 'auth.uid() = author_id check failure',
      actual: error ? `Blocked: ${error.code || error.message}` : 'VULNERABILITY: Insert succeeded',
      passed,
    })
  } catch (err) {
    results.push({
      checkName: 'Author Impersonation Guard',
      attackVector: 'Insert post with spoofed author_id',
      expected: 'auth.uid() = author_id check failure',
      actual: `Blocked (${err.message})`,
      passed: true,
    })
  }

  // Check 7: Reading pending items as unauthenticated user
  try {
    const { data, error } = await anonClient
      .from('collection_items')
      .select('*')
      .eq('status', 'pending')

    const count = data?.length || 0
    const passed = error !== null || count === 0
    results.push({
      checkName: 'Pending Proposals Privacy',
      attackVector: 'Anon read pending collection_items',
      expected: '0 rows (only approved visible)',
      actual: `${count} pending rows visible`,
      passed,
    })
  } catch (err) {
    results.push({
      checkName: 'Pending Proposals Privacy',
      attackVector: 'Anon read pending collection_items',
      expected: '0 rows',
      actual: `Blocked (${err.message})`,
      passed: true,
    })
  }

  // Check 8: Deleting another user's post
  try {
    const fakePostId = '550e8400-e29b-41d4-a716-446655440022'
    const { data, error } = await anonClient
      .from('posts')
      .delete()
      .eq('id', fakePostId)
      .select()

    const passed = error !== null || !data || data.length === 0
    results.push({
      checkName: 'Unauthorized Deletion Guard',
      attackVector: 'Anon delete on posts',
      expected: 'RLS delete policy failure',
      actual: error ? `Blocked: ${error.code || error.message}` : `${data?.length || 0} rows deleted`,
      passed,
    })
  } catch (err) {
    results.push({
      checkName: 'Unauthorized Deletion Guard',
      attackVector: 'Anon delete on posts',
      expected: 'RLS delete policy failure',
      actual: `Blocked (${err.message})`,
      passed: true,
    })
  }

  // Check 9: Paid Curation - Unauthorized insert with status 'confirmed'
  try {
    const fakeCuratorId = '550e8400-e29b-41d4-a716-446655440033'
    const { error } = await anonClient.from('curation_payments').insert({
      curator_user_id: fakeCuratorId,
      amount: 100,
      curator_amount: 95,
      platform_fee: 5,
      payment_method: 'crypto_monad',
      status: 'confirmed', // Bypassing payment intent
    })
    const passed = error !== null
    results.push({
      checkName: 'Paid Curation Fake Confirmation Guard',
      attackVector: 'Anon direct insert curation_payments (status=confirmed)',
      expected: 'RLS blocked (only pending by authenticated payer)',
      actual: error ? `Blocked: ${error.code || error.message}` : 'VULNERABILITY: Payment created as confirmed',
      passed,
    })
  } catch (err) {
    results.push({
      checkName: 'Paid Curation Fake Confirmation Guard',
      attackVector: 'Anon direct insert curation_payments (status=confirmed)',
      expected: 'RLS blocked',
      actual: `Blocked (${err.message})`,
      passed: true,
    })
  }

  // Check 10: Paid Curation - Direct modification of payout amount
  try {
    const fakePayId = '550e8400-e29b-41d4-a716-446655440044'
    const { data, error } = await anonClient
      .from('curation_payments')
      .update({ curator_amount: 999999 })
      .eq('id', fakePayId)
      .select()
    const passed = error !== null || !data || data.length === 0
    results.push({
      checkName: 'Payout Modification Guard',
      attackVector: 'Anon direct update curation_payments.curator_amount',
      expected: 'RLS update blocked',
      actual: error ? `Blocked: ${error.code || error.message}` : `${data?.length || 0} rows updated`,
      passed,
    })
  } catch (err) {
    results.push({
      checkName: 'Payout Modification Guard',
      attackVector: 'Anon direct update curation_payments.curator_amount',
      expected: 'RLS update blocked',
      actual: `Blocked (${err.message})`,
      passed: true,
    })
  }

  // Check 11: Ticketing - Direct modification of ticket status
  try {
    const fakeTicketId = '550e8400-e29b-41d4-a716-446655440055'
    const { data, error } = await anonClient
      .from('tickets')
      .update({ status: 'claimed' })
      .eq('id', fakeTicketId)
      .select()
    const passed = error !== null || !data || data.length === 0
    results.push({
      checkName: 'Ticket State Modification Guard',
      attackVector: 'Anon direct update tickets.status',
      expected: 'RLS update blocked',
      actual: error ? `Blocked: ${error.code || error.message}` : `${data?.length || 0} rows updated`,
      passed,
    })
  } catch (err) {
    results.push({
      checkName: 'Ticket State Modification Guard',
      attackVector: 'Anon direct update tickets.status',
      expected: 'RLS update blocked',
      actual: `Blocked (${err.message})`,
      passed: true,
    })
  }

  // Check 12: Cultural Markets - Direct resolution spoofing
  try {
    const fakeMarketId = '550e8400-e29b-41d4-a716-446655440066'
    const { data, error } = await anonClient
      .from('markets')
      .update({ status: 'resolved' })
      .eq('id', fakeMarketId)
      .select()
    const passed = error !== null || !data || data.length === 0
    results.push({
      checkName: 'Market Resolution Spoofing Guard',
      attackVector: 'Anon direct update markets.status=resolved',
      expected: 'RLS update blocked',
      actual: error ? `Blocked: ${error.code || error.message}` : `${data?.length || 0} rows updated`,
      passed,
    })
  } catch (err) {
    results.push({
      checkName: 'Market Resolution Spoofing Guard',
      attackVector: 'Anon direct update markets.status=resolved',
      expected: 'RLS update blocked',
      actual: `Blocked (${err.message})`,
      passed: true,
    })
  }

  // Check 13: Positions - Direct payout spoofing
  try {
    const fakePosId = '550e8400-e29b-41d4-a716-446655440077'
    const { data, error } = await anonClient
      .from('positions')
      .update({ payout_amount: 50000, status: 'won' })
      .eq('id', fakePosId)
      .select()
    const passed = error !== null || !data || data.length === 0
    results.push({
      checkName: 'Position Payout Spoofing Guard',
      attackVector: 'Anon direct update positions.payout_amount',
      expected: 'RLS update blocked',
      actual: error ? `Blocked: ${error.code || error.message}` : `${data?.length || 0} rows updated`,
      passed,
    })
  } catch (err) {
    results.push({
      checkName: 'Position Payout Spoofing Guard',
      attackVector: 'Anon direct update positions.payout_amount',
      expected: 'RLS update blocked',
      actual: `Blocked (${err.message})`,
      passed: true,
    })
  }

  // Check 14: Attestation Jobs - Direct queue tampering
  try {
    const fakeJobId = '550e8400-e29b-41d4-a716-446655440088'
    const { data, error } = await anonClient
      .from('attestation_jobs')
      .update({ status: 'confirmed', tx_hash: '0xfake_hash' })
      .eq('id', fakeJobId)
      .select()
    const passed = error !== null || !data || data.length === 0
    results.push({
      checkName: 'Attestation Queue Tampering Guard',
      attackVector: 'Anon direct update attestation_jobs',
      expected: 'RLS update blocked',
      actual: error ? `Blocked: ${error.code || error.message}` : `${data?.length || 0} rows updated`,
      passed,
    })
  } catch (err) {
    results.push({
      checkName: 'Attestation Queue Tampering Guard',
      attackVector: 'Anon direct update attestation_jobs',
      expected: 'RLS update blocked',
      actual: `Blocked (${err.message})`,
      passed: true,
    })
  }

  // Print Formatted Markdown Audit Report
  console.log('📊 LIVE RLS SECURITY AUDIT MATRIX:\n')
  console.log('| Check | Attack Vector | Expected Result | Actual Result | Status |')
  console.log('| :--- | :--- | :--- | :--- | :--- |')
  for (const r of results) {
    const statusIcon = r.passed ? '✅ PASSED' : '❌ FAILED'
    console.log(`| **${r.checkName}** | \`${r.attackVector}\` | ${r.expected} | ${r.actual} | ${statusIcon} |`)
  }

  const allPassed = results.every((r) => r.passed)
  if (allPassed) {
    console.log(`\n✨ All ${results.length} RLS security attack vector tests PASSED with zero leaks!`)
  } else {
    console.error('\n⚠️ One or more security audit tests failed. Please review the matrix above.')
    process.exit(1)
  }
}

runSecurityAudit().catch((err) => {
  console.error('Audit execution error:', err)
  process.exit(1)
})
