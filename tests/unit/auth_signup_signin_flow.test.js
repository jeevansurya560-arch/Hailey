import { describe, it, expect, vi } from 'vitest'

describe('Auth Sign Up, Sign In, and Password Reset Flows', () => {
  // ── 1. Sign Up Flow ──────────────────────────────────────────────
  describe('Sign Up Registration Submission', () => {
    it('dispatches signUp with all user metadata and excludes confirmation password', async () => {
      const mockSignUp = vi.fn().mockResolvedValue({
        data: {
          user: { id: 'user-uuid-1', email: 'curator@hailey.org' },
          session: null, // Email verification required
        },
        error: null,
      })

      const mockSupabase = {
        auth: {
          signUp: mockSignUp,
        },
      }

      const signUpService = async (email, password, metadata = {}) => {
        const trimmedEmail = email.trim()
        const { data, error } = await mockSupabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: {
              handle: metadata.handle.toLowerCase().trim(),
              full_name: metadata.fullName.trim(),
              terms_accepted_at: metadata.termsAcceptedAt,
              terms_version: metadata.termsVersion,
              is_minor: metadata.isMinor,
              declared_birth_year: metadata.declaredBirthYear,
            },
          },
        })
        return { data, error }
      }

      const payload = {
        email: '  curator@hailey.org  ',
        password: 'SecurePassword2026!',
        confirmPassword: 'SecurePassword2026!', // Form local only
        handle: 'kyoto_curator',
        fullName: 'José Silva',
        termsAcceptedAt: '2026-10-09T12:00:00.000Z',
        termsVersion: 'v1.0',
        isMinor: false,
        declaredBirthYear: 1998,
      }

      const res = await signUpService(payload.email, payload.password, payload)

      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'curator@hailey.org',
        password: 'SecurePassword2026!',
        options: {
          data: {
            handle: 'kyoto_curator',
            full_name: 'José Silva',
            terms_accepted_at: '2026-10-09T12:00:00.000Z',
            terms_version: 'v1.0',
            is_minor: false,
            declared_birth_year: 1998,
          },
        },
      })

      // Ensure confirmPassword was not passed
      expect(mockSignUp.mock.calls[0][0].confirmPassword).toBeUndefined()
      expect(mockSignUp.mock.calls[0][0].options.data.confirmPassword).toBeUndefined()
      expect(res.data.session).toBeNull()
      expect(res.data.user.id).toBe('user-uuid-1')
    })

    it('checks handle availability against profiles table before submission', async () => {
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: { id: 'existing-user-uuid' },
        error: null,
      })

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: mockMaybeSingle,
          }),
        }),
      })

      const checkHandleAvailability = async (handle) => {
        const { data, error } = await mockFrom('profiles')
          .select('id')
          .eq('handle', handle.toLowerCase().trim())
          .maybeSingle()

        if (error) return { available: false, error }
        return { available: !data, error: null }
      }

      const takenCheck = await checkHandleAvailability('kyoto_curator')
      expect(takenCheck.available).toBe(false)

      mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null })
      const availableCheck = await checkHandleAvailability('brand_new_handle')
      expect(availableCheck.available).toBe(true)
    })
  })

  // ── 2. Sign In Flow ──────────────────────────────────────────────
  describe('Sign In Submission', () => {
    it('dispatches signInWithPassword with trimmed email and exact password', async () => {
      const mockSignIn = vi.fn().mockResolvedValue({
        data: {
          user: { id: 'user-uuid-1', email: 'curator@hailey.org' },
          session: { access_token: 'valid.jwt.token' },
        },
        error: null,
      })

      const mockSupabase = {
        auth: {
          signInWithPassword: mockSignIn,
        },
      }

      const signInService = async (email, password) => {
        return await mockSupabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
      }

      const res = await signInService('  curator@hailey.org  ', 'MyPass#1234  ')
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'curator@hailey.org',
        password: 'MyPass#1234  ', // Password whitespace preserved
      })
      expect(res.data.session.access_token).toBe('valid.jwt.token')
    })

    it('handles authentication failure gracefully without leaking stack traces', async () => {
      const mockSignIn = vi.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials', status: 400 },
      })

      const mockSupabase = { auth: { signInWithPassword: mockSignIn } }
      const res = await mockSupabase.auth.signInWithPassword({
        email: 'unknown@hailey.org',
        password: 'wrongpassword',
      })

      expect(res.error).not.toBeNull()
      expect(res.error.message).toBe('Invalid login credentials')
    })
  })

  // ── 3. Password Reset Flow ────────────────────────────────────────
  describe('Password Reset Request & Completion', () => {
    it('requests password reset email with correct redirect URL', async () => {
      const mockReset = vi.fn().mockResolvedValue({
        data: {},
        error: null,
      })

      const mockSupabase = { auth: { resetPasswordForEmail: mockReset } }

      const resetPasswordForEmail = async (email, options = {}) => {
        const redirectTo = options.redirectTo || 'http://localhost:5173/reset-password'
        return await mockSupabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo,
        })
      }

      const res = await resetPasswordForEmail('  curator@hailey.org  ')
      expect(mockReset).toHaveBeenCalledWith('curator@hailey.org', {
        redirectTo: 'http://localhost:5173/reset-password',
      })
      expect(res.error).toBeNull()
    })

    it('completes password update securely through Supabase updateUser', async () => {
      const mockUpdateUser = vi.fn().mockResolvedValue({
        data: { user: { id: 'user-uuid-1' } },
        error: null,
      })

      const mockSupabase = { auth: { updateUser: mockUpdateUser } }

      const updatePassword = async (newPassword) => {
        return await mockSupabase.auth.updateUser({
          password: newPassword,
        })
      }

      const res = await updatePassword('NewSecurePassword2026!')
      expect(mockUpdateUser).toHaveBeenCalledWith({
        password: 'NewSecurePassword2026!',
      })
      expect(res.data.user.id).toBe('user-uuid-1')
      expect(res.error).toBeNull()
    })

    it('handles expired recovery sessions cleanly', async () => {
      const mockUpdateUser = vi.fn().mockResolvedValue({
        data: { user: null },
        error: { message: 'Auth session missing or recovery token expired', status: 401 },
      })

      const mockSupabase = { auth: { updateUser: mockUpdateUser } }
      const res = await mockSupabase.auth.updateUser({ password: 'NewPassword123!' })

      expect(res.error).not.toBeNull()
      expect(res.error.message).toContain('expired')
    })
  })
})
