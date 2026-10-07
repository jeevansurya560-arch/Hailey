/**
 * Evaluates whether a relevance prompt should be rendered for a post.
 * Uses a deterministic hash of user and post IDs to show prompts on ~20% of impressions
 * without storing client-side prompt history.
 *
 * @param {string} userId - Current authenticated user UUID
 * @param {string} postId - Target post UUID
 * @returns {boolean} True if the prompt should be displayed
 */
export function shouldShowRelevancePrompt(userId, postId) {
  if (!userId || !postId) return false

  // Simple deterministic integer hash across userId + postId
  const seed = `${userId}:${postId}`
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0 // Convert to 32bit integer
  }

  // 20% sample rate (modulo 5 === 0)
  return Math.abs(hash) % 5 === 0
}
