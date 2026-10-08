import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createMarket,
  takePosition,
  resolveMarket,
} from '../../server/services/markets/marketService.js'
import { supabaseAdmin } from '../../server/config/supabaseAdmin.js'

describe('Cultural Outcome Markets (Unit Tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects market creation with invalid category', async () => {
    await expect(
      createMarket({
        creatorId: 'user-1',
        title: 'Invalid Market',
        description: 'Test',
        category: 'crypto_financial_trading',
        resolutionSource: 'https://source.com',
        resolutionDeadline: new Date(Date.now() + 86400000).toISOString(),
        options: ['Yes', 'No'],
      })
    ).rejects.toThrow(/Invalid category/i)
  })

  it('rejects market creation with past deadline', async () => {
    await expect(
      createMarket({
        creatorId: 'user-1',
        title: 'Past Market',
        description: 'Test',
        category: 'cultural_preservation',
        resolutionSource: 'https://source.com',
        resolutionDeadline: new Date(Date.now() - 10000).toISOString(),
        options: ['Yes', 'No'],
      })
    ).rejects.toThrow(/Resolution deadline must be a valid future timestamp/i)
  })

  it('rejects market creation with fewer than two options', async () => {
    await expect(
      createMarket({
        creatorId: 'user-1',
        title: 'Single Option Market',
        description: 'Test',
        category: 'cultural_preservation',
        resolutionSource: 'https://source.com',
        resolutionDeadline: new Date(Date.now() + 86400000).toISOString(),
        options: ['Only Option'],
      })
    ).rejects.toThrow(/requires at least two distinct outcome options/i)
  })

  it('rejects taking a position on a closed or resolved market', async () => {
    const closedMarket = {
      id: 'market-closed',
      status: 'closed',
      resolution_deadline: new Date(Date.now() + 86400000).toISOString(),
      market_options: [{ id: 'opt-1', label: 'Yes', total_stake: 0 }],
    }

    vi.spyOn(supabaseAdmin, 'from').mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: closedMarket,
            error: null,
          }),
        }),
      }),
    })

    await expect(
      takePosition({
        marketId: 'market-closed',
        optionId: 'opt-1',
        userId: 'user-1',
        amount: 25,
      })
    ).rejects.toThrow(/Cannot participate: market is closed/i)
  })

  it('rejects taking a position if resolution deadline has passed', async () => {
    const expiredMarket = {
      id: 'market-past',
      status: 'open',
      resolution_deadline: new Date(Date.now() - 5000).toISOString(),
      market_options: [{ id: 'opt-1', label: 'Yes', total_stake: 0 }],
    }

    vi.spyOn(supabaseAdmin, 'from').mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: expiredMarket,
            error: null,
          }),
        }),
      }),
    })

    await expect(
      takePosition({
        marketId: 'market-past',
        optionId: 'opt-1',
        userId: 'user-1',
        amount: 25,
      })
    ).rejects.toThrow(/Participation closed: resolution deadline has passed/i)
  })

  it('rejects resolving an already resolved market', async () => {
    const resolvedMarket = {
      id: 'market-done',
      status: 'resolved',
      market_options: [{ id: 'opt-1', label: 'Yes' }],
    }

    vi.spyOn(supabaseAdmin, 'from').mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: resolvedMarket,
            error: null,
          }),
        }),
      }),
    })

    await expect(
      resolveMarket({
        marketId: 'market-done',
        winningOptionId: 'opt-1',
        evidenceUrl: 'https://news.org/evidence',
        sourceDescription: 'Official outcome reported',
        resolvedByUserId: 'admin-1',
      })
    ).rejects.toThrow(/Market cannot be resolved from state: resolved/i)
  })

  it('settles winning positions with exact proportional payout and total fund conservation', async () => {
    const market = {
      id: 'market-active',
      status: 'open',
      resolution_deadline: new Date(Date.now() + 86400000).toISOString(),
      market_options: [
        { id: 'opt-win', label: 'Crossed 10k', total_stake: 100 },
        { id: 'opt-lose', label: 'Did Not Cross', total_stake: 100 },
      ],
    }

    const positions = [
      { id: 'pos-1', option_id: 'opt-win', amount: 40, status: 'active' },
      { id: 'pos-2', option_id: 'opt-win', amount: 60, status: 'active' },
      { id: 'pos-3', option_id: 'opt-lose', amount: 100, status: 'active' },
    ]

    const updatedPositions = []

    vi.spyOn(supabaseAdmin, 'from').mockImplementation((table) => {
      if (table === 'markets') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: market, error: null }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }
      }
      if (table === 'market_resolutions') {
        return {
          insert: vi.fn().mockResolvedValue({ error: null }),
        }
      }
      if (table === 'positions') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: positions, error: null }),
          }),
          update: (fields) => ({
            eq: (idCol, posId) => {
              updatedPositions.push({ id: posId, ...fields })
              return Promise.resolve({ error: null })
            },
          }),
        }
      }
      return {}
    })

    const res = await resolveMarket({
      marketId: 'market-active',
      winningOptionId: 'opt-win',
      evidenceUrl: 'https://monadvision.com/event/10k',
      sourceDescription: 'Verified 10,000 attestations reached on Monad explorer',
      resolvedByUserId: 'curator-admin',
    })

    expect(res.ok).toBe(true)
    expect(res.totalPool).toBe(200)
    expect(res.winningPool).toBe(100)

    const pos1 = updatedPositions.find((p) => p.id === 'pos-1')
    const pos2 = updatedPositions.find((p) => p.id === 'pos-2')
    const pos3 = updatedPositions.find((p) => p.id === 'pos-3')

    expect(pos1.status).toBe('won')
    expect(pos1.payout_amount).toBe(80) // 40% of 200

    expect(pos2.status).toBe('won')
    expect(pos2.payout_amount).toBe(120) // 60% of 200

    expect(pos3.status).toBe('lost')
    expect(pos3.payout_amount).toBe(0)

    // Conservation of funds: winning payouts equal total market pool
    expect(pos1.payout_amount + pos2.payout_amount).toBe(res.totalPool)
  })
})
