import React, { useState } from 'react'
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
import { WhyStamp } from './WhyStamp'
import { RelevancePrompt } from './RelevancePrompt'
import { shouldShowRelevancePrompt } from '../lib/relevance'
import { useImpression } from '../hooks/useImpression'
import { getThreadColor } from '@/features/communities/threadColors'

export function FeedCard({ post, onDelete, onHide }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const impressionRef = useImpression(post.id)

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
  const topTagKind = post.tags?.[0]?.kind

  // Toggle Like with optimistic rollback via feedService
  const handleLike = async () => {
    if (!user) return
    const prevLiked = isLiked
    const prevCount = likesCount

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

  // Author-only delete via feedService
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

  let sourceHost = ''
  if (post.source_url) {
    try {
      sourceHost = new URL(post.source_url).hostname.replace('www.', '')
    } catch {
      sourceHost = 'source'
    }
  }

  const showRelevance = user
    ? shouldShowRelevancePrompt(user.id, post.id)
    : false

  return (
    <div ref={impressionRef} className="relative group">
      {/* Top Thread Accent Stripe */}
      <div
        className="h-1.5 w-full rounded-t-[var(--radius)]"
        style={{ backgroundColor: getThreadColor(topTagKind) }}
      />

      <article className="border border-[var(--ink)] border-t-0 bg-[var(--paper-2)] p-5 md:p-6 shadow-[var(--shadow-hard)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 space-y-4">
        {/* WhyStamp badge & author header */}
        <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] pb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Author Avatar */}
            <Link
              to={`/u/${post.author?.handle || 'member'}`}
              className="h-9 w-9 rounded-full border border-[var(--ink)] bg-[var(--paper)] shrink-0 overflow-hidden flex items-center justify-center shadow-[1px_1px_0_var(--ink)] hover:opacity-90 transition-opacity"
            >
              {post.author?.avatar_url ? (
                <img
                  src={post.author.avatar_url}
                  alt={post.author.handle || 'Author'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-mono text-xs font-bold text-[var(--clay)] uppercase">
                  {(post.author?.handle || 'A').slice(0, 2)}
                </span>
              )}
            </Link>

            <div className="space-y-1 min-w-0 flex-1">
              {post.why && post.why.length > 0 && (
                <div className="mb-1">
                  <WhyStamp why={post.why} isExplore={post.isExplore} />
                </div>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  to={`/u/${post.author?.handle || 'member'}`}
                  className="font-mono text-xs font-bold text-[var(--ink)] hover:text-[var(--clay)] transition-colors flex items-center gap-1.5"
                >
                  <span>{post.author?.display_name || `@${post.author?.handle || 'contributor'}`}</span>
                  {post.author?.display_name && (
                    <span className="text-[11px] font-normal text-[var(--ink-2)]">
                      @{post.author?.handle}
                    </span>
                  )}
                </Link>

                {post.is_editorial && (
                  <span className="inline-flex items-center gap-1 rounded bg-[var(--clay)] px-1.5 py-0.5 font-mono text-[9px] uppercase font-bold text-[var(--paper)]">
                    <ShieldCheck className="h-3 w-3" />
                    Editorial
                  </span>
                )}

                {post.community && (
                  <>
                    <span className="text-[var(--ink-2)] font-mono text-xs">
                      in
                    </span>
                    <Link
                      to={`/communities/${post.community.slug}`}
                      className="font-mono text-xs text-[var(--clay)] font-semibold hover:underline"
                    >
                      {post.community.name}
                    </Link>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 font-mono text-[10px] text-[var(--ink-2)]">
                <span>
                  {new Date(post.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-0.5 text-emerald-800 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200" title="Protected under PostgreSQL Row Level Security">
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
                className="flex items-center gap-1 border border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)] px-2.5 py-1 font-mono text-[11px] font-bold uppercase rounded shadow-[1px_1px_0_var(--ink)] hover:bg-[var(--paper-2)] transition-all"
              >
                <Mic className="h-3 w-3 text-[var(--clay)]" />
                <span>Author Talk</span>
              </button>
            )}

            {!isAuthor && post.author_id && (
              <button
                type="button"
                onClick={handleDiscussWithAuthor}
                title="Discuss this topic directly with author"
                className="flex items-center gap-1 border border-[var(--clay)] bg-[var(--paper)] text-[var(--clay)] px-2.5 py-1 font-mono text-[11px] font-bold uppercase rounded shadow-[1px_1px_0_var(--clay)] hover:bg-[var(--clay)] hover:text-[var(--paper)] transition-all"
              >
                <MessageSquare className="h-3 w-3" />
                <span>Discuss</span>
              </button>
            )}

            {isAuthor && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                title="Delete your post"
                className="text-[var(--ink-2)] hover:text-red-600 transition-colors p-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Body (strictly plain text) */}
        <div className="text-sm text-[var(--ink)] whitespace-pre-wrap leading-relaxed">
          {post.body}
        </div>

        {/* Media with safe referrerpolicy */}
        {post.media_url && (
          <div className="space-y-1.5">
            <div className="overflow-hidden border border-[var(--line)] bg-[var(--paper)] max-h-96 flex items-center justify-center">
              <img
                src={post.media_url}
                alt={post.media_credit || 'Cultural documentation'}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover max-h-96"
              />
            </div>
            {post.media_credit && (
              <p className="font-mono text-[10px] text-[var(--ink-2)] italic truncate">
                Photo: {post.media_credit}
              </p>
            )}
          </div>
        )}

        {/* Source citation */}
        {post.source_url && (
          <div className="flex items-center gap-1.5 font-mono text-xs text-[var(--ink-2)] pt-1">
            <span>Source:</span>
            <a
              href={post.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[var(--clay)] hover:underline"
            >
              <span>{sourceHost}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

        {/* Tag Stickers */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[var(--line)]">
            {post.tags.map((tag, idx) => (
              <Link key={`${post.id}-tag-${tag.id || tag.slug || idx}`} to={`/c/${tag.slug}`}>
                <TagSticker
                  id={tag.id}
                  name={tag.name}
                  slug={tag.slug}
                  kind={tag.kind}
                  size="sm"
                />
              </Link>
            ))}
          </div>
        )}

        {/* Relevance prompt (10% deterministic) */}
        {showRelevance && user && (
          <div className="pt-2">
            <RelevancePrompt userId={user.id} postId={post.id} />
          </div>
        )}

        {/* Reactions & Social Interaction bar */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--line)] font-mono text-xs">
          <div className="flex items-center gap-3 md:gap-5 flex-wrap">
            {/* Like Button */}
            <button
              type="button"
              onClick={handleLike}
              className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${
                isLiked
                  ? 'text-[var(--clay)] font-bold'
                  : 'text-[var(--ink-2)] hover:text-[var(--ink)]'
              }`}
            >
              <Heart
                className={`h-4 w-4 ${isLiked ? 'fill-[var(--clay)] text-[var(--clay)]' : ''}`}
              />
              <span>{likesCount}</span>
            </button>

            {/* Comment Button */}
            <button
              type="button"
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${
                showComments
                  ? 'text-[var(--clay)] font-bold'
                  : 'text-[var(--ink-2)] hover:text-[var(--ink)]'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>{commentsCount}</span>
            </button>

            {/* Share Button */}
            <button
              type="button"
              onClick={handleShare}
              className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${
                copiedLink ? 'text-emerald-700 font-bold' : 'text-[var(--ink-2)] hover:text-[var(--ink)]'
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
              className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${
                isSaved
                  ? 'text-[var(--saffron)] font-bold'
                  : 'text-[var(--ink-2)] hover:text-[var(--ink)]'
              }`}
            >
              <Bookmark
                className={`h-4 w-4 ${isSaved ? 'fill-[var(--saffron)] text-[var(--saffron)]' : ''}`}
              />
              <span>{savesCount}</span>
            </button>
          </div>

          {user && (
            <button
              type="button"
              onClick={handleHide}
              title="Hide this post from your feed"
              className="flex items-center gap-1 text-[var(--ink-2)] hover:text-[var(--ink)] px-2 py-1 transition-colors"
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
    </div>
  )
}
