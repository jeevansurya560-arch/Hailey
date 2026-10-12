import { Globe, MapPin, ChevronRight, Calendar } from 'lucide-react'

export function FestivalMapView({ festivals, selectedYear, onSelectFestival }) {
  // Group festivals by macro region
  const regionGroups = {
    'East Asia': [],
    'South Asia': [],
    'Middle East & North Africa': [],
    'Europe': [],
    'Americas': [],
    'Southeast Asia': [],
    'Africa & Oceania': []
  }

  festivals.forEach((f) => {
    const rawReg = (f.regions?.[0] || f.culturalOrigin || 'Global').toLowerCase()
    if (rawReg.includes('east asia') || rawReg.includes('china') || rawReg.includes('japan') || rawReg.includes('korea')) {
      regionGroups['East Asia'].push(f)
    } else if (rawReg.includes('south asia') || rawReg.includes('india') || rawReg.includes('nepal')) {
      regionGroups['South Asia'].push(f)
    } else if (rawReg.includes('middle east') || rawReg.includes('jewish') || rawReg.includes('islam') || rawReg.includes('israel')) {
      regionGroups['Middle East & North Africa'].push(f)
    } else if (rawReg.includes('europe') || rawReg.includes('nordic') || rawReg.includes('celtic') || rawReg.includes('ireland')) {
      regionGroups['Europe'].push(f)
    } else if (rawReg.includes('americas') || rawReg.includes('latin') || rawReg.includes('north america') || rawReg.includes('mexico')) {
      regionGroups['Americas'].push(f)
    } else if (rawReg.includes('southeast') || rawReg.includes('thai') || rawReg.includes('vietnam')) {
      regionGroups['Southeast Asia'].push(f)
    } else {
      regionGroups['Africa & Oceania'].push(f)
    }
  })

  return (
    <div className="space-y-4">
      <div className="neu-card rounded-2xl bg-[#FAF6EF] border border-[#E0D4C5] p-5">
        <div className="flex items-center gap-2 mb-2 text-[#6D2039]">
          <Globe className="h-4 w-4" />
          <span className="font-mono text-xs uppercase font-bold tracking-wider">
            Global Geographic Distribution · {selectedYear}
          </span>
        </div>
        <p className="text-xs text-[#75666B] leading-relaxed">
          Explore festivals organized across continental macro-regions and cultural civilizational spheres.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(regionGroups).map(([regionName, fList]) => {
          if (fList.length === 0) return null
          return (
            <div
              key={regionName}
              className="neu-card rounded-2xl bg-[#FAF6EF] border border-[#E0D4C5] p-4 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-[#E0D4C5] pb-2">
                <div className="flex items-center gap-1.5 font-serif font-bold text-base text-[#34252A]">
                  <MapPin className="h-4 w-4 text-[#B08A50]" />
                  <span>{regionName}</span>
                </div>
                <span className="font-mono text-xs text-[#6D2039] font-bold bg-[#6D2039]/10 px-2.5 py-0.5 rounded-full border border-[#6D2039]/25">
                  {fList.length} festival{fList.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-2">
                {fList.map((f) => {
                  const occ = f.occurrences?.find((o) => o.year === selectedYear)
                  return (
                    <div
                      key={f.id || f.slug}
                      onClick={() => onSelectFestival && onSelectFestival(f)}
                      className="p-2.5 rounded-xl bg-[#FAF6EF] hover:bg-[#F0E7DA] border border-[#E0D4C5]/70 flex items-center justify-between transition-colors cursor-pointer group"
                    >
                      <div className="min-w-0 pr-2">
                        <h4 className="font-serif text-sm font-bold text-[#34252A] group-hover:text-[#6D2039] truncate">
                          {f.name}
                        </h4>
                        <div className="flex items-center gap-2 font-mono text-[10px] text-[#75666B] mt-0.5">
                          {occ?.startDate && (
                            <span className="flex items-center gap-0.5">
                              <Calendar className="h-2.5 w-2.5 text-[#B08A50]" />
                              {occ.startDate}
                            </span>
                          )}
                          <span>·</span>
                          <span className="truncate">{f.category || f.traditionType}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[#75666B] group-hover:text-[#6D2039] shrink-0" />
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
export default FestivalMapView
