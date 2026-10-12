import { useState } from 'react'
import {
  MapPin,
  Utensils,
  Music,
  Tag,
  Check,
  ChevronRight,
  Bookmark,
  Sparkles
} from 'lucide-react'
import { FestivalImage } from './FestivalImage'

/**
 * Format occurrence date range cleanly (e.g. "Oct 11–20, 2026" or "Sep 25 – Oct 2, 2026")
 */
function formatDateRange(startDateStr, endDateStr) {
  if (!startDateStr) return ''
  const shortMonths = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const [sY, sM, sD] = startDateStr.split('-').map(Number)
  const startMonthName = shortMonths[sM - 1]

  if (!endDateStr || endDateStr === startDateStr) {
    return `${startMonthName} ${sD}, ${sY}`
  }

  const [eY, eM, eD] = endDateStr.split('-').map(Number)
  const endMonthName = shortMonths[eM - 1]

  if (sY === eY && sM === eM) {
    return `${startMonthName} ${sD} – ${eD}, ${sY}`
  }

  if (sY === eY) {
    return `${startMonthName} ${sD} – ${endMonthName} ${eD}, ${sY}`
  }

  return `${startMonthName} ${sD}, ${sY} – ${endMonthName} ${eD}, ${eY}`
}

/**
 * Calculate status from occurrence start/end dates in the local date context
 */
function getOccurrenceStatus(occurrence, todayObj) {
  if (!occurrence?.startDate) return 'uncertain'
  const todayStr = `${todayObj.year}-${String(todayObj.month + 1).padStart(2, '0')}-${String(todayObj.day).padStart(2, '0')}`
  const startStr = occurrence.startDate
  const endStr = occurrence.endDate || occurrence.startDate

  if (endStr < todayStr) return 'completed'
  if (startStr <= todayStr && todayStr <= endStr) return 'today'
  if (startStr > todayStr) return 'upcoming'
  return 'uncertain'
}

