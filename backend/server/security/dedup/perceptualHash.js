import { supabaseAdmin } from '../../config/supabaseAdmin.js'

export const DEFAULT_DHASH_THRESHOLD = 10 // Default heuristic threshold: up to 10 of 64 hash bits differ (requires empirical calibration)
const HEX_HASH_REGEX = /^0x[0-9a-f]{16,64}$/i

/**
 * Normalizes input image to a callable luma function and dimensions.
 * Supports:
 * - Direct raster object: { width, height, data: Uint8Array | number[], channels?: number }
 * - 2D matrix: number[][] (grayscale values 0-255)
 * - Binary buffer with uncompressed BMP or PPM header
 *
 * @param {any} input
 * @returns {{ width: number, height: number, getLuma: (x: number, y: number) => number }}
 */
function normalizeImageInput(input) {
  if (!input) {
    throw new TypeError('Image input must not be null or undefined')
  }

  // 1. If input is 2D matrix (number[][])
  if (Array.isArray(input) && input.length > 0 && Array.isArray(input[0])) {
    const height = input.length
    const width = input[0].length
    return {
      width,
      height,
      getLuma: (x, y) => input[y][x] ?? 0,
    }
  }

  // 2. If input is raster object: { width, height, data, channels }
  if (
    typeof input === 'object' &&
    typeof input.width === 'number' &&
    typeof input.height === 'number' &&
    (input.data instanceof Uint8Array || Array.isArray(input.data) || (typeof Buffer !== 'undefined' && Buffer.isBuffer(input.data)))
  ) {
    const { width, height, data, channels = 4 } = input
    return {
      width,
      height,
      getLuma: (x, y) => {
        const offset = (y * width + x) * channels
        if (channels >= 3) {
          const r = data[offset] ?? 0
          const g = data[offset + 1] ?? 0
          const b = data[offset + 2] ?? 0
          return 0.299 * r + 0.587 * g + 0.114 * b
        }
        return data[offset] ?? 0
      },
    }
  }

  // 3. If input is raw binary buffer (Uint8Array / Buffer), parse simple BMP or PPM if present
  let bytes = null
  if (input instanceof Uint8Array) {
    bytes = input
  } else if (typeof ArrayBuffer !== 'undefined' && input instanceof ArrayBuffer) {
    bytes = new Uint8Array(input)
  } else if (input?.buffer instanceof ArrayBuffer && typeof input.byteOffset === 'number' && typeof input.byteLength === 'number') {
    bytes = new Uint8Array(input.buffer, input.byteOffset, input.byteLength)
  }

  if (bytes && bytes.length >= 10) {
    // Check for BMP format ('BM' magic bytes)
    if (bytes[0] === 0x42 && bytes[1] === 0x4d && bytes.length >= 54) {
      const dataOffset = bytes[10] | (bytes[11] << 8) | (bytes[12] << 16) | (bytes[13] << 24)
      const width = bytes[18] | (bytes[19] << 8) | (bytes[20] << 16) | (bytes[21] << 24)
      const height = Math.abs(bytes[22] | (bytes[23] << 8) | (bytes[24] << 16) | (bytes[25] << 24))
      const bpp = bytes[28] | (bytes[29] << 8)

      if (width > 0 && height > 0 && (bpp === 24 || bpp === 32)) {
        const bytesPerPixel = bpp / 8
        const rowSize = Math.floor((bpp * width + 31) / 32) * 4
        return {
          width,
          height,
          getLuma: (x, y) => {
            // BMP stores rows bottom-to-top by default
            const row = height - 1 - y
            const offset = dataOffset + row * rowSize + x * bytesPerPixel
            const b = bytes[offset] ?? 0
            const g = bytes[offset + 1] ?? 0
            const r = bytes[offset + 2] ?? 0
            return 0.299 * r + 0.587 * g + 0.114 * b
          },
        }
      }
    }

    // Check for PPM format ('P6' binary or 'P3' ascii)
    if (bytes[0] === 0x50 && bytes[1] === 0x36) {
      // Basic P6 header parser
      const str = new TextDecoder().decode(bytes.subarray(0, 100))
      const parts = str.split(/\s+/).filter((p) => p && !p.startsWith('#'))
      if (parts.length >= 4) {
        const width = parseInt(parts[1], 10)
        const height = parseInt(parts[2], 10)
        const headerEnd = str.indexOf(parts[3]) + parts[3].length + 1
        if (width > 0 && height > 0 && bytes.length >= headerEnd + width * height * 3) {
          const pixelData = bytes.subarray(headerEnd)
          return {
            width,
            height,
            getLuma: (x, y) => {
              const offset = (y * width + x) * 3
              const r = pixelData[offset] ?? 0
              const g = pixelData[offset + 1] ?? 0
              const b = pixelData[offset + 2] ?? 0
              return 0.299 * r + 0.587 * g + 0.114 * b
            },
          }
        }
      }
    }

    // Fallback: If raw square/rectangular buffer provided, infer square dimensions
    const totalBytes = bytes.length
    const possibleDim = Math.floor(Math.sqrt(totalBytes))
    if (possibleDim >= 8) {
      return {
        width: possibleDim,
        height: possibleDim,
        getLuma: (x, y) => bytes[y * possibleDim + x] ?? 0,
      }
    }
  }

  throw new TypeError(
    'Unsupported image format. Expected a raster object { width, height, data }, 2D grayscale matrix, or valid BMP/PPM image buffer.'
  )
}

