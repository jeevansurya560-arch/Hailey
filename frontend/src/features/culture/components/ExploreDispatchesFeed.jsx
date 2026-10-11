import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Search,
  Loader2,
  Compass,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { fetchExploreDispatches } from '@/features/feed/services/feedService'
import { FeedCard } from '@/features/feed/components/FeedCard'
import { useAuth } from '@/features/auth/hooks/useAuth'

const PAGE_SIZE = 36
const CACHE_KEY = 'hailey_cached_explore_dispatches_v2'

function getLocalCachedDispatches() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    // Cache valid for up to 2 hours
    if (Date.now() - parsed.timestamp < 1000 * 60 * 120 && Array.isArray(parsed.data?.posts) && parsed.data.posts.length > 0) {
      return parsed.data
    }
  } catch {}
  return null
}

function saveLocalCachedDispatches(data) {
  try {
    if (data?.posts?.length > 0) {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }))
    }
  } catch {}
}

const COMMUNITIES = [
  { slug: '', label: 'All Living Cultures' },
  { slug: 'living-heritage', label: 'Living Heritage' },
  { slug: 'sacred-architecture', label: 'Sacred Architecture' },
  { slug: 'performing-arts', label: 'Performing Arts' },
  { slug: 'festivals-pageantry', label: 'Festivals & Pageantry' },
  { slug: 'urban-expression', label: 'Urban Expression' },
]

export function ExploreDispatchesFeed() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCommunity, setSelectedCommunity] = useState('')
  const [orderBy, setOrderBy] = useState('newest') // 'newest' | 'most_liked' | 'most_discussed'
  const [page, setPage] = useState(0)

  const isDefaultFilter = !searchTerm.trim() && !selectedCommunity && orderBy === 'newest' && page === 0

  // 1. Instant cache retrieval for 0ms initial render on load & refresh
  const cachedInitial = isDefaultFilter ? getLocalCachedDispatches() : null

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: [
      'explore_dispatches',
      searchTerm,
      selectedCommunity,
      orderBy,
      page,
      user?.id,
    ],
    queryFn: async () => {
      const res = await fetchExploreDispatches({
        query: searchTerm,
        communitySlug: selectedCommunity,
        orderBy,
        page,
        pageSize: PAGE_SIZE,
        userId: user?.id,
      })

      if (isDefaultFilter && res.posts.length > 0) {
        saveLocalCachedDispatches(res)
      }

      return res
    },
    initialData: cachedInitial || undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes fresh in memory
    gcTime: 1000 * 60 * 30, // 30 minutes in garbage collection cache
    refetchOnWindowFocus: false, // Prevents sudden refetch lag when clicking between browser tabs
  })

  // Cache fallback if network fails
  const posts = data?.posts || cachedInitial?.posts || []
  const total = data?.total || posts.length

  const handleFilterChange = (setter, val) => {
    setPage(0)
    setter(val)
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="border border-[var(--ink)] bg-[var(--paper-2)] p-6 shadow-[var(--shadow-hard)] space-y-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-widest font-bold px-2 py-0.5 rounded bg-[var(--clay)] text-[var(--paper)]">
            Explore Feed · Living Dispatches
          </span>
          <span className="font-mono text-xs text-[var(--ink-2)] flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-[var(--clay)]" />
            Supabase Live Stream · Monad L1 Authenticated
          </span>
        </div>

        <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-[var(--ink)]">
          Live Cultural Dispatches
        </h1>
        <p className="text-sm text-[var(--ink-2)] max-w-2xl leading-relaxed">
          Real-time ethnographic photography, sacred architecture studies, and living crafts documented by verified authors. Every dispatch is authenticated under Monad L1 onchain standards.
        </p>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
          <div className="relative md:col-span-6">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ink-2)]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
              placeholder="Filter by culture, ritual, craft, or keyword..."
              className="w-full border border-[var(--ink)] bg-[var(--paper)] pl-10 pr-4 py-2 text-xs font-sans text-[var(--ink)] placeholder:text-[var(--ink-2)] focus:outline-none focus:ring-1 focus:ring-[var(--clay)] shadow-[1px_1px_0_var(--ink)]"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedCommunity}
              onChange={(e) => handleFilterChange(setSelectedCommunity, e.target.value)}
              className="w-full border border-[var(--ink)] bg-[var(--paper)] px-3 py-2 text-xs font-mono text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--clay)] shadow-[1px_1px_0_var(--ink)]"
            >
              {COMMUNITIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={orderBy}
              onChange={(e) => handleFilterChange(setOrderBy, e.target.value)}
              className="w-full border border-[var(--ink)] bg-[var(--paper)] px-3 py-2 text-xs font-mono text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--clay)] shadow-[1px_1px_0_var(--ink)]"
            >
              <option value="newest">Newest First</option>
              <option value="most_liked">Most Endorsed (Likes)</option>
              <option value="most_discussed">Most Discussed</option>
              <option value="oldest">Historical Order</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading Skeleton (Only shown if zero cached data exists) */}
      {isLoading && posts.length === 0 && (
        <div className="space-y-4 py-8">
          <div className="flex items-center justify-center gap-2 font-mono text-xs text-[var(--clay)] uppercase tracking-wider">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Retrieving live cultural dispatches...</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="border border-[var(--line)] bg-[var(--paper-2)] p-6 space-y-4 animate-pulse"
              >
                <div className="h-4 bg-[var(--line)] w-1/3 rounded" />
                <div className="h-48 bg-[var(--line)] rounded" />
                <div className="h-4 bg-[var(--line)] w-3/4 rounded" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error State (Only shown if zero cached data exists and query fails) */}
      {isError && posts.length === 0 && (
        <div className="border border-red-300 bg-red-50 p-6 text-center space-y-3">
          <AlertCircle className="h-6 w-6 text-red-600 mx-auto" />
          <h3 className="font-serif text-base font-bold text-red-800">
            Failed to Load Cultural Feed
          </h3>
          <p className="font-mono text-xs text-red-600 max-w-md mx-auto">
            {error?.message || 'Database query error encountered while querying public dispatches.'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 border border-red-800 bg-red-800 text-white px-4 py-2 font-mono text-xs uppercase font-bold"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* Feed List */}
      {(posts.length > 0 || (!isLoading && !isError)) && (
        <>
          {posts.length === 0 ? (
            <div className="border border-dashed border-[var(--line)] bg-[var(--paper-2)] p-12 text-center space-y-3">
              <Compass className="h-8 w-8 text-[var(--ink-2)] mx-auto" />
              <h3 className="font-serif text-lg font-bold text-[var(--ink)]">
                No Dispatches Found
              </h3>
              <p className="font-mono text-xs text-[var(--ink-2)] max-w-md mx-auto">
                No approved cultural records matched your active filter or search criteria.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCommunity('')
                  setOrderBy('newest')
                  setPage(0)
                }}
                className="border border-[var(--ink)] bg-[var(--clay)] text-[var(--paper)] px-4 py-2 font-mono text-xs uppercase font-bold shadow-[1.5px_1.5px_0_var(--ink)] mt-2"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between font-mono text-xs text-[var(--ink-2)] px-1">
                <span>
                  Showing <strong>{posts.length}</strong> of{' '}
                  <strong>{total}</strong> verified cultural dispatches
                </span>
                {isFetching && (
                  <span className="flex items-center gap-1 text-[var(--clay)]">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Syncing live updates...</span>
                  </span>
                )}
              </div>

              <div className="space-y-6">
                {posts.map((post) => (
                  <FeedCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ExploreDispatchesFeed
