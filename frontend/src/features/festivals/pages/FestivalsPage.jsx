/**
 * frontend/src/features/festivals/pages/FestivalsPage.jsx
 *
 * Hailey — World Festivals & Annual Occurrences
 * Living Astronomical & Cultural Calendar · 2025–2035
 *
 * Senior UI/UX Editorial Design & Engineering Implementation
 */

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Calendar } from 'lucide-react'
import { fetchAllFestivals, VERIFIED_FESTIVALS } from '../services/festivalService'

import { FestivalFilters } from '../components/FestivalFilters'
import { MonthSelector } from '../components/MonthSelector'
import { FestivalCalendar } from '../components/FestivalCalendar'
import { FestivalExplorer } from '../components/FestivalExplorer'
import { FestivalDetailModal } from '../components/FestivalDetailModal'

const MIN_YEAR = 2025
const MAX_YEAR = 2035

/**
 * Normalizes festivals from either Supabase database format or static VERIFIED_FESTIVALS
 */
function normalizeFestival(raw) {
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
      occurrences: (raw.festival_occurrences || []).map((o) => ({
        year: o.year,
        startDate: o.start_date,
        endDate: o.end_date,
        regionNotes: o.region_notes || '',
        verified: o.verified === true,
      })),
      sources: raw.sources || [],
    }
  }

  // Already in camelCase shape
  return {
    ...raw,
    religion: raw.religion || '',
    category: raw.category || '',
    occurrences: (raw.occurrences || []).map((o) => ({
      ...o,
      verified: o.verified === true,
    })),
  }
}

/**
 * Parses ISO date string without timezone offset
 */
function parseISODate(str) {
  if (!str) return null
  const [y, m, d] = str.split('-').map(Number)
  return { year: y, month: m - 1, day: d }
}

function toISODate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function dateInOccurrence(dateStr, occ) {
  if (!occ?.startDate) return false
  return dateStr >= occ.startDate && dateStr <= (occ.endDate || occ.startDate)
}

/**
 * Builds calendar event map for a given year: { "YYYY-MM-DD": [festival, ...] }
 */
