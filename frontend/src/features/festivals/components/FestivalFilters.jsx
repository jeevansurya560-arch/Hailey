import { useState, useEffect } from 'react'
import {
  Search,
  RotateCcw,
  Gift,
  MapPin,
  LayoutGrid,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

// Default curated options matching reference screenshot
const CURATED_TRADITIONS = [
  'All',
  'Hinduism',
  'Islam',
  'Christianity',
  'Buddhism',
  'Sikhism',
  'Jainism',
  'Judaism',
  'Chinese Tradition',
  'African Traditional',
  'Indigenous',
  'Zoroastrianism',
  "Bahá'í"
]

const CURATED_REGIONS = [
  'All',
  'Americas',
  'Europe',
  'South Asia',
  'East Asia',
  'Southeast Asia',
  'Middle East',
  'Africa',
  'Oceania',
  'Central Asia',
  'Global',
  'Diaspora'
]

const CURATED_CATEGORIES = [
  'All',
  'Religious & Spiritual',
  'Cultural & Civic',
  'Ancestral & Seasonal',
  'Harvest & Agricultural',
  'Family & Community',
  'Astrological & Astronomical',
  'National & Regional',
  'Historical Commemoration',
  'Fasting & Observance',
  'Arts, Music & Performance'
]

export function FestivalFilters({
  searchQuery,
  onSearchChange,
  tradition,
  onTraditionChange,
  region,
  onRegionChange,
  category,
  onCategoryChange,
  onResetFilters,
  resultCount = 0,
  hasActiveFilters = false,
  selectedDate = null,
  onClearDate
}) {
  const [expandTraditions, setExpandTraditions] = useState(false)
  const [expandRegions, setExpandRegions] = useState(false)
  const [expandCategories, setExpandCategories] = useState(false)

  // Global keyboard shortcut for search (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        const input = document.getElementById('festival-search-input')
        input?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const displayedTraditions = expandTraditions ? CURATED_TRADITIONS : CURATED_TRADITIONS.slice(0, 13)
  const displayedRegions = expandRegions ? CURATED_REGIONS : CURATED_REGIONS.slice(0, 12)
  const displayedCategories = expandCategories ? CURATED_CATEGORIES : CURATED_CATEGORIES.slice(0, 11)

  return (
    <section
      aria-label="Festival search and filters"
      className="neu-card rounded-2xl bg-[#FAF6EF] border border-[#E0D4C5] p-4 md:p-5 space-y-4"
    >
      {/* ── Row 1: Search Input & Clear Filters ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#75666B] pointer-events-none" />
          <input
            id="festival-search-input"
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search festivals, countries, traditions..."
            aria-label="Search festivals, countries, traditions"
            className="w-full pl-10 pr-14 py-2.5 font-sans text-xs bg-[#FAF6EF] border border-[#E0D4C5] rounded-xl text-[#34252A] placeholder:text-[#75666B]/60 focus:outline-none focus:border-[#6A1F35] focus:ring-1 focus:ring-[#6A1F35] transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
            <kbd className="px-1.5 py-0.5 font-mono text-[10px] text-[#75666B] bg-[#F0E7DA] border border-[#E0D4C5] rounded">
              ⌘ K
            </kbd>
          </div>
        </div>

        {/* Clear Filters Button */}
        <button
          type="button"
          onClick={onResetFilters}
          disabled={!hasActiveFilters}
          className={`shrink-0 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 font-mono text-xs font-semibold rounded-xl border transition-all ${
            hasActiveFilters
              ? 'bg-[#FAF6EF] border-[#E0D4C5] text-[#6A1F35] hover:bg-[#F0E7DA] hover:border-[#6A1F35]/40 cursor-pointer shadow-sm'
              : 'bg-[#FAF6EF]/60 border-[#E0D4C5]/60 text-[#75666B]/50 cursor-not-allowed'
          }`}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Clear Filters</span>
        </button>
      </div>

      {/* ── Row 2: 3-Column Advanced Filters (Desktop) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 pt-1">
        {/* Column 1: Tradition / Religion */}
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-1.5 text-[#34252A]">
              <Gift className="h-3.5 w-3.5 text-[#B08A50]" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#34252A]/80">
                Tradition / Religion
              </span>
            </div>
            <button
              type="button"
              onClick={() => setExpandTraditions(!expandTraditions)}
              className="font-mono text-[10px] font-semibold text-[#6A1F35] hover:text-[#4D1729] flex items-center gap-0.5 transition-colors"
            >
              <span>{expandTraditions ? 'Less' : 'View All'}</span>
              <span>→</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {displayedTraditions.map((t) => {
              const isActive = (t === 'All' && tradition === 'all') || tradition.toLowerCase() === t.toLowerCase()
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => onTraditionChange(t === 'All' ? 'all' : t)}
                  className={`px-2.5 py-1 font-sans text-xs rounded-full border transition-all ${
                    isActive
                      ? 'bg-[#6D2039] text-[#FAF6EF] border-[#6D2039] font-medium shadow-sm'
                      : 'bg-[#FAF6EF] text-[#34252A]/75 border-[#E0D4C5] hover:border-[#6D2039]/40 hover:text-[#34252A]'
                  }`}
                >
                  {t}
                </button>
              )
            })}
          </div>
        </div>

        {/* Column 2: Region */}
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-1.5 text-[#34252A]">
              <MapPin className="h-3.5 w-3.5 text-[#B08A50]" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#34252A]/80">
                Region
              </span>
            </div>
            <button
              type="button"
              onClick={() => setExpandRegions(!expandRegions)}
              className="font-mono text-[10px] font-semibold text-[#6A1F35] hover:text-[#4D1729] flex items-center gap-0.5 transition-colors"
            >
              <span>{expandRegions ? 'Less' : 'View All'}</span>
              <span>→</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {displayedRegions.map((r) => {
              const isActive = (r === 'All' && region === 'all') || region.toLowerCase() === r.toLowerCase()
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => onRegionChange(r === 'All' ? 'all' : r)}
                  className={`px-2.5 py-1 font-sans text-xs rounded-full border transition-all ${
                    isActive
                      ? 'bg-[#6D2039] text-[#FAF6EF] border-[#6D2039] font-medium shadow-sm'
                      : 'bg-[#FAF6EF] text-[#34252A]/75 border-[#E0D4C5] hover:border-[#6D2039]/40 hover:text-[#34252A]'
                  }`}
                >
                  {r}
                </button>
              )
            })}
          </div>
        </div>

        {/* Column 3: Category */}
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-1.5 text-[#34252A]">
              <LayoutGrid className="h-3.5 w-3.5 text-[#B08A50]" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#34252A]/80">
                Category
              </span>
            </div>
            <button
              type="button"
              onClick={() => setExpandCategories(!expandCategories)}
              className="font-mono text-[10px] font-semibold text-[#6A1F35] hover:text-[#4D1729] flex items-center gap-0.5 transition-colors"
            >
              <span>{expandCategories ? 'Less' : 'View All'}</span>
              <span>→</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {displayedCategories.map((c) => {
              const isActive = (c === 'All' && category === 'all') || category.toLowerCase() === c.toLowerCase()
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => onCategoryChange(c === 'All' ? 'all' : c)}
                  className={`px-2.5 py-1 font-sans text-xs rounded-full border transition-all ${
                    isActive
                      ? 'bg-[#6D2039] text-[#FAF6EF] border-[#6D2039] font-medium shadow-sm'
                      : 'bg-[#FAF6EF] text-[#34252A]/75 border-[#E0D4C5] hover:border-[#6D2039]/40 hover:text-[#34252A]'
                  }`}
                >
                  {c}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Row 3: Active Filters Summary & Count Indicator ── */}
      {hasActiveFilters && (
        <div className="pt-3 border-t border-[#E0D4C5] flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-[10px] uppercase font-bold text-[#75666B]">
              Active Filters:
            </span>

            {selectedDate && (
              <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-[#6D2039]/10 text-[#6D2039] border border-[#6D2039]/25 px-2 py-0.5 rounded-full font-bold">
                Date: {selectedDate.month + 1}/{selectedDate.day}/{selectedDate.year}
                <button type="button" onClick={onClearDate} aria-label="Clear date filter">
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            )}

            {tradition !== 'all' && (
              <span className="inline-flex items-center gap-1 font-sans text-xs bg-[#F0E7DA] text-[#34252A] border border-[#E0D4C5] px-2.5 py-0.5 rounded-full">
                {tradition}
                <button type="button" onClick={() => onTraditionChange('all')} aria-label={`Remove ${tradition} filter`}>
                  <X className="h-3 w-3 text-[#75666B] hover:text-[#6A1F35]" />
                </button>
              </span>
            )}

            {region !== 'all' && (
              <span className="inline-flex items-center gap-1 font-sans text-xs bg-[#F0E7DA] text-[#34252A] border border-[#E0D4C5] px-2.5 py-0.5 rounded-full">
                {region}
                <button type="button" onClick={() => onRegionChange('all')} aria-label={`Remove ${region} filter`}>
                  <X className="h-3 w-3 text-[#75666B] hover:text-[#6A1F35]" />
                </button>
              </span>
            )}

            {category !== 'all' && (
              <span className="inline-flex items-center gap-1 font-sans text-xs bg-[#F0E7DA] text-[#34252A] border border-[#E0D4C5] px-2.5 py-0.5 rounded-full">
                {category}
                <button type="button" onClick={() => onCategoryChange('all')} aria-label={`Remove ${category} filter`}>
                  <X className="h-3 w-3 text-[#75666B] hover:text-[#6A1F35]" />
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1 font-sans text-xs bg-[#F0E7DA] text-[#34252A] border border-[#E0D4C5] px-2.5 py-0.5 rounded-full">
                "{searchQuery}"
                <button type="button" onClick={() => onSearchChange('')} aria-label="Clear search query">
                  <X className="h-3 w-3 text-[#75666B] hover:text-[#6A1F35]" />
                </button>
              </span>
            )}
          </div>

          <div className="font-mono text-xs text-[#75666B]">
            <span className="font-bold text-[#34252A]">{resultCount}</span> festival{resultCount !== 1 ? 's' : ''} found
          </div>
        </div>
      )}
    </section>
  )
}
export default FestivalFilters
