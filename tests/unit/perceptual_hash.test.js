import { describe, it, expect } from 'vitest'
import {
  computeImagePerceptualHash,
  hammingDistance,
  isNearDuplicate,
  computeVideoPerceptualFingerprint,
  findNearDuplicates,
  DEFAULT_DHASH_THRESHOLD,
} from '../../backend/server/security/dedup/perceptualHash.js'
import { calculateMediaSha256 } from '../../backend/server/security/dedup/exactDedup.js'

// Helper to generate deterministic synthetic test image matrices
function createGradientImage(width, height, factor = 1) {
  const data = new Uint8Array(width * height * 4)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      const val = Math.min(255, Math.floor((x / width) * 255 * factor))
      data[idx] = val     // R
      data[idx + 1] = val // G
      data[idx + 2] = val // B
      data[idx + 3] = 255 // A
    }
  }
  return { width, height, data, channels: 4 }
}

function createCheckerboardImage(width, height, blockSize = 8) {
  const data = new Uint8Array(width * height * 4)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      const isBlack = (Math.floor(x / blockSize) + Math.floor(y / blockSize)) % 2 === 0
      const val = isBlack ? 0 : 255
      data[idx] = val
      data[idx + 1] = val
      data[idx + 2] = val
      data[idx + 3] = 255
    }
  }
  return { width, height, data, channels: 4 }
}

function createMockSupabaseWithCandidates(candidates = []) {
  return {
    from(table) {
      if (table !== 'media_assets') throw new Error(`Unexpected table: ${table}`)
      return {
        select() {
          return this
        },
        eq() {
          return this
        },
        not() {
          return this
        },
        limit() {
          return Promise.resolve({ data: candidates, error: null })
        },
      }
    },
  }
}

