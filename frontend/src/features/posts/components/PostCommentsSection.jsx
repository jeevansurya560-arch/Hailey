import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { MessageSquare, Send, Trash2, Loader2, User } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  fetchPostComments,
  addPostComment,
  deletePostComment,
} from '@/features/posts/services/postInteractionService'

export function PostCommentsSection({ postId, onCommentAdded }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [commentText, setCommentText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch comments
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['post_comments', postId],
    queryFn: () => fetchPostComments(postId),
    enabled: !!postId,
  })

  // Add comment mutation
  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!user || !commentText.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await addPostComment({
        postId,
        authorId: user.id,
        body: commentText.trim(),
      })
      setCommentText('')
      queryClient.invalidateQueries({ queryKey: ['post_comments', postId] })
      queryClient.invalidateQueries({ queryKey: ['post_detail', postId] })
      onCommentAdded?.()
    } catch (err) {
      alert('Failed to post comment: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete comment mutation
  const handleDeleteComment = async (commentId) => {
    if (!user || !window.confirm('Delete your observation?')) return

    try {
      await deletePostComment({ commentId, authorId: user.id })
      queryClient.invalidateQueries({ queryKey: ['post_comments', postId] })
      queryClient.invalidateQueries({ queryKey: ['post_detail', postId] })
    } catch (err) {
      alert('Failed to delete comment: ' + err.message)
    }
  }

  return (
    <div className="pt-4 border-t border-[var(--line)] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between text-xs font-mono text-[var(--ink-2)]">
        <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-[var(--ink)]">
          <MessageSquare className="h-3.5 w-3.5 text-[var(--clay)]" />
          Observations & Discourse ({comments.length})
        </span>
      </div>

      {/* Comment Input */}
      {user ? (
        <form onSubmit={handleAddComment} className="flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a cultural observation or question..."
            maxLength={1000}
            className="flex-1 border border-[var(--ink)] bg-[var(--paper)] px-3 py-2 text-xs font-sans text-[var(--ink)] placeholder:text-[var(--ink-2)] placeholder:font-mono focus:outline-none focus:ring-1 focus:ring-[var(--clay)]"
          />
          <button
            type="submit"
            disabled={!commentText.trim() || isSubmitting}
            className="border border-[var(--ink)] bg-[var(--clay)] px-3 py-2 text-xs font-mono uppercase tracking-wider text-[var(--paper)] hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1 shadow-[1.5px_1.5px_0_var(--ink)]"
          >
            {isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <span>Post</span>
                <Send className="h-3 w-3" />
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="p-2.5 bg-[var(--paper)] border border-dashed border-[var(--line)] text-center text-xs font-mono text-[var(--ink-2)]">
          <Link to="/login" className="text-[var(--clay)] font-bold hover:underline">
            Sign in
          </Link>{' '}
          to join the conversation and discuss this topic.
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-[var(--clay)]" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs font-mono text-[var(--ink-2)] italic py-2">
          No observations yet. Be the first to share your thoughts on this cultural topic!
        </p>
      ) : (
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {comments.map((comment) => {
            const isOwn = user?.id === comment.author_id
            return (
              <div
                key={comment.id}
                className="border border-[var(--line)] bg-[var(--paper)] p-3 space-y-1.5 transition-colors"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/u/${comment.author?.handle || 'member'}`}
                      className="flex items-center gap-1.5 font-mono font-bold text-[var(--ink)] hover:text-[var(--clay)]"
                    >
                      <div className="h-5 w-5 rounded-full border border-[var(--ink)] bg-[var(--paper-2)] overflow-hidden flex items-center justify-center text-[10px]">
                        {comment.author?.avatar_url ? (
                          <img
                            src={comment.author.avatar_url}
                            alt={comment.author.handle}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-3 w-3 text-[var(--ink-2)]" />
                        )}
                      </div>
                      <span>@{comment.author?.handle}</span>
                    </Link>
                    <span className="text-[10px] font-mono text-[var(--ink-2)]">
                      {new Date(comment.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  {isOwn && (
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-[var(--ink-2)] hover:text-red-600 transition-colors p-0.5"
                      title="Delete comment"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-[var(--ink)] whitespace-pre-wrap leading-relaxed pl-6.5">
                  {comment.body}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
