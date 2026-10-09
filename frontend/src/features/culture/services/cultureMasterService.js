/**
 * src/features/culture/services/cultureMasterService.js
 *
 * Client-side service to query and retrieve nodes from the
 * 1,000,000 Culture Master Dataset (culture_master_dataset table).
 */

import { supabase } from '@/lib/supabase/client'
import {
  FALLBACK_MASTER_NODES,
  MASTER_DATASET_DISTRIBUTION,
} from './cultureMasterConstants.js'

/**
 * Fetch paginated nodes from the 1M Culture Master Dataset
 */
export async function fetchCultureMasterNodes({
  query = '',
  origin = '',
  kind = '',
  seedOnly = false,
  page = 1,
  limit = 20,
} = {}) {
  const offset = (page - 1) * limit

  try {
    let dbQuery = supabase
      .from('culture_master_dataset')
      .select('*', { count: 'exact' })

    if (query && query.trim()) {
      const q = query.trim()
      dbQuery = dbQuery.or(`name.ilike.%${q}%,description.ilike.%${q}%,origin.ilike.%${q}%`)
    }
    if (origin) {
      dbQuery = dbQuery.eq('origin', origin)
    }
    if (kind) {
      dbQuery = dbQuery.eq('kind', kind)
    }
    if (seedOnly) {
      dbQuery = dbQuery.eq('is_original_seed', true)
    }

    const { data, count, error } = await dbQuery
      .order('is_original_seed', { ascending: false })
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1)

    if (!error && data && data.length > 0) {
      return {
        nodes: data,
        pagination: {
          page,
          limit,
          total: count || data.length,
          totalPages: Math.ceil((count || data.length) / limit),
        },
        distribution: MASTER_DATASET_DISTRIBUTION,
        source: 'database',
      }
    }
  } catch {
    // Database query failed, fall through to memory fallback
  }

  // Fallback to bundled foundational archive nodes
  let filtered = [...FALLBACK_MASTER_NODES]

  if (query && query.trim()) {
    const qLower = query.trim().toLowerCase()
    filtered = filtered.filter(
      (n) =>
        n.name.toLowerCase().includes(qLower) ||
        n.description.toLowerCase().includes(qLower) ||
        n.origin.toLowerCase().includes(qLower) ||
        n.slug.toLowerCase().includes(qLower)
    )
  }
  if (origin) {
    filtered = filtered.filter((n) => n.origin.toLowerCase() === origin.toLowerCase())
  }
  if (kind) {
    filtered = filtered.filter((n) => n.kind.toLowerCase() === kind.toLowerCase())
  }
  if (seedOnly) {
    filtered = filtered.filter((n) => n.is_original_seed)
  }

  const paginated = filtered.slice(offset, offset + limit)

  return {
    nodes: paginated,
    pagination: {
      page,
      limit,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limit),
    },
    distribution: MASTER_DATASET_DISTRIBUTION,
    source: 'fallback_archive',
  }
}

/**
 * Fetch a single research node by slug from the 1M dataset
 */
export async function fetchCultureMasterNodeBySlug(slug) {
  if (!slug) return null

  try {
    const { data, error } = await supabase
      .from('culture_master_dataset')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (!error && data) {
      return data
    }
  } catch {
    // Database query failed, use memory fallback
  }

  return FALLBACK_MASTER_NODES.find((n) => n.slug === slug) || null
}

/**
 * Get distribution metrics for the 1M Culture Master Dataset
 */
export async function fetchCultureMasterDistribution() {
  try {
    const { data, error } = await supabase.rpc('get_culture_master_stats')
    if (!error && data) {
      return data
    }
  } catch {
    // Fallback to static distribution
  }

  return MASTER_DATASET_DISTRIBUTION
}
