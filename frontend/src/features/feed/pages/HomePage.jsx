import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Sparkles, Users, Loader2, ArrowRight, Compass } from 'lucide-react'
import {
  fetchUserInterestsCount,
  fetchFeedStream,
} from '@/features/feed/services/feedService'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { PostComposer } from '@/features/posts/components/PostComposer'
import { FeedCard } from '@/features/feed/components/FeedCard'

const PAGE_SIZE = 15
const HOME_FEED_CACHE_KEY = 'hailey_home_feed_cache_v2'

function getLocalHomeFeedCache() {
  try {
    const raw = localStorage.getItem(HOME_FEED_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Date.now() - parsed.timestamp < 1000 * 60 * 120 && Array.isArray(parsed.data?.items) && parsed.data.items.length > 0) {
      return parsed.data
    }
  } catch {}
  return null
}

function saveLocalHomeFeedCache(data) {
  try {
    if (data?.items?.length > 0) {
      localStorage.setItem(HOME_FEED_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }))
    }
  } catch {}
}

export function HomePage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)

  // 1. Fetch user's interest weights count via feedService
  const { data: userInterestsCount = 0 } = useQuery({
    queryKey: ['user_interests_count', user?.id],
    queryFn: () => fetchUserInterestsCount(user?.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  })

  const cachedHomeFeed = page === 0 ? getLocalHomeFeedCache() : null

  // 2. Fetch personalized or fallback feed stream via feedService with instant local cache
  const { data: feedData, isLoading: isFeedLoading } = useQuery({
    queryKey: ['feed', user?.id, page, userInterestsCount],
    queryFn: async () => {
      const res = await fetchFeedStream({
        user,
        userInterestsCount,
        page,
        pageSize: PAGE_SIZE,
      })
      if (page === 0 && res?.items?.length > 0) {
        saveLocalHomeFeedCache(res)
      }
      return res
    },
    initialData: cachedHomeFeed || undefined,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  })

  const posts = feedData?.items || []
  const hasPersonalization = feedData?.hasPersonalization || false
  const hasMore = feedData?.hasMore || false

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="border border-[var(--ink)] bg-[var(--paper-2)] p-6 md:p-8 shadow-[var(--shadow-hard)] space-y-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-widest text-[var(--clay)] font-bold">
            Field Guide · Issue #1
          </span>
          <span className="h-1 w-1 rounded-full bg-[var(--ink-2)]" />
          <span className="font-mono text-[11px] text-[var(--ink-2)]">
            Autonomous Cultural Atlas
          </span>
        </div>

        <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-[var(--ink)] leading-tight">
          Exploring the Living Tapestry of Global Culture
        </h1>

        <p className="max-w-2xl text-sm md:text-base text-[var(--ink-2)] leading-relaxed">
          Hailey links underground movements, heritage traditions, and contemporary aesthetics into an open graph — verified onchain, curated by communities.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Link
            to="/explore"
            className="border border-[var(--ink)] bg-[var(--clay)] px-4 py-2 font-mono text-xs uppercase tracking-wider text-[var(--paper)] transition-all hover:opacity-90 shadow-[2px_2px_0_var(--ink)]"
          >
            Explore Taxonomy
          </Link>
          <Link
            to="/communities"
            className="border border-[var(--ink)] bg-[var(--paper)] px-4 py-2 font-mono text-xs uppercase tracking-wider text-[var(--ink)] transition-all hover:bg-[var(--paper-2)] shadow-[2px_2px_0_var(--ink)]"
          >
            Browse Collectives
          </Link>
        </div>

        {/* Cold Start / Onboarding prompt banner for zero-interest visitors (FEED-08) */}
        {!hasPersonalization && (
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-[var(--paper)] border border-[var(--saffron)] rounded-[var(--radius)]">
            <div className="space-y-0.5">
              <span className="font-mono text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-[var(--saffron)]" />
                Personalize your feed
              </span>
              <p className="text-xs text-[var(--ink-2)]">
                Select 3 to 10 threads to see an explainable, personalized feed.
              </p>
            </div>
            <Link
              to={user ? '/onboarding' : '/login'}
              className="flex items-center gap-1 px-3 py-1.5 font-mono text-xs uppercase font-bold bg-[var(--saffron)] text-[var(--paper)] rounded border border-[var(--ink)] shadow-[1.5px_1.5px_0_var(--ink)] hover:opacity-95 shrink-0"
            >
              <span>{user ? 'Pick Threads' : 'Sign In to Onboard'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Main Grid: Feed & Composer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Composer & Feed */}
        <div className="lg:col-span-2 space-y-6">
          <PostComposer
            onPostCreated={() => {
              queryClient.invalidateQueries({ queryKey: ['feed'] })
            }}
          />

          <div className="border-b border-[var(--line)] pb-2 flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-[var(--ink)] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--clay)]" />
              {hasPersonalization ? 'Your Personalized Cultural Feed' : 'Latest Editorial Dispatches'}
            </h2>
            <span className="font-mono text-xs text-[var(--ink-2)]">
              {posts.length} {posts.length === 1 ? 'dispatch' : 'dispatches'}
            </span>
          </div>

          {isFeedLoading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--clay)]" />
              <p className="font-mono text-xs uppercase tracking-widest text-[var(--ink-2)]">
                Curating your feed...
              </p>
            </div>
          )}

          {!isFeedLoading && posts.length === 0 && (
            <div className="border border-dashed border-[var(--line)] p-8 text-center font-mono text-xs text-[var(--ink-2)]">
              No dispatches found. Use the composer above to publish your first cultural note.
            </div>
          )}

          <div className="space-y-6">
            {posts.map((post) => (
              <FeedCard
                key={post.id}
                post={post}
                onDelete={() => {
                  queryClient.invalidateQueries({ queryKey: ['feed'] })
                }}
                onHide={() => {
                  queryClient.invalidateQueries({ queryKey: ['feed'] })
                }}
              />
            ))}
          </div>

          {/* Load More Pagination */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-2 border border-[var(--ink)] bg-[var(--paper-2)] px-6 py-2.5 font-mono text-xs uppercase tracking-wider text-[var(--ink)] shadow-[2px_2px_0_var(--ink)] hover:bg-[var(--paper)] transition-colors"
              >
                <span>Load More Dispatches</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right 1 Col: Communities Spotlight */}
        <div className="space-y-6">
          <div className="border border-[var(--line)] bg-[var(--paper-2)] p-5 space-y-4">
            <div className="flex items-center gap-2 text-[var(--clay)] border-b border-[var(--line)] pb-2">
              <Users className="h-4 w-4" />
              <h3 className="font-serif text-base font-bold text-[var(--ink)]">
                Featured Collectives
              </h3>
            </div>
            <p className="text-xs text-[var(--ink-2)] leading-relaxed">
              Join focused collectives curating archives and verifying contributions on Monad.
            </p>
            <Link
              to="/communities"
              className="inline-block font-mono text-xs text-[var(--clay)] font-semibold hover:underline"
            >
              View all 8 communities →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
