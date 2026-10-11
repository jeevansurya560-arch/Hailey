import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { DistributedRateLimiter, resolveTrustedIp } from '../../backend/server/security/rateLimit.js'

describe('server/security/rateLimit.js - Distributed Redis Resilience Suite', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.restoreAllMocks()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('Scenario 1: Requests below the limit succeed (allowed: true, remaining > 0)', async () => {
    const mockRedis = {
      eval: vi.fn().mockResolvedValue([1, 4, 60000]),
      del: vi.fn().mockResolvedValue(1),
    }

    const limiter = new DistributedRateLimiter({ redisClient: mockRedis })
    const res = await limiter.check('test:user1', 5, 60000)

    expect(res.allowed).toBe(true)
    expect(res.remaining).toBe(4)
    expect(res.isServiceUnavailable).toBe(false)
    expect(res.source).toBe('redis')
  })

  it('Scenario 2: Requests exceeding the limit receive allowed: false and accurate resetMs', async () => {
    const mockRedis = {
      eval: vi.fn().mockResolvedValue([0, 0, 45000]),
      del: vi.fn().mockResolvedValue(1),
    }

    const limiter = new DistributedRateLimiter({ redisClient: mockRedis })
    const res = await limiter.check('test:user1', 5, 60000)

    expect(res.allowed).toBe(false)
    expect(res.remaining).toBe(0)
    expect(res.resetMs).toBe(45000)
    expect(res.isServiceUnavailable).toBe(false)
  })

  it('Scenario 3: Separate limiter instances share the same Redis-backed quota', async () => {
    // Shared simulated Redis state
    let quotaCount = 0
    const mockRedis = {
      eval: vi.fn().mockImplementation((_script, _keys, args) => {
        const max = Number(args[2])
        if (quotaCount >= max) {
          return Promise.resolve([0, 0, 30000])
        }
        quotaCount++
        return Promise.resolve([1, max - quotaCount, 60000])
      }),
      del: vi.fn().mockImplementation(() => {
        quotaCount = 0
        return Promise.resolve(1)
      }),
    }

    // Two independent serverless lambda instances sharing same mock Redis
    const instanceA = new DistributedRateLimiter({ redisClient: mockRedis })
    const instanceB = new DistributedRateLimiter({ redisClient: mockRedis })

    // 2 requests via Instance A
    const resA1 = await instanceA.check('shared:key', 3, 60000)
    expect(resA1.allowed).toBe(true)
    expect(resA1.remaining).toBe(2)

    const resA2 = await instanceA.check('shared:key', 3, 60000)
    expect(resA2.allowed).toBe(true)
    expect(resA2.remaining).toBe(1)

    // 1 request via Instance B (should see updated remaining = 0)
    const resB1 = await instanceB.check('shared:key', 3, 60000)
    expect(resB1.allowed).toBe(true)
    expect(resB1.remaining).toBe(0)

    // 4th request via Instance B (must be blocked across instances)
    const resB2 = await instanceB.check('shared:key', 3, 60000)
    expect(resB2.allowed).toBe(false)
  })

  it('Scenario 4: Different verified users receive strictly isolated quotas', async () => {
    const userBuckets = new Map()
    const mockRedis = {
      eval: vi.fn().mockImplementation((_script, keys, args) => {
        const key = keys[0]
        const max = Number(args[2])
        const count = userBuckets.get(key) || 0
        if (count >= max) {
          return Promise.resolve([0, 0, 30000])
        }
        userBuckets.set(key, count + 1)
        return Promise.resolve([1, max - (count + 1), 60000])
      }),
    }

    const limiter = new DistributedRateLimiter({ redisClient: mockRedis })

    // User A hits limit
    for (let i = 0; i < 3; i++) {
      await limiter.check('user:user-A', 3, 60000)
    }
    const blockedA = await limiter.check('user:user-A', 3, 60000)
    expect(blockedA.allowed).toBe(false)

    // User B should still have full quota
    const freshB = await limiter.check('user:user-B', 3, 60000)
    expect(freshB.allowed).toBe(true)
    expect(freshB.remaining).toBe(2)
  })

  it('Scenario 5: Spoofed IP headers cannot bypass limits', () => {
    // 1. Spoofed rotating X-Forwarded-For with static X-Real-IP
    const spoofedReq = {
      headers: {
        'x-real-ip': '198.51.100.55',
        'x-forwarded-for': '1.2.3.4, 5.6.7.8, 9.10.11.12',
      },
    }
    // resolveTrustedIp prefers x-real-ip set by trusted edge proxy
    expect(resolveTrustedIp(spoofedReq)).toBe('198.51.100.55')

    // 2. Malformed / injection string in IP header
    const malformedReq = {
      headers: {
        'x-real-ip': 'DROP TABLE users; --',
      },
      socket: {
        remoteAddress: '127.0.0.1',
      },
    }
    expect(resolveTrustedIp(malformedReq)).toBe('127.0.0.1')
  })

  it('Scenario 6: Missing credentials in production enforces fail-closed policy (isServiceUnavailable: true)', async () => {
    process.env.NODE_ENV = 'production'
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN

    const limiter = new DistributedRateLimiter()
    const res = await limiter.check('protected:endpoint', 10, 60000)

    expect(res.allowed).toBe(false)
    expect(res.isServiceUnavailable).toBe(true)
    expect(res.source).toBe('error_fail_closed')
  })

  it('Scenario 7: Redis timeout enforces fail-closed in production and does not hang', async () => {
    process.env.NODE_ENV = 'production'

    // Mock Redis that never resolves within timeout
    const mockHangingRedis = {
      eval: vi.fn().mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 5000))),
    }

    const limiter = new DistributedRateLimiter({
      redisClient: mockHangingRedis,
      timeoutMs: 50, // Short timeout for test
    })

    const start = Date.now()
    const res = await limiter.check('protected:endpoint', 10, 60000)
    const duration = Date.now() - start

    expect(duration).toBeLessThan(500) // Must abort promptly
    expect(res.allowed).toBe(false)
    expect(res.isServiceUnavailable).toBe(true)
    expect(res.source).toBe('error_fail_closed')
  })

  it('Scenario 8: Production failures cannot silently disable protection', async () => {
    process.env.NODE_ENV = 'production'

    const mockFailingRedis = {
      eval: vi.fn().mockRejectedValue(new Error('Connection refused')),
    }

    const limiter = new DistributedRateLimiter({ redisClient: mockFailingRedis })
    const res = await limiter.check('payment:verification', 10, 60000)

    // In production, MUST NOT fall back to open memory limiter
    expect(res.allowed).toBe(false)
    expect(res.isServiceUnavailable).toBe(true)
    expect(res.source).toBe('error_fail_closed')
  })

  it('Scenario 9: Local development mode permits documented in-memory fallback', async () => {
    process.env.NODE_ENV = 'development'
    delete process.env.VERCEL
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN

    const limiter = new DistributedRateLimiter()
    // Should fall back to in-memory limiter without throwing
    const res1 = await limiter.check('dev:key', 2, 60000)
    expect(res1.allowed).toBe(true)
    expect(res1.isServiceUnavailable).toBe(false)

    const res2 = await limiter.check('dev:key', 2, 60000)
    expect(res2.allowed).toBe(true)

    // Third request exceeds in-memory quota
    const res3 = await limiter.check('dev:key', 2, 60000)
    expect(res3.allowed).toBe(false)
    expect(res3.isServiceUnavailable).toBe(false)
  })

  it('Scenario 10: Secret containment - URLs and tokens never appear in response payloads or headers', async () => {
    process.env.NODE_ENV = 'production'
    const secretUrl = 'https://sensitive-secret-url.upstash.io'
    const secretToken = 'secret-token-value-xyz123'
    process.env.UPSTASH_REDIS_REST_URL = secretUrl
    process.env.UPSTASH_REDIS_REST_TOKEN = secretToken

    const mockFailingRedis = {
      eval: vi.fn().mockRejectedValue(new Error(`Failed to contact ${secretUrl} with token ${secretToken}`)),
    }

    const limiter = new DistributedRateLimiter({ redisClient: mockFailingRedis })
    const res = await limiter.check('user:123', 10, 60000)

    // Check payload properties
    const resString = JSON.stringify(res)
    expect(resString).not.toContain(secretUrl)
    expect(resString).not.toContain(secretToken)
  })
})
