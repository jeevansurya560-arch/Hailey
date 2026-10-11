import { useQuery } from '@tanstack/react-query'
import { fetchRedditCulturalDispatches } from '../services/redditService'

/**
 * Hook to fetch and cache public Reddit cultural dispatches.
 *
 * @param {Object} params
 * @param {string} params.subreddit
 * @param {string} [params.query]
 * @param {'hot' | 'new' | 'top'} [params.sort='hot']
 * @param {boolean} [params.enabled=true] Only fetch when component is active
 */
export function useRedditDispatches({
  subreddit = 'Folklore',
  query = '',
  sort = 'hot',
  enabled = true,
} = {}) {
  return useQuery({
    queryKey: ['reddit_dispatches', subreddit, query, sort],
    queryFn: () => fetchRedditCulturalDispatches({ subreddit, query, sort }),
    enabled: Boolean(enabled && subreddit),
    staleTime: 5 * 60 * 1000, // 5 minutes cache to prevent rate limits
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  })
}
