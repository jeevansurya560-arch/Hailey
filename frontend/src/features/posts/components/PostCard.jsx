import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Heart,
  Bookmark,
  EyeOff,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Lock,
  MessageSquare,
  Share2,
  Check,
  Mic,
} from 'lucide-react'
import { AuthorTalkModal } from '@/features/profile/components/AuthorTalkModal'
import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  togglePostReaction,
  hidePost,
  deletePost,
} from '@/features/feed/services/feedService'
import { recordPostShare } from '@/features/posts/services/postInteractionService'
import { PostCommentsSection } from '@/features/posts/components/PostCommentsSection'
import { TagSticker } from '@/components/ui/TagSticker'

export function PostCard({ post, onDelete, onHide }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Optimistic reaction states
  const [isLiked, setIsLiked] = useState(post.reactions?.isLiked ?? false)
  const [likesCount, setLikesCount] = useState(post.reactions?.likesCount ?? 0)
  const [isSaved, setIsSaved] = useState(post.reactions?.isSaved ?? false)
  const [savesCount, setSavesCount] = useState(post.reactions?.savesCount ?? 0)
  const [commentsCount, setCommentsCount] = useState(post.reactions?.commentsCount ?? 0)
  const [sharesCount, setSharesCount] = useState(post.reactions?.sharesCount ?? 0)
  const [showComments, setShowComments] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [isAuthorTalkOpen, setIsAuthorTalkOpen] = useState(false)
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

  // Share post with Web Share API or clipboard link fallback (SHARE-01)
  const handleShare = async () => {
    const postUrl = `${window.location.origin}/post/${post.id}`
    const shareData = {
      title: 'Hailey Cultural Dispatch',
      text: post.body?.slice(0, 100) + '...',
      url: postUrl,
    }

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
        setSharesCount((prev) => prev + 1)
        await recordPostShare({ postId: post.id, userId: user?.id, platform: 'web_share' })
      } else {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(postUrl)
        }
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 2500)
        setSharesCount((prev) => prev + 1)
        await recordPostShare({ postId: post.id, userId: user?.id, platform: 'link' })
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(postUrl)
          setCopiedLink(true)
          setTimeout(() => setCopiedLink(false), 2500)
        }
      }
    }
  }

  // Navigate to messages to discuss with author
  const handleDiscussWithAuthor = () => {
    if (!user) {
      navigate('/login')
      return
    }
    navigate(`/messages?with=${post.author_id}&postId=${post.id}`)
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
    <article className="bg-white rounded-2xl border border-[#E0D4C5]/80 p-5 md:p-6 neu-card hover:border-[#6A1F35]/35 transition-all space-y-4">
      {/* Header / Author line */}
      <div className="flex items-start justify-between gap-3 border-b border-[#E0D4C5]/60 pb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Author Avatar */}
          <Link
            to={`/u/${post.author?.handle || 'member'}`}
            className="h-10 w-10 rounded-full border border-[#E0D4C5] bg-[#FAF6EF] shrink-0 overflow-hidden flex items-center justify-center shadow-xs hover:opacity-90 transition-opacity"
          >
            {post.author?.avatar_url ? (
              <img
                src={post.author.avatar_url}
                alt={post.author.handle || 'Author'}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="font-serif text-sm font-bold text-[#6A1F35] uppercase">
                {(post.author?.handle || 'A').slice(0, 2)}
              </span>
            )}
          </Link>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to={`/u/${post.author?.handle || 'member'}`}
                className="font-serif text-sm font-bold text-[#34252A] hover:text-[#6A1F35] transition-colors flex items-center gap-1.5"
              >
                <span>{post.author?.display_name || `@${post.author?.handle || 'contributor'}`}</span>
                {post.author?.display_name && (
                  <span className="text-xs font-sans font-normal text-[#75666B]">
                    @{post.author?.handle}
                  </span>
                )}
              </Link>

              {post.is_editorial && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#6A1F35] px-2 py-0.5 text-[9px] uppercase font-bold text-white shadow-xs">
                  <ShieldCheck className="h-3 w-3" />
                  Editorial
                </span>
              )}

              {post.community && (
                <>
                  <span className="text-[#75666B] font-sans text-xs">in</span>
                  <Link
                    to={`/communities/${post.community.slug}`}
                    className="font-serif text-xs text-[#6A1F35] font-semibold hover:underline"
                  >
                    {post.community.name}
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 font-sans text-[11px] text-[#75666B] mt-0.5">
              <span>
                {new Date(post.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px] font-semibold" title="Protected under PostgreSQL Row Level Security">
                <Lock className="h-2.5 w-2.5" />
                RLS Verified
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {post.author_id && (
            <button
              type="button"
              onClick={() => setIsAuthorTalkOpen(true)}
              title="Open Author Talk discovery"
              className="flex items-center gap-1.5 border border-[#E0D4C5] bg-[#FAF6EF] text-[#6A1F35] hover:bg-[#F0E7DA] px-3 py-1 text-xs font-semibold rounded-full shadow-xs transition-all"
            >
              <Mic className="h-3 w-3" />
              <span>Author Talk</span>
            </button>
          )}

          {!isAuthor && post.author_id && (
            <button
              type="button"
              onClick={handleDiscussWithAuthor}
              title="Discuss this topic directly with author"
              className="flex items-center gap-1.5 bg-[#6A1F35] text-white hover:bg-[#511528] px-3.5 py-1 text-xs font-semibold rounded-full shadow-xs transition-all"
            >
              <MessageSquare className="h-3 w-3" />
              <span>Discuss</span>
            </button>
          )}

          {/* Author Delete Action */}
          {isAuthor && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              title="Delete your post"
              className="text-[#75666B] hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Body: strictly Plain Text (POST-05) */}
      <div className="text-sm sm:text-base text-[#34252A] whitespace-pre-wrap leading-relaxed font-sans">
        {post.body}
      </div>

      {/* Media Image with safe referrerpolicy */}
      {post.media_url && (
        <div className="space-y-1.5">
          <div className="rounded-xl overflow-hidden border border-[#E0D4C5]/80 bg-[#FAF6EF] max-h-96 flex items-center justify-center">
            <img
              src={post.media_url}
              alt={post.media_credit || 'Cultural documentation'}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-auto object-cover max-h-96"
            />
          </div>
          {post.media_credit && (
            <p className="font-sans text-[11px] text-[#75666B] italic truncate">
              Photo: {post.media_credit}
            </p>
          )}
        </div>
      )}

      {/* Source line (CULT-03) */}
      {post.source_url && (
        <div className="flex items-center gap-1.5 font-sans text-xs text-[#75666B] pt-1">
          <span>Source:</span>
          <a
            href={post.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#6A1F35] hover:underline font-semibold"
          >
            <span>{sourceHost}</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      {/* Tags Stickers */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#E0D4C5]/60">
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
      <div className="flex items-center justify-between pt-3 border-t border-[#E0D4C5]/60 text-xs text-[#75666B]">
        <div className="flex items-center gap-3 md:gap-5 flex-wrap">
          {/* Like Button */}
          <button
            type="button"
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors ${
              isLiked
                ? 'text-[#6A1F35] bg-[#6A1F35]/10 font-bold'
                : 'hover:text-[#6A1F35] hover:bg-[#FAF6EF]'
            }`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-[#6A1F35] text-[#6A1F35]' : ''}`} />
            <span>{likesCount}</span>
          </button>

          {/* Comment Button */}
          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors ${
              showComments
                ? 'text-[#6A1F35] bg-[#6A1F35]/10 font-bold'
                : 'hover:text-[#6A1F35] hover:bg-[#FAF6EF]'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>{commentsCount}</span>
          </button>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors ${
              copiedLink ? 'text-emerald-700 bg-emerald-50 font-bold' : 'hover:text-[#6A1F35] hover:bg-[#FAF6EF]'
            }`}
            title="Copy shareable link to clipboard"
          >
            {copiedLink ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
            <span>{copiedLink ? 'Copied!' : sharesCount}</span>
          </button>

          {/* Save / Bookmark Button */}
          <button
            type="button"
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors ${
              isSaved
                ? 'text-[#B08A50] bg-[#B08A50]/10 font-bold'
                : 'hover:text-[#B08A50] hover:bg-[#FAF6EF]'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-[#B08A50] text-[#B08A50]' : ''}`} />
            <span>{savesCount}</span>
          </button>
        </div>

        {user && (
          <button
            type="button"
            onClick={handleHide}
            title="Hide this post from your feed"
            className="flex items-center gap-1 text-[#75666B] hover:text-[#34252A] px-2 py-1 rounded-full hover:bg-[#FAF6EF] transition-colors"
          >
            <EyeOff className="h-3.5 w-3.5" />
            <span className="text-[11px] hidden sm:inline">Not interested</span>
          </button>
        )}
      </div>

      {/* Expandable Comments & Observations Section */}
      {showComments && (
        <PostCommentsSection
          postId={post.id}
          onCommentAdded={() => setCommentsCount((c) => c + 1)}
        />
      )}

      {/* Author Talk Discovery Modal */}
      {post.author_id && (
        <AuthorTalkModal
          authorId={post.author_id}
          author={post.author}
          isOpen={isAuthorTalkOpen}
          onClose={() => setIsAuthorTalkOpen(false)}
        />
      )}
    </article>
  )
}
