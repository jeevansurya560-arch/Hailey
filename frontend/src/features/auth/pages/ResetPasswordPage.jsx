import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ShieldCheck, KeyRound, CheckCircle2, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '../hooks/useAuth'
import { validatePassword, validatePasswordConfirmation } from '../utils/authValidation'

function getInitialUrlError() {
  if (typeof window === 'undefined') return null
  try {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const searchParams = new URLSearchParams(window.location.search)
    const error = hashParams.get('error') || searchParams.get('error')
    const errorDescription =
      hashParams.get('error_description') || searchParams.get('error_description')
    const errorCode = hashParams.get('error_code') || searchParams.get('error_code')

    if (error || errorCode || errorDescription) {
      if (errorCode === 'otp_expired') {
        return 'Your password reset link has expired. Please request a new one.'
      }
      return errorDescription
        ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
        : 'The recovery link is invalid or has expired.'
    }
  } catch {
    // Ignore URL parse errors
  }
  return null
}

export function ResetPasswordPage() {
  const initialError = getInitialUrlError()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isRecoverySession, setIsRecoverySession] = useState(false)
  const [checkingSession, setCheckingSession] = useState(() => !initialError)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState(initialError)
  const [success, setSuccess] = useState(false)

  const { updatePassword } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (initialError) return

    // 1. Check existing session on load
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (session) {
          setIsRecoverySession(true)
        }
        setCheckingSession(false)
      })
      .catch(() => {
        setCheckingSession(false)
      })

    // 2. Listen for auth state changes (especially PASSWORD_RECOVERY)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setIsRecoverySession(true)
      }
      setCheckingSession(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [initialError])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg(null)

    // Validate password
    const passCheck = validatePassword(password)
    if (!passCheck.valid) {
      setErrorMsg(passCheck.error)
      return
    }

    // Validate confirmation
    const confirmCheck = validatePasswordConfirmation(password, confirmPassword)
    if (!confirmCheck.valid) {
      setErrorMsg(confirmCheck.error)
      return
    }

    setSubmitting(true)
    try {
      const { error } = await updatePassword(password)
      if (error) {
        setErrorMsg(error.message || 'Failed to update password. Your recovery link may have expired.')
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setSubmitting(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--clay)]" />
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--ink-2)]">
          Verifying security recovery link...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md border border-[var(--ink)] bg-[var(--paper-2)] p-8 shadow-[var(--shadow-hard)] space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[var(--clay)] text-[var(--paper)]">
              Account Recovery
            </span>
            <span className="font-mono text-[10px] text-emerald-800 font-semibold flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              Secured Channel
            </span>
          </div>

          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[var(--ink)]">
            Reset Your Password
          </h1>
          <p className="text-xs text-[var(--ink-2)]">
            Enter a new secure password for your Hailey contributor account.
          </p>
        </div>

        {/* Success State */}
        {success ? (
          <div className="space-y-4 border border-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 p-5 rounded">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold font-mono text-xs">
              <CheckCircle2 className="h-4 w-4" />
              <span>Password Updated Successfully</span>
            </div>
            <p className="text-xs text-[var(--ink-2)] leading-relaxed">
              Your password has been updated. You can now use your new password to sign in across all devices.
            </p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full border border-[var(--ink)] bg-[var(--clay)] px-4 py-2 font-mono text-xs uppercase tracking-wider font-bold text-[var(--paper)] shadow-[2px_2px_0_var(--ink)] hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
            >
              <span>Proceed to Sign In</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : !isRecoverySession ? (
          /* Invalid or Missing Recovery Session */
          <div className="space-y-4 border border-[var(--clay)] bg-[var(--paper)] p-5 rounded">
            <div className="flex items-center gap-2 text-[var(--clay)] font-bold font-mono text-xs">
              <AlertCircle className="h-4 w-4" />
              <span>Recovery Link Required</span>
            </div>
            <p className="text-xs text-[var(--ink-2)] leading-relaxed">
              {errorMsg ||
                'No active recovery session was detected. Your password reset link may have expired, or you may have already used it.'}
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                className="w-full border border-[var(--ink)] bg-[var(--paper)] px-4 py-2 font-mono text-xs uppercase tracking-wider text-[var(--ink)] text-center shadow-[2px_2px_0_var(--ink)] hover:bg-[var(--paper-2)] transition-all"
              >
                Request New Reset Link
              </Link>
              <Link
                to="/login"
                className="text-center text-xs text-[var(--ink-2)] hover:text-[var(--clay)] underline"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          /* Reset Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div
                role="alert"
                className="border border-[var(--clay)] bg-[var(--paper)] p-3 text-xs text-[var(--clay)] font-mono rounded flex items-start gap-2"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* New Password */}
            <div>
              <label
                htmlFor="reset-password"
                className="block text-xs font-mono uppercase tracking-wider text-[var(--ink-2)] mb-1"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="reset-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  className="w-full border border-[var(--ink)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-2)]/60 focus:outline-none focus:ring-1 focus:ring-[var(--clay)] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-2)] hover:text-[var(--ink)]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label
                htmlFor="reset-confirm-password"
                className="block text-xs font-mono uppercase tracking-wider text-[var(--ink-2)] mb-1"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="reset-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  required
                  minLength={8}
                  className="w-full border border-[var(--ink)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-2)]/60 focus:outline-none focus:ring-1 focus:ring-[var(--clay)] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-2)] hover:text-[var(--ink)]"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full border border-[var(--ink)] bg-[var(--clay)] px-4 py-2.5 font-mono text-xs uppercase tracking-wider font-bold text-[var(--paper)] shadow-[2px_2px_0_var(--ink)] hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-1.5"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>Update Password</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="text-xs text-[var(--ink-2)] hover:text-[var(--clay)] underline"
              >
                Return to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ResetPasswordPage
