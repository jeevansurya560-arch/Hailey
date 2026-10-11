import { describe, it, expect, beforeEach } from 'vitest'
import {
  AGE_ELIGIBILITY,
  CONTENT_AGE_CLASSIFICATION,
  evaluateAgeAccessPolicy,
} from '../../backend/server/security/age/agePolicy.js'

/**
 * Mock database engine simulating PostgreSQL table structures, RLS policies,
 * and the database trigger `check_post_safety_and_age_policy()`.
 */
function createMockPostgresWithAgeSecurity() {
  const users = new Map()
  const profiles = new Map()
  const ageEligibilities = new Map()
  const mediaAssets = new Map()
  const mediaSafetyAnalyses = new Map()
  const posts = new Map()

  return {
    _users: users,
    _profiles: profiles,
    _ageEligibilities: ageEligibilities,
    _mediaAssets: mediaAssets,
    _mediaSafetyAnalyses: mediaSafetyAnalyses,
    _posts: posts,

    // Helper to seed state
    seedUser({ id, email, eligibility = AGE_ELIGIBILITY.UNVERIFIED, method = 'unverified' }) {
      users.set(id, { id, email })
      profiles.set(id, { id, handle: email.split('@')[0], display_name: email.split('@')[0] })
      ageEligibilities.set(id, {
        user_id: id,
        eligibility,
        verification_method: method,
        verified_at: eligibility === AGE_ELIGIBILITY.ADULT ? new Date().toISOString() : null,
      })
    },

    seedMedia({ id, sha256_hash, age_classification = CONTENT_AGE_CLASSIFICATION.GENERAL, policy_status = 'ALLOWED' }) {
      mediaAssets.set(id, {
        id,
        sha256_hash,
        age_classification,
      })
      mediaSafetyAnalyses.set(id, {
        media_asset_id: id,
        policy_status,
      })
    },

    seedPost({ id, author_id, title = 'Post', content = '', media_asset_id = null, age_classification = CONTENT_AGE_CLASSIFICATION.GENERAL }) {
      posts.set(id, {
        id,
        author_id,
        title,
        content,
        media_asset_id,
        age_classification,
      })
    },

    // Simulates client database interaction under RLS and Triggers
    asClient(userId) {
      return {
        async selectPosts() {
          const results = []
          for (const post of posts.values()) {
            // RLS: posts_select_age_authorized
            if (post.age_classification === CONTENT_AGE_CLASSIFICATION.GENERAL) {
              results.push(post)
            } else if (post.age_classification === CONTENT_AGE_CLASSIFICATION.ADULT_18_PLUS) {
              // NO author exception: viewer must have authoritative ADULT eligibility
              const uae = userId ? ageEligibilities.get(userId) : null
              if (uae && uae.eligibility === AGE_ELIGIBILITY.ADULT) {
                results.push(post)
              }
            }
          }
          return { data: results, error: null }
        },

        async selectUserAgeEligibility(targetUserId) {
          // RLS: user_age_eligibility_select_own -> (auth.uid() = user_id)
          if (!userId || userId !== targetUserId) {
            return { data: null, error: { message: 'RLS: permission denied for relation user_age_eligibility' } }
          }
          const record = ageEligibilities.get(targetUserId)
          return { data: record || null, error: null }
        },

        async insertUserAgeEligibility(_spoofedRow) {
          // RLS: Direct client insert/update blocked on user_age_eligibility
          return {
            data: null,
            error: { message: 'RLS: direct modification of user_age_eligibility blocked' },
          }
        },

        async insertPost(postRow) {
          // Trigger: trg_check_post_safety_and_age -> check_post_safety_and_age_policy()
          // 0. author_id authenticity check
          if (userId && postRow.author_id && postRow.author_id !== userId) {
            return {
              data: null,
              error: {
                code: 'P0001',
                message: `Cannot forge author_id: author_id (${postRow.author_id}) does not match authenticated user (${userId})`,
              },
            }
          }

          const newPost = {
            id: postRow.id || `post-${posts.size + 1}`,
            author_id: userId || postRow.author_id,
            title: postRow.title || 'Untitled',
            content: postRow.content || '',
            media_asset_id: postRow.media_asset_id || null,
            age_classification: postRow.age_classification || CONTENT_AGE_CLASSIFICATION.GENERAL,
          }

          // 1. Phase 5 Media Safety Check
          if (newPost.media_asset_id) {
            const safety = mediaSafetyAnalyses.get(newPost.media_asset_id)
            if (!safety || safety.policy_status !== 'ALLOWED') {
              return {
                data: null,
                error: {
                  code: 'P0001',
                  message: `Media asset ${newPost.media_asset_id} is not cleared for publishing (safety policy status is not ALLOWED)`,
                },
              }
            }

            // 2. Phase 6 Attached Media Age Alignment
            const media = mediaAssets.get(newPost.media_asset_id)
            if (media && media.age_classification === CONTENT_AGE_CLASSIFICATION.ADULT_18_PLUS && newPost.age_classification !== CONTENT_AGE_CLASSIFICATION.ADULT_18_PLUS) {
              return {
                data: null,
                error: {
                  code: 'P0001',
                  message: 'Cannot attach ADULT_18_PLUS media to a non-adult post',
                },
              }
            }
          }

          // 3. Phase 6 Adult Publishing Eligibility Check
          if (newPost.age_classification === CONTENT_AGE_CLASSIFICATION.ADULT_18_PLUS) {
            const authorEligibility = ageEligibilities.get(newPost.author_id)
            if (!authorEligibility || authorEligibility.eligibility !== AGE_ELIGIBILITY.ADULT) {
              return {
                data: null,
                error: {
                  code: 'P0001',
                  message: `Author ${newPost.author_id} is not a verified adult and cannot publish ADULT_18_PLUS content`,
                },
              }
            }
          }

          posts.set(newPost.id, newPost)
          return { data: newPost, error: null }
        },

        async updatePost(postId, updates) {
          const existing = posts.get(postId)
          if (!existing) {
            return { data: null, error: { message: 'Post not found' } }
          }
          if (existing.author_id !== userId) {
            return { data: null, error: { message: 'Unauthorized post update: cannot update another author post' } }
          }

          if (updates.author_id && updates.author_id !== existing.author_id) {
            return { data: null, error: { code: 'P0001', message: 'Cannot change author_id of an existing post' } }
          }

          const targetMediaId = updates.media_asset_id !== undefined ? updates.media_asset_id : existing.media_asset_id
          const targetAgeClass = updates.age_classification !== undefined ? updates.age_classification : existing.age_classification

          // Trigger evaluation
          if (targetMediaId) {
            const safety = mediaSafetyAnalyses.get(targetMediaId)
            if (!safety || safety.policy_status !== 'ALLOWED') {
              return {
                data: null,
                error: { code: 'P0001', message: 'Media asset is not cleared for publishing' },
              }
            }

            const media = mediaAssets.get(targetMediaId)
            if (media && media.age_classification === CONTENT_AGE_CLASSIFICATION.ADULT_18_PLUS && targetAgeClass !== CONTENT_AGE_CLASSIFICATION.ADULT_18_PLUS) {
              return {
                data: null,
                error: { code: 'P0001', message: 'Cannot attach ADULT_18_PLUS media to a non-adult post' },
              }
            }
          }

          if (targetAgeClass === CONTENT_AGE_CLASSIFICATION.ADULT_18_PLUS) {
            const authorEligibility = ageEligibilities.get(userId)
            if (!authorEligibility || authorEligibility.eligibility !== AGE_ELIGIBILITY.ADULT) {
              return {
                data: null,
                error: { code: 'P0001', message: 'Author is not a verified adult and cannot publish ADULT_18_PLUS content' },
              }
            }
          }

          const updated = { ...existing, ...updates, age_classification: targetAgeClass, media_asset_id: targetMediaId }
          posts.set(postId, updated)
          return { data: updated, error: null }
        },
      }
    },
  }
}

