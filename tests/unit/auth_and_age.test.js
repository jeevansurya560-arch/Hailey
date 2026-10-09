import { describe, it, expect } from 'vitest'
import {
  AGE_ELIGIBILITY,
  CONTENT_AGE_CLASSIFICATION,
  evaluateAgeAccessPolicy,
} from '../../backend/server/security/age/agePolicy.js'
import { AgeVerificationService } from '../../backend/server/security/age/ageVerificationService.js'

describe('server/security/age/agePolicy.js - 18+ Access Policy Matrix', () => {
  // ── 1. General Audience Content Matrix ──────────────────────────
  describe('GENERAL Content Access', () => {
    it('allows access to GENERAL content for MINOR when graphic safety is ALLOWED', () => {
      const res = evaluateAgeAccessPolicy({
        userEligibility: AGE_ELIGIBILITY.MINOR,
        contentClassification: CONTENT_AGE_CLASSIFICATION.GENERAL,
        graphicSafetyPolicyStatus: 'ALLOWED',
      })
      expect(res.allowed).toBe(true)
      expect(res.stage).toBe('cleared')
    })

    it('allows access to GENERAL content for UNVERIFIED when graphic safety is ALLOWED', () => {
      const res = evaluateAgeAccessPolicy({
        userEligibility: AGE_ELIGIBILITY.UNVERIFIED,
        contentClassification: CONTENT_AGE_CLASSIFICATION.GENERAL,
        graphicSafetyPolicyStatus: 'ALLOWED',
      })
      expect(res.allowed).toBe(true)
      expect(res.stage).toBe('cleared')
    })

    it('allows access to GENERAL content for ADULT when graphic safety is ALLOWED', () => {
      const res = evaluateAgeAccessPolicy({
        userEligibility: AGE_ELIGIBILITY.ADULT,
        contentClassification: CONTENT_AGE_CLASSIFICATION.GENERAL,
        graphicSafetyPolicyStatus: 'ALLOWED',
      })
      expect(res.allowed).toBe(true)
      expect(res.stage).toBe('cleared')
    })
  })

  // ── 2. ADULT_18_PLUS Content Matrix (Default-Deny) ──────────────
  describe('ADULT_18_PLUS Content Access (Default-Deny)', () => {
    it('DENIES 18+ content to MINOR users', () => {
      const res = evaluateAgeAccessPolicy({
        userEligibility: AGE_ELIGIBILITY.MINOR,
        contentClassification: CONTENT_AGE_CLASSIFICATION.ADULT_18_PLUS,
        graphicSafetyPolicyStatus: 'ALLOWED',
      })
      expect(res.allowed).toBe(false)
      expect(res.stage).toBe('age_restriction')
      expect(res.reason).toContain('restricted for minor accounts')
    })

    it('DENIES 18+ content to UNVERIFIED users', () => {
      const res = evaluateAgeAccessPolicy({
        userEligibility: AGE_ELIGIBILITY.UNVERIFIED,
        contentClassification: CONTENT_AGE_CLASSIFICATION.ADULT_18_PLUS,
        graphicSafetyPolicyStatus: 'ALLOWED',
      })
      expect(res.allowed).toBe(false)
      expect(res.stage).toBe('age_restriction')
      expect(res.reason).toContain('requires verified adult eligibility')
    })

    it('DENIES 18+ content to users in REQUIRES_REVIEW status', () => {
      const res = evaluateAgeAccessPolicy({
        userEligibility: AGE_ELIGIBILITY.REQUIRES_REVIEW,
        contentClassification: CONTENT_AGE_CLASSIFICATION.ADULT_18_PLUS,
        graphicSafetyPolicyStatus: 'ALLOWED',
      })
      expect(res.allowed).toBe(false)
      expect(res.stage).toBe('age_restriction')
      expect(res.reason).toContain('pending manual verification review')
    })

    it('ALLOWS 18+ content ONLY to verified ADULT when graphic safety is ALLOWED', () => {
      const res = evaluateAgeAccessPolicy({
        userEligibility: AGE_ELIGIBILITY.ADULT,
        contentClassification: CONTENT_AGE_CLASSIFICATION.ADULT_18_PLUS,
        graphicSafetyPolicyStatus: 'ALLOWED',
      })
      expect(res.allowed).toBe(true)
      expect(res.stage).toBe('cleared')
    })
  })

  // ── 3. Unclassified & Under-Review Content ───────────────────────
  describe('UNCLASSIFIED and AGE_RESTRICTED_REVIEW Content Access', () => {
    it('DENIES UNCLASSIFIED content to MINOR and UNVERIFIED users', () => {
      const resMinor = evaluateAgeAccessPolicy({
        userEligibility: AGE_ELIGIBILITY.MINOR,
        contentClassification: CONTENT_AGE_CLASSIFICATION.UNCLASSIFIED,
        graphicSafetyPolicyStatus: 'ALLOWED',
      })
      expect(resMinor.allowed).toBe(false)

      const resUnverified = evaluateAgeAccessPolicy({
        userEligibility: AGE_ELIGIBILITY.UNVERIFIED,
        contentClassification: CONTENT_AGE_CLASSIFICATION.UNCLASSIFIED,
        graphicSafetyPolicyStatus: 'ALLOWED',
      })
      expect(resUnverified.allowed).toBe(false)
    })

    it('DENIES AGE_RESTRICTED_REVIEW content to all users until classification completes', () => {
      const resAdult = evaluateAgeAccessPolicy({
        userEligibility: AGE_ELIGIBILITY.ADULT,
        contentClassification: CONTENT_AGE_CLASSIFICATION.AGE_RESTRICTED_REVIEW,
        graphicSafetyPolicyStatus: 'ALLOWED',
      })
      expect(resAdult.allowed).toBe(false)
      expect(resAdult.reason).toContain('undergoing age restriction classification review')
    })
  })

  // ── 4. Composition with Phase 5 Graphic Safety ──────────────────
  describe('Composition with Phase 5 Graphic Safety Invariants', () => {
    it('DENIES access to ADULT if Phase 5 status is BLOCKED', () => {
      const res = evaluateAgeAccessPolicy({
        userEligibility: AGE_ELIGIBILITY.ADULT,
        contentClassification: CONTENT_AGE_CLASSIFICATION.ADULT_18_PLUS,
        graphicSafetyPolicyStatus: 'BLOCKED',
      })
      expect(res.allowed).toBe(false)
      expect(res.stage).toBe('graphic_safety')
      expect(res.reason).toContain('Phase 5 graphic content safety policy')
    })

    it('DENIES access to ADULT if Phase 5 status is REVIEW_REQUIRED', () => {
      const res = evaluateAgeAccessPolicy({
        userEligibility: AGE_ELIGIBILITY.ADULT,
        contentClassification: CONTENT_AGE_CLASSIFICATION.ADULT_18_PLUS,
        graphicSafetyPolicyStatus: 'REVIEW_REQUIRED',
      })
      expect(res.allowed).toBe(false)
      expect(res.stage).toBe('graphic_safety')
    })

    it('DENIES access to ADULT if Phase 5 status is FAILED', () => {
      const res = evaluateAgeAccessPolicy({
        userEligibility: AGE_ELIGIBILITY.ADULT,
        contentClassification: CONTENT_AGE_CLASSIFICATION.ADULT_18_PLUS,
        graphicSafetyPolicyStatus: 'FAILED',
      })
      expect(res.allowed).toBe(false)
      expect(res.stage).toBe('graphic_safety')
    })

    it('DENIES access to ADULT if Phase 5 status is NOT_ANALYZED', () => {
      const res = evaluateAgeAccessPolicy({
        userEligibility: AGE_ELIGIBILITY.ADULT,
        contentClassification: CONTENT_AGE_CLASSIFICATION.ADULT_18_PLUS,
        graphicSafetyPolicyStatus: 'NOT_ANALYZED',
      })
      expect(res.allowed).toBe(false)
      expect(res.stage).toBe('graphic_safety')
    })
  })
})

