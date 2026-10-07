import { supabase } from '@/lib/supabase'

/**
 * Fetch communities list with tags, member counts, and membership status
 */
export async function fetchCommunities(currentUserId = null) {
  // 1. Fetch communities
  const { data: commsData, error: commsErr } = await supabase
    .from('communities')
    .select('*')
    .order('name')

  if (commsErr) throw commsErr

  // 2. Fetch community tags
  const { data: commTagsData } = await supabase
    .from('community_tags')
    .select('community_id, tags(id, name, slug, kind)')

  // 3. Fetch memberships
  const { data: membershipsData } = await supabase
    .from('memberships')
    .select('community_id, user_id')

  const commTagsMap = new Map()
  if (commTagsData) {
    for (const item of commTagsData) {
      if (!item.community_id || !item.tags) continue
      const current = commTagsMap.get(item.community_id) || []
      current.push(item.tags)
      commTagsMap.set(item.community_id, current)
    }
  }

  const membersCountMap = new Map()
  const userJoinedSet = new Set()

  if (membershipsData) {
    for (const m of membershipsData) {
      membersCountMap.set(m.community_id, (membersCountMap.get(m.community_id) || 0) + 1)
      if (currentUserId && m.user_id === currentUserId) {
        userJoinedSet.add(m.community_id)
      }
    }
  }

  return (commsData || []).map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    membersCount: membersCountMap.get(c.id) || 0,
    isMember: userJoinedSet.has(c.id),
    tags: commTagsMap.get(c.id) || [],
  }))
}

/**
 * Fetch community details by slug including collections and curator status
 */
export async function fetchCommunityBySlug(slug, currentUserId = null) {
  if (!slug) throw new Error('Community slug is required.')

  const { data: commData, error: commErr } = await supabase
    .from('communities')
    .select('*')
    .eq('slug', slug)
    .single()

  if (commErr || !commData) {
    throw commErr || new Error('Community not found')
  }

  // Tags
  const { data: commTags } = await supabase
    .from('community_tags')
    .select('tags(id, name, slug, kind)')
    .eq('community_id', commData.id)

  // Memberships & Curators
  const { data: memberships } = await supabase
    .from('memberships')
    .select('user_id, role, profiles(handle, display_name)')
    .eq('community_id', commData.id)

  const membersCount = memberships?.length || 0
  const isMember = !!(currentUserId && memberships?.some((m) => m.user_id === currentUserId))
  const curators = (memberships || []).filter((m) => m.role === 'curator').map((m) => m.profiles)
  const tags = (commTags || []).map((ct) => ct.tags).filter(Boolean)

  return {
    ...commData,
    membersCount,
    isMember,
    curators,
    tags,
  }
}

/**
 * Fetch posts for a specific community with scoped reactions (no unbounded full-table scans)
 */
export async function fetchCommunityPosts(community, currentUserId = null) {
  if (!community?.id) return []

  const { data: postsData, error: postsErr } = await supabase
    .from('posts')
    .select(`
      id,
      author_id,
      body,
      media_url,
      media_credit,
      source_url,
      is_editorial,
      created_at,
      profiles (handle, display_name),
      post_tags (tags (id, name, slug, kind))
    `)
    .eq('community_id', community.id)
    .order('created_at', { ascending: false })

  if (postsErr) throw postsErr
  const posts = postsData || []
  if (posts.length === 0) return []

  const postIds = posts.map((p) => p.id)

  // Fetch scoped reactions for only these posts
  let userReactions = []
  if (currentUserId) {
    const { data: reactionsData } = await supabase
      .from('post_reactions')
      .select('post_id, kind')
      .eq('user_id', currentUserId)
      .in('post_id', postIds)
    userReactions = reactionsData || []
  }

  const { data: postReactionsData } = await supabase
    .from('post_reactions')
    .select('post_id, kind')
    .in('post_id', postIds)

  const reactionsCountMap = new Map()
  if (postReactionsData) {
    for (const r of postReactionsData) {
      const current = reactionsCountMap.get(r.post_id) || { likes: 0, saves: 0 }
      if (r.kind === 'like') current.likes++
      if (r.kind === 'save') current.saves++
      reactionsCountMap.set(r.post_id, current)
    }
  }

  return posts.map((p) => {
    const pReactions = userReactions.filter((r) => r.post_id === p.id)
    const counts = reactionsCountMap.get(p.id) || { likes: 0, saves: 0 }
    const tags = (p.post_tags || []).map((pt) => pt.tags).filter(Boolean)

    return {
      id: p.id,
      author_id: p.author_id,
      author: p.profiles,
      community: { slug: community.slug, name: community.name },
      body: p.body,
      media_url: p.media_url,
      media_credit: p.media_credit,
      source_url: p.source_url,
      is_editorial: p.is_editorial,
      created_at: p.created_at,
      tags,
      reactions: {
        likesCount: counts.likes,
        savesCount: counts.saves,
        isLiked: pReactions.some((r) => r.kind === 'like'),
        isSaved: pReactions.some((r) => r.kind === 'save'),
        isHidden: pReactions.some((r) => r.kind === 'hide'),
      },
    }
  })
}

/**
 * Join or leave a community
 */
export async function toggleCommunityMembership({ communityId, userId, isJoining }) {
  if (!userId) throw new Error('Sign in required')
  if (!communityId) throw new Error('Community ID required')

  if (isJoining) {
    const { error } = await supabase
      .from('memberships')
      .insert({ community_id: communityId, user_id: userId, role: 'member' })
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('memberships')
      .delete()
      .eq('community_id', communityId)
      .eq('user_id', userId)
    if (error) throw error
  }

  return { success: true }
}

