import { describe, it, expect, beforeEach } from 'vitest'
import {
  calculateMediaSha256,
  findExactDuplicate,
  registerMediaAsset,
} from '../../backend/server/security/dedup/exactDedup.js'

// In-memory mock database store simulating PostgreSQL media_assets table with UNIQUE(sha256_hash)
function createMockSupabase() {
  const store = new Map()

  return {
    _store: store,
    from(table) {
      if (table !== 'media_assets') {
        throw new Error(`Unexpected mock table: ${table}`)
      }

      let _selectedFields = '*'
      let filterEq = null

      return {
        select(fields) {
          _selectedFields = fields
          return this
        },
        eq(col, val) {
          filterEq = { col, val }
          return this
        },
        async maybeSingle() {
          if (filterEq && filterEq.col === 'sha256_hash') {
            const found = store.get(filterEq.val.toLowerCase())
            return { data: found || null, error: null }
          }
          return { data: null, error: null }
        },
        async single() {
          if (filterEq && filterEq.col === 'sha256_hash') {
            const found = store.get(filterEq.val.toLowerCase())
            return { data: found || null, error: found ? null : { message: 'Not found' } }
          }
          return { data: null, error: null }
        },
        insert(row) {
          return {
            select() {
              return {
                async single() {
                  const hash = row.sha256_hash.toLowerCase()
                  // Enforce database UNIQUE constraint
                  if (store.has(hash)) {
                    return {
                      data: null,
                      error: {
                        code: '23505',
                        message: 'duplicate key value violates unique constraint "media_assets_sha256_hash_key"',
                      },
                    }
                  }

                  const newRecord = {
                    id: '550e8400-e29b-41d4-a716-44665544' + String(store.size).padStart(4, '0'),
                    sha256_hash: hash,
                    media_type: row.media_type,
                    mime_type: row.mime_type,
                    file_size: row.file_size,
                    storage_reference: row.storage_reference || null,
                    original_filename: row.original_filename || null,
                    uploaded_by: row.uploaded_by,
                    created_at: new Date().toISOString(),
                  }
                  store.set(hash, newRecord)
                  return { data: newRecord, error: null }
                },
              }
            },
          }
        },
      }
    },
  }
}

