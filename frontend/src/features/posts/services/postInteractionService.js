import { supabase } from '@/lib/supabase/client'

/**
 * Fetch all comments for a post, with author profile info
 */
export async function fetchPostComments(postId) {
  if (!postId) return []

  const { data, error } = await supabase
    .from('post_comments')
    .select(`
      id,
      post_id,
      author_id,
      body,
      created_at,
      profiles (
        id,
        handle,
        display_name,
        avatar_url
      )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) {
    console.warn('Failed to fetch post comments:', error.message)
    return []
  }

  return (data || []).map((c) => ({
    ...c,
    author: c.profiles || { handle: 'member', display_name: 'Member' },
  }))
}

/**
 * Post a comment on a dispatch
 */
export async function addPostComment({ postId, authorId, body }) {
  if (!postId || !authorId || !body?.trim()) {
    throw new Error('Post ID, author ID, and comment text are required.')
  }

  const { data, error } = await supabase
    .from('post_comments')
    .insert({
      post_id: postId,
      author_id: authorId,
      body: body.trim(),
    })
    .select(`
      id,
      post_id,
      author_id,
      body,
      created_at,
      profiles (
        id,
        handle,
        display_name,
        avatar_url
      )
    `)
    .single()

  if (error) throw new Error(`Failed to post comment: ${error.message}`)

  return {
    ...data,
    author: data.profiles || { handle: 'member', display_name: 'Member' },
  }
}

/**
 * Delete a comment by its author
 */
export async function deletePostComment({ commentId, authorId }) {
  if (!commentId || !authorId) {
    throw new Error('Comment ID and Author ID are required.')
  }

  const { error } = await supabase
    .from('post_comments')
    .delete()
    .eq('id', commentId)
    .eq('author_id', authorId)

  if (error) throw new Error(`Failed to delete comment: ${error.message}`)
  return { success: true }
}

/**
 * Record a share event for a post
 */
export async function recordPostShare({ postId, userId = null, platform = 'link' }) {
  if (!postId) return null

  const { error } = await supabase
    .from('post_shares')
    .insert({
      post_id: postId,
      user_id: userId || null,
      platform,
    })

  if (error) {
    console.warn('Failed to record post share:', error.message)
    return null
  }

  return { success: true }
}

/**
 * Fetch counts for likes, comments, and shares on a post
 */
export async function fetchPostSocialCounts(postId) {
  if (!postId) return { likesCount: 0, commentsCount: 0, sharesCount: 0 }

  const [likesRes, commentsRes, sharesRes] = await Promise.all([
    supabase
      .from('post_reactions')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)
      .eq('kind', 'like'),
    supabase
      .from('post_comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId),
    supabase
      .from('post_shares')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId),
  ])

  return {
    likesCount: likesRes.count || 0,
    commentsCount: commentsRes.count || 0,
    sharesCount: sharesRes.count || 0,
  }
}
