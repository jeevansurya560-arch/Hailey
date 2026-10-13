import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  isDemoContentEnabled,
  DEMONSTRATION_AUTHORS,
  DEMO_AUTHORS_LIST,
  DEMONSTRATION_DISPATCHES,
  isDemoPostId,
  getDemoPostById,
  getDemoAuthorByHandle,
  getDemoAuthorById,
  getDemoPostsByAuthorHandle,
  getDemoPostsByAuthorId,
} from '@/features/culture/data/demonstrationDispatches'
import {
  fetchExploreDispatches,
  fetchPostById,
} from '@/features/feed/services/feedService'
import {
  fetchProfileByHandle,
  fetchProfileById,
  fetchUserPosts,
} from '@/features/profile/services/profileService'
import { parseCulturalPost } from '@/features/culture/components/CulturalPostCard'

describe('Hybrid Community Feed Architecture', () => {
  describe('1. Demonstration Authors Diversity & Distinction', () => {
    it('provides multiple distinct fictional demonstration authors', () => {
      expect(DEMO_AUTHORS_LIST.length).toBeGreaterThanOrEqual(8)

      const handles = DEMO_AUTHORS_LIST.map((a) => a.handle)
      const uniqueHandles = new Set(handles)
      expect(uniqueHandles.size).toBe(DEMO_AUTHORS_LIST.length)

      // Ensure expected diverse authors exist
      expect(handles).toContain('jeevan_surya')
      expect(handles).toContain('ananya_rao')
      expect(handles).toContain('kenji_tanaka')
      expect(handles).toContain('karim_hassan')
      expect(handles).toContain('priya_mehta')
      expect(handles).toContain('elena_rostova')
      expect(handles).toContain('mateo_silva')
      expect(handles).toContain('marcus_vance')
    })

    it('each demonstration author has valid public profile metadata and demo flags', () => {
      DEMO_AUTHORS_LIST.forEach((author) => {
        expect(author.id).toMatch(/^demo-author-/)
        expect(author.handle).toBeTruthy()
        expect(author.display_name).toBeTruthy()
        expect(author.avatar_url).toBeTruthy()
        expect(author.bio).toBeTruthy()
        expect(author.location).toBeTruthy()
        expect(author.is_demo).toBe(true)
        expect(author.is_editorial).toBe(true)
      })
    })

    it('retrieves demonstration authors by handle and by id', () => {
      const ananya = getDemoAuthorByHandle('ananya_rao')
      expect(ananya).toBeDefined()
      expect(ananya.display_name).toBe('Ananya Rao')

      const kenji = getDemoAuthorById('demo-author-kenji')
      expect(kenji).toBeDefined()
      expect(kenji.handle).toBe('kenji_tanaka')

      const nonexistent = getDemoAuthorByHandle('non_existent_author_999')
      expect(nonexistent).toBeNull()
    })
  })

  describe('2. Demonstration Dispatches Separation & Attribution', () => {
    it('contains 33 curated cultural dispatches with diverse author attribution', () => {
      expect(DEMONSTRATION_DISPATCHES.length).toBe(33)

      const attributedAuthors = new Set(DEMONSTRATION_DISPATCHES.map((d) => d.author.handle))
      expect(attributedAuthors.size).toBeGreaterThanOrEqual(6)
      expect(attributedAuthors.has('ananya_rao')).toBe(true)
      expect(attributedAuthors.has('kenji_tanaka')).toBe(true)
      expect(attributedAuthors.has('karim_hassan')).toBe(true)
      expect(attributedAuthors.has('priya_mehta')).toBe(true)
    })

    it('all demonstration dispatches are flagged with is_demo = true and valid status', () => {
      DEMONSTRATION_DISPATCHES.forEach((dispatch) => {
        expect(dispatch.is_demo).toBe(true)
        expect(dispatch.is_editorial).toBe(true)
        expect(dispatch.status).toBe('published')
        expect(dispatch.media_url).toMatch(/^\/photos\/culture_\d{2}\.jpeg$/)
        expect(dispatch.body).toBeTruthy()
        expect(dispatch.community?.slug).toBeTruthy()
        expect(dispatch.tags?.length).toBeGreaterThan(0)
      })
    })

    it('correctly identifies demonstration post IDs', () => {
      expect(isDemoPostId('c0000001-0000-0000-0000-000000000001')).toBe(true)
      expect(isDemoPostId('c0000028-0000-0000-0000-000000000028')).toBe(true)
      // Real user post UUID should not be identified as demo post
      expect(isDemoPostId('9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d')).toBe(false)
    })

    it('maps demonstration authors to their specific dispatches', () => {
      const ananyaPosts = getDemoPostsByAuthorHandle('ananya_rao')
      expect(ananyaPosts.length).toBeGreaterThan(0)
      ananyaPosts.forEach((p) => {
        expect(p.author.handle).toBe('ananya_rao')
        expect(p.body).toMatch(/Bharatanatyam|Kuchipudi/)
      })

      const kenjiPosts = getDemoPostsByAuthorHandle('kenji_tanaka')
      expect(kenjiPosts.length).toBeGreaterThan(0)
      kenjiPosts.forEach((p) => {
        expect(p.author.handle).toBe('kenji_tanaka')
        expect(p.body).toMatch(/Japan|Himeji|Nachi|Odori|Matsuri|Hikiyama/)
      })
    })
  })

  describe('3. Profile Service Demo vs Real Resolution', () => {
    it('resolves demo author profile via fetchProfileByHandle without DB authentication', async () => {
      const profile = await fetchProfileByHandle('ananya_rao')
      expect(profile).toBeDefined()
      expect(profile.handle).toBe('ananya_rao')
      expect(profile.display_name).toBe('Ananya Rao')
      expect(profile.is_demo).toBe(true)
    })

    it('fetches demo author posts for their profile tab', async () => {
      const posts = await fetchUserPosts('demo-author-kenji')
      expect(posts.length).toBeGreaterThan(0)
      expect(posts.every((p) => p.author.handle === 'kenji_tanaka')).toBe(true)
    })
  })

  describe('4. Post Parsing & Cultural Metadata Extraction', () => {
    it('parses title, location, category, and description accurately', () => {
      const parsedTaj = parseCulturalPost({
        body: 'Taj Mahal (Agra, Uttar Pradesh) — Commissioned in 1631 by Mughal Emperor Shah Jahan.',
        community: { name: 'Sacred Architecture' },
      })
      expect(parsedTaj.title).toBe('Taj Mahal')
      expect(parsedTaj.location).toBe('Agra, Uttar Pradesh')
      expect(parsedTaj.category).toBe('Sacred Architecture')
      expect(parsedTaj.description).toBe('Commissioned in 1631 by Mughal Emperor Shah Jahan.')
    })

    it('handles user-generated cultural post bodies without bracketed locations', () => {
      const parsedCustom = parseCulturalPost({
        body: 'Kintsugi Philosophy — The Japanese art of repairing broken pottery with lacquer dusted with powdered gold.',
        community: { name: 'Living Heritage' },
      })
      expect(parsedCustom.title).toBe('Kintsugi Philosophy')
      expect(parsedCustom.description).toBe('The Japanese art of repairing broken pottery with lacquer dusted with powdered gold.')
    })
  })

  describe('5. Explore Hybrid Dispatches Fetcher', () => {
    it('returns living dispatches with reactions, tags, and pagination', async () => {
      const res = await fetchExploreDispatches({
        page: 0,
        pageSize: 10,
        orderBy: 'newest',
      })
      expect(res).toBeDefined()
      expect(res.posts).toBeDefined()
      expect(res.posts.length).toBeGreaterThan(0)
      expect(res.total).toBeGreaterThanOrEqual(res.posts.length)

      // Verify structure of first post
      const first = res.posts[0]
      expect(first.id).toBeDefined()
      expect(first.body).toBeDefined()
      expect(first.author).toBeDefined()
      expect(first.reactions).toBeDefined()
      expect(typeof first.reactions.likesCount).toBe('number')
    })

    it('filters explore dispatches by search keyword across both demo and real fields', async () => {
      const res = await fetchExploreDispatches({
        query: 'Taj Mahal',
        page: 0,
        pageSize: 10,
      })
      expect(res.posts.length).toBeGreaterThan(0)
      expect(res.posts[0].body).toContain('Taj Mahal')
    })

    it('filters explore dispatches by community slug', async () => {
      const res = await fetchExploreDispatches({
        communitySlug: 'sacred-architecture',
        page: 0,
        pageSize: 10,
      })
      expect(res.posts.length).toBeGreaterThan(0)
      res.posts.forEach((p) => {
        expect(p.community?.slug).toBe('sacred-architecture')
      })
    })
  })
})
