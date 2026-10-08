import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, ShieldCheck, Sparkles, BookOpen, Compass, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [handle, setHandle] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.')
      return
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.')
      return
    }

    if (isSignUp && handle && !/^[a-zA-Z0-9_]{3,20}$/.test(handle)) {
      setErrorMsg('Handle must be 3-20 alphanumeric characters or underscores.')
      return
    }

    setSubmitting(true)
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, handle || undefined)
        if (error) {
          setErrorMsg(error.message)
        } else {
          navigate(from, { replace: true })
        }
      } else {
        const { error } = await signIn(email, password)
        if (error) {
          setErrorMsg(error.message)
        } else {
          navigate(from, { replace: true })
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        setErrorMsg(err.message)
      } else {
        setErrorMsg('An unexpected error occurred during authentication.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      {/* Desktop Split Container (reverses layout when toggled between Login & SignUp) */}
      <div
        className={`w-full max-w-4xl border border-[var(--ink)] bg-[var(--paper-2)] shadow-[var(--shadow-hard)] overflow-hidden flex flex-col transition-all duration-300 ${
          isSignUp ? 'md:flex-row-reverse' : 'md:flex-row'
        }`}
      >
        {/* Editorial Visual & Story Column */}
        <div className="flex-1 bg-[var(--paper)] p-8 md:p-12 flex flex-col justify-between border-b md:border-b-0 border-[var(--line)]">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[var(--clay)] text-[var(--paper)]">
                Autonomous Cultural Atlas
              </span>
              <span className="font-mono text-[10px] text-emerald-800 font-semibold flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                Monad L1 Provenance
              </span>
            </div>

            <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-[var(--ink)] leading-tight">
              {isSignUp
                ? 'Join the living global cultural archive.'
                : 'Welcome back to the field guide.'}
            </h2>

            <p className="text-xs md:text-sm text-[var(--ink-2)] leading-relaxed">
              Curate living heritages, discover astronomical sacred calendars, and verify primary anthropological contributions with cryptographic permanence.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-[var(--line)] space-y-3 font-mono text-[11px] text-[var(--ink-2)]">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[var(--clay)] shrink-0" />
              <span>Academic citations & verified source provenance</span>
            </div>
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-[var(--moss)] shrink-0" />
              <span>Multi-year astronomical & lunar occurrence tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--saffron)] shrink-0" />
              <span>Zero algorithmic lock-in · Curated by cultural bearers</span>
            </div>
          </div>
        </div>

        {/* Authentication Form Column */}
        <div className="flex-1 p-8 md:p-12 bg-[var(--paper-2)] flex flex-col justify-center border-l md:border-l-0 md:border-r border-[var(--line)]">
          <div className="mb-6">
            <h3 className="font-serif text-2xl font-bold text-[var(--ink)]">
              {isSignUp ? 'Create Contributor Account' : 'Sign In'}
            </h3>
            <p className="text-xs text-[var(--ink-2)] mt-1">
              {isSignUp
                ? 'Register to follow threads and earn verifiable curator passes.'
                : 'Enter your credentials to access your personalized feed.'}
            </p>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="mb-4 border border-[var(--clay)] bg-[var(--paper)] p-3 text-xs text-[var(--clay)] font-mono rounded"
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label
                  htmlFor="auth-handle"
                  className="block text-xs font-mono uppercase tracking-wider text-[var(--ink-2)] mb-1"
                >
                  Contributor Handle
                </label>
                <input
                  id="auth-handle"
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.toLowerCase().trim())}
                  placeholder="e.g. kyoto_curator"
                  className="w-full border border-[var(--ink)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-2)]/60 focus:outline-none focus:ring-1 focus:ring-[var(--clay)]"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="auth-email"
                className="block text-xs font-mono uppercase tracking-wider text-[var(--ink-2)] mb-1"
              >
                Email Address
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="curator@domain.org"
                required
                className="w-full border border-[var(--ink)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-2)]/60 focus:outline-none focus:ring-1 focus:ring-[var(--clay)]"
              />
            </div>

            <div>
              <label
                htmlFor="auth-password"
                className="block text-xs font-mono uppercase tracking-wider text-[var(--ink-2)] mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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

            <button
              type="submit"
              disabled={submitting}
              className="w-full border border-[var(--ink)] bg-[var(--clay)] px-4 py-2.5 font-mono text-xs uppercase tracking-wider font-bold text-[var(--paper)] shadow-[2px_2px_0_var(--ink)] hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-1.5"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? 'Create Contributor Account' : 'Sign In'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-[var(--line)] pt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setErrorMsg(null)
              }}
              className="text-xs text-[var(--ink-2)] hover:text-[var(--clay)] transition-colors underline font-sans"
            >
              {isSignUp
                ? 'Already a registered contributor? Sign in instead'
                : "Don't have an account? Create one"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
