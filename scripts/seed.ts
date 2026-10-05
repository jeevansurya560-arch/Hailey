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
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseKey) {
  console.error('❌ Error: Supabase API Key is required in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'HaileyDemo2026!'

interface TagItem {
  slug: string
  name: string
  kind: string
  parent_slug?: string | null
  description?: string
  cover_url?: string | null
}

interface EdgeItem {
  src_slug: string
  dst_slug: string
  weight: number
}

interface CommunityItem {
  slug: string
  name: string
  description: string
  tag_slugs: string[]
}

interface PostItem {
  slug_id: string
  community_slug: string
  author_handle: string
  is_editorial: boolean
  body: string
  media_url?: string | null
  media_credit?: string | null
  source_url?: string | null
  tag_slugs: string[]
}

async function seedAll() {
  console.log('🌱 ========================================')
  console.log('🌱 Hailey — Master Database Seed Engine')
  console.log('🌱 ========================================')
  console.log(`🔗 Target Supabase URL: ${supabaseUrl}`)

  // ── 1. TAGS & EDGES ──────────────────────────────────────────
  console.log('\n[1/5] Seeding Culture Taxonomy Graph...')
  const tagsData: TagItem[] = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), 'supabase/seed/tags.json'), 'utf8')
  )
  const edgesData: EdgeItem[] = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), 'supabase/seed/edges.json'), 'utf8')
  )

  const { error: tagUpsertError } = await supabase
    .from('tags')
    .upsert(
      tagsData.map((t) => ({
        slug: t.slug,
        name: t.name,
        kind: t.kind,
        description: t.description || null,
        cover_url: t.cover_url || null,
      })),
      { onConflict: 'slug' }
    )

  if (tagUpsertError) {
    console.warn('⚠️ Tag upsert note (checking table access):', tagUpsertError.message)
  }

  // Build slug -> ID mapping
  const { data: allTags } = await supabase.from('tags').select('id, slug')
  const tagSlugToId = new Map<string, number>()
  if (allTags) {
    for (const t of allTags) {
      tagSlugToId.set(t.slug, t.id)
    }
  }

  // Update parent relations
  for (const tag of tagsData) {
    if (tag.parent_slug && tagSlugToId.has(tag.parent_slug) && tagSlugToId.has(tag.slug)) {
      await supabase
        .from('tags')
        .update({ parent_id: tagSlugToId.get(tag.parent_slug)! })
        .eq('id', tagSlugToId.get(tag.slug)!)
    }
  }

  // Upsert Edges
  const edgeRows: { src: number; dst: number; weight: number }[] = []
  for (const e of edgesData) {
    const srcId = tagSlugToId.get(e.src_slug)
    const dstId = tagSlugToId.get(e.dst_slug)
    if (srcId && dstId && srcId !== dstId) {
      edgeRows.push({ src: srcId, dst: dstId, weight: e.weight })
    }
  }

  if (edgeRows.length > 0) {
    await supabase.from('tag_edges').upsert(edgeRows, { onConflict: 'src,dst' })
  }
  console.log(`      ✓ Tags and edges processed. (${tagSlugToId.size} tags resolved)`)

  // ── 2. DEMO ACCOUNTS ──────────────────────────────────────────
  console.log('\n[2/5] Seeding Demo User Profiles...')
  const demoUsers = [
    {
      email: 'editorial@hailey.internal',
      handle: 'hailey_editorial',
      displayName: 'Hailey Editorial',
      isEditorial: true,
    },
    {
      email: 'contributor@hailey.internal',
      handle: 'demo_contributor',
      displayName: 'Marcus Chen (Archive)',
      isEditorial: false,
    },
    {
      email: 'curator@hailey.internal',
      handle: 'demo_curator',
      displayName: 'Elena Rostova',
      isEditorial: false,
    },
  ]

  const userHandleToId = new Map<string, string>()

  // Try creating/fetching accounts via Admin API (or query existing profiles)
  for (const u of demoUsers) {
    let userId: string | null = null

    // Check if user exists in auth or profiles
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('handle', u.handle)
      .maybeSingle()

    if (existingProfile?.id) {
      userId = existingProfile.id
    } else {
      // Try admin signup
      try {
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: u.email,
          password: DEMO_PASSWORD,
          email_confirm: true,
          user_metadata: { handle: u.handle, display_name: u.displayName },
        })

        if (!authError && authUser.user) {
          userId = authUser.user.id
        }
      } catch {
        // Fallback for non-admin context: query auth.users if available
      }
    }

    if (userId) {
      userHandleToId.set(u.handle, userId)
      await supabase.from('profiles').upsert(
        {
          id: userId,
          handle: u.handle,
          display_name: u.displayName,
          is_editorial: u.isEditorial,
        },
        { onConflict: 'id' }
      )
    }
  }
  console.log(`      ✓ Demo accounts mapped: ${userHandleToId.size} profiles resolved.`)

  // ── 3. COMMUNITIES & COMMUNITY TAGS ───────────────────────────
  console.log('\n[3/5] Seeding 8 Cultural Communities...')
  const communitiesData: CommunityItem[] = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), 'supabase/seed/communities.json'), 'utf8')
  )

  const editorialId = userHandleToId.get('hailey_editorial') || null

  const communitySlugToId = new Map<string, string>()

  for (const c of communitiesData) {
    const { data: comm } = await supabase
      .from('communities')
      .upsert(
        {
          slug: c.slug,
          name: c.name,
          description: c.description,
          created_by: editorialId,
        },
        { onConflict: 'slug' }
      )
      .select('id, slug')
      .single()

    if (comm) {
      communitySlugToId.set(comm.slug, comm.id)

      // Link community tags
      const commTagRows: { community_id: string; tag_id: number }[] = []
      for (const tSlug of c.tag_slugs) {
        const tId = tagSlugToId.get(tSlug)
        if (tId) {
          commTagRows.push({ community_id: comm.id, tag_id: tId })
        }
      }

      if (commTagRows.length > 0) {
        await supabase
          .from('community_tags')
          .upsert(commTagRows, { onConflict: 'community_id,tag_id' })
      }
    }
  }
  console.log(`      ✓ Communities seeded: ${communitySlugToId.size} communities resolved.`)

  // ── 4. CURATOR & MEMBER MEMBERSHIPS ───────────────────────────
  console.log('\n[4/5] Seeding Curator & Member Roles...')
  const curatorId = userHandleToId.get('demo_curator')
  const contributorId = userHandleToId.get('demo_contributor')

  if (curatorId) {
    const curatorComms = ['streetwear-archive', 'dub-sound-system', 'berlin-modular-minimal']
    for (const cSlug of curatorComms) {
      const commId = communitySlugToId.get(cSlug)
      if (commId) {
        await supabase.from('memberships').upsert(
          {
            community_id: commId,
            user_id: curatorId,
            role: 'curator',
          },
          { onConflict: 'community_id,user_id' }
        )
      }
    }
  }

  if (contributorId) {
    for (const commId of communitySlugToId.values()) {
      await supabase.from('memberships').upsert(
        {
          community_id: commId,
          user_id: contributorId,
          role: 'member',
        },
        { onConflict: 'community_id,user_id' }
      )
    }
  }
  console.log('      ✓ Curator and contributor memberships configured.')

  // ── 5. TEST POSTS & POST TAGS ─────────────────────────────────
  console.log('\n[5/5] Seeding Test Posts & Metadata...')
  const postsData: PostItem[] = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), 'supabase/seed/posts.json'), 'utf8')
  )

  let postsSeededCount = 0
  for (const p of postsData) {
    const authorId = userHandleToId.get(p.author_handle) || editorialId
    const communityId = communitySlugToId.get(p.community_slug)

    if (authorId && communityId) {
      // Check if post with same body exists to keep idempotent
      const { data: existingPost } = await supabase
        .from('posts')
        .select('id')
        .eq('community_id', communityId)
        .eq('body', p.body)
        .maybeSingle()

      let postId = existingPost?.id

      if (!postId) {
        const { data: createdPost } = await supabase
          .from('posts')
          .insert({
            author_id: authorId,
            community_id: communityId,
            body: p.body,
            media_url: p.media_url || null,
            media_credit: p.media_credit || null,
            source_url: p.source_url || null,
            is_editorial: p.is_editorial,
          })
          .select('id')
          .single()

        postId = createdPost?.id
      }

      if (postId) {
        postsSeededCount++
        const postTagRows: { post_id: string; tag_id: number; weight: number }[] = []
        for (const tSlug of p.tag_slugs) {
          const tId = tagSlugToId.get(tSlug)
          if (tId) {
            postTagRows.push({ post_id: postId, tag_id: tId, weight: 1.0 })
          }
        }

        if (postTagRows.length > 0) {
          await supabase
            .from('post_tags')
            .upsert(postTagRows, { onConflict: 'post_id,tag_id' })
        }
      }
    }
  }
  console.log(`      ✓ Seeded ${postsSeededCount} posts with tags and source attributions.`)

  console.log('\n✅ ========================================')
  console.log('✅ Master Database Seeding Completed')
  console.log('✅ ========================================\n')
}

seedAll().catch((err) => {
  console.error('Fatal seed error:', err)
  process.exit(1)
})
