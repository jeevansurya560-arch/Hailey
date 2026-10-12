import { useRef } from 'react'
import {
  X,
  Calendar,
  Globe,
  Utensils,
  Shirt,
  Music,
  Info,
  BookOpen,
  ExternalLink,
  ShieldCheck
} from 'lucide-react'
import { FestivalImage } from './FestivalImage'

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

function getDateProvenance(occ, festival) {
  if (!occ) return null
  const isIslamic =
    festival?.dateRule === 'lunar_islamic' ||
    (festival?.religion || '').toLowerCase().includes('islam') ||
    (festival?.traditionType || '').toLowerCase().includes('islamic')

  if (occ.verified) {
    return {
      type: 'verified',
      label: 'Direct Source Verified',
      shortLabel: 'Verified',
      badgeClass: 'bg-[#3D7A5C]/15 text-[#3D7A5C] border-[#3D7A5C]/30',
      note: 'Verified against primary religious authority or national observatory calendar.'
    }
  }

  if (isIslamic) {
    return {
      type: 'observation',
      label: 'Observation-Dependent',
      shortLabel: 'Observation',
      badgeClass: 'bg-[#8C5D39]/15 text-[#8C5D39] border-[#8C5D39]/30',
      note: 'Observance begins upon local confirmation of the crescent moon (Hilal).'
    }
  }

  const isEstimated =
    (occ.regionNotes || '').toLowerCase().includes('approx') ||
    (occ.regionNotes || '').toLowerCase().includes('estimate') ||
    (occ.year && occ.year >= 2028)

  if (isEstimated) {
    return {
      type: 'estimated',
      label: 'Estimated Projection',
      shortLabel: 'Estimated',
      badgeClass: 'bg-[#B08A50]/20 text-[#7A5C20] border-[#B08A50]/40',
      note: 'Future astronomical estimate; subject to lunisolar intercalary alignment.'
    }
  }

  return {
    type: 'calculated',
    label: 'Calculated Ephemeris',
    shortLabel: 'Calculated',
    badgeClass: 'bg-[#5B6B82]/15 text-[#5B6B82] border-[#5B6B82]/30',
    note: 'Computed from traditional astronomical formulas without direct official proclamation.'
  }
}

