import React, { useState, useMemo } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Compass,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Mail,
  Calendar,
  KeyRound,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import {
  validateHandle,
  validateFullName,
  validateDateOfBirth,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateTermsAcceptance,
  getDaysInMonth,
} from '../utils/authValidation'
import { getAppUrl } from '../utils/urlUtils'

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export function AuthPage() {
  const location = useLocation()
  const navigate = useNavigate()

  // Mode derived from route: /signup vs /login (defaults to Sign In)
  const isSignUp = location.pathname === '/signup'
  const [isForgotPassword, setIsForgotPassword] = useState(false)

  // Form Fields
  const [handle, setHandle] = useState('')
  const [fullName, setFullName] = useState('')
  const [birthDay, setBirthDay] = useState('')
  const [birthMonth, setBirthMonth] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)

  // UI & Validation States
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [handleError, setHandleError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [googleSubmitting, setGoogleSubmitting] = useState(false)
  const [emailVerificationNotice, setEmailVerificationNotice] = useState(false)
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false)

  const { signIn, signUp, signInWithGoogle, resetPasswordForEmail, checkHandleAvailability } =
    useAuth()

  const from = location.state?.from?.pathname || '/'

  // Derived Real-time Age Notice (Pure render computation)
  const dobResult = useMemo(() => {
    if (birthDay && birthMonth && birthYear) {
      return validateDateOfBirth(birthDay, birthMonth, birthYear)
    }
    return null
  }, [birthDay, birthMonth, birthYear])

  const dobNotice = dobResult?.valid && dobResult?.ageNotice ? dobResult.ageNotice : null

  // Handle availability check on blur
  const handleHandleBlur = async () => {
    if (!handle) {
      setHandleError(null)
      return
    }
    const check = validateHandle(handle)
    if (!check.valid) {
      setHandleError(check.error)
      return
    }

    try {
      const { available, error } = await checkHandleAvailability(check.sanitized)
      if (error) {
        setHandleError(null)
        return
      }
      if (!available) {
        setHandleError('This contributor handle is already taken. Please choose another.')
      } else {
        setHandleError(null)
      }
    } catch {
      setHandleError(null)
    }
  }

  // Google OAuth Flow
  const handleGoogleSignIn = async () => {
    setErrorMsg(null)
    setGoogleSubmitting(true)
    try {
      const { error } = await signInWithGoogle({
        redirectTo: getAppUrl(from),
      })
      if (error) {
        setErrorMsg(error.message || 'Google authentication was cancelled or failed.')
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to initialize Google authentication.')
    } finally {
      setGoogleSubmitting(false)
    }
  }

  // Forgot Password Request Flow
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg(null)

    const emailCheck = validateEmail(email)
    if (!emailCheck.valid) {
      setErrorMsg(emailCheck.error)
      return
    }

    setSubmitting(true)
    try {
      const { error } = await resetPasswordForEmail(emailCheck.sanitized, {
        redirectTo: getAppUrl('/reset-password'),
      })

      if (error) {
        setErrorMsg(error.message || 'Failed to request password reset. Please try again.')
      } else {
        setForgotPasswordSuccess(true)
      }
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'An unexpected error occurred during password reset.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  // Main Form Submission (Sign Up or Sign In)
  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg(null)

    if (isSignUp) {
      // 1. Validate Username / Contributor Handle
      const handleCheck = validateHandle(handle)
      if (!handleCheck.valid) {
        setErrorMsg(handleCheck.error)
        return
      }

      // 2. Validate Full Name
      const nameCheck = validateFullName(fullName)
      if (!nameCheck.valid) {
        setErrorMsg(nameCheck.error)
        return
      }

      // 3. Validate Date of Birth (Day, Month, Year)
      const dobCheck = validateDateOfBirth(birthDay, birthMonth, birthYear)
      if (!dobCheck.valid) {
        setErrorMsg(dobCheck.error)
        return
      }

      // 4. Validate Email Address
      const emailCheck = validateEmail(email)
      if (!emailCheck.valid) {
        setErrorMsg(emailCheck.error)
        return
      }

      // 5. Validate Password
      const passCheck = validatePassword(password)
      if (!passCheck.valid) {
        setErrorMsg(passCheck.error)
        return
      }

      // 6. Validate Confirm Password
      const confirmCheck = validatePasswordConfirmation(password, confirmPassword)
      if (!confirmCheck.valid) {
        setErrorMsg(confirmCheck.error)
        return
      }

      // 7. Validate Terms Acceptance Checkbox
      const termsCheck = validateTermsAcceptance(termsAccepted)
      if (!termsCheck.valid) {
        setErrorMsg(termsCheck.error)
        return
      }

      // Check handle availability one last time before submitting
      const { available } = await checkHandleAvailability(handleCheck.sanitized)
      if (!available) {
        setErrorMsg('This contributor handle is already taken. Please choose another.')
        return
      }

      setSubmitting(true)
      try {
        const { data, error } = await signUp(emailCheck.sanitized, password, {
          handle: handleCheck.sanitized,
          fullName: nameCheck.sanitized,
          termsAcceptedAt: new Date().toISOString(),
          termsVersion: 'v1.0',
          isMinor: dobCheck.isMinor,
          declaredBirthYear: dobCheck.declaredBirthYear,
        })

        if (error) {
          setErrorMsg(error.message)
        } else if (data?.user && !data?.session) {
          // Email confirmation is required by Supabase configuration
          setEmailVerificationNotice(true)
        } else {
          navigate(from, { replace: true })
        }
      } catch (err) {
        setErrorMsg(
          err instanceof Error ? err.message : 'An unexpected error occurred during registration.'
        )
      } finally {
        setSubmitting(false)
      }
    } else {
      // ── Sign In Submission ──
      const emailCheck = validateEmail(email)
      if (!emailCheck.valid) {
        setErrorMsg(emailCheck.error)
        return
      }

      if (!password) {
        setErrorMsg('Password is required.')
        return
      }

      setSubmitting(true)
      try {
        const { error } = await signIn(emailCheck.sanitized, password)
        if (error) {
          setErrorMsg(error.message || 'Invalid email or password.')
        } else {
          navigate(from, { replace: true })
        }
      } catch (err) {
        setErrorMsg(
          err instanceof Error ? err.message : 'An unexpected error occurred during authentication.'
        )
      } finally {
        setSubmitting(false)
      }
    }
  }

  // Generate Year Options for DOB selector (from 2026 down to 1900)
  const yearOptions = useMemo(() => {
    const currentYear = 2026
    const years = []
    for (let y = currentYear; y >= 1900; y--) {
      years.push(y)
    }
    return years
  }, [])

  // Calculate dynamic days in month for the Day selector
  const daysCount = useMemo(() => {
    if (birthMonth && birthYear) {
      return getDaysInMonth(parseInt(birthMonth, 10), parseInt(birthYear, 10))
    }
    return 31
  }, [birthMonth, birthYear])

  const dayOptions = useMemo(() => {
    const days = []
    for (let d = 1; d <= daysCount; d++) {
      days.push(d)
    }
    return days
  }, [daysCount])

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      {/* Desktop Split Container */}
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
              {isForgotPassword
                ? 'Recover your contributor key.'
                : isSignUp
                ? 'Join the living global cultural archive.'
                : 'Welcome back to the field guide.'}
            </h2>

            <p className="text-xs md:text-sm text-[var(--ink-2)] leading-relaxed">
              Curate living heritages, discover astronomical sacred calendars, and verify primary
              anthropological contributions with cryptographic permanence.
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
          {/* Header Title */}
          <div className="mb-6">
            <h3 className="font-serif text-2xl font-bold text-[var(--ink)]">
              {isForgotPassword
                ? 'Reset Password'
                : isSignUp
                ? 'Create Contributor Account'
                : 'Sign In'}
            </h3>
            <p className="text-xs text-[var(--ink-2)] mt-1">
              {isForgotPassword
                ? 'Enter your email address to receive a secure password reset link.'
                : isSignUp
                ? 'Register to curate collections and earn verifiable onchain curator passes.'
                : 'Enter your credentials to access your personalized field guide.'}
            </p>
          </div>

          {/* Alert / Error Notification */}
          {errorMsg && (
            <div
              role="alert"
              className="mb-4 border border-[var(--clay)] bg-[var(--paper)] p-3 text-xs text-[var(--clay)] font-mono rounded flex items-start gap-2"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Email Verification Required Notice */}
          {emailVerificationNotice ? (
            <div className="space-y-4 border border-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 p-5 rounded">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold font-mono text-xs">
                <CheckCircle2 className="h-4 w-4" />
                <span>Verification Email Dispatched</span>
              </div>
              <p className="text-xs text-[var(--ink-2)] leading-relaxed">
                We've sent a verification link to <strong>{email}</strong>. Please check your email inbox and spam folder to confirm your contributor account.
              </p>
              <button
                type="button"
                onClick={() => {
                  setEmailVerificationNotice(false)
                  navigate('/login')
                }}
                className="w-full border border-[var(--ink)] bg-[var(--clay)] px-4 py-2 font-mono text-xs uppercase tracking-wider font-bold text-[var(--paper)] shadow-[2px_2px_0_var(--ink)] hover:opacity-90 transition-opacity"
              >
                Proceed to Sign In
              </button>
            </div>
          ) : isForgotPassword ? (
            /* Forgot Password Flow */
            forgotPasswordSuccess ? (
              <div className="space-y-4 border border-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 p-5 rounded">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold font-mono text-xs">
                  <Mail className="h-4 w-4" />
                  <span>Password Reset Email Sent</span>
                </div>
                <p className="text-xs text-[var(--ink-2)] leading-relaxed">
                  If an account exists for <strong>{email}</strong>, you will receive an email with instructions to reset your password shortly. Please check your spam folder if it doesn't arrive within a few minutes.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false)
                    setForgotPasswordSuccess(false)
                  }}
                  className="w-full border border-[var(--ink)] bg-[var(--clay)] px-4 py-2 font-mono text-xs uppercase tracking-wider font-bold text-[var(--paper)] shadow-[2px_2px_0_var(--ink)] hover:opacity-90 transition-opacity"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="forgot-email"
                    className="block text-xs font-mono uppercase tracking-wider text-[var(--ink-2)] mb-1"
                  >
                    Account Email Address
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="curator@domain.org"
                    required
                    className="w-full border border-[var(--ink)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-2)]/60 focus:outline-none focus:ring-1 focus:ring-[var(--clay)]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full border border-[var(--ink)] bg-[var(--clay)] px-4 py-2.5 font-mono text-xs uppercase tracking-wider font-bold text-[var(--paper)] shadow-[2px_2px_0_var(--ink)] hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending Recovery Email...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-3.5 w-3.5" />
                      <span>Send Password Reset Email</span>
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false)
                      setErrorMsg(null)
                    }}
                    className="text-xs text-[var(--ink-2)] hover:text-[var(--clay)] underline font-sans"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            )
          ) : (
            /* Main Form: Sign Up / Sign In */
            <>
              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={submitting || googleSubmitting}
                className="w-full border border-[var(--ink)] bg-[var(--paper)] px-4 py-2.5 font-mono text-xs uppercase tracking-wider font-bold text-[var(--ink)] shadow-[2px_2px_0_var(--ink)] hover:bg-[var(--paper-2)] disabled:opacity-50 transition-all flex items-center justify-center gap-2 mb-4"
              >
                {googleSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Connecting to Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--line)]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase font-mono">
                  <span className="bg-[var(--paper-2)] px-2 text-[var(--ink-2)]">Or with email</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <>
                    {/* 1. Username / Contributor Handle */}
                    <div>
                      <label
                        htmlFor="auth-handle"
                        className="block text-xs font-mono uppercase tracking-wider text-[var(--ink-2)] mb-1"
                      >
                        1. Username / Contributor Handle <span className="text-[var(--clay)]">*</span>
                      </label>
                      <input
                        id="auth-handle"
                        type="text"
                        value={handle}
                        onChange={(e) => {
                          setHandle(e.target.value.toLowerCase())
                          setHandleError(null)
                        }}
                        onBlur={handleHandleBlur}
                        placeholder="e.g. kyoto_curator"
                        required
                        minLength={3}
                        maxLength={20}
                        className="w-full border border-[var(--ink)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-2)]/60 focus:outline-none focus:ring-1 focus:ring-[var(--clay)]"
                      />
                      {handleError ? (
                        <p className="mt-1 text-[11px] font-mono text-[var(--clay)]">{handleError}</p>
                      ) : (
                        <p className="mt-0.5 text-[10px] font-mono text-[var(--ink-2)]">
                          3–20 lowercase letters, numbers, and underscores.
                        </p>
                      )}
                    </div>

                    {/* 2. Full Name */}
                    <div>
                      <label
                        htmlFor="auth-fullname"
                        className="block text-xs font-mono uppercase tracking-wider text-[var(--ink-2)] mb-1"
                      >
                        2. Full Name <span className="text-[var(--clay)]">*</span>
                      </label>
                      <input
                        id="auth-fullname"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Maya Lin / 林璎 / José Silva"
                        required
                        maxLength={100}
                        className="w-full border border-[var(--ink)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-2)]/60 focus:outline-none focus:ring-1 focus:ring-[var(--clay)]"
                      />
                    </div>

                    {/* 3. Date of Birth — Day / Month / Year */}
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-[var(--ink-2)] mb-1">
                        3. Date of Birth <span className="text-[var(--clay)]">*</span>
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {/* Day Selector */}
                        <div>
                          <label htmlFor="auth-dob-day" className="sr-only">
                            Birth Day
                          </label>
                          <select
                            id="auth-dob-day"
                            value={birthDay}
                            onChange={(e) => setBirthDay(e.target.value)}
                            required
                            className="w-full border border-[var(--ink)] bg-[var(--paper)] px-2 py-2 text-xs md:text-sm text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--clay)]"
                          >
                            <option value="">Day</option>
                            {dayOptions.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Month Selector */}
                        <div>
                          <label htmlFor="auth-dob-month" className="sr-only">
                            Birth Month
                          </label>
                          <select
                            id="auth-dob-month"
                            value={birthMonth}
                            onChange={(e) => setBirthMonth(e.target.value)}
                            required
                            className="w-full border border-[var(--ink)] bg-[var(--paper)] px-2 py-2 text-xs md:text-sm text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--clay)]"
                          >
                            <option value="">Month</option>
                            {MONTH_NAMES.map((name, idx) => (
                              <option key={name} value={idx + 1}>
                                {name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Year Selector */}
                        <div>
                          <label htmlFor="auth-dob-year" className="sr-only">
                            Birth Year
                          </label>
                          <select
                            id="auth-dob-year"
                            value={birthYear}
                            onChange={(e) => setBirthYear(e.target.value)}
                            required
                            className="w-full border border-[var(--ink)] bg-[var(--paper)] px-2 py-2 text-xs md:text-sm text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--clay)]"
                          >
                            <option value="">Year</option>
                            {yearOptions.map((y) => (
                              <option key={y} value={y}>
                                {y}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Under-18 Informative Notice */}
                      {dobNotice && (
                        <div className="mt-2 p-2.5 border border-[var(--saffron)] bg-[var(--saffron)]/10 text-[var(--ink)] text-[11px] font-mono rounded flex items-start gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-[var(--saffron)] shrink-0 mt-0.5" />
                          <span>{dobNotice}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Email Address */}
                <div>
                  <label
                    htmlFor="auth-email"
                    className="block text-xs font-mono uppercase tracking-wider text-[var(--ink-2)] mb-1"
                  >
                    {isSignUp ? '4. Email Address' : 'Email Address'} <span className="text-[var(--clay)]">*</span>
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

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="auth-password"
                      className="block text-xs font-mono uppercase tracking-wider text-[var(--ink-2)]"
                    >
                      {isSignUp ? '5. Password' : 'Password'} <span className="text-[var(--clay)]">*</span>
                    </label>
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true)
                          setErrorMsg(null)
                        }}
                        className="text-[11px] text-[var(--clay)] hover:underline font-mono"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
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
                  {isSignUp && (
                    <p className="mt-0.5 text-[10px] font-mono text-[var(--ink-2)]">
                      Must be at least 8 characters long.
                    </p>
                  )}
                </div>

                {/* Confirm Password (Sign Up only) */}
                {isSignUp && (
                  <div>
                    <label
                      htmlFor="auth-confirm-password"
                      className="block text-xs font-mono uppercase tracking-wider text-[var(--ink-2)] mb-1"
                    >
                      6. Confirm Password <span className="text-[var(--clay)]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="auth-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
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
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* 7. Terms & Conditions Checkbox (Sign Up only) */}
                {isSignUp && (
                  <div className="pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[var(--ink-2)]">
                      <input
                        id="auth-terms"
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-[var(--ink)] text-[var(--clay)] focus:ring-[var(--clay)] cursor-pointer"
                        required
                      />
                      <span>
                        I agree to the{' '}
                        <Link
                          to="/terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--clay)] underline hover:opacity-80 font-medium"
                        >
                          Terms and Conditions
                        </Link>{' '}
                        and{' '}
                        <Link
                          to="/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--clay)] underline hover:opacity-80 font-medium"
                        >
                          Privacy Policy
                        </Link>
                        .
                      </span>
                    </label>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || googleSubmitting}
                  className="w-full border border-[var(--ink)] bg-[var(--clay)] px-4 py-2.5 font-mono text-xs uppercase tracking-wider font-bold text-[var(--paper)] shadow-[2px_2px_0_var(--ink)] hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-1.5 pt-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{isSignUp ? 'Creating Account...' : 'Verifying Credentials...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{isSignUp ? 'Create Contributor Account' : 'Sign In'}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Link between Sign In & Sign Up */}
              <div className="mt-6 border-t border-[var(--line)] pt-4 text-center">
                <Link
                  to={isSignUp ? '/login' : '/signup'}
                  onClick={() => {
                    setErrorMsg(null)
                    setIsForgotPassword(false)
                  }}
                  className="text-xs text-[var(--ink-2)] hover:text-[var(--clay)] transition-colors underline font-sans"
                >
                  {isSignUp
                    ? 'Already a registered contributor? Sign in instead'
                    : "Don't have an account? Create one"}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthPage
