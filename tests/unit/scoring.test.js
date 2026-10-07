import { describe, it, expect } from 'vitest'
import { shouldShowRelevancePrompt } from '../../src/features/feed/lib/relevance.js'

describe('features/feed/lib/relevance.js - Relevance Prompt Scoring Unit Tests', () => {
  it('returns false when userId or postId is falsy', () => {
    expect(shouldShowRelevancePrompt(null, 'post-1')).toBe(false)
    expect(shouldShowRelevancePrompt('user-1', null)).toBe(false)
    expect(shouldShowRelevancePrompt('', '')).toBe(false)
  })

  it('is completely deterministic for given user and post pairs', () => {
    const res1 = shouldShowRelevancePrompt('user-abc', 'post-xyz')
    const res2 = shouldShowRelevancePrompt('user-abc', 'post-xyz')
    expect(res1).toBe(res2)
  })

  it('samples roughly 20% across a diverse set of inputs', () => {
    let trueCount = 0
    const total = 500

    for (let i = 0; i < total; i++) {
      if (shouldShowRelevancePrompt(`user-${i}`, `post-${i * 3 + 7}`)) {
        trueCount++
      }
    }

    const ratio = trueCount / total
    // Expect between 12% and 28% for a pseudo-random hash modulo 5
    expect(ratio).toBeGreaterThan(0.12)
    expect(ratio).toBeLessThan(0.28)
  })
})
