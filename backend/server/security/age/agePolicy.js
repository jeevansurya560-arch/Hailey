/**
 * Age Eligibility & Content Classification Constants and Policy Rules.
 *
 * Enforces strict separation between identity authentication and age eligibility.
 * Adult (18+) content is fail-closed for all minors and unverified users.
 */

export const AGE_ELIGIBILITY = {
  UNVERIFIED: 'UNVERIFIED',
  MINOR: 'MINOR',
  ADULT: 'ADULT',
  REQUIRES_REVIEW: 'REQUIRES_REVIEW',
}

export const CONTENT_AGE_CLASSIFICATION = {
  GENERAL: 'GENERAL',
  ADULT_18_PLUS: 'ADULT_18_PLUS',
  AGE_RESTRICTED_REVIEW: 'AGE_RESTRICTED_REVIEW',
  UNCLASSIFIED: 'UNCLASSIFIED',
}

/**
 * @typedef {Object} AgeAccessEvaluationResult
 * @property {boolean} allowed Whether the user is permitted to view/access the content
 * @property {string} reason Descriptive rationale for the decision
 * @property {'graphic_safety' | 'age_restriction' | 'cleared'} stage
 */

/**
 * Evaluates access to content composing Phase 5 graphic safety and Phase 6 age eligibility.
 *
 * @param {Object} params
 * @param {keyof typeof AGE_ELIGIBILITY} [params.userEligibility] User's authoritative age status
 * @param {keyof typeof CONTENT_AGE_CLASSIFICATION} [params.contentClassification] Content classification
 * @param {string} [params.graphicSafetyPolicyStatus] Phase 5 graphic content status (e.g. 'ALLOWED', 'BLOCKED')
 * @returns {AgeAccessEvaluationResult}
 */
export function evaluateAgeAccessPolicy({
  userEligibility = AGE_ELIGIBILITY.UNVERIFIED,
  contentClassification = CONTENT_AGE_CLASSIFICATION.GENERAL,
  graphicSafetyPolicyStatus = 'ALLOWED',
} = {}) {
  // 1. Phase 5 Graphic Safety Invariant: Must be strictly 'ALLOWED'
  if (graphicSafetyPolicyStatus !== 'ALLOWED') {
    return {
      allowed: false,
      reason: `Access blocked by Phase 5 graphic content safety policy (status: ${graphicSafetyPolicyStatus})`,
      stage: 'graphic_safety',
    }
  }

  // 2. Evaluate General Audience Content
  if (contentClassification === CONTENT_AGE_CLASSIFICATION.GENERAL) {
    return {
      allowed: true,
      reason: 'General audience content is permitted for all users.',
      stage: 'cleared',
    }
  }

  // 3. Evaluate Adult (18+) Content: Default-Deny for Minors and Unverified
  if (contentClassification === CONTENT_AGE_CLASSIFICATION.ADULT_18_PLUS) {
    if (userEligibility === AGE_ELIGIBILITY.ADULT) {
      return {
        allowed: true,
        reason: 'Verified adult granted access to 18+ content.',
        stage: 'cleared',
      }
    }

    if (userEligibility === AGE_ELIGIBILITY.MINOR) {
      return {
        allowed: false,
        reason: 'Access denied: 18+ adult content is strictly restricted for minor accounts.',
        stage: 'age_restriction',
      }
    }

    if (userEligibility === AGE_ELIGIBILITY.REQUIRES_REVIEW) {
      return {
        allowed: false,
        reason: 'Access denied: Account age eligibility is pending manual verification review.',
        stage: 'age_restriction',
      }
    }

    // Default: UNVERIFIED
    return {
      allowed: false,
      reason: 'Access denied: 18+ adult content requires verified adult eligibility.',
      stage: 'age_restriction',
    }
  }

  // 4. Evaluate Age Restricted Review Content
  if (contentClassification === CONTENT_AGE_CLASSIFICATION.AGE_RESTRICTED_REVIEW) {
    return {
      allowed: false,
      reason: 'Access denied: Content is currently undergoing age restriction classification review.',
      stage: 'age_restriction',
    }
  }

  // 5. Evaluate Unclassified Content (Fail-closed for non-adults)
  if (contentClassification === CONTENT_AGE_CLASSIFICATION.UNCLASSIFIED) {
    if (userEligibility === AGE_ELIGIBILITY.ADULT) {
      return {
        allowed: true,
        reason: 'Verified adult permitted access to unclassified content.',
        stage: 'cleared',
      }
    }
    return {
      allowed: false,
      reason: 'Access denied: Unclassified content is restricted until age classification completes.',
      stage: 'age_restriction',
    }
  }

  return {
    allowed: false,
    reason: 'Access denied: Unknown content classification.',
    stage: 'age_restriction',
  }
}
