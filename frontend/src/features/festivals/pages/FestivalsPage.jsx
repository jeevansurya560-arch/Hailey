/**
 * FestivalsPage.jsx
 *
 * Global Festival Calendar & Cultural Knowledge Engine — 2025–2035
 *
 * Architecture:
 * - Left panel: Interactive month calendar with festival markers
 * - Right panel: Synchronized festival list for selected month + composable filters
 * - Festival detail modal with cultural story, sources, and occurrences
 *
 * Data flow:
 * 1. Attempt to load from Supabase `festivals` + `festival_occurrences` tables
 * 2. If Supabase returns no data (table empty), fall back to VERIFIED_FESTIVALS
 * 3. Normalize both sources to the same shape before rendering
 *
 * Root cause fix:
 * - The original page showed only 4 cards because VERIFIED_FESTIVALS had 4 entries
 * - The Supabase table has no seed rows, so fallback was always triggered
 * - Now VERIFIED_FESTIVALS has 30+ entries and the UI is month-scoped
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Calendar,
  Globe,
  BookOpen,
  Music,
  Utensils,
  Shirt,
  Filter,
  ChevronRight,
  ChevronLeft,
  X,
  ExternalLink,
  AlertCircle,
  Info,
  Search,
  Check,
} from 'lucide-react'
import { fetchAllFestivals, VERIFIED_FESTIVALS } from '../services/festivalService'
import BlurText from '@/components/BlurText'

// ─── Constants ────────────────────────────────────────────────────────────────

const MIN_YEAR = 2025
const MAX_YEAR = 2035
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

// Category → display label + color token
const CATEGORY_COLORS = {
  'Religious': 'bg-[#6A1F35]/10 text-[#6A1F35] border-[#6A1F35]/25',
  'Religious & Family': 'bg-[#6A1F35]/10 text-[#6A1F35] border-[#6A1F35]/25',
  'Religious & Community': 'bg-[#8B2340]/10 text-[#8B2340] border-[#8B2340]/25',
  'Religious & Cultural': 'bg-[#7A1E30]/10 text-[#7A1E30] border-[#7A1E30]/25',
  'Religious & Historical': 'bg-[#6A1F35]/10 text-[#6A1F35] border-[#6A1F35]/25',
  'Religious & Seasonal': 'bg-[#7A5C20]/10 text-[#7A5C20] border-[#7A5C20]/25',
  'Family & Ancestral': 'bg-[#B08A50]/10 text-[#7A5C20] border-[#B08A50]/25',
  'Ancestral & Seasonal': 'bg-[#B08A50]/10 text-[#7A5C20] border-[#B08A50]/25',
  'Ancestral & Spiritual': 'bg-[#5C6E2A]/10 text-[#5C6E2A] border-[#5C6E2A]/25',
  'Family & Seasonal': 'bg-[#B08A50]/10 text-[#7A5C20] border-[#B08A50]/25',
  'Seasonal & Folk': 'bg-[#3D7A5C]/10 text-[#3D7A5C] border-[#3D7A5C]/25',
  'Seasonal & Religious': 'bg-[#5C4A8A]/10 text-[#5C4A8A] border-[#5C4A8A]/25',
  'Seasonal & Cultural': 'bg-[#3D7A5C]/10 text-[#3D7A5C] border-[#3D7A5C]/25',
  'Cultural & Community': 'bg-[#2A5C8A]/10 text-[#2A5C8A] border-[#2A5C8A]/25',
  'Cultural & Seasonal': 'bg-[#2A5C8A]/10 text-[#2A5C8A] border-[#2A5C8A]/25',
  'Secular & Cultural': 'bg-[#34252A]/10 text-[#34252A]/70 border-[#E0D4C5]',
  default: 'bg-[#F0E7DA] text-[#34252A]/70 border-[#E0D4C5]',
}

// ─── Calendar Utilities ───────────────────────────────────────────────────────

function getDaysInMonth(year, month) { // month: 0-indexed
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year, month) { // returns 0=Sun..6=Sat
  return new Date(year, month, 1).getDay()
}

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

// Returns ISO date string "YYYY-MM-DD" for a given year/month/day without timezone shifts
function toISODate(year, month, day) { // month: 0-indexed
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// Parse "YYYY-MM-DD" without timezone conversion
function parseISODate(str) {
  if (!str) return null
  const [y, m, d] = str.split('-').map(Number)
  return { year: y, month: m - 1, day: d } // month: 0-indexed
}

// Check if a date (YYYY-MM-DD) falls within an occurrence's range
function dateInOccurrence(dateStr, occ) {
  if (!occ?.startDate) return false
  return dateStr >= occ.startDate && dateStr <= (occ.endDate || occ.startDate)
}

// Format occurrence date range cleanly (e.g. "Oct 11–20, 2026" or "Dec 25, 2025")
function formatDateRange(startDateStr, endDateStr) {
  if (!startDateStr) return ''
  const start = parseISODate(startDateStr)
  if (!start) return startDateStr
  const shortMonths = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const startMonthName = shortMonths[start.month]

  if (!endDateStr || endDateStr === startDateStr) {
    return `${startMonthName} ${start.day}, ${start.year}`
  }

  const end = parseISODate(endDateStr)
  if (!end) return `${startDateStr} – ${endDateStr}`

  if (start.year === end.year && start.month === end.month) {
    return `${startMonthName} ${start.day}–${end.day}, ${start.year}`
  }

  const endMonthName = shortMonths[end.month]
  if (start.year === end.year) {
    return `${startMonthName} ${start.day} – ${endMonthName} ${end.day}, ${start.year}`
  }

  return `${startMonthName} ${start.day}, ${start.year} – ${endMonthName} ${end.day}, ${end.year}`
}

// ─── Data Normalization ───────────────────────────────────────────────────────

/**
 * Normalize a festival from either Supabase shape or VERIFIED_FESTIVALS shape
 * into a consistent internal shape the UI uses.
 */
