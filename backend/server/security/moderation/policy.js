/**
 * Content Safety Policy Engine for Hailey.
 *
 * Implements strict separation between detection (what the media contains)
 * and policy (what action Hailey takes).
 */

export const DEFAULT_GRAPHIC_CONTENT_POLICY = {
  version: 'graphic-content-v1',
  categories: {
    blood: {
      reviewThreshold: 0.40,
      blockThreshold: 0.75,
    },
    graphicViolence: {
      reviewThreshold: 0.35,
      blockThreshold: 0.70,
    },
    gore: {
      reviewThreshold: 0.30,
      blockThreshold: 0.65,
    },
    severeInjury: {
      reviewThreshold: 0.35,
      blockThreshold: 0.70,
    },
  },
  overallRisk: {
    reviewThreshold: 0.40,
    blockThreshold: 0.70,
  },
}

/**
 * @typedef {Object} PolicyEvaluationResult
 * @property {'ALLOWED' | 'REVIEW_REQUIRED' | 'RESTRICTED' | 'BLOCKED' | 'FAILED'} decision
 * @property {'ALLOWED' | 'REVIEW_REQUIRED' | 'RESTRICTED' | 'BLOCKED' | 'FAILED'} policyStatus
 * @property {boolean} allowed Whether the media is cleared for publishing
 * @property {string} policyVersion Applied policy version string
 * @property {string[]} reasons Explicit list of policy violations or review triggers
 * @property {string} evaluatedAt ISO timestamp
 */

/**
 * Evaluates a normalized safety analysis against the graphic content policy.
 *
 * @param {import('./providers/providerInterface.js').NormalizedSafetyResult} analysis
 * @param {typeof DEFAULT_GRAPHIC_CONTENT_POLICY} [customPolicy]
 * @returns {PolicyEvaluationResult}
 */
export function evaluateGraphicContentPolicy(analysis, customPolicy = DEFAULT_GRAPHIC_CONTENT_POLICY) {
  const policy = {
    version: customPolicy.version || DEFAULT_GRAPHIC_CONTENT_POLICY.version,
    categories: {
      ...DEFAULT_GRAPHIC_CONTENT_POLICY.categories,
      ...(customPolicy.categories || {}),
    },
    overallRisk: {
      ...DEFAULT_GRAPHIC_CONTENT_POLICY.overallRisk,
      ...(customPolicy.overallRisk || {}),
    },
  }

  const evaluatedAt = new Date().toISOString()

  // 1. Safety Invariant: Handle Analysis Failures and Unsupported Content
  // ANALYSIS_FAILED != ALLOWED, NOT_ANALYZED != ALLOWED
  if (!analysis || typeof analysis !== 'object' || analysis.status !== 'ANALYZED') {
    const errorMsg = analysis?.error || 'Safety analysis is incomplete, unsupported, or failed'
    return {
      decision: 'FAILED',
      policyStatus: 'FAILED',
      allowed: false,
      policyVersion: policy.version,
      reasons: [errorMsg, 'Unanalyzed or failed media cannot be automatically allowed for publishing.'],
      evaluatedAt,
    }
  }

  const categories = analysis.categories || {}
  const reasons = []
  let highestSeverity = 'ALLOWED' // 'ALLOWED' -> 'REVIEW_REQUIRED' -> 'BLOCKED'

  // 2. Evaluate Individual Category Thresholds
  for (const [categoryName, thresholdConfig] of Object.entries(policy.categories)) {
    const catAnalysis = categories[categoryName]
    const score = typeof catAnalysis?.score === 'number' ? catAnalysis.score : 0.0

    if (score >= thresholdConfig.blockThreshold) {
      highestSeverity = 'BLOCKED'
      reasons.push(
        `Category '${categoryName}' score (${score.toFixed(2)}) exceeds block threshold (${thresholdConfig.blockThreshold.toFixed(2)})`
      )
    } else if (score >= thresholdConfig.reviewThreshold) {
      if (highestSeverity !== 'BLOCKED') {
        highestSeverity = 'REVIEW_REQUIRED'
      }
      reasons.push(
        `Category '${categoryName}' score (${score.toFixed(2)}) exceeds review threshold (${thresholdConfig.reviewThreshold.toFixed(2)})`
      )
    }
  }

  // 3. Evaluate Aggregated Overall Risk
  const overallRisk = typeof analysis.overallRisk === 'number' ? analysis.overallRisk : 0.0
  if (overallRisk >= policy.overallRisk.blockThreshold) {
    highestSeverity = 'BLOCKED'
    reasons.push(
      `Overall graphic risk (${overallRisk.toFixed(2)}) exceeds block threshold (${policy.overallRisk.blockThreshold.toFixed(2)})`
    )
  } else if (overallRisk >= policy.overallRisk.reviewThreshold) {
    if (highestSeverity !== 'BLOCKED') {
      highestSeverity = 'REVIEW_REQUIRED'
    }
    reasons.push(
      `Overall graphic risk (${overallRisk.toFixed(2)}) exceeds review threshold (${policy.overallRisk.reviewThreshold.toFixed(2)})`
    )
  }

  // 4. Final Policy Formulation
  if (highestSeverity === 'BLOCKED') {
    return {
      decision: 'BLOCKED',
      policyStatus: 'BLOCKED',
      allowed: false,
      policyVersion: policy.version,
      reasons,
      evaluatedAt,
    }
  }

  if (highestSeverity === 'REVIEW_REQUIRED') {
    return {
      decision: 'REVIEW_REQUIRED',
      policyStatus: 'REVIEW_REQUIRED',
      allowed: false,
      policyVersion: policy.version,
      reasons,
      evaluatedAt,
    }
  }

  return {
    decision: 'ALLOWED',
    policyStatus: 'ALLOWED',
    allowed: true,
    policyVersion: policy.version,
    reasons: ['Media passed all graphic safety thresholds.'],
    evaluatedAt,
  }
}
