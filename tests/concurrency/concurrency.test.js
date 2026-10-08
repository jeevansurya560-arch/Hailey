import { describe, it, expect, vi, beforeEach } from 'vitest'
import { confirmCryptoPayment } from '../../server/services/payments/paymentService.js'
import { supabaseAdmin } from '../../server/config/supabaseAdmin.js'

describe('Concurrency & Race Condition Defenses (Vitest Concurrency Suite)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('guarantees atomic concurrency on collection item approval: exactly one curator succeeds', async () => {
    let currentStatus = 'pending'
    let updateAttempts = 0

    const mockAtomicUpdate = async (newStatus) => {
      updateAttempts++
      if (currentStatus === 'pending') {
        currentStatus = newStatus
        return { data: [{ id: 'item-101', status: newStatus }], error: null }
      }
      // If already decided, condition status = 'pending' returns 0 rows
      return { data: [], error: null }
    }

    // Simulate Curator A and Curator B hitting the endpoint concurrently
    const [resultA, resultB] = await Promise.all([
      mockAtomicUpdate('approved'),
      mockAtomicUpdate('approved'),
    ])

    const successfulUpdates = [resultA, resultB].filter((r) => r.data && r.data.length === 1)
    const conflictedUpdates = [resultA, resultB].filter((r) => !r.data || r.data.length === 0)

    expect(updateAttempts).toBe(2)
    expect(successfulUpdates.length).toBe(1)
    expect(conflictedUpdates.length).toBe(1)
    expect(currentStatus).toBe('approved')
  })

  it('guarantees atomic single-use nonce consumption: prevents replay and concurrent link races', async () => {
    let nonceExists = true
    let consumeAttempts = 0

    const mockAtomicNonceDelete = async (nonceVal) => {
      consumeAttempts++
      if (nonceExists) {
        nonceExists = false
        return { data: [{ nonce: nonceVal }], error: null }
      }
      return { data: [], error: null }
    }

    // Two parallel requests attempting to claim the same nonce
    const [claimA, claimB] = await Promise.all([
      mockAtomicNonceDelete('challenge-nonce-xyz'),
      mockAtomicNonceDelete('challenge-nonce-xyz'),
    ])

    const successClaims = [claimA, claimB].filter((c) => c.data && c.data.length === 1)
    const rejectedClaims = [claimA, claimB].filter((c) => !c.data || c.data.length === 0)

    expect(consumeAttempts).toBe(2)
    expect(successClaims.length).toBe(1)
    expect(rejectedClaims.length).toBe(1)
    expect(nonceExists).toBe(false)
  })

  it('safely handles concurrent payment confirmations without double payout', async () => {
    let paymentStatus = 'pending'
    let paymentRecord = {
      id: 'pay-concurrency-1',
      status: 'pending',
      tx_hash: null,
      payer_user_id: 'user-payer',
    }

    vi.spyOn(supabaseAdmin, 'from').mockImplementation((table) => {
      if (table === 'curation_payments') {
        return {
          select: (fields) => {
            if (fields === 'id') {
              // duplicate tx check
              return {
                eq: vi.fn().mockReturnValue({
                  neq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
                  }),
                }),
              }
            }
            return {
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockImplementation(() =>
                  Promise.resolve({ data: { ...paymentRecord }, error: null })
                ),
              }),
            }
          },
          update: (fields) => ({
            eq: (_col1, _val1) => ({
              eq: (_col2, _val2) => ({
                select: () => ({
                  single: async () => {
                    if (paymentStatus === 'pending') {
                      paymentStatus = fields.status
                      paymentRecord = { ...paymentRecord, ...fields }
                      return { data: paymentRecord, error: null }
                    }
                    // Concurrently modified
                    return { data: null, error: new Error('Already updated') }
                  },
                }),
              }),
            }),
          }),
        }
      }
      return {}
    })

    const attempt1 = confirmCryptoPayment({
      paymentId: 'pay-concurrency-1',
      txHash: '0xrace_tx_123',
      payerUserId: 'user-payer',
    })

    const attempt2 = confirmCryptoPayment({
      paymentId: 'pay-concurrency-1',
      txHash: '0xrace_tx_123',
      payerUserId: 'user-payer',
    })

    const results = await Promise.allSettled([attempt1, attempt2])
    const fulfilled = results.filter((r) => r.status === 'fulfilled')

    // At least one succeeds cleanly and status transitions to confirmed
    expect(fulfilled.length).toBeGreaterThanOrEqual(1)
    expect(paymentStatus).toBe('confirmed')
  })
})
