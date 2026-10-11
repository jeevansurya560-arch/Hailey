/**
 * Application URL Resolution Utility for Authentication Redirects
 *
 * Resolves the canonical base application URL for Supabase Auth flows
 * (email confirmation, password recovery, and OAuth redirects) without
 * hardcoding device-specific IPs or inventing speculative production domains.
 */

/**
 * Resolves the base application URL and appends the requested path.
 *
 * Priority:
 * 1. import.meta.env.VITE_APP_URL (Reachable staging or production HTTPS domain)
 * 2. import.meta.env.VITE_SITE_URL (Alternative standard site URL variable)
 * 3. window.location.origin (Current browser origin)
 * 4. Fallback default: 'http://localhost:5173'
 *
 * @param {string} [path='']
 * @returns {string} Fully-qualified absolute URL
 */
export function getAppUrl(path = '') {
  let baseUrl = ''

  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const envUrl = import.meta.env.VITE_APP_URL || import.meta.env.VITE_SITE_URL
    if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
      baseUrl = envUrl.trim().replace(/\/+$/, '')
    }
  }

  if (!baseUrl) {
    if (typeof window !== 'undefined' && window.location?.origin) {
      baseUrl = window.location.origin.replace(/\/+$/, '')
    } else {
      baseUrl = 'http://localhost:5173'
    }
  }

  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : ''
  return `${baseUrl}${cleanPath}`
}
