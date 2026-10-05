import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/useAuth'
import { PostCard, type PostItemData } from '@/features/posts/PostCard'
import type { TagKind } from '@/lib/threadColors'

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['post_detail', id, user?.id],
    queryFn: async () => {
      if (!id) return null

      const { data: p, error } = await supabase
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
        .eq('id', id)
        .single()

      if (error || !p) throw error || new Error('Post not found')

      // Reactions
      let userReactions: { post_id: string; kind: string }[] = []
      if (user) {
        const { data: reactionsData } = await supabase
          .from('post_reactions')
          .select('post_id, kind')
          .eq('user_id', user.id)
          .eq('post_id', id)
        userReactions = reactionsData || []
      }

      const { data: allReactions } = await supabase
        .from('post_reactions')
        .select('post_id, kind')
        .eq('post_id', id)

      let likesCount = 0
      let savesCount = 0
      if (allReactions) {
        for (const r of allReactions) {
          if (r.kind === 'like') likesCount++
          if (r.kind === 'save') savesCount++
        }
      }

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
          likesCount,
          savesCount,
          isLiked: userReactions.some((r) => r.kind === 'like'),
          isSaved: userReactions.some((r) => r.kind === 'save'),
          isHidden: userReactions.some((r) => r.kind === 'hide'),
        },
      } as PostItemData
    },
  })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--clay)]" />
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--ink-2)]">
          Loading dispatch...
        </p>
      </div>
    )
  }

  if (isError || !post) {
    return (
      <div className="border border-[var(--clay)] bg-[var(--paper-2)] p-8 text-center space-y-3">
        <h2 className="font-serif text-2xl font-bold text-[var(--ink)]">Dispatch Not Found</h2>
        <Link to="/" className="font-mono text-xs text-[var(--clay)] underline">
          ← Return to Home
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 font-mono text-xs text-[var(--ink-2)] hover:text-[var(--ink)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back</span>
      </button>

      <PostCard
        post={post}
        onDelete={() => {
          queryClient.invalidateQueries({ queryKey: ['posts'] })
          navigate('/', { replace: true })
        }}
      />
    </div>
  )
}
