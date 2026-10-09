import crypto from 'node:crypto'
import { supabaseAdmin } from '../../config/supabaseAdmin.js'

const PLATFORM_FEE_RATE = 0.05 // 5% platform fee

/**
 * Creates an authoritative payment intent for curation support.
 */
export async function createPaymentIntent({
  payerUserId,
  curatorUserId,
  collectionId = null,
  postId = null,
  amount,
  currency = 'USDC',
  paymentMethod = 'crypto_monad',
}) {
  const numAmount = parseFloat(amount)
  if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
    throw new Error('Invalid payment amount. Amount must be greater than zero.')
  }

  if (!curatorUserId) {
    throw new Error('curatorUserId is required.')
  }

  if (payerUserId && payerUserId === curatorUserId) {
    throw new Error('Curator cannot pay or self-support their own curation.')
  }

  // Calculate authoritative split
  const platformFee = parseFloat((numAmount * PLATFORM_FEE_RATE).toFixed(4))
  const curatorAmount = parseFloat((numAmount - platformFee).toFixed(4))
  const providerReference = `intent_${crypto.randomUUID()}`

  const { data: payment, error } = await supabaseAdmin
    .from('curation_payments')
    .insert({
      payer_user_id: payerUserId,
      curator_user_id: curatorUserId,
      collection_id: collectionId,
      post_id: postId,
      amount: numAmount,
      currency,
      payment_method: paymentMethod,
      status: 'pending',
      provider_reference: providerReference,
      platform_fee: platformFee,
      curator_amount: curatorAmount,
    })
    .select('*')
    .single()

  if (error) {
    throw new Error('Failed to create payment intent: ' + error.message)
  }

  return payment
}

/**
 * Confirms a cryptographic/onchain payment with strict idempotency and replay protection.
 */
export async function confirmCryptoPayment({ paymentId, txHash, payerUserId }) {
  if (!paymentId || !txHash) {
    throw new Error('paymentId and txHash are required.')
  }

  // 1. Fetch payment
  const { data: payment, error: fetchErr } = await supabaseAdmin
    .from('curation_payments')
    .select('*')
    .eq('id', paymentId)
    .single()

  if (fetchErr || !payment) {
    throw new Error('Payment intent not found.')
  }

  // Verification: payer check if authenticated
  if (payerUserId && payment.payer_user_id && payment.payer_user_id !== payerUserId) {
    throw new Error('Unauthorized. You are not the payer of this payment intent.')
  }

  // Idempotency: if already confirmed with this txHash, return success immediately
  if (payment.status === 'confirmed' && payment.tx_hash === txHash) {
    return {
      ok: true,
      idempotent: true,
      payment,
    }
  }

  if (payment.status !== 'pending') {
    throw new Error(`Cannot confirm payment with current status: ${payment.status}`)
  }

  // 2. Prevent duplicate txHash reuse across other payments
  const { data: existingTx } = await supabaseAdmin
    .from('curation_payments')
    .select('id')
    .eq('tx_hash', txHash)
    .neq('id', paymentId)
    .maybeSingle()

  if (existingTx) {
    throw new Error('Transaction hash has already been used for another payout (replay attack rejected).')
  }

  // 3. Atomically update status from pending to confirmed
  const completedAt = new Date().toISOString()
  const { data: updated, error: updateErr } = await supabaseAdmin
    .from('curation_payments')
    .update({
      status: 'confirmed',
      tx_hash: txHash,
      completed_at: completedAt,
    })
    .eq('id', paymentId)
    .eq('status', 'pending')
    .select('*')
    .single()

  if (updateErr || !updated) {
    throw new Error('Payment was already completed or concurrently modified.')
  }

  return {
    ok: true,
    idempotent: false,
    payment: updated,
  }
}

/**
 * Retrieves aggregate curator earnings and payment breakdown.
 */
export async function getCuratorEarnings(curatorUserId) {
  if (!curatorUserId) {
    throw new Error('curatorUserId is required.')
  }

  const { data: payments, error } = await supabaseAdmin
    .from('curation_payments')
    .select('*')
    .eq('curator_user_id', curatorUserId)
    .eq('status', 'confirmed')
    .order('completed_at', { ascending: false })

  if (error) {
    throw new Error('Failed to fetch curator earnings: ' + error.message)
  }

  const totalEarned = (payments || []).reduce((acc, p) => acc + parseFloat(p.curator_amount || 0), 0)
  const totalVolume = (payments || []).reduce((acc, p) => acc + parseFloat(p.amount || 0), 0)

  return {
    curatorUserId,
    totalEarned: parseFloat(totalEarned.toFixed(4)),
    totalVolume: parseFloat(totalVolume.toFixed(4)),
    supportCount: payments?.length || 0,
    recentPayments: payments || [],
  }
}

/**
 * Retrieves payment history for a payer.
 */
export async function getPayerHistory(payerUserId) {
  if (!payerUserId) {
    throw new Error('payerUserId is required.')
  }

  const { data: payments, error } = await supabaseAdmin
    .from('curation_payments')
    .select(`
      *,
      collections ( title, slug )
    `)
    .eq('payer_user_id', payerUserId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Failed to fetch payer payment history: ' + error.message)
  }

  return payments || []
}
