import { supabase } from '@/lib/supabase/client'
import {
  isDemoContentEnabled,
  DEMONSTRATION_DISPATCHES,
  DEMONSTRATION_AUTHORS,
  isDemoPostId,
  getDemoPostById,
} from '@/features/culture/data/demonstrationDispatches'

/**
 * Fetch personalized feed using database RPC
 */
export async function fetchPersonalizedFeed({ userId = null, limit = 15, offset = 0 } = {}) {
  const { data, error } = await supabase.rpc('get_feed', {
    p_user_id: userId,
    p_limit: limit,
    p_offset: offset,
  })

  if (error) {
    throw new Error(`Feed fetch failed: ${error.message}`)
  }

  return data || []
}

/**
 * Fetch explore feed using database RPC
 */
export async function fetchExploreFeed({ userId = null, limit = 15, offset = 0 } = {}) {
  const { data, error } = await supabase.rpc('get_explore', {
    p_user_id: userId,
    p_limit: limit,
    p_offset: offset,
  })

  if (error) {
    throw new Error(`Explore feed fetch failed: ${error.message}`)
  }

  return data || []
}

/**
 * Toggle a reaction (like/save) on a post
 */
export async function togglePostReaction({ userId, postId, kind, isCurrentlyActive }) {
  if (!userId || !postId) {
    throw new Error('User ID and Post ID are required for reactions.')
  }

  if (isCurrentlyActive) {
    const { error } = await supabase
      .from('post_reactions')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId)
      .eq('kind', kind)

    if (error) throw new Error(`Failed to remove reaction: ${error.message}`)
    return { active: false }
  } else {
    const { error } = await supabase
      .from('post_reactions')
      .insert({ post_id: postId, user_id: userId, kind })

    if (error) throw new Error(`Failed to add reaction: ${error.message}`)
    return { active: true }
  }
}

/**
 * Submit feedback on a feed item (e.g. relevance feedback)
 */
export async function submitFeedFeedback({ userId, postId, kind, score = 0 }) {
  if (!userId || !postId) {
    throw new Error('User ID and Post ID are required for feedback.')
  }

  const { error } = await supabase
    .from('feed_feedback')
    .upsert(
      {
        user_id: userId,
        post_id: postId,
        feedback_kind: kind,
        score,
      },
      { onConflict: 'user_id,post_id' }
    )

  if (error) throw new Error(`Feedback submission failed: ${error.message}`)
  return { success: true }
}

/**
 * Log viewing impression for telemetry and relevance feedback
 */
export async function logFeedImpression({ userId, postId, durationMs }) {
  if (!postId) return null

  const { error } = await supabase
    .from('feed_impressions')
    .insert({
      user_id: userId || null,
      post_id: postId,
      duration_ms: durationMs,
    })

  if (error) {
    // Non-blocking telemetry error
    console.warn('Impression logging failed:', error.message)
    return null
  }

  return { success: true }
}

export async function deletePost({ postId }) {
  if (!postId) throw new Error('Post ID is required.')

  const { error } = await supabase.from('posts').delete().eq('id', postId)
  if (error) throw new Error(`Failed to delete post: ${error.message}`)

  return { success: true }
}

/**
 * Hide a post for a user
 */
export async function hidePost({ userId, postId }) {
  if (!userId || !postId) throw new Error('User ID and Post ID are required.')

  const { error } = await supabase
    .from('post_reactions')
    .insert({ user_id: userId, post_id: postId, kind: 'hide' })

  if (error) throw new Error(`Failed to hide post: ${error.message}`)
  return { success: true }
}

/**
 * Record batched impressions for feed tracking
 */
export async function recordBatchImpressions(userId, postIds) {
  if (!userId || !postIds || postIds.length === 0) return

  const rows = postIds.map((postId) => ({
    user_id: userId,
    post_id: postId,
  }))

  const { error } = await supabase
    .from('impressions')
    .upsert(rows, { onConflict: 'user_id,post_id' })

  if (error) {
    // Non-blocking telemetry
    console.warn('Batch impression recording failed:', error.message)
  }
}