/**
 * Computes a 64-bit difference hash (dHash) for an image.
 * Resamples the image to 9x8 grayscale grid and compares horizontal adjacent pixel gradients.
 * Returns a 0x-prefixed 16-character lowercase hex string (`0x${string}`).
 *
 * @param {any} imageInput
 * @returns {`0x${string}`} 16-character hex dHash
 */
export function computeImagePerceptualHash(imageInput) {
  const { width: srcW, height: srcH, getLuma } = normalizeImageInput(imageInput)

  const targetW = 9
  const targetH = 8
  const grid = new Float64Array(targetW * targetH)

  const xRatio = srcW / targetW
  const yRatio = srcH / targetH

  // Downsample to 9 cols x 8 rows using center-pixel sampling
  for (let ty = 0; ty < targetH; ty++) {
    const srcY = Math.min(srcH - 1, Math.floor((ty + 0.5) * yRatio))
    for (let tx = 0; tx < targetW; tx++) {
      const srcX = Math.min(srcW - 1, Math.floor((tx + 0.5) * xRatio))
      grid[ty * targetW + tx] = getLuma(srcX, srcY)
    }
  }

  // Generate 64 bits (8 rows x 8 horizontal gradient comparisons)
  let hexResult = ''
  let currentNibble = 0
  let bitCount = 0

  for (let ty = 0; ty < targetH; ty++) {
    const rowOffset = ty * targetW
    for (let tx = 0; tx < 8; tx++) {
      const left = grid[rowOffset + tx]
      const right = grid[rowOffset + tx + 1]
      const bit = left > right ? 1 : 0

      currentNibble = (currentNibble << 1) | bit
      bitCount++

      if (bitCount % 4 === 0) {
        hexResult += currentNibble.toString(16)
        currentNibble = 0
      }
    }
  }

  return `0x${hexResult}`
}

/**
 * Computes the Hamming distance (number of differing bits) between two hexadecimal hashes.
 *
 * @param {string} hashA - 0x-prefixed hex string
 * @param {string} hashB - 0x-prefixed hex string
 * @returns {number} Integer bit distance (0 to N)
 */
export function hammingDistance(hashA, hashB) {
  if (typeof hashA !== 'string' || typeof hashB !== 'string') {
    throw new TypeError('Hashes must be non-empty strings')
  }

  const cleanA = hashA.startsWith('0x') || hashA.startsWith('0X') ? hashA.slice(2).toLowerCase() : hashA.toLowerCase()
  const cleanB = hashB.startsWith('0x') || hashB.startsWith('0X') ? hashB.slice(2).toLowerCase() : hashB.toLowerCase()

  if (!/^[0-9a-f]+$/i.test(cleanA) || !/^[0-9a-f]+$/i.test(cleanB)) {
    throw new TypeError('Hashes must be valid hexadecimal strings')
  }

  if (cleanA.length !== cleanB.length) {
    throw new Error(`Hash length mismatch: ${cleanA.length} vs ${cleanB.length}`)
  }

  let distance = 0
  for (let i = 0; i < cleanA.length; i++) {
    let xor = parseInt(cleanA[i], 16) ^ parseInt(cleanB[i], 16)
    // Brian Kernighan's algorithm to count set bits
    while (xor > 0) {
      distance += xor & 1
      xor >>= 1
    }
  }

  return distance
}

/**
 * Checks whether two perceptual hashes are near-duplicates within a given Hamming distance threshold.
 *
 * @param {string} hashA
 * @param {string} hashB
 * @param {number} [threshold=DEFAULT_DHASH_THRESHOLD]
 * @returns {boolean}
 */
