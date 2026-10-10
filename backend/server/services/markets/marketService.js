import { supabaseAdmin } from '../../config/supabaseAdmin.js'

const ALLOWED_CATEGORIES = [
  'cultural_preservation',
  'exhibition',
  'archive_milestone',
  'community_growth',
  'trend_forecast',
]

/**
 * Creates a cultural outcome market with objective measurable options.
 */
export async function createMarket({
  creatorId,
  title,
  description,
  category,
  resolutionSource,
  resolutionDeadline,
  options,
}) {
  if (!creatorId || !title || !description || !resolutionSource || !resolutionDeadline) {
    throw new Error('All required fields must be supplied to create a market.')
  }

  if (!ALLOWED_CATEGORIES.includes(category)) {
    throw new Error(`Invalid category. Allowed: ${ALLOWED_CATEGORIES.join(', ')}`)
  }

  const deadlineDate = new Date(resolutionDeadline)
  if (isNaN(deadlineDate.getTime()) || deadlineDate.getTime() <= Date.now()) {
    throw new Error('Resolution deadline must be a valid future timestamp.')
  }

  if (!Array.isArray(options) || options.length < 2) {
    throw new Error('A cultural market requires at least two distinct outcome options.')
  }

  // 1. Insert market
  const { data: market, error: mErr } = await supabaseAdmin
  .from('markets')
  .insert({
    creator_id: creatorId,
    title,
    description,
    category,
    resolution_source: resolutionSource,
    resolution_deadline: deadlineDate.toISOString(),
    status: 'open',
  })
  .select('*')
  .single()

  if (mErr) {
    throw new Error('Failed to create market: ' + mErr.message)
  }

  // 2. Insert market options
  const optionRows = options.map((label) => ({
    market_id: market.id,
    label: String(label).trim(),
    total_stake: 0,
  }))

  const { data: createdOptions, error: optErr } = await supabaseAdmin
  .from('market_options')
  .insert(optionRows)
  .select('*')

  if (optErr) {
    // Cleanup if options insert failed
    await supabaseAdmin.from('markets').delete().eq('id', market.id)
    throw new Error('Failed to create market options: ' + optErr.message)
  }

  return {
    ...market,
    options: createdOptions,
  }
}

/**
 * Lists cultural outcome markets with their options.
 */
export async function listMarkets({ status = null, category = null } = {}) {
  let query = supabaseAdmin
  .from('markets')
  .select(`
    *,
    market_options ( id, label, total_stake ),
    market_resolutions ( winning_option_id, evidence_url, source_description, resolved_at )
  `)
  .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query
  if (error) {
    throw new Error('Failed to list markets: ' + error.message)
  }

  return data || []
}

/**
 * Retrieves market details by ID.
 */
export async function getMarket(marketId) {
  const { data: market, error } = await supabaseAdmin
  .from('markets')
  .select(`
    *,
    market_options ( id, label, total_stake ),
    market_resolutions ( winning_option_id, evidence_url, source_description, resolved_at )
  `)
  .eq('id', marketId)
  .single()

  if (error || !market) {
    throw new Error('Market not found.')
  }

  return market
}

/**
 * Participates / takes a position in an open market.
 */
export async function takePosition({ marketId, optionId, userId, amount }) {
  const numAmount = parseFloat(amount)
  if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
    throw new Error('Position amount must be greater than zero.')
  }

  // 1. Fetch market and verify state
  const market = await getMarket(marketId)
  if (market.status !== 'open') {
    throw new Error(`Cannot participate: market is ${market.status}.`)
  }

  if (new Date(market.resolution_deadline).getTime() <= Date.now()) {
    throw new Error('Participation closed: resolution deadline has passed.')
  }

  // 2. Verify option belongs to market
  const targetOption = (market.market_options || []).find((opt) => opt.id === optionId)
  if (!targetOption) {
    throw new Error('Selected option does not belong to this market.')
  }

  // 3. Record position
  const { data: position, error: posErr } = await supabaseAdmin
  .from('positions')
  .insert({
    market_id: marketId,
    option_id: optionId,
    user_id: userId,
    amount: numAmount,
    status: 'active',
    payout_amount: 0,
  })
  .select('*')
  .single()

  if (posErr) {
    throw new Error('Failed to record position: ' + posErr.message)
  }

  // 4. Update option stake
  const updatedStake = parseFloat((parseFloat(targetOption.total_stake || 0) + numAmount).toFixed(4))
  await supabaseAdmin
  .from('market_options')
  .update({ total_stake: updatedStake })
  .eq('id', optionId)

  return position
}

