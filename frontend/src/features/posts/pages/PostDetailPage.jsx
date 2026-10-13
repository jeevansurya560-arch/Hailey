import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Loader2,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MapPin,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Send,
} from 'lucide-react'
import { fetchPostById, togglePostReaction } from '@/features/feed/services/feedService'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { parseCulturalPost } from '@/features/culture/components/CulturalPostCard'
import { PostCommentsSection } from '@/features/posts/components/PostCommentsSection'

export function PostDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [commentText, setCommentText] = useState('')
  const [activeTab, setActiveTab] = useState('details') // 'details' | 'comments'

  const { data: post, isLoading, isError, error } = useQuery({
    queryKey: ['post_detail', id, user?.id],
    queryFn: () => fetchPostById({ postId: id, currentUserId: user?.id }),
    enabled: !!id,
  })

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: () => {
      if (!user) {
        navigate('/login')
        return
      }
      return togglePostReaction({
        userId: user.id,
        postId: post.id,
        kind: 'like',
        isCurrentlyActive: post.reactions?.isLiked,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post_detail', id] })
    },
  })

  // Bookmark mutation
  const saveMutation = useMutation({
    mutationFn: () => {
      if (!user) {
        navigate('/login')
        return
      }
      return togglePostReaction({
        userId: user.id,
        postId: post.id,
        kind: 'save',
        isCurrentlyActive: post.reactions?.isSaved,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post_detail', id] })
    },
  })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#6A1F35]" />
        <p className="font-mono text-xs uppercase tracking-widest text-[#B08A50] font-semibold">
          Loading cultural dispatch...
        </p>
      </div>
    )
  }

  if (isError || !post) {
    return (
      <div className="neu-card rounded-2xl bg-white border border-[#E0D4C5] p-10 text-center space-y-4 max-w-lg mx-auto my-12">
        <h2 className="font-serif text-2xl font-bold text-[#34252A]">Dispatch Not Found</h2>
        <p className="text-xs text-[#75666B]">
          {error?.message || 'This cultural record could not be retrieved from the database.'}
        </p>
        <Link
          to="/explore"
          className="neu-pill bg-[#6A1F35] text-white px-5 py-2.5 rounded-full text-xs font-medium inline-flex items-center gap-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to Explore</span>
        </Link>
      </div>
    )
  }

  const {
    title,
    description,
    location,
    category,
    isVideo,
    duration,
  } = parseCulturalPost(post)

  const isDemo = Boolean(post.is_demo)
  const authorName =
    post.author?.display_name || post.author?.handle || (isDemo ? 'Cultural Archivist' : 'Hailey Explorer')
  const authorHandle = post.author?.handle || (isDemo ? 'archivist' : 'user')
  const authorAvatar =
    post.author?.avatar_url ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authorName)}&backgroundColor=6A1F35&textColor=ffffff`

  const likesCount = post.reactions?.likesCount ?? 42
  const commentsCount = post.reactions?.commentsCount ?? 8
  const isLiked = Boolean(post.reactions?.isLiked)
  const isSaved = Boolean(post.reactions?.isSaved)
  const mediaUrl = post.media_url || '/photos/culture_01.jpeg'

  const formattedDate = post.created_at
    ? new Date(post.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent Archive'

  return (
    <div className="space-y-6">
      {/* ── Top Navigation Bar ── */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/explore')}
          className="neu-pill inline-flex items-center gap-2 text-xs font-semibold text-[#34252A] hover:text-[#6A1F35] bg-white border border-[#E0D4C5] px-4 py-2 rounded-full cursor-pointer transition-all shadow-xs"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Explore</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title, url: window.location.href }).catch(() => {})
              } else {
                navigator.clipboard?.writeText(window.location.href)
              }
            }}
            className="neu-pill p-2 rounded-full bg-white border border-[#E0D4C5] text-[#75666B] hover:text-[#6A1F35] transition-colors"
            title="Share dispatch"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => saveMutation.mutate()}
            className={`neu-pill p-2 rounded-full bg-white border border-[#E0D4C5] transition-colors ${
              isSaved ? 'text-[#6A1F35]' : 'text-[#75666B] hover:text-[#6A1F35]'
            }`}
            title="Bookmark dispatch"
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── 60/40 Editorial Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Media Gallery (approx 62%) */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-[#F0E7DA] border border-[#E0D4C5]/80 shadow-md">
            <img
              src={mediaUrl}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/photos/culture_01.jpeg'
              }}
            />

            {/* Video duration tag if video */}
            {isVideo && (
              <div className="absolute bottom-4 right-4 bg-black/75 backdrop-blur-xs text-white text-xs font-mono font-medium px-2 py-1 rounded-md">
                Video · {duration}
              </div>
            )}

            {/* Cultural badge */}
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs border border-[#E0D4C5]/70 text-[#6A1F35] text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-[#B08A50]" />
              <span>{category}</span>
            </div>
          </div>

          {/* Media Provenance / Attribution Banner */}
          {post.media_credit && (
            <div className="bg-white/80 border border-[#E0D4C5]/70 rounded-2xl p-4 flex items-center justify-between text-xs text-[#75666B]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#00A389]" />
                <span>
                  <strong>Provenance:</strong> {post.media_credit}
                </span>
              </div>
              {post.source_url && (
                <a
                  href={post.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6A1F35] hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Academic Source</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Cultural Details & Engagement (approx 38%) */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-5 bg-white rounded-3xl border border-[#E0D4C5]/80 p-6 md:p-8 neu-card">
          {/* Author Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E0D4C5]/40">
            <Link to={`/u/${authorHandle}`} className="flex items-center gap-3 group">
              <img
                src={authorAvatar}
                alt={authorName}
                className="h-10 w-10 rounded-full object-cover border border-[#E0D4C5]"
              />
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-bold text-[#34252A] group-hover:text-[#6A1F35] transition-colors">
                    {authorName}
                  </span>
                  {(post.author?.is_verified || isDemo) && (
                    <CheckCircle2 className="h-4 w-4 text-[#0284C7] fill-current" />
                  )}
                  {isDemo && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F0E7DA] text-[#75666B] border border-[#E0D4C5]">
                      Demo Archive
                    </span>
                  )}
                </div>
                <span className="text-xs text-[#75666B]">@{authorHandle}</span>
              </div>
            </Link>

            <span className="text-xs font-mono text-[#75666B] flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-[#B08A50]" />
              <span>{formattedDate}</span>
            </span>
          </div>

          {/* Title & Location */}
          <div className="space-y-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#34252A] leading-tight">
              {title}
            </h1>

            <div className="flex items-center gap-1.5 text-xs text-[#B08A50] font-medium">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span>{location}</span>
            </div>
          </div>

          {/* Full Description */}
          <div className="text-xs sm:text-sm text-[#34252A] leading-relaxed space-y-3 font-sans">
            <p>{description}</p>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {post.tags.map((t) => (
                <span
                  key={t.id || t.name}
                  className="bg-[#F0E7DA]/60 border border-[#E0D4C5]/70 text-[#6A1F35] text-[11px] font-medium px-2.5 py-0.5 rounded-full"
                >
                  #{t.name}
                </span>
              ))}
            </div>
          )}

          {/* Engagement Row */}
          <div className="pt-4 border-t border-[#E0D4C5]/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => likeMutation.mutate()}
                className={`neu-pill flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  isLiked
                    ? 'bg-[#6A1F35] text-white'
                    : 'bg-[#F0E7DA]/60 text-[#34252A] hover:bg-[#F0E7DA]'
                }`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{likesCount}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'comments' ? 'details' : 'comments')}
                className="neu-pill flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[#F0E7DA]/60 text-[#34252A] hover:bg-[#F0E7DA]"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{commentsCount}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => saveMutation.mutate()}
              className={`neu-pill p-2 rounded-full border transition-colors ${
                isSaved
                  ? 'border-[#6A1F35] text-[#6A1F35]'
                  : 'border-[#E0D4C5] text-[#75666B] hover:text-[#6A1F35]'
              }`}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Comments Section */}
          <div className="pt-4 border-t border-[#E0D4C5]/40 space-y-3">
            <PostCommentsSection
              postId={post.id}
              onCommentAdded={() => {
                queryClient.invalidateQueries({ queryKey: ['post_detail', id] })
                queryClient.invalidateQueries({ queryKey: ['explore_dispatches'] })
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostDetailPage
