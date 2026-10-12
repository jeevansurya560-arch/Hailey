import { useState } from 'react'
import { Info, ImageOff } from 'lucide-react'
import { getFestivalImage } from '../data/festivalImageManifest'

/**
 * FestivalImage.jsx
 *
 * Reusable, provenance-aware image component for Hailey festival cards and modals.
 * Features:
 * - Consistent aspect ratio with zero layout shift
 * - Lazy loading with blur-in animation
 * - Graceful fallback on loading errors
 * - Attribution popover badge for license compliance
 * - Accessible, descriptive alt text
 */
export function FestivalImage({ festival, className = '', aspectRatio = 'aspect-[16/10]', showAttribution = true }) {
  const [imageError, setImageError] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showLicenseInfo, setShowLicenseInfo] = useState(false)

  const meta = getFestivalImage(festival)

  if (!meta || imageError) {
    return (
      <div
        className={`relative ${aspectRatio} w-full rounded-xl bg-[#F0E7DA] border border-[#E0D4C5] flex flex-col items-center justify-center p-3 text-center overflow-hidden ${className}`}
        role="img"
        aria-label={meta?.altText || `${festival?.name || 'Festival'} cultural image placeholder`}
      >
        <div className="w-10 h-10 rounded-full bg-[#FAF6EF] border border-[#E0D4C5] flex items-center justify-center text-[#B08A50] mb-1.5 shadow-sm">
          <ImageOff className="h-5 w-5" />
        </div>
        <span className="font-serif text-[11px] font-semibold text-[#34252A]/70 line-clamp-1">
          {festival?.name}
        </span>
        <span className="font-mono text-[9px] text-[#34252A]/40 uppercase tracking-wider">
          Cultural Heritage Archive
        </span>
      </div>
    )
  }

  return (
    <div className={`relative ${aspectRatio} w-full rounded-xl overflow-hidden bg-[#F0E7DA] border border-[#E0D4C5]/80 group ${className}`}>
      {/* Loading Skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#F0E7DA] via-[#FAF6EF] to-[#F0E7DA] animate-pulse" />
      )}

      {/* Image */}
      <img
        src={meta.assetPath}
        alt={meta.altText}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setImageError(true)}
        className={`w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Attribution Overlay Badge */}
      {showAttribution && meta.attribution && (
        <div className="absolute bottom-1.5 right-1.5 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setShowLicenseInfo(!showLicenseInfo)
            }}
            title="Image provenance & license"
            aria-label="Image provenance and license information"
            className="w-5 h-5 rounded-full bg-[#34252A]/75 hover:bg-[#34252A] text-[#FAF6EF] flex items-center justify-center backdrop-blur-sm shadow-sm transition-all focus:outline-none"
          >
            <Info className="h-3 w-3" />
          </button>

          {showLicenseInfo && (
            <div
              className="absolute bottom-6 right-0 w-68 p-3 rounded-xl bg-[#FAF6EF] border border-[#E0D4C5] text-[#34252A] shadow-xl text-[10px] font-mono leading-tight z-30 space-y-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#E0D4C5]/70 pb-1">
                <span className="font-bold text-[#6A1F35] uppercase tracking-wider text-[9px]">
                  {meta.imageType === 'ai_generated'
                    ? 'AI-Generated Artwork'
                    : meta.imageType === 'photograph'
                    ? 'Archival Photograph'
                    : 'Cultural Illustration'}
                </span>
                <span className={`text-[8px] font-semibold px-1.5 py-0.5 rounded ${
                  meta.verified
                    ? 'bg-[#3D7A5C]/15 text-[#3D7A5C]'
                    : 'bg-[#B08A50]/20 text-[#7A5C20]'
                }`}>
                  {meta.verified ? 'Verified Source' : 'Unverified Rights'}
                </span>
              </div>

              <p className="text-[#34252A]/85 text-[10px] leading-snug">{meta.attribution}</p>

              <div className="text-[9px] text-[#75666B] pt-0.5 space-y-0.5">
                <p><span className="font-semibold text-[#34252A]">Origin:</span> {meta.creator}</p>
                <p><span className="font-semibold text-[#34252A]">Terms:</span> {meta.licenseName}</p>
              </div>

              {meta.sourcePageUrl && (
                <div className="pt-1 border-t border-[#E0D4C5]/70 text-right">
                  <a
                    href={meta.sourcePageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#6A1F35] underline hover:text-[#511528] text-[9px]"
                  >
                    Source Documentation →
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
export default FestivalImage