/**
 * Resolves a market objectively with evidence, calculating settlements.
 */
export async function resolveMarket({
  marketId,
  winningOptionId,
  evidenceUrl,
  sourceDescription,
  resolvedByUserId,
}) {
  if (!marketId || !winningOptionId || !evidenceUrl || !sourceDescription) {
    throw new Error('marketId, winningOptionId, evidenceUrl, and sourceDescription are required.')
  }

  const market = await getMarket(marketId)
  if (market.status === 'resolved' || market.status === 'cancelled') {
    throw new Error(`Market cannot be resolved from state: ${market.status}`)
  }

  // Authorization check (defense-in-depth)
  if (resolvedByUserId && market.creator_id && market.creator_id !== resolvedByUserId) {
    const profileQuery = supabaseAdmin.from('profiles')
    if (profileQuery && typeof profileQuery.select === 'function') {
      const { data: profile } = await profileQuery
        .select('is_editorial')
        .eq('id', resolvedByUserId)
        .single()

      if (!profile?.is_editorial) {
        throw new Error('Unauthorized: only market creator or editorial administrator can resolve this market.')
      }
    }
  }

  const winningOption = (market.market_options || []).find((opt) => opt.id === winningOptionId)
  if (!winningOption) {
    throw new Error('Winning option does not belong to this market.')
  }

  // 1. Atomically insert resolution record
  const resolvedAt = new Date().toISOString()
  const { error: resErr } = await supabaseAdmin
  .from('market_resolutions')
  .insert({
    market_id: marketId,
    winning_option_id: winningOptionId,
    evidence_url: evidenceUrl,
    source_description: sourceDescription,
    resolved_by: resolvedByUserId,
    resolved_at: resolvedAt,
  })

  if (resErr) {
    throw new Error('Failed to record market resolution: ' + resErr.message)
  }

  // 2. Update market status
  const { error: mUpdateErr } = await supabaseAdmin
  .from('markets')
  .update({
    status: 'resolved',
    winning_option_id: winningOptionId,
    resolved_at: resolvedAt,
  })
  .eq('id', marketId)

  if (mUpdateErr) {
    throw new Error('Failed to update market status: ' + mUpdateErr.message)
  }

  // 3. Settle all positions
  const { data: positions } = await supabaseAdmin
  .from('positions')
  .select('*')
  .eq('market_id', marketId)

  const totalPool = (market.market_options || []).reduce(
    (acc, opt) => acc + parseFloat(opt.total_stake || 0),
    0
  )
  const winningPool = parseFloat(winningOption.total_stake || 0)

  let settledCount = 0
  for (const pos of positions || []) {
    if (pos.option_id === winningOptionId) {
      // Winning share proportional to contribution
      const payout =
        winningPool > 0
          ? parseFloat(((pos.amount / winningPool) * totalPool).toFixed(4))
          : pos.amount

      await supabaseAdmin
      .from('positions')
      .update({
        status: 'won',
        payout_amount: payout,
      })
      .eq('id', pos.id)
      settledCount++
    } else {
      await supabaseAdmin
      .from('positions')
      .update({
        status: 'lost',
        payout_amount: 0,
      })
      .eq('id', pos.id)
      settledCount++
    }
  }

  return {
    ok: true,
    marketId,
    winningOptionId,
    totalPool,
    winningPool,
    settledPositions: settledCount,
    resolvedAt,
  }
}
