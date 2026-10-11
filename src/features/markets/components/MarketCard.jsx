import React, { useState } from 'react'
import { MapPin, Sparkles, Layers } from 'lucide-react'

const DEFAULT_CULTURAL_IMAGE = 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=800&auto=format&fit=crop'

export function MarketCard({ market, onSelect }) {
  const [now] = useState(() => Date.now())
  const [imgError, setImgError] = useState(false)
  if (!market) return null

  const isResolved = market.status === 'resolved'
  const isClosed = market.status === 'closed' || new Date(market.resolution_deadline).getTime() <= now
  const totalStake = (market.market_options || []).reduce((acc, opt) => acc + parseFloat(opt.total_stake || 0), 0)

  const imageUrl = (!imgError && (market.image_url || market.media_url)) || DEFAULT_CULTURAL_IMAGE

  return (
    <div
      onClick={() => onSelect(market)}
      className="neu-card rounded-2xl bg-[#FAF6EF] border border-[#E0D4C5] overflow-hidden flex flex-col justify-between cursor-pointer transition transform hover:-translate-y-1 hover:border-[#6A1F35]/50 hover:shadow-lg text-[#34252A] group"
    >
      {/* Cultural Product Image Banner */}
      <div className="relative w-full aspect-[16/10] bg-[#E0D4C5]/30 overflow-hidden">
        <img
          src={imageUrl}
          alt={market.title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Origin / Provenance Pill */}
        {market.cultural_origin && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF6EF]/90 backdrop-blur-md text-[10px] font-mono font-bold text-[#6A1F35] shadow-xs">
            <MapPin className="h-3 w-3" />
            <span>{market.cultural_origin}</span>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded-full font-bold shadow-xs backdrop-blur-md ${
              isResolved
                ? 'bg-emerald-900/80 text-emerald-100 border border-emerald-400/40'
                : isClosed
                ? 'bg-amber-900/80 text-amber-100 border border-amber-400/40'
                : 'bg-[#6A1F35]/80 text-[#FAF6EF] border border-white/20'
            }`}
          >
            {market.status}
          </span>
        </div>

        {/* Bottom Banner Product Title Tag */}
        {market.craft_tradition && (
          <div className="absolute bottom-2.5 left-3 right-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#FAF6EF]/90 font-medium truncate block">
              {market.craft_tradition}
            </span>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-[#F0E7DA] text-[#6A1F35] border border-[#E0D4C5] rounded-full font-semibold">
              {market.category?.replace('_', ' ')}
            </span>
            {market.price_estimate && (
              <span className="text-[10px] font-mono font-bold text-[#B08A50]">
                Est. {market.price_estimate}
              </span>
            )}
          </div>

          <h3 className="font-serif text-base font-bold text-[#34252A] group-hover:text-[#6A1F35] transition-colors line-clamp-2">
            {market.title}
          </h3>

          <p className="text-xs text-[#34252A]/70 line-clamp-2 leading-relaxed">
            {market.description}
          </p>
        </div>

        {/* Options Staking Preview */}
        <div className="space-y-2 pt-2 border-t border-[#E0D4C5]">
          {(market.market_options || []).slice(0, 2).map((opt) => {
            const stake = parseFloat(opt.total_stake || 0)
            const pct = totalStake > 0 ? ((stake / totalStake) * 100).toFixed(0) : 0
            const isWinner = market.winning_option_id === opt.id

            return (
              <div key={opt.id} className="text-xs">
                <div className="flex justify-between text-[#34252A]/75 mb-1">
                  <span className={`truncate max-w-[70%] ${isWinner ? 'text-emerald-700 font-bold' : 'font-medium'}`}>
                    {opt.label} {isWinner && '🏆'}
                  </span>
                  <span className="font-mono text-[#34252A] font-semibold shrink-0">
                    {pct}%
                  </span>
                </div>
                <div className="w-full bg-[#E0D4C5]/60 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isWinner ? 'bg-emerald-600' : 'bg-[#6A1F35]'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer Meta */}
        <div className="flex justify-between items-center text-[11px] font-mono text-[#34252A]/60 pt-2 border-t border-[#E0D4C5]/70">
          <span className="font-semibold text-[#6A1F35]">Pool: ${totalStake.toFixed(0)} USDC</span>
          <span>Due: {new Date(market.resolution_deadline).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  )
}

