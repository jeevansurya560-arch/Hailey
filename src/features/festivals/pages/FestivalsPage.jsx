import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Globe, BookOpen, Music, Utensils, Shirt, Filter, ChevronRight } from 'lucide-react'
import { fetchAllFestivals } from '../services/festivalService'
import BlurText from '@/components/BlurText'

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
      <div className="border-b border-[#E0D4C5] pb-6">
        <div className="flex items-center gap-2 text-[#6A1F35] mb-1.5">
          <Calendar className="h-5 w-5" />
          <span className="font-mono text-xs uppercase tracking-widest font-bold text-[#B08A50]">
            Living Astronomical & Cultural Calendar
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
        <p className="mt-1.5 text-sm text-[#34252A]/70 max-w-2xl leading-relaxed">
          Documenting variable-date sacred traditions, lunar sightings, seasonal equinoxes, and ancestral harvest ceremonies across global civilizations with academic provenance.
        </p>

        {/* Filter Toolbar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-2">
          {/* Tradition filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] text-[#34252A]/60 uppercase mr-1 flex items-center gap-1 font-semibold">
              <Filter className="h-3 w-3" /> Tradition:
            </span>
            {religions.slice(0, 7).map((rel) => (
              <button
                key={rel}
                type="button"
                onClick={() => setSelectedReligion(rel)}
                className={`px-3 py-1 font-mono text-[11px] uppercase tracking-wider rounded-full border transition-all ${
                  selectedReligion === rel
                    ? 'neu-burgundy-pill border-[#6A1F35] font-semibold'
                    : 'neu-pill bg-[#FAF6EF] text-[#34252A]/70 border-[#E0D4C5] hover:border-[#6A1F35]/40'
                }`}
              >
                {rel}
              </button>
            ))}
          </div>

          {/* Year selector */}
          <div className="flex items-center gap-1 bg-[#F0E7DA]/60 neu-pill border border-[#E0D4C5] p-1 rounded-full">
            {[2025, 2026, 2027].map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-0.5 font-mono text-xs font-semibold rounded-full transition-all ${
                  selectedYear === yr
                    ? 'neu-burgundy-pill text-[#FAF6EF]'
                    : 'text-[#34252A]/65 hover:text-[#34252A]'
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
              className="neu-card rounded-2xl bg-[#FAF6EF] border border-[#E0D4C5] p-6 flex flex-col justify-between space-y-4 transition-all hover:-translate-y-0.5 hover:border-[#6A1F35]/30"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F0E7DA] border border-[#E0D4C5] text-[#34252A]/70 font-semibold">
                      {festival.traditionType}
                    </span>
                    <h2 className="font-serif text-2xl font-bold text-[#34252A] mt-2">
                      {festival.name}
                    </h2>
                    {festival.alternateNames?.length > 0 && (
                      <p className="font-mono text-xs text-[#34252A]/60 mt-0.5">
                        aka {festival.alternateNames.join(' · ')}
                      </p>
                    )}
                  </div>

                  {occurrence && (
                    <div className="text-right neu-card bg-[#F0E7DA]/50 border border-[#E0D4C5] px-3.5 py-2 rounded-xl">
                      <span className="font-mono text-[10px] text-[#6A1F35] uppercase font-bold block">
                        {selectedYear} Occurrence
                      </span>
                      <span className="font-mono text-xs font-bold text-[#34252A]">
                        {occurrence.startDate}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-[#34252A]/70 leading-relaxed">
                  {festival.significance}
                </p>

                {/* Cultural Attributes Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-[#E0D4C5]/70">
                  <div className="flex items-start gap-1.5 text-[11px] text-[#34252A]/85 bg-[#F0E7DA]/40 p-2 rounded-xl border border-[#E0D4C5]/60">
                    <Utensils className="h-3.5 w-3.5 text-[#B08A50] shrink-0 mt-0.5" />
                    <span className="truncate" title={festival.food?.join(', ')}>
                      {festival.food?.[0] || 'Ceremonial food'}
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5 text-[11px] text-[#34252A]/85 bg-[#F0E7DA]/40 p-2 rounded-xl border border-[#E0D4C5]/60">
                    <Shirt className="h-3.5 w-3.5 text-[#6A1F35] shrink-0 mt-0.5" />
                    <span className="truncate" title={festival.clothing?.join(', ')}>
                      {festival.clothing?.[0] || 'Traditional attire'}
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5 text-[11px] text-[#34252A]/85 bg-[#F0E7DA]/40 p-2 rounded-xl border border-[#E0D4C5]/60">
                    <Music className="h-3.5 w-3.5 text-[#A96849] shrink-0 mt-0.5" />
                    <span className="truncate" title={festival.music?.join(', ')}>
                      {festival.music?.[0] || 'Sacred hymnody'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action & Citations Footer */}
              <div className="pt-3 border-t border-[#E0D4C5]/80 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#34252A]/60">
                  <Globe className="h-3.5 w-3.5 text-[#B08A50]" />
                  <span>{festival.countries?.slice(0, 3).join(', ')}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveFestival(festival)}
                  className="inline-flex items-center gap-1 font-mono text-xs text-[#6A1F35] font-bold hover:text-[#511528] transition-colors"
                >
                  <span>Encyclopedic Record</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </article>
          )
        })}
      </div>

      {/* Modal Encyclopedic Record */}
      {activeFestival && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#34252A]/40 p-4 backdrop-blur-sm">
          <div className="neu-card rounded-3xl bg-[#FAF6EF] border border-[#E0D4C5] max-w-2xl w-full p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between border-b border-[#E0D4C5] pb-4">
              <div>
                <span className="font-mono text-[10px] text-[#6A1F35] uppercase font-bold tracking-widest">
                  Hailey Cultural Encyclopedia · Verified Record
                </span>
                <h2 className="font-serif text-3xl font-bold text-[#34252A] mt-1">
                  {activeFestival.name}
                </h2>
                <p className="font-mono text-xs text-[#34252A]/60 mt-0.5">
                  Origin: {activeFestival.culturalOrigin} · Religion: {activeFestival.religion}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveFestival(null)}
                className="font-mono text-xs neu-pill border border-[#E0D4C5] bg-[#FAF6EF] px-3 py-1 rounded-full text-[#34252A] hover:bg-[#F0E7DA] transition-colors"
              >
                ✕ Close
              </button>
            </div>

            {/* History & Rituals */}
            <div className="space-y-4 text-xs leading-relaxed text-[#34252A]">
              <div>
                <h3 className="font-mono text-xs uppercase font-bold text-[#6A1F35] mb-1">
                  Historical Background & Roots
                </h3>
                <p className="text-[#34252A]/75">{activeFestival.history}</p>
              </div>

              <div>
                <h3 className="font-mono text-xs uppercase font-bold text-[#6A1F35] mb-1">
                  Rituals & Observances
                </h3>
                <ul className="list-disc pl-4 space-y-1 text-[#34252A]/75">
                  {activeFestival.rituals?.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-mono text-xs uppercase font-bold text-[#6A1F35] mb-1">
                  Annual Calendar Occurrences
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {activeFestival.occurrences?.map((occ) => (
                    <div key={occ.year} className="neu-card border border-[#E0D4C5] bg-[#F0E7DA]/50 p-2.5 rounded-xl">
                      <span className="font-mono font-bold block text-[#34252A]">{occ.year}</span>
                      <span className="font-mono text-[11px] text-[#6A1F35] font-semibold block">{occ.startDate}</span>
                      <span className="text-[10px] text-[#34252A]/60">{occ.regionNotes}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Citations & Sources */}
              {activeFestival.sources?.length > 0 && (
                <div className="border-t border-[#E0D4C5] pt-3">
                  <h3 className="font-mono text-xs uppercase font-bold text-[#34252A]/60 flex items-center gap-1 mb-2">
                    <BookOpen className="h-3.5 w-3.5" />
                    Academic Sources & Bibliography
                  </h3>
                  <div className="space-y-1.5">
                    {activeFestival.sources.map((src, i) => (
                      <div key={i} className="font-mono text-[11px] text-[#34252A]/70 pl-2 border-l-2 border-[#6A1F35]">
                        <span className="font-bold text-[#34252A]">"{src.title}"</span> — {src.author} ({src.publisher}, {src.year})
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
