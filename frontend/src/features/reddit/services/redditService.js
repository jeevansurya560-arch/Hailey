/**
 * Reddit Cultural Dispatches Service (Client-Side)
 *
 * Provides safe, isolated access to public cultural discussions, folklore archives,
 * and anthropological field notes from curated subreddits using official Reddit public JSON endpoints.
 *
 * Invariants:
 * - Read-only integration (NO authentication, NO OAuth login tokens).
 * - Isolated feature failure: network errors and rate limits never crash the app.
 * - Respects Hailey age classification (filters/badges over_18 content).
 * - Implements request timeouts and graceful fallback data.
 */

export const CURATED_CULTURAL_SUBREDDITS = [
  { slug: 'Folklore', name: 'r/Folklore', topic: 'Living folklore, oral traditions & regional tales' },
  { slug: 'Anthropology', name: 'r/Anthropology', topic: 'Anthropological studies & ethnographic field records' },
  { slug: 'CulturalHeritage', name: 'r/CulturalHeritage', topic: 'Tangible & intangible heritage preservation' },
  { slug: 'Mythology', name: 'r/Mythology', topic: 'Comparative mythology, deities & sacred legends' },
  { slug: 'AskHistorians', name: 'r/AskHistorians', topic: 'Peer-reviewed academic historical inquiries' },
  { slug: 'linguistics', name: 'r/linguistics', topic: 'Indigenous language preservation & dialectology' },
  { slug: 'archaeology', name: 'r/archaeology', topic: 'Excavations, ancient material culture & artifacts' },
  { slug: 'ArtHistory', name: 'r/ArtHistory', topic: 'Traditional arts, iconography & architectural craft' },
]

/**
 * Curated offline fallback records to ensure resilient rendering if Reddit is unreachable.
 */
export const CULTURAL_FALLBACK_DISPATCHES = [
  {
    id: 'fallback-1',
    title: 'Oral storytelling traditions and sacred geometry in Kyoto temple joinery',
    author: 'u/HeritageArchivist',
    subreddit: 'r/CulturalHeritage',
    score: 342,
    numComments: 48,
    permalink: 'https://reddit.com/r/CulturalHeritage',
    url: 'https://reddit.com/r/CulturalHeritage',
    selftext: 'A detailed documentation of master carpenters transmitting joinery principles without nails across generations through oral rhythm mnemonic chants.',
    flair: 'Field Documentation',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    thumbnail: null,
    isOver18: false,
    isFallback: true,
  },
  {
    id: 'fallback-2',
    title: 'Astronomical alignments of the Mesoamerican solar and ritual calendars',
    author: 'u/FolkloreScholar',
    subreddit: 'r/Anthropology',
    score: 519,
    numComments: 82,
    permalink: 'https://reddit.com/r/Anthropology',
    url: 'https://reddit.com/r/Anthropology',
    selftext: 'Comparing the 260-day sacred count with seasonal zenith passages across highland architectural complexes.',
    flair: 'Academic Citation',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    thumbnail: null,
    isOver18: false,
    isFallback: true,
  },
  {
    id: 'fallback-3',
    title: 'The living transmission of Celtic knotwork and liturgical bell casting',
    author: 'u/CelticLoreKeeper',
    subreddit: 'r/Folklore',
    score: 285,
    numComments: 31,
    permalink: 'https://reddit.com/r/Folklore',
    url: 'https://reddit.com/r/Folklore',
    selftext: 'An investigation into high-tin bronze metallurgy techniques preserved by monastic gilds in Western Ireland.',
    flair: 'Intangible Craft',
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    thumbnail: null,
    isOver18: false,
    isFallback: true,
  },
]

/**
 * Sanitizes a thumbnail URL.
 *
 * @param {string} url
 * @returns {string | null}
 */
function sanitizeThumbnail(url) {
  if (!url || typeof url !== 'string') return null
  if (['default', 'self', 'nsfw', 'spoiler', 'image'].includes(url)) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return null
}

/**
 * Normalizes a raw Reddit post object into Hailey's cultural dispatch structure.
 *
 * @param {Object} raw
 * @returns {Object}
 */
export function normalizeRedditPost(raw) {
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
    thumbnail: sanitizeThumbnail(data.thumbnail),
    isOver18: Boolean(data.over_18),
    isFallback: false,
  }
}

/**
 * Fetches public cultural dispatches from a given subreddit or search query.
 *
 * @param {Object} params
 * @param {string} [params.subreddit='Folklore'] Curated subreddit name
 * @param {string} [params.query=''] Optional search term within the subreddit
 * @param {'hot' | 'new' | 'top'} [params.sort='hot'] Sort order
 * @param {number} [params.limit=15] Max number of items (capped at 25)
 * @param {number} [params.timeoutMs=7000] Timeout in milliseconds
 * @returns {Promise<{
 *   posts: Array<Object>,
 *   isFallback: boolean,
 *   sourceSubreddit: string,
 *   error: string | null
 * }>}
 */
export async function fetchRedditCulturalDispatches({
  subreddit = 'Folklore',
  query = '',
  sort = 'hot',
  limit = 15,
  timeoutMs = 7000,
} = {}) {
  const cleanSubreddit = subreddit.replace(/^r\//, '').trim() || 'Folklore'
  const safeLimit = Math.min(Math.max(1, limit), 25)
  const cleanQuery = typeof query === 'string' ? query.trim() : ''

  // Build official public JSON endpoint URL
  let endpoint = ''
  if (cleanQuery) {
    endpoint = `https://www.reddit.com/r/${encodeURIComponent(cleanSubreddit)}/search.json?q=${encodeURIComponent(
      cleanQuery
    )}&restrict_sr=1&sort=relevance&limit=${safeLimit}`
  } else {
    endpoint = `https://www.reddit.com/r/${encodeURIComponent(cleanSubreddit)}/${encodeURIComponent(
      sort
    )}.json?limit=${safeLimit}`
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(endpoint, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      if (response.status === 429) {
        return {
          posts: CULTURAL_FALLBACK_DISPATCHES,
          isFallback: true,
          sourceSubreddit: cleanSubreddit,
          error: 'Reddit API rate limit reached. Displaying curated living archive dispatches.',
        }
      }
      return {
        posts: CULTURAL_FALLBACK_DISPATCHES,
        isFallback: true,
        sourceSubreddit: cleanSubreddit,
        error: `Reddit returned status ${response.status}. Displaying archived citations.`,
      }
    }

    const json = await response.json()
    const children = json?.data?.children

    if (!Array.isArray(children) || children.length === 0) {
      return {
        posts: [],
        isFallback: false,
        sourceSubreddit: cleanSubreddit,
        error: null,
      }
    }

    const normalized = children
      .map((child) => normalizeRedditPost(child))
      .filter(Boolean)

    return {
      posts: normalized,
      isFallback: false,
      sourceSubreddit: cleanSubreddit,
      error: null,
    }
  } catch (err) {
    clearTimeout(timeoutId)

    // Handle AbortError / Timeout
    const isTimeout = err instanceof Error && (err.name === 'AbortError' || err.message.includes('abort'))
    const errorMessage = isTimeout
      ? 'Reddit connection timed out. Displaying curated cultural archives.'
      : 'Reddit network unavailable. Displaying cached community records.'

    return {
      posts: CULTURAL_FALLBACK_DISPATCHES,
      isFallback: true,
      sourceSubreddit: cleanSubreddit,
      error: errorMessage,
    }
  }
}
