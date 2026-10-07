import { describe, it, expect } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://ycftnowviqyapxycirwz.supabase.co'

const anonKey =
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljZnRub3d2aXF5YXB4eWNpcnd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwOTAyNDcsImV4cCI6MjEwNjY2NjI0N30.QOoc9QZh5Mfpq4P_v8dcghEH1TCunh00lKx--Mo-cu0'

describe('Adversarial Live RLS Security Defense (Vitest Security Suite)', () => {
  const anonClient = createClient(supabaseUrl, anonKey)

  it('blocks unauthenticated read on private user interests', async () => {
    const { data, error } = await anonClient.from('user_interests').select('*').limit(5)
    expect(error !== null || !data || data.length === 0).toBe(true)
  })

  it('blocks unauthorized insert into communities by non-curator/anon', async () => {
    const { error } = await anonClient.from('communities').insert({
      slug: 'malicious-spoof',
      name: 'Malicious Collective',
    })
    expect(error).not.toBeNull()
  })

  it('blocks direct modification of another profile wallet_address', async () => {
    const { data, error } = await anonClient
      .from('profiles')
      .update({ wallet_address: '0x000000000000000000000000000000000000dead' })
      .eq('id', '550e8400-e29b-41d4-a716-446655440000')
      .select()

    expect(error !== null || !data || data.length === 0).toBe(true)
  })

  it('blocks unauthenticated creation of confirmed payment (Paid Curation bypass)', async () => {
    const { error } = await anonClient.from('curation_payments').insert({
      curator_user_id: '550e8400-e29b-41d4-a716-446655440033',
      amount: 100,
      curator_amount: 95,
      platform_fee: 5,
      payment_method: 'crypto_monad',
      status: 'confirmed',
    })
    expect(error).not.toBeNull()
  })

  it('blocks unauthorized client modification of curation payouts', async () => {
    const { data, error } = await anonClient
      .from('curation_payments')
      .update({ curator_amount: 999999 })
      .eq('id', '550e8400-e29b-41d4-a716-446655440044')
      .select()

    expect(error !== null || !data || data.length === 0).toBe(true)
  })

  it('blocks direct client tampering of ticket status', async () => {
    const { data, error } = await anonClient
      .from('tickets')
      .update({ status: 'claimed' })
      .eq('id', '550e8400-e29b-41d4-a716-446655440055')
      .select()

    expect(error !== null || !data || data.length === 0).toBe(true)
  })

  it('blocks direct client spoofing of market resolution', async () => {
    const { data, error } = await anonClient
      .from('markets')
      .update({ status: 'resolved' })
      .eq('id', '550e8400-e29b-41d4-a716-446655440066')
      .select()

    expect(error !== null || !data || data.length === 0).toBe(true)
  })

  it('blocks direct client spoofing of position payout', async () => {
    const { data, error } = await anonClient
      .from('positions')
      .update({ payout_amount: 50000, status: 'won' })
      .eq('id', '550e8400-e29b-41d4-a716-446655440077')
      .select()

    expect(error !== null || !data || data.length === 0).toBe(true)
  })

  it('blocks unauthorized tampering with attestation jobs queue', async () => {
    const { data, error } = await anonClient
      .from('attestation_jobs')
      .update({ status: 'confirmed' })
      .eq('id', '550e8400-e29b-41d4-a716-446655440088')
      .select()

    expect(error !== null || !data || data.length === 0).toBe(true)
  })
})
