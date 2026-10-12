import { useState, useMemo } from 'react'
import {
  List,
  Map as MapIcon,
  ArrowUpDown,
  Calendar,
  AlertCircle,
  X
} from 'lucide-react'
import { FestivalCard } from './FestivalCard'
import { FestivalMapView } from './FestivalMapView'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function FestivalExplorer({
  festivals,
  calYear,
  calMonth,
  selectedDate,
  onClearDate,
  today,
  onOpenDetail,
  onResetFilters,
  hasActiveFilters,
  bookmarkedIds = new Set(),
  onToggleBookmark
}) {
  const [viewMode, setViewMode] = useState('list') // 'list' | 'map'
  const [sortOption, setSortOption] = useState('date') // 'date' | 'name' | 'status'

  // Apply sorting
  const sortedFestivals = useMemo(() => {
    return [...festivals].sort((a, b) => {
      const occA = a.occurrences?.find((o) => o.year === calYear)
      const occB = b.occurrences?.find((o) => o.year === calYear)

      if (sortOption === 'date') {
        const dateA = occA?.startDate || ''
        const dateB = occB?.startDate || ''
        if (dateA !== dateB) return dateA.localeCompare(dateB)
        return a.name.localeCompare(b.name)
      }

      if (sortOption === 'name') {
        return a.name.localeCompare(b.name)
      }

      if (sortOption === 'status') {
        const todayStr = `${today.year}-${String(today.month + 1).padStart(2, '0')}-${String(today.day).padStart(2, '0')}`
        const isOngoingA = occA && occA.startDate <= todayStr && todayStr <= (occA.endDate || occA.startDate)
        const isOngoingB = occB && occB.startDate <= todayStr && todayStr <= (occB.endDate || occB.startDate)
        if (isOngoingA && !isOngoingB) return -1
        if (!isOngoingA && isOngoingB) return 1
        return (occA?.startDate || '').localeCompare(occB?.startDate || '')
      }

      return 0
    })
  }, [festivals, calYear, sortOption, today])

  const explorerTitle = selectedDate
    ? `${MONTH_NAMES[selectedDate.month]} ${selectedDate.day}, ${selectedDate.year}`
    : `${MONTH_NAMES[calMonth]} ${calYear}`

  return (
    <section
      aria-label="Festival explorer"
      className="space-y-4"
    >
      {/* ── Explorer Header & View Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#34252A] tracking-tight">
            {MONTH_NAMES[calMonth]} {calYear}
          </h2>
          {selectedDate && (
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-xs text-[#6D2039] font-semibold">
                Focused on {MONTH_NAMES[selectedDate.month]} {selectedDate.day}
              </span>
              <button
                type="button"
                onClick={onClearDate}
                className="font-mono text-xs text-[#75666B] underline hover:text-[#6D2039] flex items-center gap-0.5"
              >
                <span>Show all {MONTH_NAMES[calMonth]}</span>
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        {/* Right-side Controls: Sort & List/Map Toggle */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Sort Dropdown */}
          <div className="relative inline-flex items-center bg-[#FAF6EF] border border-[#E0D4C5] rounded-xl px-2.5 py-1.5 shadow-sm text-xs font-mono text-[#34252A]">
            <ArrowUpDown className="h-3.5 w-3.5 text-[#75666B] mr-1.5" />
            <span className="text-[#75666B] mr-1">Sort by:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              aria-label="Sort festivals"
              className="appearance-none bg-transparent font-bold cursor-pointer focus:outline-none pr-3"
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="status">Status</option>
            </select>
          </div>

          {/* List / Map Switcher */}
          <div className="inline-flex items-center p-1 bg-[#F0E7DA]/60 border border-[#E0D4C5] rounded-xl shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-pressed={viewMode === 'list'}
              className={`inline-flex items-center gap-1.5 px-3 py-1 font-mono text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-[#6D2039] text-[#FAF6EF] shadow-sm font-bold'
                  : 'text-[#34252A]/70 hover:text-[#6D2039]'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>List</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              aria-pressed={viewMode === 'map'}
              className={`inline-flex items-center gap-1.5 px-3 py-1 font-mono text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'map'
                  ? 'bg-[#6D2039] text-[#FAF6EF] shadow-sm font-bold'
                  : 'text-[#34252A]/70 hover:text-[#6D2039]'
              }`}
            >
              <MapIcon className="h-3.5 w-3.5" />
              <span>Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── View Content ── */}
      {viewMode === 'map' ? (
        <FestivalMapView
          festivals={sortedFestivals}
          selectedYear={calYear}
          onSelectFestival={onOpenDetail}
        />
      ) : (
        <div className="space-y-4">
          {sortedFestivals.length === 0 ? (
            /* Empty State */
            <div className="neu-card rounded-2xl bg-[#FAF6EF] border border-[#E0D4C5] p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#F0E7DA] border border-[#E0D4C5] flex items-center justify-center text-[#B08A50] mx-auto shadow-sm">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#34252A]">
                {selectedDate
                  ? `No festivals on ${MONTH_NAMES[selectedDate.month]} ${selectedDate.day}, ${selectedDate.year}`
                  : `No festivals match your criteria in ${MONTH_NAMES[calMonth]} ${calYear}`}
              </h3>
              <p className="font-sans text-xs text-[#75666B] max-w-md mx-auto leading-relaxed">
                {hasActiveFilters
                  ? 'No documented observances match the current filter and search criteria. Try clearing or expanding your filters.'
                  : 'This month has no documented festivals in our current historical archive.'}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 font-mono text-xs font-bold text-[#FAF6EF] bg-[#6D2039] hover:bg-[#4D1729] rounded-xl shadow-sm transition-all"
                >
                  <span>Reset All Filters</span>
                </button>
              )}
            </div>
          ) : (
            /* List of Festival Cards */
            <div className="space-y-3.5">
              {sortedFestivals.map((festival) => (
                <FestivalCard
                  key={festival.id || festival.slug}
                  festival={festival}
                  selectedYear={calYear}
                  today={today}
                  onOpen={onOpenDetail}
                  isBookmarked={bookmarkedIds.has(festival.id || festival.slug)}
                  onToggleBookmark={onToggleBookmark}
                />
              ))}
            </div>
          )}

          {/* Academic Provenance Note */}
          {sortedFestivals.length > 0 && (
            <div className="flex items-start gap-2 pt-2 text-[11px] font-mono text-[#75666B] leading-normal border-t border-[#E0D4C5]/60">
              <AlertCircle className="h-3.5 w-3.5 text-[#B08A50] shrink-0 mt-0.5" />
              <p>
                Cultural dates are compiled from verified astronomical ephemerides and ecclesiastical calendars. Lunar and lunisolar observances (e.g. Islamic, Hindu, Hebrew, Chinese) are subject to local sightings and regional authority declarations.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
export default FestivalExplorer
