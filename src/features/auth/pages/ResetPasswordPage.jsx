import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Loader2, Lock, Eye, EyeOff, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
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

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const [imageIndex, setImageIndex] = useState(3)

  const currentImage = ARCHIVE_CULTURAL_IMAGES[imageIndex % ARCHIVE_CULTURAL_IMAGES.length]

  const handleNextImage = () => {
    setImageIndex((prev) => (prev + 1) % ARCHIVE_CULTURAL_IMAGES.length)
  }

  const handlePrevImage = () => {
    setImageIndex((prev) => (prev - 1 + ARCHIVE_CULTURAL_IMAGES.length) % ARCHIVE_CULTURAL_IMAGES.length)
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!password) {
      setErrorMsg('Please enter a new password.')
      return
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.')
      return
    }

    setSubmitting(true)

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        setErrorMsg(error.message)
      } else {
        setSuccessMsg('Your password has been successfully reset! You can now sign in with your new credentials.')
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred while resetting your password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-8 sm:py-12">
      {/* Desktop Split-Screen Container */}
      <div className="w-full max-w-5xl neu-card rounded-3xl bg-[#FAF6EF] border border-[#E0D4C5] shadow-2xl overflow-hidden flex flex-col md:flex-row transition-all duration-300">
        
        {/* ======================================================== */}
        {/* LEFT SIDE: Authentic Cultural Photograph & Editorial Quote */}
        {/* ======================================================== */}
        <div className="md:w-5/12 lg:w-1/2 relative bg-[#34252A] overflow-hidden flex flex-col justify-between p-6 sm:p-8 lg:p-10 border-b md:border-b-0 md:border-r border-[#E0D4C5]">
          <img
            key={currentImage.url}
            src={currentImage.url}
            alt={currentImage.title}
            className="absolute inset-0 w-full h-full object-cover object-center z-0 transition-opacity duration-700 animate-fade-in"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/35 z-0" />

          {/* Top Left: Hailey Branding + Back to Home */}
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

          {/* Bottom Left: Editorial Statement & Image Attribution */}
          <div className="relative z-10 space-y-4 pt-16 md:pt-32">
            <div className="space-y-2">
              <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#B08A50] font-bold block">
                CREDENTIAL SECURITY
              </span>
              <p className="font-serif italic text-lg sm:text-xl lg:text-2xl text-white font-normal leading-snug drop-shadow-sm">
                “Discover the traditions, stories, and celebrations that connect us.”
              </p>
            </div>

            <div className="pt-3 border-t border-white/20 flex items-center justify-between gap-3 text-white/90 font-sans">
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-white truncate" title={currentImage.title}>
                  {currentImage.title}
                </span>
                <span className="block text-[10px] text-[#B08A50] font-medium tracking-wide">
                  {currentImage.origin}
                </span>
              </div>

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
                  {(imageIndex % ARCHIVE_CULTURAL_IMAGES.length) + 1}/{ARCHIVE_CULTURAL_IMAGES.length}
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
        {/* RIGHT SIDE: Reset Password Form */}
        {/* ======================================================== */}
        <div className="md:w-7/12 lg:w-1/2 p-6 sm:p-8 lg:p-12 flex flex-col justify-center bg-[#FAF6EF]">
          <div className="max-w-md w-full mx-auto space-y-6">
            
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-[#6A1F35]/10 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-[#6A1F35]" />
                </div>
                <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#B08A50]">
                  Security Verification
                </span>
              </div>

              <div className="font-serif text-3xl sm:text-4xl font-normal text-[#34252A] tracking-tight">
                <BlurText
                  text="Set new password"
                  delay={40}
                  animateBy="words"
                  direction="top"
                />
              </div>

              <p className="mt-2 text-sm text-[#34252A]/70 leading-relaxed">
                Choose a strong, memorable password to secure your cultural archive and member profile.
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-[#6A1F35]/10 border border-[#6A1F35]/25 text-[#6A1F35] text-xs leading-relaxed animate-in fade-in flex items-start gap-2.5">
                <span className="font-bold shrink-0">!</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success State */}
            {successMsg ? (
              <div className="space-y-6 animate-in fade-in">
                <div className="p-5 rounded-2xl bg-[#511528]/5 border border-[#B08A50]/30 text-[#34252A] space-y-3">
                  <div className="flex items-center gap-2.5 text-[#6A1F35]">
                    <CheckCircle2 className="w-5 h-5 text-[#B08A50]" />
                    <span className="font-serif font-bold text-base">Password Updated</span>
                  </div>
                  <p className="text-xs text-[#34252A]/80 leading-relaxed">
                    {successMsg}
                  </p>
                </div>

                <div className="space-y-3">
                  <Link
                    to="/login"
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#6A1F35] text-[#FAF6EF] font-sans font-medium text-sm shadow-md hover:bg-[#511528] active:scale-[0.99] transition-all"
                  >
                    <span>Proceed to Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    to="/"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-medium text-[#34252A]/70 hover:text-[#6A1F35] transition-colors"
                  >
                    Return to Homepage
                  </Link>
                </div>
              </div>
            ) : (
              /* Reset Password Form */
              <form onSubmit={handleResetPassword} className="space-y-5">
                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#34252A]/90">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-3.5 pr-11 py-3 text-sm rounded-xl bg-white/70 border border-[#E0D4C5] focus:outline-none focus:ring-2 focus:ring-[#6A1F35] focus:border-transparent text-[#34252A] shadow-inner transition-all placeholder:text-[#34252A]/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#34252A]/40 hover:text-[#34252A] focus:outline-none"
                      tabIndex="-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#34252A]/50">
                    Must be at least 8 characters long.
                  </p>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#34252A]/90">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-3.5 pr-11 py-3 text-sm rounded-xl bg-white/70 border border-[#E0D4C5] focus:outline-none focus:ring-2 focus:ring-[#6A1F35] focus:border-transparent text-[#34252A] shadow-inner transition-all placeholder:text-[#34252A]/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#34252A]/40 hover:text-[#34252A] focus:outline-none"
                      tabIndex="-1"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#6A1F35] text-[#FAF6EF] font-sans font-bold text-sm shadow-md hover:bg-[#511528] active:bg-[#3D0F1D] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-[#FAF6EF]" />
                      <span className="text-[#FAF6EF] font-bold">Updating password...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[#FAF6EF] font-bold tracking-wider">Update Password</span>
                      <ArrowRight className="h-4 w-4 text-[#FAF6EF] group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>

                {/* Back to Sign In Link */}
                <div className="pt-2 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#34252A]/70 hover:text-[#6A1F35] transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </Link>
                </div>
              </form>
            )}

            {/* Bottom Footer Info */}
            <div className="pt-4 border-t border-[#E0D4C5]/60 flex items-center justify-between text-[11px] text-[#34252A]/50">
              <Link to="/terms" className="hover:text-[#6A1F35] transition-colors">
                Terms of Service
              </Link>
              <span>·</span>
              <Link to="/privacy" className="hover:text-[#6A1F35] transition-colors">
                Privacy Policy
              </Link>
              <span>·</span>
              <Link to="/" className="hover:text-[#6A1F35] transition-colors">
                Hailey Archive
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

export default ResetPasswordPage
