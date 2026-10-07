import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Loader2, Compass } from 'lucide-react'
import { fetchCultureTags } from '@/features/communities/services/communityService'
import { TagSticker } from '@/components/TagSticker'
import { getThreadColor } from '@/features/communities/threadColors'

export function ExplorePage() {
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
      {/* Header Banner */}
      <div className="border-b border-[var(--line)] pb-4">
        <div className="flex items-center gap-2 text-[var(--clay)] mb-1">
          <Compass className="h-5 w-5" />
          <span className="font-mono text-xs uppercase tracking-widest font-bold">
            Taxonomy Directory
          </span>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-[var(--ink)]">
          Explore Cultural Threads
        </h1>
        <p className="mt-1 text-sm text-[var(--ink-2)] max-w-2xl">
          Browse the living culture graph across regional heritages, sonic undergrounds, design movements, and culinary traditions.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ink-2)]" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search tags or descriptions (e.g. Streetwear, Hip-Hop, Tokyo, Fermentation)..."
            className="w-full border border-[var(--ink)] bg-[var(--paper-2)] pl-10 pr-4 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-2)] focus:outline-none focus:ring-1 focus:ring-[var(--clay)] shadow-[2px_2px_0_var(--ink)]"
          />
        </div>

        {/* Kind Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => setSelectedKind(null)}
            className={`px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider rounded-[var(--radius)] border transition-all ${
              selectedKind === null
                ? 'bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]'
                : 'bg-[var(--paper)] text-[var(--ink-2)] border-[var(--line)] hover:border-[var(--ink)]'
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
                      borderColor: 'var(--ink)',
                      color: '#F7F2E8',
                    }
                  : {}
              }
              className={`px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider rounded-[var(--radius)] border transition-all ${
                selectedKind === kind
                  ? 'border-[var(--ink)] font-bold'
                  : 'bg-[var(--paper)] text-[var(--ink-2)] border-[var(--line)] hover:border-[var(--ink)]'
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
          <Loader2 className="h-6 w-6 animate-spin text-[var(--clay)]" />
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--ink-2)]">
            Loading taxonomy directory...
          </p>
        </div>
      )}

      {isError && (
        <div className="border border-[var(--clay)] bg-[var(--paper-2)] p-6 text-center text-xs text-[var(--clay)]">
          Failed to fetch culture graph taxonomy from database.
        </div>
      )}

      {/* Tags Directory Grid */}
      {!isLoading && groupedByKind.length === 0 && (
        <div className="border border-dashed border-[var(--line)] p-12 text-center text-sm text-[var(--ink-2)] font-mono">
          No cultural tags match "{filter}" {selectedKind && `in [${selectedKind}]`}.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groupedByKind.map(([kind, groupTags]) => (
          <div
            key={kind}
            className="border border-[var(--line)] bg-[var(--paper-2)] p-5 flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-2 mb-3">
                <span
                  className="font-mono text-xs uppercase tracking-widest font-bold px-2 py-0.5 rounded text-white"
                  style={{ backgroundColor: getThreadColor(kind) }}
                >
                  {kind}
                </span>
                <span className="font-mono text-[11px] text-[var(--ink-2)]">
                  {groupTags.length} {groupTags.length === 1 ? 'topic' : 'topics'}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {groupTags.map((tag) => (
                  <div key={tag.id} className="group relative">
                    <TagSticker
                      id={tag.id}
                      name={tag.name}
                      slug={tag.slug}
                      kind={tag.kind}
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