/**
 * Submit binary/choice relevance feedback
 */
export async function submitRelevanceAnswer({ userId, postId, answer }) {
  if (!userId || !postId || !answer) {
    throw new Error('User ID, Post ID, and Answer are required.')
  }

  const { error } = await supabase
    .from('feedback')
    .upsert(
      { user_id: userId, post_id: postId, answer },
      { onConflict: 'user_id,post_id' }
    )

  if (error) throw new Error(`Failed to record feedback: ${error.message}`)
  return { success: true }
}

/**
 * Create a new post and associate tags
 */
export async function createPost({
  authorId,
  body,
  communityId = null,
  mediaUrl = null,
  mediaCredit = null,
  sourceUrl = null,
  tagIds = [],
}) {
  if (!authorId || !body) {
    throw new Error('Author ID and body text are required.')
  }

  // 1. Insert into posts
  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({
      author_id: authorId,
      body,
      community_id: communityId || null,
      media_url: mediaUrl || null,
      media_credit: mediaCredit || null,
      source_url: sourceUrl || null,
      is_editorial: false,
      status: 'published',
    })
    .select('id')
    .single()

  if (postError || !post) throw postError || new Error('Failed to create post.')

  // 2. Insert into post_tags
  if (tagIds.length > 0) {
    const postTagRows = tagIds.map((tagId) => ({
      post_id: post.id,
      tag_id: tagId,
      weight: 1.0,
    }))

    const { error: tagError } = await supabase.from('post_tags').insert(postTagRows)
    if (tagError) throw tagError
  }

  return post
}

/**
 * Fetch a single post by ID with reactions and author
 */
