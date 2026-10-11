import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  computeCommunityId,
  computeContentHashV1,
  computeContentHashV2,
  computeContentHash,
  sha256Bytes,
} from '../../shared/crypto/hashing.js'
import { computeImagePerceptualHash } from '../../backend/server/security/dedup/perceptualHash.js'
import { RelayerService } from '../../backend/server/blockchain/relayer/relayer.js'
import { verifyContentHashOnchain } from '../../frontend/src/features/verification/services/attestationService.js'

describe('Provenance & Blockchain Attestation Integration Tests', () => {
  const sampleCommunitySlug = 'tokyo-underground'
  const sampleCommunityId = computeCommunityId(sampleCommunitySlug)
  const sampleContributor = '0x1111111111111111111111111111111111111111'
  const sampleContractAddress = '0x2222222222222222222222222222222222222222'

  const sampleItem = {
    kind: 'post',
    post_id: '550e8400-e29b-41d4-a716-446655440000',
    note: 'Archival documentation of Tokyo street fashion',
  }

  describe('1. V1 and V2 Cryptographic Hash Consistency & Separation', () => {
    it('computes deterministic legacy V1 hash vectors', () => {
      const v1Hash = computeContentHashV1({
        itemId: 'item-uuid-1234',
        collectionId: 'col-uuid-5678',
        communitySlug: sampleCommunitySlug,
        item: sampleItem,
      })

      expect(v1Hash).toMatch(/^0x[0-9a-f]{64}$/)
      // computeContentHash legacy wrapper must match computeContentHashV1
      expect(computeContentHash({
        itemId: 'item-uuid-1234',
        collectionId: 'col-uuid-5678',
        communitySlug: sampleCommunitySlug,
        item: sampleItem,
      })).toBe(v1Hash)
    })

    it('computes deterministic canonical V2 hash excluding ephemeral database IDs', () => {
      const v2Hash1 = computeContentHashV2({
        communitySlug: sampleCommunitySlug,
        item: sampleItem,
      })

      const v2Hash2 = computeContentHashV2({
        communitySlug: sampleCommunitySlug,
        item: { ...sampleItem },
      })

      expect(v2Hash1).toMatch(/^0x[0-9a-f]{64}$/)
      expect(v2Hash1).toBe(v2Hash2)
    })

    it('distinguishes V1 and V2 hashes for the exact same underlying content', () => {
      const v1Hash = computeContentHashV1({
        itemId: 'item-uuid-1234',
        collectionId: 'col-uuid-5678',
        communitySlug: sampleCommunitySlug,
        item: sampleItem,
      })

      const v2Hash = computeContentHashV2({
        communitySlug: sampleCommunitySlug,
        item: sampleItem,
      })

      expect(v1Hash).not.toBe(v2Hash)
      expect(v1Hash.length).toBe(66)
      expect(v2Hash.length).toBe(66)
    })
  })

  describe('2. Cryptographic Media Identity vs Perceptual Hash Separation', () => {
    it('creates 256-bit cryptographic SHA-256 for exact binary media identity', () => {
      const mediaBytes = new Uint8Array([10, 20, 30, 40, 50, 60, 70, 80])
      const sha256 = sha256Bytes(mediaBytes)

      expect(sha256).toMatch(/^0x[0-9a-f]{64}$/)
      expect(sha256.length).toBe(66)
    })

    it('creates 64-bit dHash for perceptual similarity and never mixes it with 256-bit content hash', () => {
      // 9x8 image pixel buffer
      const dummyPixels = new Uint8Array(72 * 4).fill(128)
      const dhash = computeImagePerceptualHash(dummyPixels, 9, 8)

      // dHash is 16 hex chars (64-bit)
      expect(dhash).toMatch(/^0x[0-9a-f]{16}$/)
      expect(dhash.length).toBe(18)

      // 64-bit perceptual hash cannot be confused with 256-bit content hash (66 chars)
      expect(dhash.length).not.toBe(66)
    })

    it('rejects perceptual hash when passed to onchain verification', async () => {
      const dhash = '0x0f1e2d3c4b5a6978'
      const result = await verifyContentHashOnchain(dhash, sampleContractAddress)

      expect(result.status).toBe('invalid_hash')
      expect(result.attested).toBe(false)
      expect(result.errorMessage).toContain('32-byte hex string')
    })
  })

  describe('3. Relayer Parameter Validation', () => {
    let relayerService

    beforeEach(() => {
      relayerService = new RelayerService({
        contractAddress: sampleContractAddress,
        privateKey: '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      })
    })

    it('rejects invalid or zero contributor address', async () => {
      const res = await relayerService.attest({
        contributor: '0x0000000000000000000000000000000000000000',
        communityId: sampleCommunityId,
        contentHash: computeContentHashV2({ communitySlug: sampleCommunitySlug, item: sampleItem }),
      })

      expect(res.status).toBe('failed')
      expect(res.error).toContain('contributor address')
    })

    it('rejects zero or malformed communityId', async () => {
      const res = await relayerService.attest({
        contributor: sampleContributor,
        communityId: '0x0000000000000000000000000000000000000000000000000000000000000000',
        contentHash: computeContentHashV2({ communitySlug: sampleCommunitySlug, item: sampleItem }),
      })

      expect(res.status).toBe('failed')
      expect(res.error).toContain('communityId')
    })

    it('rejects perceptual hash (16 hex) or zero contentHash', async () => {
      const res1 = await relayerService.attest({
        contributor: sampleContributor,
        communityId: sampleCommunityId,
        contentHash: '0x0f1e2d3c4b5a6978', // 64-bit perceptual hash
      })

      expect(res1.status).toBe('failed')
      expect(res1.error).toContain('32-byte cryptographic hash')

      const res2 = await relayerService.attest({
        contributor: sampleContributor,
        communityId: sampleCommunityId,
        contentHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      })

      expect(res2.status).toBe('failed')
      expect(res2.error).toContain('contentHash')
    })
  })

  describe('4. Relayer Idempotency & Duplicate Handling', () => {
    let relayerService

    beforeEach(() => {
      relayerService = new RelayerService({
        contractAddress: sampleContractAddress,
        privateKey: '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      })
    })

    it('returns attested status idempotently without submitting tx if already attested onchain', async () => {
      const contentHash = computeContentHashV2({ communitySlug: sampleCommunitySlug, item: sampleItem })

      // Mock isAttested to return true
      vi.spyOn(relayerService, 'isAttested').mockResolvedValue(true)
      const writeSpy = vi.fn()
      vi.spyOn(relayerService, 'getWalletClient').mockReturnValue({ writeContract: writeSpy })

      const res = await relayerService.attest({
        contributor: sampleContributor,
        communityId: sampleCommunityId,
        contentHash,
      })

      expect(res.status).toBe('attested')
      expect(res.alreadyAttested).toBe(true)
      // Must not call writeContract
      expect(writeSpy).not.toHaveBeenCalled()
    })

    it('handles AlreadyAttested revert during concurrent submission and returns attested status', async () => {
      const contentHash = computeContentHashV2({ communitySlug: sampleCommunitySlug, item: sampleItem })

      vi.spyOn(relayerService, 'isAttested').mockResolvedValue(false)
      vi.spyOn(relayerService, 'checkBalance').mockResolvedValue({ sufficient: true, balance: '1.0' })
      vi.spyOn(relayerService, 'getWalletClient').mockReturnValue({
        writeContract: vi.fn().mockRejectedValue(new Error('Contract execution reverted: AlreadyAttested()')),
      })

      const res = await relayerService.attest({
        contributor: sampleContributor,
        communityId: sampleCommunityId,
        contentHash,
      })

      expect(res.status).toBe('attested')
      expect(res.alreadyAttested).toBe(true)
    })
  })

  describe('5. Blockchain Failure Safety & State Machine Integrity', () => {
    let relayerService

    beforeEach(() => {
      relayerService = new RelayerService({
        contractAddress: sampleContractAddress,
        privateKey: '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      })
    })

    it('does NOT mark attested if balance is below threshold', async () => {
      const contentHash = computeContentHashV2({ communitySlug: sampleCommunitySlug, item: sampleItem })

      vi.spyOn(relayerService, 'isAttested').mockResolvedValue(false)
      vi.spyOn(relayerService, 'checkBalance').mockResolvedValue({ sufficient: false, balance: '0.001' })

      const res = await relayerService.attest({
        contributor: sampleContributor,
        communityId: sampleCommunityId,
        contentHash,
      })

      expect(res.status).toBe('failed')
      expect(res.error).toContain('below minimum threshold')
    })

    it('marks status as submitted (not attested) when receipt times out after 8s', async () => {
      const contentHash = computeContentHashV2({ communitySlug: sampleCommunitySlug, item: sampleItem })

      vi.spyOn(relayerService, 'isAttested').mockResolvedValue(false)
      vi.spyOn(relayerService, 'checkBalance').mockResolvedValue({ sufficient: true, balance: '1.0' })
      vi.spyOn(relayerService, 'getWalletClient').mockReturnValue({
        writeContract: vi.fn().mockResolvedValue('0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'),
      })
      vi.spyOn(relayerService, 'getPublicClient').mockReturnValue({
        waitForTransactionReceipt: vi.fn().mockRejectedValue(new Error('Timeout waiting for receipt')),
      })

      const res = await relayerService.attest({
        contributor: sampleContributor,
        communityId: sampleCommunityId,
        contentHash,
      })

      expect(res.status).toBe('submitted')
      expect(res.txHash).toBe('0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
      expect(res.error).toContain('Receipt timed out')
    })

    it('marks status as failed if transaction reverts onchain', async () => {
      const contentHash = computeContentHashV2({ communitySlug: sampleCommunitySlug, item: sampleItem })

      vi.spyOn(relayerService, 'isAttested').mockResolvedValue(false)
      vi.spyOn(relayerService, 'checkBalance').mockResolvedValue({ sufficient: true, balance: '1.0' })
      vi.spyOn(relayerService, 'getWalletClient').mockReturnValue({
        writeContract: vi.fn().mockResolvedValue('0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'),
      })
      vi.spyOn(relayerService, 'getPublicClient').mockReturnValue({
        waitForTransactionReceipt: vi.fn().mockResolvedValue({ status: 'reverted' }),
      })

      const res = await relayerService.attest({
        contributor: sampleContributor,
        communityId: sampleCommunityId,
        contentHash,
      })

      expect(res.status).toBe('failed')
      expect(res.txHash).toBe('0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb')
      expect(res.error).toContain('reverted onchain')
    })
  })
})
