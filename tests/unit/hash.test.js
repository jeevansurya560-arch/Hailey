import { describe, it, expect } from 'vitest'
import {
  computeCommunityId,
  computeItemContent,
  canonicalizeContent,
  sha256Bytes,
  computeContentHashV1,
  computeContentHashV2,
  computeContentHash,
} from '../../shared/crypto/hashing.js'

describe('shared/crypto/hashing.js - Cryptographic Hashing Unit Tests', () => {
  // ── 1. computeCommunityId ──────────────────────────────────────────────────
  describe('computeCommunityId', () => {
    it('computes deterministic communityId from slug', () => {
      const slug = 'harajuku-streetwear'
      const id = computeCommunityId(slug)

      expect(id).toMatch(/^0x[0-9a-f]{64}$/)
      // Fixed reference vector
      expect(computeCommunityId(slug)).toBe(id)
      expect(computeCommunityId('harajuku-streetwear')).toBe(
        '0xb1ed2bc3b8e4a47bac5f1ff80d583525aca9b5a8582869cbeb16f442c86c7b61'
      )
    })

    it('trims whitespace before hashing slug', () => {
      expect(computeCommunityId('  harajuku-streetwear  ')).toBe(
        computeCommunityId('harajuku-streetwear')
      )
    })

    it('throws on non-string or empty slug', () => {
      expect(() => computeCommunityId('')).toThrow(TypeError)
      expect(() => computeCommunityId(null)).toThrow(TypeError)
      expect(() => computeCommunityId(123)).toThrow(TypeError)
    })
  })

  // ── 2. computeItemContent (v1 serialization) ──────────────────────────────
  describe('computeItemContent (Legacy Serialization)', () => {
    it('computes itemContent string for post, link, and note correctly', () => {
      expect(
        computeItemContent({
          kind: 'post',
          post_id: '123e4567-e89b-12d3-a456-426614174000',
          note: 'Crucial archive reference',
        })
      ).toBe('post:123e4567-e89b-12d3-a456-426614174000:Crucial archive reference')

      expect(
        computeItemContent({
          kind: 'link',
          url: 'https://example.com/vintage-magazine',
          note: null,
        })
      ).toBe('link:https://example.com/vintage-magazine:')

      expect(
        computeItemContent({
          kind: 'note',
          note: 'Oral history transcript from 1994',
        })
      ).toBe('note::Oral history transcript from 1994')
    })

    it('throws when item is not an object', () => {
      expect(() => computeItemContent(null)).toThrow(TypeError)
      expect(() => computeItemContent('invalid')).toThrow(TypeError)
    })
  })

  // ── 3. sha256Bytes (Binary SHA-256 Media Hashing) ──────────────────────────
  describe('sha256Bytes (Binary SHA-256)', () => {
    const EMPTY_SHA256 = '0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'

    it('computes exact SHA-256 for empty inputs across data types', () => {
      expect(sha256Bytes(new Uint8Array(0))).toBe(EMPTY_SHA256)
      expect(sha256Bytes(new ArrayBuffer(0))).toBe(EMPTY_SHA256)
      expect(sha256Bytes('')).toBe(EMPTY_SHA256)
    })

    it('produces identical hash for same bytes across Uint8Array and ArrayBuffer', () => {
      const rawBytes = new Uint8Array([0x48, 0x61, 0x69, 0x6c, 0x65, 0x79]) // "Hailey"
      const arrayBuffer = rawBytes.buffer

      const hash1 = sha256Bytes(rawBytes)
      const hash2 = sha256Bytes(arrayBuffer)
      const hash3 = sha256Bytes('Hailey')

      expect(hash1).toBe(hash2)
      expect(hash1).toBe(hash3)
      expect(hash1).toMatch(/^0x[0-9a-f]{64}$/)
    })

    it('produces different hash for different bytes', () => {
      const bytesA = new Uint8Array([1, 2, 3, 4, 5])
      const bytesB = new Uint8Array([1, 2, 3, 4, 6])

      expect(sha256Bytes(bytesA)).not.toBe(sha256Bytes(bytesB))
    })

    it('supports binary buffers and subarray slices', () => {
      const fullBuffer = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7])
      const subView = fullBuffer.subarray(2, 6) // [2, 3, 4, 5]
      const directBytes = new Uint8Array([2, 3, 4, 5])

      expect(sha256Bytes(subView)).toBe(sha256Bytes(directBytes))
    })

    it('throws on null or undefined input', () => {
      expect(() => sha256Bytes(null)).toThrow(TypeError)
      expect(() => sha256Bytes(undefined)).toThrow(TypeError)
    })
  })

  // ── 4. canonicalizeContent (v2 Normalization) ──────────────────────────────
  describe('canonicalizeContent (Deterministic Normalization)', () => {
    it('normalizes link item with trimmed fields', () => {
      const item = {
        kind: 'link',
        url: '  https://archive.org/photo-1.jpg  ',
        note: '  Primary photo archive  ',
      }
      expect(canonicalizeContent(item)).toBe(
        'link:https://archive.org/photo-1.jpg:Primary photo archive'
      )
    })

    it('normalizes post item with lowercase trimmed UUID', () => {
      const item = {
        kind: 'post',
        post_id: '  550E8400-E29B-41D4-A716-446655440000  ',
        note: 'Archive dispatch',
      }
      expect(canonicalizeContent(item)).toBe(
        'post:550e8400-e29b-41d4-a716-446655440000:Archive dispatch'
      )
    })

    it('performs Unicode NFC normalization on notes', () => {
      // Decomposed "e\u0301" vs precomposed "\u00e9" (é)
      const decomposed = 'e\u0301'
      const precomposed = '\u00e9'

      const item1 = { kind: 'note', note: `Caf${decomposed}` }
      const item2 = { kind: 'note', note: `Caf${precomposed}` }

      expect(canonicalizeContent(item1)).toBe(canonicalizeContent(item2))
      expect(canonicalizeContent(item1)).toBe('note::Café')
    })

    it('handles null or missing note and target cleanly', () => {
      expect(canonicalizeContent({ kind: 'note' })).toBe('note::')
      expect(canonicalizeContent({ kind: 'link', url: 'https://site.org', note: null })).toBe(
        'link:https://site.org:'
      )
    })

    it('rejects invalid kind or non-object item', () => {
      expect(() => canonicalizeContent({ kind: 'video' })).toThrow(TypeError)
      expect(() => canonicalizeContent(null)).toThrow(TypeError)
    })
  })

  // ── 5. computeContentHashV1 & computeContentHash Legacy Compatibility ──────
  describe('computeContentHashV1 & Legacy computeContentHash', () => {
    const fixedParams = {
      itemId: 'd3b07384-d113-40e1-a0cf-795b583f7362',
      collectionId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      communitySlug: 'tokyo-vintage',
      item: {
        kind: 'link',
        url: 'https://archive.org/fashion-issue-1',
        note: 'Rare 90s issue scan',
      },
    }
    const EXPECTED_V1_HASH =
      '0xdee04155ade44cffae243d2a79734108ad72f3aa67ebb0128692333ebab813d9'

    it('computes canonical v1 contentHash matching exact historical test vector', () => {
      const v1Hash = computeContentHashV1(fixedParams)
      expect(v1Hash).toMatch(/^0x[0-9a-f]{64}$/)
      expect(v1Hash).toBe(EXPECTED_V1_HASH)
    })

    it('legacy computeContentHash() is 100% identical to computeContentHashV1()', () => {
      expect(computeContentHash(fixedParams)).toBe(EXPECTED_V1_HASH)
      expect(computeContentHash(fixedParams)).toBe(computeContentHashV1(fixedParams))
    })

    it('v1 hash changes when itemId or collectionId changes (legacy behavior preserved)', () => {
      const paramsModifiedId = {
        ...fixedParams,
        itemId: '00000000-0000-0000-0000-000000000000',
      }
      expect(computeContentHashV1(paramsModifiedId)).not.toBe(EXPECTED_V1_HASH)
    })
  })

  // ── 6. computeContentHashV2 (Deterministic Deduplication Hashing) ───────────
  describe('computeContentHashV2 (Deterministic Application Content Hash)', () => {
    const baseItem = {
      kind: 'link',
      url: 'https://archive.org/fashion-issue-1',
      note: 'Rare 90s issue scan',
    }

    it('computes deterministic v2 hash formatted as bytes32 hex', () => {
      const hash = computeContentHashV2({
        communitySlug: 'tokyo-vintage',
        item: baseItem,
      })

      expect(hash).toMatch(/^0x[0-9a-f]{64}$/)
      // Same inputs produce identical hash
      expect(
        computeContentHashV2({
          communitySlug: 'tokyo-vintage',
          item: baseItem,
        })
      ).toBe(hash)
    })

    it('ignores ephemeral database itemId, collectionId, and uploader IDs', () => {
      // User 1 proposes item with random itemId-A in collection-1
      const hashUser1 = computeContentHashV2({
        communitySlug: 'tokyo-vintage',
        item: baseItem,
        // Any extraneous database IDs passed in payload do not affect v2 content identity
        itemId: '11111111-1111-1111-1111-111111111111',
        collectionId: 'col-1',
        userId: 'user-1',
      })

      // User 2 proposes the EXACT SAME link in collection-2 with random itemId-B
      const hashUser2 = computeContentHashV2({
        communitySlug: 'tokyo-vintage',
        item: baseItem,
        itemId: '22222222-2222-2222-2222-222222222222',
        collectionId: 'col-2',
        userId: 'user-2',
      })

      // Must produce the exact same content hash for exact duplicate detection!
      expect(hashUser1).toBe(hashUser2)
    })

    it('normalizes communitySlug trimming and case', () => {
      const hash1 = computeContentHashV2({
        communitySlug: 'tokyo-vintage',
        item: baseItem,
      })
      const hash2 = computeContentHashV2({
        communitySlug: '  TOKYO-VINTAGE  ',
        item: baseItem,
      })

      expect(hash1).toBe(hash2)
    })

    it('produces different hashes for different communities or different content', () => {
      const hashA = computeContentHashV2({
        communitySlug: 'tokyo-vintage',
        item: baseItem,
      })
      const hashB = computeContentHashV2({
        communitySlug: 'london-archive',
        item: baseItem,
      })
      const hashC = computeContentHashV2({
        communitySlug: 'tokyo-vintage',
        item: { ...baseItem, note: 'Different note' },
      })

      expect(hashA).not.toBe(hashB)
      expect(hashA).not.toBe(hashC)
    })

    it('throws when params or communitySlug are invalid', () => {
      expect(() => computeContentHashV2(null)).toThrow(TypeError)
      expect(() => computeContentHashV2({ item: baseItem })).toThrow(TypeError)
      expect(() => computeContentHashV2({ communitySlug: '', item: baseItem })).toThrow(TypeError)
    })
  })
})
