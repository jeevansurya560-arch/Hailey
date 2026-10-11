import React, { useState } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { takePosition, resolveMarket } from '../services/marketService'

export function MarketDetailModal({ market, isOpen, onClose, onUpdated }) {
  const [now] = useState(() => Date.now())
  const { session } = useAuth()
  const [selectedOptionId, setSelectedOptionId] = useState('')
  const [amount, setAmount] = useState('10.00')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Resolution admin inputs
  const [showResolve, setShowResolve] = useState(false)
  const [evidenceUrl, setEvidenceUrl] = useState('')
  const [sourceDesc, setSourceDesc] = useState('')

  if (!isOpen || !market) return null

  const isResolved = market.status === 'resolved'
  const isClosed = market.status === 'closed' || new Date(market.resolution_deadline).getTime() <= now
  const totalStake = (market.market_options || []).reduce((acc, opt) => acc + parseFloat(opt.total_stake || 0), 0)

  const handlePosition = async (e) => {
    e.preventDefault()
    if (!session?.access_token) {
      setError('Please sign in to participate in this market.')
      return
    }

    if (!selectedOptionId) {
      setError('Please select an outcome option.')
      return
    }

    const numAmount = parseFloat(amount)
    if (!numAmount || numAmount <= 0) {
      setError('Amount must be greater than zero.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await takePosition({
        authToken: session.access_token,
        marketId: market.id,
        optionId: selectedOptionId,
        amount: numAmount,
      })
      setSuccess(`Successfully backed outcome with ${numAmount} USDC!`)
      onUpdated()
    } catch (err) {
      setError(err.message || 'Failed to place position')
    } finally {
      setLoading(false)
    }
  }

  const handleResolve = async (e) => {
    e.preventDefault()
    if (!session?.access_token) return
    if (!selectedOptionId || !evidenceUrl || !sourceDesc) {
      setError('Winning option, evidence URL, and description are required for resolution.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await resolveMarket({
        authToken: session.access_token,
        marketId: market.id,
        winningOptionId: selectedOptionId,
        evidenceUrl: evidenceUrl.trim(),
        sourceDescription: sourceDesc.trim(),
      })
      setSuccess('Market successfully resolved with audit evidence!')
      onUpdated()
      setShowResolve(false)
    } catch (err) {
      setError(err.message || 'Resolution failed')
    } finally {
      setLoading(false)
    }
  }

  const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=800&auto=format&fit=crop'
  const imageUrl = market.image_url || market.media_url || DEFAULT_IMAGE

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#34252A]/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg p-6 md:p-8 neu-card bg-[#FAF6EF] border border-[#E0D4C5] rounded-3xl shadow-2xl text-[#34252A] max-h-[90vh] overflow-y-auto space-y-4">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#34252A]/50 hover:text-[#34252A] p-1.5 rounded-full hover:bg-[#F0E7DA] transition-colors z-10"
        >
          ✕
        </button>

        {/* Hero Cultural Product Image */}
        <div className="relative w-full h-52 -mt-2 rounded-2xl overflow-hidden bg-[#E0D4C5]/30 border border-[#E0D4C5]">
          <img
            src={imageUrl}
            alt={market.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {market.cultural_origin && (
            <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-[#FAF6EF]/90 backdrop-blur-md text-xs font-mono font-bold text-[#6A1F35]">
              📍 {market.cultural_origin}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 bg-[#F0E7DA] text-[#6A1F35] border border-[#E0D4C5] rounded-full font-semibold">
              {market.category?.replace('_', ' ')}
            </span>
            {market.price_estimate && (
              <span className="text-xs font-mono font-bold text-[#B08A50]">
                Est. Value: {market.price_estimate}
              </span>
            )}
            {market.craft_tradition && (
              <span className="text-xs font-mono text-[#34252A]/70">
                · {market.craft_tradition}
              </span>
            )}
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#34252A]">{market.title}</h2>
          {market.artisan && (
            <p className="text-xs font-mono text-[#6A1F35] font-semibold mt-1">
              Artisan / Guild: {market.artisan}
            </p>
          )}
          <p className="text-xs text-[#34252A]/80 mt-1.5 leading-relaxed">{market.description}</p>
        </div>

        <div className="p-3.5 neu-card bg-[#F0E7DA]/50 rounded-2xl border border-[#E0D4C5] text-xs space-y-1.5 font-mono">
          <div className="flex justify-between text-[#34252A]/70">
            <span>Resolution Source:</span>
            <span className="text-[#34252A] font-semibold">{market.resolution_source}</span>
          </div>
          <div className="flex justify-between text-[#34252A]/70">
            <span>Deadline:</span>
            <span className="text-[#34252A]">
              {new Date(market.resolution_deadline).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-[#34252A]/70">
            <span>Total Market Stake:</span>
            <span className="text-[#6A1F35] font-bold">${totalStake.toFixed(2)} USDC</span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs neu-card">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs neu-card">
            {success}
          </div>
        )}

        {/* Resolution Evidence Box if resolved */}
        {isResolved && market.market_resolutions && (
          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2 text-xs neu-card">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 block">
              🏆 Verified Cultural Outcome
            </span>
            <p className="text-[#34252A] font-medium">{market.market_resolutions.source_description}</p>
            <a
              href={market.market_resolutions.evidence_url}
              target="_blank"
              rel="noreferrer"
              className="text-[#6A1F35] hover:underline block truncate text-[11px] font-mono"
            >
              🔗 View Verifiable Evidence: {market.market_resolutions.evidence_url}
            </a>
          </div>
        )}

        {/* Options */}
        <div className="space-y-2">
          <label className="block text-xs font-mono font-semibold text-[#34252A]/80">Outcomes & Current Stakes</label>
          <div className="space-y-2">
            {(market.market_options || []).map((opt) => {
              const stake = parseFloat(opt.total_stake || 0)
              const pct = totalStake > 0 ? ((stake / totalStake) * 100).toFixed(0) : 0
              const isWinner = market.winning_option_id === opt.id
              const isSelected = selectedOptionId === opt.id

              return (
                <div
                  key={opt.id}
                  onClick={() => !isResolved && !isClosed && setSelectedOptionId(opt.id)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    isWinner
                      ? 'border-emerald-300 bg-emerald-50/80 neu-card'
                      : isSelected
                      ? 'border-[#6A1F35] bg-[#6A1F35]/10 neu-inset'
                      : 'border-[#E0D4C5] bg-[#FAF6EF] neu-card hover:border-[#6A1F35]/40'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-semibold text-[#34252A]">
                      {opt.label} {isWinner && '🏆 (Winner)'}
                    </span>
                    <span className="font-mono text-[#34252A]/70">{stake} USDC ({pct}%)</span>
                  </div>
                  <div className="w-full bg-[#E0D4C5]/60 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isWinner ? 'bg-emerald-600' : 'bg-[#6A1F35]'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Participation Form (only if open) */}
        {!isResolved && !isClosed && (
          <form onSubmit={handlePosition} className="space-y-3 pt-3 border-t border-[#E0D4C5]">
            <div className="space-y-1">
              <label className="block text-xs font-mono font-medium text-[#34252A]/80">Stake Amount (USDC)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2 neu-inset-input bg-[#FAF6EF] border border-[#E0D4C5] rounded-xl text-[#34252A] font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#6A1F35]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !selectedOptionId}
              className="w-full py-3 px-4 bg-[#6A1F35] text-[#FAF6EF] hover:bg-[#511528] active:bg-[#3D0F1D] font-bold rounded-full text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Submitting Stake...' : `Back Selected Outcome ($${amount} USDC)`}
            </button>
          </form>
        )}

        {/* Admin/Oracle Resolve Section */}
        {!isResolved && session && (
          <div className="pt-2 border-t border-[#E0D4C5]">
            <button
              type="button"
              onClick={() => setShowResolve(!showResolve)}
              className="text-[11px] font-mono text-[#34252A]/60 hover:text-[#6A1F35] transition-colors"
            >
              {showResolve ? '▾ Hide Oracle Resolution' : '▸ Resolve Market with Objective Evidence'}
            </button>

            {showResolve && (
              <form onSubmit={handleResolve} className="mt-3 space-y-3 p-3.5 neu-card bg-[#F0E7DA]/50 rounded-2xl border border-[#E0D4C5]">
                <p className="text-[11px] text-[#34252A]/70">Select the winning option above, then provide verifiable evidence:</p>
                <input
                  type="url"
                  placeholder="Evidence URL (e.g. news article, contract tx, photo archive)"
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  className="w-full px-3 py-2 neu-inset-input bg-[#FAF6EF] border border-[#E0D4C5] rounded-xl text-[#34252A] placeholder:text-[#34252A]/40 text-xs focus:outline-none focus:ring-1 focus:ring-[#6A1F35]"
                  required
                />
                <textarea
                  rows="2"
                  placeholder="Detailed source description and justification"
                  value={sourceDesc}
                  onChange={(e) => setSourceDesc(e.target.value)}
                  className="w-full px-3 py-2 neu-inset-input bg-[#FAF6EF] border border-[#E0D4C5] rounded-xl text-[#34252A] placeholder:text-[#34252A]/40 text-xs focus:outline-none focus:ring-1 focus:ring-[#6A1F35]"
                  required
                />
                <button
                  type="submit"
                  disabled={loading || !selectedOptionId}
                  className="w-full py-2.5 neu-pill bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider rounded-full transition disabled:opacity-50"
                >
                  {loading ? 'Resolving...' : 'Confirm Objective Resolution'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