export function FestivalDetailModal({ festival, selectedYear, onClose }) {
  const scrollRef = useRef(null)
  if (!festival) return null

  const occurrences = festival.occurrences || []
  const currentOcc = occurrences.find((o) => o.year === selectedYear)
  const currentProv = getDateProvenance(currentOcc, festival)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#34252A]/50 p-4 backdrop-blur-sm transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Cultural record for ${festival.name}`}
    >
      <div
        ref={scrollRef}
        className="neu-card rounded-3xl bg-[#FAF6EF] border border-[#E0D4C5] max-w-2xl w-full p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6"
      >
        {/* ── Modal Header ── */}
        <div className="flex items-start justify-between border-b border-[#E0D4C5] pb-4">
          <div className="pr-4">
            <span className="font-mono text-[10px] text-[#6D2039] uppercase font-bold tracking-widest block mb-1">
              Hailey Cultural Encyclopedia · {festival.traditionType || 'Sacred Tradition'}
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#34252A] leading-tight">
              {festival.name}
            </h2>
            {festival.alternateNames?.length > 0 && (
              <p className="font-mono text-xs text-[#75666B] mt-1">
                Also known as: {festival.alternateNames.join(' · ')}
              </p>
            )}
            <p className="font-sans text-xs text-[#75666B] mt-1">
              Origin: {festival.culturalOrigin || 'Traditional Heritage'} · {festival.religion}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="shrink-0 p-2 rounded-full border border-[#E0D4C5] bg-[#FAF6EF] text-[#34252A] hover:bg-[#F0E7DA] hover:text-[#6D2039] transition-colors focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Hero Image ── */}
        <div className="w-full">
          <FestivalImage
            festival={festival}
            aspectRatio="aspect-[16/9]"
            className="rounded-2xl shadow-md border border-[#E0D4C5]"
          />
        </div>

        {/* ── Current Selected Year Occurrence Card ── */}
        {currentOcc && (
          <div className="bg-[#F0E7DA]/75 border border-[#E0D4C5] rounded-2xl p-4 space-y-1.5 shadow-sm">
            <div className="flex items-center gap-2 flex-wrap">
              <Calendar className="h-4 w-4 text-[#6D2039]" />
              <span className="font-mono text-xs font-bold text-[#6D2039] uppercase tracking-wider">
                {selectedYear} Occurrence
              </span>
              {currentProv && (
                <span className={`inline-flex items-center gap-1 font-mono text-[9px] px-2 py-0.5 rounded-full border font-semibold ${currentProv.badgeClass}`}>
                  {currentProv.type === 'verified' && <ShieldCheck className="h-2.5 w-2.5" />}
                  {currentProv.label}
                </span>
              )}
            </div>

            <p className="font-mono text-sm font-bold text-[#34252A]">
              {formatDateRange(currentOcc.startDate, currentOcc.endDate)}
            </p>

            {currentOcc.endDate && currentOcc.endDate !== currentOcc.startDate && (
              <p className="font-mono text-[11px] text-[#75666B]">
                Full span: {currentOcc.startDate} to {currentOcc.endDate}
              </p>
            )}

            {currentProv?.note && (
              <p className="font-sans text-[11px] text-[#75666B] italic pt-0.5">
                Confidence status: {currentProv.note}
              </p>
            )}

            {currentOcc.regionNotes && (
              <p className="font-sans text-xs text-[#34252A]/80 pt-1 leading-relaxed">
                {currentOcc.regionNotes}
              </p>
            )}
          </div>
        )}

        {/* ── Cultural Story Sections ── */}
        <div className="space-y-4 text-xs leading-relaxed text-[#34252A]">
          {/* Why Celebrated */}
          {(festival.whyCelebrated || festival.significance) && (
            <div className="space-y-1">
              <h3 className="font-mono text-[11px] uppercase font-bold text-[#6D2039] tracking-wider">
                Why It Is Celebrated
              </h3>
              <p className="text-[#34252A]/80 leading-relaxed font-sans text-xs">
                {festival.whyCelebrated || festival.significance}
              </p>
            </div>
          )}

          {/* Historical Background */}
          {festival.history && (
            <div className="space-y-1">
              <h3 className="font-mono text-[11px] uppercase font-bold text-[#6D2039] tracking-wider">
                Historical Context & Lineage
              </h3>
              <p className="text-[#34252A]/80 leading-relaxed font-sans text-xs">
                {festival.history}
              </p>
            </div>
          )}

          {/* How Observed */}
          {festival.howObserved && (
            <div className="space-y-1">
              <h3 className="font-mono text-[11px] uppercase font-bold text-[#6D2039] tracking-wider">
                Traditional Observances & Customs
              </h3>
              <p className="text-[#34252A]/80 leading-relaxed font-sans text-xs">
                {festival.howObserved}
              </p>
            </div>
          )}

          {/* Specific Rituals */}
          {festival.rituals?.length > 0 && (
            <div className="space-y-1.5">
              <h3 className="font-mono text-[11px] uppercase font-bold text-[#6D2039] tracking-wider">
                Key Rituals & Practices
              </h3>
              <ul className="list-disc pl-4 space-y-1 font-sans text-xs text-[#34252A]/80">
                {festival.rituals.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Regional Variations */}
          {festival.regionalVariations && (
            <div className="space-y-1">
              <h3 className="font-mono text-[11px] uppercase font-bold text-[#6D2039] tracking-wider">
                Regional & Diaspora Nuances
              </h3>
              <p className="text-[#34252A]/80 leading-relaxed font-sans text-xs">
                {festival.regionalVariations}
              </p>
            </div>
          )}

          {/* Date Mechanics & Calendar System */}
          {festival.dateExplanation && (
            <div className="bg-[#F0E7DA]/50 border border-[#E0D4C5] rounded-xl p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-[#B08A50]">
                <Info className="h-3.5 w-3.5" />
                <h3 className="font-mono text-[10px] uppercase font-bold tracking-wider">
                  Astronomical & Calendar System
                </h3>
              </div>
              <p className="font-sans text-xs text-[#34252A]/75 leading-relaxed">
                {festival.dateExplanation}
              </p>
            </div>
          )}

          {/* Material & Sensory Culture Grid */}
          {(festival.food?.length > 0 || festival.clothing?.length > 0 || festival.music?.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-[#E0D4C5] pt-4">
              {festival.food?.length > 0 && (
                <div className="bg-[#F0E7DA]/40 p-3 rounded-xl border border-[#E0D4C5]">
                  <div className="flex items-center gap-1.5 mb-1.5 text-[#B08A50]">
                    <Utensils className="h-3.5 w-3.5" />
                    <span className="font-mono text-[10px] uppercase font-bold">Sacred Foods</span>
                  </div>
                  <ul className="font-sans text-[11px] text-[#34252A]/80 space-y-1">
                    {festival.food.map((f, i) => (
                      <li key={i}>• {f}</li>
                    ))}
                  </ul>
                </div>
              )}

              {festival.clothing?.length > 0 && (
                <div className="bg-[#F0E7DA]/40 p-3 rounded-xl border border-[#E0D4C5]">
                  <div className="flex items-center gap-1.5 mb-1.5 text-[#6D2039]">
                    <Shirt className="h-3.5 w-3.5" />
                    <span className="font-mono text-[10px] uppercase font-bold">Attire & Robes</span>
                  </div>
                  <ul className="font-sans text-[11px] text-[#34252A]/80 space-y-1">
                    {festival.clothing.map((c, i) => (
                      <li key={i}>• {c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {festival.music?.length > 0 && (
                <div className="bg-[#F0E7DA]/40 p-3 rounded-xl border border-[#E0D4C5]">
                  <div className="flex items-center gap-1.5 mb-1.5 text-[#A96849]">
                    <Music className="h-3.5 w-3.5" />
                    <span className="font-mono text-[10px] uppercase font-bold">Chants & Music</span>
                  </div>
                  <ul className="font-sans text-[11px] text-[#34252A]/80 space-y-1">
                    {festival.music.map((m, i) => (
                      <li key={i}>• {m}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* 11-Year Annual Occurrences Timeline (2025–2035) */}
          {occurrences.length > 0 && (
            <div className="border-t border-[#E0D4C5] pt-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-[11px] uppercase font-bold text-[#6D2039] tracking-wider">
                  Annual Occurrences (2025–2035)
                </h3>
                <span className="font-mono text-[9px] text-[#75666B]">
                  Academic Provenance Status
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {occurrences.map((occ) => {
                  const prov = getDateProvenance(occ, festival)
                  return (
                    <div
                      key={occ.year}
                      className={`rounded-xl p-2.5 border transition-all ${
                        occ.year === selectedYear
                          ? 'bg-[#6D2039]/10 border-[#6D2039]/50 shadow-sm'
                          : 'bg-[#F0E7DA]/40 border-[#E0D4C5]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-mono font-bold block text-xs ${
                            occ.year === selectedYear ? 'text-[#6D2039]' : 'text-[#34252A]'
                          }`}
                        >
                          {occ.year}
                        </span>
                        {prov && (
                          <span className={`text-[8px] font-mono px-1 py-0.5 rounded border font-semibold ${prov.badgeClass}`}>
                            {prov.shortLabel}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[11px] font-semibold text-[#6D2039] block mt-1">
                        {occ.startDate}
                      </span>
                      {occ.regionNotes && (
                        <span className="text-[10px] text-[#75666B] block leading-tight mt-0.5 line-clamp-1" title={occ.regionNotes}>
                          {occ.regionNotes}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Academic Sources & Bibliography */}
          {festival.sources?.length > 0 && (
            <div className="border-t border-[#E0D4C5] pt-4 space-y-2">
              <div className="flex items-center gap-1.5 text-[#75666B]">
                <BookOpen className="h-3.5 w-3.5" />
                <h3 className="font-mono text-[11px] uppercase font-bold tracking-wider">
                  Academic Sources & Ephemerides
                </h3>
              </div>
              <div className="space-y-2">
                {festival.sources.map((src, i) => (
                  <div
                    key={i}
                    className="font-mono text-[10px] text-[#75666B] pl-2.5 border-l-2 border-[#6D2039]/40"
                  >
                    <span className="font-bold text-[#34252A]">"{src.title}"</span>
                    {src.author && ` — ${src.author}`}
                    {src.publisher && ` (${src.publisher}`}
                    {src.year && `, ${src.year})`}
                    {src.url && (
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 ml-1.5 text-[#6D2039] hover:underline"
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
export default FestivalDetailModal
