import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Loader2, Mail, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
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

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const [imageIndex, setImageIndex] = useState(2)

  const currentImage = ARCHIVE_CULTURAL_IMAGES[imageIndex % ARCHIVE_CULTURAL_IMAGES.length]

  const handleNextImage = () => {
    setImageIndex((prev) => (prev + 1) % ARCHIVE_CULTURAL_IMAGES.length)
  }

  const handlePrevImage = () => {
    setImageIndex((prev) => (prev - 1 + ARCHIVE_CULTURAL_IMAGES.length) % ARCHIVE_CULTURAL_IMAGES.length)
  }

  const handleResetRequest = async (e) => {
    e.preventDefault()
    if (!email) return

    setSubmitting(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) {
        setErrorMsg(error.message)
      } else {
        setSuccessMsg(`We have dispatched password reset instructions to ${email}. Please check your inbox.`)
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred while requesting password reset.')
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
                ACCOUNT RECOVERY
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
        {/* RIGHT SIDE: Forgot Password Form */}
        {/* ======================================================== */}
        <div className="md:w-7/12 lg:w-1/2 p-6 sm:p-10 lg:p-12 bg-[#FAF6EF] flex flex-col justify-center">
          
          <div className="mb-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-[#75666B] hover:text-[#6A1F35] font-medium transition-colors mb-4 group"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Back to Sign In</span>
            </Link>

            <BlurText
              as="h1"
              text="Reset Your Password"
              delay={90}
              animateBy="words"
              direction="top"
              className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#34252A] leading-tight"
            />
            <p className="text-xs sm:text-sm text-[#75666B] mt-1.5 leading-relaxed">
              Enter the email address registered with your Hailey contributor account. We will send you instructions to safely choose a new password.
            </p>
          </div>

          {/* Success Message Alert */}
          {successMsg && (
            <div
              role="status"
              className="mb-5 border border-emerald-200 bg-emerald-50/90 p-4 text-xs text-emerald-900 rounded-xl neu-card flex items-start gap-2.5 animate-fade-in"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">{successMsg}</p>
                <p className="text-[11px] text-emerald-800/80">
                  Did not receive the email? Check your spam filter or request another reset in a few minutes.
                </p>
              </div>
            </div>
          )}

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

          {!successMsg ? (
            <form onSubmit={handleResetRequest} className="space-y-4">
              <div className="space-y-1">
                <label
                  htmlFor="reset-email"
                  className="block text-xs font-mono uppercase tracking-wider text-[#34252A]/80 font-medium"
                >
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="curator@domain.org"
                    required
                    className="w-full neu-inset-input rounded-xl border border-[#E0D4C5] bg-[#FAF6EF] px-3.5 py-2.5 text-sm text-[#34252A] placeholder:text-[#75666B]/50 focus:outline-none focus:ring-1 focus:ring-[#6A1F35] transition-all pl-10"
                  />
                  <Mail className="h-4 w-4 text-[#75666B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-full py-3.5 px-6 font-mono text-xs uppercase tracking-wider font-bold bg-[#6A1F35] text-[#FAF6EF] shadow-md hover:bg-[#511528] active:bg-[#3D0F1D] disabled:opacity-50 transition-all flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-[#B08A50] cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-[#FAF6EF]" />
                      <span className="text-[#FAF6EF] font-bold">Sending Instructions...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[#FAF6EF] font-bold tracking-wider">Send Reset Instructions</span>
                      <ArrowRight className="h-3.5 w-3.5 text-[#FAF6EF]" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="pt-4 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#6A1F35] text-[#6A1F35] hover:bg-[#6A1F35] hover:text-[#FAF6EF] font-medium text-xs transition-colors"
              >
                <span>Return to Sign In</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          <div className="mt-8 border-t border-[#E0D4C5] pt-4 text-center">
            <p className="text-xs text-[#75666B]">
              Remembered your credentials?{' '}
              <Link
                to="/login"
                className="text-[#6A1F35] hover:text-[#511528] font-semibold hover:underline transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>

        </div>

      </div>
    </div>
  )
}

export default ForgotPasswordPage
