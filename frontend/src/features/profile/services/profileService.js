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

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

/**
 * Validates an avatar file's MIME type and file size.
 */
export function validateAvatarFile(file) {
  if (!file) {
    throw new Error('Please select an image file to upload.')
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Invalid file format. Please upload a JPEG, PNG, or WebP image.')
  }
  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    throw new Error('Image exceeds 5 MB limit. Please select a smaller image.')
  }
  return true
}

/**
 * Validates a public handle against Hailey's format rules.
 */
export function validateHandle(handle) {
  if (!handle || typeof handle !== 'string') {
    throw new Error('Handle is required.')
  }
  const normalized = handle.toLowerCase().trim().replace(/^@/, '')
  if (normalized.length < 3 || normalized.length > 20) {
    throw new Error('Handle must be between 3 and 20 characters.')
  }
  if (!/^[a-z0-9_]{3,20}$/.test(normalized)) {
    throw new Error('Handle can only contain lowercase letters, numbers, and underscores.')
  }
  return normalized
}

/**
 * Checks if a handle is available in profiles, excluding current user.
 */
export async function checkHandleAvailability(handle, currentUserId = null) {
  try {
    const normalized = validateHandle(handle)
    let query = supabase.from('profiles').select('id').eq('handle', normalized)
    if (currentUserId) {
      query = query.neq('id', currentUserId)
    }
    const { data, error } = await query.maybeSingle()
    if (error) {
      console.warn('[checkHandleAvailability] Warning:', error.message)
      return { available: true, normalized }
    }
    return { available: !data, normalized }
  } catch (err) {
    return { available: false, error: err.message }
  }
}

/**
 * Uploads an avatar image to Supabase Storage in user-scoped path.
 */