function normalizeFestival(raw) {
  // Supabase snake_case → camelCase
  if (raw.slug && raw.alternate_names !== undefined) {
    return {
      id: raw.id,
      slug: raw.slug,
      name: raw.name,
      alternateNames: raw.alternate_names || [],
      culturalOrigin: raw.cultural_origin || '',
      religion: raw.religion || '',
      traditionType: raw.tradition_type || raw.tradition_id || '',
      category: raw.category || '',
      countries: raw.countries || [],
      regions: raw.regions || [],
      typicalMonth: raw.typical_month,
      dateRule: raw.date_rule || '',
      significance: raw.significance || '',
      history: raw.history || '',
      whyCelebrated: raw.why_celebrated || raw.significance || '',
      howObserved: raw.how_observed || '',
      regionalVariations: raw.regional_variations || '',
      dateExplanation: raw.date_explanation || '',
      rituals: raw.rituals || [],
      food: raw.food || [],
      clothing: raw.clothing || [],
      music: raw.music || [],
      occurrences: (raw.festival_occurrences || []).map(o => ({
        year: o.year,
        startDate: o.start_date,
        endDate: o.end_date,
        regionNotes: o.region_notes || '',
        verified: o.verified !== false,
      })),
      sources: raw.sources || [],
    }
  }
  // Already in JS camelCase shape (VERIFIED_FESTIVALS)
  return {
    ...raw,
    religion: raw.religion || '',
    category: raw.category || '',
    occurrences: (raw.occurrences || []),
  }
}

// ─── Build event map: { "YYYY-MM-DD" → [festival, ...] } ─────────────────────

function buildEventMap(festivals, year) {
  const map = {}
  for (const f of festivals) {
    const occ = f.occurrences?.find(o => o.year === year)
    if (!occ?.startDate) continue

    const start = parseISODate(occ.startDate)
    const end = parseISODate(occ.endDate || occ.startDate)
    if (!start) continue

    // Walk each day of the occurrence range (cap at 31 days to avoid runaway)
    let current = new Date(start.year, start.month, start.day)
    const endDate = end ? new Date(end.year, end.month, end.day) : current
    let steps = 0
    while (current <= endDate && steps < 32) {
      const key = toISODate(
        current.getFullYear(),
        current.getMonth(),
        current.getDate()
      )
      if (!map[key]) map[key] = []
      map[key].push(f)
      current.setDate(current.getDate() + 1)
      steps++
    }
  }
  return map
}

// ─── Occurrence Status Tracking ──────────────────────────────────────────────
 
