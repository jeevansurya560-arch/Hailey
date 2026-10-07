import { verifyAuth } from '../server/auth.js'
import { supabaseAdmin } from '../server/supabaseAdmin.js'
import { validateApproveItemInput } from '../server/validate.js'
import { computeCommunityId, computeContentHash } from '../server/hash.js'
import { relayer } from '../server/relayer.js'

export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' })
  }

  try {
    // 1. Authenticate caller via Supabase JWT
    const { user, error: authError } = await verifyAuth(req.headers.authorization)
    if (authError || !user) {
      return res.status(401).json({ error: authError || 'Unauthorized. Valid Bearer token required.' })
    }

    // 2. Validate input payload
    const { data: input, error: valError } = validateApproveItemInput(req.body)
    if (valError || !input) {
      return res.status(400).json({ error: valError || 'Invalid input payload.' })
    }

    const { itemId, action } = input

    // 3. Fetch item, collection, and contributor profile
    const { data: item, error: itemError } = await supabaseAdmin
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
        collections (
          id,
          community_id,
          communities (
            id,
            slug,
            name
          )
        ),
        profiles!collection_items_added_by_fkey (
          id,
          handle,
          wallet_address
        )
      `)
      .eq('id', itemId)
      .single()

    if (itemError || !item) {
      return res.status(404).json({ error: 'Collection item not found.' })
    }

    // 4. Status must be 'pending' (409 Conflict otherwise)
    if (item.status !== 'pending') {
      return res.status(409).json({
        error: `Item is already decided (current status: '${item.status}').`,
        currentStatus: item.status,
      })
    }

    // 5. Ensure collection is part of a community
    const collection = item.collections
    if (!collection || !collection.community_id || !collection.communities) {
      return res.status(400).json({
        error: 'Personal collection items do not require curator approval.',
      })
    }

    const communityId = collection.community_id
    const communitySlug = collection.communities.slug

    // 6. Verify caller is a curator of this community (403 Forbidden)
    const { data: membership, error: memError } = await supabaseAdmin
      .from('memberships')
      .select('role')
      .eq('community_id', communityId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (memError || !membership || membership.role !== 'curator') {
      return res.status(403).json({
        error: 'Forbidden. Only designated curators of this community can decide proposals.',
      })
    }

    // 7. Anti-self-dealing check: Approver must not be the proposer (403 Forbidden)
    if (item.added_by === user.id) {
      return res.status(403).json({
        error: 'Forbidden. Curators cannot approve or decide their own submissions.',
      })
    }

    const decidedAt = new Date().toISOString()

    // 8. Handle Rejection
    if (action === 'reject') {
      const { data: updatedReject, error: rejectError } = await supabaseAdmin
        .from('collection_items')
        .update({
          status: 'rejected',
          decided_by: user.id,
          decided_at: decidedAt,
        })
        .eq('id', item.id)
        .eq('status', 'pending')
        .select('id')

      if (rejectError) {
        return res.status(500).json({ error: 'Failed to reject item: ' + rejectError.message })
      }

      if (!updatedReject || updatedReject.length === 0) {
        return res.status(409).json({ error: 'Item was already decided concurrently by another curator.' })
      }

      return res.status(200).json({
        ok: true,
        status: 'rejected',
        itemId: item.id,
      })
    }

    // 9. Handle Approval
    // 9a. Update collection_items status to 'approved' atomically
    const { data: updatedApprove, error: approveError } = await supabaseAdmin
      .from('collection_items')
      .update({
        status: 'approved',
        decided_by: user.id,
        decided_at: decidedAt,
      })
      .eq('id', item.id)
      .eq('status', 'pending')
      .select('id')

    if (approveError) {
      return res.status(500).json({ error: 'Failed to approve item: ' + approveError.message })
    }

    if (!updatedApprove || updatedApprove.length === 0) {
      return res.status(409).json({ error: 'Item was already decided concurrently by another curator.' })
    }

    // 9b. Compute deterministic canonical content hash
    const contributorProfile = item.profiles
    const contributorAddress = contributorProfile?.wallet_address || null

    const contentHash = computeContentHash({
      itemId: item.id,
      collectionId: collection.id,
      communitySlug,
      item: {
        kind: item.kind,
        post_id: item.post_id || undefined,
        url: item.url || undefined,
        note: item.note || undefined,
      },
    })

    const initialAttestStatus = contributorAddress ? 'submitted' : 'awaiting_wallet'

    // 9c. Create contributions row (unique per item_id, ON CONFLICT DO NOTHING)
    const { data: contribution } = await supabaseAdmin
      .from('contributions')
      .upsert(
        {
          item_id: item.id,
          user_id: item.added_by,
          community_id: communityId,
          content_hash: contentHash,
          status: initialAttestStatus,
        },
        { onConflict: 'item_id', ignoreDuplicates: true }
      )
      .select('id, content_hash, status, tx_hash, created_at')
      .maybeSingle()

    // 10–15. Onchain Relayer Attestation Flow (Day 7)
    let attestResult = {
      status: initialAttestStatus,
    }

    if (contributorAddress && (process.env.ATTESTOR_PRIVATE_KEY || process.env.RELAYER_PRIVATE_KEY)) {
      try {
        const communityIdBytes = computeCommunityId(communitySlug)
        const relayerRes = await relayer.attest({
          contributor: contributorAddress,
          communityId: communityIdBytes,
          contentHash,
        })

        attestResult = relayerRes

        // Update contributions record with transaction hash and final status
        await supabaseAdmin
          .from('contributions')
          .update({
            status: relayerRes.status,
            tx_hash: relayerRes.txHash || null,
            error: relayerRes.error || null,
            attested_at: relayerRes.status === 'attested' ? new Date().toISOString() : null,
          })
          .eq('item_id', item.id)
      } catch (relayerErr) {
        const msg = relayerErr instanceof Error ? relayerErr.message : 'Relayer attestation execution error'
        console.warn('[approve-item] Relayer execution skipped or failed:', msg)
        attestResult = { status: 'submitted', error: msg }
      }
    }

    return res.status(200).json({
      ok: true,
      status: 'approved',
      attest: attestResult.status,
      txHash: attestResult.txHash || null,
      itemId: item.id,
      contribution: contribution || null,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    console.error('[approve-item] Unhandled error:', err)
    return res.status(500).json({ error: message })
  }
}