export function FestivalCard({
  festival,
  selectedYear,
  today,
  onOpen,
  isBookmarked = false,
  onToggleBookmark
}) {
  const [saved, setSaved] = useState(isBookmarked)

  const occurrence = festival.occurrences?.find(o => o.year === selectedYear)
  const status = occurrence ? getOccurrenceStatus(occurrence, today) : 'uncertain'
  const dateRangeDisplay = occurrence ? formatDateRange(occurrence.startDate, occurrence.endDate) : ''

  const handleBookmarkClick = (e) => {
    e.stopPropagation()
    const next = !saved
    setSaved(next)
    if (onToggleBookmark) {
      onToggleBookmark(festival.id || festival.slug, next)
    }
  }

  // Location string
  const locationString = festival.countries?.length > 0
    ? `${festival.countries.slice(0, 2).join(', ')}${festival.countries.length > 2 ? ' and Worldwide' : ''}`
    : festival.regions?.length > 0
    ? festival.regions.slice(0, 2).join(', ')
    : 'Global'

  return (
    <article
      data-testid={`festival-card-${festival.id || festival.slug}`}
      className="neu-card rounded-2xl bg-[#FAF6EF] border border-[#E0D4C5] p-4 md:p-5 flex flex-col md:flex-row gap-4 md:gap-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#6A1F35]/35 hover:shadow-md group"
    >
      {/* ── Left Column: Festival Image ── */}
      <div className="w-full md:w-[210px] shrink-0">
        <FestivalImage
          festival={festival}
          aspectRatio="aspect-[16/10] md:aspect-[4/3]"
          className="h-full max-h-[160px] md:max-h-none shadow-sm"
        />
      </div>

      {/* ── Right Column: Editorial Record Body ── */}
      <div className="flex-1 min-w-0 flex flex-col justify-between space-y-3">
        {/* Row 1: Badges & Bookmark */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Category Badge */}
            <span className="font-mono text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[#F0E7DA] text-[#6A1F35] border border-[#E0D4C5]">
              {festival.category || festival.traditionType || 'Sacred Tradition'}
            </span>

            {/* Status Badge */}
            {status === 'completed' && (
              <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[#34252A]/5 text-[#34252A]/70 border border-[#34252A]/15">
                <Check className="h-2.5 w-2.5 text-[#34252A]/70" />
                Completed
              </span>
            )}
            {status === 'today' && (
              <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[#B08A50]/15 text-[#7A5C20] border border-[#B08A50]/35">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B08A50] animate-pulse" />
                Today
              </span>
            )}
            {status === 'upcoming' && (
              <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[#6A1F35]/10 text-[#6A1F35] border border-[#6A1F35]/25">
                Upcoming
              </span>
            )}
            {status === 'uncertain' && (
              <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[#F0E7DA] text-[#75666B] border border-[#E0D4C5]">
                Observation-Dependent
              </span>
            )}

            {/* Date Range Badge */}
            {dateRangeDisplay && (
              <span className="font-mono text-[9px] font-medium px-2 py-0.5 rounded-full bg-[#FAF6EF] text-[#34252A]/80 border border-[#E0D4C5]">
                {dateRangeDisplay}
              </span>
            )}
          </div>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={handleBookmarkClick}
            aria-label={saved ? `Remove ${festival.name} from saved` : `Save ${festival.name}`}
            className="p-1 text-[#75666B] hover:text-[#6A1F35] transition-colors focus:outline-none"
          >
            <Bookmark
              className={`h-4 w-4 ${saved ? 'fill-[#6A1F35] text-[#6A1F35]' : 'stroke-current'}`}
            />
          </button>
        </div>

        {/* Row 2: Title & Alternate Names */}
        <div>
          <h3 className="font-serif text-lg md:text-xl font-bold text-[#34252A] leading-snug group-hover:text-[#6A1F35] transition-colors">
            {festival.name}
          </h3>
          {festival.alternateNames?.length > 0 && (
            <p className="font-mono text-[11px] text-[#75666B] mt-0.5 line-clamp-1">
              {festival.alternateNames.slice(0, 3).join(' · ')}
            </p>
          )}
        </div>

        {/* Row 3: Cultural Significance Description */}
        <p className="text-xs text-[#34252A]/75 leading-relaxed line-clamp-2">
          {festival.significance || festival.whyCelebrated || festival.history}
        </p>

        {/* Row 4: Meaningful Cultural Tags */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {/* Food Tag */}
          {festival.food?.[0] && (
            <span className="inline-flex items-center gap-1 text-[10px] text-[#34252A]/75 bg-[#F0E7DA]/60 border border-[#E0D4C5]/80 px-2 py-0.5 rounded-full">
              <Utensils className="h-2.5 w-2.5 text-[#B08A50] shrink-0" />
              <span className="truncate max-w-[140px]">{festival.food[0]}</span>
            </span>
          )}

          {/* Music Tag */}
          {festival.music?.[0] && (
            <span className="inline-flex items-center gap-1 text-[10px] text-[#34252A]/75 bg-[#F0E7DA]/60 border border-[#E0D4C5]/80 px-2 py-0.5 rounded-full">
              <Music className="h-2.5 w-2.5 text-[#6A1F35] shrink-0" />
              <span className="truncate max-w-[140px]">{festival.music[0]}</span>
            </span>
          )}

          {/* Ritual / Tradition Tag */}
          {(festival.rituals?.[0] || festival.traditionType) && (
            <span className="inline-flex items-center gap-1 text-[10px] text-[#34252A]/75 bg-[#F0E7DA]/60 border border-[#E0D4C5]/80 px-2 py-0.5 rounded-full">
              <Tag className="h-2.5 w-2.5 text-[#A96849] shrink-0" />
              <span className="truncate max-w-[140px]">
                {festival.rituals?.[0] ? festival.rituals[0].split('(')[0].trim() : festival.traditionType}
              </span>
            </span>
          )}
        </div>

        {/* Row 5: Footer with Location & Cultural Record Action */}
        <div className="pt-2 border-t border-[#E0D4C5]/70 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-[11px] font-sans text-[#75666B]">
            <MapPin className="h-3 w-3 text-[#B08A50] shrink-0" />
            <span className="truncate max-w-[220px]">{locationString}</span>
          </div>

          <button
            type="button"
            onClick={() => onOpen(festival)}
            className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-[#6A1F35] hover:text-[#511528] transition-colors focus:outline-none"
          >
            <span>Cultural Record</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  )
}
export default FestivalCard
