import { supabaseAdmin } from '../../config/supabaseAdmin.js'
import { relayer } from '../../blockchain/relayer/relayer.js'
import { computeCommunityId } from '../../../../shared/crypto/hashing.js'

/**
 * Processes queued and failed attestation jobs with exponential backoff and idempotency.
 * @param {number} batchSize
 * @returns {Promise<{ processed: number, succeeded: number, failed: number, skipped: number }>}
 */
export async function processAttestationJobs(batchSize = 10) {
  const now = new Date().toISOString()

  // 1. Fetch eligible jobs
  const { data: jobs, error: fetchErr } = await supabaseAdmin
    .from('attestation_jobs')
    .select(`
      id,
      contribution_id,
      status,
      attempts,
      max_attempts,
      contributions (
        id,
        user_id,
        community_id,
        content_hash,
        status,
        communities ( slug ),
        profiles:user_id ( wallet_address )
      )
    `)
    .in('status', ['queued', 'failed'])
    .lte('next_attempt_at', now)
    .order('created_at', { ascending: true })
    .limit(batchSize)

  if (fetchErr) {
    console.error('[attestationWorker] Failed to query attestation_jobs:', fetchErr)
    throw new Error('Database error querying attestation_jobs: ' + fetchErr.message)
  }

  if (!jobs || jobs.length === 0) {
    return { processed: 0, succeeded: 0, failed: 0, skipped: 0 }
  }

  let succeeded = 0
  let failed = 0
  let skipped = 0

  for (const job of jobs) {
    // 2. Mark processing atomically
    const { data: claimed, error: claimErr } = await supabaseAdmin
      .from('attestation_jobs')
      .update({ status: 'processing' })
      .eq('id', job.id)
      .in('status', ['queued', 'failed'])
      .select('id')

    if (claimErr || !claimed || claimed.length === 0) {
      // Job was claimed concurrently by another worker
      skipped++
      continue
    }

    const contribution = job.contributions
    if (!contribution) {
      await supabaseAdmin
        .from('attestation_jobs')
        .update({
          status: 'dead_letter',
          last_error: 'Referenced contribution not found',
        })
        .eq('id', job.id)
      failed++
      continue
    }

    const walletAddress = contribution.profiles?.wallet_address
    if (!walletAddress) {
      // Contributor has not linked wallet yet; keep queued for later
      const backoffSecs = Math.min(300, Math.pow(2, job.attempts + 1) * 30)
      const nextAttempt = new Date(Date.now() + backoffSecs * 1000).toISOString()
      await supabaseAdmin
        .from('attestation_jobs')
        .update({
          status: 'queued',
          last_error: 'Awaiting contributor wallet link',
          next_attempt_at: nextAttempt,
        })
        .eq('id', job.id)
      skipped++
      continue
    }

    const communitySlug = contribution.communities?.slug || 'general'
    const communityIdBytes = computeCommunityId(communitySlug)

    try {
      const attestRes = await relayer.attest({
        contributor: walletAddress,
        communityId: communityIdBytes,
        contentHash: contribution.content_hash,
      })

      if (attestRes.status === 'attested') {
        const completedAt = new Date().toISOString()
        // Update job
        await supabaseAdmin
          .from('attestation_jobs')
          .update({
            status: 'confirmed',
            tx_hash: attestRes.txHash,
            completed_at: completedAt,
            last_error: null,
          })
          .eq('id', job.id)

        // Update contribution
        await supabaseAdmin
          .from('contributions')
          .update({
            status: 'attested',
            tx_hash: attestRes.txHash,
            attested_at: completedAt,
            error: null,
          })
          .eq('id', contribution.id)

        succeeded++
      } else if (attestRes.status === 'submitted') {
        // Submitted to mempool
        await supabaseAdmin
          .from('attestation_jobs')
          .update({
            status: 'submitted',
            tx_hash: attestRes.txHash,
            last_error: attestRes.error,
          })
          .eq('id', job.id)

        await supabaseAdmin
          .from('contributions')
          .update({
            status: 'submitted',
            tx_hash: attestRes.txHash,
            error: attestRes.error,
          })
          .eq('id', contribution.id)

        succeeded++
      } else {
        // Failed
        const newAttempts = job.attempts + 1
        const isDeadLetter = newAttempts >= job.max_attempts
        const backoffSecs = Math.pow(2, newAttempts) * 10
        const nextAttempt = new Date(Date.now() + backoffSecs * 1000).toISOString()

        await supabaseAdmin
          .from('attestation_jobs')
          .update({
            status: isDeadLetter ? 'dead_letter' : 'failed',
            attempts: newAttempts,
            last_error: attestRes.error,
            next_attempt_at: nextAttempt,
          })
          .eq('id', job.id)

        await supabaseAdmin
          .from('contributions')
          .update({
            status: 'failed',
            error: attestRes.error,
          })
          .eq('id', contribution.id)

        failed++
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      const newAttempts = job.attempts + 1
      const isDeadLetter = newAttempts >= job.max_attempts
      const backoffSecs = Math.pow(2, newAttempts) * 10
      const nextAttempt = new Date(Date.now() + backoffSecs * 1000).toISOString()

      await supabaseAdmin
        .from('attestation_jobs')
        .update({
          status: isDeadLetter ? 'dead_letter' : 'failed',
          attempts: newAttempts,
          last_error: errMsg,
          next_attempt_at: nextAttempt,
        })
        .eq('id', job.id)

      failed++
    }
  }

  return { processed: jobs.length, succeeded, failed, skipped }
}

export default processAttestationJobs
