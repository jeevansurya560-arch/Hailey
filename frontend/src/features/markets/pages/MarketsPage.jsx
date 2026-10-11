import React, { useState } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import { listMarkets } from '../services/marketService'
import { MarketCard } from '../components/MarketCard'
import { CreateMarketModal } from '../components/CreateMarketModal'
import { MarketDetailModal } from '../components/MarketDetailModal'
import { CommunitySubNav } from '@/features/communities/components/CommunitySubNav'

export function MarketsPage() {
  const { session } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedMarket, setSelectedMarket] = useState(null)

  const {
    data: rawMarkets = [],
    isLoading: loading,
    error: queryError,
    refetch: fetchMarkets,
  } = useQuery({
    queryKey: ['markets', categoryFilter, statusFilter],
    queryFn: () =>
      listMarkets({
        category: categoryFilter || null,
        status: statusFilter || null,
      }),
  })

  // Filter by search query
  const markets = rawMarkets.filter((m) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      m.title?.toLowerCase().includes(q) ||
      m.product_name?.toLowerCase().includes(q) ||
      m.cultural_origin?.toLowerCase().includes(q) ||
      m.craft_tradition?.toLowerCase().includes(q) ||
      m.description?.toLowerCase().includes(q)
    )
  })

  const error = queryError?.message || null

  return (
    <div className="space-y-8 animate-fade-in text-[#34252A]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E0D4C5] pb-5">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#B08A50]">
            Cultural Forecasting & Heritage Bazaar
          </span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-[#34252A] mt-1">
            Cultural Markets & Living Products
          </h1>
          <p className="text-sm text-[#34252A]/70 mt-1 max-w-2xl leading-relaxed">
            Discover authentic handcrafted cultural products, master guild artifacts, and outcome forecasting for cultural milestones and exhibitions.
          </p>
          <div className="mt-4 pt-1">
            <CommunitySubNav />
          </div>
        </div>

        {session && (
          <button
            onClick={() => setCreateOpen(true)}
            className="self-start md:self-auto px-5 py-2.5 bg-[#6A1F35] text-[#FAF6EF] hover:bg-[#511528] active:bg-[#3D0F1D] shadow-md font-bold text-xs rounded-full transition-all cursor-pointer"
          >
            + Create Cultural Market
          </button>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 neu-card bg-[#FAF6EF] border border-[#E0D4C5] rounded-2xl">
          {/* Search Input */}
          <div className="w-full sm:w-72 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, crafts, origins..."
              className="w-full pl-8 pr-3 py-1.5 text-xs neu-inset-input bg-[#FAF6EF] border border-[#E0D4C5] rounded-xl text-[#34252A] placeholder:text-[#34252A]/40 focus:outline-none focus:ring-1 focus:ring-[#6A1F35]"
            />
            <span className="absolute left-2.5 top-2 text-[#34252A]/40 text-xs">🔍</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono self-end sm:self-auto">
            <span className="text-[#34252A]/60 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 neu-inset-input bg-[#FAF6EF] border border-[#E0D4C5] text-[#34252A] text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-[#6A1F35]"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[#34252A]/60 font-medium pl-1 text-[11px] font-mono">Category:</span>
          {[
            { id: '', label: 'All Heritage Markets' },
            { id: 'cultural_preservation', label: 'Preservation & Craft' },
            { id: 'exhibition', label: 'Exhibitions & Salons' },
            { id: 'archive_milestone', label: 'Archive Milestones' },
            { id: 'community_growth', label: 'Guild & Community' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1 text-xs rounded-full transition-all ${
                categoryFilter === cat.id
                  ? 'bg-[#6A1F35] text-[#FAF6EF] font-semibold neu-burgundy-pill'
                  : 'bg-[#FAF6EF] text-[#34252A]/70 border border-[#E0D4C5] hover:border-[#6A1F35]/40 neu-pill'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs neu-card">
          {error}
        </div>
      )}

      {/* Markets Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="h-64 bg-[#F0E7DA]/50 border border-[#E0D4C5] rounded-2xl animate-pulse" />
          <div className="h-64 bg-[#F0E7DA]/50 border border-[#E0D4C5] rounded-2xl animate-pulse" />
          <div className="h-64 bg-[#F0E7DA]/50 border border-[#E0D4C5] rounded-2xl animate-pulse" />
        </div>
      ) : markets.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {markets.map((market) => (
            <MarketCard key={market.id} market={market} onSelect={setSelectedMarket} />
          ))}
        </div>
      ) : (
        <div className="p-12 neu-card bg-[#FAF6EF] border border-dashed border-[#E0D4C5] rounded-2xl text-center space-y-3">
          <p className="text-base text-[#34252A] font-serif font-bold">No cultural markets found</p>
          <p className="text-xs text-[#34252A]/60 max-w-md mx-auto">
            Be the first to create an outcome prediction market for a cultural milestone or exhibition.
          </p>
          {session && (
            <button
              onClick={() => setCreateOpen(true)}
              className="mt-2 px-5 py-2 neu-burgundy-pill hover:bg-[#511528] text-[#FAF6EF] font-bold text-xs rounded-full transition-all"
            >
              Launch Market
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateMarketModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => fetchMarkets()}
      />

      <MarketDetailModal
        market={selectedMarket}
        isOpen={!!selectedMarket}
        onClose={() => setSelectedMarket(null)}
        onUpdated={() => fetchMarkets()}
      />
    </div>
  )
}
