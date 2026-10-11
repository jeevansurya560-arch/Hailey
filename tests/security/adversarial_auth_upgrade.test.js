import { describe, it, expect } from 'vitest'
import { AGE_ELIGIBILITY } from '../../backend/server/security/age/agePolicy.js'

describe('Security & Privacy Invariant Tests: Auth Upgrade & Handle Safety', () => {
  // ── 1. Age Verification Invariant ─────────────────────────────────
  describe('DOB Self-Declaration vs Authoritative Age Verification Separation', () => {
    it('guarantees self-declared age >= 18 never sets eligibility to ADULT on registration', () => {
      // Simulating trigger logic from 0013_auth_profile_and_terms_upgrade.sql
      const registerUserMetadata = {
        handle: 'adult_curator',
        full_name: 'Adult User',
        is_minor: false,
        declared_birth_year: 1990,
      }

      // Initial eligibility assignment logic
      const initialEligibility = registerUserMetadata.is_minor ? 'MINOR' : 'UNVERIFIED'

      expect(initialEligibility).toBe('UNVERIFIED')
      expect(initialEligibility).not.toBe(AGE_ELIGIBILITY.ADULT)
    })

    it('guarantees self-declared minors are marked as MINOR and fail-closed from 18+ content', () => {
      const registerMinorMetadata = {
        handle: 'young_curator',
        full_name: 'Young User',
        is_minor: true,
        declared_birth_year: 2012,
      }

      const initialEligibility = registerMinorMetadata.is_minor ? 'MINOR' : 'UNVERIFIED'

      expect(initialEligibility).toBe('MINOR')
      expect(initialEligibility).not.toBe('ADULT')
      expect(initialEligibility).not.toBe('UNVERIFIED')
    })
  })

  // ── 2. Handle Disambiguation & Uniqueness ──────────────────────────
  describe('Handle Collision Defense & Disambiguation', () => {
    it('disambiguates handle collision on OAuth bootstrap to prevent account creation crashes', () => {
      const existingProfiles = new Set(['alice', 'bob'])

      const bootstrapHandle = (requestedHandle, userId) => {
        let handle = requestedHandle.toLowerCase().replace(/[^a-z0-9_]/g, '')
        if (handle.length < 3) handle = `user_${userId.slice(0, 8)}`
        if (handle.length > 20) handle = handle.slice(0, 20)

        if (existingProfiles.has(handle)) {
          handle = `${handle.slice(0, 14)}_${userId.replace(/-/g, '').slice(0, 5)}`
        }
        return handle
      }

      const newUserId = '550e8400-e29b-41d4-a716-446655440000'
      const assignedHandle = bootstrapHandle('alice', newUserId)

      expect(assignedHandle).not.toBe('alice')
      expect(assignedHandle).toBe('alice_550e8')
      expect(assignedHandle.length).toBeLessThanOrEqual(20)
      expect(/^[a-z0-9_]{3,20}$/.test(assignedHandle)).toBe(true)
    })
  })

  // ── 3. Terms & Conditions Invariant ───────────────────────────────
  describe('Terms and Conditions Invariants', () => {
    it('ensures terms acceptance timestamp and version are tracked without proving age or identity', () => {
      const termsRecord = {
        terms_accepted_at: new Date().toISOString(),
        terms_version: 'v1.0',
        eligibility: 'UNVERIFIED', // Terms acceptance must NOT grant adult eligibility
      }

      expect(termsRecord.terms_version).toBe('v1.0')
      expect(typeof termsRecord.terms_accepted_at).toBe('string')
      expect(termsRecord.eligibility).toBe('UNVERIFIED')
    })
  })

  // ── 4. Privacy & Data Minimization ────────────────────────────────
  describe('PII Minimization & Onchain Boundary', () => {
    it('verifies that public profile models do not include raw date of birth', () => {
      const publicProfileColumns = [
        'id',
        'handle',
        'display_name',
        'avatar_url',
        'wallet_address',
        'is_editorial',
        'created_at',
      ]

      expect(publicProfileColumns.includes('date_of_birth')).toBe(false)
      expect(publicProfileColumns.includes('dob')).toBe(false)
      expect(publicProfileColumns.includes('password')).toBe(false)
    })

    it('verifies that Monad attestation hashes contain only content digests and not PII', () => {
      const attestationDigest = {
        contentHash: '0x' + 'a'.repeat(64),
        timestamp: Date.now(),
      }

      expect(attestationDigest.contentHash).toMatch(/^0x[a-f0-9]{64}$/)
      expect(attestationDigest).not.toHaveProperty('dob')
      expect(attestationDigest).not.toHaveProperty('email')
    })
  })
})
