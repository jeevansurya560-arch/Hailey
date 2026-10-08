import { supabase } from '@/lib/supabase/client'

/**
 * Fetches real creator analytics and calculates metrics directly from stored database rows.
 * Returns empty: true when insufficient data exists.
 *
 * @param {string} userId The creator's UUID
 */
export async function fetchCreatorAnalytics(userId) {
  if (!userId) return { empty: true, reason: 'No user ID provided' }

  try {
    // 1. Fetch user's posts
    const { data: posts, error: postErr } = await supabase
      .from('posts')
      .select('id, body, created_at, media_url')
      .eq('author_id', userId)
      .order('created_at', { ascending: false })

    if (postErr || !posts || posts.length === 0) {
      return {
        empty: true,
        reason: 'Not enough data: no published cultural posts found.',
        totalPosts: 0,
        scatterPoints: [],
      }
    }

    const postIds = posts.map((p) => p.id)

    // 2. Fetch real reactions for these posts
    const { data: reactions } = await supabase
      .from('post_reactions')
      .select('post_id, kind')
      .in('post_id', postIds)

    // 3. Fetch real impressions for these posts
    const { data: impressions } = await supabase
      .from('impressions')
      .select('post_id')
      .in('post_id', postIds)

    // 4. Fetch onchain verified contributions
    const { data: contributions } = await supabase
      .from('contributions')
      .select('id, status')
      .eq('user_id', userId)

    // Compute metrics
    const impressionCountByPost = new Map()
    if (impressions) {
      for (const imp of impressions) {
        impressionCountByPost.set(imp.post_id, (impressionCountByPost.get(imp.post_id) || 0) + 1)
      }
    }

    const reactionCountByPost = new Map()
    if (reactions) {
      for (const rx of reactions) {
        reactionCountByPost.set(rx.post_id, (reactionCountByPost.get(rx.post_id) || 0) + 1)
      }
    }

    let totalReach = 0
    let totalEngagements = 0

    const scatterPoints = posts.map((post) => {
      // Natural baseline: each post has at least 1 author impression
      const reach = impressionCountByPost.get(post.id) || 1
      const engagements = reactionCountByPost.get(post.id) || 0
      const engagementRate = parseFloat(((engagements / reach) * 100).toFixed(2))

      totalReach += reach
      totalEngagements += engagements

      return {
        id: post.id,
        title: post.body.slice(0, 40) + '...',
        reach,
        engagements,
        engagementRate,
        createdAt: post.created_at,
      }
    })

    const avgEngagementRate =
      totalReach > 0 ? parseFloat(((totalEngagements / totalReach) * 100).toFixed(2)) : 0
    const verifiedContributions =
      contributions?.filter((c) => c.status === 'attested').length || 0

    return {
      empty: false,
      totalPosts: posts.length,
      totalReach,
      totalEngagements,
      avgEngagementRate,
      verifiedContributions,
      scatterPoints,
    }
  } catch (err) {
    console.error('[analyticsService] Error fetching creator metrics:', err)
    return {
      empty: true,
      reason: 'Error retrieving metrics from data store: ' + (err instanceof Error ? err.message : String(err)),
      scatterPoints: [],
    }
  }
}
