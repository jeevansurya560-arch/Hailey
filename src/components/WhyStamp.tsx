import { Sparkles, Compass } from 'lucide-react'

export interface WhyStampProps {
  why?: string[] | null
  isExplore?: boolean
  className?: string
}

export function WhyStamp({ why, isExplore = false, className = '' }: WhyStampProps) {
  if (!why || why.length === 0) return null

  const tagsFormatted = why.join(' + ').toUpperCase()

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 font-mono text-[10px] uppercase font-bold tracking-wider
        rounded-[var(--radius)] border shadow-[1.5px_1.5px_0_var(--ink)]
        ${isExplore ? '-rotate-1 bg-amber-50 border-[var(--saffron)] text-[var(--saffron)]' : 'rotate-1 bg-[var(--paper)] border-[var(--ink)] text-[var(--ink)]'}
        ${className}
      `}
    >
      {isExplore ? (
        <Compass className="h-3 w-3 text-[var(--saffron)] shrink-0" />
      ) : (
        <Sparkles className="h-3 w-3 text-[var(--clay)] shrink-0" />
      )}
      <span>
        {isExplore ? 'DISCOVERY' : 'BECAUSE'} · {tagsFormatted}
      </span>
    </div>
  )
}
