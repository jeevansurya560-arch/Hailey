import { useState, useRef } from 'react'
import { getOriginMetrics } from '../services/originCultureStats'

/**
 * OriginHoverCard component.
 * Displays only the number of cultures recorded when the pointer hovers over an origin element.
 */
export function OriginHoverCard({ origin, children, className = '', placement = 'top' }) {
  const [isHovered, setIsHovered] = useState(false)
  const timeoutRef = useRef(null)
  const metrics = getOriginMetrics(origin)

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false)
    }, 100)
  }

  const isPlacementBottom = placement === 'bottom'
  const isBlock = className.includes('w-full') || className.includes('block') || className.includes('flex')

  return (
    <div
      className={`relative ${isBlock ? 'block' : 'inline-block'} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger element */}
      {children}

      {/* Floating Hover Tooltip: Only number of cultures */}
      {isHovered && (
        <div
          role="tooltip"
          className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 bg-[#FAF6EF] border border-[#E0D4C5] rounded-xl shadow-lg z-[9999] pointer-events-none neu-card animate-fade-in flex items-center gap-1.5 font-mono text-xs ${
            isPlacementBottom ? 'top-full mt-2' : 'bottom-full mb-2'
          }`}
        >
          {metrics.flag && <span className="text-xs leading-none">{metrics.flag}</span>}
          <span className="font-bold text-[#6A1F35]">{metrics.cultures_count}</span>
          <span className="text-[#34252A] font-medium">Cultures</span>

          {/* Subtle Pointer Arrow */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-[#FAF6EF] border-[#E0D4C5] rotate-45 ${
              isPlacementBottom
                ? '-top-1 border-t border-l'
                : '-bottom-1 border-b border-r'
            }`}
          />
        </div>
      )}
    </div>
  )
}

