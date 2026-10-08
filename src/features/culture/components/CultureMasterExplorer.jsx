import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
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
    keepPreviousData: true,
  })

  const nodes = data?.nodes || []
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 }

  return (
    <div className="space-y-6">
      {/* 1M Dataset Architectural Banner */}
      <div className="border border-[var(--ink)] bg-[var(--paper-2)] p-6 shadow-[var(--shadow-hard)] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-widest font-bold px-2 py-0.5 rounded bg-[var(--ink)] text-[var(--paper)]">
                Dataset v3.0-1M
              </span>
              <span className="font-mono text-xs text-[var(--clay)] font-semibold flex items-center gap-1">
                <Database className="h-3.5 w-3.5" />
                1,000,000 Research Nodes
              </span>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[var(--ink)]">
              Hailey 1,000,000 Culture Master Atlas
            </h2>
            <p className="text-xs md:text-sm text-[var(--ink-2)] max-w-3xl leading-relaxed">
              Normalized structured research catalog covering 50 preserved seed cultures and 999,950 
              expanded anthropological content nodes indexed directly in PostgreSQL for server-side pagination and discovery.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-right">
            <div className="border border-[var(--line)] bg-[var(--paper)] p-3 rounded">
              <span className="block font-mono text-[10px] uppercase text-[var(--ink-2)]">Total Nodes</span>
              <span className="font-serif text-lg font-bold text-[var(--ink)]">
                {distData?.total_records?.toLocaleString() || '1,000,000'}
              </span>
            </div>
            <div className="border border-[var(--line)] bg-[var(--paper)] p-3 rounded">
              <span className="block font-mono text-[10px] uppercase text-[var(--ink-2)]">Priority Focus</span>
              <span className="font-serif text-lg font-bold text-[var(--clay)]">4 Key Nations</span>
            </div>
          </div>
        </div>

        {/* Priority Regional Distribution Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <div className="border border-[var(--line)] bg-[var(--paper)] p-2.5 rounded">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-[var(--ink)]">🇮🇳 India</span>
              <span className="font-mono text-[11px] text-[var(--clay)] font-semibold">220,000</span>
            </div>
            <p className="font-mono text-[9px] text-[var(--ink-2)] mt-0.5">Ragas, Handlooms, Natya</p>
          </div>
          <div className="border border-[var(--line)] bg-[var(--paper)] p-2.5 rounded">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-[var(--ink)]">🇺🇸 United States</span>
              <span className="font-mono text-[11px] text-[var(--clay)] font-semibold">190,000</span>
            </div>
            <p className="font-mono text-[9px] text-[var(--ink-2)] mt-0.5">Blues, Jazz, Hip-Hop</p>
          </div>
          <div className="border border-[var(--line)] bg-[var(--paper)] p-2.5 rounded">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-[var(--ink)]">🇩🇪 Germany</span>
              <span className="font-mono text-[11px] text-[var(--clay)] font-semibold">150,000</span>
            </div>
            <p className="font-mono text-[9px] text-[var(--ink-2)] mt-0.5">Modular Sound, Bauhaus</p>
          </div>
          <div className="border border-[var(--line)] bg-[var(--paper)] p-2.5 rounded">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-[var(--ink)]">🇯🇵 Japan</span>
              <span className="font-mono text-[11px] text-[var(--clay)] font-semibold">120,000</span>
            </div>
            <p className="font-mono text-[9px] text-[var(--ink-2)] mt-0.5">Indigo, Sashiko, Harajuku</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ink-2)]" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
              placeholder="Search 1M nodes by name, description, region, or slug (e.g. Raga, Modular, Indigo, Bronx)..."
              className="w-full border border-[var(--ink)] bg-[var(--paper-2)] pl-10 pr-4 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-2)] focus:outline-none focus:ring-1 focus:ring-[var(--clay)] shadow-[2px_2px_0_var(--ink)]"
            />
          </div>

          <label className="flex items-center gap-2 px-3 py-2 border border-[var(--line)] bg-[var(--paper)] font-mono text-xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={seedOnly}
              onChange={(e) => {
                setSeedOnly(e.target.checked)
                setPage(1)
              }}
              className="rounded accent-[var(--clay)]"
            />
            <span>Original Seed Only</span>
          </label>
        </div>

        {/* Filter Chips: Origin & Kind */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--ink-2)] font-bold">
            Origin:
          </span>
          <button
            type="button"
            onClick={() => {
              setSelectedOrigin('')
              setPage(1)
            }}
            className={`px-2.5 py-0.5 font-mono text-xs rounded border transition-all ${
              selectedOrigin === ''
                ? 'bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]'
                : 'bg-[var(--paper)] text-[var(--ink-2)] border-[var(--line)] hover:border-[var(--ink)]'
            }`}
          >
            All Origins
          </button>
          {PRIORITY_ORIGINS.map((orig) => (
            <button
              key={orig}
              type="button"
              onClick={() => {
                setSelectedOrigin(orig === selectedOrigin ? '' : orig)
                setPage(1)
              }}
              className={`px-2.5 py-0.5 font-mono text-xs rounded border transition-all ${
                selectedOrigin === orig
                  ? 'bg-[var(--clay)] text-[var(--paper)] border-[var(--clay)] font-bold'
                  : 'bg-[var(--paper)] text-[var(--ink-2)] border-[var(--line)] hover:border-[var(--ink)]'
              }`}
            >
              {orig}
            </button>
          ))}

          <span className="ml-2 font-mono text-[11px] uppercase tracking-wider text-[var(--ink-2)] font-bold">
            Kind:
          </span>
          <button
            type="button"
            onClick={() => {
              setSelectedKind('')
              setPage(1)
            }}
            className={`px-2.5 py-0.5 font-mono text-xs rounded border transition-all ${
              selectedKind === ''
                ? 'bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]'
                : 'bg-[var(--paper)] text-[var(--ink-2)] border-[var(--line)] hover:border-[var(--ink)]'
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
              className={`px-2.5 py-0.5 font-mono text-xs rounded border capitalize transition-all ${
                selectedKind === k
                  ? 'bg-[var(--moss)] text-[var(--paper)] border-[var(--moss)] font-bold'
                  : 'bg-[var(--paper)] text-[var(--ink-2)] border-[var(--line)] hover:border-[var(--ink)]'
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* Nodes Grid */}
      {isLoading ? (
        <div className="py-16 text-center font-mono text-xs uppercase tracking-widest text-[var(--ink-2)]">
          Querying 1,000,000 Culture Master Index...
        </div>
      ) : nodes.length === 0 ? (
        <div className="border border-dashed border-[var(--line)] p-12 text-center space-y-2">
          <Compass className="h-8 w-8 text-[var(--clay)] mx-auto opacity-70" />
          <h3 className="font-serif text-lg font-bold text-[var(--ink)]">No Culture Nodes Found</h3>
          <p className="text-xs text-[var(--ink-2)]">
            Try adjusting your search query, clearing origin filters, or unchecking "Original Seed Only".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nodes.map((node) => (
            <div
              key={node.slug}
              className="border border-[var(--line)] bg-[var(--paper-2)] p-4 rounded hover:border-[var(--ink)] transition-all flex flex-col justify-between space-y-3 shadow-sm"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[var(--clay)] text-white">
                      {node.kind}
                    </span>
                    <span className="font-mono text-[10px] text-[var(--ink-2)] border border-[var(--line)] px-1.5 py-0.5 rounded">
                      {node.origin}
                    </span>
                  </div>

                  {node.is_original_seed ? (
                    <span className="font-mono text-[9px] uppercase tracking-wider font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-300 flex items-center gap-0.5">
                      <ShieldCheck className="h-3 w-3" />
                      Seed Record
                    </span>
                  ) : (
                    <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--ink-2)] bg-[var(--paper)] px-1.5 py-0.5 rounded border border-[var(--line)]">
                      Research Node
                    </span>
                  )}
                </div>

                <h3 className="font-serif text-base font-bold text-[var(--ink)] leading-snug line-clamp-2">
                  {node.name}
                </h3>

                <p className="text-xs text-[var(--ink-2)] line-clamp-3 leading-relaxed">
                  {node.description}
                </p>

                {node.experiences && node.experiences.length > 0 && (
                  <div className="border-t border-[var(--line)] pt-2 space-y-1">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--clay)] font-bold flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Exploration Vector:
                    </span>
                    <p className="text-[11px] text-[var(--ink)] italic line-clamp-2">
                      "{node.experiences[0]}"
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-[var(--line)] pt-2 flex items-center justify-between">
                <span className="font-mono text-[10px] text-[var(--ink-2)] truncate max-w-[150px]">
                  {node.slug}
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedNode(node)}
                  className="flex items-center gap-1 font-mono text-[11px] text-[var(--clay)] hover:text-[var(--ink)] font-bold transition-colors"
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
        <div className="flex items-center justify-between border-t border-[var(--line)] pt-4 font-mono text-xs">
          <span className="text-[var(--ink-2)]">
            Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} records)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 border border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--paper-2)]"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 border border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--paper-2)]"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Detailed Node Inspection Modal */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="border border-[var(--ink)] bg-[var(--paper-2)] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex items-start justify-between border-b border-[var(--line)] pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-[var(--clay)] text-white font-bold">
                    {selectedNode.kind}
                  </span>
                  <span className="font-mono text-xs text-[var(--ink-2)] border border-[var(--line)] px-2 py-0.5 rounded">
                    {selectedNode.origin}
                  </span>
                  {selectedNode.era && (
                    <span className="font-mono text-[11px] text-[var(--ink-2)]">
                      · {selectedNode.era}
                    </span>
                  )}
                </div>
                <h2 className="font-serif text-2xl font-bold text-[var(--ink)]">
                  {selectedNode.name}
                </h2>
                <span className="font-mono text-[11px] text-[var(--ink-2)]">
                  Slug: {selectedNode.slug}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="p-1 rounded text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--paper)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <span className="font-mono text-xs uppercase font-bold text-[var(--clay)] tracking-wider">
                Research Summary:
              </span>
              <p className="text-sm text-[var(--ink)] leading-relaxed">
                {selectedNode.description}
              </p>
            </div>

            {/* Experiences / Prompts */}
            {selectedNode.experiences && selectedNode.experiences.length > 0 && (
              <div className="space-y-2 border-t border-[var(--line)] pt-3">
                <span className="font-mono text-xs uppercase font-bold text-[var(--clay)] tracking-wider">
                  Field Guide Experiences:
                </span>
                <ul className="list-disc pl-5 space-y-1 text-xs text-[var(--ink)]">
                  {selectedNode.experiences.map((exp, i) => (
                    <li key={i}>{exp}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Practices & Places */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[var(--line)] pt-3">
              {selectedNode.practices && selectedNode.practices.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-mono text-xs uppercase font-bold text-[var(--moss)] tracking-wider flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    Living Practices:
                  </span>
                  <div className="space-y-1">
                    {selectedNode.practices.map((p, i) => (
                      <div key={i} className="text-xs border border-[var(--line)] bg-[var(--paper)] p-1.5 rounded">
                        <span className="font-semibold">{p.name}</span>
                        {p.type && <span className="font-mono text-[10px] text-[var(--ink-2)] block">{p.type}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedNode.places && selectedNode.places.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-mono text-xs uppercase font-bold text-[var(--clay)] tracking-wider flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    Key Geography:
                  </span>
                  <div className="space-y-1">
                    {selectedNode.places.map((place, i) => (
                      <div key={i} className="text-xs border border-[var(--line)] bg-[var(--paper)] p-1.5 rounded">
                        <span className="font-semibold">{place.name}</span>
                        {place.note && <span className="text-[11px] text-[var(--ink-2)] block">{place.note}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Timeline */}
            {selectedNode.timeline && selectedNode.timeline.length > 0 && (
              <div className="space-y-2 border-t border-[var(--line)] pt-3">
                <span className="font-mono text-xs uppercase font-bold text-[var(--clay)] tracking-wider flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Historical Milestones:
                </span>
                <div className="space-y-1.5">
                  {selectedNode.timeline.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span className="font-mono font-bold text-[var(--clay)] shrink-0 min-w-[70px]">
                        {item.year}:
                      </span>
                      <span className="text-[var(--ink)]">{item.event}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Editorial Status & License Notice */}
            <div className="border border-amber-300 bg-amber-50 p-3 rounded space-y-1 text-xs text-amber-900">
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
              <div className="space-y-1.5 border-t border-[var(--line)] pt-3">
                <span className="font-mono text-xs uppercase font-bold text-[var(--ink-2)] tracking-wider">
                  Academic & Institutional Sources:
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedNode.sources.map((src, i) => (
                    <a
                      key={i}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-[11px] text-[var(--clay)] underline hover:text-[var(--ink)]"
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
