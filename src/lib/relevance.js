/**
 * Deterministic integer hash of (userId + postId)
 * Returns true if hash % 10 === 0 (~10% of posts)
 */
export function shouldShowRelevancePrompt(userId, postId) {
  if (!userId || !postId) return false
  const combined = `${userId}:${postId}`
  let hash = 0
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined.charCodeAt(i)
    hash |= 0 // Convert to 32bit integer
  }
  return Math.abs(hash) % 10 === 0
}
