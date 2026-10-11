import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createPaymentIntent,
  confirmCryptoPayment,
  getCuratorEarnings,
} from '../../backend/server/services/payments/paymentService.js'
import { supabaseAdmin } from '../../backend/server/config/supabaseAdmin.js'

describe('Paid Curation Economic Service (Unit Tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calculates authoritative platform fee and curator payout (5% fee, 95% curator)', async () => {
    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'pay-123',
            amount: 100,
            platform_fee: 5,
            curator_amount: 95,
            status: 'pending',
          },
          error: null,
        }),
      }),
    })

    vi.spyOn(supabaseAdmin, 'from').mockReturnValue({ insert: mockInsert })

    const payment = await createPaymentIntent({
      payerUserId: 'user-a',
      curatorUserId: 'curator-b',
      amount: 100,
      currency: 'USDC',
    })

    expect(payment.amount).toBe(100)
    expect(payment.platform_fee).toBe(5)
    expect(payment.curator_amount).toBe(95)
    expect(payment.curator_amount + payment.platform_fee).toBe(payment.amount)
  })

  it('prevents curator from paying or self-supporting their own curation', async () => {
    await expect(
      createPaymentIntent({
        payerUserId: 'curator-same',
        curatorUserId: 'curator-same',
        amount: 50,
      })
    ).rejects.toThrow(/Curator cannot pay or self-support/i)
  })

  it('rejects invalid, zero, or negative amounts', async () => {
    await expect(
      createPaymentIntent({
        payerUserId: 'user-a',
        curatorUserId: 'curator-b',
        amount: 0,
      })
    ).rejects.toThrow(/Amount must be greater than zero/i)

    await expect(
      createPaymentIntent({
        payerUserId: 'user-a',
        curatorUserId: 'curator-b',
        amount: -25,
      })
    ).rejects.toThrow(/Amount must be greater than zero/i)
  })

  it('prevents duplicate transaction hash reuse across payments (replay attack prevention)', async () => {
    // 1. Mock finding existing payment intent
    const mockSelectPayment = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { id: 'pay-2', status: 'pending', payer_user_id: 'user-a' },
          error: null,
        }),
      }),
    })

    // 2. Mock duplicate tx check finding another payment with this hash
    const mockSelectTx = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        neq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: 'other-payment-already-used-this-tx' },
            error: null,
          }),
        }),
      }),
    })

    vi.spyOn(supabaseAdmin, 'from').mockImplementation((table) => {
      if (table === 'curation_payments') {
        return {
          select: (fields) => {
            if (fields === 'id') return mockSelectTx()
            return mockSelectPayment()
          },
        }
      }
      return {}
    })

    await expect(
      confirmCryptoPayment({
        paymentId: 'pay-2',
        txHash: '0xduplicate_hash_already_paid',
        payerUserId: 'user-a',
      })
    ).rejects.toThrow(/Transaction hash has already been used/i)
  })

  it('returns idempotent confirmation when identical transaction hash is re-submitted', async () => {
    const existingConfirmed = {
      id: 'pay-3',
      status: 'confirmed',
      tx_hash: '0xexisting_hash',
      payer_user_id: 'user-a',
    }

    vi.spyOn(supabaseAdmin, 'from').mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: existingConfirmed,
            error: null,
          }),
        }),
      }),
    })

    const res = await confirmCryptoPayment({
      paymentId: 'pay-3',
      txHash: '0xexisting_hash',
      payerUserId: 'user-a',
    })

    expect(res.ok).toBe(true)
    expect(res.idempotent).toBe(true)
    expect(res.payment.status).toBe('confirmed')
  })

  it('aggregates confirmed curator earnings correctly', async () => {
    const payments = [
      { id: '1', amount: 10, curator_amount: 9.5, currency: 'USDC' },
      { id: '2', amount: 20, curator_amount: 19.0, currency: 'USDC' },
    ]

    vi.spyOn(supabaseAdmin, 'from').mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: payments,
              error: null,
            }),
          }),
        }),
      }),
    })

    const earnings = await getCuratorEarnings('curator-b')
    expect(earnings.totalEarned).toBe(28.5)
    expect(earnings.totalVolume).toBe(30)
    expect(earnings.supportCount).toBe(2)
  })
})
