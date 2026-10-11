import { supabase } from '@/lib/supabase/client'
import { CURATED_CULTURAL_COLLECTIONS } from './culturalCollectionsData'

export { CURATED_CULTURAL_COLLECTIONS }

/**
 * Fetch collection detail, curator status for user, collection items, and user's recent posts
 */
export async function fetchCollectionDetail({ collectionId, currentUserId = null }) {
  if (!collectionId) throw new Error('Collection ID is required.')

  // Check if requested ID is one of our curated cultural collections
  const curatedMatch = CURATED_CULTURAL_COLLECTIONS.find(
    (c) => c.id === collectionId || c.community?.slug === collectionId
  )

  if (curatedMatch) {
    return {
      collection: {
        id: curatedMatch.id,
        title: curatedMatch.title,
        description: curatedMatch.description,
        created_at: curatedMatch.created_at,
        owner_id: 'curated-owner',
        community_id: curatedMatch.community?.id,
        profiles: curatedMatch.owner,
        communities: curatedMatch.community,
      },
      isCurator: true,
      items: curatedMatch.items.map((it) => ({
        ...it,
        profiles: { handle: it.added_by_handle, display_name: it.added_by_handle },
      })),
      userPosts: [],
    }
  }

  // Otherwise, attempt Supabase fetch
  try {
    const { data: collection, error: collErr } = await supabase
      .from('collections')
      .select(`
        id,
        title,
        description,
        created_at,
        owner_id,
        community_id,
        profiles!collections_owner_id_fkey (
          handle,
          display_name
        ),
        communities (
          id,
          slug,
          name
        )
      `)
      .eq('id', collectionId)
      .single()

    if (!collErr && collection) {
      // 2. Check curator status
      let isCurator = false
      if (currentUserId && collection.community_id) {
        const { data: membership } = await supabase
          .from('memberships')
          .select('role')
          .eq('community_id', collection.community_id)
          .eq('user_id', currentUserId)
          .maybeSingle()

        isCurator = membership?.role === 'curator'
      }

      // 3. Fetch items in this collection
      const { data: items } = await supabase
        .from('collection_items')
        .select(`
          id,
          collection_id,
          added_by,
          kind,
          post_id,
          url,
          note,
          status,
          decided_at,
          created_at,
          profiles!collection_items_added_by_fkey (
            handle,
            display_name
          ),
          posts (
            id,
            body,
            media_url,
            created_at,
            profiles (handle)
          )
        `)
        .eq('collection_id', collectionId)
        .order('created_at', { ascending: false })

      // 4. Fetch user's own posts for propose dropdown
      let userPosts = []
      if (currentUserId) {
        const { data: myPosts } = await supabase
          .from('posts')
          .select('id, body, created_at')
          .eq('author_id', currentUserId)
          .order('created_at', { ascending: false })
          .limit(20)
        userPosts = myPosts || []
      }

      return {
        collection,
        isCurator,
        items: items || [],
        userPosts,
      }
    }
  } catch (err) {
    console.warn('[collectionService] Supabase offline, serving fallback cultural collection:', err.message)
  }

  // Graceful fallback to primary curated collection
  const fallback = CURATED_CULTURAL_COLLECTIONS[0]
  return {
    collection: {
      id: fallback.id,
      title: fallback.title,
      description: fallback.description,
      created_at: fallback.created_at,
      owner_id: 'curated-owner',
      community_id: fallback.community?.id,
      profiles: fallback.owner,
      communities: fallback.community,
    },
    isCurator: true,
    items: fallback.items.map((it) => ({
      ...it,
      profiles: { handle: it.added_by_handle, display_name: it.added_by_handle },
    })),
    userPosts: [],
  }
}

/**
 * Fetch collections for a community
 */
export async function fetchCommunityCollections(communityId) {
  if (!communityId) return []

  try {
    const { data, error } = await supabase
      .from('collections')
      .select(`
        id,
        title,
        description,
        created_at,
        owner_id,
        community_id,
        collection_items (count)
      `)
      .eq('community_id', communityId)
      .order('created_at', { ascending: false })

    if (!error && data && data.length > 0) {
      return data
    }
  } catch {
    // Fallback to curated
  }

  // Match curated collections for this community or return curated catalog
  const matching = CURATED_CULTURAL_COLLECTIONS.filter(
    (c) => c.community?.id === communityId || c.community?.slug === communityId
  )

  const source = matching.length > 0 ? matching : CURATED_CULTURAL_COLLECTIONS.slice(0, 2)

  return source.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    created_at: c.created_at,
    owner_id: 'curated-owner',
    community_id: communityId,
    collection_items: [{ count: c.items.length }],
    profiles: c.owner,
    preview_thumbnails: c.items.map((it) => it.image_url),
  }))
}

/**
 * Propose an item to a collection
 */
export async function proposeCollectionItem({ collectionId, addedBy, kind, postId = null, url = null, note = '', status = 'pending' }) {
  if (!collectionId || !addedBy) {
    throw new Error('Collection ID and Submitter ID are required.')
  }

  const payload = {
    collection_id: collectionId,
    added_by: addedBy,
    kind,
    post_id: kind === 'post' ? postId : null,
    url: kind === 'link' ? url : null,
    note: note.trim() || null,
    status,
  }

  const { data, error } = await supabase
    .from('collection_items')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Create a new collection
 */
export async function createCollection({ communityId, ownerId, title, description = '' }) {
  if (!communityId || !ownerId || !title.trim()) {
    throw new Error('Community ID, Owner ID, and Title are required.')
  }

  const { data, error } = await supabase
    .from('collections')
    .insert({
      community_id: communityId,
      owner_id: ownerId,
      title: title.trim(),
      description: description.trim() || null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Triage a proposed item (approve / reject) via the authenticated backend endpoint
 */
export async function triageCollectionItem({ itemId, action, accessToken }) {
  if (!itemId || !action || !accessToken) {
    throw new Error('Item ID, action, and valid access token are required.')
  }

  const response = await fetch('/api/approve-item', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ itemId, action }),
  })

  const result = await response.json()
  if (!response.ok) {
    throw new Error(result.error || `Failed to ${action} item (${response.status})`)
  }

  return result
}
