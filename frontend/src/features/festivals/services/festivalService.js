import { supabase } from '@/lib/supabase/client'
import { VERIFIED_FESTIVALS } from '@shared/data/culturalDatasets.js'

export { VERIFIED_FESTIVALS }


/**
 * Fetches all festivals, attempting Supabase database first with graceful fallback.
 */
export async function fetchAllFestivals() {
  try {
    const fetchPromise = supabase
      .from('festivals')
      .select(`
        *,
        festival_occurrences (*)
      `)
      .order('name', { ascending: true })

    // Timeout promise (3.5s) to guarantee loading never hangs permanently
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Supabase request timeout')), 3500)
    )

    const { data, error } = await Promise.race([fetchPromise, timeoutPromise])

    if (!error && data && data.length > 0) {
      return data
    }
  } catch (err) {
    console.warn('[festivalService] Fallback to archive:', err instanceof Error ? err.message : String(err))
  }

  return VERIFIED_FESTIVALS
}

/**
 * Fetches a single festival by its unique slug.
 */
export async function fetchFestivalBySlug(slug) {
  if (!slug) return null

  try {
    const { data, error } = await supabase
      .from('festivals')
      .select(`
        *,
        festival_occurrences (*)
      `)
      .eq('slug', slug)
      .maybeSingle()

    if (!error && data) {
      return data
    }
  } catch (err) {
    console.warn('[festivalService] Fallback to archive for slug:', err instanceof Error ? err.message : String(err))
  }

  return VERIFIED_FESTIVALS.find((f) => f.slug === slug) || null
}
