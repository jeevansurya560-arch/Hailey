import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Bookmark, EyeOff, Trash2, ExternalLink, ShieldCheck, Lock } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  togglePostReaction,
  hidePost,
  deletePost,
} from '@/features/feed/services/feedService'
import { TagSticker } from '@/components/ui/TagSticker'

export function PostCard({ post, onDelete, onHide }) {
  const { user } = useAuth()

  // Optimistic reaction states
  const [isLiked, setIsLiked] = useState(post.reactions?.isLiked ?? false)
  const [likesCount, setLikesCount] = useState(post.reactions?.likesCount ?? 0)
  const [isSaved, setIsSaved] = useState(post.reactions?.isSaved ?? false)
  const [savesCount, setSavesCount] = useState(post.reactions?.savesCount ?? 0)
  const [isHidden, setIsHidden] = useState(post.reactions?.isHidden ?? false)
  const [isDeleting, setIsDeleting] = useState(false)

  const isAuthor = user && user.id === post.author_id

  // Toggle Like with optimistic rollback via feedService
  const handleLike = async () => {
    if (!user) return
    const prevLiked = isLiked
    const prevCount = likesCount

    // Optimistic update
    setIsLiked(!prevLiked)
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1)

    try {
      await togglePostReaction({
        userId: user.id,
        postId: post.id,
        kind: 'like',
        isCurrentlyActive: prevLiked,
      })
    } catch {
      setIsLiked(prevLiked)
      setLikesCount(prevCount)
    }
  }

  // Toggle Save with optimistic rollback via feedService
  const handleSave = async () => {
    if (!user) return
    const prevSaved = isSaved
    const prevCount = savesCount

    setIsSaved(!prevSaved)
    setSavesCount(prevSaved ? prevCount - 1 : prevCount + 1)

    try {
      await togglePostReaction({
        userId: user.id,
        postId: post.id,
        kind: 'save',
        isCurrentlyActive: prevSaved,
      })
    } catch {
      setIsSaved(prevSaved)
      setSavesCount(prevCount)
    }
  }

  // Hide post via feedService
  const handleHide = async () => {
    if (!user) return
    setIsHidden(true)
    onHide?.(post.id)

    try {
      await hidePost({ userId: user.id, postId: post.id })
    } catch (err) {
      console.warn('Failed to hide post:', err)
    }
  }

  // Author-only delete (POST-04) via feedService
  const handleDelete = async () => {
    if (!isAuthor || isDeleting) return
    if (!window.confirm('Delete this cultural dispatch?')) return

    setIsDeleting(true)
    try {
      await deletePost({ postId: post.id })
      onDelete?.(post.id)
    } catch (err) {
      setIsDeleting(false)
      alert('Failed to delete post: ' + err.message)
    }
  }

  if (isHidden) return null

  // Extract hostname for clean source line (CULT-03)
  let sourceHost = ''
  if (post.source_url) {
    try {
      sourceHost = new URL(post.source_url).hostname.replace('www.', '')
    } catch {
      sourceHost = 'source'
    }
  }

  return (
    <article className="neu-card rounded-2xl bg-[#FAF6EF] border border-[#E0D4C5] p-5 md:p-6 hover:border-[#6A1F35]/30 transition-all space-y-4">
      {/* Header / Author line */}
      <div className="flex items-start justify-between gap-3 border-b border-[#E0D4C5] pb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to={`/u/${post.author?.handle || 'member'}`}
              className="font-mono text-xs font-bold text-[#34252A] hover:text-[#6A1F35] transition-colors"
            >
              @{post.author?.handle || 'contributor'}
            </Link>

            {post.is_editorial && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#6A1F35] px-2 py-0.5 font-mono text-[9px] uppercase font-bold text-[#FAF6EF] shadow-xs">
                <ShieldCheck className="h-3 w-3" />
                Editorial
              </span>
            )}

            {post.community && (
              <>
                <span className="text-[#34252A]/60 font-mono text-xs">in</span>
                <Link
                  to={`/communities/${post.community.slug}`}
                  className="font-mono text-xs text-[#6A1F35] font-semibold hover:underline"
                >
                  {post.community.name}
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] text-[#34252A]/60 mt-1">
            <span>
              {new Date(post.created_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200" title="Protected under PostgreSQL Row Level Security">
              <Lock className="h-2.5 w-2.5" />
              RLS Verified
            </span>
          </div>
        </div>

        {/* Author Delete Action */}
        {isAuthor && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete your post"
            className="text-[#34252A]/50 hover:text-red-700 transition-colors p-1 cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Body: strictly Plain Text (POST-05) */}
      <div className="text-sm text-[#34252A] whitespace-pre-wrap leading-relaxed">
        {post.body}
      </div>

      {/* Media Image with safe referrerpolicy */}
      {post.media_url && (
        <div className="space-y-1.5">
          <div className="overflow-hidden rounded-xl border border-[#E0D4C5] bg-[#F0E7DA] max-h-96 flex items-center justify-center">
            <img
              src={post.media_url}
              alt={post.media_credit || 'Cultural documentation'}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-auto object-cover max-h-96"
            />
          </div>
          {post.media_credit && (
            <p className="font-mono text-[10px] text-[#34252A]/60 italic truncate">
              Photo: {post.media_credit}
            </p>
          )}
        </div>
      )}

      {/* Source line (CULT-03) */}
      {post.source_url && (
        <div className="flex items-center gap-1.5 font-mono text-xs text-[#34252A]/70 pt-1">
          <span>Source:</span>
          <a
            href={post.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#6A1F35] font-medium hover:underline"
          >
            <span>{sourceHost}</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      {/* Tags Stickers */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[#E0D4C5]">
          {post.tags.map((tag) => (
            <TagSticker
              key={tag.id}
              id={tag.id}
              name={tag.name}
              slug={tag.slug}
              kind={tag.kind}
              size="sm"
            />
          ))}
        </div>
      )}

      {/* Actions / Reactions Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-[#E0D4C5] font-mono text-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleLike}
            className={`neu-pill flex items-center gap-1.5 px-3 py-1 rounded-full border cursor-pointer transition-all ${
              isLiked
                ? 'bg-[#6A1F35] text-[#FAF6EF] border-[#511528] shadow-xs'
                : 'bg-[#F0E7DA] text-[#34252A] border-[#E0D4C5] hover:text-[#6A1F35]'
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${isLiked ? 'fill-[#FAF6EF] text-[#FAF6EF]' : ''}`} />
            <span>{likesCount}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className={`neu-pill flex items-center gap-1.5 px-3 py-1 rounded-full border cursor-pointer transition-all ${
              isSaved
                ? 'bg-[#B08A50] text-[#FAF6EF] border-[#B08A50] shadow-xs'
                : 'bg-[#F0E7DA] text-[#34252A] border-[#E0D4C5] hover:text-[#B08A50]'
            }`}
          >
            <Bookmark className={`h-3.5 w-3.5 ${isSaved ? 'fill-[#FAF6EF] text-[#FAF6EF]' : ''}`} />
            <span>{savesCount}</span>
          </button>
        </div>

        {user && (
          <button
            type="button"
            onClick={handleHide}
            title="Hide this post from your feed"
            className="neu-pill flex items-center gap-1 text-[#34252A]/60 hover:text-[#34252A] px-2.5 py-1 rounded-full border border-[#E0D4C5] bg-[#F0E7DA] cursor-pointer transition-all"
          >
            <EyeOff className="h-3.5 w-3.5" />
            <span className="text-[11px]">Not interested</span>
          </button>
        )}
      </div>
    </article>
  )
}