describe('server/security/age/ageVerificationService.js - Service Authoritative Methods', () => {
  it('returns default UNVERIFIED eligibility for invalid, null or unknown user ID', async () => {
    const resNull = await AgeVerificationService.getUserAgeEligibility(null)
    expect(resNull.eligibility).toBe(AGE_ELIGIBILITY.UNVERIFIED)
    expect(resNull.verifiedAt).toBeNull()

    const resEmpty = await AgeVerificationService.getUserAgeEligibility('')
    expect(resEmpty.eligibility).toBe(AGE_ELIGIBILITY.UNVERIFIED)
  })

  it('rejects setting invalid eligibility state', async () => {
    const res = await AgeVerificationService.setUserAgeEligibility(
      '00000000-0000-0000-0000-000000000001',
      'SUPER_ADULT'
    )
    expect(res.success).toBe(false)
    expect(res.error).toContain('Invalid eligibility state')
  })

  it('evaluates content access for unauthenticated user as UNVERIFIED', async () => {
    const res = await AgeVerificationService.isContentAccessAllowed(
      null,
      CONTENT_AGE_CLASSIFICATION.ADULT_18_PLUS,
      'ALLOWED'
    )
    expect(res.allowed).toBe(false)
    expect(res.stage).toBe('age_restriction')
  })
})
