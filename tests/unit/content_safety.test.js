import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  evaluateGraphicContentPolicy,
} from '../../backend/server/security/moderation/policy.js'
import { MockSafetyProvider } from '../../backend/server/security/moderation/providers/mockProvider.js'
import {
  runMediaSafetyAnalysis,
  isMediaAllowedForPublishing,
} from '../../backend/server/security/moderation/contentSafety.js'
import { supabaseAdmin } from '../../backend/server/config/supabaseAdmin.js'

describe('Content Safety & Graphic Content Moderation Unit Tests', () => {
  let mockProvider

  beforeEach(() => {
    mockProvider = new MockSafetyProvider()
  })

  describe('1. Detection vs Policy Evaluation', () => {
    it('evaluates safe media as ALLOWED', async () => {
      mockProvider.simulateSafe()
      const analysis = await mockProvider.analyzeImage(new Uint8Array([1, 2, 3]))
      const policy = evaluateGraphicContentPolicy(analysis)

      expect(policy.decision).toBe('ALLOWED')
      expect(policy.policyStatus).toBe('ALLOWED')
      expect(policy.allowed).toBe(true)
      expect(policy.policyVersion).toBe('graphic-content-v1')
    })

    it('evaluates high graphic violence (>0.70) as BLOCKED', async () => {
      mockProvider.simulateViolence(0.88)
      const analysis = await mockProvider.analyzeImage(new Uint8Array([1, 2, 3]))
      const policy = evaluateGraphicContentPolicy(analysis)

      expect(policy.decision).toBe('BLOCKED')
      expect(policy.policyStatus).toBe('BLOCKED')
      expect(policy.allowed).toBe(false)
      expect(policy.reasons.some((r) => r.includes('graphicViolence'))).toBe(true)
    })

    it('evaluates borderline graphic violence (0.45) as REVIEW_REQUIRED', async () => {
      mockProvider.simulateViolence(0.45) // Between 0.35 review and 0.70 block
      const analysis = await mockProvider.analyzeImage(new Uint8Array([1, 2, 3]))
      const policy = evaluateGraphicContentPolicy(analysis)

      expect(policy.decision).toBe('REVIEW_REQUIRED')
      expect(policy.policyStatus).toBe('REVIEW_REQUIRED')
      expect(policy.allowed).toBe(false)
      expect(policy.reasons.some((r) => r.includes('graphicViolence'))).toBe(true)
    })
  })

  describe('2. Independent Category Handling', () => {
    it('evaluates blood independently (>0.75 is BLOCKED)', async () => {
      mockProvider.simulateBlood(0.85)
      const analysis = await mockProvider.analyzeImage(new Uint8Array([1, 2, 3]))
      const policy = evaluateGraphicContentPolicy(analysis)

      expect(policy.decision).toBe('BLOCKED')
      expect(policy.reasons.some((r) => r.includes('blood'))).toBe(true)
    })

    it('evaluates gore independently (>0.65 is BLOCKED)', async () => {
      mockProvider.simulateGore(0.72)
      const analysis = await mockProvider.analyzeImage(new Uint8Array([1, 2, 3]))
      const policy = evaluateGraphicContentPolicy(analysis)

      expect(policy.decision).toBe('BLOCKED')
      expect(policy.reasons.some((r) => r.includes('gore'))).toBe(true)
    })

    it('evaluates severe injury independently (>0.70 is BLOCKED)', async () => {
      mockProvider.simulateSevereInjury(0.79)
      const analysis = await mockProvider.analyzeImage(new Uint8Array([1, 2, 3]))
      const policy = evaluateGraphicContentPolicy(analysis)

      expect(policy.decision).toBe('BLOCKED')
      expect(policy.reasons.some((r) => r.includes('severeInjury'))).toBe(true)
    })
  })

  describe('3. Uncertainty & Analysis Failure Safety Invariants', () => {
    it('ensures ANALYSIS_FAILED is NEVER evaluated as ALLOWED', async () => {
      mockProvider.setSimulatedFailure(true, 'Classifier internal timeout')
      const analysis = await mockProvider.analyzeImage(new Uint8Array([1, 2, 3]))

      expect(analysis.status).toBe('ANALYSIS_FAILED')
      const policy = evaluateGraphicContentPolicy(analysis)

      expect(policy.decision).toBe('FAILED')
      expect(policy.policyStatus).toBe('FAILED')
      expect(policy.allowed).toBe(false)
      expect(policy.reasons.some((r) => r.includes('Unanalyzed or failed media'))).toBe(true)
    })

    it('ensures null or invalid analysis is NEVER evaluated as ALLOWED', () => {
      const policyNull = evaluateGraphicContentPolicy(null)
      expect(policyNull.allowed).toBe(false)
      expect(policyNull.decision).toBe('FAILED')

      const policyEmpty = evaluateGraphicContentPolicy({})
      expect(policyEmpty.allowed).toBe(false)
      expect(policyEmpty.decision).toBe('FAILED')
    })
  })

  describe('4. Policy Threshold Customization & Versioning', () => {
    it('supports custom policy thresholds dynamically', async () => {
      mockProvider.simulateBlood(0.50) // Normally REVIEW in default policy

      const strictPolicy = {
        version: 'strict-graphic-v2',
        categories: {
          blood: { reviewThreshold: 0.20, blockThreshold: 0.45 },
        },
      }

      const analysis = await mockProvider.analyzeImage(new Uint8Array([1, 2, 3]))
      const policy = evaluateGraphicContentPolicy(analysis, strictPolicy)

      expect(policy.policyVersion).toBe('strict-graphic-v2')
      expect(policy.decision).toBe('BLOCKED')
    })
  })

  describe('5. Video Analysis Safety Handling', () => {
    it('returns structured UNSUPPORTED status for video without pretending to decode container bytes', async () => {
      const videoBytes = new Uint8Array([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70]) // fake mp4
      const analysis = await mockProvider.analyzeVideo(videoBytes)

      expect(analysis.status).toBe('UNSUPPORTED')
      expect(analysis.error).toContain('Video frame extraction')

      const policy = evaluateGraphicContentPolicy(analysis)
      expect(policy.allowed).toBe(false)
      expect(policy.policyStatus).toBe('FAILED')
    })
  })

  describe('6. Orchestrator & Duplicate Interaction', () => {
    it('executes analysis and records trusted safety metadata via contentSafety orchestrator', async () => {
      const sampleAssetId = '550e8400-e29b-41d4-a716-446655440010'

      // Mock DB interactions
      vi.spyOn(supabaseAdmin, 'from').mockImplementation((table) => {
        if (table === 'media_assets') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { id: sampleAssetId, media_type: 'image', sha256_hash: '0x' + '1'.repeat(64) },
              error: null,
            }),
          }
        }
        if (table === 'media_safety_analyses') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            upsert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'analysis-123' }, error: null }),
              }),
            }),
          }
        }
        return {}
      })

      mockProvider.simulateSafe()
      const result = await runMediaSafetyAnalysis(sampleAssetId, new Uint8Array([1, 2, 3]), {
        provider: mockProvider,
      })

      expect(result.policy.decision).toBe('ALLOWED')
      expect(result.analysis.provider).toBe('mock_graphic_safety')
      expect(result.analysis.modelVersion).toBe('v1.0.0-test')
      expect(result.isReused).toBe(false)
    })

    it('reuses existing completed analysis for exact duplicate media', async () => {
      const sampleAssetId = '550e8400-e29b-41d4-a716-446655440011'

      // Mock DB finding existing analysis
      vi.spyOn(supabaseAdmin, 'from').mockImplementation((table) => {
        if (table === 'media_assets') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { id: sampleAssetId, media_type: 'image', sha256_hash: '0x' + '2'.repeat(64) },
              error: null,
            }),
          }
        }
        if (table === 'media_safety_analyses') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                id: 'existing-analysis-999',
                media_asset_id: sampleAssetId,
                analysis_status: 'ANALYZED',
                policy_status: 'ALLOWED',
                overall_score: 0.05,
                category_scores: { blood: { score: 0.02, detected: false } },
                provider: 'mock_graphic_safety',
                model: 'mock_vision_classifier',
                model_version: 'v1.0.0-test',
                analyzed_at: '2026-10-08T12:00:00Z',
              },
              error: null,
            }),
          }
        }
        return {}
      })

      const analyzeSpy = vi.spyOn(mockProvider, 'analyzeImage')
      const result = await runMediaSafetyAnalysis(sampleAssetId, new Uint8Array([1, 2, 3]), {
        provider: mockProvider,
      })

      expect(result.isReused).toBe(true)
      expect(result.policy.decision).toBe('ALLOWED')
      // Provider analyzeImage must NOT be called when reusing
      expect(analyzeSpy).not.toHaveBeenCalled()
    })

    it('does NOT allow publishing for unanalyzed, blocked, or failed media', async () => {
      // 1. Unanalyzed
      vi.spyOn(supabaseAdmin, 'from').mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      })

      const check1 = await isMediaAllowedForPublishing('asset-unanalyzed')
      expect(check1.allowed).toBe(false)
      expect(check1.policyStatus).toBe('NOT_ANALYZED')

      // 2. Blocked
      vi.spyOn(supabaseAdmin, 'from').mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: { policy_status: 'BLOCKED', analysis_status: 'ANALYZED' },
          error: null,
        }),
      })

      const check2 = await isMediaAllowedForPublishing('asset-blocked')
      expect(check2.allowed).toBe(false)
      expect(check2.policyStatus).toBe('BLOCKED')

      // 3. Failed
      vi.spyOn(supabaseAdmin, 'from').mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: { policy_status: 'FAILED', analysis_status: 'ANALYSIS_FAILED' },
          error: null,
        }),
      })

      const check3 = await isMediaAllowedForPublishing('asset-failed')
      expect(check3.allowed).toBe(false)
      expect(check3.policyStatus).toBe('FAILED')
    })
  })
})
