import React from 'react'
import { Check, Hash } from 'lucide-react'

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
      className={`
        inline-flex items-center select-none font-mono font-medium rounded-full
        border transition-all duration-150 ease-out cursor-pointer
        active:scale-95
        disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed
        motion-reduce:transition-none motion-reduce:active:scale-100
        ${
          selected
            ? 'bg-[#6A1F35] text-[#FAF6EF] border-[#511528] shadow-[0_3px_10px_rgba(106,31,53,0.28)]'
            : 'bg-[#FAF6EF] text-[#34252A] border-[#E0D4C5] neu-pill hover:border-[#6A1F35]/40 hover:text-[#6A1F35]'
        }
        ${sizeClasses}
        ${className}
      `}
    >
      {selected ? (
        <Check className="h-3 w-3 stroke-[2.5] text-[#FAF6EF]" />
      ) : (
        <Hash className="h-3 w-3 text-[#B08A50] opacity-70" />
      )}

      <span>{name}</span>

      {showKind && kind && (
        <span
          className={`ml-1 uppercase text-[9px] tracking-wider ${
            selected ? 'text-[#FAF6EF]/75' : 'text-[#34252A]/50'
          }`}
        >
          · {kind}
        </span>
      )}
    </button>
  )
}
