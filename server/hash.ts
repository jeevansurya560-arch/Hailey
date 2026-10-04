import { keccak256, stringToBytes } from 'viem'
import { createHash } from 'node:crypto'

export interface CollectionItemInput {
  id: string
  collection_id: string
  kind: 'post' | 'link' | 'note'
  post_id?: string | null
  url?: string | null
  note?: string | null
}

/**
 * Computes communityId = keccak256(utf8(community.slug))
 * @param slug The community slug, e.g. "streetwear-archive"
 * @returns bytes32 hex string starting with "0x"
 */
export function computeCommunityId(slug: string): `0x${string}` {
  return keccak256(stringToBytes(slug.trim()))
}

/**
 * Computes itemContent = kind + ":" + (post_id | url | "") + ":" + (note | "")
 */
export function computeItemContent(item: {
  kind: 'post' | 'link' | 'note' | string
  post_id?: string | null
  url?: string | null
  note?: string | null
}): string {
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
 * Computes contentHash = keccak256(utf8(
 *   "hailey:v1|" + itemId + "|" + collectionId + "|" + communitySlug + "|" + sha256hex(itemContent)
 * ))
 */
export function computeContentHash(params: {
  itemId: string
  collectionId: string
  communitySlug: string
  item: {
    kind: 'post' | 'link' | 'note' | string
    post_id?: string | null
    url?: string | null
    note?: string | null
  }
}): `0x${string}` {
  const itemContent = computeItemContent(params.item)
  const sha256Hex = createHash('sha256').update(itemContent, 'utf8').digest('hex')

  const canonicalString = `hailey:v1|${params.itemId}|${params.collectionId}|${params.communitySlug}|${sha256Hex}`
  return keccak256(stringToBytes(canonicalString))
}
