import React, { useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { useQuery } from '@tanstack/react-query'
import { listMarkets } from '../services/marketService'
import { MarketCard } from '../components/MarketCard'
import { CreateMarketModal } from '../components/CreateMarketModal'
import { MarketDetailModal } from '../components/MarketDetailModal'

export function MarketsPage() {
  const { session } = useAuth()
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedMarket, setSelectedMarket] = useState(null)

  const {
    data: markets = [],
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

  const error = queryError?.message || null

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in text-zinc-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-blue-400">
            Cultural Forecasting
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Cultural Outcome Markets
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
            Forecast cultural milestones, exhibition sellouts, and archive thresholds rather than financial instruments.
          </p>
        </div>

        {session && (
          <button
            onClick={() => setCreateOpen(true)}
            className="self-start md:self-auto px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition"
          >
            + Create Cultural Market
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-2xl">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-zinc-500 font-medium pl-1">Category:</span>
          {['', 'cultural_preservation', 'exhibition', 'archive_milestone', 'community_growth'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl transition ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              {cat ? cat.replace('_', ' ') : 'All'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1 bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs rounded-xl"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs">
          {error}
        </div>
      )}

      {/* Markets Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="h-64 bg-zinc-900 border border-zinc-800 rounded-2xl animate-pulse" />
          <div className="h-64 bg-zinc-900 border border-zinc-800 rounded-2xl animate-pulse" />
          <div className="h-64 bg-zinc-900 border border-zinc-800 rounded-2xl animate-pulse" />
        </div>
      ) : markets.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {markets.map((market) => (
            <MarketCard key={market.id} market={market} onSelect={setSelectedMarket} />
          ))}
        </div>
      ) : (
        <div className="p-12 bg-zinc-900/60 border border-zinc-800 rounded-2xl text-center space-y-3">
          <p className="text-base text-zinc-300 font-semibold">No cultural markets found</p>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            Be the first to create an outcome prediction market for a cultural milestone or exhibition.
          </p>
          {session && (
            <button
              onClick={() => setCreateOpen(true)}
              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition"
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
