import { describe, it, expect } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import moderationRoute from '../../backend/server/api/routes/moderation.js'
import ticketsRoute from '../../backend/server/api/routes/tickets.js'
import marketsRoute from '../../backend/server/api/routes/markets.js'
import searchRoute from '../../backend/server/api/routes/search.js'
import { confirmCryptoPayment } from '../../backend/server/services/payments/paymentService.js'

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://ycftnowviqyapxycirwz.supabase.co'

const anonKey =
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljZnRub3d2aXF5YXB4eWNpcnd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwOTAyNDcsImV4cCI6MjEwNjY2NjI0N30.QOoc9QZh5Mfpq4P_v8dcghEH1TCunh00lKx--Mo-cu0'

function createMockRes() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    status(code) {
      this.statusCode = code
      return this
    },
    json(data) {
      this.body = data
      return this
    },
    setHeader(k, v) {
      this.headers[k] = v
      return this
    },
    writeHead(code, headers) {
      this.statusCode = code
      this.headers = headers
      return this
    },
    end(data) {
      if (data) {
        try {
          this.body = JSON.parse(data)
        } catch {
          this.body = data
        }
      }
      return this
    },
  }
}

describe('Adversarial Access Control & Zero-Trust Security Suite', () => {
  const anonClient = createClient(supabaseUrl, anonKey)

  // ── Database Layer RLS & Permissions ──────────────────────────
  describe('Database RLS & Procedure Grant Protections', () => {
    it('blocks anonymous direct RPC execution of handle_new_user', async () => {
      const { error } = await anonClient.rpc('handle_new_user')
      expect(error).not.toBeNull()
    })

    it('blocks anonymous access to wallet_nonces', async () => {
      const { data, error } = await anonClient.from('wallet_nonces').select('*')
      expect(error !== null || !data || data.length === 0).toBe(true)
    })

    it('blocks unauthorized access to audit_logs for non-editorial clients', async () => {
      const { data, error } = await anonClient.from('audit_logs').select('*')
      expect(error !== null || !data || data.length === 0).toBe(true)
    })

    it('blocks unauthorized access to user_age_eligibility for anonymous clients', async () => {
      const { data, error } = await anonClient.from('user_age_eligibility').select('*')
      expect(error !== null || !data || data.length === 0).toBe(true)
    })
  })

  // ── API Route BOLA & Authorization Defenses ───────────────────
  describe('Moderation Route Authorization (SEC-01)', () => {
    it('blocks anonymous GET on moderation queue with 401', async () => {
      const req = {
        method: 'GET',
        headers: {},
      }
      const res = createMockRes()
      await moderationRoute(req, res)
      expect(res.statusCode).toBe(401)
      expect(res.body.error).toBeDefined()
    })

    it('blocks unauthenticated PATCH on moderation queue with 401', async () => {
      const req = {
        method: 'PATCH',
        headers: {},
        body: { reportId: 'rep-123', status: 'DISMISSED' },
      }
      const res = createMockRes()
      await moderationRoute(req, res)
      expect(res.statusCode).toBe(401)
    })
  })

  describe('Ticketing BOLA / IDOR Defenses (SEC-03)', () => {
    it('blocks unauthenticated consume action with 401', async () => {
      const req = {
        method: 'POST',
        headers: {},
        body: { action: 'consume', ticketId: 'tick-999' },
      }
      const res = createMockRes()
      await ticketsRoute(req, res)
      expect(res.statusCode).toBe(401)
    })

    it('blocks unauthenticated revoke action with 401', async () => {
      const req = {
        method: 'POST',
        headers: {},
        body: { action: 'revoke', ticketId: 'tick-999' },
      }
      const res = createMockRes()
      await ticketsRoute(req, res)
      expect(res.statusCode).toBe(401)
    })
  })

  describe('Markets Resolution Authorization Defenses (SEC-02)', () => {
    it('blocks unauthenticated market resolve action with 401', async () => {
      const req = {
        method: 'POST',
        headers: {},
        body: { action: 'resolve', marketId: 'm-123', winningOptionId: 'opt-1' },
      }
      const res = createMockRes()
      await marketsRoute(req, res)
      expect(res.statusCode).toBe(401)
    })
  })

  describe('Crypto Payment Verification Defenses (SEC-09)', () => {
    it('rejects malformed or forged transaction hash format', async () => {
      await expect(
        confirmCryptoPayment({
          paymentId: 'fake-id',
          txHash: 'not-a-valid-hex-hash',
          payerUserId: 'user-1',
        })
      ).rejects.toThrow(/Invalid transaction hash format/)
    })

    it('rejects short transaction hashes', async () => {
      await expect(
        confirmCryptoPayment({
          paymentId: 'fake-id',
          txHash: '0x1234',
          payerUserId: 'user-1',
        })
      ).rejects.toThrow(/Invalid transaction hash format/)
    })
  })

  describe('Search Route PostgREST Injection Defenses (SEC-10)', () => {
    it('sanitizes special characters in search queries to prevent filter injection', async () => {
      const req = {
        method: 'GET',
        headers: { host: 'localhost:5174' },
        url: '/api/search?q=tokyo),name.ilike.%hack%',
      }
      const res = createMockRes()
      await searchRoute(req, res)
      expect(res.statusCode).toBe(200)
      expect(res.body.results).toBeDefined()
    })
  })
})
