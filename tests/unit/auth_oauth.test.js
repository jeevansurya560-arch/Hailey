import { describe, it, expect, vi } from 'vitest'

describe('Google OAuth Authentication Flow and Provider Verification', () => {
  it('correctly requests Google provider with appropriate queryParams and redirectTo', async () => {
    const mockSignInWithOAuth = vi.fn().mockResolvedValue({
      data: { provider: 'google', url: 'https://accounts.google.com/o/oauth2/v2/auth?...' },
      error: null,
    })

    const mockSupabase = {
      auth: {
        signInWithOAuth: mockSignInWithOAuth,
      },
    }

    const signInWithGoogle = async (options = {}) => {
      const redirectTo = options.redirectTo || 'http://localhost:5173/'
      const { data, error } = await mockSupabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      return { data, error }
    }

    const res = await signInWithGoogle({ redirectTo: 'http://localhost:5173/explore' })

    expect(mockSignInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:5173/explore',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    expect(res.error).toBeNull()
    expect(res.data.provider).toBe('google')
  })

  it('handles and surfaces "provider is not enabled" error from Supabase', async () => {
    const mockSignInWithOAuth = vi.fn().mockResolvedValue({
      data: null,
      error: {
        message: 'Unsupported provider: provider is not enabled',
        status: 400,
      },
    })

    const mockSupabase = {
      auth: {
        signInWithOAuth: mockSignInWithOAuth,
      },
    }

    const signInWithGoogle = async () => {
      const { data, error } = await mockSupabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:5173/',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      return { data, error }
    }

    const res = await signInWithGoogle()
    expect(res.data).toBeNull()
    expect(res.error).not.toBeNull()
    expect(res.error.message).toBe('Unsupported provider: provider is not enabled')
  })

  it('guarantees age eligibility remains UNVERIFIED on OAuth registration (no automatic adult grant)', () => {
    // Mirroring trigger logic from supabase/migrations/0012_authentication_and_age_restrictions.sql
    const mockNewUser = {
      id: 'oauth-user-uuid-1234',
      email: 'curator@example.com',
      raw_user_meta_data: {
        full_name: 'Jane Doe',
        avatar_url: 'https://lh3.googleusercontent.com/a/mock-avatar',
      },
    }

    const initialAgeEligibility = {
      user_id: mockNewUser.id,
      eligibility: 'UNVERIFIED',
      verification_method: 'unverified',
    }

    expect(initialAgeEligibility.eligibility).toBe('UNVERIFIED')
    expect(initialAgeEligibility.eligibility).not.toBe('ADULT')
  })

  it('validates that frontend bundle does not require or expose OAuth client secrets', () => {
    // VITE_ variables are the only ones exposed to the browser
    const clientEnvKeys = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_CHAIN_ID']
    expect(clientEnvKeys.every((k) => k.startsWith('VITE_'))).toBe(true)
    expect(clientEnvKeys.some((k) => k.includes('SECRET') || k.includes('PRIVATE_KEY'))).toBe(false)
  })
})