/**
 * Fetch culture tags/threads
 */
export async function fetchCultureTags() {
  const { data: tags, error } = await supabase
    .from('tags')
    .select('id, name, slug, kind')
    .order('name')

  if (error) throw error
  return tags || []
}

/**
 * Fetch posts tagged with a specific culture tag with scoped reactions
 */
export async function fetchCulturePostsByTag(tagId, currentUserId = null) {
  if (!tagId) return []

  const { data: postTags, error: ptErr } = await supabase
    .from('post_tags')
    .select(`
      post_id,
      posts (
        id,
        body,
        media_url,
        created_at,
        author_id,
        profiles (
          handle,
          display_name,
          role
        ),
        communities (
          id,
          name,
          slug
        ),
        post_tags (
          tags (
            id,
            name,
            slug,
            kind
          )
        )
      )
    `)
    .eq('tag_id', tagId)

  if (ptErr) throw ptErr

  const validPosts = (postTags || [])
    .map((pt) => pt.posts)
    .filter(Boolean)

  if (validPosts.length === 0) return []

  const postIds = validPosts.map((p) => p.id)

  let userReactions = []
  if (currentUserId) {
    const { data: reactionsData } = await supabase
      .from('post_reactions')
      .select('post_id, kind')
      .eq('user_id', currentUserId)
      .in('post_id', postIds)
    userReactions = reactionsData || []
  }

  // Scoped count
  const { data: postReactionsData } = await supabase
    .from('post_reactions')
    .select('post_id, kind')
    .in('post_id', postIds)

  const reactionsCountMap = new Map()
  if (postReactionsData) {
    for (const r of postReactionsData) {
      const current = reactionsCountMap.get(r.post_id) || { likes: 0, saves: 0 }
      if (r.kind === 'like') current.likes++
      if (r.kind === 'save') current.saves++
      reactionsCountMap.set(r.post_id, current)
    }
  }

  return validPosts.map((p) => {
    const pReactions = userReactions.filter((r) => r.post_id === p.id)
    const counts = reactionsCountMap.get(p.id) || { likes: 0, saves: 0 }
    const tags = (p.post_tags || []).map((pt) => pt.tags).filter(Boolean)

    return {
      id: p.id,
      author_id: p.author_id,
      author: p.profiles,
      community: p.communities,
      body: p.body,
      media_url: p.media_url,
      media_credit: p.media_credit,
      source_url: p.source_url,
      is_editorial: p.is_editorial,
      created_at: p.created_at,
      tags,
      reactions: {
        likesCount: counts.likes,
        savesCount: counts.saves,
        isLiked: pReactions.some((r) => r.kind === 'like'),
        isSaved: pReactions.some((r) => r.kind === 'save'),
        isHidden: pReactions.some((r) => r.kind === 'hide'),
      },
    }
  })
}

/**
 * Fetch culture tag details with relations and user exploring state
 */
export async function fetchCultureTagBySlug(slug, currentUserId = null) {
  if (!slug) throw new Error('Tag slug is required.')

  const { data: baseTag, error: tagErr } = await supabase
    .from('tags')
    .select('id, slug, name, kind, description, parent_id')
    .eq('slug', slug)
    .single()

  if (tagErr || !baseTag) throw tagErr || new Error('Tag not found')

  let parent = null
  if (baseTag.parent_id) {
    const { data: parentData } = await supabase
      .from('tags')
      .select('id, name, slug, kind')
      .eq('id', baseTag.parent_id)
      .maybeSingle()
    parent = parentData
  }

  const { data: childData } = await supabase
    .from('tags')
    .select('id, name, slug, kind')
    .eq('parent_id', baseTag.id)

  const { data: edgesData } = await supabase
    .from('tag_edges')
    .select('dst, weight, tags!tag_edges_dst_fkey(id, name, slug, kind)')
    .eq('src', baseTag.id)
    .order('weight', { ascending: false })

  const { data: commTags } = await supabase
    .from('community_tags')
    .select('communities(id, name, slug)')
    .eq('tag_id', baseTag.id)

  let isExploring = false
  if (currentUserId) {
    const { data: interest } = await supabase
      .from('user_interests')
      .select('weight')
      .eq('user_id', currentUserId)
      .eq('tag_id', baseTag.id)
      .maybeSingle()
    isExploring = (interest?.weight ?? 0) > 0
  }

  const relatedTags = (edgesData || [])
    .map((e) => ({
      ...e.tags,
      weight: e.weight,
    }))
    .filter(Boolean)

  const linkedCommunities = (commTags || []).map((ct) => ct.communities).filter(Boolean)

  return {
    ...baseTag,
    parent,
    childTags: childData || [],
    relatedTags,
    linkedCommunities,
    isExploring,
  }
}

/**
 * Toggle user exploring interest in a tag
 */
export async function toggleUserInterest({ userId, tagId, shouldExplore }) {
  if (!userId || !tagId) throw new Error('User ID and Tag ID are required.')

  if (shouldExplore) {
    const { error } = await supabase
      .from('user_interests')
      .upsert(
        { user_id: userId, tag_id: tagId, weight: 5, source: 'culture_page' },
        { onConflict: 'user_id,tag_id' }
      )
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('user_interests')
      .delete()
      .eq('user_id', userId)
      .eq('tag_id', tagId)
    if (error) throw error
  }

  return { success: true }
}

