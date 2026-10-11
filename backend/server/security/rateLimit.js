import { Redis } from '@upstash/redis'

/**
 * Validates whether an IP string is a syntactically valid IPv4 or IPv6 address.
 * Prevents header injection or malformed identity identifiers.
 *
 * @param {string} ip
 * @returns {boolean}
 */
export function isValidIp(ip) {
  if (!ip || typeof ip !== 'string' || ip.length > 45) return false
  const trimmed = ip.trim()
  if (trimmed === '127.0.0.1' || trimmed === 'localhost' || trimmed === '::1' || trimmed === '::') {
    return true
  }
  const ipv4Pattern = /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/
  const ipv6Pattern = /^(?:[a-fA-F0-9]{1,4}:){1,7}[a-fA-F0-9]{1,4}$/
  return ipv4Pattern.test(trimmed) || ipv6Pattern.test(trimmed)
}

/**
 * Resolves the client IP address using trusted proxy headers.
 * Prefers x-real-ip or x-vercel-forwarded-for set by the hosting edge/ingress proxy.
 *
 * @param {import('http').IncomingMessage | Object} req
 * @returns {string}
 */
export function resolveTrustedIp(req) {
  if (!req || !req.headers) return '127.0.0.1'

  // 1. x-real-ip: Standard header set by Vercel/Nginx ingress routers (cannot be forged by clients)
  const realIp = req.headers['x-real-ip']
  if (typeof realIp === 'string') {
    const candidate = realIp.trim()
    if (isValidIp(candidate)) return candidate
  }

  // 2. x-vercel-forwarded-for: Specific to Vercel deployment edge
  const vercelIp = req.headers['x-vercel-forwarded-for']
  if (typeof vercelIp === 'string') {
    const candidate = vercelIp.trim()
    if (isValidIp(candidate)) return candidate
  }

  // 3. x-forwarded-for: Validate the first client hop
  const xForwardedFor = req.headers['x-forwarded-for']
  if (typeof xForwardedFor === 'string') {
    const candidate = xForwardedFor.split(',')[0].trim()
    if (isValidIp(candidate)) return candidate
  }

  // 4. Socket remote address
  const socketIp = req.socket?.remoteAddress
  if (typeof socketIp === 'string') {
    const candidate = socketIp.trim()
    if (isValidIp(candidate)) return candidate
  }

  return '127.0.0.1'
}

/**
 * In-memory sliding window rate limiter.
 * Active in local development when Upstash Redis is unconfigured or unreachable.
 * NEVER active as fallback in production.
 */
export class MemoryRateLimiter {
  constructor() {
    this.requests = new Map()
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      for (const [key, timestamps] of this.requests.entries()) {
        const valid = timestamps.filter((t) => now - t < 60000)
        if (valid.length === 0) {
          this.requests.delete(key)
        } else {
          this.requests.set(key, valid)
        }
      }
    }, 300000)

    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref()
    }
  }

  check(identifier, maxRequests = 60, windowMs = 60000) {
    const now = Date.now()
    const timestamps = this.requests.get(identifier) || []
    const valid = timestamps.filter((t) => now - t < windowMs)

    if (valid.length >= maxRequests) {
      const oldest = valid[0]
      const resetMs = Math.max(0, windowMs - (now - oldest))
      return {
        allowed: false,
        remaining: 0,
        resetMs,
        isServiceUnavailable: false,
        source: 'memory',
      }
    }

    valid.push(now)
    this.requests.set(identifier, valid)

    return {
      allowed: true,
      remaining: maxRequests - valid.length,
      resetMs: windowMs,
      isServiceUnavailable: false,
      source: 'memory',
    }
  }

  reset(identifier) {
    this.requests.delete(identifier)
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
  }
}

/**
 * Distributed sliding window rate limiter backed by Upstash Redis.
 * Enforces production fail-closed policy (HTTP 503) and strict timeouts.
 */
export class DistributedRateLimiter {
  constructor(options = {}) {
    this.timeoutMs = options.timeoutMs || 1500
    this.memoryFallback = new MemoryRateLimiter()
    this._redisClient = options.redisClient || null
    this._warnedDevFallback = false
  }

  /**
   * Returns true if running in production (Vercel or NODE_ENV=production).
   */
  isProduction() {
    return process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
  }

