import { sha256Bytes } from '../../../../shared/crypto/hashing.js'
import { supabaseAdmin } from '../../config/supabaseAdmin.js'

const SHA256_HEX_REGEX = /^0x[0-9a-f]{64}$/i
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Computes authoritative media SHA-256 hash from raw binary data.
 * Pure byte-level calculation ignoring filename, path, or uploader.
 *
 * @param {Uint8Array | ArrayBuffer | Buffer | string} data
 * @returns {`0x${string}`} 64-character lowercase hex string prefixed with 0x
 */
export function calculateMediaSha256(data) {
  if (data === null || data === undefined) {
    throw new TypeError('Media data must not be null or undefined')
  }
  return sha256Bytes(data)
}

/**
 * Queries the media_assets table for an exact SHA-256 match.
 *
 * @param {string} sha256Hash - 0x-prefixed 64-character hex hash
 * @param {any} [client=supabaseAdmin] - Database client instance
 * @returns {Promise<{ isDuplicate: boolean, existingMedia: any | null }>}
 */
export async function findExactDuplicate(sha256Hash, client = supabaseAdmin) {
  if (!sha256Hash || typeof sha256Hash !== 'string' || !SHA256_HEX_REGEX.test(sha256Hash)) {
    throw new TypeError('sha256Hash must be a valid 0x-prefixed 64-character hex string')
  }

  const normalizedHash = sha256Hash.toLowerCase()

  const { data, error } = await client
    .from('media_assets')
    .select('id, sha256_hash, media_type, mime_type, file_size, storage_reference, original_filename, uploaded_by, created_at')
    .eq('sha256_hash', normalizedHash)
    .maybeSingle()

  if (error) {
    throw new Error(`Database error querying exact duplicate: ${error.message}`)
  }

  if (data) {
    return {
      isDuplicate: true,
      existingMedia: {
        id: data.id,
        sha256Hash: data.sha256_hash,
        mediaType: data.media_type,
        mimeType: data.mime_type,
        fileSize: Number(data.file_size),
        storageReference: data.storage_reference,
        originalFilename: data.original_filename,
        uploadedBy: data.uploaded_by,
        createdAt: data.created_at,
      },
    }
  }

  return {
    isDuplicate: false,
    existingMedia: null,
  }
}

/**
 * Authoritatively registers a media asset or returns the existing canonical duplicate.
 * Enforces server-side hash calculation and handles database race conditions.
 *
 * @param {{
 *   mediaBytes: Uint8Array | ArrayBuffer | Buffer | string,
 *   mediaType: 'image' | 'video',
 *   mimeType: string,
 *   fileSize: number,
 *   storageReference?: string | null,
 *   originalFilename?: string | null,
 *   uploaderId: string
 * }} params
 * @param {any} [client=supabaseAdmin]
 * @returns {Promise<{
 *   status: 'CREATED' | 'EXACT_DUPLICATE',
 *   isDuplicate: boolean,
 *   media: any,
 *   message: string
 * }>}
 */
export async function registerMediaAsset(params, client = supabaseAdmin) {
  if (!params || typeof params !== 'object') {
    throw new TypeError('Registration parameters must be an object')
  }

  const {
    mediaBytes,
    mediaType,
    mimeType,
    fileSize,
    storageReference = null,
    originalFilename = null,
    uploaderId,
  } = params

  if (!mediaBytes) {
    throw new TypeError('mediaBytes is required to calculate authoritative media identity')
  }

  if (!mediaType || !['image', 'video'].includes(mediaType)) {
    throw new TypeError("mediaType must be either 'image' or 'video'")
  }

  if (!mimeType || typeof mimeType !== 'string') {
    throw new TypeError('mimeType must be a non-empty string')
  }

  if (typeof fileSize !== 'number' || fileSize <= 0) {
    throw new TypeError('fileSize must be a positive number')
  }

  if (!uploaderId || typeof uploaderId !== 'string' || !UUID_REGEX.test(uploaderId)) {
    throw new TypeError('uploaderId is required and must be a valid UUID')
  }

  // 1. Authoritative server-side SHA-256 computation (client hashes are never trusted)
  const sha256Hash = calculateMediaSha256(mediaBytes)

  // 2. Check for existing exact duplicate
  const existingCheck = await findExactDuplicate(sha256Hash, client)
  if (existingCheck.isDuplicate && existingCheck.existingMedia) {
    return {
      status: 'EXACT_DUPLICATE',
      isDuplicate: true,
      media: existingCheck.existingMedia,
      message: 'Exact duplicate content detected. Original provenance preserved.',
    }
  }

  // 3. Attempt atomic database insertion
  const { data: inserted, error } = await client
    .from('media_assets')
    .insert({
      sha256_hash: sha256Hash,
      media_type: mediaType,
      mime_type: mimeType.trim().toLowerCase(),
      file_size: fileSize,
      storage_reference: storageReference ? storageReference.trim() : null,
      original_filename: originalFilename ? originalFilename.trim() : null,
      uploaded_by: uploaderId,
    })
    .select('id, sha256_hash, media_type, mime_type, file_size, storage_reference, original_filename, uploaded_by, created_at')
    .single()

  if (error) {
    // 4. Handle concurrent race condition via PostgreSQL unique violation (code 23505)
    if (error.code === '23505' || error.message?.includes('duplicate key') || error.message?.includes('unique')) {
      const raceDuplicate = await findExactDuplicate(sha256Hash, client)
      if (raceDuplicate.isDuplicate && raceDuplicate.existingMedia) {
        return {
          status: 'EXACT_DUPLICATE',
          isDuplicate: true,
          media: raceDuplicate.existingMedia,
          message: 'Exact duplicate content detected (concurrent registration resolved).',
        }
      }
    }
    throw new Error(`Failed to register media asset: ${error.message}`)
  }

  return {
    status: 'CREATED',
    isDuplicate: false,
    media: {
      id: inserted.id,
      sha256Hash: inserted.sha256_hash,
      mediaType: inserted.media_type,
      mimeType: inserted.mime_type,
      fileSize: Number(inserted.file_size),
      storageReference: inserted.storage_reference,
      originalFilename: inserted.original_filename,
      uploadedBy: inserted.uploaded_by,
      createdAt: inserted.created_at,
    },
    message: 'Media asset registered successfully.',
  }
}

export default {
  calculateMediaSha256,
  findExactDuplicate,
  registerMediaAsset,
}
