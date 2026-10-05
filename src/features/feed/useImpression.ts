import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/useAuth'

// Batched impressions queue
const impressionQueue = new Set<string>()
let flushTimer: NodeJS.Timeout | null = null

function flushImpressions(userId: string) {
  if (impressionQueue.size === 0) return
  const postIds = Array.from(impressionQueue)
  impressionQueue.clear()

  const rows = postIds.map((postId) => ({
    user_id: userId,
    post_id: postId,
  }))

  supabase
    .from('impressions')
    .upsert(rows, { onConflict: 'user_id,post_id' })
    .then(({ error }) => {
      if (error) {
        // Silently ignore minor duplicate/offline errors
      }
    })
}

export function useImpression(postId?: string) {
  const { user } = useAuth()
  const elementRef = useRef<HTMLDivElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const hasRecordedRef = useRef(false)

  useEffect(() => {
    if (!user || !postId || hasRecordedRef.current) return

    const node = elementRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          // Card is >= 50% visible; start 1s timer
          if (!timerRef.current && !hasRecordedRef.current) {
            timerRef.current = setTimeout(() => {
              hasRecordedRef.current = true
              impressionQueue.add(postId)

              // Debounced flush
              if (flushTimer) clearTimeout(flushTimer)
              flushTimer = setTimeout(() => {
                flushImpressions(user.id)
              }, 2000)
            }, 1000)
          }
        } else {
          // Left viewport before 1s threshold reached
          if (timerRef.current) {
            clearTimeout(timerRef.current)
            timerRef.current = null
          }
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(node)

    return () => {
      observer.disconnect()
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [user, postId])

  return elementRef
}
