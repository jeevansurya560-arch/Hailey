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

const supabaseAnonKey =
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY

if (!supabaseAnonKey) {
  console.error('❌ Error: VITE_SUPABASE_ANON_KEY is required in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkWeights() {
  console.log('⚖️ ========================================')
  console.log('⚖️ Hailey — Interest Weight Verification')
  console.log('⚖️ ========================================')
  console.log(`🔗 Target URL: ${supabaseUrl}`)

  // 1. Authenticate test user
  const testEmail = 'contributor@hailey.internal'
  const testPassword = process.env.DEMO_PASSWORD || 'HaileyDemo2026!'

  let userId = null

  const signInRes = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  })

  if (signInRes.data?.user) {
    userId = signInRes.data.user.id
  } else {
    const signUpRes = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })
    if (signUpRes.data?.user) {
      userId = signUpRes.data.user.id
    }
  }

  if (!userId) {
    console.warn('⚠️ Note on Auth Session: Could not establish session for contributor@hailey.internal')
    console.log('   (Sign in to Hailey in your browser or run against seeded demo users)')
    return
  }
  console.log(`      ✓ Authenticated as user ID: ${userId}`)

  // 2. Fetch a target post with tags
  console.log('\n[2/4] Fetching target post with tag associations...')
  const { data: post, error: postErr } = await supabase
    .from('posts')
    .select('id, body, post_tags(tag_id, tags(name, slug))')
    .limit(1)
    .maybeSingle()

  if (postErr || !post) {
    console.log('⚠️ No posts found in database. Seed content before checking weights.')
    return
  }

  console.log(`      ✓ Target Post ID: ${post.id}`)
  const postTagNames = (post.post_tags || []).map((pt) => pt.tags?.name || pt.tag_id)
  console.log(`      ✓ Associated Post Tags: ${postTagNames.join(', ')}`)

  // 3. Inspect user_interests weights before reactions
  const { data: initialWeights } = await supabase
    .from('user_interests')
    .select('tag_id, weight, tags(name)')
    .eq('user_id', userId)

  console.log('\n[3/4] Initial user_interests weights for user:')
  if (!initialWeights || initialWeights.length === 0) {
    console.log('      (No user_interests rows yet — baseline = 0)')
  } else {
    for (const w of initialWeights) {
      console.log(`      • ${w.tags?.name || w.tag_id}: ${w.weight}`)
    }
  }

  // 4. Simulate Save (+3) and Like (+1) reactions
  console.log('\n[4/4] Inserting Reactions (Save: +3, Like: +1)...')

  const { error: saveErr } = await supabase
    .from('post_reactions')
    .upsert({ user_id: userId, post_id: post.id, kind: 'save' })

  if (saveErr) console.warn('      Save reaction note:', saveErr.message)
  else console.log('      ✓ Recorded SAVE reaction (+3)')

  const { error: likeErr } = await supabase
    .from('post_reactions')
    .upsert({ user_id: userId, post_id: post.id, kind: 'like' })

  if (likeErr) console.warn('      Like reaction note:', likeErr.message)
  else console.log('      ✓ Recorded LIKE reaction (+1)')

  // Fetch updated weights
  const { data: updatedWeights } = await supabase
    .from('user_interests')
    .select('tag_id, weight, tags(name)')
    .eq('user_id', userId)

  console.log('\n📊 Updated user_interests weights:')
  if (updatedWeights && updatedWeights.length > 0) {
    for (const w of updatedWeights) {
      console.log(`      • ${w.tags?.name || w.tag_id}: ${w.weight}`)
    }
  } else {
    console.log('      (Note: Triggers update weights when applied in Supabase SQL Editor via 0003_triggers.sql)')
  }

  console.log('\n✅ Weight verification routine complete.')
}

checkWeights().catch((err) => {
  console.error('Fatal error in check-weights:', err)
  process.exit(1)
})
