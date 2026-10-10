import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  X,
  Loader2,
  ShieldCheck,
  MessageSquare,
  MapPin,
  ArrowRight,
  Grid,
} from 'lucide-react'
import {
  fetchProfileById,
  fetchUserInterests,
  fetchUserPosts,
  fetchFollowStats,
  toggleFollow,
} from '@/features/profile/services/profileService'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { TagSticker } from '@/components/ui/TagSticker'

/**
 * AuthorTalkModal: Author discovery drawer/modal for Hailey
 * Displays authentic author metadata, bio, cultural tags, dispatches, follow status, and direct message entry.
 */
export function AuthorTalkModal({ authorId, author: initialAuthor = null, isOpen, onClose }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const targetId = authorId || initialAuthor?.id

  // 1. Fetch live author profile
  const { data: author = initialAuthor, isLoading: isAuthorLoading } = useQuery({
    queryKey: ['author_talk_profile', targetId],
    queryFn: () => fetchProfileById(targetId),
    enabled: isOpen && !!targetId,
  })

  // 2. Fetch author's cultural taxonomy interests
  const { data: interests = [] } = useQuery({
    queryKey: ['author_talk_interests', targetId],
    queryFn: () => fetchUserInterests(targetId),
    enabled: isOpen && !!targetId,
  })

  // 3. Fetch author's published dispatches
  const { data: posts = [], isLoading: isPostsLoading } = useQuery({
    queryKey: ['author_talk_posts', targetId],
    queryFn: () => fetchUserPosts(targetId),
    enabled: isOpen && !!targetId,
  })

  // 4. Fetch follow statistics and status
  const { data: followStats = { followersCount: 0, followingCount: 0, isFollowing: false } } =
    useQuery({
      queryKey: ['author_talk_follow_stats', targetId, user?.id],
      queryFn: () => fetchFollowStats(targetId, user?.id),
      enabled: isOpen && !!targetId,
    })

  if (!isOpen) return null

  const isOwnAuthor = user && targetId && user.id === targetId

  const handleToggleFollow = async () => {
    if (!user) {
      onClose()
      navigate('/login')
      return
    }

    try {
      await toggleFollow({
        currentUserId: user.id,
        targetUserId: targetId,
        isCurrentlyFollowing: followStats.isFollowing,
      })
      queryClient.invalidateQueries({
        queryKey: ['author_talk_follow_stats', targetId, user.id],
      })
      queryClient.invalidateQueries({
        queryKey: ['profile_follow_stats', targetId, user.id],
      })
    } catch (err) {
      alert('Follow action failed: ' + err.message)
    }
  }

  const handleDiscuss = () => {
    onClose()
    if (!user) {
      navigate('/login')
      return
    }
    navigate(`/messages?with=${targetId}`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto border border-[var(--ink)] bg-[var(--paper)] p-6 shadow-[var(--shadow-hard)] space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[var(--clay)] text-[var(--paper)]">
              Author Talk
            </span>
            <span className="font-mono text-xs text-[var(--ink-2)] flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
              Verified Culture Bearer
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-[var(--ink-2)] hover:text-[var(--ink)] p-1 rounded hover:bg-[var(--paper-2)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isAuthorLoading && !author ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--clay)]" />
          </div>
        ) : !author ? (
          <div className="text-center py-8 space-y-2">
            <p className="font-serif text-lg font-bold text-[var(--ink)]">Author Unavailable</p>
            <p className="font-mono text-xs text-[var(--ink-2)]">
              This contributor's profile is not available for public dialogue.
            </p>
          </div>
        ) : (
          <>
            {/* Author Summary Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border border-[var(--line)] bg-[var(--paper-2)] p-4 shadow-[1.5px_1.5px_0_var(--line)]">
              {/* Avatar */}
              <div className="h-16 w-16 rounded-full border-2 border-[var(--ink)] bg-[var(--paper)] overflow-hidden shrink-0 flex items-center justify-center shadow-[1.5px_1.5px_0_var(--ink)]">
                {author.avatar_url ? (
                  <img
                    src={author.avatar_url}
                    alt={author.handle}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="font-serif text-2xl font-bold text-[var(--clay)] uppercase">
                    {(author.handle || 'A').slice(0, 2)}
                  </span>
                )}
              </div>

              {/* Identity & Bio */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-serif text-xl font-bold text-[var(--ink)]">
                    {author.display_name || `@${author.handle}`}
                  </h3>
                  {author.display_name && (
                    <span className="font-mono text-xs text-[var(--ink-2)]">
                      @{author.handle}
                    </span>
                  )}
                  {author.is_editorial && (
                    <span className="inline-flex items-center gap-0.5 rounded bg-[var(--clay)] px-1.5 py-0.2 font-mono text-[8px] uppercase font-bold text-[var(--paper)]">
                      Editorial
                    </span>
                  )}
                </div>

                {author.bio && (
                  <p className="font-sans text-xs text-[var(--ink)] line-clamp-3 leading-relaxed">
                    {author.bio}
                  </p>
                )}

                <div className="flex items-center gap-4 font-mono text-[11px] text-[var(--ink-2)] pt-1">
                  <span>
                    <strong className="text-[var(--ink)]">{posts.length}</strong> dispatches
                  </span>
                  <span>
                    <strong className="text-[var(--ink)]">{followStats.followersCount}</strong> followers
                  </span>
                  {author.location && (
                    <span className="flex items-center gap-0.5">
                      <MapPin className="h-3 w-3 text-[var(--clay)]" />
                      {author.location}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Cultural Interests / Threads */}
            {interests.length > 0 && (
              <div className="space-y-2">
                <span className="font-mono text-[10px] uppercase font-bold text-[var(--ink-2)] block tracking-wider">
                  Cultural Focus & Threads
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {interests.map((t) => (
                    <TagSticker
                      key={t.id}
                      id={t.id}
                      name={t.name}
                      slug={t.slug}
                      kind={t.kind}
                      size="sm"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Published Dispatches */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-1.5">
                <span className="font-mono text-[10px] uppercase font-bold text-[var(--ink-2)] tracking-wider">
                  Published Living Dispatches ({posts.length})
                </span>
                <Link
                  to={`/u/${author.handle}`}
                  onClick={onClose}
                  className="font-mono text-[11px] text-[var(--clay)] hover:underline flex items-center gap-1 font-bold"
                >
                  <span>View Full Passport</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {isPostsLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--clay)]" />
                </div>
              ) : posts.length === 0 ? (
                <div className="border border-dashed border-[var(--line)] p-6 text-center text-xs font-mono text-[var(--ink-2)]">
                  This author has not published any cultural dispatches yet.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {posts.slice(0, 5).map((p) => (
                    <Link
                      key={p.id}
                      to={`/post/${p.id}`}
                      onClick={onClose}
                      className="flex items-center gap-3 border border-[var(--line)] bg-[var(--paper-2)] p-2.5 hover:border-[var(--ink)] transition-colors shadow-sm group"
                    >
                      {p.media_url ? (
                        <img
                          src={p.media_url}
                          alt="Thumbnail"
                          className="h-12 w-12 object-cover border border-[var(--line)] shrink-0"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-[var(--paper)] border border-[var(--line)] flex items-center justify-center shrink-0">
                          <Grid className="h-4 w-4 text-[var(--ink-2)]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <p className="text-xs font-serif text-[var(--ink)] line-clamp-1 group-hover:text-[var(--clay)] transition-colors">
                          {p.body}
                        </p>
                        <div className="flex items-center gap-3 font-mono text-[10px] text-[var(--ink-2)]">
                          <span>{new Date(p.created_at).toLocaleDateString()}</span>
                          <span>❤️ {p.reactions?.likesCount ?? 0}</span>
                          <span>💬 {p.reactions?.commentsCount ?? 0}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Interactive Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--line)]">
              <div className="flex items-center gap-2">
                {!isOwnAuthor && (
                  <button
                    type="button"
                    onClick={handleToggleFollow}
                    className={`border border-[var(--ink)] px-4 py-2 font-mono text-xs uppercase tracking-wider font-bold transition-all shadow-[1.5px_1.5px_0_var(--ink)] ${
                      followStats.isFollowing
                        ? 'bg-[var(--paper)] text-[var(--ink)] hover:bg-red-50 hover:text-red-700'
                        : 'bg-[var(--clay)] text-[var(--paper)] hover:opacity-90'
                    }`}
                  >
                    {followStats.isFollowing ? 'Following' : 'Follow Author'}
                  </button>
                )}

                {!isOwnAuthor && (
                  <button
                    type="button"
                    onClick={handleDiscuss}
                    className="border border-[var(--ink)] bg-[var(--paper)] px-4 py-2 font-mono text-xs uppercase tracking-wider font-bold text-[var(--ink)] hover:bg-[var(--paper-2)] transition-colors shadow-[1.5px_1.5px_0_var(--ink)] flex items-center gap-1.5"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-[var(--clay)]" />
                    <span>Discuss / Message</span>
                  </button>
                )}
              </div>

              <Link
                to={`/u/${author.handle}`}
                onClick={onClose}
                className="font-mono text-xs text-[var(--ink-2)] hover:text-[var(--ink)] underline font-bold"
              >
                Go to @{author.handle}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AuthorTalkModal