function getFestivalOccurrenceStatus(occurrence, todayObj) {
  if (!occurrence?.startDate) return 'unknown'
  const todayStr = toISODate(todayObj.year, todayObj.month, todayObj.day)
  const startStr = occurrence.startDate
  const endStr = occurrence.endDate || occurrence.startDate

  if (endStr < todayStr) {
    return 'completed'
  }
  if (startStr <= todayStr && todayStr <= endStr) {
    return 'today'
  }
  return 'upcoming'
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CalendarGrid({ year, month, eventMap, selectedDate, onSelectDate, today, highlightedDates = [] }) {
  const daysInMonth = getDaysInMonth(year, month)
  const firstDow = getFirstDayOfWeek(year, month)

  // Build grid: leading empties + day cells + trailing empties (fixed 42 cells = 6 rows)
  const cells = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length < 42) cells.push(null)

  const highlightedSet = new Set(highlightedDates)

  return (
    <div>
      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1.5" role="row">
        {DAY_NAMES.map(d => (
          <div
            key={d}
            role="columnheader"
            className="text-center font-mono text-[10px] uppercase tracking-wider text-[#34252A]/40 py-1 font-semibold"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1.5 gap-x-1" role="grid">
        {cells.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} className="h-10 w-full" aria-hidden="true" />
          }
          const dateStr = toISODate(year, month, day)
          const events = eventMap[dateStr] || []
          const isToday =
            today.year === year && today.month === month && today.day === day
          const isSelected =
            selectedDate &&
            selectedDate.year === year &&
            selectedDate.month === month &&
            selectedDate.day === day
          const isHighlighted = highlightedSet.has(dateStr)

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelectDate(isSelected ? null : { year, month, day })}
              aria-label={`${MONTH_NAMES[month]} ${day}, ${year}${events.length > 0 ? ` — ${events.length} festival${events.length > 1 ? 's' : ''}` : ''}`}
              aria-pressed={isSelected}
              className={`
                relative h-10 w-full flex flex-col items-center justify-start pt-1 rounded-lg text-xs font-mono
                transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#6A1F35]
                ${isSelected
                  ? 'bg-[#6A1F35] text-[#FAF6EF] shadow-md ring-2 ring-[#6A1F35]'
                  : isToday
                  ? 'bg-[#F0E7DA] text-[#6A1F35] font-bold ring-1 ring-[#6A1F35]/40'
                  : isHighlighted
                  ? 'bg-[#FAF6EF] text-[#B08A50] font-bold ring-2 ring-[#B08A50]'
                  : 'text-[#34252A] hover:bg-[#F0E7DA] hover:text-[#6A1F35]'}
              `}
            >
              <span className="leading-none font-semibold">{day}</span>
              {events.length > 0 && (
                <span
                  className={`
                    absolute bottom-1 flex items-center gap-0.5
                    ${isSelected ? 'opacity-90' : ''}
                  `}
                  aria-hidden="true"
                >
                  {events.length === 1 ? (
                    <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-[#F0D090]' : 'bg-[#B08A50]'}`} />
                  ) : events.length === 2 ? (
                    <>
                      <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-[#F0D090]' : 'bg-[#B08A50]'}`} />
                      <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-[#F0D090]' : 'bg-[#6A1F35]'}`} />
                    </>
                  ) : (
                    <span className={`font-mono text-[9px] font-bold ${isSelected ? 'text-[#F0D090]' : 'text-[#B08A50]'}`}>
                      {events.length}
                    </span>
                  )}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function FestivalCard({ festival, selectedYear, today, onOpen, onLocateDate }) {
  const occurrence = festival.occurrences?.find(o => o.year === selectedYear)
  const categoryClass = CATEGORY_COLORS[festival.category] || CATEGORY_COLORS.default
  const status = occurrence ? getFestivalOccurrenceStatus(occurrence, today) : 'unknown'

  return (
    <article
      data-testid={`festival-card-${festival.id}`}
      className={`neu-card rounded-2xl bg-[#FAF6EF] border border-[#E0D4C5] p-5 flex flex-col justify-between space-y-3 transition-all hover:-translate-y-0.5 hover:border-[#6A1F35]/30 hover:shadow-sm ${
        status === 'completed' ? 'opacity-90' : ''
      }`}
    >
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <span
                className={`inline-block font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-semibold ${categoryClass}`}
              >
                {festival.category || festival.traditionType}
              </span>

              {/* Completion & Occurrence Status */}
              {status === 'completed' && (
                <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#34252A]/20 bg-[#34252A]/5 text-[#34252A]/60 font-semibold">
                  <Check className="h-2.5 w-2.5 text-[#34252A]/60" aria-hidden="true" />
                  Completed
                </span>
              )}
              {status === 'today' && (
                <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#B08A50]/40 bg-[#B08A50]/15 text-[#7A5C20] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B08A50] animate-pulse" aria-hidden="true" />
                  Today
                </span>
              )}
              {status === 'upcoming' && (
                <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#6A1F35]/20 bg-[#6A1F35]/5 text-[#6A1F35] font-semibold">
                  Upcoming
                </span>
              )}
            </div>

            <h2 className="font-serif text-lg font-bold text-[#34252A] leading-snug">
              {festival.name}
            </h2>
            {festival.alternateNames?.length > 0 && (
              <p className="font-mono text-[11px] text-[#34252A]/50 mt-0.5 truncate">
                {festival.alternateNames.slice(0, 2).join(' · ')}
              </p>
            )}
          </div>

          {occurrence && (
            <button
              type="button"
              onClick={() => onLocateDate && onLocateDate(occurrence)}
              title="Click to locate on calendar"
              className="text-right shrink-0 neu-card bg-[#F0E7DA]/50 hover:bg-[#F0E7DA] border border-[#E0D4C5] px-3 py-2 rounded-xl transition-all group focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#6A1F35]"
            >
              <span className="font-mono text-[10px] text-[#6A1F35] uppercase font-bold block group-hover:text-[#511528]">
                {selectedYear}
              </span>
              <span
                className={`font-mono text-[11px] font-bold block ${
                  status === 'completed'
                    ? 'line-through decoration-[#34252A]/40 text-[#34252A]/60'
                    : 'text-[#34252A]'
                }`}
              >
                {formatDateRange(occurrence.startDate, occurrence.endDate)}
              </span>
              {!occurrence.verified && (
                <span className="font-mono text-[9px] text-[#B08A50] block mt-0.5">
                  est.
                </span>
              )}
            </button>
          )}
        </div>

        <p className="text-xs text-[#34252A]/65 leading-relaxed line-clamp-2">
          {festival.significance}
        </p>

        {/* Cultural badges */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {festival.food?.[0] && (
            <span className="inline-flex items-center gap-1 text-[10px] text-[#34252A]/70 bg-[#F0E7DA]/60 border border-[#E0D4C5]/70 px-2 py-0.5 rounded-full">
              <Utensils className="h-2.5 w-2.5 text-[#B08A50] shrink-0" />
              {festival.food[0]}
            </span>
          )}
          {festival.clothing?.[0] && (
            <span className="inline-flex items-center gap-1 text-[10px] text-[#34252A]/70 bg-[#F0E7DA]/60 border border-[#E0D4C5]/70 px-2 py-0.5 rounded-full">
              <Shirt className="h-2.5 w-2.5 text-[#6A1F35] shrink-0" />
              <span className="truncate max-w-[80px]">{festival.clothing[0]}</span>
            </span>
          )}
          {festival.music?.[0] && (
            <span className="inline-flex items-center gap-1 text-[10px] text-[#34252A]/70 bg-[#F0E7DA]/60 border border-[#E0D4C5]/70 px-2 py-0.5 rounded-full">
              <Music className="h-2.5 w-2.5 text-[#A96849] shrink-0" />
              <span className="truncate max-w-[80px]">{festival.music[0]}</span>
            </span>
          )}
        </div>
      </div>

      <div className="pt-2.5 border-t border-[#E0D4C5]/80 flex items-center justify-between">
        <div className="flex items-center gap-1 text-[10px] font-mono text-[#34252A]/50">
          <Globe className="h-3 w-3 text-[#B08A50]" />
          <span>{festival.countries?.slice(0, 2).join(', ')}</span>
        </div>
        <div className="flex items-center gap-2">
          {occurrence && (
            <button
              type="button"
              onClick={() => onLocateDate && onLocateDate(occurrence)}
              className="font-mono text-[11px] text-[#34252A]/60 hover:text-[#6A1F35] transition-colors"
            >
              Locate Date
            </button>
          )}
          <button
            type="button"
            onClick={() => onOpen(festival)}
            className="inline-flex items-center gap-1 font-mono text-xs text-[#6A1F35] font-bold hover:text-[#511528] transition-colors"
          >
            <span>Cultural Record</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  )
}

function FestivalDetailModal({ festival, selectedYear, onClose }) {
  const scrollRef = useRef(null)
  if (!festival) return null

  const occurrences = festival.occurrences || []
  const yearOcc = occurrences.find(o => o.year === selectedYear)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#34252A]/40 p-4 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label={`Cultural record: ${festival.name}`}
    >
      <div
        ref={scrollRef}
        className="neu-card rounded-3xl bg-[#FAF6EF] border border-[#E0D4C5] max-w-2xl w-full p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E0D4C5] pb-4">
          <div>
            <span className="font-mono text-[10px] text-[#6A1F35] uppercase font-bold tracking-widest">
              Hailey Cultural Encyclopedia · {festival.dateRule?.toUpperCase()} Calendar
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#34252A] mt-1 leading-tight">
              {festival.name}
            </h2>
            {festival.alternateNames?.length > 0 && (
              <p className="font-mono text-xs text-[#34252A]/55 mt-0.5">
                Also known as: {festival.alternateNames.join(' · ')}
              </p>
            )}
            <p className="font-mono text-xs text-[#34252A]/55 mt-1">
              Origin: {festival.culturalOrigin} · {festival.religion}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 font-mono text-xs neu-pill border border-[#E0D4C5] bg-[#FAF6EF] px-3 py-1.5 rounded-full text-[#34252A] hover:bg-[#F0E7DA] transition-colors"
            aria-label="Close festival detail"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Current year occurrence */}
        {yearOcc && (
          <div className="bg-[#F0E7DA]/60 border border-[#E0D4C5] rounded-xl p-3.5 space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-3.5 w-3.5 text-[#6A1F35]" />
              <span className="font-mono text-[11px] font-bold text-[#6A1F35] uppercase tracking-wider">
                {selectedYear} Occurrence
              </span>
              {!yearOcc.verified && (
                <span className="font-mono text-[9px] bg-[#B08A50]/15 text-[#B08A50] px-1.5 py-0.5 rounded-full border border-[#B08A50]/30">
                  Estimated
                </span>
              )}
            </div>
            <p className="font-mono text-sm font-bold text-[#34252A]">
              {formatDateRange(yearOcc.startDate, yearOcc.endDate)}
            </p>
            {yearOcc.endDate && yearOcc.endDate !== yearOcc.startDate && (
              <p className="font-mono text-[11px] text-[#34252A]/60">
                Observance span: {yearOcc.startDate} to {yearOcc.endDate}
              </p>
            )}
            {yearOcc.regionNotes && (
              <p className="text-xs text-[#34252A]/70 pt-0.5">{yearOcc.regionNotes}</p>
            )}
          </div>
        )}

        {/* Cultural story sections */}
        <div className="space-y-4 text-xs leading-relaxed text-[#34252A]">

          {/* Why celebrated */}
          {(festival.whyCelebrated || festival.significance) && (
            <div>
              <h3 className="font-mono text-[11px] uppercase font-bold text-[#6A1F35] mb-1.5 tracking-wider">
                Why It Is Celebrated
              </h3>
              <p className="text-[#34252A]/75">{festival.whyCelebrated || festival.significance}</p>
            </div>
          )}

          {/* Historical background */}
          {festival.history && (
            <div>
              <h3 className="font-mono text-[11px] uppercase font-bold text-[#6A1F35] mb-1.5 tracking-wider">
                Historical Background
              </h3>
              <p className="text-[#34252A]/75">{festival.history}</p>
            </div>
          )}

          {/* How observed */}
          {festival.howObserved && (
            <div>
              <h3 className="font-mono text-[11px] uppercase font-bold text-[#6A1F35] mb-1.5 tracking-wider">
                How People Observe It
              </h3>
              <p className="text-[#34252A]/75">{festival.howObserved}</p>
            </div>
          )}

          {/* Rituals */}
          {festival.rituals?.length > 0 && (
            <div>
              <h3 className="font-mono text-[11px] uppercase font-bold text-[#6A1F35] mb-1.5 tracking-wider">
                Rituals & Observances
              </h3>
              <ul className="list-disc pl-4 space-y-1 text-[#34252A]/75">
                {festival.rituals.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Regional variations */}
          {festival.regionalVariations && (
            <div>
              <h3 className="font-mono text-[11px] uppercase font-bold text-[#6A1F35] mb-1.5 tracking-wider">
                Regional Variations
              </h3>
              <p className="text-[#34252A]/75">{festival.regionalVariations}</p>
            </div>
          )}

          {/* Date & calendar */}
          {festival.dateExplanation && (
            <div className="bg-[#F0E7DA]/40 border border-[#E0D4C5]/60 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Info className="h-3.5 w-3.5 text-[#B08A50]" />
                <h3 className="font-mono text-[11px] uppercase font-bold text-[#34252A]/60 tracking-wider">
                  Date & Calendar System
                </h3>
              </div>
              <p className="text-[#34252A]/65">{festival.dateExplanation}</p>
            </div>
          )}

          {/* All occurrences grid */}
          {occurrences.length > 0 && (
            <div>
              <h3 className="font-mono text-[11px] uppercase font-bold text-[#6A1F35] mb-2 tracking-wider">
                Annual Occurrences (2025–2035)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {occurrences.map(occ => (
                  <div
                    key={occ.year}
                    className={`neu-card border rounded-xl p-2.5 ${
                      occ.year === selectedYear
                        ? 'border-[#6A1F35]/50 bg-[#6A1F35]/5'
                        : 'border-[#E0D4C5] bg-[#F0E7DA]/40'
                    }`}
                  >
                    <span className={`font-mono font-bold block text-xs ${occ.year === selectedYear ? 'text-[#6A1F35]' : 'text-[#34252A]'}`}>
                      {occ.year}
                    </span>
                    <span className="font-mono text-[10px] text-[#6A1F35] font-semibold block">
                      {occ.startDate}
                    </span>
                    {!occ.verified && (
                      <span className="font-mono text-[9px] text-[#B08A50] block">est.</span>
                    )}
                    {occ.regionNotes && (
                      <span className="text-[9px] text-[#34252A]/50 block leading-tight mt-0.5">
                        {occ.regionNotes}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Countries */}
          {festival.countries?.length > 0 && (
            <div>
              <h3 className="font-mono text-[11px] uppercase font-bold text-[#6A1F35] mb-1.5 tracking-wider flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" />
                Countries & Regions
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {festival.countries.map(c => (
                  <span
                    key={c}
                    className="font-mono text-[10px] bg-[#F0E7DA] border border-[#E0D4C5] px-2 py-0.5 rounded-full text-[#34252A]/70"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Cultural attributes */}
          {(festival.food?.length > 0 || festival.music?.length > 0 || festival.clothing?.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 border-t border-[#E0D4C5]/70 pt-3">
              {festival.food?.length > 0 && (
                <div className="bg-[#F0E7DA]/40 p-2.5 rounded-xl border border-[#E0D4C5]/60">
                  <div className="flex items-center gap-1 mb-1.5">
                    <Utensils className="h-3 w-3 text-[#B08A50]" />
                    <span className="font-mono text-[10px] uppercase font-bold text-[#34252A]/60">Food</span>
                  </div>
                  <ul className="text-[11px] text-[#34252A]/70 space-y-0.5">
                    {festival.food.slice(0, 4).map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              )}
              {festival.clothing?.length > 0 && (
                <div className="bg-[#F0E7DA]/40 p-2.5 rounded-xl border border-[#E0D4C5]/60">
                  <div className="flex items-center gap-1 mb-1.5">
                    <Shirt className="h-3 w-3 text-[#6A1F35]" />
                    <span className="font-mono text-[10px] uppercase font-bold text-[#34252A]/60">Attire</span>
                  </div>
                  <ul className="text-[11px] text-[#34252A]/70 space-y-0.5">
                    {festival.clothing.slice(0, 3).map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              )}
              {festival.music?.length > 0 && (
                <div className="bg-[#F0E7DA]/40 p-2.5 rounded-xl border border-[#E0D4C5]/60">
                  <div className="flex items-center gap-1 mb-1.5">
                    <Music className="h-3 w-3 text-[#A96849]" />
                    <span className="font-mono text-[10px] uppercase font-bold text-[#34252A]/60">Music</span>
                  </div>
                  <ul className="text-[11px] text-[#34252A]/70 space-y-0.5">
                    {festival.music.slice(0, 3).map((m, i) => <li key={i}>{m}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Sources */}
          {festival.sources?.length > 0 && (
            <div className="border-t border-[#E0D4C5] pt-3">
              <h3 className="font-mono text-[11px] uppercase font-bold text-[#34252A]/50 flex items-center gap-1 mb-2 tracking-wider">
                <BookOpen className="h-3.5 w-3.5" />
                Sources & Bibliography
              </h3>
              <div className="space-y-2">
                {festival.sources.map((src, i) => (
                  <div key={i} className="font-mono text-[10px] text-[#34252A]/65 pl-2.5 border-l-2 border-[#6A1F35]/40">
                    <span className="font-bold text-[#34252A]">"{src.title}"</span>
                    {src.author && ` — ${src.author}`}
                    {src.publisher && ` (${src.publisher}`}
                    {src.year && `, ${src.year})`}
                    {src.url && (
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 ml-1.5 text-[#6A1F35] hover:underline"
                      >
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function FestivalsPage() {
  const [todayObj] = useState(() => {
    const now = new Date()
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
      day: now.getDate(),
    }
  })

  // Navigation state
  const [calYear, setCalYear] = useState(() => {
    return Math.min(Math.max(todayObj.year, MIN_YEAR), MAX_YEAR)
  })
  const [calMonth, setCalMonth] = useState(() => todayObj.month) // 0-indexed
  const [selectedDate, setSelectedDate] = useState(null)


  // Filter state
  const [tradition, setTradition] = useState('all')
  const [region, setRegion] = useState('all')
  const [category, setCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Detail modal
  const [activeFestival, setActiveFestival] = useState(null)

  // Data fetching
  const { data: rawFestivals = VERIFIED_FESTIVALS, isLoading, isError } = useQuery({
    queryKey: ['festivals_archive'],
    queryFn: fetchAllFestivals,
    initialData: VERIFIED_FESTIVALS,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Normalize data once
  const festivals = useMemo(() => rawFestivals.map(normalizeFestival), [rawFestivals])

  // Derive tradition filter options
  const traditions = useMemo(() => {
    const set = new Set()
    for (const f of festivals) {
      if (f.religion) {
        f.religion.split(',').forEach(r => {
          const t = r.trim()
          if (t) set.add(t)
        })
      }
    }
    return ['all', ...Array.from(set).sort()]
  }, [festivals])

  // Derive region filter options
  const regions = useMemo(() => {
    const set = new Set()
    for (const f of festivals) {
      if (f.regions) {
        f.regions.forEach(r => {
          const main = r.split('—')[0].trim()
          if (main && main.length <= 25) set.add(main)
        })
      }
    }
    return ['all', ...Array.from(set).sort()]
  }, [festivals])

  // Derive category filter options
  const categories = useMemo(() => {
    const set = new Set()
    for (const f of festivals) {
      if (f.category) set.add(f.category)
    }
    return ['all', ...Array.from(set).sort()]
  }, [festivals])

  // Filter festivals by active search, tradition, region, and category filters
  const filteredFestivals = useMemo(() => {
    return festivals.filter(f => {
      // Tradition filter
      if (tradition && tradition !== 'all') {
        const rel = (f.religion || '').toLowerCase()
        const trad = (f.traditionType || '').toLowerCase()
        const t = tradition.toLowerCase()
        if (!rel.includes(t) && !trad.includes(t)) return false
      }

      // Region filter
      if (region && region !== 'all') {
        const reg = region.toLowerCase()
        const matchesRegion = (f.regions || []).some(r => r.toLowerCase().includes(reg)) ||
                              (f.countries || []).some(c => c.toLowerCase().includes(reg))
        if (!matchesRegion) return false
      }

      // Category filter
      if (category && category !== 'all') {
        if (!(f.category || '').toLowerCase().includes(category.toLowerCase())) return false
      }

      // Search query
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const searchable = [
          f.name,
          ...(f.alternateNames || []),
          f.significance,
          f.culturalOrigin,
          ...(f.countries || []),
          ...(f.regions || []),
          f.religion,
          f.category,
        ].join(' ').toLowerCase()
        if (!searchable.includes(q)) return false
      }

      return true
    })
  }, [festivals, tradition, region, category, searchQuery])

  // Build event map strictly from filteredFestivals for the current calendar year
  // (ensures calendar markers and festival list always remain 100% synchronized)
  const yearEventMap = useMemo(() => buildEventMap(filteredFestivals, calYear), [filteredFestivals, calYear])

  // Month-only festivals matching current filters (sorted by start date, then name)
  const monthFestivals = useMemo(() => {
    return filteredFestivals.filter(f => {
      return f.occurrences?.some(o => {
        if (o.year !== calYear) return false
        const start = parseISODate(o.startDate)
        const end = parseISODate(o.endDate || o.startDate)
        if (!start) return false
        const occStart = new Date(start.year, start.month, start.day)
        const occEnd = new Date(end.year, end.month, end.day)
        const selStart = new Date(calYear, calMonth, 1)
        const selEnd = new Date(calYear, calMonth + 1, 0)
        return occStart <= selEnd && occEnd >= selStart
      })
    }).sort((a, b) => {
      const occA = a.occurrences?.find(o => o.year === calYear)
      const occB = b.occurrences?.find(o => o.year === calYear)
      const dateA = occA?.startDate || ''
      const dateB = occB?.startDate || ''
      if (dateA !== dateB) return dateA.localeCompare(dateB)
      return a.name.localeCompare(b.name)
    })
  }, [filteredFestivals, calYear, calMonth])

  // Displayed festivals: either the month list or filtered to the specific selected date
  const displayFestivals = useMemo(() => {
    if (!selectedDate) return monthFestivals
    const dateStr = toISODate(selectedDate.year, selectedDate.month, selectedDate.day)
    return monthFestivals.filter(f => {
      const occ = f.occurrences?.find(o => o.year === selectedDate.year)
      return occ && dateInOccurrence(dateStr, occ)
    })
  }, [monthFestivals, selectedDate])

  const monthFestivalsCount = monthFestivals.length

  // Festivals on the selected date (for day tooltip / mini-card)
  const selectedDayFestivals = useMemo(() => {
    if (!selectedDate) return []
    const dateStr = toISODate(selectedDate.year, selectedDate.month, selectedDate.day)
    return yearEventMap[dateStr] || []
  }, [selectedDate, yearEventMap])

  // Navigation handlers
  const goToPrevMonth = useCallback(() => {
    setCalMonth(m => {
      if (m === 0) {
        if (calYear > MIN_YEAR) {
          setCalYear(y => y - 1)
          return 11
        }
        return 0
      }
      return m - 1
    })
    setSelectedDate(null)
  }, [calYear])

  const goToNextMonth = useCallback(() => {
    setCalMonth(m => {
      if (m === 11) {
        if (calYear < MAX_YEAR) {
          setCalYear(y => y + 1)
          return 0
        }
        return 11
      }
      return m + 1
    })
    setSelectedDate(null)
  }, [calYear])

  const handleLocateDate = useCallback((occ) => {
    if (!occ?.startDate) return
    const parsed = parseISODate(occ.startDate)
    if (!parsed) return
    if (parsed.year !== calYear) {
      setCalYear(parsed.year)
    }
    if (parsed.month !== calMonth) {
      setCalMonth(parsed.month)
    }
    setSelectedDate({ year: parsed.year, month: parsed.month, day: parsed.day })
  }, [calYear, calMonth])

  const hasActiveFilters =
    tradition !== 'all' ||
    region !== 'all' ||
    category !== 'all' ||
    searchQuery.trim() !== '' ||
    selectedDate !== null

  const resetFilters = useCallback(() => {
    setTradition('all')
    setRegion('all')
    setCategory('all')
    setSearchQuery('')
    setSelectedDate(null)
  }, [])

  const canGoPrev = calYear > MIN_YEAR || calMonth > 0
  const canGoNext = calYear < MAX_YEAR || calMonth < 11

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="border-b border-[#E0D4C5] pb-5">
        <div className="flex items-center gap-2 text-[#6A1F35] mb-1.5">
          <Calendar className="h-5 w-5" />
          <span className="font-mono text-xs uppercase tracking-widest font-bold text-[#B08A50]">
            Living Astronomical & Cultural Calendar · 2025–2035
          </span>
        </div>
        <BlurText
          as="h1"
          text="World Festivals & Annual Occurrences"
          delay={110}
          animateBy="words"
          direction="top"
          className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-[#34252A]"
        />
        <p className="mt-1.5 text-sm text-[#34252A]/65 max-w-2xl leading-relaxed">
          Documenting variable-date sacred traditions, lunar sightings, seasonal equinoxes, and ancestral harvest ceremonies across global civilizations — with academic provenance, cultural context, and honest uncertainty labelling.
        </p>
      </div>

      {/* ── Section B: Full-width Filter Toolbar ── */}
      <div className="neu-card rounded-2xl bg-[#FAF6EF] border border-[#E0D4C5] p-4 space-y-3">

        {/* Search row */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#34252A]/40 pointer-events-none" />
          <input
            id="festival-search"
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search festivals, countries, traditions…"
            aria-label="Search festivals"
            className="w-full pl-8 pr-3 py-2 font-mono text-xs bg-[#F0E7DA]/60 border border-[#E0D4C5] rounded-xl text-[#34252A] placeholder:text-[#34252A]/40 focus:outline-none focus:border-[#6A1F35]/50 transition-colors"
          />
        </div>

        {/* Filter rows – 3-column grid on desktop */}
        <div className="grid gap-3 grid-cols-1 md:grid-cols-3">

          {/* Tradition / Religion */}
          <div>
            <div className="flex items-center gap-1 mb-1.5">
              <Filter className="h-3 w-3 text-[#34252A]/50" />
              <span className="font-mono text-[10px] text-[#34252A]/50 uppercase font-semibold tracking-wider">
                Tradition / Religion
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {traditions.slice(0, 12).map(t => (
                <button
                  key={t}
                  id={`filter-tradition-${t.replace(/\s+/g, '-').toLowerCase()}`}
                  type="button"
                  onClick={() => setTradition(t === tradition ? 'all' : t)}
                  className={`px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider rounded-full border transition-all ${
                    tradition === t
                      ? 'bg-[#6A1F35] text-[#FAF6EF] border-[#6A1F35] font-bold'
                      : 'bg-[#FAF6EF] text-[#34252A]/60 border-[#E0D4C5] hover:border-[#6A1F35]/40 hover:text-[#34252A]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Region */}
          {regions.length > 2 && (
            <div>
              <div className="flex items-center gap-1 mb-1.5">
                <Globe className="h-3 w-3 text-[#34252A]/50" />
                <span className="font-mono text-[10px] text-[#34252A]/50 uppercase font-semibold tracking-wider">
                  Region
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {regions.slice(0, 10).map(r => (
                  <button
                    key={r}
                    id={`filter-region-${r.replace(/\s+/g, '-').toLowerCase()}`}
                    type="button"
                    onClick={() => setRegion(r === region ? 'all' : r)}
                    className={`px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider rounded-full border transition-all ${
                      region === r
                        ? 'bg-[#3D7A5C] text-[#FAF6EF] border-[#3D7A5C] font-bold'
                        : 'bg-[#FAF6EF] text-[#34252A]/60 border-[#E0D4C5] hover:border-[#3D7A5C]/40 hover:text-[#34252A]'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category */}
          <div>
            <div className="flex items-center gap-1 mb-1.5">
              <span className="font-mono text-[10px] text-[#34252A]/50 uppercase font-semibold tracking-wider">
                Category
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {categories.slice(0, 10).map(cat => (
                <button
                  key={cat}
                  id={`filter-category-${cat.replace(/[\s&]+/g, '-').toLowerCase()}`}
                  type="button"
                  onClick={() => setCategory(cat === category ? 'all' : cat)}
                  className={`px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider rounded-full border transition-all ${
                    category === cat
                      ? 'bg-[#B08A50] text-[#FAF6EF] border-[#B08A50] font-bold'
                      : 'bg-[#FAF6EF] text-[#34252A]/60 border-[#E0D4C5] hover:border-[#B08A50]/40'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active filter badges + Reset */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-1 border-t border-[#E0D4C5]/60 flex-wrap gap-2">
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="font-mono text-[10px] text-[#34252A]/50 uppercase tracking-wider">Active:</span>
              {selectedDate && (
                <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-[#6A1F35]/15 text-[#6A1F35] border border-[#6A1F35]/30 px-2 py-0.5 rounded-full font-bold">
                  Date: {MONTH_NAMES[selectedDate.month]} {selectedDate.day}
                  <button type="button" onClick={() => setSelectedDate(null)} aria-label="Clear date filter">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              )}
              {tradition !== 'all' && (
                <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-[#6A1F35]/10 text-[#6A1F35] border border-[#6A1F35]/25 px-2 py-0.5 rounded-full">
                  {tradition}
                  <button type="button" onClick={() => setTradition('all')} aria-label={`Remove ${tradition} filter`}>
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              )}
              {region !== 'all' && (
                <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-[#3D7A5C]/10 text-[#3D7A5C] border border-[#3D7A5C]/25 px-2 py-0.5 rounded-full">
                  {region}
                  <button type="button" onClick={() => setRegion('all')} aria-label={`Remove ${region} filter`}>
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              )}
              {category !== 'all' && (
                <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-[#B08A50]/10 text-[#7A5C20] border border-[#B08A50]/25 px-2 py-0.5 rounded-full">
                  {category}
                  <button type="button" onClick={() => setCategory('all')} aria-label={`Remove ${category} filter`}>
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              )}
              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-[#34252A]/10 text-[#34252A]/70 border border-[#34252A]/15 px-2 py-0.5 rounded-full">
                  "{searchQuery}"
                  <button type="button" onClick={() => setSearchQuery('')} aria-label="Clear search">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              )}
            </div>
            <button
              id="reset-all-filters"
              type="button"
              onClick={resetFilters}
              className="font-mono text-[10px] text-[#6A1F35] hover:text-[#511528] font-bold transition-colors uppercase tracking-wider"
            >
              Reset All
            </button>
          </div>
        )}
      </div>

      {/* ── Section C: Two-panel layout: 42% calendar | 58% explorer ── */}
      <div className="hailey-festivals-layout">

        {/* ── LEFT PANEL: Calendar (approx 42% desktop width) ── */}
        <aside className="hailey-festivals-calendar-panel space-y-4 min-w-0">

          {/* Calendar card */}
          <div className="neu-card rounded-2xl bg-[#FAF6EF] border border-[#E0D4C5] p-4">
            {/* Month/Year navigation */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={goToPrevMonth}
                disabled={!canGoPrev}
                aria-label="Previous month"
                className="p-1.5 rounded-lg text-[#34252A]/50 hover:text-[#6A1F35] hover:bg-[#F0E7DA] disabled:opacity-30 disabled:cursor-not-allowed transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#6A1F35]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2">
                <select
                  value={calMonth}
                  onChange={e => { setCalMonth(Number(e.target.value)); setSelectedDate(null) }}
                  aria-label="Select month"
                  className="font-mono text-xs font-bold text-[#34252A] bg-transparent border-none cursor-pointer focus:outline-none"
                >
                  {MONTH_NAMES.map((m, i) => (
                    <option key={m} value={i}>{m}</option>
                  ))}
                </select>
                <select
                  value={calYear}
                  onChange={e => { setCalYear(Number(e.target.value)); setSelectedDate(null) }}
                  aria-label="Select year"
                  className="font-mono text-xs font-bold text-[#6A1F35] bg-transparent border-none cursor-pointer focus:outline-none"
                >
                  {Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={goToNextMonth}
                disabled={!canGoNext}
                aria-label="Next month"
                className="p-1.5 rounded-lg text-[#34252A]/50 hover:text-[#6A1F35] hover:bg-[#F0E7DA] disabled:opacity-30 disabled:cursor-not-allowed transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#6A1F35]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Leap year indicator */}
            {isLeapYear(calYear) && calMonth === 1 && (
              <div className="mb-2 text-[10px] font-mono text-[#B08A50] text-center">
                {calYear} is a leap year — February has 29 days
              </div>
            )}

            <CalendarGrid
              year={calYear}
              month={calMonth}
              eventMap={yearEventMap}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              today={todayObj}
            />

            {/* Legend */}
            <div className="mt-3 pt-2.5 border-t border-[#E0D4C5]/60 flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1 text-[10px] text-[#34252A]/50 font-mono">
                <span className="w-2 h-2 rounded-full bg-[#B08A50]" />
                1 festival
              </span>
              <span className="flex items-center gap-1 text-[10px] text-[#34252A]/50 font-mono">
                <span className="w-2 h-2 rounded-full bg-[#6A1F35]" />
                multiple
              </span>
              <span className="flex items-center gap-1 text-[10px] text-[#34252A]/50 font-mono">
                <span className="w-2 h-2 rounded-full bg-[#F0E7DA] ring-1 ring-[#6A1F35]/40" />
                today
              </span>
            </div>
          </div>

          {/* Selected day mini-card */}
          {selectedDate && (
            <div className="neu-card rounded-xl bg-[#F0E7DA]/60 border border-[#E0D4C5] p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[11px] font-bold text-[#6A1F35] uppercase tracking-wider">
                  {MONTH_NAMES[selectedDate.month]} {selectedDate.day}, {selectedDate.year}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedDate(null)}
                  aria-label="Clear date selection"
                  className="text-[#34252A]/40 hover:text-[#34252A] transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {selectedDayFestivals.length === 0 ? (
                <p className="font-mono text-[11px] text-[#34252A]/50">No festivals on this date.</p>
              ) : (
                <ul className="space-y-1.5">
                  {selectedDayFestivals.map(f => (
                    <li key={f.id}>
                      <button
                        type="button"
                        onClick={() => setActiveFestival(f)}
                        className="text-left w-full group"
                      >
                        <span className="font-mono text-[11px] font-semibold text-[#34252A] group-hover:text-[#6A1F35] transition-colors">
                          {f.name}
                        </span>
                        {f.religion && (
                          <span className="font-mono text-[10px] text-[#34252A]/50 ml-1.5">
                            · {f.religion.split(',')[0].trim()}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Month summary */}
          <div className="neu-card rounded-xl bg-[#FAF6EF] border border-[#E0D4C5] px-4 py-3">
            <p className="font-mono text-[11px] text-[#34252A]/60">
              <span className="font-bold text-[#34252A]">{monthFestivalsCount}</span>{' '}
              festival{monthFestivalsCount !== 1 ? 's' : ''} in {MONTH_NAMES[calMonth]} {calYear}
              {hasActiveFilters && (
                <span className="text-[#6A1F35]"> (filters applied)</span>
              )}
            </p>
          </div>
        </aside>

        {/* ── RIGHT PANEL: Festival explorer (approx 58% desktop width) ── */}
        <section className="hailey-festivals-explorer-panel space-y-5 min-w-0">

          {/* Selected Date banner */}
          {selectedDate && (
            <div className="neu-card rounded-xl bg-[#6A1F35]/5 border border-[#6A1F35]/20 p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#6A1F35]" />
                <span className="font-mono text-xs font-bold text-[#6A1F35]">
                  Showing festivals for {MONTH_NAMES[selectedDate.month]} {selectedDate.day}, {selectedDate.year} ({displayFestivals.length} found)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDate(null)}
                className="font-mono text-xs text-[#6A1F35] font-bold underline hover:text-[#511528] transition-colors"
              >
                Show entire {MONTH_NAMES[calMonth]}
              </button>
            </div>
          )}

          {/* List header */}
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-lg font-bold text-[#34252A]">
              {selectedDate
                ? `${MONTH_NAMES[selectedDate.month]} ${selectedDate.day}, ${selectedDate.year}`
                : `${MONTH_NAMES[calMonth]} ${calYear}`}
            </h2>
            <span className="font-mono text-xs text-[#34252A]/50">
              {displayFestivals.length} result{displayFestivals.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="text-center py-12 font-mono text-sm text-[#34252A]/50">
              Loading cultural calendar…
            </div>
          )}

          {/* Error state (Supabase down — fallback should still work) */}
          {isError && (
            <div className="flex items-center gap-2 font-mono text-xs text-[#B08A50] bg-[#F0E7DA]/60 border border-[#B08A50]/25 rounded-xl px-4 py-3">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Using offline archive — live database unavailable.</span>
            </div>
          )}

          {/* Festival grid */}
          {!isLoading && (
            <>
              {displayFestivals.length === 0 ? (
                <div className="neu-card rounded-2xl bg-[#FAF6EF] border border-[#E0D4C5] p-10 text-center">
                  <Calendar className="h-8 w-8 text-[#34252A]/20 mx-auto mb-3" />
                  <p className="font-serif text-base font-bold text-[#34252A]/50 mb-1">
                    {selectedDate
                      ? `No festivals occurring on ${MONTH_NAMES[selectedDate.month]} ${selectedDate.day}, ${selectedDate.year}`
                      : `No festivals in ${MONTH_NAMES[calMonth]} ${calYear}`}
                  </p>
                  <p className="font-mono text-xs text-[#34252A]/40">
                    {hasActiveFilters
                      ? 'Try adjusting or clearing your filters.'
                      : 'This month has no documented festivals in our current archive.'}
                  </p>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="mt-3 font-mono text-xs text-[#6A1F35] font-bold hover:text-[#511528] transition-colors"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {displayFestivals.map(festival => (
                    <FestivalCard
                      key={festival.id || festival.slug}
                      festival={festival}
                      selectedYear={calYear}
                      today={todayObj}
                      onOpen={setActiveFestival}
                      onLocateDate={handleLocateDate}
                    />
                  ))}
                </div>
              )}

              {/* Data provenance note */}
              {displayFestivals.length > 0 && (
                <div className="flex items-start gap-2 font-mono text-[10px] text-[#34252A]/40 mt-2">
                  <Info className="h-3 w-3 shrink-0 mt-0.5" />
                  <span>
                    Dates marked "est." are computed estimates and may differ from announced dates by local religious authorities.
                    Lunar and lunisolar dates in 2028–2035 are subject to revision. Fixed Gregorian dates are certain.
                  </span>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* Festival detail modal */}
      {activeFestival && (
        <FestivalDetailModal
          festival={activeFestival}
          selectedYear={calYear}
          onClose={() => setActiveFestival(null)}
        />
      )}
    </div>
  )
}

export default FestivalsPage
