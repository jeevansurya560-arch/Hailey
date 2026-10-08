import { describe, it, expect, beforeEach } from 'vitest'
import { rateLimiter } from '../../server/security/rateLimit.js'

describe('server/security/rateLimit.js - Sliding Window Abuse Protection', () => {
  beforeEach(() => {
    rateLimiter.reset('test-ip-1')
    rateLimiter.reset('test-ip-2')
  })

  it('allows requests within max limit', () => {
    for (let i = 0; i < 5; i++) {
      const res = rateLimiter.check('test-ip-1', 5, 60000)
      expect(res.allowed).toBe(true)
    }
  })

  it('blocks excess requests when max limit is breached', () => {
    for (let i = 0; i < 5; i++) {
      rateLimiter.check('test-ip-1', 5, 60000)
    }

    const blocked = rateLimiter.check('test-ip-1', 5, 60000)
    expect(blocked.allowed).toBe(false)
    expect(blocked.remaining).toBe(0)
    expect(blocked.resetMs).toBeGreaterThan(0)
  })

  it('isolates different client identifiers', () => {
    for (let i = 0; i < 5; i++) {
      rateLimiter.check('test-ip-1', 5, 60000)
    }
    expect(rateLimiter.check('test-ip-1', 5, 60000).allowed).toBe(false)

    // Other identifier should be unaffected
    const other = rateLimiter.check('test-ip-2', 5, 60000)
    expect(other.allowed).toBe(true)
    expect(other.remaining).toBe(4)
  })
})
