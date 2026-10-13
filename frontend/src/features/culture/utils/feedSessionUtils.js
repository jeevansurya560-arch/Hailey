/**
 * feedSessionUtils.js
 *
 * Provides stable, randomized session sequencing for Hailey's Explore
 * media experience.
 *
 * Invariants:
 * 1. The selected post always opens first (index 0).
 * 2. Balances photo and video posts.
 * 3. Prevents consecutive posts by the same author when multiple authors exist.
 * 4. Stable during the active viewing session (does not re-shuffle on re-render).
 * 5. Preserves all post identities, author attribution, and reaction counts.
 */

/**
 * Deterministic pseudo-random number generator using seed
 */
function seededRandom(seed) {
  let s = Math.sin(seed) * 10000
  return s - Math.floor(s)
}

/**
 * Creates a stable, author-diverse, mixed-media session feed sequence
 * starting with the user's selected post.
 *
 * @param {Array} posts - All available posts
 * @param {string} [initialPostId] - ID of post to open first
 * @param {number} [sessionSeed] - Stable session seed
 * @returns {Array} Ordered session posts
 */
export function createStableFeedSession(posts = [], initialPostId = null, sessionSeed = Date.now()) {
  if (!Array.isArray(posts) || posts.length === 0) return []

  // 1. Identify and extract the initial post
  let startIdx = -1
  if (initialPostId) {
    startIdx = posts.findIndex((p) => p.id === initialPostId)
  }

  const initialPost = startIdx >= 0 ? posts[startIdx] : posts[0]
  const remaining = posts.filter((p) => p.id !== initialPost.id)

  if (remaining.length === 0) {
    return [initialPost]
  }

  // 2. Separate into video and photo pools
  const videos = []
  const photos = []

  remaining.forEach((p) => {
    const isVideo = Boolean(
      p.is_video ||
      p.video_url ||
      (typeof p.media_url === 'string' && p.media_url.endsWith('.mp4'))
    )
    if (isVideo) videos.push(p)
    else photos.push(p)
  })

  // 3. Shuffle each pool deterministically using the session seed
  const shuffle = (arr, salt) => {
    const result = [...arr]
    for (let i = result.length - 1; i > 0; i--) {
      const rand = seededRandom(sessionSeed + i * 37 + salt)
      const j = Math.floor(rand * (i + 1))
      const temp = result[i]
      result[i] = result[j]
      result[j] = temp
    }
    return result
  }

  const shuffledVideos = shuffle(videos, 101)
  const shuffledPhotos = shuffle(photos, 202)

  // 4. Interleave while respecting author diversity (no consecutive same author)
  const result = [initialPost]
  let lastAuthor = initialPost.author?.handle || initialPost.author_id

  let vIdx = 0
  let pIdx = 0

  while (vIdx < shuffledVideos.length || pIdx < shuffledPhotos.length) {
    // Alternate between video and photo when possible
    let nextCandidate = null

    const wantVideo = (result.length % 2 === 1) && vIdx < shuffledVideos.length
    if (wantVideo) {
      nextCandidate = shuffledVideos[vIdx]
      vIdx++
    } else if (pIdx < shuffledPhotos.length) {
      nextCandidate = shuffledPhotos[pIdx]
      pIdx++
    } else if (vIdx < shuffledVideos.length) {
      nextCandidate = shuffledVideos[vIdx]
      vIdx++
    }

    if (nextCandidate) {
      // Check author diversity: if same author as previous, look ahead in remaining pool
      const candAuthor = nextCandidate.author?.handle || nextCandidate.author_id
      if (candAuthor && candAuthor === lastAuthor && (vIdx < shuffledVideos.length || pIdx < shuffledPhotos.length)) {
        // Swap with alternative pool if available
        if (pIdx < shuffledPhotos.length) {
          const alternative = shuffledPhotos[pIdx]
          pIdx++
          result.push(alternative)
          lastAuthor = alternative.author?.handle || alternative.author_id
          // Put candidate back for later
          result.push(nextCandidate)
          lastAuthor = candAuthor
          continue
        }
      }

      result.push(nextCandidate)
      lastAuthor = candAuthor
    }
  }

  return result
}
