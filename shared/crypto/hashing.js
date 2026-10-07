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
 * Computes canonical itemContent string serialization:
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
 * Computes deterministic canonical contentHash:
 * contentHash = keccak256(utf8(
 *   "hailey:v1|" + itemId + "|" + collectionId + "|" + communitySlug + "|" + sha256hex(itemContent)
 * ))
 *
 * Pure, browser-compatible function with zero reliance on node:crypto.
 *
 * @param {{ itemId: string, collectionId: string, communitySlug: string, item: { kind: string, post_id?: string | null, url?: string | null, note?: string | null } }} params
 * @returns {`0x${string}`} bytes32 hex string starting with "0x"
 */
export function computeContentHash(params) {
  if (!params || typeof params !== 'object') {
    throw new TypeError('Params must be an object')
  }

  const itemContent = computeItemContent(params.item)
  // sha256 via viem returns 0x-prefixed hex string; slice(2) extracts raw hex digest
  const sha256Hex = sha256(stringToBytes(itemContent)).slice(2)

  const canonicalString = `hailey:v1|${params.itemId}|${params.collectionId}|${params.communitySlug}|${sha256Hex}`
  return keccak256(stringToBytes(canonicalString))
}
