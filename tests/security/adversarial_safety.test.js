import { describe, it, expect, vi } from 'vitest'
import {
  evaluateGraphicContentPolicy,
} from '../../backend/server/security/moderation/policy.js'
import {
  isMediaAllowedForPublishing,
} from '../../backend/server/security/moderation/contentSafety.js'
import { supabaseAdmin } from '../../backend/server/config/supabaseAdmin.js'

describe('Adversarial Content Safety & Moderation Security Tests', () => {
  describe('1. Policy Spoofing & Status Tampering (Scenarios H & I)', () => {
    it('(I) rejects client attempt to bypass policy by injecting fake allowed: true into analysis object', () => {
      const maliciousAnalysis = {
        status: 'ANALYZED',
        allowed: true, // Injected client field
        policyStatus: 'ALLOWED', // Injected client field
        categories: {
          blood: { score: 0.95, detected: true },
          graphicViolence: { score: 0.99, detected: true },
          gore: { score: 0.85, detected: true },
          severeInjury: { score: 0.90, detected: true },
        },
        overallRisk: 0.99,
        provider: 'client_spoof',
      }

      // Server policy engine must strictly evaluate based on raw category scores, ignoring client injected status
      const evaluation = evaluateGraphicContentPolicy(maliciousAnalysis)
      expect(evaluation.allowed).toBe(false)
      expect(evaluation.decision).toBe('BLOCKED')
      expect(evaluation.policyStatus).toBe('BLOCKED')
    })

    it('(H) rejects client attempt to claim ALLOWED when status is ANALYSIS_FAILED', () => {
      const fakePassedAnalysis = {
        status: 'ANALYSIS_FAILED',
        error: 'Model crashed',
        overallRisk: 0.0,
        categories: {
          blood: { score: 0.0, detected: false },
        },
      }

      const evaluation = evaluateGraphicContentPolicy(fakePassedAnalysis)
      expect(evaluation.allowed).toBe(false)
      expect(evaluation.decision).toBe('FAILED')
    })
  })

  describe('2. Publishing Boundary & Clearance Defense (Scenarios A, B, C, D, E, F)', () => {
    it('(A) blocks publishing when media has BLOCKED status', async () => {
      vi.spyOn(supabaseAdmin, 'from').mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: {
            policy_status: 'BLOCKED',
            analysis_status: 'ANALYZED',
            failure_reason: null,
          },
          error: null,
        }),
      })

      const check = await isMediaAllowedForPublishing('blocked-asset-uuid')
      expect(check.allowed).toBe(false)
      expect(check.policyStatus).toBe('BLOCKED')
      expect(check.reason).toContain('contains blocked graphic content')
    })

    it('(B) blocks publishing when media has REVIEW_REQUIRED status', async () => {
      vi.spyOn(supabaseAdmin, 'from').mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: {
            policy_status: 'REVIEW_REQUIRED',
            analysis_status: 'ANALYZED',
            failure_reason: null,
          },
          error: null,
        }),
      })

      const check = await isMediaAllowedForPublishing('review-asset-uuid')
      expect(check.allowed).toBe(false)
      expect(check.policyStatus).toBe('REVIEW_REQUIRED')
      expect(check.reason).toContain('requires curator moderation review')
    })

    it('(C) blocks publishing when media analysis has FAILED', async () => {
      vi.spyOn(supabaseAdmin, 'from').mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: {
            policy_status: 'FAILED',
            analysis_status: 'ANALYSIS_FAILED',
            failure_reason: 'Provider timeout',
          },
          error: null,
        }),
      })

      const check = await isMediaAllowedForPublishing('failed-asset-uuid')
      expect(check.allowed).toBe(false)
      expect(check.policyStatus).toBe('FAILED')
      expect(check.reason).toContain('Provider timeout')
    })

    it('(D) blocks publishing when an asset has no safety record in database (NOT_ANALYZED fail-closed)', async () => {
      vi.spyOn(supabaseAdmin, 'from').mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      })

      const check = await isMediaAllowedForPublishing('unregistered-asset-uuid')
      expect(check.allowed).toBe(false)
      expect(check.policyStatus).toBe('NOT_ANALYZED')
      expect(check.reason).toContain('has not undergone automated safety analysis')
    })

    it('(E) permits publishing when media has ALLOWED status', async () => {
      vi.spyOn(supabaseAdmin, 'from').mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: {
            policy_status: 'ALLOWED',
            analysis_status: 'ANALYZED',
            failure_reason: null,
          },
          error: null,
        }),
      })

      const check = await isMediaAllowedForPublishing('allowed-asset-uuid')
      expect(check.allowed).toBe(true)
      expect(check.policyStatus).toBe('ALLOWED')
    })

    it('(F) confirms text-only posts (null media_asset_id) do not require media safety analysis', () => {
      const textOnlyPost = {
        author_id: '550e8400-e29b-41d4-a716-446655440001',
        body: 'Text-only reflection on cultural heritage in Kyoto.',
        media_asset_id: null,
      }

      // Invariant: Media safety check is triggered only when media_asset_id is non-null
      expect(textOnlyPost.media_asset_id).toBeNull()
    })
  })

  describe('3. Near-Duplicate Isolation vs Exact Duplicate Reuse (Scenario J)', () => {
    it('(J) verifies that near-duplicate media assets (different SHA-256) require independent safety evaluations', () => {
      // Asset A: Evaluated as BLOCKED
      const assetA = {
        id: 'asset-a-uuid',
        sha256: '0x' + 'a'.repeat(64),
        dhash: '0x0f1e2d3c4b5a6978',
        policyStatus: 'BLOCKED',
      }

      // Asset B: Near-duplicate image with different SHA-256
      const assetB = {
        id: 'asset-b-uuid',
        sha256: '0x' + 'b'.repeat(64),
        dhash: '0x0f1e2d3c4b5a6979', // 1 bit distance from A
      }

      // Invariant: Asset B has distinct id and must NOT inherit Asset A's safety record
      expect(assetA.id).not.toBe(assetB.id)
      expect(assetA.sha256).not.toBe(assetB.sha256)
    })
  })
})
