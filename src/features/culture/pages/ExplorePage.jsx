import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Loader2, Compass, Database, Layers } from 'lucide-react'
import { fetchCultureTags } from '@/features/communities/services/communityService'
import { TagSticker } from '@/components/ui/TagSticker'
import { getThreadColor } from '@/features/communities/threadColors'
import { CultureMasterExplorer } from '../components/CultureMasterExplorer'
import { OriginHoverCard } from '../components/OriginHoverCard'

export function ExplorePage() {
  const [activeTab, setActiveTab] = useState('master_1m') // 'master_1m' | 'taxonomy'
  const [filter, setFilter] = useState('')
  const [selectedKind, setSelectedKind] = useState(null)

  // Fetch real taxonomy tags via communityService
  const {
    data: tags = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['tags'],
    queryFn: fetchCultureTags,
  })

  // Extract distinct kinds for filter pills
  const kinds = useMemo(() => {
    const set = new Set()
    for (const t of tags) {
      if (t.kind) set.add(t.kind)
    }
    return Array.from(set).sort()
  }, [tags])

  // Filter tags by text and kind
  const filteredTags = useMemo(() => {
    return tags.filter((tag) => {
      const matchesText =
        filter.trim() === '' ||
        tag.name.toLowerCase().includes(filter.toLowerCase()) ||
        tag.slug.toLowerCase().includes(filter.toLowerCase()) ||
        (tag.description && tag.description.toLowerCase().includes(filter.toLowerCase()))

      const matchesKind = selectedKind === null || tag.kind === selectedKind
      return matchesText && matchesKind
    })
  }, [tags, filter, selectedKind])

  // Group filtered tags by kind
  const groupedByKind = useMemo(() => {
    const map = new Map()
    for (const tag of filteredTags) {
      const group = map.get(tag.kind) || []
      group.push(tag)
      map.set(tag.kind, group)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [filteredTags])

  return (
    <div className="space-y-6">
      {/* View Switcher Bar */}
      <div className="flex items-center justify-center sm:justify-start gap-2 border-b border-[#E0D4C5]/60 pb-3">
        <div className="bg-white/90 p-1.5 rounded-full border border-[#E0D4C5]/80 neu-pill inline-flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('master_1m')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
              activeTab === 'master_1m'
                ? 'bg-[#6A1F35] text-white neu-burgundy-pill'
                : 'text-[#34252A] hover:bg-[#F0E7DA]/60'
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            <span>1,000,000 Culture Master Atlas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('taxonomy')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
              activeTab === 'taxonomy'
                ? 'bg-[#6A1F35] text-white neu-burgundy-pill'
                : 'text-[#34252A] hover:bg-[#F0E7DA]/60'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Living Taxonomy Graph ({tags.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'master_1m' ? (
        <CultureMasterExplorer />
      ) : (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="border-b border-[#E0D4C5]/60 pb-4">
            <div className="flex items-center gap-2 text-[#6A1F35] mb-1">
              <Compass className="h-5 w-5" />
              <span className="font-sans text-xs uppercase tracking-widest font-bold">
                Taxonomy Directory
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-[#34252A]">
              Explore Cultural Threads
            </h1>
            <p className="mt-1 text-sm text-[#75666B] max-w-2xl">
              Browse the living culture graph across regional heritages, sonic undergrounds, design movements, and culinary traditions.
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#75666B]" />
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search tags or descriptions (e.g. Streetwear, Hip-Hop, Tokyo, Fermentation)..."
                className="w-full border border-[#E0D4C5] bg-[#F0E7DA]/50 pl-10 pr-4 py-2.5 text-sm text-[#34252A] placeholder:text-[#75666B] rounded-xl neu-inset-input focus:outline-none focus:ring-1 focus:ring-[#6A1F35]"
              />
            </div>

            {/* Kind Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setSelectedKind(null)}
                className={`px-3 py-1.5 font-sans text-xs rounded-full border transition-all ${
                  selectedKind === null
                    ? 'bg-[#6A1F35] text-white border-[#6A1F35] neu-burgundy-pill'
                    : 'bg-white text-[#34252A] border-[#E0D4C5] hover:border-[#6A1F35] neu-pill active:neu-inset'
                }`}
              >
                All Kinds ({tags.length})
              </button>
              {kinds.map((kind) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => setSelectedKind(selectedKind === kind ? null : kind)}
                  style={
                    selectedKind === kind
                      ? {
                          backgroundColor: getThreadColor(kind),
                          borderColor: getThreadColor(kind),
                          color: '#FFFFFF',
                        }
                      : {}
                  }
                  className={`px-3 py-1.5 font-sans text-xs rounded-full border transition-all ${
                    selectedKind === kind
                      ? 'border-transparent font-semibold shadow-sm'
                      : 'bg-white text-[#34252A] border-[#E0D4C5] hover:border-[#34252A] neu-pill active:neu-inset'
                  }`}
                >
                  {kind}
                </button>
              ))}
            </div>
          </div>

          {/* Loading & Error States */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 className="h-6 w-6 animate-spin text-[#6A1F35]" />
              <p className="text-xs uppercase tracking-widest text-[#75666B]">
                Loading taxonomy directory...
              </p>
            </div>
          )}

          {isError && (
            <div className="border border-[#6A1F35] bg-[#FAF6EF] p-6 text-center text-xs text-[#6A1F35] rounded-2xl neu-card">
              Failed to fetch culture graph taxonomy from database.
            </div>
          )}

          {/* Tags Directory Grid */}
          {!isLoading && groupedByKind.length === 0 && (
            <div className="border border-dashed border-[#E0D4C5] p-12 text-center text-sm text-[#75666B] rounded-2xl">
              No cultural tags match "{filter}" {selectedKind && `in [${selectedKind}]`}.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groupedByKind.map(([kind, groupTags]) => (
              <div
                key={kind}
                className="bg-white rounded-2xl border border-[#E0D4C5]/80 p-5 flex flex-col justify-between space-y-4 neu-card"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-[#E0D4C5]/40 pb-2 mb-3">
                    <span
                      className="text-xs uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: getThreadColor(kind) }}
                    >
                      {kind}
                    </span>
                    <span className="text-[11px] text-[#75666B]">
                      {groupTags.length} {groupTags.length === 1 ? 'topic' : 'topics'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {groupTags.map((tag) => (
                      <div key={tag.id} className="group relative">
                        {kind === 'place' || kind === 'origin' ? (
                          <OriginHoverCard origin={tag.name} placement="top">
                            <TagSticker
                              id={tag.id}
                              name={tag.name}
                              slug={tag.slug}
                              kind={tag.kind}
                              size="sm"
                            />
                          </OriginHoverCard>
                        ) : (
                          <TagSticker
                            id={tag.id}
                            name={tag.name}
                            slug={tag.slug}
                            kind={tag.kind}
                            size="sm"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
