import React, { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  MessageSquare,
  Send,
  Loader2,
  ArrowLeft,
  ExternalLink,
  Search,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  fetchConversations,
  getOrCreateConversation,
  fetchMessages,
  sendMessage,
} from '../services/messageService'

export function MessagesPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()

  const withUserId = searchParams.get('with')
  const postId = searchParams.get('postId')

  const [selectedConvId, setSelectedConvId] = useState(null)
  const [messageInput, setMessageInput] = useState('')
  const [searchFilter, setSearchFilter] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef(null)

  // 1. Fetch all conversations for user
  const { data: conversations = [], isLoading: isLoadingConvs } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: () => (user ? fetchConversations(user.id) : []),
    enabled: !!user,
  })

  // 2. If 'with' query param is passed, auto-select or create conversation
  useEffect(() => {
    if (user && withUserId && withUserId !== user.id) {
      getOrCreateConversation({
        currentUserId: user.id,
        otherUserId: withUserId,
        topicPostId: postId || null,
      })
        .then((conv) => {
          if (conv?.id) {
            setSelectedConvId(conv.id)
            queryClient.invalidateQueries({ queryKey: ['conversations', user.id] })
          }
        })
        .catch((err) => {
          console.error('Failed to open conversation:', err)
        })
    }
  }, [user, withUserId, postId, queryClient])

  // Derive active conversation ID without cascading state triggers
  const activeConvId = selectedConvId || (!withUserId && conversations.length > 0 ? conversations[0].id : null)

  // Active conversation object
  const activeConv = conversations.find((c) => c.id === activeConvId)

  // 3. Fetch messages for active conversation
  const { data: messages = [], isLoading: isLoadingMsgs } = useQuery({
    queryKey: ['messages', activeConvId],
    queryFn: () => fetchMessages(activeConvId),
    enabled: !!activeConvId,
    refetchInterval: 4000, // Poll every 4 seconds for new messages
  })

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Send message handler
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!user || !activeConvId || !messageInput.trim() || isSending) return

    const text = messageInput.trim()
    setMessageInput('')
    setIsSending(true)

    try {
      await sendMessage({
        conversationId: activeConvId,
        senderId: user.id,
        body: text,
      })
      queryClient.invalidateQueries({ queryKey: ['messages', activeConvId] })
      queryClient.invalidateQueries({ queryKey: ['conversations', user.id] })
    } catch (err) {
      alert('Failed to send message: ' + err.message)
      setMessageInput(text)
    } finally {
      setIsSending(false)
    }
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center space-y-4 border border-[var(--ink)] bg-[var(--paper-2)] p-8 shadow-[var(--shadow-hard)]">
        <div className="h-12 w-12 mx-auto rounded-full border border-[var(--ink)] bg-[var(--paper)] flex items-center justify-center">
          <MessageSquare className="h-6 w-6 text-[var(--clay)]" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-[var(--ink)]">
          Direct Messages & Author Discussions
        </h2>
        <p className="text-xs text-[var(--ink-2)] font-mono leading-relaxed">
          Sign in to interact with authors, inquire about cultural dispatches, and exchange perspectives.
        </p>
        <Link
          to="/login"
          className="inline-block border border-[var(--ink)] bg-[var(--clay)] px-5 py-2 font-mono text-xs uppercase tracking-wider text-[var(--paper)] font-bold shadow-[2px_2px_0_var(--ink)] hover:opacity-90 transition-opacity"
        >
          Sign In to Continue
        </Link>
      </div>
    )
  }

  const filteredConversations = conversations.filter((c) => {
    const handle = c.otherParticipant?.handle || ''
    const name = c.otherParticipant?.display_name || ''
    const q = searchFilter.toLowerCase()
    return handle.toLowerCase().includes(q) || name.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[var(--line)] pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-[var(--clay)]">
            <MessageSquare className="h-4 w-4" />
            <span className="font-mono text-xs uppercase tracking-widest font-bold">
              Direct Inquiries & Author Talk
            </span>
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[var(--ink)] mt-1">
            Messages & Discourse
          </h1>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="border border-[var(--ink)] bg-[var(--paper-2)] shadow-[var(--shadow-hard)] grid grid-cols-1 md:grid-cols-12 min-h-[580px] h-[650px] overflow-hidden">
        {/* Left Pane: Conversations List */}
        <div
          className={`md:col-span-4 border-r border-[var(--line)] flex flex-col bg-[var(--paper)] ${
            activeConvId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Search Bar */}
          <div className="p-3 border-b border-[var(--line)]">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-[var(--ink-2)]" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs font-mono border border-[var(--line)] bg-[var(--paper-2)] text-[var(--ink)] placeholder:text-[var(--ink-2)] focus:outline-none focus:border-[var(--ink)]"
              />
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[var(--line)]">
            {isLoadingConvs ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-[var(--clay)]" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-6 text-center space-y-2 text-[var(--ink-2)] font-mono text-xs">
                <p>No conversations yet.</p>
                <p className="text-[11px]">
                  Browse the feed and tap <strong>"Discuss"</strong> on any dispatch to start a conversation with an author!
                </p>
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isActive = c.id === activeConvId
                const other = c.otherParticipant
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedConvId(c.id)}
                    className={`w-full text-left p-3.5 transition-colors flex items-start gap-3 ${
                      isActive
                        ? 'bg-[var(--paper-2)] border-l-4 border-l-[var(--clay)]'
                        : 'hover:bg-[var(--paper-2)]/60'
                    }`}
                  >
                    <div className="h-10 w-10 rounded-full border border-[var(--ink)] bg-[var(--paper-2)] shrink-0 overflow-hidden flex items-center justify-center text-xs font-bold text-[var(--clay)]">
                      {other?.avatar_url ? (
                        <img
                          src={other.avatar_url}
                          alt={other.handle}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        (other?.handle || 'A').slice(0, 2).toUpperCase()
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[var(--ink)] truncate">
                          {other?.display_name || `@${other?.handle}`}
                        </span>
                        {c.lastMessageAt && (
                          <span className="text-[10px] font-mono text-[var(--ink-2)] shrink-0">
                            {new Date(c.lastMessageAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] font-mono text-[var(--ink-2)] truncate">
                        @{other?.handle}
                      </p>

                      {c.lastMessage && (
                        <p className="text-xs text-[var(--ink-2)] truncate mt-0.5 font-sans">
                          {c.lastMessage.body}
                        </p>
                      )}

                      {c.topicPost && (
                        <span className="inline-block mt-1 font-mono text-[9px] uppercase px-1.5 py-0.2 bg-[var(--clay)]/10 text-[var(--clay)] border border-[var(--clay)]/30 rounded truncate max-w-full">
                          Topic: {c.topicPost.body?.slice(0, 24)}...
                        </span>
                      )}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Right Pane: Active Chat */}
        <div
          className={`md:col-span-8 flex flex-col bg-[var(--paper-2)] ${
            !activeConvId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="p-3.5 border-b border-[var(--line)] bg-[var(--paper)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedConvId(null)}
                    className="md:hidden text-[var(--ink)] p-1 hover:text-[var(--clay)]"
                    title="Back to conversations"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>

                  <Link
                    to={`/u/${activeConv.otherParticipant?.handle || 'member'}`}
                    className="h-9 w-9 rounded-full border border-[var(--ink)] bg-[var(--paper-2)] overflow-hidden flex items-center justify-center shrink-0 font-bold text-xs text-[var(--clay)]"
                  >
                    {activeConv.otherParticipant?.avatar_url ? (
                      <img
                        src={activeConv.otherParticipant.avatar_url}
                        alt={activeConv.otherParticipant.handle}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      (activeConv.otherParticipant?.handle || 'A').slice(0, 2).toUpperCase()
                    )}
                  </Link>

                  <div>
                    <Link
                      to={`/u/${activeConv.otherParticipant?.handle || 'member'}`}
                      className="font-serif text-sm font-bold text-[var(--ink)] hover:text-[var(--clay)] transition-colors flex items-center gap-1.5"
                    >
                      <span>
                        {activeConv.otherParticipant?.display_name ||
                          `@${activeConv.otherParticipant?.handle}`}
                      </span>
                      <ExternalLink className="h-3 w-3 text-[var(--ink-2)]" />
                    </Link>
                    <p className="font-mono text-[10px] text-[var(--ink-2)]">
                      @{activeConv.otherParticipant?.handle}
                    </p>
                  </div>
                </div>

                <Link
                  to={`/u/${activeConv.otherParticipant?.handle || 'member'}`}
                  className="font-mono text-xs text-[var(--clay)] border border-[var(--clay)] px-2.5 py-1 rounded shadow-[1px_1px_0_var(--clay)] hover:bg-[var(--clay)] hover:text-[var(--paper)] transition-all font-bold"
                >
                  View Profile
                </Link>
              </div>

              {/* Topic Post Banner (if discussion originated from a dispatch) */}
              {activeConv.topicPost && (
                <div className="p-2.5 px-4 bg-[var(--paper)] border-b border-[var(--line)] flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <Sparkles className="h-3.5 w-3.5 text-[var(--saffron)] shrink-0" />
                    <span className="font-mono text-[11px] text-[var(--ink-2)] uppercase font-bold shrink-0">
                      Discussing Topic:
                    </span>
                    <span className="truncate italic text-[var(--ink)]">
                      "{activeConv.topicPost.body}"
                    </span>
                  </div>
                  <Link
                    to={`/post/${activeConv.topicPost.id}`}
                    className="font-mono text-[11px] text-[var(--clay)] hover:underline shrink-0 flex items-center gap-1 font-bold"
                  >
                    <span>View Dispatch</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              )}

              {/* Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {isLoadingMsgs ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-[var(--clay)]" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-16 space-y-2 font-mono text-xs text-[var(--ink-2)]">
                    <p>No messages in this inquiry thread yet.</p>
                    <p className="text-[11px]">
                      Say hello to @{activeConv.otherParticipant?.handle} and start your discussion!
                    </p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isSender = m.sender_id === user.id
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isSender ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[78%] p-3 rounded shadow-sm text-xs leading-relaxed whitespace-pre-wrap ${
                            isSender
                              ? 'bg-[var(--clay)] text-[var(--paper)] rounded-br-none shadow-[1.5px_1.5px_0_var(--ink)]'
                              : 'bg-[var(--paper)] text-[var(--ink)] border border-[var(--line)] rounded-bl-none shadow-[1.5px_1.5px_0_var(--line)]'
                          }`}
                        >
                          {m.body}
                        </div>
                        <span className="text-[9px] font-mono text-[var(--ink-2)] mt-1 px-1">
                          {new Date(m.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Bar */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-[var(--line)] bg-[var(--paper)] flex gap-2"
              >
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`Discuss with @${activeConv.otherParticipant?.handle || 'author'}...`}
                  maxLength={3000}
                  className="flex-1 border border-[var(--ink)] bg-[var(--paper-2)] px-3 py-2 text-xs font-sans text-[var(--ink)] placeholder:text-[var(--ink-2)] placeholder:font-mono focus:outline-none focus:ring-1 focus:ring-[var(--clay)]"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim() || isSending}
                  className="border border-[var(--ink)] bg-[var(--clay)] px-4 py-2 font-mono text-xs uppercase tracking-wider text-[var(--paper)] font-bold flex items-center gap-1.5 shadow-[1.5px_1.5px_0_var(--ink)] hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <span>Send</span>
                      <Send className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[var(--ink-2)] font-mono text-xs space-y-2">
              <div className="h-12 w-12 rounded-full border border-[var(--line)] bg-[var(--paper)] flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-[var(--ink-2)]" />
              </div>
              <p className="font-bold text-[var(--ink)] text-sm">Select a Conversation</p>
              <p className="max-w-xs text-[11px]">
                Choose an inquiry from the list on the left, or discuss directly with any author from a feed dispatch.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export default MessagesPage
