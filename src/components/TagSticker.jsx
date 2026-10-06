import React from 'react'
import { Check, Hash } from 'lucide-react'
import { getThreadColor } from '@/lib/threadColors'

export function TagSticker({
  name,
  kind,
  selected = false,
  onClick,
  disabled = false,
  showKind = false,
  size = 'md',
  className = '',
}) {
  const threadColor = getThreadColor(kind)

  const sizeClasses =
    {
      sm: 'px-2 py-0.5 text-[11px] gap-1',
      md: 'px-3 py-1.5 text-xs gap-1.5',
      lg: 'px-4 py-2 text-sm gap-2',
    }[size] || 'px-3 py-1.5 text-xs gap-1.5'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      style={
        selected
          ? {
              backgroundColor: threadColor,
              borderColor: 'var(--ink)',
              color: '#F7F2E8',
              boxShadow: '2px 2px 0 var(--ink)',
            }
          : {
              backgroundColor: 'var(--paper)',
              borderColor: 'var(--line)',
              color: 'var(--ink)',
            }
      }
      className={`
        inline-flex items-center select-none font-mono font-medium rounded-[var(--radius)]
        border transition-all duration-150 ease-out
        active:scale-95 active:shadow-none
        hover:border-[var(--ink)] hover:text-[var(--ink)]
        disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed
        motion-reduce:transition-none motion-reduce:active:scale-100
        ${sizeClasses}
        ${className}
      `}
    >
      {selected ? (
        <Check className="h-3.5 w-3.5 stroke-[2.5]" />
      ) : (
        <Hash className="h-3.5 w-3.5 opacity-50" style={{ color: threadColor }} />
      )}

      <span>{name}</span>

      {showKind && kind && (
        <span
          className="ml-1 uppercase text-[9px] tracking-wider opacity-70"
          style={{ color: selected ? '#F7F2E8' : 'var(--ink-2)' }}
        >
          · {kind}
        </span>
      )}
    </button>
  )
}
