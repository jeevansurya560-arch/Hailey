import { supabaseAdmin } from '../../config/supabaseAdmin.js'
import { evaluateGraphicContentPolicy, DEFAULT_GRAPHIC_CONTENT_POLICY } from './policy.js'
import { MockSafetyProvider } from './providers/mockProvider.js'
import { UnconfiguredSafetyProvider } from './providers/unconfiguredProvider.js'

let defaultProviderInstance = null

export function getDefaultSafetyProvider() {
  if (!defaultProviderInstance) {
    const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true'
    defaultProviderInstance = isTest ? new MockSafetyProvider() : new UnconfiguredSafetyProvider()
  }
  return defaultProviderInstance
}

export function setDefaultSafetyProvider(provider) {
  defaultProviderInstance = provider
}

/**
 * Runs server-authoritative safety analysis on a registered media asset.
 *
 * @param {string} mediaAssetId UUID of the media_assets row
 * @param {Uint8Array | ArrayBuffer | Buffer} rawBytes Media file bytes (or pixel buffer)
 * @param {Object} [options]
 * @param {import('./providers/providerInterface.js').ContentSafetyProviderInterface} [options.provider]
 * @param {typeof DEFAULT_GRAPHIC_CONTENT_POLICY} [options.policyConfig]
 * @param {boolean} [options.forceReanalyze]
 * @returns {Promise<{
 *   analysis: import('./providers/providerInterface.js').NormalizedSafetyResult,
 *   policy: import('./policy.js').PolicyEvaluationResult,
 *   analysisId: string | null
 * }>}
 */
export async function runMediaSafetyAnalysis(mediaAssetId, rawBytes, options = {}) {
  if (!mediaAssetId || typeof mediaAssetId !== 'string') {
    throw new TypeError('mediaAssetId must be a non-empty string')
  }

  // 1. Fetch Media Asset Metadata from Trusted Database
  const { data: mediaAsset, error: mediaError } = await supabaseAdmin
    .from('media_assets')
    .select('id, media_type, sha256_hash')
    .eq('id', mediaAssetId)
    .single()

  if (mediaError || !mediaAsset) {
    throw new Error(`Media asset '${mediaAssetId}' not found: ${mediaError?.message || 'Not found'}`)
  }

  // 2. Check for Existing Completed Analysis (Idempotent Reuse)
  if (!options.forceReanalyze) {
    const { data: existingAnalysis } = await supabaseAdmin
      .from('media_safety_analyses')
      .select('*')
      .eq('media_asset_id', mediaAssetId)
      .eq('analysis_status', 'ANALYZED')
      .maybeSingle()

    if (existingAnalysis) {
      const policyResult = evaluateGraphicContentPolicy(
        {
          status: existingAnalysis.analysis_status,
          categories: existingAnalysis.category_scores,
          overallRisk: existingAnalysis.overall_score,
          provider: existingAnalysis.provider,
          model: existingAnalysis.model,
          modelVersion: existingAnalysis.model_version,
          analyzedAt: existingAnalysis.analyzed_at,
        },
        options.policyConfig || DEFAULT_GRAPHIC_CONTENT_POLICY
      )

      return {
        analysis: {
          status: existingAnalysis.analysis_status,
          categories: existingAnalysis.category_scores,
          overallRisk: existingAnalysis.overall_score,
          provider: existingAnalysis.provider,
          model: existingAnalysis.model,
          modelVersion: existingAnalysis.model_version,
          analyzedAt: existingAnalysis.analyzed_at,
          error: existingAnalysis.failure_reason || null,
        },
        policy: policyResult,
        analysisId: existingAnalysis.id,
        isReused: true,
      }
    }
  }

  // 3. Resolve Safety Provider Adapter
  const provider = options.provider || getDefaultSafetyProvider()

  // 4. Execute Analysis based on Media Type
  let analysisResult
  if (mediaAsset.media_type === 'video') {
    analysisResult = await provider.analyzeVideo(rawBytes, options)
  } else {
    analysisResult = await provider.analyzeImage(rawBytes, options)
  }

  // 5. Evaluate Policy Engine
  const policyResult = evaluateGraphicContentPolicy(
    analysisResult,
    options.policyConfig || DEFAULT_GRAPHIC_CONTENT_POLICY
  )

  // 6. Record Authoritative Analysis in Database
  const analysisRecord = {
    media_asset_id: mediaAssetId,
    analysis_status: analysisResult.status,
    policy_status: policyResult.policyStatus,
    overall_score: analysisResult.overallRisk,
    category_scores: analysisResult.categories,
    provider: analysisResult.provider,
    model: analysisResult.model,
    model_version: analysisResult.modelVersion,
    policy_version: policyResult.policyVersion,
    failure_reason: analysisResult.error || null,
    analyzed_at: analysisResult.analyzedAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { data: savedRecord, error: saveError } = await supabaseAdmin
    .from('media_safety_analyses')
    .upsert(analysisRecord, { onConflict: 'media_asset_id' })
    .select('id')
    .maybeSingle()

  if (saveError) {
    console.warn('[contentSafety] Database persistence warning:', saveError.message)
  }

  return {
    analysis: analysisResult,
    policy: policyResult,
    analysisId: savedRecord?.id || null,
    isReused: false,
  }
}

/**
 * Server-authoritative publishing clearance check.
 * Strictly prevents unanalyzed, failed, or blocked media from being published.
 *
 * @param {string} mediaAssetId
 * @returns {Promise<{ allowed: boolean, policyStatus: string, reason?: string }>}
 */
export async function isMediaAllowedForPublishing(mediaAssetId) {
  if (!mediaAssetId || typeof mediaAssetId !== 'string') {
    return {
      allowed: false,
      policyStatus: 'NOT_ANALYZED',
      reason: 'Invalid media asset identifier',
    }
  }

  const { data: analysis, error } = await supabaseAdmin
    .from('media_safety_analyses')
    .select('analysis_status, policy_status, failure_reason')
    .eq('media_asset_id', mediaAssetId)
    .maybeSingle()

  if (error || !analysis) {
    return {
      allowed: false,
      policyStatus: 'NOT_ANALYZED',
      reason: 'Media has not undergone automated safety analysis',
    }
  }

  if (analysis.policy_status === 'ALLOWED') {
    return {
      allowed: true,
      policyStatus: 'ALLOWED',
    }
  }

  if (analysis.policy_status === 'BLOCKED') {
    return {
      allowed: false,
      policyStatus: 'BLOCKED',
      reason: 'Media contains blocked graphic content (blood, violence, gore, or injury)',
    }
  }

  if (analysis.policy_status === 'REVIEW_REQUIRED') {
    return {
      allowed: false,
      policyStatus: 'REVIEW_REQUIRED',
      reason: 'Media requires curator moderation review before publishing',
    }
  }

  return {
    allowed: false,
    policyStatus: analysis.policy_status || 'FAILED',
    reason: analysis.failure_reason || 'Media safety analysis did not yield an approved policy state',
  }
}
