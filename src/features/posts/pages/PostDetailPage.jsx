import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { fetchPostById } from '@/features/feed/services/feedService'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { PostCard } from '@/features/posts/components/PostCard'

export function PostDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['post_detail', id, user?.id],
    queryFn: () => fetchPostById({ postId: id, currentUserId: user?.id }),
    enabled: !!id,
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