describe('server/security/dedup/perceptualHash.js - Image & Video Perceptual Hashing Tests', () => {
  // ── 1. computeImagePerceptualHash Determinism ──────────────────────────────
  describe('computeImagePerceptualHash', () => {
    it('same image produces the exact same perceptual hash', () => {
      const img1 = createGradientImage(64, 64)
      const img2 = createGradientImage(64, 64)

      const hash1 = computeImagePerceptualHash(img1)
      const hash2 = computeImagePerceptualHash(img2)

      expect(hash1).toMatch(/^0x[0-9a-f]{16}$/)
      expect(hash1).toBe(hash2)
    })

    it('resized version of same image produces near-identical perceptual hash', () => {
      // 64x64 vs 128x128 of the same gradient pattern
      const imgSmall = createGradientImage(64, 64)
      const imgLarge = createGradientImage(128, 128)

      const hashSmall = computeImagePerceptualHash(imgSmall)
      const hashLarge = computeImagePerceptualHash(imgLarge)

      const dist = hammingDistance(hashSmall, hashLarge)
      expect(dist).toBeLessThanOrEqual(2) // Extremely close perceptual match
      expect(isNearDuplicate(hashSmall, hashLarge, DEFAULT_DHASH_THRESHOLD)).toBe(true)
    })

    it('slightly modified image produces low Hamming distance (near-duplicate)', () => {
      const imgOriginal = createGradientImage(64, 64, 1.0)
      const imgSlightlyModified = createGradientImage(64, 64, 0.96) // 4% brightness adjustment

      const hashOriginal = computeImagePerceptualHash(imgOriginal)
      const hashModified = computeImagePerceptualHash(imgSlightlyModified)

      const dist = hammingDistance(hashOriginal, hashModified)
      expect(dist).toBeLessThanOrEqual(DEFAULT_DHASH_THRESHOLD)
      expect(isNearDuplicate(hashOriginal, hashModified)).toBe(true)
    })

    it('clearly different images produce large Hamming distance (> threshold)', () => {
      const gradientImg = createGradientImage(64, 64)
      const checkerboardImg = createCheckerboardImage(64, 64, 8)

      const hashGradient = computeImagePerceptualHash(gradientImg)
      const hashCheckerboard = computeImagePerceptualHash(checkerboardImg)

      const dist = hammingDistance(hashGradient, hashCheckerboard)
      expect(dist).toBeGreaterThan(DEFAULT_DHASH_THRESHOLD)
      expect(isNearDuplicate(hashGradient, hashCheckerboard)).toBe(false)
    })

    it('throws when image input is null, undefined, or unsupported', () => {
      expect(() => computeImagePerceptualHash(null)).toThrow(TypeError)
      expect(() => computeImagePerceptualHash(undefined)).toThrow(TypeError)
      expect(() => computeImagePerceptualHash('invalid-string')).toThrow(TypeError)
    })
  })

  // ── 2. hammingDistance Properties ──────────────────────────────────────────
  describe('hammingDistance', () => {
    it('returns zero for identical hashes', () => {
      const hash = '0x1122334455667788'
      expect(hammingDistance(hash, hash)).toBe(0)
    })

    it('is symmetric: distance(A, B) === distance(B, A)', () => {
      const hashA = '0x1122334455667788'
      const hashB = '0x1122334455667789' // 1 bit different
      expect(hammingDistance(hashA, hashB)).toBe(1)
      expect(hammingDistance(hashB, hashA)).toBe(1)
    })

    it('calculates exact bit differences correctly', () => {
      expect(hammingDistance('0x0000000000000000', '0x0000000000000001')).toBe(1)
      expect(hammingDistance('0x0000000000000000', '0x000000000000000f')).toBe(4)
      expect(hammingDistance('0x0000000000000000', '0xffffffffffffffff')).toBe(64)
    })

    it('rejects mismatched hash lengths with an Error', () => {
      expect(() => hammingDistance('0x1234', '0x123456')).toThrow(/mismatch/)
    })

    it('rejects invalid hexadecimal characters with TypeError', () => {
      expect(() => hammingDistance('0x1234zzzz', '0x12345678')).toThrow(TypeError)
    })
  })

  // ── 3. Separation of Exact SHA-256 vs Perceptual Hash ─────────────────────
  describe('Cryptographic Identity vs Perceptual Similarity Separation', () => {
    it('perceptual hash is NOT treated as an exact SHA-256 hash', () => {
      const imgA = createGradientImage(64, 64)
      const imgB = createGradientImage(128, 128)

      // Raw file bytes differ because dimensions differ
      const shaA = calculateMediaSha256(imgA.data)
      const shaB = calculateMediaSha256(imgB.data)

      const pHashA = computeImagePerceptualHash(imgA)
      const pHashB = computeImagePerceptualHash(imgB)

      // SHA-256 proves exact file bytes are different
      expect(shaA).not.toBe(shaB)

      // Perceptual hash detects visual equivalence
      expect(isNearDuplicate(pHashA, pHashB)).toBe(true)
    })

    it('two distinct media assets can have the same perceptual hash', () => {
      const img1 = createGradientImage(64, 64, 1.0)
      const img2 = createGradientImage(64, 64, 1.0)

      // Same pattern -> same pHash
      expect(computeImagePerceptualHash(img1)).toBe(computeImagePerceptualHash(img2))
    })
  })

  // ── 4. Video Perceptual Fingerprint Abstraction ───────────────────────────
  describe('computeVideoPerceptualFingerprint', () => {
    it('computes sequence of frame perceptual hashes when sampled keyframes are provided', () => {
      const frame1 = createGradientImage(64, 64, 0.8)
      const frame2 = createGradientImage(64, 64, 0.9)
      const frame3 = createGradientImage(64, 64, 1.0)

      const result = computeVideoPerceptualFingerprint([frame1, frame2, frame3])

      expect(result.algorithm).toBe('video_sampled_dhash_sequence')
      expect(result.frameCount).toBe(3)
      expect(result.frameHashes).toHaveLength(3)
      expect(result.frameHashes[0]).toMatch(/^0x[0-9a-f]{16}$/)
    })

    it('throws error indicating video frame extraction pipeline is required when frames array is empty', () => {
      expect(() => computeVideoPerceptualFingerprint([])).toThrow(/Video frame extraction pipeline is required/)
      expect(() => computeVideoPerceptualFingerprint(null)).toThrow(/Video frame extraction pipeline is required/)
    })
  })

  // ── 5. findNearDuplicates Candidate Search ─────────────────────────────────
  describe('findNearDuplicates', () => {
    const queryHash = '0x1122334455667788'
    const candidateMatches = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        sha256_hash: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        perceptual_hash: '0x1122334455667788', // Exact pHash match (distance 0)
        media_type: 'image',
        mime_type: 'image/jpeg',
        file_size: 1024,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        sha256_hash: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        perceptual_hash: '0x1122334455667789', // 1 bit difference (distance 1)
        media_type: 'image',
        mime_type: 'image/jpeg',
        file_size: 2048,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        sha256_hash: '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        perceptual_hash: '0xffffffffffffffff', // Far distance (distance 64)
        media_type: 'image',
        mime_type: 'image/jpeg',
        file_size: 4096,
      },
    ]

    it('finds candidates within threshold and sorts by highest similarity first', async () => {
      const mockDb = createMockSupabaseWithCandidates(candidateMatches)

      const res = await findNearDuplicates({
        perceptualHash: queryHash,
        mediaType: 'image',
        threshold: 10,
        client: mockDb,
      })

      expect(res.hasNearDuplicates).toBe(true)
      expect(res.matches).toHaveLength(2) // Matches 1 and 2 are within threshold 10; match 3 is excluded

      // Sorted by distance ASC
      expect(res.matches[0].distance).toBe(0)
      expect(res.matches[0].similarityScore).toBe(1.0)
      expect(res.matches[1].distance).toBe(1)
      expect(res.matches[1].similarityScore).toBeGreaterThan(0.98)
    })

    it('returns hasNearDuplicates: false when no candidates are within threshold', async () => {
      const distantOnly = [candidateMatches[2]]
      const mockDb = createMockSupabaseWithCandidates(distantOnly)

      const res = await findNearDuplicates({
        perceptualHash: queryHash,
        threshold: 5,
        client: mockDb,
      })

      expect(res.hasNearDuplicates).toBe(false)
      expect(res.matches).toHaveLength(0)
    })
  })
})
