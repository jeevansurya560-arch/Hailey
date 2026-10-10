import { supabase } from '@/lib/supabase/client'

/**
 * Fetch profile by handle
 */
export async function fetchProfileByHandle(handle) {
  if (!handle) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('handle', handle)
    .maybeSingle()

  if (error) throw error
  return data
}

/**
 * Fetch profile by user ID
 */
export async function fetchProfileById(userId) {
  if (!userId) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

/**
 * Fetch user interests (tags with weights > 0)
 */
export async function fetchUserInterests(userId) {
  if (!userId) return []

  const { data, error } = await supabase
    .from('user_interests')
    .select('tag_id, weight, tags (id, name, slug, kind)')
    .eq('user_id', userId)
    .gt('weight', 0)
    .order('weight', { ascending: false })

  if (error) {
    console.warn('Failed to fetch user interests:', error.message)
    return []
  }

  return (data || []).map((d) => d.tags).filter(Boolean)
}

/**
 * Fetch user's community memberships
 */
export async function fetchUserMemberships(userId) {
  if (!userId) return []

  const { data, error } = await supabase
    .from('memberships')
    .select('role, communities (id, name, slug)')
    .eq('user_id', userId)

  if (error) {
    console.warn('Failed to fetch memberships:', error.message)
    return []
  }

  return (data || []).map((m) => ({ role: m.role, ...(m.communities || {}) }))
}

/**
 * Fetch user's verified contributions
 */
export async function fetchUserContributions(userId) {
  if (!userId) return []

  const { data, error } = await supabase
    .from('contributions')
    .select(`
      id,
      content_hash,
      status,
      tx_hash,
      created_at,
      communities (name, slug),
      collection_items (
        kind,
        url,
        note,
        posts (body)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.warn('Failed to fetch contributions:', error.message)
    return []
  }

  return data || []
}

/**
 * Update user profile
 */
export async function updateProfile(userId, updates) {
  if (!userId) throw new Error('User ID is required.')

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Save user interests in bulk
 */
export async function saveUserInterests({ userId, tagIds, weight = 5, source = 'onboarding' }) {
  if (!userId || !tagIds || tagIds.length === 0) {
    throw new Error('User ID and tag IDs are required.')
  }

  const rows = tagIds.map((tagId) => ({
    user_id: userId,
    tag_id: tagId,
    weight,
    source,
  }))

  const { error } = await supabase
    .from('user_interests')
    .upsert(rows, { onConflict: 'user_id,tag_id' })

  if (error) throw error
  return rows
}

/**
 * Fetch all posts published by a user
 */
export async function fetchUserPosts(userId) {
  if (!userId) return []

  const { data: posts, error } = await supabase
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
      profiles (
        id,
        handle,
        display_name,
        avatar_url,
        bio
      ),
      communities (
        slug,
        name
      ),
      post_tags (
        tags (id, name, slug, kind)
      )
    `)
    .eq('author_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.warn('Failed to fetch user posts:', error.message)
    return []
  }

  // Hydrate likes, comments, and shares counts
  const postIds = (posts || []).map((p) => p.id)
  if (postIds.length === 0) return []

  const [reactionsRes, commentsRes, sharesRes] = await Promise.all([
    supabase.from('post_reactions').select('post_id, kind').in('post_id', postIds),
    supabase.from('post_comments').select('post_id').in('post_id', postIds),
    supabase.from('post_shares').select('post_id').in('post_id', postIds),
  ])

  const countsMap = new Map()
  for (const id of postIds) {
    countsMap.set(id, { likesCount: 0, commentsCount: 0, sharesCount: 0 })
  }

  for (const r of reactionsRes.data || []) {
    if (r.kind === 'like') {
      const c = countsMap.get(r.post_id)
      if (c) c.likesCount++
    }
  }

  for (const c of commentsRes.data || []) {
    const item = countsMap.get(c.post_id)
    if (item) item.commentsCount++
  }

  for (const s of sharesRes.data || []) {
    const item = countsMap.get(s.post_id)
    if (item) item.sharesCount++
  }

  return (posts || []).map((p) => {
    const counts = countsMap.get(p.id) || { likesCount: 0, commentsCount: 0, sharesCount: 0 }
    return {
      ...p,
      author: p.profiles,
      community: p.communities,
      tags: (p.post_tags || []).map((pt) => pt.tags).filter(Boolean),
      reactions: {
        likesCount: counts.likesCount,
        commentsCount: counts.commentsCount,
        sharesCount: counts.sharesCount,
      },
    }
  })
}

/**
 * Fetch follow statistics for a user
 */
export async function fetchFollowStats(targetUserId, currentUserId = null) {
  if (!targetUserId) return { followersCount: 0, followingCount: 0, isFollowing: false }

  const [followersRes, followingRes, checkRes] = await Promise.all([
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', targetUserId),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', targetUserId),
    currentUserId
      ? supabase.from('follows').select('created_at').eq('follower_id', currentUserId).eq('following_id', targetUserId).maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  return {
    followersCount: followersRes.count || 0,
    followingCount: followingRes.count || 0,
    isFollowing: !!checkRes?.data,
  }
}

/**
 * Toggle follow/unfollow for a user
 */
export async function toggleFollow({ currentUserId, targetUserId, isCurrentlyFollowing }) {
  if (!currentUserId || !targetUserId) throw new Error('Both user IDs are required.')
  if (currentUserId === targetUserId) throw new Error('Cannot follow yourself.')

  if (isCurrentlyFollowing) {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', currentUserId)
      .eq('following_id', targetUserId)

    if (error) throw error
    return { isFollowing: false }
  } else {
    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: currentUserId,
        following_id: targetUserId,
      })

    if (error) throw error
    return { isFollowing: true }
  }
}