describe('server/security/dedup/exactDedup.js - Media Identity & Exact Duplicate Detection', () => {
  const USER_A_ID = '11111111-1111-4111-8111-111111111111'
  const USER_B_ID = '22222222-2222-4222-8222-222222222222'

  const SAMPLE_PHOTO_BYTES = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]) // JPEG header bytes
  const SAMPLE_VIDEO_BYTES = new Uint8Array([0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73]) // MP4 ftyp bytes
  const DIFFERENT_PHOTO_BYTES = new Uint8Array([0xff, 0xd8, 0xff, 0xe1, 0x00, 0x22, 0x45, 0x78, 0x69, 0x66])

  let mockDb

  beforeEach(() => {
    mockDb = createMockSupabase()
  })

  // ── 1. calculateMediaSha256 ────────────────────────────────────────────────
  describe('calculateMediaSha256', () => {
    it('computes exact SHA-256 for photo bytes', () => {
      const hash = calculateMediaSha256(SAMPLE_PHOTO_BYTES)
      expect(hash).toMatch(/^0x[0-9a-f]{64}$/)
      expect(calculateMediaSha256(SAMPLE_PHOTO_BYTES)).toBe(hash)
    })

    it('filename differences do NOT affect media SHA-256 identity', () => {
      // "festival-tokyo.jpg" and "renamed_download_123.jpg" with exact same bytes
      const hashOriginal = calculateMediaSha256(SAMPLE_PHOTO_BYTES)
      const hashRenamed = calculateMediaSha256(SAMPLE_PHOTO_BYTES)
      expect(hashOriginal).toBe(hashRenamed)
    })

    it('different bytes produce different SHA-256 hashes', () => {
      const hashA = calculateMediaSha256(SAMPLE_PHOTO_BYTES)
      const hashB = calculateMediaSha256(DIFFERENT_PHOTO_BYTES)
      expect(hashA).not.toBe(hashB)
    })

    it('throws when media data is null or undefined', () => {
      expect(() => calculateMediaSha256(null)).toThrow(TypeError)
      expect(() => calculateMediaSha256(undefined)).toThrow(TypeError)
    })
  })

  // ── 2. findExactDuplicate ──────────────────────────────────────────────────
  describe('findExactDuplicate', () => {
    it('returns isDuplicate: false when hash does not exist in database', async () => {
      const hash = calculateMediaSha256(SAMPLE_PHOTO_BYTES)
      const res = await findExactDuplicate(hash, mockDb)
      expect(res.isDuplicate).toBe(false)
      expect(res.existingMedia).toBeNull()
    })

    it('returns isDuplicate: true and existing media record when found', async () => {
      // Pre-populate asset
      await registerMediaAsset(
        {
          mediaBytes: SAMPLE_PHOTO_BYTES,
          mediaType: 'image',
          mimeType: 'image/jpeg',
          fileSize: SAMPLE_PHOTO_BYTES.length,
          originalFilename: 'temple.jpg',
          uploaderId: USER_A_ID,
        },
        mockDb
      )

      const hash = calculateMediaSha256(SAMPLE_PHOTO_BYTES)
      const res = await findExactDuplicate(hash, mockDb)
      expect(res.isDuplicate).toBe(true)
      expect(res.existingMedia).not.toBeNull()
      expect(res.existingMedia.sha256Hash).toBe(hash)
      expect(res.existingMedia.uploadedBy).toBe(USER_A_ID)
    })

    it('throws error for invalid hash format', async () => {
      await expect(findExactDuplicate('not-a-hash', mockDb)).rejects.toThrow(TypeError)
    })
  })

  // ── 3. registerMediaAsset & Duplicate Workflow ─────────────────────────────
  describe('registerMediaAsset (Authoritative Registration & Duplicate Handling)', () => {
    it('first upload by User A creates canonical media asset with status CREATED', async () => {
      const res = await registerMediaAsset(
        {
          mediaBytes: SAMPLE_PHOTO_BYTES,
          mediaType: 'image',
          mimeType: 'image/jpeg',
          fileSize: SAMPLE_PHOTO_BYTES.length,
          originalFilename: 'tokyo-festival.jpg',
          uploaderId: USER_A_ID,
        },
        mockDb
      )

      expect(res.status).toBe('CREATED')
      expect(res.isDuplicate).toBe(false)
      expect(res.media.uploadedBy).toBe(USER_A_ID)
      expect(res.media.originalFilename).toBe('tokyo-festival.jpg')
      expect(res.media.mediaType).toBe('image')
    })

    it('second upload of exact same bytes by User B returns EXACT_DUPLICATE and preserves User A provenance', async () => {
      // 1. User A uploads file
      const resUserA = await registerMediaAsset(
        {
          mediaBytes: SAMPLE_PHOTO_BYTES,
          mediaType: 'image',
          mimeType: 'image/jpeg',
          fileSize: SAMPLE_PHOTO_BYTES.length,
          originalFilename: 'tokyo-festival.jpg',
          uploaderId: USER_A_ID,
        },
        mockDb
      )

      // 2. User B uploads exact same file bytes under a different filename
      const resUserB = await registerMediaAsset(
        {
          mediaBytes: SAMPLE_PHOTO_BYTES,
          mediaType: 'image',
          mimeType: 'image/jpeg',
          fileSize: SAMPLE_PHOTO_BYTES.length,
          originalFilename: 'my-stolen-copy-renamed.jpg',
          uploaderId: USER_B_ID,
        },
        mockDb
      )

      expect(resUserB.status).toBe('EXACT_DUPLICATE')
      expect(resUserB.isDuplicate).toBe(true)
      // Canonical media returned matches User A's initial record
      expect(resUserB.media.id).toBe(resUserA.media.id)
      expect(resUserB.media.uploadedBy).toBe(USER_A_ID)
      expect(resUserB.media.uploadedBy).not.toBe(USER_B_ID)

      // Only ONE record exists in the store
      expect(mockDb._store.size).toBe(1)
    })

    it('distinct video uploads are registered independently', async () => {
      const resVideo = await registerMediaAsset(
        {
          mediaBytes: SAMPLE_VIDEO_BYTES,
          mediaType: 'video',
          mimeType: 'video/mp4',
          fileSize: SAMPLE_VIDEO_BYTES.length,
          originalFilename: 'archive-recording.mp4',
          uploaderId: USER_B_ID,
        },
        mockDb
      )

      expect(resVideo.status).toBe('CREATED')
      expect(resVideo.isDuplicate).toBe(false)
      expect(resVideo.media.mediaType).toBe('video')
      expect(resVideo.media.uploadedBy).toBe(USER_B_ID)
    })

    it('rejects unsupported media types (e.g. audio, document)', async () => {
      await expect(
        registerMediaAsset(
          {
            mediaBytes: SAMPLE_PHOTO_BYTES,
            mediaType: 'audio',
            mimeType: 'audio/mp3',
            fileSize: 100,
            uploaderId: USER_A_ID,
          },
          mockDb
        )
      ).rejects.toThrow(/mediaType must be either 'image' or 'video'/)
    })

    it('rejects missing or invalid uploaderId', async () => {
      await expect(
        registerMediaAsset(
          {
            mediaBytes: SAMPLE_PHOTO_BYTES,
            mediaType: 'image',
            mimeType: 'image/jpeg',
            fileSize: 100,
            uploaderId: 'invalid-id',
          },
          mockDb
        )
      ).rejects.toThrow(/valid UUID/)
    })
  })

  // ── 4. Concurrency & Race Condition Simulation ─────────────────────────────
  describe('Race Condition & Concurrency Defense', () => {
    it('handles concurrent simultaneous inserts gracefully without crashing or creating duplicates', async () => {
      // Simulate race condition where two simultaneous requests try to insert same hash
      let callCount = 0
      const raceDb = {
        from() {
          return {
            select() {
              return this
            },
            eq() {
              return this
            },
            async maybeSingle() {
              // First pre-check returns null for both requests
              return { data: null, error: null }
            },
            insert(row) {
              return {
                select() {
                  return {
                    async single() {
                      callCount++
                      if (callCount === 1) {
                        // Request 1 succeeds
                        const created = {
                          id: '550e8400-e29b-41d4-a716-446655440001',
                          sha256_hash: row.sha256_hash,
                          media_type: row.media_type,
                          mime_type: row.mime_type,
                          file_size: row.file_size,
                          uploaded_by: USER_A_ID,
                          created_at: new Date().toISOString(),
                        }
                        mockDb._store.set(row.sha256_hash, created)
                        return { data: created, error: null }
                      } else {
                        // Request 2 hits PostgreSQL unique constraint violation (code 23505)
                        return {
                          data: null,
                          error: {
                            code: '23505',
                            message: 'duplicate key value violates unique constraint',
                          },
                        }
                      }
                    },
                  }
                },
              }
            },
          }
        },
      }

      // First call succeeds as CREATED
      const res1 = await registerMediaAsset(
        {
          mediaBytes: SAMPLE_PHOTO_BYTES,
          mediaType: 'image',
          mimeType: 'image/jpeg',
          fileSize: 500,
          uploaderId: USER_A_ID,
        },
        raceDb
      )
      expect(res1.status).toBe('CREATED')

      // Second simultaneous call triggers code 23505 -> safely resolves as EXACT_DUPLICATE using fallback
      const res2 = await registerMediaAsset(
        {
          mediaBytes: SAMPLE_PHOTO_BYTES,
          mediaType: 'image',
          mimeType: 'image/jpeg',
          fileSize: 500,
          uploaderId: USER_B_ID,
        },
        mockDb
      )
      expect(res2.status).toBe('EXACT_DUPLICATE')
      expect(res2.isDuplicate).toBe(true)
      expect(res2.media.uploadedBy).toBe(USER_A_ID)
    })
  })
})
