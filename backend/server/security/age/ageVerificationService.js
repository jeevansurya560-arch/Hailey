import { supabaseAdmin } from '../../config/supabaseAdmin.js'
import {
  AGE_ELIGIBILITY,
  CONTENT_AGE_CLASSIFICATION,
  evaluateAgeAccessPolicy,
} from './agePolicy.js'

/**
 * Server-authoritative service for managing user age eligibility and 18+ content access.
 */
export class AgeVerificationService {
  /**
   * Fetches authoritative age eligibility for a user from database.
   * Default-denies to UNVERIFIED if no record exists.
   *
   * @param {string} userId
   * @returns {Promise<{ eligibility: string, verifiedAt: string | null, method: string }>}
   */
  static async getUserAgeEligibility(userId) {
    if (!userId || typeof userId !== 'string') {
      return {
        eligibility: AGE_ELIGIBILITY.UNVERIFIED,
        verifiedAt: null,
        method: 'unverified',
      }
    }

    try {
      const { data, error } = await supabaseAdmin
        .from('user_age_eligibility')
        .select('eligibility, verified_at, verification_method')
        .eq('user_id', userId)
        .maybeSingle()

      if (error || !data) {
        return {
          eligibility: AGE_ELIGIBILITY.UNVERIFIED,
          verifiedAt: null,
          method: 'unverified',
        }
      }

      return {
        eligibility: data.eligibility || AGE_ELIGIBILITY.UNVERIFIED,
        verifiedAt: data.verified_at || null,
        method: data.verification_method || 'unverified',
      }
    } catch {
      return {
        eligibility: AGE_ELIGIBILITY.UNVERIFIED,
        verifiedAt: null,
        method: 'unverified',
      }
    }
  }

  /**
   * Sets authoritative age eligibility for a user (Service-role only).
   * Never stores raw identity documents or DOB.
   *
   * @param {string} userId
   * @param {keyof typeof AGE_ELIGIBILITY} eligibility
   * @param {Object} [metadata]
   * @param {string} [metadata.method]
   * @param {string} [metadata.provider]
   * @param {string} [metadata.referenceId] Opaque provider reference token
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  static async setUserAgeEligibility(userId, eligibility, metadata = {}) {
    if (!userId || typeof userId !== 'string') {
      return { success: false, error: 'Invalid userId' }
    }

    if (!Object.values(AGE_ELIGIBILITY).includes(eligibility)) {
      return { success: false, error: `Invalid eligibility state: ${eligibility}` }
    }

    try {
      const { error } = await supabaseAdmin
        .from('user_age_eligibility')
        .upsert({
          user_id: userId,
          eligibility,
          verified_at: eligibility === AGE_ELIGIBILITY.ADULT ? new Date().toISOString() : null,
          verification_method: metadata.method || 'unverified',
          provider: metadata.provider || null,
          reference_id: metadata.referenceId || null,
          updated_at: new Date().toISOString(),
        })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  }

  /**
   * Evaluates whether a user is authorized to access a given content item.
   *
   * @param {string | null} userId
   * @param {keyof typeof CONTENT_AGE_CLASSIFICATION} contentClassification
   * @param {string} [graphicSafetyPolicyStatus]
   * @returns {Promise<import('./agePolicy.js').AgeAccessEvaluationResult>}
   */
  static async isContentAccessAllowed(
    userId,
    contentClassification = CONTENT_AGE_CLASSIFICATION.GENERAL,
    graphicSafetyPolicyStatus = 'ALLOWED'
  ) {
    let userEligibility = AGE_ELIGIBILITY.UNVERIFIED
    if (userId) {
      const record = await this.getUserAgeEligibility(userId)
      userEligibility = record.eligibility
    }

    return evaluateAgeAccessPolicy({
      userEligibility,
      contentClassification,
      graphicSafetyPolicyStatus,
    })
  }
}
