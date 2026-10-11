import { supabase } from '@/lib/supabase/client'

/**
 * Fetch all conversations for the current user with other participant details and topic post
 */
export async function fetchConversations(userId) {
  if (!userId) return []

  const { data: convs, error } = await supabase
    .from('conversations')
    .select(`
      id,
      participant1_id,
      participant2_id,
      topic_post_id,
      last_message_at,
      created_at,
      p1:profiles!participant1_id(id, handle, display_name, avatar_url, bio),
      p2:profiles!participant2_id(id, handle, display_name, avatar_url, bio),
      topic_post:posts!topic_post_id(id, body, media_url)
    `)
    .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
    .order('last_message_at', { ascending: false })

  if (error) {
    console.warn('Failed to fetch conversations:', error.message)
    return []
  }

  // Hydrate each conversation with otherParticipant and the latest message
  const result = await Promise.all(
    (convs || []).map(async (c) => {
      const otherParticipant = c.participant1_id === userId ? c.p2 : c.p1

      const { data: latestMsg } = await supabase
        .from('messages')
        .select('id, sender_id, body, created_at')
        .eq('conversation_id', c.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      return {
        id: c.id,
        otherParticipant: otherParticipant || { handle: 'member', display_name: 'Member' },
        topicPost: c.topic_post,
        lastMessage: latestMsg || null,
        lastMessageAt: c.last_message_at,
        createdAt: c.created_at,
      }
    })
  )

  return result
}

/**
 * Retrieve or create a direct conversation between two users (e.g. reader & post author)
 */
export async function getOrCreateConversation({ currentUserId, otherUserId, topicPostId = null }) {
  if (!currentUserId || !otherUserId) {
    throw new Error('Both currentUserId and otherUserId are required.')
  }

  if (currentUserId === otherUserId) {
    throw new Error('Cannot start a direct message thread with yourself.')
  }

  // 1. Look for existing conversation
  const { data: existing, error: searchError } = await supabase
    .from('conversations')
    .select(`
      id,
      participant1_id,
      participant2_id,
      topic_post_id,
      last_message_at,
      created_at,
      p1:profiles!participant1_id(id, handle, display_name, avatar_url, bio),
      p2:profiles!participant2_id(id, handle, display_name, avatar_url, bio),
      topic_post:posts!topic_post_id(id, body, media_url)
    `)
    .or(
      `and(participant1_id.eq.${currentUserId},participant2_id.eq.${otherUserId}),and(participant1_id.eq.${otherUserId},participant2_id.eq.${currentUserId})`
    )
    .maybeSingle()

  if (existing && !searchError) {
    const other = existing.participant1_id === currentUserId ? existing.p2 : existing.p1
    return {
      id: existing.id,
      otherParticipant: other || { handle: 'member', display_name: 'Member' },
      topicPost: existing.topic_post,
      lastMessageAt: existing.last_message_at,
      createdAt: existing.created_at,
    }
  }

  // 2. Create new conversation
  const { data: created, error: createError } = await supabase
    .from('conversations')
    .insert({
      participant1_id: currentUserId,
      participant2_id: otherUserId,
      topic_post_id: topicPostId || null,
    })
    .select(`
      id,
      participant1_id,
      participant2_id,
      topic_post_id,
      last_message_at,
      created_at,
      p1:profiles!participant1_id(id, handle, display_name, avatar_url, bio),
      p2:profiles!participant2_id(id, handle, display_name, avatar_url, bio),
      topic_post:posts!topic_post_id(id, body, media_url)
    `)
    .single()

  if (createError) throw createError

  const other = created.participant1_id === currentUserId ? created.p2 : created.p1
  return {
    id: created.id,
    otherParticipant: other || { handle: 'member', display_name: 'Member' },
    topicPost: created.topic_post,
    lastMessageAt: created.last_message_at,
    createdAt: created.created_at,
  }
}

/**
 * Fetch messages within a conversation
 */
export async function fetchMessages(conversationId) {
  if (!conversationId) return []

  const { data, error } = await supabase
    .from('messages')
    .select(`
      id,
      conversation_id,
      sender_id,
      body,
      created_at,
      profiles:sender_id (id, handle, display_name, avatar_url)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) {
    console.warn('Failed to fetch messages:', error.message)
    return []
  }

  return (data || []).map((m) => ({
    ...m,
    sender: m.profiles || { handle: 'member', display_name: 'Member' },
  }))
}

/**
 * Send a message in a conversation
 */
export async function sendMessage({ conversationId, senderId, body }) {
  if (!conversationId || !senderId || !body?.trim()) {
    throw new Error('Conversation ID, sender ID, and message text are required.')
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      body: body.trim(),
    })
    .select(`
      id,
      conversation_id,
      sender_id,
      body,
      created_at,
      profiles:sender_id (id, handle, display_name, avatar_url)
    `)
    .single()

  if (error) throw new Error(`Failed to send message: ${error.message}`)

  // Update last_message_at
  await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId)

  return {
    ...data,
    sender: data.profiles || { handle: 'member', display_name: 'Member' },
  }
}
