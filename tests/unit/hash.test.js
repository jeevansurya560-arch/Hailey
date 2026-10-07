import { describe, it, expect } from 'vitest'
import {
  computeCommunityId,
  computeItemContent,
  computeContentHash,
} from '../../shared/crypto/hashing.js'

describe('shared/crypto/hashing.js - Cryptographic Hashing Unit Tests', () => {
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

  it('computes canonical contentHash matching deterministic test vectors', () => {
    const params = {
      itemId: 'd3b07384-d113-40e1-a0cf-795b583f7362',
      collectionId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      communitySlug: 'tokyo-vintage',
      item: {
        kind: 'link',
        url: 'https://archive.org/fashion-issue-1',
        note: 'Rare 90s issue scan',
      },
    }

    const hash = computeContentHash(params)
    expect(hash).toMatch(/^0x[0-9a-f]{64}$/)
    expect(hash).toBe(
      '0xdee04155ade44cffae243d2a79734108ad72f3aa67ebb0128692333ebab813d9'
    )

    // Same inputs produce identical hash
    expect(computeContentHash(params)).toBe(hash)
  })
})
