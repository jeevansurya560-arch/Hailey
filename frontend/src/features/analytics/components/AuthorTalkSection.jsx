import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MessageSquare, Mic, Volume2, UserCheck, Heart, Send, ArrowRight } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { fetchProfileById, fetchUserPosts } from '@/features/profile/services/profileService'

/**
 * AuthorTalkSection: Deep oral history, cultural storytelling,
 * and direct audience interaction with verified culture bearers.
 * Connects to live Supabase profile and dispatch data.
 */
export function AuthorTalkSection({ userId = null }) {
  const { user } = useAuth()
  const activeUserId = userId || user?.id

  const { data: profile } = useQuery({
    queryKey: ['author_talk_section_profile', activeUserId],
    queryFn: () => fetchProfileById(activeUserId),
    enabled: !!activeUserId,
  })

  const { data: userPosts = [] } = useQuery({
    queryKey: ['author_talk_section_posts', activeUserId],
    queryFn: () => fetchUserPosts(activeUserId),
    enabled: !!activeUserId,
  })

  const authorName = profile?.display_name || (profile?.handle ? `@${profile.handle}` : 'Jeevan Surya Jalli')
  const authorBio = profile?.bio || 'Cultural field archivist & documentation lead at Hailey Living Heritage.'
  const latestPost = userPosts[0]
  const storyTitle = latestPost ? latestPost.body.slice(0, 60) + '...' : 'Living Heritage Field Documentation'
  const storyContent = latestPost
    ? latestPost.body
    : 'Hailey connects living traditions, performing arts, and sacred architecture through decentralized dispatches recorded by local culture bearers.'

  const [comments, setComments] = useState([
    {
      id: 'c1',
      author: 'Amina Diallo',
      text: 'The documentation rigor preserves living nuances that synthetic digital archives frequently lose.',
      time: '2 hours ago',
      likes: 5,
    },
    {
      id: 'c2',
      author: 'Marcus Vance',
      text: 'Are these recordings cross-referenced with regional municipal ethnographic guilds?',
      time: '5 hours ago',
      likes: 3,
    },
  ])
  const [newComment, setNewComment] = useState('')
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  const handleAddComment = (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setComments((prev) => [
      ...prev,
      {
        id: 'c-' + Date.now(),
        author: user?.user_metadata?.full_name || 'Guest Contributor',
        text: newComment.trim(),
        time: 'Just now',
        likes: 0,
      },
    ])
    setNewComment('')
  }

  return (
    <section className="border border-[var(--ink)] bg-[var(--paper)] p-6 md:p-8 shadow-[var(--shadow-hard)] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[var(--clay)] text-[var(--paper)]">
              Author Talk · Oral History
            </span>
            <span className="font-mono text-xs text-[var(--ink-2)] flex items-center gap-1">
              <UserCheck className="h-3.5 w-3.5 text-emerald-700" />
              Verified Culture Bearer
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[var(--ink)] mt-1">
            {storyTitle}
          </h2>
          <p className="text-xs text-[var(--ink-2)] mt-0.5">
            By <strong className="text-[var(--ink)]">{authorName}</strong> — {authorBio}
          </p>
        </div>

        {/* Audio Narration Toggle */}
        <button
          type="button"
          onClick={() => setIsPlayingAudio(!isPlayingAudio)}
          className={`px-3 py-1.5 font-mono text-xs rounded border flex items-center gap-2 transition-all ${
            isPlayingAudio
              ? 'bg-[var(--clay)] text-[var(--paper)] border-[var(--clay)] shadow-[2px_2px_0_var(--ink)]'
              : 'border-[var(--line)] bg-[var(--paper-2)] text-[var(--ink)] hover:border-[var(--ink)]'
          }`}
        >
          {isPlayingAudio ? (
            <>
              <Volume2 className="h-3.5 w-3.5 animate-pulse" />
              <span>Playing Field Note (03:42)</span>
            </>
          ) : (
            <>
              <Mic className="h-3.5 w-3.5 text-[var(--clay)]" />
              <span>Listen to Author Note</span>
            </>
          )}
        </button>
      </div>

      {/* Story Content */}
      <div className="text-sm leading-relaxed text-[var(--ink)] space-y-3 font-serif">
        <p className="border-l-2 border-[var(--clay)] pl-4 italic text-[var(--ink-2)]">
          "{storyContent}"
        </p>
      </div>

      {/* Community Interaction & Discussion */}
      <div className="pt-4 border-t border-[var(--line)] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-xs uppercase tracking-widest font-bold text-[var(--ink)] flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4 text-[var(--clay)]" />
            <span>Audience Exchange ({comments.length})</span>
          </h3>

          {profile?.handle && (
            <Link
              to={`/u/${profile.handle}`}
              className="font-mono text-xs text-[var(--clay)] hover:underline flex items-center gap-1 font-bold"
            >
              <span>Author Passport</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>

        {/* Comments Feed */}
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="border border-[var(--line)] bg-[var(--paper-2)] p-3 rounded space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="font-bold text-[var(--ink)]">{c.author}</span>
                <span className="text-[var(--ink-2)]">{c.time}</span>
              </div>
              <p className="text-xs text-[var(--ink)]">{c.text}</p>
              <div className="flex items-center gap-1 text-[10px] font-mono text-[var(--ink-2)] pt-1">
                <Heart className="h-3 w-3 text-[var(--clay)]" />
                <span>{c.likes} endorsements</span>
              </div>
            </div>
          ))}
        </div>

        {/* Comment input form */}
        <form onSubmit={handleAddComment} className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Pose a question or reflection to the author..."
            className="flex-1 border border-[var(--ink)] bg-[var(--paper-2)] px-3 py-2 text-xs text-[var(--ink)] placeholder:text-[var(--ink-2)] focus:outline-none focus:ring-1 focus:ring-[var(--clay)]"
          />
          <button
            type="submit"
            className="border border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)] px-4 py-2 font-mono text-xs uppercase tracking-wider font-bold shadow-[2px_2px_0_var(--ink)] hover:bg-[var(--clay)] transition-colors flex items-center gap-1"
          >
            <Send className="h-3 w-3" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </section>
  )
}

export default AuthorTalkSection
