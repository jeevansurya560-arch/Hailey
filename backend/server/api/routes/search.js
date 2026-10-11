import { supabaseAdmin } from '../../config/supabaseAdmin.js'
import { VERIFIED_FESTIVALS, VERIFIED_CULTURAL_ARCHIVE } from '../../../../shared/data/culturalDatasets.js'

/**
 * Universal Multi-Entity Search API Endpoint
 * Handles GET /api/search?q=...
 */
export default async function searchRoute(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' })
  }

  const host = req.headers?.host || 'localhost'
  const parsedUrl = new URL(req.url, `http://${host}`)
  const rawQuery = (parsedUrl.searchParams.get('q') || '').trim().toLowerCase()
  // Sanitize query to prevent PostgREST operator injection (strip commas, parens, colons, quotes)
  const query = rawQuery.replace(/[,():".%]/g, ' ').replace(/\s+/g, ' ').trim()

  if (!query || query.length < 2) {
    return res.status(200).json({
      query: '',
      results: { cultures: [], festivals: [], communities: [], posts: [] },
    })
  }

  const results = {
    cultures: [],
    festivals: [],
    communities: [],
    posts: [],
  }

  try {
    // 1. Search Cultural Tags & Entities
    const { data: tags } = await supabaseAdmin
      .from('tags')
      .select('id, name, slug, kind, description')
      .or(`name.ilike.%${query}%,slug.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(8)

    if (tags && tags.length > 0) {
      results.cultures = tags
    } else {
      // Fallback to verified archive
      results.cultures = VERIFIED_CULTURAL_ARCHIVE.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.summary.toLowerCase().includes(query) ||
          c.region.toLowerCase().includes(query)
      ).map((c) => ({
        id: c.slug,
        name: c.name,
        slug: c.slug,
        kind: 'culture',
        description: c.summary,
      }))
    }

    // 2. Search Festivals
    const { data: festivals } = await supabaseAdmin
      .from('festivals')
      .select('id, name, slug, cultural_origin, significance')
      .or(`name.ilike.%${query}%,significance.ilike.%${query}%`)
      .limit(6)

    if (festivals && festivals.length > 0) {
      results.festivals = festivals
    } else {
      results.festivals = VERIFIED_FESTIVALS.filter(
        (f) =>
          f.name.toLowerCase().includes(query) ||
          f.significance.toLowerCase().includes(query) ||
          f.culturalOrigin.toLowerCase().includes(query)
      ).map((f) => ({
        id: f.id,
        name: f.name,
        slug: f.slug,
        cultural_origin: f.culturalOrigin,
        significance: f.significance,
      }))
    }

    // 3. Search Communities
    const { data: communities } = await supabaseAdmin
      .from('communities')
      .select('id, name, slug, description')
      .or(`name.ilike.%${query}%,slug.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(6)

    if (communities) {
      results.communities = communities
    }

    // 4. Search Posts (Enforce published status and GENERAL audience only)
    const { data: posts } = await supabaseAdmin
      .from('posts')
      .select('id, body, created_at, author_id, status, age_classification')
      .eq('status', 'published')
      .eq('age_classification', 'GENERAL')
      .ilike('body', `%${query}%`)
      .limit(8)

    if (posts) {
      results.posts = posts.map((p) => ({
        id: p.id,
        body: p.body,
        created_at: p.created_at,
        author_id: p.author_id,
      }))
    }

    return res.status(200).json({
      query,
      results,
    })
  } catch {
    return res.status(500).json({
      error: 'Search operation failed.',
    })
  }
}
