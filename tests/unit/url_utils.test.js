import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getAppUrl } from '@/features/auth/utils/urlUtils'

describe('URL Resolution Utility (getAppUrl)', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    delete import.meta.env.VITE_APP_URL
    delete import.meta.env.VITE_SITE_URL
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    delete globalThis.window
  })

  it('falls back to localhost default when window is undefined and no env is set', () => {
    const url = getAppUrl('/reset-password')
    expect(url).toBe('http://localhost:5173/reset-password')
  })

  it('uses window.location.origin when in browser environment and no env is set', () => {
    globalThis.window = { location: { origin: 'https://preview.local:3000' } }
    const url = getAppUrl('/reset-password')
    expect(url).toBe('https://preview.local:3000/reset-password')
  })

  it('defaults to window.location.origin root when path is omitted', () => {
    globalThis.window = { location: { origin: 'https://preview.local:3000' } }
    const url = getAppUrl()
    expect(url).toBe('https://preview.local:3000')
  })

  it('uses VITE_APP_URL when defined and strips trailing slashes', () => {
    import.meta.env.VITE_APP_URL = 'https://staging.hailey.org/'
    const url = getAppUrl('/reset-password')
    expect(url).toBe('https://staging.hailey.org/reset-password')
  })

  it('uses VITE_SITE_URL as fallback when VITE_APP_URL is not defined', () => {
    import.meta.env.VITE_SITE_URL = 'https://hailey.org'
    const url = getAppUrl('/login')
    expect(url).toBe('https://hailey.org/login')
  })

  it('handles paths missing leading slash correctly', () => {
    import.meta.env.VITE_APP_URL = 'https://hailey.org'
    const url = getAppUrl('reset-password')
    expect(url).toBe('https://hailey.org/reset-password')
  })

  it('preserves clean URL without trailing slash when path is empty string', () => {
    import.meta.env.VITE_APP_URL = 'https://hailey.org/'
    const url = getAppUrl('')
    expect(url).toBe('https://hailey.org')
  })
})