export async function fetchPostById({ postId, currentUserId = null }) {
  if (!postId) throw new Error('Post ID is required.')

  const demoItem = getDemoPostById(postId)

  let p = null
  const { data, error } = await supabase
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
      status,
      profiles!author_id(id, handle, display_name, avatar_url, bio),
      communities(slug, name),
      post_tags(tags(id, name, slug, kind))
    `)
    .eq('id', postId)
    .maybeSingle()

  if (data) {
    p = data
  } else if (demoItem) {
    p = demoItem
  } else {
    throw error || new Error('Post not found.')
  }

  let userReactions = []
  if (currentUserId && p.id) {
    const { data: reactionsData } = await supabase
      .from('post_reactions')
      .select('post_id, kind')
      .eq('user_id', currentUserId)
      .eq('post_id', p.id)
    userReactions = reactionsData || []
  }

  let likesCount = demoItem ? demoItem.reactions.likesCount : 0
  let savesCount = demoItem ? demoItem.reactions.savesCount : 0
  let commentsCount = demoItem ? demoItem.reactions.commentsCount : 0
  let sharesCount = demoItem ? demoItem.reactions.sharesCount : 0

  if (p.id) {
    const [allReactionsRes, commentsCountRes, sharesCountRes] = await Promise.all([
      supabase.from('post_reactions').select('post_id, kind').eq('post_id', p.id),
      supabase.from('post_comments').select('*', { count: 'exact', head: true }).eq('post_id', p.id),
      supabase.from('post_shares').select('*', { count: 'exact', head: true }).eq('post_id', p.id),
    ])

    if (allReactionsRes.data && allReactionsRes.data.length > 0) {
      let lCount = 0
      let sCount = 0
      for (const r of allReactionsRes.data) {
        if (r.kind === 'like') lCount++
        if (r.kind === 'save') sCount++
      }
      likesCount = lCount
      savesCount = sCount
    }
    if (commentsCountRes?.count !== undefined && commentsCountRes.count !== null) {
      commentsCount = commentsCountRes.count
    }
    if (sharesCountRes?.count !== undefined && sharesCountRes.count !== null) {
      sharesCount = sharesCountRes.count
    }
  }

  const tags = (p.post_tags || []).map((pt) => pt.tags).filter(Boolean)
  const isSeed = isDemoPostId(p.id) || (p.is_editorial === true && (p.author_id === 'fdd83264-e15c-4b05-8f75-68bbd577df3c' || !p.profiles))
  const resolvedAuthor = isSeed && demoItem ? demoItem.author : (p.profiles || {
    id: p.author_id,
    handle: `user_${p.author_id?.slice(0, 8)}`,
    display_name: 'Hailey Member',
    avatar_url: null,
  })

  return {
    id: p.id,
    author_id: isSeed && demoItem ? demoItem.author_id : p.author_id,
    author: resolvedAuthor,
    community: p.communities || demoItem?.community,
    body: p.body,
    media_url: p.media_url,
    media_credit: p.media_credit,
    source_url: p.source_url,
    is_editorial: isSeed,
    is_demo: isSeed,
    created_at: p.created_at,
    tags: tags.length > 0 ? tags : (demoItem?.tags || []),
    reactions: {
      likesCount,
      savesCount,
      commentsCount,
      sharesCount,
      isLiked: userReactions.some((r) => r.kind === 'like'),
      isSaved: userReactions.some((r) => r.kind === 'save'),
      isHidden: userReactions.some((r) => r.kind === 'hide'),
    },
  }
}

/**
 * Fetch count of user interests with positive weight
 */
export async function fetchUserInterestsCount(userId) {
  if (!userId) return 0
  const { count, error } = await supabase
    .from('user_interests')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gt('weight', 0)

  if (error) {
    console.warn('Failed to fetch user interest count:', error.message)
    return 0
  }

  return count ?? 0
}

/**
 * Fetch unified personalized or fallback feed stream
 */
export async function fetchFeedStream({ user, userInterestsCount, page, pageSize = 15 }) {
  const limit = (page + 1) * pageSize

  // If user is signed in and has positive weights, call get_feed RPC
  if (user && userInterestsCount > 0) {
    const { data: rpcFeed, error: rpcErr } = await supabase.rpc('get_feed', {
      p_limit: limit,
      p_offset: 0,
    })

    const { data: rpcExplore } = await supabase.rpc('get_explore', {
      p_limit: Math.max(3, Math.floor(limit / 5)),
    })

    if (!rpcErr && rpcFeed && rpcFeed.length > 0) {
      const exploreList = rpcExplore || []
      let exploreIdx = 0

      const orderedFeedItems = []
      for (let i = 0; i < rpcFeed.length; i++) {
        orderedFeedItems.push({
          post_id: rpcFeed[i].post_id,
          score: rpcFeed[i].score,
          why: rpcFeed[i].why,
          isExplore: false,
        })

        if ((i + 1) % 4 === 0 && exploreIdx < exploreList.length) {
          orderedFeedItems.push({
            post_id: exploreList[exploreIdx].post_id,
            score: exploreList[exploreIdx].score,
            why: exploreList[exploreIdx].why,
            isExplore: true,
          })
          exploreIdx++
        }
      }

      const postIds = orderedFeedItems.map((item) => item.post_id)

      const { data: fullPosts, error: postErr } = await supabase
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
          profiles!author_id(id, handle, display_name, avatar_url, bio),
          communities(slug, name),
          post_tags(tags(id, name, slug, kind))
        `)
        .in('id', postIds)

      if (!postErr && fullPosts) {
        const postsMap = new Map(fullPosts.map((p) => [p.id, p]))

        const [userReactionsRes, allReactionsRes, commentsRes, sharesRes] = await Promise.all([
          supabase.from('post_reactions').select('post_id, kind').eq('user_id', user.id),
          supabase.from('post_reactions').select('post_id, kind').in('post_id', postIds),
          supabase.from('post_comments').select('post_id').in('post_id', postIds),
          supabase.from('post_shares').select('post_id').in('post_id', postIds),
        ])

        const userReactions = userReactionsRes.data || []
        const countsMap = new Map()
        for (const id of postIds) {
          countsMap.set(id, { likes: 0, saves: 0, comments: 0, shares: 0 })
        }

        for (const r of allReactionsRes.data || []) {
          const item = countsMap.get(r.post_id)
          if (item) {
            if (r.kind === 'like') item.likes++
            if (r.kind === 'save') item.saves++
          }
        }

        for (const c of commentsRes.data || []) {
          const item = countsMap.get(c.post_id)
          if (item) item.comments++
        }

        for (const s of sharesRes.data || []) {
          const item = countsMap.get(s.post_id)
          if (item) item.shares++
        }

        const hiddenPostIds = new Set(
          userReactions.filter((r) => r.kind === 'hide').map((r) => r.post_id)
        )

        const resultList = []
        for (const feedItem of orderedFeedItems) {
          if (hiddenPostIds.has(feedItem.post_id)) continue
          const p = postsMap.get(feedItem.post_id)
          if (!p) continue

          const pReactions = userReactions.filter((r) => r.post_id === p.id)
          const counts = countsMap.get(p.id) || { likes: 0, saves: 0, comments: 0, shares: 0 }
          const tags = (p.post_tags || []).map((pt) => pt.tags).filter(Boolean)

          resultList.push({
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
            why: feedItem.why,
            score: feedItem.score,
            isExplore: feedItem.isExplore,
            reactions: {
              likesCount: counts.likes,
              savesCount: counts.saves,
              commentsCount: counts.comments,
              sharesCount: counts.shares,
              isLiked: pReactions.some((r) => r.kind === 'like'),
              isSaved: pReactions.some((r) => r.kind === 'save'),
              isHidden: false,
            },
          })
        }

        return { items: resultList, hasPersonalization: true, hasMore: rpcFeed.length >= limit }
      }
    }
  }

  // Fallback: newest posts
  const { data: postsData } = await supabase
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
      profiles!author_id(id, handle, display_name, avatar_url, bio),
      communities(slug, name),
      post_tags(tags(id, name, slug, kind))
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  const fallbackPostIds = (postsData || []).map((p) => p.id)
  let fallbackUserReactions = []
  let fallbackAllReactions = []
  let fallbackComments = []
  let fallbackShares = []

  if (fallbackPostIds.length > 0) {
    const promises = [
      supabase.from('post_reactions').select('post_id, kind').in('post_id', fallbackPostIds),
      supabase.from('post_comments').select('post_id').in('post_id', fallbackPostIds),
      supabase.from('post_shares').select('post_id').in('post_id', fallbackPostIds),
    ]

    if (user?.id) {
      promises.push(
        supabase.from('post_reactions').select('post_id, kind').eq('user_id', user.id).in('post_id', fallbackPostIds)
      )
    }

    const [allR, allC, allS, userR] = await Promise.all(promises)
    fallbackAllReactions = allR.data || []
    fallbackComments = allC.data || []
    fallbackShares = allS.data || []
    fallbackUserReactions = userR?.data || []
  }

  const fallbackCountsMap = new Map()
  for (const id of fallbackPostIds) {
    fallbackCountsMap.set(id, { likes: 0, saves: 0, comments: 0, shares: 0 })
  }

  for (const r of fallbackAllReactions) {
    const item = fallbackCountsMap.get(r.post_id)
    if (item) {
      if (r.kind === 'like') item.likes++
      if (r.kind === 'save') item.saves++
    }
  }

  for (const c of fallbackComments) {
    const item = fallbackCountsMap.get(c.post_id)
    if (item) item.comments++
  }

  for (const s of fallbackShares) {
    const item = fallbackCountsMap.get(s.post_id)
    if (item) item.shares++
  }

  const fallbackList = (postsData || []).map((p) => {
    const tags = (p.post_tags || []).map((pt) => pt.tags).filter(Boolean)
    const counts = fallbackCountsMap.get(p.id) || { likes: 0, saves: 0, comments: 0, shares: 0 }
    const pReactions = fallbackUserReactions.filter((r) => r.post_id === p.id)

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
      why: tags.length > 0 ? [tags[0].name] : ['Culture'],
      isExplore: false,
      reactions: {
        likesCount: counts.likes,
        savesCount: counts.saves,
        commentsCount: counts.comments,
        sharesCount: counts.shares,
        isLiked: pReactions.some((r) => r.kind === 'like'),
        isSaved: pReactions.some((r) => r.kind === 'save'),
        isHidden: false,
      },
    }
  })

  return { items: fallbackList, hasPersonalization: false, hasMore: (postsData || []).length >= limit }
}

