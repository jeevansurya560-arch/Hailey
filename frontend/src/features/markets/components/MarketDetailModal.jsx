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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl text-zinc-100 max-h-[90vh] overflow-y-auto space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
        >
          ✕
        </button>

        <div>
          <span className="text-xs font-mono uppercase px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
            {market.category?.replace('_', ' ')}
          </span>
          <h2 className="text-xl font-bold text-white mt-2">{market.title}</h2>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{market.description}</p>
        </div>

        <div className="p-3 bg-zinc-850 bg-zinc-800/40 rounded-xl border border-zinc-800 text-xs space-y-1">
          <div className="flex justify-between text-zinc-400">
            <span>Resolution Source:</span>
            <span className="text-zinc-200 font-medium">{market.resolution_source}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Deadline:</span>
            <span className="text-zinc-200 font-mono">
              {new Date(market.resolution_deadline).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Total Market Stake:</span>
            <span className="text-emerald-400 font-mono font-bold">${totalStake.toFixed(2)} USDC</span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-lg text-xs">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-lg text-xs">
            {success}
          </div>
        )}

        {/* Resolution Evidence Box if resolved */}
        {isResolved && market.market_resolutions && (
          <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-2 text-xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">
              🏆 Verified Cultural Outcome
            </span>
            <p className="text-white font-medium">{market.market_resolutions.source_description}</p>
            <a
              href={market.market_resolutions.evidence_url}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:underline block truncate text-[11px]"
            >
              🔗 View Verifiable Evidence: {market.market_resolutions.evidence_url}
            </a>
          </div>
        )}

        {/* Options */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-zinc-300">Outcomes & Current Stakes</label>
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
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                    isWinner
                      ? 'border-emerald-500/50 bg-emerald-500/10'
                      : isSelected
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-zinc-800 bg-zinc-800/40 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-white">
                      {opt.label} {isWinner && '🏆 (Winner)'}
                    </span>
                    <span className="font-mono text-zinc-300">{stake} USDC ({pct}%)</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${isWinner ? 'bg-emerald-400' : 'bg-blue-500'}`}
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
          <form onSubmit={handlePosition} className="space-y-3 pt-2 border-t border-zinc-800">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Stake Amount (USDC)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-blue-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !selectedOptionId}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 text-xs transition disabled:opacity-50"
            >
              {loading ? 'Submitting Stake...' : `Back Selected Outcome ($${amount} USDC)`}
            </button>
          </form>
        )}

        {/* Admin/Oracle Resolve Section */}
        {!isResolved && session && (
          <div className="pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setShowResolve(!showResolve)}
              className="text-[11px] text-zinc-500 hover:text-zinc-300 transition"
            >
              {showResolve ? '▾ Hide Oracle Resolution' : '▸ Resolve Market with Objective Evidence'}
            </button>

            {showResolve && (
              <form onSubmit={handleResolve} className="mt-3 space-y-3 p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <p className="text-[11px] text-zinc-400">Select the winning option above, then provide verifiable evidence:</p>
                <input
                  type="url"
                  placeholder="Evidence URL (e.g. news article, contract tx, photo archive)"
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-xs"
                  required
                />
                <textarea
                  rows="2"
                  placeholder="Detailed source description and justification"
                  value={sourceDesc}
                  onChange={(e) => setSourceDesc(e.target.value)}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-xs"
                  required
                />
                <button
                  type="submit"
                  disabled={loading || !selectedOptionId}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition disabled:opacity-50"
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
