import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchPostComments,
  addPostComment,
  deletePostComment,
  recordPostShare,
  fetchPostSocialCounts,
} from '../../frontend/src/features/posts/services/postInteractionService'
import {
  getOrCreateConversation,
  fetchMessages,
  sendMessage,
} from '../../frontend/src/features/messages/services/messageService'
import {
  fetchFollowStats,
  toggleFollow,
} from '../../frontend/src/features/profile/services/profileService'
import { supabase } from '../../frontend/src/lib/supabase/client'

describe('Social Discourse & Author-Reader Interaction Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Post Comments & Observations', () => {
    it('successfully posts a comment with author info', async () => {
      const mockComment = {
        id: 'c-1',
        post_id: 'p-1',
        author_id: 'u-1',
        body: 'Fascinating archival documentation of this festival!',
        created_at: new Date().toISOString(),
        profiles: { handle: 'curator_alice', display_name: 'Alice' },
      }

      vi.spyOn(supabase, 'from').mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockComment, error: null }),
          }),
        }),
      })

      const res = await addPostComment({
        postId: 'p-1',
        authorId: 'u-1',
        body: 'Fascinating archival documentation of this festival!',
      })

      expect(res.id).toBe('c-1')
      expect(res.author.handle).toBe('curator_alice')
      expect(res.body).toContain('Fascinating archival')
    })

    it('rejects empty comment submission', async () => {
      await expect(
        addPostComment({
          postId: 'p-1',
          authorId: 'u-1',
          body: '   ',
        })
      ).rejects.toThrow(/comment text are required/i)
    })

    it('fetches comments for a post', async () => {
      const mockComments = [
        {
          id: 'c-1',
          post_id: 'p-1',
          author_id: 'u-1',
          body: 'First comment',
          created_at: new Date().toISOString(),
          profiles: { handle: 'user_1', display_name: 'User 1' },
        },
      ]

      vi.spyOn(supabase, 'from').mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockComments, error: null }),
          }),
        }),
      })

      const comments = await fetchPostComments('p-1')
      expect(comments).toHaveLength(1)
      expect(comments[0].author.handle).toBe('user_1')
    })
  })

  describe('Direct Messaging & Author Discussions', () => {
    it('creates or retrieves direct conversation with author topic link', async () => {
      const mockConv = {
        id: 'conv-100',
        participant1_id: 'reader-1',
        participant2_id: 'author-2',
        topic_post_id: 'post-50',
        last_message_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        p1: { id: 'reader-1', handle: 'reader' },
        p2: { id: 'author-2', handle: 'author_master' },
        topic_post: { id: 'post-50', body: 'Underground Techno movement in Detroit' },
      }

      vi.spyOn(supabase, 'from').mockReturnValue({
        select: vi.fn().mockReturnValue({
          or: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: mockConv, error: null }),
          }),
        }),
      })

      const conv = await getOrCreateConversation({
        currentUserId: 'reader-1',
        otherUserId: 'author-2',
        topicPostId: 'post-50',
      })

      expect(conv.id).toBe('conv-100')
      expect(conv.otherParticipant.handle).toBe('author_master')
      expect(conv.topicPost.body).toContain('Detroit')
    })

    it('prevents initiating a conversation with oneself', async () => {
      await expect(
        getOrCreateConversation({
          currentUserId: 'same-user',
          otherUserId: 'same-user',
        })
      ).rejects.toThrow(/Cannot start a direct message thread with yourself/i)
    })

    it('sends message in active conversation', async () => {
      const mockMsg = {
        id: 'msg-1',
        conversation_id: 'conv-1',
        sender_id: 'user-1',
        body: 'I wanted to ask about the instrumentation used in this ceremony.',
        created_at: new Date().toISOString(),
        profiles: { handle: 'user_1', display_name: 'User 1' },
      }

      vi.spyOn(supabase, 'from').mockImplementation((table) => {
        if (table === 'messages') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockMsg, error: null }),
              }),
            }),
          }
        }
        if (table === 'conversations') {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          }
        }
        return {}
      })

      const res = await sendMessage({
        conversationId: 'conv-1',
        senderId: 'user-1',
        body: 'I wanted to ask about the instrumentation used in this ceremony.',
      })

      expect(res.id).toBe('msg-1')
      expect(res.body).toContain('instrumentation')
    })
  })

  describe('Follow & Audience Network', () => {
    it('calculates follow statistics accurately', async () => {
      vi.spyOn(supabase, 'from').mockImplementation((table) => {
        if (table === 'follows') {
          return {
            select: (cols, opts) => {
              if (opts?.count === 'exact') {
                return {
                  eq: (col, val) => {
                    if (col === 'following_id') return Promise.resolve({ count: 42, error: null })
                    if (col === 'follower_id') return Promise.resolve({ count: 18, error: null })
                    return Promise.resolve({ count: 0, error: null })
                  },
                }
              }
              return {
                eq: () => ({
                  eq: () => ({
                    maybeSingle: vi.fn().mockResolvedValue({ data: { created_at: '2026-01-01' } }),
                  }),
                }),
              }
            },
          }
        }
        return {}
      })

      const stats = await fetchFollowStats('target-user', 'current-user')
      expect(stats.followersCount).toBe(42)
      expect(stats.followingCount).toBe(18)
      expect(stats.isFollowing).toBe(true)
    })

    it('rejects self-follow attempt', async () => {
      await expect(
        toggleFollow({
          currentUserId: 'same-user',
          targetUserId: 'same-user',
          isCurrentlyFollowing: false,
        })
      ).rejects.toThrow(/Cannot follow yourself/i)
    })
  })
})