export function isNearDuplicate(hashA, hashB, threshold = DEFAULT_DHASH_THRESHOLD) {
  if (typeof threshold !== 'number' || threshold < 0) {
    throw new TypeError('Threshold must be a non-negative number')
  }
  return hammingDistance(hashA, hashB) <= threshold
}

/**
 * Computes a temporal video perceptual fingerprint from an array of sampled keyframes.
 * Note: Video frame extraction pipeline is an explicit integration point for the media pipeline.
 *
 * @param {Array<any>} frames - Sampled keyframes
 * @returns {{ algorithm: string, frameCount: number, frameHashes: string[] }}
 */
export function computeVideoPerceptualFingerprint(frames) {
  if (!Array.isArray(frames) || frames.length === 0) {
    throw new TypeError(
      'computeVideoPerceptualFingerprint requires an array of sampled image frames. Video frame extraction pipeline is required.'
    )
  }

  const frameHashes = frames.map((frame, idx) => {
    try {
      return computeImagePerceptualHash(frame)
    } catch (err) {
      throw new Error(`Failed to compute perceptual hash for video frame at index ${idx}: ${err.message}`)
    }
  })

  return {
    algorithm: 'video_sampled_dhash_sequence',
    frameCount: frameHashes.length,
    frameHashes,
  }
}

/**
 * Queries media_assets for perceptual near-duplicates within a given Hamming distance threshold.
 * Note on Scalability: For development and bounded candidate sets, evaluates Hamming distance in memory.
 * For production scale (millions of records), integrate a BK-Tree, Vantage-Point tree, or pg_similarity extension.
 *
 * @param {{
 *   perceptualHash: string,
 *   mediaType?: 'image' | 'video',
 *   threshold?: number,
 *   limit?: number,
 *   client?: any
 * }} params
 * @returns {Promise<{
 *   hasNearDuplicates: boolean,
 *   matches: Array<{ mediaAsset: any, distance: number, similarityScore: number }>,
 *   thresholdUsed: number
 * }>}
 */
export async function findNearDuplicates({
  perceptualHash,
  mediaType = 'image',
  threshold = DEFAULT_DHASH_THRESHOLD,
  limit = 20,
  client = supabaseAdmin,
}) {
  if (!perceptualHash || typeof perceptualHash !== 'string' || !HEX_HASH_REGEX.test(perceptualHash)) {
    throw new TypeError('perceptualHash must be a valid 0x-prefixed hexadecimal string')
  }

  if (typeof threshold !== 'number' || threshold < 0) {
    throw new TypeError('threshold must be a non-negative number')
  }

  const { data, error } = await client
    .from('media_assets')
    .select('id, sha256_hash, perceptual_hash, perceptual_hash_algo, media_type, mime_type, file_size, storage_reference, original_filename, uploaded_by, created_at')
    .eq('media_type', mediaType)
    .not('perceptual_hash', 'is', null)
    .limit(limit)

  if (error) {
    throw new Error(`Database error querying near-duplicate candidates: ${error.message}`)
  }

  const matches = []
  for (const asset of data || []) {
    if (!asset.perceptual_hash) continue
    try {
      const distance = hammingDistance(perceptualHash, asset.perceptual_hash)
      if (distance <= threshold) {
        matches.push({
          mediaAsset: {
            id: asset.id,
            sha256Hash: asset.sha256_hash,
            perceptualHash: asset.perceptual_hash,
            perceptualHashAlgo: asset.perceptual_hash_algo,
            mediaType: asset.media_type,
            mimeType: asset.mime_type,
            fileSize: Number(asset.file_size),
            storageReference: asset.storage_reference,
            originalFilename: asset.original_filename,
            uploadedBy: asset.uploaded_by,
            createdAt: asset.created_at,
          },
          distance,
          similarityScore: Number((1 - distance / 64).toFixed(4)),
        })
      }
    } catch {
      // Ignore candidates with mismatched hash lengths
    }
  }

  // Sort closest visual matches first
  matches.sort((a, b) => a.distance - b.distance)

  return {
    hasNearDuplicates: matches.length > 0,
    matches,
    thresholdUsed: threshold,
  }
}

export default {
  DEFAULT_DHASH_THRESHOLD,
  computeImagePerceptualHash,
  hammingDistance,
  isNearDuplicate,
  computeVideoPerceptualFingerprint,
  findNearDuplicates,
}
