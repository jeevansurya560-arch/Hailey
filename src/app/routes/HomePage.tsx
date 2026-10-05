import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Sparkles, Users, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/useAuth'
import { PostComposer } from '@/features/posts/PostComposer'
import { PostCard, type PostItemData } from '@/features/posts/PostCard'
import type { TagKind } from '@/lib/threadColors'

export function HomePage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Fetch recent dispatches
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts', user?.id],
    queryFn: async () => {
      const { data: postsData, error } = await supabase
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
        .limit(20)

      if (error) throw error

      // User reactions
      let userReactions: { post_id: string; kind: string }[] = []
      if (user) {
        const { data: reactionsData } = await supabase
          .from('post_reactions')
          .select('post_id, kind')
          .eq('user_id', user.id)
        userReactions = reactionsData || []
      }

      // Counts
      const { data: allReactions } = await supabase.from('post_reactions').select('post_id, kind')

      const reactionsCountMap = new Map<string, { likes: number; saves: number }>()
      if (allReactions) {
        for (const r of allReactions) {
          const current = reactionsCountMap.get(r.post_id) || { likes: 0, saves: 0 }
          if (r.kind === 'like') current.likes++
          if (r.kind === 'save') current.saves++
          reactionsCountMap.set(r.post_id, current)
        }
      }

      // Filter out hidden posts
      const hiddenPostIds = new Set(
        userReactions.filter((r) => r.kind === 'hide').map((r) => r.post_id)
      )

      return (postsData || [])
        .filter((p) => !hiddenPostIds.has(p.id))
        .map((p) => {
          const postReactions = userReactions.filter((r) => r.post_id === p.id)
          const counts = reactionsCountMap.get(p.id) || { likes: 0, saves: 0 }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const tags = (p.post_tags || []).map((pt: any) => pt.tags).filter(Boolean) as {
            id: number
            name: string
            slug: string
            kind: TagKind
          }[]

          return {
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
            reactions: {
              likesCount: counts.likes,
              savesCount: counts.saves,
              isLiked: postReactions.some((r) => r.kind === 'like'),
              isSaved: postReactions.some((r) => r.kind === 'save'),
              isHidden: false,
            },
          }
        }) as PostItemData[]
    },
  })

  return (
    <div className="space-y-8">
      {/* Hero Field Guide Banner */}
      <div className="border border-[var(--ink)] bg-[var(--paper-2)] p-6 md:p-8 shadow-[var(--shadow-hard)]">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-mono text-[11px] uppercase tracking-widest text-[var(--clay)] font-bold">
            Field Guide · Cultural Ledger
          </span>
          <span className="h-1 w-1 rounded-full bg-[var(--ink-2)]" />
          <span className="font-mono text-[11px] text-[var(--ink-2)]">
            Open Taxonomy
          </span>
        </div>

        <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-[var(--ink)] leading-tight">
          Exploring Global Cultural Threads
        </h1>

        <p className="mt-3 max-w-2xl text-sm md:text-base text-[var(--ink-2)] leading-relaxed">
          Hailey documents subcultural movements, heritage traditions, and contemporary aesthetics into an open graph — verified onchain on Monad, curated by communities.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
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
      </div>

      {/* Main Grid: Feed & Composer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Post Composer & Newest Posts */}
        <div className="lg:col-span-2 space-y-6">
          <PostComposer
            onPostCreated={() => {
              queryClient.invalidateQueries({ queryKey: ['posts'] })
            }}
          />

          <div className="border-b border-[var(--line)] pb-2 flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-[var(--ink)] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--clay)]" />
              Latest Cultural Dispatches
            </h2>
            <span className="font-mono text-xs text-[var(--ink-2)]">
              {posts.length} {posts.length === 1 ? 'dispatch' : 'dispatches'}
            </span>
          </div>

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--clay)]" />
              <p className="font-mono text-xs uppercase tracking-widest text-[var(--ink-2)]">
                Loading cultural feed...
              </p>
            </div>
          )}

          {!isLoading && posts.length === 0 && (
            <div className="border border-dashed border-[var(--line)] p-8 text-center font-mono text-xs text-[var(--ink-2)]">
              No dispatches found. Use the composer above to publish your first cultural note.
            </div>
          )}

          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={() => {
                  queryClient.invalidateQueries({ queryKey: ['posts'] })
                }}
                onHide={() => {
                  queryClient.invalidateQueries({ queryKey: ['posts'] })
                }}
              />
            ))}
          </div>
        </div>

        {/* Right 1 Col: Quick Navigation & Communities Preview */}
        <div className="space-y-6">
          <div className="border border-[var(--line)] bg-[var(--paper-2)] p-5 space-y-4">
            <div className="flex items-center gap-2 text-[var(--clay)] border-b border-[var(--line)] pb-2">
              <Users className="h-4 w-4" />
              <h3 className="font-serif text-base font-bold text-[var(--ink)]">
                Featured Communities
              </h3>
            </div>
            <p className="text-xs text-[var(--ink-2)] leading-relaxed">
              Join focused collectives curating archives and verifying contributions.
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
