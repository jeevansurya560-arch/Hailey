import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, ArrowLeft, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import { DateOfBirthSelector } from '../components/DateOfBirthSelector'
import { validateDateOfBirth } from '../utils/authValidation'
import { getAppUrl } from '../utils/urlUtils'
import BlurText from '@/components/BlurText'

import { ARCHIVE_CULTURAL_IMAGES } from '../constants/culturalArchiveImages'

function BotanicalEmblem({ className = "h-7 w-7 text-[#6A1F35]" }) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 32V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M18 8C14 11 9 13 5 13C8 16 13 16 18 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18 8C22 11 27 13 31 13C28 16 23 16 18 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18 17C13.5 19.5 8.5 20.5 5 22C8.5 24 13.5 23 18 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18 17C22.5 19.5 27.5 20.5 31 22C27.5 24 22.5 23 18 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="18" cy="5" r="2" fill="currentColor"/>
    </svg>
  )
}

function GoogleIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
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
  )
}

export function AuthPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, loading: authLoading, signIn, signUp, signInWithGoogle, oauthError, clearOAuthError } = useAuth()

  const from = location.state?.from?.pathname || '/'

  const isInitiallySignUp = location.pathname === '/signup'
  const [isSignUp, setIsSignUp] = useState(isInitiallySignUp)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [handle, setHandle] = useState('')
  const [dob, setDob] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState(oauthError || null)
  const [submitting, setSubmitting] = useState(false)
  const [googleSubmitting, setGoogleSubmitting] = useState(false)
  const [imageList, setImageList] = useState(ARCHIVE_CULTURAL_IMAGES)
  const [imageIndex, setImageIndex] = useState(isInitiallySignUp ? 1 : 0)

  // Redirect already authenticated users (or OAuth completions) to intended route
  useEffect(() => {
    if (!authLoading && user) {
      navigate(from, { replace: true })
    }
  }, [user, authLoading, from, navigate])

  // Surface any OAuth redirect or session errors without cascading renders
  const [prevOauthError, setPrevOauthError] = useState(oauthError)
  if (prevOauthError !== oauthError) {
    setPrevOauthError(oauthError)
    if (oauthError) {
      setErrorMsg(oauthError)
    }
  }

  // Sync state and image if URL changes between /login and /signup without cascading renders
  const [prevPathname, setPrevPathname] = useState(location.pathname)
  if (prevPathname !== location.pathname) {
    setPrevPathname(location.pathname)
    const nextSignUp = location.pathname === '/signup'
    setIsSignUp(nextSignUp)
    setImageIndex(nextSignUp ? 1 : 0)
    setErrorMsg(null)
  }

  // Query live images from database tables (posts, communities, culture_master_dataset)
  useEffect(() => {
    let isMounted = true
    async function fetchDatabaseImages() {
      try {
        const [postsRes, commsRes, cultureRes] = await Promise.allSettled([
          supabase
            .from('posts')
            .select('id, media_url, media_credit, body')
            .not('media_url', 'is', null)
            .limit(6),
          supabase
            .from('communities')
            .select('id, cover_url, name')
            .not('cover_url', 'is', null)
            .limit(6),
          supabase
            .from('culture_master_dataset')
            .select('id, media, name, origin')
            .limit(6),
        ])

        const dbImages = []

        if (postsRes.status === 'fulfilled' && postsRes.value.data) {
          postsRes.value.data.forEach((p, idx) => {
            if (p.media_url?.startsWith('http')) {
              dbImages.push({
                id: `db-post-${p.id || idx}`,
                url: p.media_url,
                title: p.media_credit || p.body?.slice(0, 35) || 'Community Cultural Record',
                origin: 'Community Archive',
                description: p.body?.slice(0, 80) || 'Living heritage record from community archives.',
              })
            }
          })
        }

        if (commsRes.status === 'fulfilled' && commsRes.value.data) {
          commsRes.value.data.forEach((c, idx) => {
            if (c.cover_url?.startsWith('http')) {
              dbImages.push({
                id: `db-comm-${c.id || idx}`,
                url: c.cover_url,
                title: c.name,
                origin: 'Cultural Collective',
                description: 'Preserving collective traditions and communal practices.',
              })
            }
          })
        }

        if (cultureRes.status === 'fulfilled' && cultureRes.value.data) {
          cultureRes.value.data.forEach((item, idx) => {
            const heroUrl = item.media?.hero_image_url
            if (heroUrl?.startsWith('http')) {
              dbImages.push({
                id: `db-culture-${item.id || idx}`,
                url: heroUrl,
                title: item.name,
                origin: item.origin || 'Master Cultural Dataset',
                description: 'Structured research node from the 1M Culture Master Dataset.',
              })
            }
          })
        }

        if (isMounted && dbImages.length > 0) {
          setImageList((prev) => [...dbImages, ...prev])
        }
      } catch {
        // Fallback images already present
      }
    }

    fetchDatabaseImages()
    return () => {
      isMounted = false
    }
  }, [])

  const currentImage = imageList[imageIndex % imageList.length] || ARCHIVE_CULTURAL_IMAGES[0]

  const handleNextImage = (e) => {
    e?.preventDefault?.()
    setImageIndex((prev) => (prev + 1) % imageList.length)
  }

  const handlePrevImage = (e) => {
    e?.preventDefault?.()
    setImageIndex((prev) => (prev - 1 + imageList.length) % imageList.length)
  }

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

    let dobVal = null
    if (isSignUp) {
      if (!dob) {
        setErrorMsg('Please select your complete Date of Birth (Month, Day, Year).')
        return
      }

      const parts = dob.split('-')
      if (parts.length === 3) {
        dobVal = validateDateOfBirth(parts[2], parts[1], parts[0])
      }

      if (!dobVal || !dobVal.valid) {
        setErrorMsg(dobVal?.error || 'Invalid Date of Birth.')
        return
      }

      if (confirmPassword && password !== confirmPassword) {
        setErrorMsg('Passwords do not match.')
        return
      }

      if (handle && !/^[a-zA-Z0-9_]{3,20}$/.test(handle)) {
        setErrorMsg('Contributor handle must be 3-20 alphanumeric characters or underscores.')
        return
      }

      if (!agreeTerms) {
        setErrorMsg('Please agree to the Terms of Service and Privacy Policy to continue.')
        return
      }
    }

    setSubmitting(true)
    try {
      if (isSignUp) {
        const { error } = await signUp(
          email,
          password,
          {
            handle: handle || undefined,
            fullName: fullName.trim() || undefined,
            declaredBirthYear: dobVal?.declaredBirthYear,
            isMinor: Boolean(dobVal?.isMinor),
            birthDate: dobVal?.birthDateString,
            termsAcceptedAt: new Date().toISOString(),
            termsVersion: 'v1.0',
          },
          fullName.trim() || undefined
        )
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

  const handleGoogleSignIn = async () => {
    setErrorMsg(null)
    clearOAuthError?.()
    setGoogleSubmitting(true)
    try {
      const redirectUrl = getAppUrl(from || '/')
      const { error } = await signInWithGoogle({
        redirectTo: redirectUrl,
      })
      if (error) {
        setErrorMsg(error.message)
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to initiate Google authentication.')
    } finally {
      setGoogleSubmitting(false)
    }
  }

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-8 sm:py-12">
      {/* Desktop Split-Screen Container: Image ALWAYS on LEFT, Form ALWAYS on RIGHT */}
      <div className="w-full max-w-5xl neu-card rounded-3xl bg-[#FAF6EF] border border-[#E0D4C5] shadow-2xl overflow-hidden flex flex-col md:flex-row transition-all duration-300">

        {/* ======================================================== */}
        {/* LEFT SIDE: Authentic Cultural Photograph & Editorial Quote */}
        {/* ======================================================== */}
        <div className="md:w-5/12 lg:w-1/2 relative bg-[#34252A] overflow-hidden flex flex-col justify-between p-6 sm:p-8 lg:p-10 border-b md:border-b-0 md:border-r border-[#E0D4C5]">
          {/* Background Cultural Photograph from Database */}
          <img
            key={currentImage.url}
            src={currentImage.url}
            alt={currentImage.title}
            className="absolute inset-0 w-full h-full object-cover object-center z-0 transition-opacity duration-700 animate-fade-in"
          />

          {/* Vignette Overlay for Crisp Typography Contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/35 z-0" />

          {/* Top Left: Hailey Branding & Wordmark + Back to Home */}
          <div className="relative z-10 flex items-center justify-between gap-3">
            <Link
              to="/"
              className="flex items-center gap-3 group hover:opacity-95 transition-opacity"
              title="Return to Hailey Homepage"
            >
              <BotanicalEmblem className="h-8 w-8 text-[#FAF6EF] transition-transform group-hover:scale-105" />
              <div className="flex flex-col">
                <span className="font-serif text-2xl font-bold tracking-tight text-white leading-none">
                  Hailey
                </span>
                <span className="font-sans text-[9px] tracking-[0.25em] text-[#B08A50] uppercase font-semibold mt-1">
                  PEOPLE · CULTURE · BELONGING
                </span>
              </div>
            </Link>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white/90 text-xs backdrop-blur-sm border border-white/20 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </div>

          {/* Bottom Left: Short Editorial Statement & Database Image Attribution */}
          <div className="relative z-10 space-y-4 pt-16 md:pt-32">
            <div className="space-y-2">
              <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#B08A50] font-bold block">
                {isSignUp ? 'JOIN THE LIVING ARCHIVE' : 'CULTURAL RECORD'}
              </span>
              <p className="font-serif italic text-lg sm:text-xl lg:text-2xl text-white font-normal leading-snug drop-shadow-sm">
                “Discover the traditions, stories, and celebrations that connect us.”
              </p>
            </div>

            {/* Cultural Record Attribution & Database Image Switcher */}
            <div className="pt-3 border-t border-white/20 flex items-center justify-between gap-3 text-white/90 font-sans">
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-white truncate" title={currentImage.title}>
                  {currentImage.title}
                </span>
                <span className="block text-[10px] text-[#B08A50] font-medium tracking-wide">
                  {currentImage.origin}
                </span>
              </div>

              {/* Interactive Image Switcher Controls */}
              <div className="flex items-center gap-1 shrink-0 bg-black/50 px-2.5 py-1 rounded-full border border-white/20 backdrop-blur-xs">
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="p-1 text-white/80 hover:text-[#B08A50] transition-colors focus:outline-none"
                  aria-label="Previous cultural archive image"
                  title="Previous image"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[10px] text-[#FAF6EF]/80 px-1 select-none">
                  {(imageIndex % imageList.length) + 1}/{imageList.length}
                </span>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="p-1 text-white/80 hover:text-[#B08A50] transition-colors focus:outline-none"
                  aria-label="Next cultural archive image"
                  title="Next image"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT SIDE: Authentication Form Column */}
        {/* ======================================================== */}
        <div className="md:w-7/12 lg:w-1/2 p-6 sm:p-10 lg:p-12 bg-[#FAF6EF] flex flex-col justify-center">

          {/* Mobile Back to Home Link */}
          <div className="mb-4 md:hidden">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#75666B] hover:text-[#6A1F35] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Header Title with BlurText */}
          <div className="mb-6">
            <span className="font-mono text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-[#6A1F35] text-[#FAF6EF] shadow-xs inline-block mb-2">
              {isSignUp ? 'New Contributor' : 'Welcome Back'}
            </span>
            <BlurText
              as="h1"
              key={isSignUp ? 'signup-heading' : 'signin-heading'}
              text={isSignUp ? 'Create an Account' : 'Sign in to Hailey'}
              delay={90}
              animateBy="words"
              direction="top"
              className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#34252A] leading-tight"
            />
            <p className="text-xs sm:text-sm text-[#75666B] mt-1.5 leading-relaxed">
              {isSignUp
                ? 'Join the living global archive to curate traditions and attest cultural knowledge.'
                : 'Enter your credentials to access your personalized feed and saved archives.'}
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div
              role="alert"
              className="mb-5 border border-rose-200 bg-rose-50/90 p-3.5 text-xs text-rose-800 rounded-xl neu-card flex items-start gap-2 animate-fade-in"
            >
              <span className="font-bold shrink-0">Error:</span>
              <span className="flex-1 font-sans">{errorMsg}</span>
            </div>
          )}

          {/* Google Sign-In Button */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleSubmitting}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white hover:bg-[#F0E7DA]/50 border border-[#E0D4C5] text-xs sm:text-sm font-medium text-[#34252A] transition-all neu-card active:neu-inset focus-visible:ring-2 focus-visible:ring-[#6A1F35] disabled:opacity-50"
            >
              {googleSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#6A1F35]" />
              ) : (
                <GoogleIcon className="h-4 w-4" />
              )}
              <span>Continue with Google</span>
            </button>

            {/* Subtle Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-[#E0D4C5] w-full" />
              <span className="bg-[#FAF6EF] px-3 font-mono text-[10px] uppercase text-[#75666B] tracking-wider absolute">
                or with email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 mt-4">
            {isSignUp && (
              <>
                {/* Full Name */}
                <div className="space-y-1">
                  <label
                    htmlFor="auth-name"
                    className="block text-xs font-mono uppercase tracking-wider text-[#34252A]/80 font-medium"
                  >
                    Full Name
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Maya Chen"
                    autoComplete="name"
                    className="w-full neu-inset-input rounded-xl border border-[#E0D4C5] bg-[#FAF6EF] px-3.5 py-2.5 text-sm text-[#34252A] placeholder:text-[#75666B]/50 focus:outline-none focus:ring-1 focus:ring-[#6A1F35] transition-all"
                  />
                </div>

                {/* Username / Contributor Handle */}
                <div className="space-y-1">
                  <label
                    htmlFor="auth-handle"
                    className="block text-xs font-mono uppercase tracking-wider text-[#34252A]/80 font-medium"
                  >
                    Contributor Handle / Username
                  </label>
                  <input
                    id="auth-handle"
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value.toLowerCase().trim())}
                    placeholder="e.g. kyoto_curator"
                    className="w-full neu-inset-input rounded-xl border border-[#E0D4C5] bg-[#FAF6EF] px-3.5 py-2.5 text-sm text-[#34252A] placeholder:text-[#75666B]/50 focus:outline-none focus:ring-1 focus:ring-[#6A1F35] transition-all"
                  />
                </div>

                {/* Date of Birth Selector */}
                <DateOfBirthSelector
                  value={dob}
                  onChange={(canonicalDate) => {
                    setDob(canonicalDate)
                    if (errorMsg) setErrorMsg(null)
                  }}
                  disabled={submitting}
                />
              </>
            )}

            {/* Email Address */}
            <div className="space-y-1">
              <label
                htmlFor="auth-email"
                className="block text-xs font-mono uppercase tracking-wider text-[#34252A]/80 font-medium"
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
                className="w-full neu-inset-input rounded-xl border border-[#E0D4C5] bg-[#FAF6EF] px-3.5 py-2.5 text-sm text-[#34252A] placeholder:text-[#75666B]/50 focus:outline-none focus:ring-1 focus:ring-[#6A1F35] transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="auth-password"
                  className="block text-xs font-mono uppercase tracking-wider text-[#34252A]/80 font-medium"
                >
                  Password
                </label>
                {!isSignUp && (
                  <Link
                    to="/forgot-password"
                    className="text-xs text-[#6A1F35] hover:text-[#511528] hover:underline transition-colors font-medium"
                  >
                    Forgot password?
                  </Link>
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
                  className="w-full neu-inset-input rounded-xl border border-[#E0D4C5] bg-[#FAF6EF] px-3.5 py-2.5 text-sm text-[#34252A] placeholder:text-[#75666B]/50 focus:outline-none focus:ring-1 focus:ring-[#6A1F35] pr-10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#75666B] hover:text-[#34252A] transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Sign Up Only) */}
            {isSignUp && (
              <div className="space-y-1">
                <label
                  htmlFor="auth-confirm-password"
                  className="block text-xs font-mono uppercase tracking-wider text-[#34252A]/80 font-medium"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="auth-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="w-full neu-inset-input rounded-xl border border-[#E0D4C5] bg-[#FAF6EF] px-3.5 py-2.5 text-sm text-[#34252A] placeholder:text-[#75666B]/50 focus:outline-none focus:ring-1 focus:ring-[#6A1F35] pr-10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#75666B] hover:text-[#34252A] transition-colors p-1"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Terms and Privacy Checkbox (Sign Up Only) */}
            {isSignUp && (
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#34252A]/80 leading-relaxed select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[#E0D4C5] text-[#6A1F35] focus:ring-[#6A1F35] accent-[#6A1F35]"
                    required
                  />
                  <span>
                    I agree to Hailey&apos;s{' '}
                    <Link to="/terms" target="_blank" className="text-[#6A1F35] hover:underline font-semibold">
                      Terms & Conditions
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" target="_blank" className="text-[#6A1F35] hover:underline font-semibold">
                      Privacy Policy
                    </Link>.
                  </span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full py-3.5 px-6 font-mono text-xs uppercase tracking-wider font-bold bg-[#6A1F35] text-[#FAF6EF] shadow-md hover:bg-[#511528] active:bg-[#3D0F1D] disabled:opacity-50 transition-all flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-[#B08A50] cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#FAF6EF]" />
                    <span className="text-[#FAF6EF] font-bold">Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span className="text-[#FAF6EF] font-bold tracking-wider">
                      {isSignUp ? 'Create Contributor Account' : 'Sign In'}
                    </span>
                    <ArrowRight className="h-4 w-4 text-[#FAF6EF]" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Toggle Link Between Sign In & Sign Up */}
          <div className="mt-6 border-t border-[#E0D4C5] pt-4 text-center">
            {isSignUp ? (
              <p className="text-xs text-[#75666B]">
                Already a registered contributor?{' '}
                <Link
                  to="/login"
                  className="text-[#6A1F35] hover:text-[#511528] font-semibold hover:underline transition-colors"
                >
                  Sign in instead
                </Link>
              </p>
            ) : (
              <p className="text-xs text-[#75666B]">
                Don&apos;t have an account?{' '}
                <Link
                  to="/signup"
                  className="text-[#6A1F35] hover:text-[#511528] font-semibold hover:underline transition-colors"
                >
                  Create one now
                </Link>
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default AuthPage
