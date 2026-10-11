import { describe, it, expect, beforeEach } from 'vitest'
import { rateLimiter, resolveTrustedIp, isValidIp } from '../../backend/server/security/rateLimit.js'

describe('server/security/rateLimit.js - Sliding Window Abuse Protection', () => {
  beforeEach(async () => {
    await rateLimiter.reset('test-ip-1')
    await rateLimiter.reset('test-ip-2')
  })

  it('allows requests within max limit', async () => {
    for (let i = 0; i < 5; i++) {
      const res = await rateLimiter.check('test-ip-1', 5, 60000)
      expect(res.allowed).toBe(true)
    }
  })

  it('blocks excess requests when max limit is breached', async () => {
    for (let i = 0; i < 5; i++) {
      await rateLimiter.check('test-ip-1', 5, 60000)
    }

    const blocked = await rateLimiter.check('test-ip-1', 5, 60000)
    expect(blocked.allowed).toBe(false)
    expect(blocked.remaining).toBe(0)
    expect(blocked.resetMs).toBeGreaterThan(0)
  })

  it('isolates different client identifiers', async () => {
    for (let i = 0; i < 5; i++) {
      await rateLimiter.check('test-ip-1', 5, 60000)
    }
    const blocked = await rateLimiter.check('test-ip-1', 5, 60000)
    expect(blocked.allowed).toBe(false)

    // Other identifier should be unaffected
    const other = await rateLimiter.check('test-ip-2', 5, 60000)
    expect(other.allowed).toBe(true)
    expect(other.remaining).toBe(4)
  })

  it('validates IP format and resolves trusted ingress headers', () => {
    expect(isValidIp('192.168.1.1')).toBe(true)
    expect(isValidIp('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true)
    expect(isValidIp('invalid-ip-string')).toBe(false)
    expect(isValidIp('')).toBe(false)

    // Trusted header resolution
    const mockReqWithRealIp = {
      headers: {
        'x-real-ip': '203.0.113.195',
        'x-forwarded-for': '198.51.100.1, 10.0.0.1',
      },
    }
    expect(resolveTrustedIp(mockReqWithRealIp)).toBe('203.0.113.195')

    const mockReqWithVercelIp = {
      headers: {
        'x-vercel-forwarded-for': '203.0.113.200',
        'x-forwarded-for': 'spoofed-user-id',
      },
    }
    expect(resolveTrustedIp(mockReqWithVercelIp)).toBe('203.0.113.200')
  })
})
