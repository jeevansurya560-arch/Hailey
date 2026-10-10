import { useQuery } from '@tanstack/react-query'
import { BarChart3, Loader2 } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { fetchCreatorAnalytics } from '../services/analyticsService'
import { ReachEngagementScatterPlot } from '../components/ReachEngagementScatterPlot'
import { AuthorTalkSection } from '../components/AuthorTalkSection'

export function CreatorAnalyticsPage() {
  const { user } = useAuth()
  const targetUserId = user?.id || 'demo-creator-id'

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['creator_analytics', targetUserId],
    queryFn: () => fetchCreatorAnalytics(targetUserId),
    enabled: !!targetUserId,
  })

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="border-b border-[var(--line)] pb-5">
        <div className="flex items-center gap-2 text-[var(--clay)] mb-1">
          <BarChart3 className="h-5 w-5" />
          <span className="font-mono text-xs uppercase tracking-widest font-bold">
            Creator Intelligence & Provenance
          </span>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-[var(--ink)]">
          Creator Performance & Living Archives
        </h1>
        <p className="mt-1 text-sm text-[var(--ink-2)] max-w-2xl leading-relaxed">
          Real metrics calculated from verified dispatches, audience impressions, and onchain attestations. No synthetic numbers or vanity inflation.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--clay)]" />
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--ink-2)]">
            Loading creator statistics...
          </p>
        </div>
      ) : (
        <>
          {/* Overview Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border border-[var(--ink)] bg-[var(--paper-2)] p-4 shadow-[2px_2px_0_var(--ink)] space-y-1">
              <span className="font-mono text-[10px] text-[var(--ink-2)] uppercase tracking-wider block">
                Total Reach
              </span>
              <span className="font-serif text-2xl font-bold text-[var(--ink)]">
                {analytics?.empty ? '0' : analytics?.totalReach}
              </span>
              <span className="font-mono text-[10px] text-[var(--moss)] block">Verified views</span>
            </div>

            <div className="border border-[var(--ink)] bg-[var(--paper-2)] p-4 shadow-[2px_2px_0_var(--ink)] space-y-1">
              <span className="font-mono text-[10px] text-[var(--ink-2)] uppercase tracking-wider block">
                Engagement Rate
              </span>
              <span className="font-serif text-2xl font-bold text-[var(--ink)]">
                {analytics?.empty ? '0.0%' : `${analytics?.avgEngagementRate}%`}
              </span>
              <span className="font-mono text-[10px] text-[var(--indigo)] block">Reactions / Reach</span>
            </div>

            <div className="border border-[var(--ink)] bg-[var(--paper-2)] p-4 shadow-[2px_2px_0_var(--ink)] space-y-1">
              <span className="font-mono text-[10px] text-[var(--ink-2)] uppercase tracking-wider block">
                Cultural Posts
              </span>
              <span className="font-serif text-2xl font-bold text-[var(--ink)]">
                {analytics?.empty ? '0' : analytics?.totalPosts}
              </span>
              <span className="font-mono text-[10px] text-[var(--saffron)] block">Published dispatches</span>
            </div>

            <div className="border border-[var(--ink)] bg-[var(--paper-2)] p-4 shadow-[2px_2px_0_var(--ink)] space-y-1">
              <span className="font-mono text-[10px] text-[var(--ink-2)] uppercase tracking-wider block">
                Onchain Attested
              </span>
              <span className="font-serif text-2xl font-bold text-[var(--ink)]">
                {analytics?.empty ? '0' : analytics?.verifiedContributions}
              </span>
              <span className="font-mono text-[10px] text-purple-700 block">Monad L1 seals</span>
            </div>
          </div>

          {/* Scatter Plot Section */}
          <ReachEngagementScatterPlot
            points={analytics?.scatterPoints || []}
            empty={analytics?.empty}
            emptyReason={analytics?.reason}
          />

          {/* Author Talk Concept Section */}
          <AuthorTalkSection userId={targetUserId} />
        </>
      )}
    </div>
  )
}

export default CreatorAnalyticsPage
