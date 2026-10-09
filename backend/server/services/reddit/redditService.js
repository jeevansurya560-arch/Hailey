/**
 * Server-Side Reddit Cultural Dispatches Service
 *
 * Isolated server utility for querying public cultural discussions and academic sources
 * from curated subreddits using official public Reddit endpoints.
 */

export const CURATED_SUBREDDITS = [
  'Folklore',
  'Anthropology',
  'CulturalHeritage',
  'Mythology',
  'AskHistorians',
  'linguistics',
  'archaeology',
  'ArtHistory',
]

/**
 * Normalizes raw Reddit post payload into standard dispatch format.
 *
 * @param {Object} raw
 * @returns {Object|null}
 */
export function normalizeServerRedditPost(raw) {
  if (!raw || typeof raw !== 'object') return null
  const data = raw.data || raw

  return {
    id: data.id ? String(data.id) : `reddit-${Math.random().toString(36).slice(2)}`,
    title: data.title || 'Untitled Discussion',
    author: data.author ? `u/${data.author}` : 'u/anonymous',
    subreddit: data.subreddit_name_prefixed || (data.subreddit ? `r/${data.subreddit}` : 'r/culture'),
    score: typeof data.score === 'number' ? data.score : 0,
    numComments: typeof data.num_comments === 'number' ? data.num_comments : 0,
    permalink: data.permalink ? `https://reddit.com${data.permalink}` : 'https://reddit.com',
    url: data.url || (data.permalink ? `https://reddit.com${data.permalink}` : 'https://reddit.com'),
    selftext: typeof data.selftext === 'string' ? data.selftext.slice(0, 500) : '',
    flair: data.link_flair_text || null,
    createdAt: data.created_utc ? new Date(data.created_utc * 1000).toISOString() : new Date().toISOString(),
    isOver18: Boolean(data.over_18),
  }
}

/**
 * Validates subreddit query inputs.
 *
 * @param {string} subreddit
 * @returns {{ valid: boolean, error?: string, sanitized?: string }}
 */
export function validateSubredditInput(subreddit) {
  if (!subreddit || typeof subreddit !== 'string') {
    return { valid: false, error: 'Subreddit name is required' }
  }

  const clean = subreddit.replace(/^r\//, '').trim()
  if (!/^[a-zA-Z0-9_]{2,30}$/.test(clean)) {
    return { valid: false, error: 'Invalid subreddit name format' }
  }

  return { valid: true, sanitized: clean }
}
