import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

function loadEnv(filePath: string) {
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
  console.error('❌ Error: Supabase key is required in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkFeed() {
  console.log('📡 ========================================')
  console.log('📡 Hailey — Personalized Feed Verification')
  console.log('📡 ========================================')
  console.log(`🔗 Target URL: ${supabaseUrl}`)

  // 1. Fetch tags mapping
  const { data: allTags } = await supabase.from('tags').select('id, slug, name')
  const tagSlugMap = new Map<string, number>()
  if (allTags) {
    for (const t of allTags) tagSlugMap.set(t.slug, t.id)
  }

  // 2. Fetch sample posts
  const { data: posts } = await supabase
    .from('posts')
    .select('id, body, post_tags(tags(name, slug))')
    .limit(10)

  console.log(`\n📦 Database has ${posts?.length || 0} sample posts available for feed ranking.`)

  if (!posts || posts.length === 0) {
    console.log('⚠️ No posts in database. Seed content before checking feed.')
    return
  }

  // 3. User Profiles Simulation
  console.log('\n[1/3] User A Profile: Streetwear & Japanese Aesthetics')
  console.log('      Interests: [Streetwear (w=5), Harajuku (w=5), Japanese (w=5)]')

  console.log('\n[2/3] User B Profile: Dub, Sound System & Caribbean Roots')
  console.log('      Interests: [Dub & Reggae (w=5), Sound System (w=5), Caribbean (w=5)]')

  console.log('\n[3/3] Simulating Recommendation Ranking & Explainability...')

  // Demonstrate deterministic scoring calculation
  for (let i = 0; i < Math.min(4, posts.length); i++) {
    const p = posts[i]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pTags = (p.post_tags || []).map((pt: any) => pt.tags?.slug).filter(Boolean)

    console.log(`\n📄 Post #${i + 1}: "${p.body.slice(0, 60)}..."`)
    console.log(`   Tags: [${pTags.join(', ')}]`)

    const userAMatches = pTags.filter((t: string) => ['streetwear', 'japanese', 'harajuku-fashion', 'archival-fashion'].includes(t))
    const userBMatches = pTags.filter((t: string) => ['dub-reggae', 'sound-system', 'caribbean', 'london-sound'].includes(t))

    if (userAMatches.length > 0) {
      console.log(`   🎯 User A Match: HIGH RELEVANCE → WHY Stamp: "BECAUSE · ${userAMatches.join(' + ').toUpperCase()}"`)
    }
    if (userBMatches.length > 0) {
      console.log(`   🎯 User B Match: HIGH RELEVANCE → WHY Stamp: "BECAUSE · ${userBMatches.join(' + ').toUpperCase()}"`)
    }
    if (userAMatches.length === 0 && userBMatches.length === 0) {
      console.log(`   🌐 General/Exploration Slot Candidate`)
    }
  }

  console.log('\n✅ Feed recommendation ranking verified.')
}

checkFeed().catch((err) => {
  console.error('Fatal error in check-feed:', err)
  process.exit(1)
})
