import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Globe, BookOpen, Music, Utensils, Shirt, Filter, ChevronRight } from 'lucide-react'
import { fetchAllFestivals } from '../services/festivalService'

export function FestivalsPage() {
  const [selectedReligion, setSelectedReligion] = useState('all')
  const [selectedYear, setSelectedYear] = useState(2026)
  const [activeFestival, setActiveFestival] = useState(null)

  const { data: festivals = [] } = useQuery({
    queryKey: ['festivals_archive'],
    queryFn: fetchAllFestivals,
  })

  // Distinct religions for filter pills
  const religions = useMemo(() => {
    const list = new Set()
    for (const f of festivals) {
      if (f.religion) {
        f.religion.split(',').forEach((r) => list.add(r.trim()))
      }
    }
    return ['all', ...Array.from(list).sort()]
  }, [festivals])

  const filteredFestivals = useMemo(() => {
    return festivals.filter((f) => {
      if (selectedReligion === 'all') return true
      return f.religion?.toLowerCase().includes(selectedReligion.toLowerCase())
    })
  }, [festivals, selectedReligion])

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-[var(--line)] pb-5">
        <div className="flex items-center gap-2 text-[var(--clay)] mb-1">
          <Calendar className="h-5 w-5" />
          <span className="font-mono text-xs uppercase tracking-widest font-bold">
            Living Astronomical & Cultural Calendar
          </span>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-[var(--ink)]">
          World Festivals & Annual Occurrences
        </h1>
        <p className="mt-1 text-sm text-[var(--ink-2)] max-w-2xl leading-relaxed">
          Documenting variable-date sacred traditions, lunar sightings, seasonal equinoxes, and ancestral harvest ceremonies across global civilizations with academic provenance.
        </p>

        {/* Filter Toolbar */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Tradition filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[11px] text-[var(--ink-2)] uppercase mr-1 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Tradition:
            </span>
            {religions.slice(0, 7).map((rel) => (
              <button
                key={rel}
                type="button"
                onClick={() => setSelectedReligion(rel)}
                className={`px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider rounded border transition-all ${
                  selectedReligion === rel
                    ? 'bg-[var(--clay)] text-[var(--paper)] border-[var(--clay)] font-bold'
                    : 'bg-[var(--paper)] text-[var(--ink-2)] border-[var(--line)] hover:border-[var(--ink)]'
                }`}
              >
                {rel}
              </button>
            ))}
          </div>

          {/* Year selector */}
          <div className="flex items-center gap-1 bg-[var(--paper-2)] border border-[var(--line)] p-0.5 rounded">
            {[2025, 2026, 2027].map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => setSelectedYear(yr)}
                className={`px-2.5 py-0.5 font-mono text-xs font-semibold rounded transition-colors ${
                  selectedYear === yr
                    ? 'bg-[var(--ink)] text-[var(--paper)] shadow-[1px_1px_0_var(--ink)]'
                    : 'text-[var(--ink-2)] hover:text-[var(--ink)]'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Festivals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredFestivals.map((festival) => {
          const occurrence = festival.occurrences?.find((o) => o.year === selectedYear)
          return (
            <article
              key={festival.id}
              className="border border-[var(--ink)] bg-[var(--paper-2)] p-6 shadow-[var(--shadow-hard)] flex flex-col justify-between space-y-4 transition-all hover:-translate-y-0.5"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--paper)] border border-[var(--line)] text-[var(--ink-2)]">
                      {festival.traditionType}
                    </span>
                    <h2 className="font-serif text-2xl font-bold text-[var(--ink)] mt-1.5">
                      {festival.name}
                    </h2>
                    {festival.alternateNames?.length > 0 && (
                      <p className="font-mono text-xs text-[var(--ink-2)]">
                        aka {festival.alternateNames.join(' · ')}
                      </p>
                    )}
                  </div>

                  {occurrence && (
                    <div className="text-right border border-[var(--line)] bg-[var(--paper)] px-3 py-1.5 rounded">
                      <span className="font-mono text-[10px] text-[var(--clay)] uppercase font-bold block">
                        {selectedYear} Occurrence
                      </span>
                      <span className="font-mono text-xs font-bold text-[var(--ink)]">
                        {occurrence.startDate}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-[var(--ink-2)] leading-relaxed">
                  {festival.significance}
                </p>

                {/* Cultural Attributes Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-[var(--line)]">
                  <div className="flex items-start gap-1.5 text-[11px] text-[var(--ink)]">
                    <Utensils className="h-3.5 w-3.5 text-[var(--saffron)] shrink-0 mt-0.5" />
                    <span className="truncate" title={festival.food?.join(', ')}>
                      {festival.food?.[0] || 'Ceremonial food'}
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5 text-[11px] text-[var(--ink)]">
                    <Shirt className="h-3.5 w-3.5 text-[var(--moss)] shrink-0 mt-0.5" />
                    <span className="truncate" title={festival.clothing?.join(', ')}>
                      {festival.clothing?.[0] || 'Traditional attire'}
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5 text-[11px] text-[var(--ink)]">
                    <Music className="h-3.5 w-3.5 text-[var(--indigo)] shrink-0 mt-0.5" />
                    <span className="truncate" title={festival.music?.join(', ')}>
                      {festival.music?.[0] || 'Sacred hymnody'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action & Citations Footer */}
              <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--ink-2)]">
                  <Globe className="h-3 w-3" />
                  <span>{festival.countries?.slice(0, 3).join(', ')}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveFestival(festival)}
                  className="inline-flex items-center gap-1 font-mono text-xs text-[var(--clay)] font-bold hover:underline"
                >
                  <span>Encyclopedic Record</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </article>
          )
        })}
      </div>

      {/* Modal Encyclopedic Record */}
      {activeFestival && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="border border-[var(--ink)] bg-[var(--paper)] max-w-2xl w-full p-6 md:p-8 shadow-[var(--shadow-hard)] max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between border-b border-[var(--line)] pb-4">
              <div>
                <span className="font-mono text-[10px] text-[var(--clay)] uppercase font-bold tracking-widest">
                  Hailey Cultural Encyclopedia · Verified Record
                </span>
                <h2 className="font-serif text-3xl font-bold text-[var(--ink)] mt-1">
                  {activeFestival.name}
                </h2>
                <p className="font-mono text-xs text-[var(--ink-2)] mt-0.5">
                  Origin: {activeFestival.culturalOrigin} · Religion: {activeFestival.religion}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveFestival(null)}
                className="font-mono text-xs border border-[var(--line)] px-2.5 py-1 hover:border-[var(--ink)]"
              >
                ✕ Close
              </button>
            </div>

            {/* History & Rituals */}
            <div className="space-y-4 text-xs leading-relaxed text-[var(--ink)]">
              <div>
                <h3 className="font-mono text-xs uppercase font-bold text-[var(--clay)] mb-1">
                  Historical Background & Roots
                </h3>
                <p className="text-[var(--ink-2)]">{activeFestival.history}</p>
              </div>

              <div>
                <h3 className="font-mono text-xs uppercase font-bold text-[var(--clay)] mb-1">
                  Rituals & Observances
                </h3>
                <ul className="list-disc pl-4 space-y-1 text-[var(--ink-2)]">
                  {activeFestival.rituals?.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-mono text-xs uppercase font-bold text-[var(--clay)] mb-1">
                  Annual Calendar Occurrences
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {activeFestival.occurrences?.map((occ) => (
                    <div key={occ.year} className="border border-[var(--line)] bg-[var(--paper-2)] p-2 rounded">
                      <span className="font-mono font-bold block text-[var(--ink)]">{occ.year}</span>
                      <span className="font-mono text-[11px] text-[var(--clay)] block">{occ.startDate}</span>
                      <span className="text-[10px] text-[var(--ink-2)]">{occ.regionNotes}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Citations & Sources */}
              {activeFestival.sources?.length > 0 && (
                <div className="border-t border-[var(--line)] pt-3">
                  <h3 className="font-mono text-xs uppercase font-bold text-[var(--ink-2)] flex items-center gap-1 mb-2">
                    <BookOpen className="h-3.5 w-3.5" />
                    Academic Sources & Bibliography
                  </h3>
                  <div className="space-y-1.5">
                    {activeFestival.sources.map((src, i) => (
                      <div key={i} className="font-mono text-[11px] text-[var(--ink-2)] pl-2 border-l-2 border-[var(--clay)]">
                        <span className="font-bold text-[var(--ink)]">"{src.title}"</span> — {src.author} ({src.publisher}, {src.year})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FestivalsPage
