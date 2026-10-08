import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  normalizeAddress,
  issueTicket,
  verifyTicketAccess,
  consumeTicket,
  revokeTicket,
} from '../../server/services/tickets/ticketService.js'
import { supabaseAdmin } from '../../server/config/supabaseAdmin.js'

describe('Wallet-Native Ticketing Service (Unit Tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('normalizes valid Ethereum addresses to lowercase and rejects invalid ones', () => {
    const valid = '0x1234567890123456789012345678901234567890'
    expect(normalizeAddress(valid.toUpperCase())).toBe(valid.toLowerCase())
    expect(() => normalizeAddress('not-an-address')).toThrow(/Invalid Ethereum address format/i)
    expect(() => normalizeAddress('')).toThrow(/Invalid Ethereum address format/i)
  })

  it('issues ticket with valid parameters and defaults', async () => {
    const mockTicket = {
      id: 'ticket-1',
      event_id: 'event-101',
      event_title: 'Tokyo Arts Summit',
      owner_wallet_address: '0x1234567890123456789012345678901234567890',
      ticket_type: 'general',
      status: 'issued',
    }

    vi.spyOn(supabaseAdmin, 'from').mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockTicket,
            error: null,
          }),
        }),
      }),
    })

    const ticket = await issueTicket({
      eventId: 'event-101',
      eventTitle: 'Tokyo Arts Summit',
      ownerWalletAddress: '0x1234567890123456789012345678901234567890',
    })

    expect(ticket.id).toBe('ticket-1')
    expect(ticket.status).toBe('issued')
    expect(ticket.owner_wallet_address).toBe('0x1234567890123456789012345678901234567890')
  })

  it('verifies active access entitlement when wallet holds valid ticket', async () => {
    const activeTicket = {
      id: 'ticket-ok',
      event_id: 'event-101',
      event_title: 'Tokyo Arts Summit',
      owner_wallet_address: '0x1234567890123456789012345678901234567890',
      status: 'issued',
      expires_at: null,
    }

    vi.spyOn(supabaseAdmin, 'from').mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [activeTicket],
              error: null,
            }),
          }),
        }),
      }),
    })

    const res = await verifyTicketAccess({
      eventId: 'event-101',
      walletAddress: '0x1234567890123456789012345678901234567890',
    })

    expect(res.granted).toBe(true)
    expect(res.ticket.id).toBe('ticket-ok')
  })

  it('denies access when ticket has been revoked', async () => {
    const revokedTicket = {
      id: 'ticket-revoked',
      event_id: 'event-101',
      status: 'revoked',
    }

    vi.spyOn(supabaseAdmin, 'from').mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [revokedTicket],
              error: null,
            }),
          }),
        }),
      }),
    })

    const res = await verifyTicketAccess({
      eventId: 'event-101',
      walletAddress: '0x1234567890123456789012345678901234567890',
    })

    expect(res.granted).toBe(false)
    expect(res.reason).toMatch(/revoked/i)
  })

  it('denies access when ticket is expired', async () => {
    const expiredTicket = {
      id: 'ticket-expired',
      event_id: 'event-101',
      status: 'issued',
      expires_at: new Date(Date.now() - 10000).toISOString(),
    }

    vi.spyOn(supabaseAdmin, 'from').mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [expiredTicket],
              error: null,
            }),
          }),
        }),
      }),
    })

    const res = await verifyTicketAccess({
      eventId: 'event-101',
      walletAddress: '0x1234567890123456789012345678901234567890',
    })

    expect(res.granted).toBe(false)
    expect(res.reason).toMatch(/expired or already used/i)
  })

  it('consumes ticket once and prevents reuse', async () => {
    vi.spyOn(supabaseAdmin, 'from').mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'ticket-1', status: 'used' },
                error: null,
              }),
            }),
          }),
        }),
      }),
    })

    const consumed = await consumeTicket('ticket-1')
    expect(consumed.status).toBe('used')
  })

  it('revokes ticket cleanly', async () => {
    vi.spyOn(supabaseAdmin, 'from').mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'ticket-1', status: 'revoked' },
              error: null,
            }),
          }),
        }),
      }),
    })

    const revoked = await revokeTicket('ticket-1')
    expect(revoked.status).toBe('revoked')
  })
})
