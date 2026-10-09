import { supabase } from '@/lib/supabase/client'
import { VERIFIED_CULTURAL_ARCHIVE } from '@shared/data/culturalDatasets.js'

export { VERIFIED_CULTURAL_ARCHIVE }


/**
 * Fetches all cultural entities, attempting live Supabase lookup first with fallback to verified archive.
 */
export async function fetchAllCulturalEntities() {
  try {
    const { data, error } = await supabase
      .from('cultural_entities')
      .select('*')
      .order('name', { ascending: true })

    if (!error && data && data.length > 0) {
      return data
    }
  } catch (err) {
    console.warn('[culturalKnowledge] Fallback to archive:', err instanceof Error ? err.message : String(err))
  }

  return VERIFIED_CULTURAL_ARCHIVE
}

/**
 * Fetches a single cultural entity by its canonical slug.
 */
export async function fetchCulturalEntityBySlug(slug) {
  if (!slug) return null

  try {
    const { data, error } = await supabase
      .from('cultural_entities')
      .select(`
        *,
        cultural_media (*)
      `)
      .eq('slug', slug)
      .maybeSingle()

    if (!error && data) {
      return data
    }
  } catch (err) {
    console.warn('[culturalKnowledge] Fallback to archive for slug:', err instanceof Error ? err.message : String(err))
  }

  const match = VERIFIED_CULTURAL_ARCHIVE.find((c) => c.slug === slug)
  return match || null
}