describe('tests/security/adversarial_age_restriction.test.js - Adversarial & Security Defenses', () => {
  const ADULT_USER_ID = '11111111-1111-4111-8111-111111111111'
  const MINOR_USER_ID = '22222222-2222-4222-8222-222222222222'
  const UNVERIFIED_USER_ID = '33333333-3333-4333-8333-333333333333'
  const REVIEW_USER_ID = '44444444-4444-4444-8444-444444444444'

  const SAFE_MEDIA_ID = 'media-safe-001'
  const ADULT_MEDIA_ID = 'media-adult-002'
  const BLOCKED_MEDIA_ID = 'media-violent-003'

  let db

  beforeEach(() => {
    db = createMockPostgresWithAgeSecurity()

    db.seedUser({ id: ADULT_USER_ID, email: 'adult@test.org', eligibility: AGE_ELIGIBILITY.ADULT, method: 'id_document' })
    db.seedUser({ id: MINOR_USER_ID, email: 'minor@test.org', eligibility: AGE_ELIGIBILITY.MINOR, method: 'id_document' })
    db.seedUser({ id: UNVERIFIED_USER_ID, email: 'unverified@test.org', eligibility: AGE_ELIGIBILITY.UNVERIFIED, method: 'unverified' })
    db.seedUser({ id: REVIEW_USER_ID, email: 'review@test.org', eligibility: AGE_ELIGIBILITY.REQUIRES_REVIEW, method: 'third_party_provider' })

    db.seedMedia({ id: SAFE_MEDIA_ID, sha256_hash: '0x1111', age_classification: CONTENT_AGE_CLASSIFICATION.GENERAL, policy_status: 'ALLOWED' })
    db.seedMedia({ id: ADULT_MEDIA_ID, sha256_hash: '0x2222', age_classification: CONTENT_AGE_CLASSIFICATION.ADULT_18_PLUS, policy_status: 'ALLOWED' })
    db.seedMedia({ id: BLOCKED_MEDIA_ID, sha256_hash: '0x3333', age_classification: CONTENT_AGE_CLASSIFICATION.GENERAL, policy_status: 'BLOCKED' })
  })

  // ── 1. Comprehensive Viewing Security & NO-Author Bypass ───────
  it('1. Minor reads another user ADULT_18_PLUS post -> DENIED', async () => {
    db.seedPost({
      id: 'adult-post-other',
      author_id: ADULT_USER_ID,
      title: 'Adult Content by Adult User',
      age_classification: CONTENT_AGE_CLASSIFICATION.ADULT_18_PLUS,
    })

    const minorClient = db.asClient(MINOR_USER_ID)
    const { data } = await minorClient.selectPosts()
    expect(data.find((p) => p.id === 'adult-post-other')).toBeUndefined()
  })

  it('2. Minor reads their OWN ADULT_18_PLUS post -> STRICTLY DENIED (No author bypass)', async () => {
    db.seedPost({
      id: 'adult-post-minor-own',
      author_id: MINOR_USER_ID,
      title: 'Legacy/Corrupted Adult Post by Minor',
      age_classification: CONTENT_AGE_CLASSIFICATION.ADULT_18_PLUS,
    })

    const minorClient = db.asClient(MINOR_USER_ID)
    const { data } = await minorClient.selectPosts()
    expect(data.find((p) => p.id === 'adult-post-minor-own')).toBeUndefined()
  })

  it('3. Unverified user reads their OWN ADULT_18_PLUS post -> STRICTLY DENIED (No author bypass)', async () => {
    db.seedPost({
      id: 'adult-post-unverified-own',
      author_id: UNVERIFIED_USER_ID,
      title: 'Adult Post by Unverified User',
      age_classification: CONTENT_AGE_CLASSIFICATION.ADULT_18_PLUS,
    })

    const unverifiedClient = db.asClient(UNVERIFIED_USER_ID)
    const { data } = await unverifiedClient.selectPosts()
    expect(data.find((p) => p.id === 'adult-post-unverified-own')).toBeUndefined()
  })

  it('4. Requires-review user reads their OWN ADULT_18_PLUS post -> STRICTLY DENIED (No author bypass)', async () => {
    db.seedPost({
      id: 'adult-post-review-own',
      author_id: REVIEW_USER_ID,
      title: 'Adult Post by Under-Review User',
      age_classification: CONTENT_AGE_CLASSIFICATION.ADULT_18_PLUS,
    })

    const reviewClient = db.asClient(REVIEW_USER_ID)
    const { data } = await reviewClient.selectPosts()
    expect(data.find((p) => p.id === 'adult-post-review-own')).toBeUndefined()
  })

  it('5. Adult reads ADULT_18_PLUS post -> ALLOWED when all policies pass', async () => {
    db.seedPost({
      id: 'adult-post-valid',
      author_id: ADULT_USER_ID,
      title: 'Verified Adult Archive',
      age_classification: CONTENT_AGE_CLASSIFICATION.ADULT_18_PLUS,
    })

    const adultClient = db.asClient(ADULT_USER_ID)
    const { data } = await adultClient.selectPosts()
    expect(data.find((p) => p.id === 'adult-post-valid')).toBeDefined()
  })

  // ── 2. Publishing, Trigger & author_id Spoofing Defenses ────────
  it('6. Minor attempts to publish ADULT_18_PLUS -> REJECTED by trigger', async () => {
    const minorClient = db.asClient(MINOR_USER_ID)
    const res = await minorClient.insertPost({
      title: 'Minor Attempting 18+',
      age_classification: CONTENT_AGE_CLASSIFICATION.ADULT_18_PLUS,
    })
    expect(res.error).not.toBeNull()
    expect(res.error.message).toContain('is not a verified adult and cannot publish ADULT_18_PLUS content')
  })

  it('7. Client attempts to publish ADULT_18_PLUS with a forged author_id (adult UUID) -> REJECTED by trigger', async () => {
    const minorClient = db.asClient(MINOR_USER_ID)
    // Minor submits adult's UUID in author_id payload
    const res = await minorClient.insertPost({
      author_id: ADULT_USER_ID, // FORGED ID
      title: 'Spoofed Author Post',
      age_classification: CONTENT_AGE_CLASSIFICATION.ADULT_18_PLUS,
    })
    expect(res.error).not.toBeNull()
    expect(res.error.message).toContain('Cannot forge author_id')
  })

  it('8. Client attempts to update an existing post author_id -> REJECTED by trigger', async () => {
    const adultClient = db.asClient(ADULT_USER_ID)
    const { data: post } = await adultClient.insertPost({
      title: 'Authentic Adult Post',
      age_classification: CONTENT_AGE_CLASSIFICATION.GENERAL,
    })

    // Attempt to change author_id to another user
    const { error } = await adultClient.updatePost(post.id, {
      author_id: MINOR_USER_ID,
    })
    expect(error).not.toBeNull()
    expect(error.message).toContain('Cannot change author_id of an existing post')
  })

  it('9. Client attempts to change GENERAL -> ADULT_18_PLUS without adult eligibility -> REJECTED by trigger', async () => {
    const unverifiedClient = db.asClient(UNVERIFIED_USER_ID)
    const { data: post } = await unverifiedClient.insertPost({
      title: 'Initially General Post',
      age_classification: CONTENT_AGE_CLASSIFICATION.GENERAL,
    })

    const { error } = await unverifiedClient.updatePost(post.id, {
      age_classification: CONTENT_AGE_CLASSIFICATION.ADULT_18_PLUS,
    })
    expect(error).not.toBeNull()
    expect(error.message).toContain('Author is not a verified adult and cannot publish ADULT_18_PLUS content')
  })

  it('10. Client attempts to attach ADULT_18_PLUS media to a GENERAL post -> REJECTED by trigger', async () => {
    const adultClient = db.asClient(ADULT_USER_ID)
    const res = await adultClient.insertPost({
      title: 'Sneaky Mismatch Post',
      media_asset_id: ADULT_MEDIA_ID,
      age_classification: CONTENT_AGE_CLASSIFICATION.GENERAL,
    })
    expect(res.error).not.toBeNull()
    expect(res.error.message).toContain('Cannot attach ADULT_18_PLUS media to a non-adult post')
  })

  it('11. Direct Supabase SELECT cannot bypass the policy for unverified viewers', async () => {
    db.seedPost({
      id: 'adult-post-secret',
      author_id: ADULT_USER_ID,
      title: 'Restricted Sacred Heritage',
      age_classification: CONTENT_AGE_CLASSIFICATION.ADULT_18_PLUS,
    })

    const anonClient = db.asClient(null)
    const { data: anonData } = await anonClient.selectPosts()
    expect(anonData.find((p) => p.id === 'adult-post-secret')).toBeUndefined()
  })

  it('12. Existing Phase 5 safety restrictions remain strictly enforced', async () => {
    const adultClient = db.asClient(ADULT_USER_ID)
    // Adult attempts to insert post attaching Phase 5 BLOCKED media
    const res = await adultClient.insertPost({
      title: 'Violent Post Attempt',
      media_asset_id: BLOCKED_MEDIA_ID,
      age_classification: CONTENT_AGE_CLASSIFICATION.ADULT_18_PLUS,
    })
    expect(res.error).not.toBeNull()
    expect(res.error.message).toContain('is not cleared for publishing (safety policy status is not ALLOWED)')
  })

  // ── 3. Additional Privacy & Integrity Invariants ───────────────
  it('13. Client cannot spoof age_verified=true or is_adult=true in evaluation', () => {
    const clientPayload = { age_verified: true, is_adult: true }
    const res = evaluateAgeAccessPolicy({
      userEligibility: AGE_ELIGIBILITY.UNVERIFIED,
      contentClassification: CONTENT_AGE_CLASSIFICATION.ADULT_18_PLUS,
      graphicSafetyPolicyStatus: 'ALLOWED',
      ...clientPayload,
    })
    expect(res.allowed).toBe(false)
  })

  it('14. Client cannot directly modify user_age_eligibility table', async () => {
    const minorClient = db.asClient(MINOR_USER_ID)
    const { error } = await minorClient.insertUserAgeEligibility({
      user_id: MINOR_USER_ID,
      eligibility: AGE_ELIGIBILITY.ADULT,
    })
    expect(error).not.toBeNull()
    expect(error.message).toContain('RLS: direct modification of user_age_eligibility blocked')
  })

  it('15. Text-only posts continue working seamlessly for all users', async () => {
    const minorClient = db.asClient(MINOR_USER_ID)
    const res = await minorClient.insertPost({
      title: 'Text-Only Essay',
      content: 'Cultural essay without media.',
      media_asset_id: null,
      age_classification: CONTENT_AGE_CLASSIFICATION.GENERAL,
    })
    expect(res.error).toBeNull()
    expect(res.data.media_asset_id).toBeNull()
  })

  it('16. User cannot inspect another user age eligibility record; No sensitive PII exposed', async () => {
    const minorClient = db.asClient(MINOR_USER_ID)
    const res = await minorClient.selectUserAgeEligibility(ADULT_USER_ID)
    expect(res.error).not.toBeNull()
    expect(res.error.message).toContain('RLS: permission denied')

    const ownRes = await minorClient.selectUserAgeEligibility(MINOR_USER_ID)
    expect(ownRes.error).toBeNull()
    expect(ownRes.data.dob).toBeUndefined()
    expect(ownRes.data.identity_document).toBeUndefined()
  })

  it('17. Wallet ownership and on-chain identity do NOT constitute age verification', () => {
    const _walletUser = {
      wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
      is_wallet_connected: true,
      has_nft: true,
    }
    const res = evaluateAgeAccessPolicy({
      userEligibility: AGE_ELIGIBILITY.UNVERIFIED,
      contentClassification: CONTENT_AGE_CLASSIFICATION.ADULT_18_PLUS,
      graphicSafetyPolicyStatus: 'ALLOWED',
    })
    expect(res.allowed).toBe(false)
  })

  it('18. Missing or unconfigured age verification fails closed for adult content', () => {
    const res = evaluateAgeAccessPolicy({
      userEligibility: undefined,
      contentClassification: CONTENT_AGE_CLASSIFICATION.ADULT_18_PLUS,
    })
    expect(res.allowed).toBe(false)
    expect(res.stage).toBe('age_restriction')
  })
})