/**
 * Fetch live explore dispatches with filtering, sorting, pagination, and reaction hydration.
 * Unifies demonstration posts (authored by diverse fictional ethnographers) with real community posts
 * (authored by registered authenticated users).
 */
export async function fetchExploreDispatches({
  query = '',
  communitySlug = '',
  orderBy = 'newest',
  page = 0,
  pageSize = 36,
  userId = null,
} = {}) {
  const demoEnabled = isDemoContentEnabled()

  // 1. Fetch published posts from Supabase database
  let dbReq = supabase
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
      status,
      profiles!author_id (
        id,
        handle,
        display_name,
        avatar_url,
        bio
      ),
      communities (slug, name),
      post_tags (
        tags (id, name, slug, kind)
      )
    `)
    .eq('status', 'published')

  const { data: postsData, error } = await dbReq

  if (error) {
    console.warn('Supabase explore query notice:', error.message)
  }

  const rawPosts = postsData || []
  const postIds = rawPosts.map((p) => p.id)

  // 2. Hydrate reactions for all retrieved database posts
  let countsMap = new Map()
  let userReactions = []

  if (postIds.length > 0) {
    const promises = [
      supabase.from('post_reactions').select('post_id, kind').in('post_id', postIds),
      supabase.from('post_comments').select('post_id').in('post_id', postIds),
      supabase.from('post_shares').select('post_id').in('post_id', postIds),
    ]

    if (userId) {
      promises.push(
        supabase
          .from('post_reactions')
          .select('post_id, kind')
          .eq('user_id', userId)
          .in('post_id', postIds)
      )
    }

    const [reactionsRes, commentsRes, sharesRes, userReactionsRes] = await Promise.all(promises)

    for (const id of postIds) {
      countsMap.set(id, { likes: 0, saves: 0, comments: 0, shares: 0 })
    }

    for (const r of reactionsRes?.data || []) {
      const item = countsMap.get(r.post_id)
      if (item) {
        if (r.kind === 'like') item.likes++
        if (r.kind === 'save') item.saves++
      }
    }

    for (const c of commentsRes?.data || []) {
      const item = countsMap.get(c.post_id)
      if (item) item.comments++
    }

    for (const s of sharesRes?.data || []) {
      const item = countsMap.get(s.post_id)
      if (item) item.shares++
    }

    userReactions = userReactionsRes?.data || []
  }

  // 3. Process database posts: separate real community posts from seed/demo posts
  const processedDbPosts = rawPosts
    .map((p) => {
      const isSeed =
        isDemoPostId(p.id) ||
        (p.is_editorial === true &&
          (p.author_id === 'fdd83264-e15c-4b05-8f75-68bbd577df3c' || !p.profiles))

      if (isSeed) {
        if (!demoEnabled) return null // Drop demo posts when demo content is toggled off!
        const demoItem = getDemoPostById(p.id)
        const author = demoItem
          ? demoItem.author
          : p.profiles || DEMONSTRATION_AUTHORS.jeevan_surya
        const tags = (p.post_tags || []).map((pt) => pt.tags).filter(Boolean)
        const counts = countsMap.get(p.id) || { likes: 42, saves: 5, comments: 8, shares: 3 }
        const pReactions = userReactions.filter((r) => r.post_id === p.id)

        return {
          id: p.id,
          author_id: demoItem ? demoItem.author_id : p.author_id,
          author,
          community: p.communities || demoItem?.community,
          body: p.body,
          media_url: p.media_url,
          video_url: demoItem?.video_url || (p.media_url?.endsWith('.mp4') ? p.media_url : null),
          is_video: Boolean(demoItem?.is_video || p.media_url?.endsWith('.mp4')),
          media_credit: p.media_credit,
          source_url: p.source_url,
          is_editorial: true,
          is_demo: true,
          created_at: p.created_at,
          tags: tags.length > 0 ? tags : demoItem?.tags || [],
          reactions: {
            likesCount: counts.likes,
            savesCount: counts.saves,
            commentsCount: counts.comments,
            sharesCount: counts.shares,
            isLiked: pReactions.some((r) => r.kind === 'like'),
            isSaved: pReactions.some((r) => r.kind === 'save'),
            isHidden: false,
          },
        }
      } else {
        // Genuine authenticated user's post!
        const userProfile = p.profiles || {
          id: p.author_id,
          handle: `user_${p.author_id?.slice(0, 8)}`,
          display_name: 'Community Member',
          avatar_url: null,
        }
        const tags = (p.post_tags || []).map((pt) => pt.tags).filter(Boolean)
        const counts = countsMap.get(p.id) || { likes: 0, saves: 0, comments: 0, shares: 0 }
        const pReactions = userReactions.filter((r) => r.post_id === p.id)

        return {
          id: p.id,
          author_id: p.author_id,
          author: userProfile,
          community: p.communities,
          body: p.body,
          media_url: p.media_url,
          video_url: p.media_url?.endsWith('.mp4') ? p.media_url : null,
          is_video: Boolean(p.media_url?.endsWith('.mp4')),
          media_credit: p.media_credit,
          source_url: p.source_url,
          is_editorial: false,
          is_demo: false,
          created_at: p.created_at,
          tags,
          reactions: {
            likesCount: counts.likes,
            savesCount: counts.saves,
            commentsCount: counts.comments,
            sharesCount: counts.shares,
            isLiked: pReactions.some((r) => r.kind === 'like'),
            isSaved: pReactions.some((r) => r.kind === 'save'),
            isHidden: false,
          },
        }
      }
    })
    .filter(Boolean)

  // 4. If demo content is enabled and database had no demo posts (e.g. offline/isolated environment),
  // supplement with in-memory DEMONSTRATION_DISPATCHES
  let combinedPosts = [...processedDbPosts]
  const hasDemoInDb = processedDbPosts.some((p) => p.is_demo)

  if (demoEnabled && !hasDemoInDb) {
    combinedPosts = [...combinedPosts, ...DEMONSTRATION_DISPATCHES]
  }

  // 5. Apply filters across both sources
  let filteredPosts = combinedPosts

  // Community / Culture filter
  if (communitySlug) {
    filteredPosts = filteredPosts.filter((p) => {
      return p.community?.slug === communitySlug
    })
  }

  // Text search filter
  if (query && query.trim()) {
    const q = query.trim().toLowerCase()
    filteredPosts = filteredPosts.filter((p) => {
      const matchBody = p.body?.toLowerCase().includes(q)
      const matchAuthor =
        p.author?.display_name?.toLowerCase().includes(q) ||
        p.author?.handle?.toLowerCase().includes(q)
      const matchTags = p.tags?.some((t) => t.name?.toLowerCase().includes(q))
      return matchBody || matchAuthor || matchTags
    })
  }

  // 6. Sorting
  if (orderBy === 'oldest') {
    filteredPosts.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
  } else if (orderBy === 'most_liked') {
    filteredPosts.sort((a, b) => (b.reactions?.likesCount || 0) - (a.reactions?.likesCount || 0))
  } else if (orderBy === 'most_discussed') {
    filteredPosts.sort(
      (a, b) => (b.reactions?.commentsCount || 0) - (a.reactions?.commentsCount || 0)
    )
  } else {
    // Default: newest first (real newly published posts appear at the top!)
    filteredPosts.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }

  // 7. Pagination
  const from = page * pageSize
  const to = from + pageSize
  const pagedPosts = filteredPosts.slice(from, to)

  return {
    posts: pagedPosts,
    total: filteredPosts.length,
    hasMore: to < filteredPosts.length,
  }
}

