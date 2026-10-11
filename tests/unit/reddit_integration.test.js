import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  fetchRedditCulturalDispatches,
  normalizeRedditPost,
  CURATED_CULTURAL_SUBREDDITS,
} from '../../frontend/src/features/reddit/services/redditService.js'
import {
  normalizeServerRedditPost,
  validateSubredditInput,
} from '../../backend/server/services/reddit/redditService.js'

describe('Reddit Cultural Dispatches Feature - Isolation & Resiliency Tests', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  // ── 1. Non-Authentication Invariant ──────────────────────────────
  describe('Reddit Non-Authentication Invariants', () => {
    it('guarantees Reddit is purely a read-only field dispatch feature and NOT an auth provider', () => {
      // Invariant: Curated subreddits list has cultural topics, not auth scopes
      expect(CURATED_CULTURAL_SUBREDDITS.length).toBeGreaterThan(0)
      expect(CURATED_CULTURAL_SUBREDDITS.some((s) => s.slug === 'Folklore')).toBe(true)
      expect(CURATED_CULTURAL_SUBREDDITS.some((s) => s.slug === 'Anthropology')).toBe(true)

      // No OAuth client ID or secret is required
      const clientEnv = Object.keys(import.meta.env || {})
      expect(clientEnv.some((k) => k.includes('REDDIT_SECRET') || k.includes('REDDIT_CLIENT_SECRET'))).toBe(false)
    })
  })

  // ── 2. Data Normalization Tests ──────────────────────────────────
  describe('Post Normalization (Client & Server)', () => {
    it('normalizes valid raw Reddit JSON post payload into standard dispatch format', () => {
      const rawPost = {
        kind: 't3',
        data: {
          id: 'abc123z',
          title: 'Oral History Traditions of Shinto Shrine Keepers in Nara',
          author: 'kyoto_scholar',
          subreddit: 'CulturalHeritage',
          subreddit_name_prefixed: 'r/CulturalHeritage',
          score: 412,
          num_comments: 39,
          permalink: '/r/CulturalHeritage/comments/abc123z/oral_history_traditions/',
          url: 'https://reddit.com/r/CulturalHeritage/comments/abc123z/oral_history_traditions/',
          selftext: 'Detailed ethnographic recording of hereditary priests reciting ancient norito chants.',
          link_flair_text: 'Field Research',
          created_utc: 1770000000,
          thumbnail: 'https://b.thumbs.redditmedia.com/valid_thumb.jpg',
          over_18: false,
        },
      }

      const normalized = normalizeRedditPost(rawPost)
      expect(normalized.id).toBe('abc123z')
      expect(normalized.title).toBe('Oral History Traditions of Shinto Shrine Keepers in Nara')
      expect(normalized.author).toBe('u/kyoto_scholar')
      expect(normalized.subreddit).toBe('r/CulturalHeritage')
      expect(normalized.score).toBe(412)
      expect(normalized.numComments).toBe(39)
      expect(normalized.permalink).toBe('https://reddit.com/r/CulturalHeritage/comments/abc123z/oral_history_traditions/')
      expect(normalized.flair).toBe('Field Research')
      expect(normalized.isOver18).toBe(false)
      expect(normalized.isFallback).toBe(false)
      expect(normalized.thumbnail).toBe('https://b.thumbs.redditmedia.com/valid_thumb.jpg')

      // Server equivalent
      const serverNorm = normalizeServerRedditPost(rawPost)
      expect(serverNorm.id).toBe('abc123z')
      expect(serverNorm.author).toBe('u/kyoto_scholar')
    })

    it('filters out internal placeholder thumbnails like "default", "self", or "nsfw"', () => {
      const rawSelfPost = {
        data: {
          id: 'def456',
          title: 'Text post without external preview',
          author: 'researcher',
          thumbnail: 'self',
        },
      }

      const normalized = normalizeRedditPost(rawSelfPost)
      expect(normalized.thumbnail).toBeNull()
    })

    it('handles malformed, null or empty post payloads safely without throwing', () => {
      expect(normalizeRedditPost(null)).toBeNull()
      expect(normalizeRedditPost(undefined)).toBeNull()
      expect(normalizeRedditPost({})).not.toBeNull()
      expect(normalizeServerRedditPost(null)).toBeNull()
    })
  })

  // ── 3. Subreddit Input Validation ────────────────────────────────
  describe('validateSubredditInput (Server)', () => {
    it('accepts valid subreddit names with or without r/ prefix', () => {
      expect(validateSubredditInput('Folklore').valid).toBe(true)
      expect(validateSubredditInput('r/Anthropology').valid).toBe(true)
      expect(validateSubredditInput('r/CulturalHeritage').sanitized).toBe('CulturalHeritage')
    })

    it('rejects invalid or dangerous subreddit inputs', () => {
      expect(validateSubredditInput('').valid).toBe(false)
      expect(validateSubredditInput(null).valid).toBe(false)
      expect(validateSubredditInput('bad subreddit with spaces').valid).toBe(false)
      expect(validateSubredditInput('sub/../../attack').valid).toBe(false)
    })
  })

  // ── 4. Resiliency & Isolated Error Handling ───────────────────────
  describe('fetchRedditCulturalDispatches Network & Error Isolation', () => {
    it('fetches and returns normalized posts when Reddit API succeeds', async () => {
      const mockApiResponse = {
        data: {
          children: [
            {
              data: {
                id: 'post-1',
                title: 'Sacred Calendar Calculation in the Maya Highlands',
                author: 'MayaEpigrapher',
                subreddit: 'Anthropology',
                score: 890,
                num_comments: 112,
                permalink: '/r/Anthropology/comments/post-1/sacred_calendar/',
                created_utc: 1770000000,
                over_18: false,
              },
            },
          ],
        },
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockApiResponse,
      })

      const res = await fetchRedditCulturalDispatches({
        subreddit: 'Anthropology',
        query: 'calendar',
        limit: 10,
      })

      expect(res.posts.length).toBe(1)
      expect(res.posts[0].id).toBe('post-1')
      expect(res.posts[0].author).toBe('u/MayaEpigrapher')
      expect(res.isFallback).toBe(false)
      expect(res.error).toBeNull()
    })

    it('gracefully falls back to curated archive on HTTP 429 Rate Limit without crashing', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ message: 'Too Many Requests' }),
      })

      const res = await fetchRedditCulturalDispatches({ subreddit: 'Folklore' })

      expect(res.posts.length).toBeGreaterThan(0)
      expect(res.isFallback).toBe(true)
      expect(res.error).toContain('rate limit')
    })

    it('gracefully falls back to curated archive on HTTP 500 / 404 error without crashing', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
      })

      const res = await fetchRedditCulturalDispatches({ subreddit: 'Mythology' })

      expect(res.posts.length).toBeGreaterThan(0)
      expect(res.isFallback).toBe(true)
      expect(res.error).toContain('status 503')
    })

    it('gracefully falls back on network timeout / AbortError without crashing', async () => {
      global.fetch = vi.fn().mockRejectedValue(new DOMException('The operation was aborted', 'AbortError'))

      const res = await fetchRedditCulturalDispatches({ subreddit: 'AskHistorians' })

      expect(res.posts.length).toBeGreaterThan(0)
      expect(res.isFallback).toBe(true)
      expect(res.error).toContain('timed out')
    })

    it('gracefully falls back on arbitrary network disconnects or fetch errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Failed to fetch'))

      const res = await fetchRedditCulturalDispatches({ subreddit: 'linguistics' })

      expect(res.posts.length).toBeGreaterThan(0)
      expect(res.isFallback).toBe(true)
      expect(res.error).toContain('unavailable')
    })
  })
})
