import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [handle, setHandle] = useState('')
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
        setErrorMsg('An unexpected error occurred')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md border border-[var(--ink)] bg-[var(--paper-2)] p-6 md:p-8 shadow-[var(--shadow-hard)]">
        <div className="mb-6 text-center">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[var(--ink)]">
            {isSignUp ? 'Join Hailey' : 'Welcome back'}
          </h1>
          <p className="mt-2 text-sm text-[var(--ink-2)]">
            {isSignUp
              ? 'Create an account to explore and contribute to cultural threads.'
              : 'Sign in to access your saved threads and communities.'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 border border-[var(--clay)] bg-[var(--paper)] p-3 text-xs text-[var(--clay)] font-mono">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[var(--ink-2)] mb-1">
                Handle
              </label>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value.toLowerCase().trim())}
                placeholder="yourhandle"
                className="w-full border border-[var(--ink)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--clay)]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[var(--ink-2)] mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full border border-[var(--ink)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--clay)]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[var(--ink-2)] mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              className="w-full border border-[var(--ink)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--clay)]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full border border-[var(--ink)] bg-[var(--clay)] px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-[var(--paper)] shadow-[var(--shadow-hard)] hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {submitting ? 'Authenticating...' : isSignUp ? 'Create Account' : 'Sign In'}
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
              ? 'Already have an account? Sign in instead'
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  )
}
