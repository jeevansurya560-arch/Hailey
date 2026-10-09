import { keccak256, sha256, stringToBytes } from 'viem'

/**
 * Computes communityId = keccak256(utf8(community.slug))
 * Pure, browser-compatible function safe for both client and server runtimes.
 *
 * @param {string} slug The community slug, e.g. "streetwear-archive"
 * @returns {`0x${string}`} bytes32 hex string starting with "0x"
 */
export function computeCommunityId(slug) {
  if (!slug || typeof slug !== 'string') {
    throw new TypeError('Community slug must be a non-empty string')
  }
  return keccak256(stringToBytes(slug.trim()))
}

/**
 * Computes legacy canonical itemContent string serialization (v1):
 * itemContent = kind + ":" + (post_id | url | "") + ":" + (note | "")
 *
 * @param {{ kind: string, post_id?: string | null, url?: string | null, note?: string | null }} item
 * @returns {string}
 */
export function computeItemContent(item) {
  if (!item || typeof item !== 'object') {
    throw new TypeError('Item must be an object')
  }

  let target = ''
  if (item.kind === 'post') {
    target = item.post_id || ''
  } else if (item.kind === 'link') {
    target = item.url || ''
  }

  const note = item.note || ''
  return `${item.kind}:${target}:${note}`
}

/**
 * Computes deterministic binary SHA-256 digest of arbitrary bytes or string.
 * Supports Uint8Array, ArrayBuffer, Node.js Buffer, and UTF-8 strings.
 * Returns standard 0x-prefixed 64-character lowercase hex string (`0x${string}`).
 *
 * @param {Uint8Array | ArrayBuffer | Buffer | string} data
 * @returns {`0x${string}`}
 */
export function sha256Bytes(data) {
  if (data === null || data === undefined) {
    throw new TypeError('Input data cannot be null or undefined')
  }

  let bytes
  if (data instanceof Uint8Array) {
    bytes = data
  } else if (typeof ArrayBuffer !== 'undefined' && data instanceof ArrayBuffer) {
    bytes = new Uint8Array(data)
  } else if (typeof data === 'string') {
    bytes = stringToBytes(data)
  } else if (
    data &&
    typeof data === 'object' &&
    data.buffer instanceof ArrayBuffer &&
    typeof data.byteOffset === 'number' &&
    typeof data.byteLength === 'number'
  ) {
    // Handles Buffer or TypedArray sub-views
    bytes = new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
  } else {
    throw new TypeError('Input data must be a Uint8Array, ArrayBuffer, Buffer, or string')
  }

  return sha256(bytes)
}

/**
 * Normalizes and canonicalizes structured content fields for deterministic hashing (v2).
 * Requirements:
 * - Trims whitespace
 * - Unicode NFC normalization
 * - Standardizes null/undefined values
 * - Deterministic format: `${kind}:${target}:${note}`
 *
 * @param {{ kind: string, post_id?: string | null, url?: string | null, note?: string | null }} item
 * @returns {string}
 */
export function canonicalizeContent(item) {
  if (!item || typeof item !== 'object') {
    throw new TypeError('Item must be an object')
  }

  const rawKind = typeof item.kind === 'string' ? item.kind.trim().toLowerCase() : ''
  if (!rawKind || !['post', 'link', 'note'].includes(rawKind)) {
    throw new TypeError("Item kind must be one of 'post', 'link', or 'note'")
  }

  let target = ''
  if (rawKind === 'post') {
    target = typeof item.post_id === 'string' ? item.post_id.trim().toLowerCase() : ''
  } else if (rawKind === 'link') {
    target = typeof item.url === 'string' ? item.url.trim() : ''
  }

  const note = typeof item.note === 'string' ? item.note.trim().normalize('NFC') : ''

  return `${rawKind}:${target}:${note}`
}

/**
 * Computes legacy v1 contentHash:
 * contentHash = keccak256(utf8(
 *   "hailey:v1|" + itemId + "|" + collectionId + "|" + communitySlug + "|" + sha256hex(itemContent)
 * ))
 *
 * Preserved for 100% backward compatibility with existing onchain attestations and historical records.
 *
 * @param {{ itemId: string, collectionId: string, communitySlug: string, item: { kind: string, post_id?: string | null, url?: string | null, note?: string | null } }} params
 * @returns {`0x${string}`} bytes32 hex string starting with "0x"
 */
export function computeContentHashV1(params) {
  if (!params || typeof params !== 'object') {
    throw new TypeError('Params must be an object')
  }

  const itemContent = computeItemContent(params.item)
  // sha256 via viem returns 0x-prefixed hex string; slice(2) extracts raw hex digest
  const sha256Hex = sha256(stringToBytes(itemContent)).slice(2)

  const canonicalString = `hailey:v1|${params.itemId}|${params.collectionId}|${params.communitySlug}|${sha256Hex}`
  return keccak256(stringToBytes(canonicalString))
}

/**
 * Computes deterministic canonical v2 contentHash:
 * contentHash = keccak256(utf8(
 *   "hailey:v2|" + communitySlug + "|" + sha256hex(canonicalContent)
 * ))
 *
 * EXCLUDES ephemeral database identifiers (itemId, collectionId, uploaderId, timestamps).
 * Two identical items proposed in the same community produce the exact same contentHash.
 *
 * @param {{ communitySlug: string, item: { kind: string, post_id?: string | null, url?: string | null, note?: string | null } }} params
 * @returns {`0x${string}`} bytes32 hex string starting with "0x"
 */
export function computeContentHashV2(params) {
  if (!params || typeof params !== 'object') {
    throw new TypeError('Params must be an object')
  }
  if (!params.communitySlug || typeof params.communitySlug !== 'string') {
    throw new TypeError('Community slug must be a non-empty string')
  }

  const canonicalItem = canonicalizeContent(params.item)
  const sha256Hex = sha256(stringToBytes(canonicalItem)).slice(2)
  const normalizedSlug = params.communitySlug.trim().toLowerCase()

  const canonicalString = `hailey:v2|${normalizedSlug}|${sha256Hex}`
  return keccak256(stringToBytes(canonicalString))
}

/**
 * Legacy wrapper function for computeContentHash.
 * Explicitly maps to computeContentHashV1 for backward compatibility.
 *
 * @deprecated Use computeContentHashV1 for legacy records or computeContentHashV2 for new deterministic content identity.
 * @param {{ itemId: string, collectionId: string, communitySlug: string, item: { kind: string, post_id?: string | null, url?: string | null, note?: string | null } }} params
 * @returns {`0x${string}`} bytes32 hex string starting with "0x"
 */
export function computeContentHash(params) {
  return computeContentHashV1(params)
}
