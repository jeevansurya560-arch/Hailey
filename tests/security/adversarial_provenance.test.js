import { describe, it, expect, beforeEach } from 'vitest'
import { validateApproveItemInput } from '../../backend/server/security/validation/validate.js'
import { RelayerService } from '../../backend/server/blockchain/relayer/relayer.js'
import { verifyContentHashOnchain } from '../../frontend/src/features/verification/services/attestationService.js'

describe('Adversarial Provenance & Blockchain Security Tests', () => {
  const sampleContractAddress = '0x3333333333333333333333333333333333333333'
  const sampleContributor = '0x4444444444444444444444444444444444444444'
  const sampleCommunityId = '0x5555555555555555555555555555555555555555555555555555555555555555'

  describe('1. Input Injection & Payload Tampering', () => {
    it('strips or rejects client-injected attested: true or fake tx_hash in approval payload', () => {
      const maliciousPayload = {
        itemId: '550e8400-e29b-41d4-a716-446655440000',
        action: 'approve',
        attested: true,
        tx_hash: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
        content_hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      }

      const { data, error } = validateApproveItemInput(maliciousPayload)
      expect(error).toBeNull()
      expect(data).toBeDefined()
      // Server validator must only expose sanitized itemId and action; client cannot inject status or hashes
      expect(data.itemId).toBe('550e8400-e29b-41d4-a716-446655440000')
      expect(data.action).toBe('approve')
      expect(data.attested).toBeUndefined()
      expect(data.tx_hash).toBeUndefined()
      expect(data.content_hash).toBeUndefined()
    })

    it('rejects malformed itemId or invalid actions intended to exploit server logic', () => {
      const payloads = [
        { itemId: 'not-a-uuid', action: 'approve' },
        { itemId: '550e8400-e29b-41d4-a716-446655440000', action: 'force_attest' },
        { itemId: '550e8400-e29b-41d4-a716-446655440000', action: '<script>alert(1)</script>' },
      ]

      for (const p of payloads) {
        const { error } = validateApproveItemInput(p)
        expect(error).not.toBeNull()
      }
    })
  })

  describe('2. Adversarial Relayer & Hash Boundary Defenses', () => {
    let relayer

    beforeEach(() => {
      relayer = new RelayerService({
        contractAddress: sampleContractAddress,
        privateKey: '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      })
    })

    it('blocks attempting to attest a 64-bit perceptual hash (dHash)', async () => {
      const dHash = '0x1a2b3c4d5e6f7a8b' // 64-bit dHash (16 hex chars + 0x)
      const res = await relayer.attest({
        contributor: sampleContributor,
        communityId: sampleCommunityId,
        contentHash: dHash,
      })

      expect(res.status).toBe('failed')
      expect(res.error).toContain('Must be a valid 32-byte cryptographic hash')
    })

    it('blocks attempting to attest empty, null, or zero bytes32 hash', async () => {
      const zeroHash = '0x0000000000000000000000000000000000000000000000000000000000000000'
      const res = await relayer.attest({
        contributor: sampleContributor,
        communityId: sampleCommunityId,
        contentHash: zeroHash,
      })

      expect(res.status).toBe('failed')
      expect(res.error).toContain('Invalid or zero contentHash')
    })

    it('blocks attempting to attest with zero address or invalid address format', async () => {
      const badAddresses = [
        '0x0000000000000000000000000000000000000000',
        '0xinvalid',
        'not_an_address',
        '',
      ]

      for (const addr of badAddresses) {
        const res = await relayer.attest({
          contributor: addr,
          communityId: sampleCommunityId,
          contentHash: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        })

        expect(res.status).toBe('failed')
        expect(res.error).toContain('contributor address')
      }
    })
  })

  describe('3. Onchain Verification Edge Cases & Boundary Defense', () => {
    it('rejects verifying non-32-byte hashes onchain', async () => {
      const badHashes = [
        '0x1234',
        '0x0f1e2d3c4b5a6978', // 64-bit perceptual
        'not-a-hash',
        '',
        null,
      ]

      for (const h of badHashes) {
        const res = await verifyContentHashOnchain(h, sampleContractAddress)
        expect(res.status).toBe('invalid_hash')
        expect(res.attested).toBe(false)
        expect(res.errorMessage).toContain('Must be a 32-byte hex string')
      }
    })

    it('gracefully reports unconfigured if contract address is missing', async () => {
      const validHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      const res = await verifyContentHashOnchain(validHash, null)

      expect(res.status).toBe('unconfigured')
      expect(res.attested).toBe(false)
      expect(res.errorMessage).toContain('Contract address not configured')
    })
  })
})
