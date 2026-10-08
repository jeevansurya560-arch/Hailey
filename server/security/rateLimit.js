/**
 * Robust in-memory sliding window rate limiter with Redis-ready interface.
 * Provides abuse protection against brute force and replay bursts.
 */
class MemoryRateLimiter {
  constructor() {
    this.requests = new Map()
    // Periodic cleanup of expired buckets every 5 minutes
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

  /**
   * Evaluates if a request from an identifier is allowed within the window.
   * @param {string} identifier IP address or user ID
   * @param {number} maxRequests Maximum allowed requests in the time window
   * @param {number} windowMs Window duration in milliseconds (default 60,000ms = 1 min)
   * @returns {{ allowed: boolean, remaining: number, resetMs: number }}
   */
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
      }
    }

    valid.push(now)
    this.requests.set(identifier, valid)

    return {
      allowed: true,
      remaining: maxRequests - valid.length,
      resetMs: windowMs,
    }
  }

  reset(identifier) {
    this.requests.delete(identifier)
  }
}

export const rateLimiter = new MemoryRateLimiter()

/**
 * Express/Connect rate-limiting middleware helper
 * @param {{ max: number, windowMs: number, message?: string }} options
 */
export function createRateLimitMiddleware(options = {}) {
  const max = options.max || 60
  const windowMs = options.windowMs || 60000
  const message = options.message || 'Too many requests. Please try again later.'

  return function rateLimitMiddleware(req, res, next) {
    const ip =
      req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
      req.socket?.remoteAddress ||
      '127.0.0.1'

    const key = `${req.method}:${req.url?.split('?')[0]}:${ip}`
    const result = rateLimiter.check(key, max, windowMs)

    res.setHeader('X-RateLimit-Limit', max.toString())
    res.setHeader('X-RateLimit-Remaining', result.remaining.toString())
    res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetMs / 1000).toString())

    if (!result.allowed) {
      res.setHeader('Retry-After', Math.ceil(result.resetMs / 1000).toString())
      return res.status(429).json({
        error: message,
        retryAfterSeconds: Math.ceil(result.resetMs / 1000),
      })
    }

    if (typeof next === 'function') {
      next()
    }
  }
}
