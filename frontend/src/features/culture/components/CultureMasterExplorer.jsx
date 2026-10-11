import { useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import {
  Search,
  Database,
  Sparkles,
  BookOpen,
  MapPin,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  X,
  Compass,
} from 'lucide-react'
import BlurText from '@/components/BlurText'
import { OriginHoverCard } from './OriginHoverCard'
import {
  fetchCultureMasterNodes,
  fetchCultureMasterDistribution,
} from '../services/cultureMasterService'

const PRIORITY_ORIGINS = ['India', 'United States', 'Germany', 'Japan', 'Australia']
const COMMON_KINDS = ['music', 'dance', 'fashion', 'craft', 'food', 'diaspora', 'art']

export function CultureMasterExplorer() {
  const [query, setQuery] = useState('')
  const [selectedOrigin, setSelectedOrigin] = useState('')
  const [selectedKind, setSelectedKind] = useState('')
  const [seedOnly, setSeedOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [selectedNode, setSelectedNode] = useState(null)

  const { data: distData } = useQuery({
    queryKey: ['culture_master_distribution'],
    queryFn: fetchCultureMasterDistribution,
    staleTime: 1000 * 60 * 10,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['culture_master_nodes', query, selectedOrigin, selectedKind, seedOnly, page],
    queryFn: () =>
      fetchCultureMasterNodes({
        query,
        origin: selectedOrigin,
        kind: selectedKind,
        seedOnly,
        page,
        limit: 12,
      }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  })

  const nodes = data?.nodes || []
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 }

  return (
    <div className="space-y-6">
      {/* 1M Dataset Architectural Banner */}
      <div className="neu-card rounded-2xl bg-[#F0E7DA]/60 border border-[#E0D4C5] p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E0D4C5] pb-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full bg-[#6A1F35] text-[#FAF6EF] shadow-sm">
                Dataset v3.0-1M
              </span>
              <span className="font-mono text-xs text-[#B08A50] font-semibold flex items-center gap-1">
                <Database className="h-3.5 w-3.5" />
                1,000,000 Research Nodes
              </span>
            </div>
            <BlurText
              as="h2"
              text="Hailey 1,000,000 Culture Master Atlas"
              delay={110}
              animateBy="words"
              direction="top"
              className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#34252A]"
            />
            <p className="text-xs md:text-sm text-[#34252A]/70 max-w-3xl leading-relaxed">
              Normalized structured research catalog covering 50 preserved seed cultures and 999,950 
              expanded anthropological content nodes indexed directly in PostgreSQL for server-side pagination and discovery.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-right">
            <div className="neu-card bg-[#FAF6EF] px-3.5 py-2.5 rounded-xl border border-[#E0D4C5]/80">
              <span className="block font-mono text-[10px] uppercase text-[#34252A]/60 font-medium">Total Nodes</span>
              <span className="font-serif text-lg font-bold text-[#34252A]">
                {distData?.total_records?.toLocaleString() || '1,000,000'}
              </span>
            </div>
            <div className="neu-card bg-[#FAF6EF] px-3.5 py-2.5 rounded-xl border border-[#E0D4C5]/80">
              <span className="block font-mono text-[10px] uppercase text-[#34252A]/60 font-medium">Priority Focus</span>
              <span className="font-serif text-lg font-bold text-[#6A1F35]">4 Key Nations</span>
            </div>
          </div>
        </div>

        {/* Priority Regional Distribution Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <OriginHoverCard origin="India" placement="bottom" className="w-full">
            <button
              type="button"
              onClick={() => {
                setSelectedOrigin(selectedOrigin === 'India' ? '' : 'India')
                setPage(1)
              }}
              className={`w-full text-left neu-card p-2.5 rounded-xl border transition-all cursor-pointer ${
                selectedOrigin === 'India'
                  ? 'bg-[#F0E7DA] border-[#6A1F35] shadow-xs'
                  : 'bg-[#FAF6EF] border-[#E0D4C5]/70 hover:border-[#6A1F35]/40 hover:bg-[#F0E7DA]/50'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-[#34252A]">🇮🇳 India</span>
                <span className="font-mono text-[11px] text-[#6A1F35] font-semibold">220,000</span>
              </div>
              <p className="font-mono text-[9px] text-[#34252A]/60 mt-0.5">Ragas, Handlooms, Natya</p>
            </button>
          </OriginHoverCard>

          <OriginHoverCard origin="United States" placement="bottom" className="w-full">
            <button
              type="button"
              onClick={() => {
                setSelectedOrigin(selectedOrigin === 'United States' ? '' : 'United States')
                setPage(1)
              }}
              className={`w-full text-left neu-card p-2.5 rounded-xl border transition-all cursor-pointer ${
                selectedOrigin === 'United States'
                  ? 'bg-[#F0E7DA] border-[#6A1F35] shadow-xs'
                  : 'bg-[#FAF6EF] border-[#E0D4C5]/70 hover:border-[#6A1F35]/40 hover:bg-[#F0E7DA]/50'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-[#34252A]">🇺🇸 United States</span>
                <span className="font-mono text-[11px] text-[#6A1F35] font-semibold">190,000</span>
              </div>
              <p className="font-mono text-[9px] text-[#34252A]/60 mt-0.5">Blues, Jazz, Hip-Hop</p>
            </button>
          </OriginHoverCard>

          <OriginHoverCard origin="Germany" placement="bottom" className="w-full">
            <button
              type="button"
              onClick={() => {
                setSelectedOrigin(selectedOrigin === 'Germany' ? '' : 'Germany')
                setPage(1)
              }}
              className={`w-full text-left neu-card p-2.5 rounded-xl border transition-all cursor-pointer ${
                selectedOrigin === 'Germany'
                  ? 'bg-[#F0E7DA] border-[#6A1F35] shadow-xs'
                  : 'bg-[#FAF6EF] border-[#E0D4C5]/70 hover:border-[#6A1F35]/40 hover:bg-[#F0E7DA]/50'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-[#34252A]">🇩🇪 Germany</span>
                <span className="font-mono text-[11px] text-[#6A1F35] font-semibold">150,000</span>
              </div>
              <p className="font-mono text-[9px] text-[#34252A]/60 mt-0.5">Modular Sound, Bauhaus</p>
            </button>
          </OriginHoverCard>

          <OriginHoverCard origin="Japan" placement="bottom" className="w-full">
            <button
              type="button"
              onClick={() => {
                setSelectedOrigin(selectedOrigin === 'Japan' ? '' : 'Japan')
                setPage(1)
              }}
              className={`w-full text-left neu-card p-2.5 rounded-xl border transition-all cursor-pointer ${
                selectedOrigin === 'Japan'
                  ? 'bg-[#F0E7DA] border-[#6A1F35] shadow-xs'
                  : 'bg-[#FAF6EF] border-[#E0D4C5]/70 hover:border-[#6A1F35]/40 hover:bg-[#F0E7DA]/50'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-[#34252A]">🇯🇵 Japan</span>
                <span className="font-mono text-[11px] text-[#6A1F35] font-semibold">120,000</span>
              </div>
              <p className="font-mono text-[9px] text-[#34252A]/60 mt-0.5">Indigo, Sashiko, Harajuku</p>
            </button>
          </OriginHoverCard>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#34252A]/40" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
              placeholder="Search 1M nodes by name, description, region, or slug (e.g. Raga, Modular, Indigo, Bronx)..."
              className="w-full neu-inset-input rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#34252A] placeholder:text-[#34252A]/45 border border-[#E0D4C5] focus:outline-none focus:ring-1 focus:ring-[#6A1F35]"
            />
          </div>

          <label className="flex items-center gap-2 px-3.5 py-2 neu-pill rounded-xl border border-[#E0D4C5] bg-[#FAF6EF] font-mono text-xs cursor-pointer select-none text-[#34252A] hover:bg-[#F0E7DA] transition-colors">
            <input
              type="checkbox"
              checked={seedOnly}
              onChange={(e) => {
                setSeedOnly(e.target.checked)
                setPage(1)
              }}
              className="rounded accent-[#6A1F35]"
            />
            <span>Original Seed Only</span>
          </label>
        </div>

        {/* Filter Chips: Origin & Kind */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#34252A]/60 font-bold">
            Origin:
          </span>
          <OriginHoverCard origin="Global" placement="bottom">
            <button
              type="button"
              onClick={() => {
                setSelectedOrigin('')
                setPage(1)
              }}
              className={`px-3 py-1 font-mono text-xs rounded-full border transition-all cursor-pointer ${
                selectedOrigin === ''
                  ? 'neu-burgundy-pill border-[#6A1F35] font-semibold'
                  : 'neu-pill bg-[#FAF6EF] text-[#34252A]/70 border-[#E0D4C5] hover:border-[#6A1F35]/40'
              }`}
            >
              All Origins
            </button>
          </OriginHoverCard>
          {PRIORITY_ORIGINS.map((orig) => (
            <OriginHoverCard key={orig} origin={orig} placement="bottom">
              <button
                type="button"
                onClick={() => {
                  setSelectedOrigin(orig === selectedOrigin ? '' : orig)
                  setPage(1)
                }}
                className={`px-3 py-1 font-mono text-xs rounded-full border transition-all cursor-pointer ${
                  selectedOrigin === orig
                    ? 'neu-burgundy-pill border-[#6A1F35] font-semibold'
                    : 'neu-pill bg-[#FAF6EF] text-[#34252A]/70 border-[#E0D4C5] hover:border-[#6A1F35]/40'
                }`}
              >
                {orig}
              </button>
            </OriginHoverCard>
          ))}

          <span className="ml-2 font-mono text-[11px] uppercase tracking-wider text-[#34252A]/60 font-bold">
            Kind:
          </span>
          <button
            type="button"
            onClick={() => {
              setSelectedKind('')
              setPage(1)
            }}
            className={`px-3 py-1 font-mono text-xs rounded-full border transition-all ${
              selectedKind === ''
                ? 'neu-burgundy-pill border-[#6A1F35] font-semibold'
                : 'neu-pill bg-[#FAF6EF] text-[#34252A]/70 border-[#E0D4C5] hover:border-[#6A1F35]/40'
            }`}
          >
            All Kinds
          </button>
          {COMMON_KINDS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => {
                setSelectedKind(k === selectedKind ? '' : k)
                setPage(1)
              }}
              className={`px-3 py-1 font-mono text-xs rounded-full border capitalize transition-all ${
                selectedKind === k
                  ? 'neu-burgundy-pill border-[#6A1F35] font-semibold'
                  : 'neu-pill bg-[#FAF6EF] text-[#34252A]/70 border-[#E0D4C5] hover:border-[#6A1F35]/40'
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* Nodes Grid */}
      {isLoading ? (
        <div className="py-16 text-center font-mono text-xs uppercase tracking-widest text-[#34252A]/50">
          Querying 1,000,000 Culture Master Index...
        </div>
      ) : nodes.length === 0 ? (
        <div className="neu-card rounded-2xl bg-[#FAF6EF] border border-dashed border-[#E0D4C5] p-12 text-center space-y-2">
          <Compass className="h-8 w-8 text-[#6A1F35] mx-auto opacity-70" />
          <h3 className="font-serif text-lg font-bold text-[#34252A]">No Culture Nodes Found</h3>
          <p className="text-xs text-[#34252A]/60">
            Try adjusting your search query, clearing origin filters, or unchecking "Original Seed Only".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nodes.map((node) => (
            <div
              key={node.slug}
              className="neu-card rounded-2xl bg-[#FAF6EF] border border-[#E0D4C5] p-5 hover:border-[#6A1F35]/40 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#6A1F35] text-[#FAF6EF]">
                      {node.kind}
                    </span>
                    <OriginHoverCard origin={node.origin} placement="top">
                      <span className="font-mono text-[10px] text-[#34252A]/70 border border-[#E0D4C5] bg-[#F0E7DA]/50 px-2 py-0.5 rounded-full hover:border-[#6A1F35]/60 hover:text-[#6A1F35] transition-colors cursor-help inline-block">
                        {node.origin}
                      </span>
                    </OriginHoverCard>
                  </div>

                  {node.is_original_seed ? (
                    <span className="font-mono text-[9px] uppercase tracking-wider font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-0.5">
                      <ShieldCheck className="h-3 w-3" />
                      Seed Record
                    </span>
                  ) : (
                    <span className="font-mono text-[9px] uppercase tracking-wider text-[#34252A]/60 bg-[#F0E7DA]/40 px-2 py-0.5 rounded-full border border-[#E0D4C5]">
                      Research Node
                    </span>
                  )}
                </div>

                <h3 className="font-serif text-base font-bold text-[#34252A] leading-snug line-clamp-2">
                  {node.name}
                </h3>

                <p className="text-xs text-[#34252A]/70 line-clamp-3 leading-relaxed">
                  {node.description}
                </p>

                {node.experiences && node.experiences.length > 0 && (
                  <div className="border-t border-[#E0D4C5]/80 pt-2.5 space-y-1">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#B08A50] font-bold flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Exploration Vector:
                    </span>
                    <p className="text-[11px] text-[#34252A]/85 italic line-clamp-2">
                      "{node.experiences[0]}"
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-[#E0D4C5]/80 pt-2.5 flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#34252A]/50 truncate max-w-[150px]">
                  {node.slug}
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedNode(node)}
                  className="flex items-center gap-1 font-mono text-[11px] text-[#6A1F35] hover:text-[#511528] font-bold transition-colors"
                >
                  <span>Inspect</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#E0D4C5] pt-4 font-mono text-xs">
          <span className="text-[#34252A]/60">
            Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} records)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3.5 py-1.5 neu-pill rounded-full border border-[#E0D4C5] bg-[#FAF6EF] text-[#34252A] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F0E7DA] transition-all"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3.5 py-1.5 neu-pill rounded-full border border-[#E0D4C5] bg-[#FAF6EF] text-[#34252A] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F0E7DA] transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Detailed Node Inspection Modal */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 bg-[#34252A]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="neu-card rounded-3xl bg-[#FAF6EF] border border-[#E0D4C5] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl space-y-6">
            <div className="flex items-start justify-between border-b border-[#E0D4C5] pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="font-mono text-xs uppercase px-2.5 py-0.5 rounded-full bg-[#6A1F35] text-[#FAF6EF] font-bold">
                    {selectedNode.kind}
                  </span>
                  <OriginHoverCard origin={selectedNode.origin} placement="bottom">
                    <span className="font-mono text-xs text-[#34252A]/70 border border-[#E0D4C5] bg-[#F0E7DA]/60 px-2.5 py-0.5 rounded-full hover:border-[#6A1F35]/60 hover:text-[#6A1F35] transition-colors cursor-help inline-block">
                      {selectedNode.origin}
                    </span>
                  </OriginHoverCard>
                  {selectedNode.era && (
                    <span className="font-mono text-[11px] text-[#34252A]/60">
                      · {selectedNode.era}
                    </span>
                  )}
                </div>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#34252A]">
                  {selectedNode.name}
                </h2>
                <span className="font-mono text-[11px] text-[#34252A]/50">
                  Slug: {selectedNode.slug}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="p-1.5 rounded-full text-[#34252A]/60 hover:text-[#34252A] hover:bg-[#F0E7DA] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <span className="font-mono text-xs uppercase font-bold text-[#6A1F35] tracking-wider">
                Research Summary:
              </span>
              <p className="text-sm text-[#34252A]/85 leading-relaxed">
                {selectedNode.description}
              </p>
            </div>

            {/* Experiences / Prompts */}
            {selectedNode.experiences && selectedNode.experiences.length > 0 && (
              <div className="space-y-2 border-t border-[#E0D4C5] pt-3.5">
                <span className="font-mono text-xs uppercase font-bold text-[#B08A50] tracking-wider">
                  Field Guide Experiences:
                </span>
                <ul className="list-disc pl-5 space-y-1 text-xs text-[#34252A]/80">
                  {selectedNode.experiences.map((exp, i) => (
                    <li key={i}>{exp}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Practices & Places */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#E0D4C5] pt-3.5">
              {selectedNode.practices && selectedNode.practices.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-mono text-xs uppercase font-bold text-[#6A1F35] tracking-wider flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    Living Practices:
                  </span>
                  <div className="space-y-1.5">
                    {selectedNode.practices.map((p, i) => (
                      <div key={i} className="text-xs border border-[#E0D4C5] bg-[#F0E7DA]/50 p-2 rounded-xl">
                        <span className="font-semibold text-[#34252A]">{p.name}</span>
                        {p.type && <span className="font-mono text-[10px] text-[#34252A]/60 block">{p.type}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedNode.places && selectedNode.places.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-mono text-xs uppercase font-bold text-[#B08A50] tracking-wider flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    Key Geography:
                  </span>
                  <div className="space-y-1.5">
                    {selectedNode.places.map((place, i) => (
                      <div key={i} className="text-xs border border-[#E0D4C5] bg-[#F0E7DA]/50 p-2 rounded-xl">
                        <span className="font-semibold text-[#34252A]">{place.name}</span>
                        {place.note && <span className="text-[11px] text-[#34252A]/60 block">{place.note}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Timeline */}
            {selectedNode.timeline && selectedNode.timeline.length > 0 && (
              <div className="space-y-2 border-t border-[#E0D4C5] pt-3.5">
                <span className="font-mono text-xs uppercase font-bold text-[#6A1F35] tracking-wider flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Historical Milestones:
                </span>
                <div className="space-y-1.5">
                  {selectedNode.timeline.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span className="font-mono font-bold text-[#6A1F35] shrink-0 min-w-[70px]">
                        {item.year}:
                      </span>
                      <span className="text-[#34252A]/85">{item.event}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Editorial Status & License Notice */}
            <div className="neu-card border border-amber-300/70 bg-amber-50/70 p-3.5 rounded-xl space-y-1 text-xs text-amber-900">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-700" />
                <span>Editorial Provenance Notice:</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {selectedNode.editorial_status || 'Synthetic research node. Verify community terminology, historical claims, and sources before production citation.'}
              </p>
              {selectedNode.media?.license_note && (
                <p className="font-mono text-[10px] text-amber-800">
                  Media License: {selectedNode.media.license_note}
                </p>
              )}
            </div>

            {/* Sources */}
            {selectedNode.sources && selectedNode.sources.length > 0 && (
              <div className="space-y-1.5 border-t border-[#E0D4C5] pt-3.5">
                <span className="font-mono text-xs uppercase font-bold text-[#34252A]/60 tracking-wider">
                  Academic & Institutional Sources:
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedNode.sources.map((src, i) => (
                    <a
                      key={i}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-[11px] text-[#6A1F35] underline hover:text-[#511528]"
                    >
                      <span>{src.label}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
