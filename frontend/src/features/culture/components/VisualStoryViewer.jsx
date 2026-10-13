import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  CheckCircle2,
  MapPin,
  Sparkles,
  Send,
  Loader2,
  AlertCircle,
  User,
  Trash2,
} from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useQueryClient } from '@tanstack/react-query'
import { togglePostReaction } from '@/features/feed/services/feedService'
import { fetchPostComments, addPostComment, deletePostComment } from '@/features/posts/services/postInteractionService'
import { parseCulturalPost } from '../utils/postParsingUtils'

export function VisualStoryViewer({
  posts = [],
  initialPostId = null,
  story = null,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // 1. Normalize items array
  const items = React.useMemo(() => {
    if (Array.isArray(posts) && posts.length > 0) return posts
    if (story) return [story]
    return []
  }, [posts, story])

  // 2. Active index based on initialPostId
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (!initialPostId || items.length === 0) return 0
    const idx = items.findIndex((p) => p.id === initialPostId)
    return idx >= 0 ? idx : 0
  })

  useEffect(() => {
    if (initialPostId && items.length > 0) {
      const idx = items.findIndex((p) => p.id === initialPostId)
      if (idx >= 0) setCurrentIndex(idx)
    }
  }, [initialPostId, items])

  const activeItem = items[currentIndex] || items[0]

  // Media playback states
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [mediaLoaded, setMediaLoaded] = useState(false)
  const [mediaError, setMediaError] = useState(false)
  const videoRef = useRef(null)

  // Comments drawer state
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const [comments, setComments] = useState([])
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [commentInput, setCommentInput] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  // Local reaction states
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [isSaved, setIsSaved] = useState(false)
  const [commentsCount, setCommentsCount] = useState(0)

  // Navigation throttle ref
  const isNavigatingRef = useRef(false)
  const touchStartYRef = useRef(null)

  // Parse active item metadata
  const parsedMeta = React.useMemo(() => {
    if (!activeItem) return {}
    if (activeItem.title && activeItem.creator) {
      // Legacy story object
      return {
        title: activeItem.title,
        description: activeItem.description || '',
        location: activeItem.location || 'Living Heritage',
        category: activeItem.category || 'Visual Story',
        isVideo: Boolean(activeItem.is_video || activeItem.video_url),
        duration: activeItem.duration || '0:58',
        authorName: activeItem.creator,
        authorHandle: activeItem.creator?.toLowerCase().replace(/\s+/g, '_') || 'author',
        authorAvatar: activeItem.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(activeItem.creator)}&backgroundColor=6A1F35&textColor=ffffff`,
        mediaUrl: activeItem.thumbnail || '/photos/culture_24.jpeg',
        videoUrl: activeItem.video_url || null,
        likesCount: activeItem.likes || 120,
        commentsCount: activeItem.comments || 12,
        isDemo: true,
      }
    }

    // Standard cultural post
    const parsed = parseCulturalPost(activeItem)
    const authorName =
      activeItem.author?.display_name ||
      activeItem.author?.handle ||
      (activeItem.is_demo ? 'Cultural Archivist' : 'Hailey Explorer')
    const authorHandle = activeItem.author?.handle || (activeItem.is_demo ? 'archivist' : 'user')
    const authorAvatar =
      activeItem.author?.avatar_url ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authorName)}&backgroundColor=6A1F35&textColor=ffffff`

    const videoUrl = parsed.videoUrl || activeItem.video_url || null
    const isVideo = Boolean(parsed.isVideo || videoUrl)

    return {
      title: parsed.title,
      description: parsed.description,
      location: parsed.location,
      category: parsed.category,
      isVideo,
      duration: parsed.duration,
      authorName,
      authorHandle,
      authorAvatar,
      mediaUrl: activeItem.media_url || '/photos/culture_01.jpeg',
      videoUrl,
      likesCount: activeItem.reactions?.likesCount ?? (30 + (parsed.title.length * 7) % 450),
      commentsCount: activeItem.reactions?.commentsCount ?? (5 + (parsed.title.length * 3) % 40),
      isLiked: Boolean(activeItem.reactions?.isLiked),
      isSaved: Boolean(activeItem.reactions?.isSaved),
      isDemo: Boolean(activeItem.is_demo),
    }
  }, [activeItem])

  // Synchronize reactions when active post changes
  useEffect(() => {
    setIsLiked(Boolean(parsedMeta.isLiked))
    setLikesCount(parsedMeta.likesCount || 0)
    setIsSaved(Boolean(parsedMeta.isSaved))
    setCommentsCount(parsedMeta.commentsCount || 0)
    setMediaLoaded(false)
    setMediaError(false)
    setIsPlaying(true)
  }, [currentIndex, parsedMeta])

  // Fetch comments
  useEffect(() => {
    let isSubscribed = true
    if (isCommentsOpen && activeItem?.id) {
      setIsLoadingComments(true)
      fetchPostComments(activeItem.id)
        .then((data) => {
          if (isSubscribed) {
            setComments(data || [])
            setCommentsCount(data?.length || 0)
          }
        })
        .catch(() => {
          if (isSubscribed) setComments([])
        })
        .finally(() => {
          if (isSubscribed) setIsLoadingComments(false)
        })
    }
    return () => {
      isSubscribed = false
    }
  }, [isCommentsOpen, activeItem?.id])

  // Body scroll lock
  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])

  // Video playback lifecycle
  useEffect(() => {
    const video = videoRef.current
    if (!video || !parsedMeta.isVideo || !parsedMeta.videoUrl) return

    if (isPlaying) {
      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          setIsPlaying(false)
        })
      }
    } else {
      video.pause()
    }

    return () => {
      if (video) video.pause()
    }
  }, [currentIndex, isPlaying, parsedMeta.isVideo, parsedMeta.videoUrl])

  // Navigation handlers
  const canGoNext = items.length > 1 ? currentIndex < items.length - 1 : Boolean(hasNext)
  const canGoPrev = items.length > 1 ? currentIndex > 0 : Boolean(hasPrev)

  const goToNext = useCallback(() => {
    if (isNavigatingRef.current) return
    if (items.length > 1 && currentIndex < items.length - 1) {
      isNavigatingRef.current = true
      setCurrentIndex((prev) => prev + 1)
      setTimeout(() => {
        isNavigatingRef.current = false
      }, 350)
    } else if (onNext) {
      isNavigatingRef.current = true
      onNext()
      setTimeout(() => {
        isNavigatingRef.current = false
      }, 350)
    }
  }, [items.length, currentIndex, onNext])

  const goToPrev = useCallback(() => {
    if (isNavigatingRef.current) return
    if (items.length > 1 && currentIndex > 0) {
      isNavigatingRef.current = true
      setCurrentIndex((prev) => prev - 1)
      setTimeout(() => {
        isNavigatingRef.current = false
      }, 350)
    } else if (onPrev) {
      isNavigatingRef.current = true
      onPrev()
      setTimeout(() => {
        isNavigatingRef.current = false
      }, 350)
    }
  }, [items.length, currentIndex, onPrev])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose?.()
      } else if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        if (!isCommentsOpen) {
          e.preventDefault()
          goToNext()
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (!isCommentsOpen) {
          e.preventDefault()
          goToPrev()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, goToNext, goToPrev, isCommentsOpen])

  // Wheel navigation
  const handleWheel = useCallback(
    (e) => {
      if (isCommentsOpen) return
      if (Math.abs(e.deltaY) < 30) return

      if (e.deltaY > 0) {
        goToNext()
      } else {
        goToPrev()
      }
    },
    [goToNext, goToPrev, isCommentsOpen]
  )

  // Touch navigation
  const handleTouchStart = (e) => {
    if (isCommentsOpen) return
    touchStartYRef.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e) => {
    if (isCommentsOpen || touchStartYRef.current === null) return
    const touchEndY = e.changedTouches[0].clientY
    const deltaY = touchStartYRef.current - touchEndY
    touchStartYRef.current = null

    if (deltaY > 50) {
      goToNext()
    } else if (deltaY < -50) {
      goToPrev()
    }
  }

  // Like / Unlike action
  const handleLikeToggle = async () => {
    if (!user) {
      window.location.href = '/login'
      return
    }

    const previousLiked = isLiked
    const previousCount = likesCount

    setIsLiked(!previousLiked)
    setLikesCount(previousLiked ? Math.max(0, previousCount - 1) : previousCount + 1)

    try {
      await togglePostReaction({
        userId: user.id,
        postId: activeItem.id,
        kind: 'like',
        isCurrentlyActive: previousLiked,
      })
      queryClient.invalidateQueries({ queryKey: ['explore_dispatches'] })
      queryClient.invalidateQueries({ queryKey: ['post_detail', activeItem.id] })
    } catch (err) {
      console.error('Failed to toggle like:', err)
      setIsLiked(previousLiked)
      setLikesCount(previousCount)
    }
  }

  // Save / Bookmark action
  const handleSaveToggle = async () => {
    if (!user) {
      window.location.href = '/login'
      return
    }

    const previousSaved = isSaved
    setIsSaved(!previousSaved)

    try {
      await togglePostReaction({
        userId: user.id,
        postId: activeItem.id,
        kind: 'save',
        isCurrentlyActive: previousSaved,
      })
      queryClient.invalidateQueries({ queryKey: ['explore_dispatches'] })
    } catch (err) {
      console.error('Failed to toggle save:', err)
      setIsSaved(previousSaved)
    }
  }

  // Comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!user || !commentInput.trim() || isSubmittingComment) return

    setIsSubmittingComment(true)
    const textToSubmit = commentInput.trim()

    try {
      const newComment = await addPostComment({
        postId: activeItem.id,
        authorId: user.id,
        body: textToSubmit,
      })

      setCommentInput('')
      setComments((prev) => [...prev, newComment])
      setCommentsCount((prev) => prev + 1)
      queryClient.invalidateQueries({ queryKey: ['explore_dispatches'] })
      queryClient.invalidateQueries({ queryKey: ['post_detail', activeItem.id] })
    } catch (err) {
      alert('Unable to submit comment: ' + err.message)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    if (!user) return
    try {
      await deletePostComment({ commentId, authorId: user.id })
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      setCommentsCount((prev) => Math.max(0, prev - 1))
      queryClient.invalidateQueries({ queryKey: ['explore_dispatches'] })
    } catch (err) {
      console.error('Failed to delete comment:', err)
    }
  }

  const handleShare = () => {
    const postUrl = `${window.location.origin}/post/${activeItem?.id}`
    if (navigator.share) {
      navigator.share({
        title: parsedMeta.title,
        url: postUrl,
      }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(postUrl)
    }
  }

  if (!activeItem) return null

  return (
    <div
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 z-[9999] bg-black/92 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-5 select-none overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Cultural Media Viewer"
    >
      {/* ── Ambient Blurred Backdrop ── */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-25 pointer-events-none scale-110 filter blur-3xl">
        <img
          src={parsedMeta.mediaUrl}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      {/* ── Floating Close Button (Top-Right of Viewport) ── */}
      <button
        type="button"
        onClick={onClose}
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[10000] h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-black/85 hover:bg-black border border-white/30 text-white flex items-center justify-center transition-all cursor-pointer shadow-2xl hover:scale-105 active:scale-95"
        aria-label="Close media viewer"
        title="Close media viewer (Esc)"
      >
        <X className="h-6 w-6" />
      </button>

      {/* ── Vertical Navigation Chevrons (Desktop Side Controls) ── */}
      <div className="hidden md:flex flex-col gap-3 fixed right-5 sm:right-8 lg:right-12 top-1/2 -translate-y-1/2 z-[10000]">
        <button
          type="button"
          onClick={goToPrev}
          disabled={!canGoPrev}
          className="h-11 w-11 rounded-full bg-black/75 hover:bg-black border border-white/30 text-white flex items-center justify-center transition-all cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed hover:scale-110 shadow-xl"
          aria-label="Previous dispatch (Up)"
          title="Previous dispatch (Arrow Up)"
        >
          <ChevronUp className="h-6 w-6" />
        </button>

        <button
          type="button"
          onClick={goToNext}
          disabled={!canGoNext}
          className="h-11 w-11 rounded-full bg-black/75 hover:bg-black border border-white/30 text-white flex items-center justify-center transition-all cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed hover:scale-110 shadow-xl"
          aria-label="Next dispatch (Down)"
          title="Next dispatch (Arrow Down)"
        >
          <ChevronDown className="h-6 w-6" />
        </button>
      </div>

      {/* ── Compact & Perfectly Fitted 9:16 Portrait Card ── */}
      <div className="relative z-10 w-full max-w-[340px] sm:max-w-[360px] md:max-w-[380px] aspect-[9/16] max-h-[78vh] sm:max-h-[80vh] md:max-h-[82vh] bg-[#120D10] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border border-white/20">
        
        {/* Media Layer: Video or Image */}
        <div className="absolute inset-0 z-0 bg-black flex items-center justify-center overflow-hidden">
          {parsedMeta.isVideo && parsedMeta.videoUrl ? (
            <video
              ref={videoRef}
              key={parsedMeta.videoUrl}
              src={parsedMeta.videoUrl}
              poster={parsedMeta.mediaUrl}
              playsInline
              loop
              muted={isMuted}
              onLoadedData={() => {
                setMediaLoaded(true)
                setMediaError(false)
              }}
              onError={() => {
                setMediaError(true)
                setMediaLoaded(true)
              }}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              key={parsedMeta.mediaUrl}
              src={parsedMeta.mediaUrl}
              alt={parsedMeta.title}
              onLoad={() => {
                setMediaLoaded(true)
                setMediaError(false)
              }}
              onError={(e) => {
                setMediaError(true)
                setMediaLoaded(true)
                e.currentTarget.src = '/photos/culture_01.jpeg'
              }}
              className="w-full h-full object-cover"
            />
          )}

          {/* Fallback Media Loading State */}
          {!mediaLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Loader2 className="h-7 w-7 animate-spin text-white/70" />
            </div>
          )}

          {/* Media Error State */}
          {mediaError && (
            <div className="absolute bottom-20 inset-x-3 bg-black/80 border border-white/20 p-2.5 rounded-xl text-center text-xs text-white/80">
              <AlertCircle className="h-4 w-4 text-[#B08A50] mx-auto mb-1" />
              <span>Media preview unavailable</span>
            </div>
          )}

          {/* Dark Vignettes */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/20 to-black/60 pointer-events-none" />
        </div>

        {/* ── Top Header Row: Author Info + Controls ── */}
        <div className="relative z-20 p-3.5 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <img
              src={parsedMeta.authorAvatar}
              alt={parsedMeta.authorName}
              className="h-8 w-8 rounded-full border border-white/60 object-cover shadow-sm shrink-0"
              onError={(e) => {
                e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=Archivist&backgroundColor=6A1F35`
              }}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1 truncate">
                <span className="text-xs font-bold text-white leading-tight truncate">
                  {parsedMeta.authorName}
                </span>
                {(parsedMeta.isDemo || activeItem?.author?.is_verified) && (
                  <CheckCircle2 className="h-3 w-3 text-[#00A389] fill-current shrink-0" />
                )}
              </div>
              <span className="text-[10px] text-white/70 font-mono">
                @{parsedMeta.authorHandle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {parsedMeta.isVideo && (
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="h-7 w-7 rounded-full bg-black/60 border border-white/25 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              </button>
            )}

            <span className="bg-black/65 text-white text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/20">
              {items.length > 1 ? `${currentIndex + 1}/${items.length}` : parsedMeta.duration}
            </span>

            {/* In-Card Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="h-7 w-7 rounded-full bg-black/60 hover:bg-black border border-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
              title="Close (Esc)"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* ── Center Tap: Play / Pause for Videos ── */}
        {parsedMeta.isVideo && (
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="relative z-20 self-center h-13 w-13 rounded-full bg-black/50 border border-white/30 backdrop-blur-xs text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer shadow-lg"
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
          >
            {isPlaying ? (
              <Pause className="h-6 w-6 fill-current" />
            ) : (
              <Play className="h-6 w-6 fill-current ml-0.5" />
            )}
          </button>
        )}

        {/* ── Bottom Details & Social Engagement Actions ── */}
        <div className="relative z-20 p-4 pb-4 space-y-2">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 bg-[#6A1F35]/90 border border-white/20 text-white text-[9px] font-mono px-2 py-0.5 rounded-full shadow-xs">
              <Sparkles className="h-2.5 w-2.5 text-[#B08A50]" />
              <span>{parsedMeta.category}</span>
            </div>

            <h3 className="font-serif text-base font-bold text-white leading-snug line-clamp-1">
              {parsedMeta.title}
            </h3>

            {parsedMeta.description && (
              <p className="text-[11px] text-white/85 leading-relaxed line-clamp-2 font-sans">
                {parsedMeta.description}
              </p>
            )}

            <div className="flex items-center gap-1 text-[10px] text-[#B08A50] font-medium pt-0.5">
              <MapPin className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">{parsedMeta.location}</span>
            </div>
          </div>

          {/* Social Actions */}
          <div className="pt-2 border-t border-white/15 flex items-center justify-between text-white text-xs">
            <div className="flex items-center gap-3.5">
              <button
                type="button"
                onClick={handleLikeToggle}
                className="flex items-center gap-1 hover:text-[#B08A50] transition-colors cursor-pointer group"
                aria-label={isLiked ? 'Unlike dispatch' : 'Like dispatch'}
              >
                <Heart
                  className={`h-4.5 w-4.5 transition-transform group-hover:scale-110 ${
                    isLiked ? 'fill-current text-[#E65100]' : 'text-white'
                  }`}
                />
                <span className="font-medium text-xs">{likesCount}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCommentsOpen(!isCommentsOpen)}
                className={`flex items-center gap-1 hover:text-[#B08A50] transition-colors cursor-pointer group ${
                  isCommentsOpen ? 'text-[#B08A50]' : 'text-white'
                }`}
                aria-label="View observations"
              >
                <MessageCircle className="h-4.5 w-4.5 transition-transform group-hover:scale-110" />
                <span className="font-medium text-xs">{commentsCount}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="hover:text-[#B08A50] transition-colors cursor-pointer text-white"
                aria-label="Share dispatch"
              >
                <Share2 className="h-4.5 w-4.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleSaveToggle}
              className="hover:text-[#B08A50] transition-colors cursor-pointer text-white"
              aria-label={isSaved ? 'Remove from saved' : 'Save'}
            >
              <Bookmark className={`h-4.5 w-4.5 ${isSaved ? 'fill-current text-[#B08A50]' : ''}`} />
            </button>
          </div>
        </div>

        {/* ── Slide-up Comments Drawer ── */}
        {isCommentsOpen && (
          <div
            onWheel={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            className="absolute inset-x-0 bottom-0 z-30 max-h-[75%] bg-[#1A1215]/95 backdrop-blur-xl border-t border-white/20 rounded-t-3xl flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-250"
          >
            <div className="p-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-[#B08A50]" />
                <h4 className="font-serif text-xs font-bold text-white">
                  Observations ({commentsCount})
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsCommentsOpen(false)}
                className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close comments"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-52">
              {isLoadingComments ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-[#B08A50]" />
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-5 space-y-1 text-white/70">
                  <p className="text-xs">No comments yet on this dispatch.</p>
                  <p className="text-[10px] text-white/50">Be the first to share your cultural perspective!</p>
                </div>
              ) : (
                comments.map((comment) => {
                  const isAuthor = user?.id === comment.author_id
                  return (
                    <div
                      key={comment.id}
                      className="bg-white/5 border border-white/10 rounded-xl p-2 space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1.5 font-bold text-white">
                          <div className="h-4 w-4 rounded-full bg-[#6A1F35] overflow-hidden flex items-center justify-center text-[9px]">
                            {comment.author?.avatar_url ? (
                              <img src={comment.author.avatar_url} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <User className="h-2.5 w-2.5 text-white" />
                            )}
                          </div>
                          <span>@{comment.author?.handle || 'member'}</span>
                        </div>

                        {isAuthor && (
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-white/40 hover:text-red-400 p-0.5 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-white/90 pl-5 leading-relaxed">
                        {comment.body}
                      </p>
                    </div>
                  )
                })
              )}
            </div>

            <div className="p-2.5 border-t border-white/10 bg-black/40">
              {user ? (
                <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Add your cultural reflection..."
                    maxLength={1000}
                    className="flex-1 bg-white/10 border border-white/20 text-white placeholder:text-white/50 text-xs px-2.5 py-1.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#B08A50]"
                  />
                  <button
                    type="submit"
                    disabled={!commentInput.trim() || isSubmittingComment}
                    className="h-7 w-7 rounded-xl bg-[#6A1F35] hover:bg-[#832641] disabled:opacity-40 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    aria-label="Send"
                  >
                    {isSubmittingComment ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Send className="h-3 w-3" />
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center py-1">
                  <a href="/login" className="text-xs text-[#B08A50] font-semibold underline">
                    Sign in
                  </a>{' '}
                  <span className="text-xs text-white/70">to leave a comment.</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VisualStoryViewer
