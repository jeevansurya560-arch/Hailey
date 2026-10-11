import React from 'react'
import { Sparkles, Compass } from 'lucide-react'

export function WhyStamp({ why, isExplore = false, className = '' }) {
  if (!why || why.length === 0) return null

  const tagsFormatted = why.join(' + ').toUpperCase()

  return (
    <div
      className={`
        neu-pill inline-flex items-center gap-1.5 px-3 py-1 font-mono text-[10px] uppercase font-bold tracking-wider
        rounded-full border transition-all
        ${
          isExplore
            ? 'bg-[#F0E7DA] border-[#B08A50]/40 text-[#B08A50]'
            : 'bg-[#FAF6EF] border-[#6A1F35]/30 text-[#6A1F35]'
        }
        ${className}
      `}
    >
      {isExplore ? (
        <Compass className="h-3 w-3 text-[#B08A50] shrink-0" />
      ) : (
        <Sparkles className="h-3 w-3 text-[#6A1F35] shrink-0" />
      )}
      <span>
        {isExplore ? 'DISCOVERY' : 'BECAUSE'} · {tagsFormatted}
      </span>
    </div>
  )
}
