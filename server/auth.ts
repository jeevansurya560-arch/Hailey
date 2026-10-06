import type { User } from '@supabase/supabase-js'
import { supabaseAdmin } from './supabaseAdmin.js'

export interface AuthResult {
  user: User | null
  error: string | null
}

/**
 * Verifies the Supabase JWT token from the Authorization header.
 * @param authHeader - Standard 'Bearer <token>' string
 * @returns {Promise<AuthResult>}
 */
export async function verifyAuth(authHeader: string | undefined): Promise<AuthResult> {
  if (!authHeader) {
    return { user: null, error: 'Missing Authorization header' }
  }

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return { user: null, error: 'Invalid Authorization header format. Expected Bearer <token>' }
  }

  const token = parts[1]
  if (!token) {
    return { user: null, error: 'Missing bearer token' }
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !user) {
      return { user: null, error: error?.message || 'Invalid or expired authentication token' }
    }
    return { user, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Authentication verification failed'
    return { user: null, error: msg }
  }
}
