import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Sparkles, Users, Loader2, ArrowRight, Compass } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/useAuth'
import { PostComposer } from '@/features/posts/PostComposer'
import { FeedCard, type FeedItemData } from '@/features/feed/FeedCard'
import type { TagKind } from '@/lib/threadColors'

const PAGE_SIZE = 15

export function HomePage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)

  // 1. Fetch user's interest weights count
  const { data: userInterestsCount = 0 } = useQuery({
    queryKey: ['user_interests_count', user?.id],
    queryFn: async () => {
      if (!user) return 0
      const { count } = await supabase
        .from('user_interests')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gt('weight', 0)
      return count ?? 0
    },
    enabled: !!user,
  })

  // 2. Fetch personalized feed items via get_feed RPC
  const { data: feedData, isLoading: isFeedLoading } = useQuery({
    queryKey: ['feed', user?.id, page, userInterestsCount],
    queryFn: async () => {
      const limit = (page + 1) * PAGE_SIZE

      // If user is signed in and has positive weights, call get_feed RPC
      if (user && userInterestsCount > 0) {
        // Try RPC call
        const { data: rpcFeed, error: rpcErr } = await supabase.rpc('get_feed', {
          p_limit: limit,
          p_offset: 0,
        })

        // Also fetch get_explore items for interleaving (FEED-03)
        const { data: rpcExplore } = await supabase.rpc('get_explore', {
          p_limit: Math.max(3, Math.floor(limit / 5)),
        })

        if (!rpcErr && rpcFeed && rpcFeed.length > 0) {
          const exploreList = rpcExplore || []
          let exploreIdx = 0

          // Merge & interleave explore items at every 5th slot
          const orderedFeedItems: { post_id: string; score: number; why: string[]; isExplore: boolean }[] = []
          for (let i = 0; i < rpcFeed.length; i++) {
            orderedFeedItems.push({
              post_id: rpcFeed[i].post_id,
              score: rpcFeed[i].score,
              why: rpcFeed[i].why,
              isExplore: false,
            })

            // Interleave explore item at 5th position
            if ((i + 1) % 4 === 0 && exploreIdx < exploreList.length) {
              orderedFeedItems.push({
                post_id: exploreList[exploreIdx].post_id,
                score: exploreList[exploreIdx].score,
                why: exploreList[exploreIdx].why,
                isExplore: true,
              })
              exploreIdx++
            }
          }

          const postIds = orderedFeedItems.map((item) => item.post_id)

          // Fetch full post metadata preserving ranking order
          const { data: fullPosts, error: postErr } = await supabase
            .from('posts')
            .select(`
              id,
              author_id,
              body,
              media_url,
              media_credit,
              source_url,
              is_editorial,
              created_at,
              profiles(handle, display_name),
              communities(slug, name),
              post_tags(tags(id, name, slug, kind))
            `)
            .in('id', postIds)

          if (!postErr && fullPosts) {
            const postsMap = new Map(fullPosts.map((p) => [p.id, p]))

            // Fetch user reactions
            const { data: userReactions } = await supabase
              .from('post_reactions')
              .select('post_id, kind')
              .eq('user_id', user.id)

            const { data: allReactions } = await supabase
              .from('post_reactions')
              .select('post_id, kind')
              .in('post_id', postIds)

            const reactionsCountMap = new Map<string, { likes: number; saves: number }>()
            if (allReactions) {
              for (const r of allReactions) {
                const current = reactionsCountMap.get(r.post_id) || { likes: 0, saves: 0 }
                if (r.kind === 'like') current.likes++
                if (r.kind === 'save') current.saves++
                reactionsCountMap.set(r.post_id, current)
              }
            }

            const hiddenPostIds = new Set(
              (userReactions || []).filter((r) => r.kind === 'hide').map((r) => r.post_id)
            )

            // Reconstruct in exact ranking order
            const resultList: FeedItemData[] = []
            for (const feedItem of orderedFeedItems) {
              if (hiddenPostIds.has(feedItem.post_id)) continue
              const p = postsMap.get(feedItem.post_id)
              if (!p) continue

              const pReactions = (userReactions || []).filter((r) => r.post_id === p.id)
              const counts = reactionsCountMap.get(p.id) || { likes: 0, saves: 0 }
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const tags = (p.post_tags || []).map((pt: any) => pt.tags).filter(Boolean) as {
                id: number
                name: string
                slug: string
                kind: TagKind
              }[]

              resultList.push({
                id: p.id,
                author_id: p.author_id,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                author: p.profiles as any,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                community: p.communities as any,
                body: p.body,
                media_url: p.media_url,
                media_credit: p.media_credit,
                source_url: p.source_url,
                is_editorial: p.is_editorial,
                created_at: p.created_at,
                tags,
                why: feedItem.why,
                score: feedItem.score,
                isExplore: feedItem.isExplore,
                reactions: {
                  likesCount: counts.likes,
                  savesCount: counts.saves,
                  isLiked: pReactions.some((r) => r.kind === 'like'),
                  isSaved: pReactions.some((r) => r.kind === 'save'),
                  isHidden: false,
                },
              })
            }

            return { items: resultList, hasPersonalization: true, hasMore: rpcFeed.length >= limit }
          }
        }
      }

      // Fallback: newest posts (or editorial fallback if 0 weights) (FEED-08)
      const { data: postsData } = await supabase
        .from('posts')
        .select(`
          id,
          author_id,
          body,
          media_url,
          media_credit,
          source_url,
          is_editorial,
          created_at,
          profiles(handle, display_name),
          communities(slug, name),
          post_tags(tags(id, name, slug, kind))
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fallbackList: FeedItemData[] = (postsData || []).map((p: any) => {
        const tags = (p.post_tags || []).map((pt: any) => pt.tags).filter(Boolean)
        return {
          id: p.id,
          author_id: p.author_id,
          author: p.profiles,
          community: p.communities,
          body: p.body,
          media_url: p.media_url,
          media_credit: p.media_credit,
          source_url: p.source_url,
          is_editorial: p.is_editorial,
          created_at: p.created_at,
          tags,
          why: tags.length > 0 ? [tags[0].name] : ['Culture'],
          isExplore: false,
          reactions: {
            likesCount: 0,
            savesCount: 0,
            isLiked: false,
            isSaved: false,
            isHidden: false,
          },
        }
      })

      return {
        items: fallbackList,
        hasPersonalization: false,
        hasMore: fallbackList.length >= limit,
      }
    },
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
