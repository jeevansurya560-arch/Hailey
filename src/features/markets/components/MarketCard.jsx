import React, { useState } from 'react'

export function MarketCard({ market, onSelect }) {
  const [now] = useState(() => Date.now())
  if (!market) return null

  const isResolved = market.status === 'resolved'
  const isClosed = market.status === 'closed' || new Date(market.resolution_deadline).getTime() <= now
  const totalStake = (market.market_options || []).reduce((acc, opt) => acc + parseFloat(opt.total_stake || 0), 0)

  return (
    <div
      onClick={() => onSelect(market)}
      className="p-5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl shadow-xl space-y-4 cursor-pointer transition transform hover:-translate-y-0.5 text-zinc-100"
    >
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
          {market.category?.replace('_', ' ')}
        </span>
        <span
          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
            isResolved
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : isClosed
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
          }`}
        >
          {market.status}
        </span>
      </div>

      <div>
        <h3 className="text-base font-bold text-white line-clamp-2">{market.title}</h3>
        <p className="text-xs text-zinc-400 line-clamp-2 mt-1.5">{market.description}</p>
      </div>

      {/* Options preview */}
      <div className="space-y-1.5 pt-2 border-t border-zinc-800">
        {(market.market_options || []).slice(0, 3).map((opt) => {
          const stake = parseFloat(opt.total_stake || 0)
          const pct = totalStake > 0 ? ((stake / totalStake) * 100).toFixed(0) : 0
          const isWinner = market.winning_option_id === opt.id

          return (
            <div key={opt.id} className="text-xs">
              <div className="flex justify-between text-zinc-400 mb-1">
                <span className={isWinner ? 'text-emerald-400 font-bold' : ''}>
                  {opt.label} {isWinner && '🏆'}
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

      <div className="flex justify-between items-center text-[11px] text-zinc-500 pt-1">
        <span>Pool: ${totalStake.toFixed(2)} USDC</span>
        <span>Deadline: {new Date(market.resolution_deadline).toLocaleDateString()}</span>
      </div>
    </div>
  )
}