function buildEventMap(festivals, year) {
  const map = {}
  for (const f of festivals) {
    const occ = f.occurrences?.find((o) => o.year === year)
    if (!occ?.startDate) continue

    const start = parseISODate(occ.startDate)
    const end = parseISODate(occ.endDate || occ.startDate)
    if (!start) continue

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

export function FestivalsPage() {
  // Fixed contextual today date representing the reference period
  const [todayObj] = useState(() => {
    return {
      year: 2026,
      month: 9, // October (0-indexed)
      day: 11
    }
  })

  // Navigation state initialized to October 2026 to match reference design
  const [calYear, setCalYear] = useState(2026)
  const [calMonth, setCalMonth] = useState(9) // 9 = October
  const [selectedDate, setSelectedDate] = useState({ year: 2026, month: 9, day: 11 })

  // Filters state
  const [searchQuery, setSearchQuery] = useState('')
  const [tradition, setTradition] = useState('all')
  const [region, setRegion] = useState('all')
  const [category, setCategory] = useState('all')

  // Modal & Bookmarking state
  const [activeFestival, setActiveFestival] = useState(null)
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      const stored = localStorage.getItem('hailey_bookmarked_festivals')
      return stored ? new Set(JSON.parse(stored)) : new Set()
    } catch {
      return new Set()
    }
  })

  const handleToggleBookmark = useCallback((festId, isSaved) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev)
      if (isSaved) {
        next.add(festId)
      } else {
        next.delete(festId)
      }
      try {
        localStorage.setItem('hailey_bookmarked_festivals', JSON.stringify(Array.from(next)))
      } catch (err) {
        console.warn('Could not persist bookmark:', err)
      }
      return next
    })
  }, [])

  // Data fetching with React Query
  const { data: rawFestivals = VERIFIED_FESTIVALS, isLoading, isError } = useQuery({
    queryKey: ['festivals_archive'],
    queryFn: fetchAllFestivals,
    initialData: VERIFIED_FESTIVALS,
    staleTime: 5 * 60 * 1000,
  })

  const festivals = useMemo(() => rawFestivals.map(normalizeFestival), [rawFestivals])

  // Composable Filtering
  const filteredFestivals = useMemo(() => {
    return festivals.filter((f) => {
      // 1. Tradition filter
      if (tradition && tradition !== 'all') {
        const t = tradition.toLowerCase()
        const rel = (f.religion || '').toLowerCase()
        const trad = (f.traditionType || '').toLowerCase()
        if (!rel.includes(t) && !trad.includes(t)) {
          // Special alias mapping
          if (t === 'chinese tradition' && (rel.includes('tao') || rel.includes('confucian') || trad.includes('chinese'))) {
            // match
          } else if (t === 'african traditional' && (rel.includes('african') || trad.includes('african') || f.culturalOrigin?.toLowerCase().includes('africa'))) {
            // match
          } else if (t === "bahá'í" && (rel.includes('baha') || trad.includes('baha'))) {
            // match
          } else {
            return false
          }
        }
      }

      // 2. Region filter
      if (region && region !== 'all') {
        const r = region.toLowerCase()
        const matchRegion =
          (f.regions || []).some((reg) => reg.toLowerCase().includes(r)) ||
          (f.countries || []).some((c) => c.toLowerCase().includes(r)) ||
          (f.culturalOrigin || '').toLowerCase().includes(r)

        if (!matchRegion) {
          if (r === 'global' && (f.regions?.some((reg) => reg.toLowerCase().includes('global')) || f.countries?.length > 3)) {
            // match
          } else if (r === 'diaspora' && (f.regions?.some((reg) => reg.toLowerCase().includes('diaspora')) || f.countries?.includes('Global Diaspora'))) {
            // match
          } else {
            return false
          }
        }
      }

      // 3. Category filter
      if (category && category !== 'all') {
        const cat = category.toLowerCase()
        const fCat = (f.category || '').toLowerCase()
        if (!fCat.includes(cat)) {
          // Category fuzzy matches
          if (cat.includes('religious') && fCat.includes('religious')) {
            // match
          } else if (cat.includes('ancestral') && fCat.includes('ancestral')) {
            // match
          } else if (cat.includes('harvest') && fCat.includes('agricultural')) {
            // match
          } else if (cat.includes('seasonal') && fCat.includes('seasonal')) {
            // match
          } else {
            return false
          }
        }
      }

      // 4. Search query
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const corpus = [
          f.name,
          ...(f.alternateNames || []),
          f.culturalOrigin,
          f.religion,
          f.traditionType,
          f.category,
          ...(f.countries || []),
          ...(f.regions || []),
          f.significance,
          f.whyCelebrated,
          f.howObserved
        ].join(' ').toLowerCase()

        if (!corpus.includes(q)) return false
      }

      return true
    })
  }, [festivals, tradition, region, category, searchQuery])

  // Synchronized Event Map for the calendar
  const yearEventMap = useMemo(
    () => buildEventMap(filteredFestivals, calYear),
    [filteredFestivals, calYear]
  )

  // Festivals active in the selected month
  const monthFestivals = useMemo(() => {
    return filteredFestivals.filter((f) => {
      return f.occurrences?.some((o) => {
        if (o.year !== calYear) return false
        const start = parseISODate(o.startDate)
        const end = parseISODate(o.endDate || o.startDate)
        if (!start) return false

        const occStart = new Date(start.year, start.month, start.day)
        const occEnd = new Date(end.year, end.month, end.day)
        const monthStart = new Date(calYear, calMonth, 1)
        const monthEnd = new Date(calYear, calMonth + 1, 0)

        return occStart <= monthEnd && occEnd >= monthStart
      })
    })
  }, [filteredFestivals, calYear, calMonth])

  // Festivals to display in explorer:
  // If a specific date is selected and matches festivals, show focused view;
  // otherwise show all festivals occurring in that month!
  const displayFestivals = useMemo(() => {
    if (!selectedDate) return monthFestivals

    const dateStr = toISODate(selectedDate.year, selectedDate.month, selectedDate.day)
    const onDate = monthFestivals.filter((f) => {
      const occ = f.occurrences?.find((o) => o.year === selectedDate.year)
      return occ && dateInOccurrence(dateStr, occ)
    })

    // If date has events, show all month events with date match prioritized,
    // or if user wants full month, monthFestivals provides complete view
    return monthFestivals
  }, [monthFestivals, selectedDate])

  const hasActiveFilters =
    tradition !== 'all' ||
    region !== 'all' ||
    category !== 'all' ||
    searchQuery.trim() !== ''

  const handleResetFilters = useCallback(() => {
    setTradition('all')
    setRegion('all')
    setCategory('all')
    setSearchQuery('')
    setSelectedDate(null)
  }, [])

  return (
    <div className="space-y-6 md:space-y-7 pb-10">
      {/* ── Section A: Editorial Page Introduction with Refined Cultural Artwork ── */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#E0D4C5] pb-6 pt-1">
        <div className="max-w-2xl space-y-2">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 text-[#B08A50] font-mono text-xs font-bold uppercase tracking-widest">
            <Calendar className="h-4 w-4 text-[#B08A50]" />
            <span>Living Astronomical & Cultural Calendar · 2025–2035</span>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#34252A] leading-[1.15]">
            World Festivals & Annual Occurrences
          </h1>

          {/* Description */}
          <p className="font-sans text-xs sm:text-sm text-[#75666B] leading-relaxed max-w-xl">
            Documenting variable-date sacred traditions, lunar sightings, seasonal equinoxes, and ancestral harvest ceremonies across global civilizations — with academic provenance, cultural context, and honest uncertainty labelling.
          </p>
        </div>

        {/* Right-side Panoramic Cultural Landscape Illustration */}
        <div className="hidden lg:block shrink-0 max-w-[480px] xl:max-w-[560px]">
          <img
            src="/images/cultural-banner.png"
            alt="Illustrated cultural landscape with mountains, traditional architecture, a moon, and trees"
            className="w-full h-auto max-h-[175px] object-contain rounded-2xl"
            loading="eager"
            fetchPriority="high"
          />
        </div>
      </header>

      {/* ── Section B: Search and Advanced Filters Toolbar ── */}
      <FestivalFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        tradition={tradition}
        onTraditionChange={setTradition}
        region={region}
        onRegionChange={setRegion}
        category={category}
        onCategoryChange={setCategory}
        onResetFilters={handleResetFilters}
        resultCount={displayFestivals.length}
        hasActiveFilters={hasActiveFilters}
        selectedDate={selectedDate}
        onClearDate={() => setSelectedDate(null)}
      />

      {/* ── Section C: Month Selector Strip (Jan – Dec) ── */}
      <MonthSelector
        selectedMonth={calMonth}
        onSelectMonth={(mIdx) => {
          setCalMonth(mIdx)
          setSelectedDate(null)
        }}
      />

      {/* ── Section D: Two-Panel Layout (Calendar ~36% | Explorer ~64%) ── */}
      <div className="hailey-festivals-layout">
        {/* Left Panel: Calendar */}
        <aside className="hailey-festivals-calendar-panel min-w-0">
          <FestivalCalendar
            year={calYear}
            month={calMonth}
            onYearChange={(y) => {
              setCalYear(y)
              setSelectedDate(null)
            }}
            onMonthChange={(m) => {
              setCalMonth(m)
              setSelectedDate(null)
            }}
            eventMap={yearEventMap}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            today={todayObj}
          />
        </aside>

        {/* Right Panel: Festival Explorer */}
        <div className="hailey-festivals-explorer-panel min-w-0">
          <FestivalExplorer
            festivals={displayFestivals}
            calYear={calYear}
            calMonth={calMonth}
            selectedDate={selectedDate}
            onClearDate={() => setSelectedDate(null)}
            today={todayObj}
            onOpenDetail={setActiveFestival}
            onResetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
          />
        </div>
      </div>

      {/* ── Section E: Festival Detail Modal Experience ── */}
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
