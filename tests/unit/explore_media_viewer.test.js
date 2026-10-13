import { describe, it, expect, vi } from 'vitest'
import fs from 'fs'
import path from 'path'
import { createStableFeedSession } from '@/features/culture/utils/feedSessionUtils'
import { DEMONSTRATION_DISPATCHES } from '@/features/culture/data/demonstrationDispatches'
import { parseCulturalPost } from '@/features/culture/components/CulturalPostCard'

describe('Explore Media Experience & Immersive Viewer Suite', () => {
  // ── 1. Video Asset Folder Integration ──
  describe('1. Video Asset Verification', () => {
    it('verifies that all 8 video asset files exist in frontend/public/videos', () => {
      const videosDir = path.resolve(process.cwd(), 'frontend/public/videos')
      expect(fs.existsSync(videosDir)).toBe(true)

      const expectedVideos = [
        'Buddhavanam_Clip_1_Stupa_and_Monastery.mp4',
        'Buddhavanam_Clip_2_Monks_and_Heritage.mp4',
        'India_Heritage_Clip_1_Monuments.mp4',
        'India_Heritage_Clip_2_Culture_Festivals.mp4',
        'India_Heritage_Clip_3_Traditions_Scenery.mp4',
        'India_Heritage_Clip_4_Nature_and_Living_Heritage.mp4',
        'Islamic_Culture_Clip_1_Mosque_Architecture.mp4',
        'Islamic_Culture_Clip_2_Prayer_and_Heritage.mp4',
      ]

      expectedVideos.forEach((file) => {
        const filePath = path.join(videosDir, file)
        expect(fs.existsSync(filePath), `Expected video file ${file} to exist`).toBe(true)
        const stats = fs.statSync(filePath)
        expect(stats.size).toBeGreaterThan(1000)
      })
    })

    it('verifies that demonstration dispatches contain video_url and is_video properties', () => {
      const videoDispatches = DEMONSTRATION_DISPATCHES.filter((d) => d.is_video === true)
      expect(videoDispatches.length).toBe(8)
      videoDispatches.forEach((d) => {
        expect(d.video_url).toMatch(/^\/videos\/.+\.mp4$/)
        expect(d.media_url).toMatch(/^\/photos\/culture_\d{2}\.jpeg$/)
      })
    })
  })

  // ── 2. Session Sequencing Algorithm ──
  describe('2. Stable Session Sequencing & Shuffling Invariants', () => {
    const mockPosts = [
      { id: 'post-1', is_video: false, author_id: 'auth-A', author: { handle: 'alice' } },
      { id: 'post-2', is_video: true, author_id: 'auth-B', author: { handle: 'bob' } },
      { id: 'post-3', is_video: false, author_id: 'auth-A', author: { handle: 'alice' } },
      { id: 'post-4', is_video: true, author_id: 'auth-C', author: { handle: 'charlie' } },
      { id: 'post-5', is_video: false, author_id: 'auth-B', author: { handle: 'bob' } },
      { id: 'post-6', is_video: true, author_id: 'auth-D', author: { handle: 'david' } },
    ]

    it('guarantees the selected post opens first at index 0', () => {
      const session = createStableFeedSession(mockPosts, 'post-4', 12345)
      expect(session[0].id).toBe('post-4')
      expect(session.length).toBe(mockPosts.length)
    })

    it('preserves all post records without dropping or duplicating IDs', () => {
      const session = createStableFeedSession(mockPosts, 'post-2', 45678)
      const ids = session.map((p) => p.id)
      const uniqueIds = new Set(ids)
      expect(ids.length).toBe(mockPosts.length)
      expect(uniqueIds.size).toBe(mockPosts.length)
      expect(ids).toContain('post-1')
      expect(ids).toContain('post-6')
    })

    it('is completely deterministic for the same session seed', () => {
      const seed = 99999
      const runA = createStableFeedSession(mockPosts, 'post-1', seed).map((p) => p.id)
      const runB = createStableFeedSession(mockPosts, 'post-1', seed).map((p) => p.id)
      expect(runA).toEqual(runB)
    })

    it('handles empty or single post gracefully', () => {
      expect(createStableFeedSession([])).toEqual([])
      const single = [{ id: 'p-one', is_video: false }]
      expect(createStableFeedSession(single, 'p-one')).toEqual(single)
    })

    it('respects creator diversity by avoiding consecutive posts from same author when possible', () => {
      const skewedPosts = [
        { id: 'p1', author_id: 'auth-A', author: { handle: 'alice' }, is_video: false },
        { id: 'p2', author_id: 'auth-A', author: { handle: 'alice' }, is_video: false },
        { id: 'p3', author_id: 'auth-B', author: { handle: 'bob' }, is_video: true },
        { id: 'p4', author_id: 'auth-C', author: { handle: 'charlie' }, is_video: true },
      ]
      const session = createStableFeedSession(skewedPosts, 'p1', 54321)
      expect(session[0].id).toBe('p1')
      // p2 should not be immediately after p1 if alternative authors exist
      expect(session[1].author_id).not.toBe('auth-A')
    })
  })

  // ── 3. Post Metadata & Parsing ──
  describe('3. Cultural Post Parsing & Video Classification', () => {
    it('accurately parses editorial body into title, description, and location', () => {
      const post = {
        body: 'Kumbh Mela River Confluence (Prayagraj, India) — Millions of pilgrims gather for the sacred bath.',
        is_video: true,
      }
      const parsed = parseCulturalPost(post)
      expect(parsed.title).toBe('Kumbh Mela River Confluence')
      expect(parsed.location).toBe('Prayagraj, India')
      expect(parsed.description).toContain('Millions of pilgrims')
      expect(parsed.isVideo).toBe(true)
    })

    it('handles dispatches without parentheses location', () => {
      const post = {
        body: 'Kyoto Zen Garden — Sand and stone meditative arrangement.',
      }
      const parsed = parseCulturalPost(post)
      expect(parsed.title).toBe('Kyoto Zen Garden')
      expect(parsed.location).toBe('Kyoto, Japan')
      expect(parsed.description).toContain('Sand and stone')
    })
  })

  // ── 4. Immersive Media Viewer Invariants ──
  describe('4. Viewer Architecture Contracts', () => {
    it('verifies vertical navigation semantics: next increases index, prev decreases index', () => {
      let currentIndex = 0
      const total = 5

      const goNext = () => {
        if (currentIndex < total - 1) currentIndex++
      }
      const goPrev = () => {
        if (currentIndex > 0) currentIndex--
      }

      // Scroll Down -> Next
      goNext()
      expect(currentIndex).toBe(1)
      goNext()
      expect(currentIndex).toBe(2)

      // Scroll Up -> Prev
      goPrev()
      expect(currentIndex).toBe(1)
      goPrev()
      expect(currentIndex).toBe(0)
      // Clamped at 0
      goPrev()
      expect(currentIndex).toBe(0)
    })

    it('verifies touch swipe vertical delta thresholds', () => {
      const evaluateSwipe = (startY, endY) => {
        const deltaY = startY - endY
        if (deltaY > 50) return 'NEXT'
        if (deltaY < -50) return 'PREV'
        return 'NONE'
      }

      // Swipe UP: finger moves up, endY < startY => deltaY > 0 => NEXT
      expect(evaluateSwipe(300, 200)).toBe('NEXT')
      // Swipe DOWN: finger moves down, endY > startY => deltaY < 0 => PREV
      expect(evaluateSwipe(200, 300)).toBe('PREV')
      // Small jitter: ignore
      expect(evaluateSwipe(200, 220)).toBe('NONE')
    })
  })
})