export async function uploadAvatar(file, userId) {
  if (!userId) throw new Error('User ID is required to upload avatar.')
  validateAvatarFile(file)

  const ext = file.name?.split('.').pop()?.toLowerCase() || 'jpg'
  const safeFilename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`
  const filePath = `${userId}/${safeFilename}`

  try {
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
      })

    if (uploadError) {
      if (
        uploadError.statusCode === '404' ||
        uploadError.message?.includes('Bucket not found') ||
        uploadError.code === 'NoSuchBucket'
      ) {
        throw new Error(
          "Storage bucket 'avatars' is not configured yet. Please run migration 0017 or create the 'avatars' public bucket in Supabase."
        )
      }
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    return urlData.publicUrl
  } catch (err) {
    console.error('[uploadAvatar] Error:', err)
    throw err
  }
}

/**
 * Deletes an avatar image from Supabase Storage if it belongs to the user.
 */
export async function deleteAvatar(avatarUrl, userId) {
  if (!avatarUrl || !userId) return
  try {
    if (avatarUrl.includes('/avatars/')) {
      const parts = avatarUrl.split('/avatars/')
      if (parts[1]) {
        const filePath = decodeURIComponent(parts[1].split('?')[0])
        if (filePath.startsWith(`${userId}/`)) {
          await supabase.storage.from('avatars').remove([filePath])
        }
      }
    }
  } catch (err) {
    console.warn('[deleteAvatar] Cleanup notice:', err.message)
  }
}

/**
 * Update user profile
 */
export async function updateProfile(userId, updates) {
  if (!userId) throw new Error('User ID is required.')

  const {
    display_name,
    handle,
    bio,
    location,
    website,
    avatar_url,
    roles,
    cultural_interests,
  } = updates

  let normalizedHandle = undefined
  if (handle !== undefined) {
    normalizedHandle = validateHandle(handle)
    const { available, error: handleErr } = await checkHandleAvailability(normalizedHandle, userId)
    if (!available) {
      throw new Error(handleErr || `Handle @${normalizedHandle} is already claimed by another user.`)
    }
  }

  const payload = {}
  if (display_name !== undefined) payload.display_name = display_name ? display_name.trim() : null
  if (normalizedHandle !== undefined) payload.handle = normalizedHandle
  if (bio !== undefined) payload.bio = bio ? bio.trim() : null
  if (location !== undefined) payload.location = location ? location.trim() : null
  if (website !== undefined) payload.website = website ? website.trim() : null
  if (avatar_url !== undefined) payload.avatar_url = avatar_url ? avatar_url.trim() : null
  if (roles !== undefined) payload.roles = Array.isArray(roles) ? roles : []
  if (cultural_interests !== undefined) payload.cultural_interests = Array.isArray(cultural_interests) ? cultural_interests : []

  // Attempt DB update with roles and cultural_interests
  let result = null
  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    // If error is code 42703 (undefined column: roles or cultural_interests), retry without them
    if (error.code === '42703' || error.message?.includes('roles') || error.message?.includes('cultural_interests')) {
      delete payload.roles
      delete payload.cultural_interests
      const retry = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', userId)
        .select()
        .single()

      if (retry.error) {
        if (retry.error.code === '23505' && retry.error.message?.includes('handle')) {
          throw new Error(`Handle @${normalizedHandle} is already taken.`)
        }
        throw retry.error
      }
      result = retry.data
    } else if (error.code === '23505' && error.message?.includes('handle')) {
      throw new Error(`Handle @${normalizedHandle} is already taken.`)
    } else {
      throw error
    }
  } else {
    result = data
  }

  // Synchronize Auth User metadata so session listener has up-to-date handle, avatar_url, roles, etc.
  try {
    const authMeta = {}
    if (normalizedHandle !== undefined) authMeta.handle = normalizedHandle
    if (display_name !== undefined) {
      authMeta.full_name = display_name
      authMeta.name = display_name
    }
    if (avatar_url !== undefined) authMeta.avatar_url = avatar_url
    if (roles !== undefined) authMeta.roles = roles
    if (cultural_interests !== undefined) authMeta.cultural_interests = cultural_interests

    await supabase.auth.updateUser({ data: authMeta })
  } catch (authErr) {
    console.warn('[updateProfile] Auth metadata sync notice:', authErr.message)
  }

  if (result) {
    if (roles !== undefined) result.roles = roles
    if (cultural_interests !== undefined) result.cultural_interests = cultural_interests
  }

  return result
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
      profiles!author_id (
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

/**
 * Ensure a user profile exists, auto-upserting if not present
 */
export async function ensureUserProfile(user) {
  if (!user?.id) return null

  let profile = await fetchProfileById(user.id)
  if (!profile) {
    const rawHandle =
      user.user_metadata?.handle ||
      user.user_metadata?.user_name ||
      user.email?.split('@')[0]?.replace(/[^a-zA-Z0-9_]/g, '_') ||
      `user_${user.id.slice(0, 8)}`
    const displayName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      rawHandle

    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          handle: rawHandle,
          display_name: displayName,
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        },
        { onConflict: 'id' }
      )
      .select()
      .maybeSingle()

    if (!error && data) {
      profile = data
    }
  }

  return profile
}

/**
 * Fetch all posts saved (bookmarked) by a user
 */
export async function fetchUserSavedPosts(userId) {
  if (!userId) return []

  const { data: saves, error } = await supabase
    .from('post_reactions')
    .select(`
      post_id,
      created_at,
      posts (
        id,
        author_id,
        body,
        media_url,
        media_credit,
        source_url,
        is_editorial,
        created_at,
        profiles!author_id (
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
      )
    `)
    .eq('user_id', userId)
    .eq('kind', 'save')
    .order('created_at', { ascending: false })

  if (error) {
    console.warn('Failed to fetch user saved posts:', error.message)
    return []
  }

  const posts = (saves || []).map((s) => s.posts).filter(Boolean)
  const postIds = posts.map((p) => p.id)
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

  return posts.map((p) => {
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
        isSaved: true,
      },
    }
  })
}

