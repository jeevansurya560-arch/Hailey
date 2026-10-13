import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MapPin,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Sparkles,
  CheckCircle2,
  Film,
} from 'lucide-react'
import { parseCulturalPost } from '../utils/postParsingUtils'

// Re-export for compatibility
export { parseCulturalPost }

export function CulturalPostCard({
  post,
  onLike,
  onSave,
  onShare,
  onCommentClick,
  onOpenViewer,
}) {
  const {
    title,
    description,
    location,
    category,
    isVideo,
    videoUrl,
    duration,
    timeAgo,
  } = parseCulturalPost(post)

  const isDemo = Boolean(post.is_demo)
  const authorName =
    post.author?.display_name || post.author?.handle || (isDemo ? 'Cultural Archivist' : 'Hailey Explorer')
  const authorHandle = post.author?.handle || (isDemo ? 'archivist' : 'user')
  const authorAvatar =
    post.author?.avatar_url ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authorName)}&backgroundColor=6A1F35&textColor=ffffff`

  const likesCount = post.reactions?.likesCount ?? (30 + (title.length * 7) % 450)
  const commentsCount = post.reactions?.commentsCount ?? (5 + (title.length * 3) % 40)
  const isLiked = Boolean(post.reactions?.isLiked)
  const isSaved = Boolean(post.reactions?.isSaved)

  const mediaUrl = post.media_url || '/photos/culture_01.jpeg'

  // Inline video states
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)

  const handleMouseEnter = () => {
    if (isVideo && videoUrl && videoRef.current) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
    }
  }

  const handleMouseLeave = () => {
    if (isVideo && videoUrl && videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const togglePlayPause = (e) => {
    e.stopPropagation()
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
    }
  }

  const toggleSound = (e) => {
    e.stopPropagation()
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleMediaClick = (e) => {
    if (onOpenViewer) {
      e.preventDefault()
      onOpenViewer(post)
    }
  }

  return (
    <article className="group bg-white rounded-2xl border border-[#E0D4C5]/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      {/* ── Media Header with Live Video Playback & Badges ── */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleMediaClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleMediaClick(e)
        }}
        className="block relative aspect-[16/10] overflow-hidden bg-[#1A1215] cursor-pointer"
        aria-label={`Open media viewer for ${title}`}
      >
        {/* Render HTML5 Video or Still Image */}
        {isVideo && videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            poster={mediaUrl}
            autoPlay
            muted={isMuted}
            loop
            playsInline
            preload="auto"
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          />
        ) : (
          <img
            src={mediaUrl}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = '/photos/culture_01.jpeg'
            }}
          />
        )}

        {/* Category Pill Tag */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs border border-[#E0D4C5]/70 text-[#6A1F35] text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs z-10">
          <Sparkles className="h-3 w-3 text-[#B08A50]" />
          <span>{category}</span>
        </div>

        {/* Video Badge / Timestamp Pill */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          {isVideo && (
            <span className="bg-[#6A1F35]/95 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-white/20 flex items-center gap-1 shadow-sm">
              <Film className="h-2.5 w-2.5 text-[#B08A50]" />
              <span>VIDEO</span>
            </span>
          )}
          <span className="bg-black/55 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-full">
            {timeAgo}
          </span>
        </div>

        {/* Video Controls Overlay */}
        {isVideo && videoUrl && (
          <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-center justify-between text-white z-10">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlayPause}
                className="h-7 w-7 rounded-full bg-black/60 hover:bg-black border border-white/30 flex items-center justify-center text-white cursor-pointer transition-colors shadow-sm"
                aria-label={isPlaying ? 'Pause' : 'Play'}
                title={isPlaying ? 'Pause' : 'Play preview'}
              >
                {isPlaying ? (
                  <Pause className="h-3.5 w-3.5 fill-current" />
                ) : (
                  <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={toggleSound}
                className="h-7 w-7 rounded-full bg-black/60 hover:bg-black border border-white/30 flex items-center justify-center text-white cursor-pointer transition-colors shadow-sm"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                title={isMuted ? 'Unmute audio' : 'Mute'}
              >
                {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              </button>

              <span className="text-[10px] font-mono font-medium text-white/90">
                {duration}
              </span>
            </div>

            <button
              type="button"
              onClick={handleMediaClick}
              className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold bg-white/20 hover:bg-white/30 backdrop-blur-xs px-2 py-1 rounded-full text-white cursor-pointer transition-colors"
              title="Open full immersive reel"
            >
              <Maximize2 className="h-3 w-3" />
              <span>Full Reel</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Card Content Body ── */}
      <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Author Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Link to={`/u/${authorHandle}`} className="shrink-0">
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="h-6 w-6 rounded-full object-cover border border-[#E0D4C5]"
                  onError={(e) => {
                    e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authorName)}&backgroundColor=6A1F35`
                  }}
                />
              </Link>
              <Link
                to={`/u/${authorHandle}`}
                className="text-xs font-semibold text-[#34252A] hover:text-[#6A1F35] transition-colors truncate flex items-center gap-1"
              >
                <span className="truncate">{authorName}</span>
                {(post.author?.is_verified || isDemo) && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#0284C7] fill-current shrink-0" />
                )}
              </Link>
            </div>

            {isDemo && (
              <span
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#F0E7DA] text-[#75666B] border border-[#E0D4C5]/80 shrink-0"
                title="Curated Demonstration Dispatch"
              >
                Demo Archive
              </span>
            )}
          </div>

          {/* Title */}
          <Link to={`/post/${post.id}`}>
            <h3 className="font-serif text-base font-bold text-[#34252A] group-hover:text-[#6A1F35] transition-colors leading-snug line-clamp-1">
              {title}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-xs text-[#75666B] leading-relaxed line-clamp-2">
            {description}
          </p>

          {/* Location */}
          <div className="flex items-center gap-1 text-[11px] text-[#75666B] font-medium pt-0.5">
            <MapPin className="h-3 w-3 text-[#B08A50] shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        </div>

        {/* ── Card Engagement Footer ── */}
        <div className="pt-2.5 border-t border-[#E0D4C5]/40 flex items-center justify-between text-xs text-[#75666B]">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onLike ? onLike(post) : null
              }}
              className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                isLiked ? 'text-[#6A1F35] font-semibold' : 'hover:text-[#6A1F35]'
              }`}
              title="Like dispatch"
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current text-[#6A1F35]' : ''}`} />
              <span>{likesCount}</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onCommentClick ? onCommentClick(post) : null
              }}
              className="flex items-center gap-1.5 hover:text-[#6A1F35] transition-colors cursor-pointer"
              title="Comments"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{commentsCount}</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onShare ? onShare(post) : null
              }}
              className="hover:text-[#6A1F35] transition-colors cursor-pointer"
              title="Share dispatch"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onSave ? onSave(post) : null
            }}
            className={`hover:text-[#6A1F35] transition-colors cursor-pointer ${
              isSaved ? 'text-[#6A1F35]' : ''
            }`}
            title="Save to collection"
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current text-[#6A1F35]' : ''}`} />
          </button>
        </div>
      </div>
    </article>
  )
}

export default CulturalPostCard
