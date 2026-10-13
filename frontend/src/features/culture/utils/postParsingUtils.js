/**
 * postParsingUtils.js
 * 
 * Centralized parsing and normalization utilities for Hailey cultural dispatches.
 */

// Mapping of video-enabled demo dispatches to their public asset video paths
export const DEMO_VIDEO_ASSET_MAP = {
  'c0000002-0000-0000-0000-000000000002': '/videos/Buddhavanam_Clip_1_Stupa_and_Monastery.mp4',
  'c0000005-0000-0000-0000-000000000005': '/videos/Islamic_Culture_Clip_1_Mosque_Architecture.mp4',
  'c0000010-0000-0000-0000-000000000010': '/videos/Buddhavanam_Clip_2_Monks_and_Heritage.mp4',
  'c0000014-0000-0000-0000-000000000014': '/videos/India_Heritage_Clip_1_Monuments.mp4',
  'c0000021-0000-0000-0000-000000000021': '/videos/India_Heritage_Clip_3_Traditions_Scenery.mp4',
  'c0000026-0000-0000-0000-000000000026': '/videos/India_Heritage_Clip_2_Culture_Festivals.mp4',
  'c0000028-0000-0000-0000-000000000028': '/videos/Islamic_Culture_Clip_2_Prayer_and_Heritage.mp4',
  'c0000032-0000-0000-0000-000000000032': '/videos/India_Heritage_Clip_4_Nature_and_Living_Heritage.mp4',
}

/**
 * Extracts editorial title, description, location, category, and video metadata
 */
export function parseCulturalPost(post) {
  if (!post) {
    return {
      title: 'Cultural Dispatch',
      description: '',
      location: 'Global Living Culture',
      category: 'Cultural Heritage',
      isVideo: false,
      videoUrl: null,
      duration: '0:58',
      timeAgo: 'recently',
    }
  }

  const body = post.body || ''
  let title = ''
  let description = body
  let location = ''

  // Format typically: "Title (Location) — Description..." or "Title — Description..."
  const dashMatch = body.match(/^(.+?)\s*[—–-]\s*(.+)$/s)
  if (dashMatch) {
    const rawTitlePart = dashMatch[1].trim()
    description = dashMatch[2].trim()

    const locMatch = rawTitlePart.match(/^(.+?)\s*\((.+?)\)$/)
    if (locMatch) {
      title = locMatch[1].trim()
      location = locMatch[2].trim()
    } else {
      title = rawTitlePart
    }
  } else {
    title = body.slice(0, 40)
  }

  // Derive readable category
  let category = 'Cultural Heritage'
  if (post.community?.name) {
    category = post.community.name
  } else if (post.tags && post.tags.length > 0) {
    category = post.tags[0].name
  }

  // Normalize category names
  if (category.toLowerCase().includes('fest') || category.toLowerCase().includes('pageantry')) {
    category = 'Festivals & Public Pageantry'
  } else if (category.toLowerCase().includes('arch')) {
    category = 'Sacred Architecture'
  } else if (category.toLowerCase().includes('cuis') || category.toLowerCase().includes('food') || category.toLowerCase().includes('culin')) {
    category = 'Cuisine & Culinary Heritage'
  } else if (category.toLowerCase().includes('nat') || category.toLowerCase().includes('herit')) {
    category = 'Nature & Heritage'
  } else if (category.toLowerCase().includes('perf') || category.toLowerCase().includes('dance')) {
    category = 'Folk Arts & Performance'
  }

  // Assign location if not parsed
  if (!location) {
    const lowerBody = body.toLowerCase()
    const lowerTitle = title.toLowerCase()
    if (lowerBody.includes('japan') || lowerTitle.includes('japan') || lowerBody.includes('kyoto') || lowerTitle.includes('kyoto')) {
      location = 'Kyoto, Japan'
    } else if (lowerBody.includes('india') || lowerTitle.includes('india') || lowerBody.includes('sanchi') || lowerBody.includes('agra') || lowerBody.includes('varanasi')) {
      location = 'India'
    } else if (lowerBody.includes('abu dhabi') || lowerBody.includes('uae')) {
      location = 'Abu Dhabi, UAE'
    } else if (lowerBody.includes('united states') || lowerBody.includes('america') || lowerBody.includes('bronx')) {
      location = 'United States'
    } else if (lowerBody.includes('egypt') || lowerBody.includes('cairo')) {
      location = 'Cairo, Egypt'
    } else {
      location = 'Global Living Culture'
    }
  }

  // Determine video URL and video status
  let videoUrl =
    post.video_url ||
    DEMO_VIDEO_ASSET_MAP[post.id] ||
    (typeof post.media_url === 'string' && post.media_url.endsWith('.mp4') ? post.media_url : null)

  if (!videoUrl && post.id) {
    const match = String(post.id).match(/^c00000(\d{2})-/) || String(post.id).match(/(\d+)$/)
    if (match) {
      const num = parseInt(match[1], 10)
      const formattedId = `c00000${String(num).padStart(2, '0')}-0000-0000-0000-0000000000${String(num).padStart(2, '0')}`
      if (DEMO_VIDEO_ASSET_MAP[formattedId]) {
        videoUrl = DEMO_VIDEO_ASSET_MAP[formattedId]
      }
    }
  }

  const isVideo = Boolean(post.is_video || videoUrl)

  const durations = ['0:46', '0:58', '1:12', '1:25', '0:38', '1:04']
  const duration = durations[Math.abs(title.length) % durations.length]

  // Relative timestamp calculation
  let timeAgo = '3d ago'
  if (post.created_at) {
    const diffDays = Math.floor((Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays <= 0) timeAgo = 'today'
    else if (diffDays < 7) timeAgo = `${diffDays}d ago`
    else if (diffDays < 30) timeAgo = `${Math.floor(diffDays / 7)}w ago`
    else timeAgo = `${Math.floor(diffDays / 30)}mo ago`
  }

  return {
    title,
    description,
    location,
    category,
    isVideo,
    videoUrl,
    duration,
    timeAgo,
  }
}
