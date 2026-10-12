import React, { useState } from 'react'

/**
 * UserAvatar - Accessible, circular cultural avatar with reliable initials fallback.
 * Strictly adheres to Hailey's visual identity:
 * Porcelain/ivory background (#FAF6EF), deep wine/burgundy typography (#6A1F35),
 * restrained border (#E0D4C5 or #34252A), and circular editorial styling.
 * 
 * Never renders broken-image icons or question marks when an image fails to load.
 */
export function UserAvatar({
  src,
  handle,
  displayName,
  size = 'md', // 'xs' (24px), 'sm' (32px), 'md' (36px), 'lg' (48px), 'xl' (96px), '2xl' (112px)
  className = '',
  alt,
  border = true,
}) {
  const [prevSrc, setPrevSrc] = useState(src)
  const [imageFailed, setImageFailed] = useState(false)

  // Reset failure state if src changes during render without cascading effects
  if (prevSrc !== src) {
    setPrevSrc(src)
    setImageFailed(false)
  }

  // Compute initials fallback:
  // 1. First letter of handle
  // 2. If unavailable, first letter of display name
  // 3. If both unavailable, safe neutral fallback 'H' (Hailey)
  const cleanHandle = handle ? String(handle).replace(/^@/, '').trim() : ''
  const cleanName = displayName ? String(displayName).trim() : ''
  
  let initial = 'H'
  if (cleanHandle.length > 0) {
    initial = cleanHandle.charAt(0).toUpperCase()
  } else if (cleanName.length > 0) {
    initial = cleanName.charAt(0).toUpperCase()
  }

  const sizeClasses = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-9 w-9 text-xs font-semibold',
    lg: 'h-12 w-12 text-base font-bold',
    xl: 'h-24 w-24 text-2xl md:text-3xl font-bold',
    '2xl': 'h-24 w-24 md:h-28 md:w-28 text-3xl font-black',
  }

  const baseSize = sizeClasses[size] || sizeClasses.md
  const borderClass = border ? 'border border-[#E0D4C5]' : ''
  const accessibleLabel = alt || (cleanHandle ? `@${cleanHandle}` : cleanName || 'User Avatar')

  const effectiveSrc = !imageFailed && src && typeof src === 'string' && src.trim().length > 0 ? src.trim() : null

  if (effectiveSrc) {
    return (
      <div
        className={`relative shrink-0 rounded-full overflow-hidden bg-[#FAF6EF] flex items-center justify-center ${borderClass} ${baseSize} ${className}`}
      >
        <img
          src={effectiveSrc}
          alt={accessibleLabel}
          onError={() => setImageFailed(true)}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    )
  }

  return (
    <div
      role="img"
      aria-label={accessibleLabel}
      className={`relative shrink-0 rounded-full overflow-hidden bg-[#FAF6EF] text-[#6A1F35] font-serif uppercase flex items-center justify-center select-none shadow-[1px_1px_0_rgba(106,31,53,0.1)] ${borderClass} ${baseSize} ${className}`}
    >
      <span>{initial}</span>
    </div>
  )
}

export default UserAvatar