  /**
   * Cleans an environment variable value by trimming whitespace and quotation marks.
   */
  _cleanEnvVal(val) {
    if (!val || typeof val !== 'string') return ''
    let v = val.trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1).trim()
    }
    return v
  }

  /**
   * Lazily initializes and returns the Upstash Redis client.
   */
  getRedis() {
    if (this._redisClient) return this._redisClient

    const url = this._cleanEnvVal(process.env.UPSTASH_REDIS_REST_URL)
    const token = this._cleanEnvVal(process.env.UPSTASH_REDIS_REST_TOKEN)

    if (!url || !token) {
      return null
    }

    try {
      this._redisClient = new Redis({ url, token })
      return this._redisClient
    } catch (err) {
      console.error('[RateLimiter] Failed to initialize Upstash Redis client:', err.message)
      return null
    }
  }

  /**
   * Evaluates if a request from an identifier is allowed within the sliding window.
   *
   * @param {string} identifier Key (e.g. "ai:127.0.0.1", "user:uuid-123")
   * @param {number} maxRequests Maximum allowed requests in window
   * @param {number} windowMs Window duration in milliseconds (default 60000)
   * @returns {Promise<{ allowed: boolean, remaining: number, resetMs: number, isServiceUnavailable: boolean, source: string }>}
   */
  async check(identifier, maxRequests = 60, windowMs = 60000) {
    const redis = this.getRedis()
    const isProd = this.isProduction()

    // Scenario A: Redis credentials are missing
    if (!redis) {
      if (isProd) {
        // Production Policy: Fail-Closed with HTTP 503
        console.error('[RateLimiter] CRITICAL: Upstash Redis credentials not configured in production. Enforcing fail-closed policy.')
        return {
          allowed: false,
          remaining: 0,
          resetMs: 30000,
          isServiceUnavailable: true,
          source: 'error_fail_closed',
        }
      }

      // Local Development Policy: Documented in-memory fallback
      if (!this._warnedDevFallback) {
        console.warn('[RateLimiter] Local dev mode: Upstash Redis credentials unset. Falling back to in-memory sliding window.')
        this._warnedDevFallback = true
      }
      return this.memoryFallback.check(identifier, maxRequests, windowMs)
    }

    // Scenario B: Execute distributed sliding window on Upstash Redis with bounded timeout
    const now = Date.now()
    const key = `rl:${identifier}`
    const member = `${now}:${Math.random().toString(36).slice(2, 8)}`

    // Atomic sliding window Lua script
    const luaScript = `
      local key = KEYS[1]
      local now = tonumber(ARGV[1])
      local window = tonumber(ARGV[2])
      local max = tonumber(ARGV[3])
      local member = ARGV[4]

      local clearBefore = now - window
      redis.call('ZREMRANGEBYSCORE', key, 0, clearBefore)
      local count = redis.call('ZCARD', key)

      if count < max then
        redis.call('ZADD', key, now, member)
        redis.call('PEXPIRE', key, window)
        return {1, max - count - 1, window}
      else
        local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
        local oldestScore = (oldest and #oldest >= 2 and tonumber(oldest[2])) or (now - window)
        local resetMs = window - (now - oldestScore)
        if resetMs < 0 then resetMs = 0 end
        return {0, 0, resetMs}
      end
    `

    try {
      const evalPromise = redis.eval(luaScript, [key], [now, windowMs, maxRequests, member])
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Upstash Redis request timeout')), this.timeoutMs)
      )

      const result = await Promise.race([evalPromise, timeoutPromise])

      if (Array.isArray(result) && result.length >= 3) {
        const allowed = result[0] === 1
        const remaining = Number(result[1])
        const resetMs = Number(result[2])

        return {
          allowed,
          remaining,
          resetMs,
          isServiceUnavailable: false,
          source: 'redis',
        }
      }

      throw new Error('Unexpected Redis eval result format')
    } catch (err) {
      console.error('[RateLimiter] Upstash Redis operation failed:', err.message)

      if (isProd) {
        // Production Policy: Fail-Closed on infrastructure outage (HTTP 503)
        return {
          allowed: false,
          remaining: 0,
          resetMs: 30000,
          isServiceUnavailable: true,
          source: 'error_fail_closed',
        }
      }

      // Local Development Policy: In-memory fallback on local failure
      console.warn('[RateLimiter] Local dev mode: Redis operation error. Falling back to in-memory sliding window.')
      return this.memoryFallback.check(identifier, maxRequests, windowMs)
    }
  }

  /**
   * Resets rate limit records for an identifier (useful in tests and manual resets).
   *
   * @param {string} identifier
   */
  async reset(identifier) {
    this.memoryFallback.reset(identifier)
    const redis = this.getRedis()
    if (redis) {
      try {
        await redis.del(`rl:${identifier}`)
      } catch {
        // Non-blocking in reset
      }
    }
  }
}

export const rateLimiter = new DistributedRateLimiter()

/**
 * Express/Connect rate-limiting middleware helper for HTTP endpoints.
 *
 * @param {{ max?: number, windowMs?: number, message?: string }} options
 */
export function createRateLimitMiddleware(options = {}) {
  const max = options.max || 60
  const windowMs = options.windowMs || 60000
  const message = options.message || 'Too many requests. Please try again later.'

  return async function rateLimitMiddleware(req, res, next) {
    const ip = resolveTrustedIp(req)
    const key = `${req.method || 'GET'}:${req.url?.split('?')[0] || '/'}:${ip}`
    const result = await rateLimiter.check(key, max, windowMs)

    res.setHeader('X-RateLimit-Limit', max.toString())
    res.setHeader('X-RateLimit-Remaining', result.remaining.toString())
    res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetMs / 1000).toString())

    if (result.isServiceUnavailable) {
      res.setHeader('Retry-After', '30')
      return res.status(503).json({
        error: 'Rate limit service unavailable. Please retry shortly.',
        retryAfterSeconds: 30,
      })
    }

    if (!result.allowed) {
      const retrySec = Math.ceil(result.resetMs / 1000)
      res.setHeader('Retry-After', retrySec.toString())
      return res.status(429).json({
        error: message,
        retryAfterSeconds: retrySec,
      })
    }

    if (typeof next === 'function') {
      next()
    }
  }
}
