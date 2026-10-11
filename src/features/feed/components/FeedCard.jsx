import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Heart,
  Bookmark,
  EyeOff,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Lock,
} from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  togglePostReaction,
  hidePost,
  deletePost,
} from '@/features/feed/services/feedService'
import { TagSticker } from '@/components/ui/TagSticker'
import { WhyStamp } from './WhyStamp'
import { RelevancePrompt } from './RelevancePrompt'
import { shouldShowRelevancePrompt } from '../lib/relevance'
import { useImpression } from '../hooks/useImpression'

export function FeedCard({ post, onDelete, onHide }) {
  const { user } = useAuth()
  const impressionRef = useImpression(post.id)

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
      <article className="bg-white rounded-2xl border border-[#E0D4C5]/80 overflow-hidden shadow-[0_2px_12px_-2px_rgba(52,37,42,0.05)] hover:shadow-md transition-all space-y-3.5 p-5">
        {/* WhyStamp badge & author header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#E0D4C5]/40 pb-3">
          <div className="space-y-1">
            {post.why && post.why.length > 0 && (
              <div className="mb-1.5">
                <WhyStamp why={post.why} isExplore={post.isExplore} />
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to={`/u/${post.author?.handle || 'member'}`}
                className="font-serif text-sm font-bold text-[#34252A] hover:text-[#6A1F35] transition-colors"
              >
                @{post.author?.handle || 'contributor'}
              </Link>

              {post.is_editorial && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#6A1F35] px-2 py-0.5 text-[9px] uppercase font-bold text-white">
                  <ShieldCheck className="h-3 w-3" />
                  Editorial
                </span>
              )}

              {post.community && (
                <>
                  <span className="text-[#75666B] text-xs">
                    in
                  </span>
                  <Link
                    to={`/communities/${post.community.slug}`}
                    className="text-xs font-semibold text-[#6A1F35] hover:underline"
                  >
                    {post.community.name}
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#75666B]">
              <span>
                {new Date(post.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1 text-[#6A1F35] bg-[#FAF6EF] px-1.5 py-0.5 rounded-full border border-[#E0D4C5]" title="Protected under PostgreSQL Row Level Security">
                <Lock className="h-2.5 w-2.5" />
                RLS Verified
              </span>
            </div>
          </div>

          {isAuthor && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              title="Delete your post"
              className="text-[#75666B] hover:text-[#6A1F35] transition-colors p-1"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Media with safe referrerpolicy and rounded borders */}
        {post.media_url && (
          <div className="space-y-1.5">
            <div className="overflow-hidden rounded-xl border border-[#E0D4C5]/60 bg-[#F0E7DA] max-h-96 flex items-center justify-center">
              <img
                src={post.media_url}
                alt={post.media_credit || 'Cultural documentation'}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover max-h-96 hover:scale-101 transition-transform"
              />
            </div>
            {post.media_credit && (
              <p className="text-[10px] text-[#75666B] italic truncate">
                Photo: {post.media_credit}
              </p>
            )}
          </div>
        )}

        {/* Body (strictly plain text) */}
        <div className="text-sm text-[#34252A] whitespace-pre-wrap leading-relaxed font-sans">
          {post.body}
        </div>

        {/* Source citation */}
        {post.source_url && (
          <div className="flex items-center gap-1.5 text-xs text-[#75666B] pt-1">
            <span>Source:</span>
            <a
              href={post.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#6A1F35] hover:underline"
            >
              <span>{sourceHost}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

        {/* Tag Stickers */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#E0D4C5]/40">
            {post.tags.map((tag) => (
              <Link key={tag.id} to={`/c/${tag.slug}`}>
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

        {/* Reactions bar */}
        <div className="flex items-center justify-between pt-2 border-t border-[#E0D4C5]/40 text-xs text-[#75666B]">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleLike}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors ${
                isLiked
                  ? 'text-[#6A1F35] font-bold bg-[#FAF6EF]'
                  : 'hover:text-[#6A1F35] hover:bg-[#FAF6EF]'
              }`}
            >
              <Heart
                className={`h-4 w-4 ${isLiked ? 'fill-[#6A1F35] text-[#6A1F35]' : 'text-[#6A1F35]'}`}
              />
              <span>{likesCount}</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors ${
                isSaved
                  ? 'text-[#B08A50] font-bold bg-[#FAF6EF]'
                  : 'hover:text-[#B08A50] hover:bg-[#FAF6EF]'
              }`}
            >
              <Bookmark
                className={`h-4 w-4 ${isSaved ? 'fill-[#B08A50] text-[#B08A50]' : 'text-[#75666B]'}`}
              />
              <span>{savesCount}</span>
            </button>
          </div>

          {user && (
            <button
              type="button"
              onClick={handleHide}
              title="Hide this post from your feed"
              className="flex items-center gap-1 hover:text-[#34252A] px-2.5 py-1 rounded-full hover:bg-[#FAF6EF] transition-colors"
            >
              <EyeOff className="h-3.5 w-3.5" />
              <span className="text-[11px]">Not interested</span>
            </button>
          )}
        </div>
      </article>
    </div>
  )
}
