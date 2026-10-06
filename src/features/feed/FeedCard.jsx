import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Heart,
  Bookmark,
  EyeOff,
  Trash2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '@/features/auth/useAuth'
import { supabase } from '@/lib/supabase'
import { TagSticker } from '@/components/TagSticker'
import { WhyStamp } from '@/components/WhyStamp'
import { RelevancePrompt } from '@/components/RelevancePrompt'
import { shouldShowRelevancePrompt } from '@/lib/relevance'
import { useImpression } from '@/features/feed/useImpression'
import { getThreadColor } from '@/lib/threadColors'

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
  const topTagKind = post.tags?.[0]?.kind

  // Toggle Like
  const handleLike = async () => {
    if (!user) return
    const prevLiked = isLiked
    const prevCount = likesCount

    setIsLiked(!prevLiked)
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1)

    if (prevLiked) {
      const { error } = await supabase
        .from('post_reactions')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', post.id)
        .eq('kind', 'like')
      if (error) {
        setIsLiked(prevLiked)
        setLikesCount(prevCount)
      }
    } else {
      const { error } = await supabase
        .from('post_reactions')
        .insert({ user_id: user.id, post_id: post.id, kind: 'like' })
      if (error) {
        setIsLiked(prevLiked)
        setLikesCount(prevCount)
      }
    }
  }

  // Toggle Save
  const handleSave = async () => {
    if (!user) return
    const prevSaved = isSaved
    const prevCount = savesCount

    setIsSaved(!prevSaved)
    setSavesCount(prevSaved ? prevCount - 1 : prevCount + 1)

    if (prevSaved) {
      const { error } = await supabase
        .from('post_reactions')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', post.id)
        .eq('kind', 'save')
      if (error) {
        setIsSaved(prevSaved)
        setSavesCount(prevCount)
      }
    } else {
      const { error } = await supabase
        .from('post_reactions')
        .insert({ user_id: user.id, post_id: post.id, kind: 'save' })
      if (error) {
        setIsSaved(prevSaved)
        setSavesCount(prevCount)
      }
    }
  }

  // Hide post
  const handleHide = async () => {
    if (!user) return
    setIsHidden(true)
    onHide?.(post.id)

    await supabase
      .from('post_reactions')
      .insert({ user_id: user.id, post_id: post.id, kind: 'hide' })
  }

  // Author-only delete
  const handleDelete = async () => {
    if (!isAuthor || isDeleting) return
    if (!window.confirm('Delete this cultural dispatch?')) return

    setIsDeleting(true)
    const { error } = await supabase.from('posts').delete().eq('id', post.id)
    if (!error) {
      onDelete?.(post.id)
    } else {
      setIsDeleting(false)
      alert('Failed to delete post: ' + error.message)
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
          <div className="space-y-1">
            {post.why && post.why.length > 0 && (
              <div className="mb-1.5">
                <WhyStamp why={post.why} isExplore={post.isExplore} />
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to={`/u/${post.author?.handle || 'member'}`}
                className="font-mono text-xs font-bold text-[var(--ink)] hover:text-[var(--clay)] transition-colors"
              >
                @{post.author?.handle || 'contributor'}
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

            <span className="font-mono text-[10px] text-[var(--ink-2)]">
              {new Date(post.created_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>

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
        <div className="flex items-center justify-between pt-2 border-t border-[var(--line)] font-mono text-xs">
          <div className="flex items-center gap-4">
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
              <span className="text-[11px]">Not interested</span>
            </button>
          )}
        </div>
      </article>
    </div>
  )
}
