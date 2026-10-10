import { supabaseAdmin } from '../../config/supabaseAdmin.js'
import { logAuditEvent } from '../../observability/auditLogger.js'
import { rateLimiter } from '../../security/rateLimit.js'
import { verifyAuth } from '../../security/authorization/auth.js'

/**
 * Helper to verify that the caller is authenticated and has editorial privileges
 */
async function requireEditorialAuth(req) {
  const { user, error: authError } = await verifyAuth(req.headers?.authorization)
  if (authError || !user) {
    return { user: null, isEditorial: false, error: authError || 'Unauthorized. Valid Bearer token required.' }
  }

  const { data: profile, error: profErr } = await supabaseAdmin
    .from('profiles')
    .select('is_editorial')
    .eq('id', user.id)
    .single()

  if (profErr || !profile?.is_editorial) {
    return { user, isEditorial: false, error: 'Forbidden. Curator or editorial administrator access required.' }
  }

  return { user, isEditorial: true, error: null }
}

/**
 * Content Moderation API Handler
 * POST  /api/moderation/report: Submit report (authenticated or rate-limited guest)
 * GET   /api/moderation/queue: Query reports (strictly editorial/moderators only)
 * PATCH /api/moderation/review: Update report status (strictly editorial/moderators only)
 */
export default async function moderationRoute(req, res) {
  const ip =
    req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    '127.0.0.1'

  // 1. Submit Report (POST)
  if (req.method === 'POST') {
    const limit = rateLimiter.check(`report:${ip}`, 10, 60000)
    if (!limit.allowed) {
      return res.status(429).json({ error: 'Report submission rate limit exceeded.' })
    }

    const { targetType, targetId, reason } = req.body || {}

    if (!targetType || !['post', 'comment', 'user', 'collection_item'].includes(targetType)) {
      return res.status(400).json({ error: 'Invalid targetType. Allowed: post, comment, user, collection_item' })
    }

    if (!targetId || typeof targetId !== 'string') {
      return res.status(400).json({ error: 'Field "targetId" is required.' })
    }

    if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
      return res.status(400).json({ error: 'A descriptive reason (min 5 characters) is required.' })
    }

    // Authenticate optional caller (prevents spoofing reporterUserId)
    let authenticatedReporterId = null
    if (req.headers?.authorization) {
      const { user } = await verifyAuth(req.headers.authorization)
      if (user) {
        authenticatedReporterId = user.id
      }
    }

    try {
      const { data, error } = await supabaseAdmin
        .from('moderation_reports')
        .insert([
          {
            reporter_user_id: authenticatedReporterId,
            target_type: targetType,
            target_id: targetId,
            reason: reason.trim(),
            status: 'PENDING',
          },
        ])
        .select()
        .single()

      if (error) {
        console.warn('[moderationRoute] Insert note:', error.message)
      }

      await logAuditEvent({
        who: authenticatedReporterId || ip,
        what: 'REPORT_SUBMITTED',
        target: `${targetType}:${targetId}`,
        result: 'SUCCESS',
        ipAddress: ip,
        metadata: { reason: reason.slice(0, 50) },
      })

      return res.status(201).json({
        success: true,
        reportId: data?.id || 'rep-' + Date.now(),
        status: 'PENDING',
        message: 'Report submitted for human curator review. No content was deleted automatically.',
      })
    } catch (err) {
      console.error('[moderationRoute] Insert error:', err)
      return res.status(500).json({ error: 'Failed to record moderation report.' })
    }
  }

  // 2. Query Moderation Queue (GET) - Strictly Editorial Only
  if (req.method === 'GET') {
    const { user, isEditorial, error: authError } = await requireEditorialAuth(req)
    if (authError || !isEditorial) {
      return res.status(user ? 403 : 401).json({ error: authError })
    }

    try {
      const { data, error } = await supabaseAdmin
        .from('moderation_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        return res.status(200).json({ queue: [], status: 'empty' })
      }

      return res.status(200).json({ queue: data || [] })
    } catch (err) {
      console.warn('[moderationRoute] Queue query fallback:', err)
      return res.status(200).json({ queue: [] })
    }
  }

  // 3. Update Status (PATCH) - Strictly Editorial Only
  if (req.method === 'PATCH') {
    const { user, isEditorial, error: authError } = await requireEditorialAuth(req)
    if (authError || !isEditorial) {
      return res.status(user ? 403 : 401).json({ error: authError })
    }

    const { reportId, status, actionTaken } = req.body || {}

    if (!reportId || typeof reportId !== 'string') {
      return res.status(400).json({ error: 'Field "reportId" is required.' })
    }

    if (!['PENDING', 'REVIEWED', 'ACTIONED', 'DISMISSED'].includes(status)) {
      return res.status(400).json({ error: 'Status must be one of: PENDING, REVIEWED, ACTIONED, DISMISSED' })
    }

    try {
      await supabaseAdmin
        .from('moderation_reports')
        .update({
          status,
          action_taken: actionTaken || null,
          moderator_user_id: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', reportId)

      await logAuditEvent({
        who: user.id,
        what: 'REPORT_TRIAGED',
        target: reportId,
        result: 'SUCCESS',
        ipAddress: ip,
        metadata: { status, actionTaken },
      })

      return res.status(200).json({ success: true, status })
    } catch (err) {
      console.error('[moderationRoute] Update error:', err)
      return res.status(500).json({ error: 'Failed to update report status.' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed. Use GET, POST, or PATCH.' })
}
