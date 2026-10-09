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
