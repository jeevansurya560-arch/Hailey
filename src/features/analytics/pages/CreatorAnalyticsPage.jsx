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
      <div className="border-b border-[#E0D4C5] pb-5">
        <div className="flex items-center gap-2 text-[#B08A50] mb-1.5">
          <BarChart3 className="h-5 w-5 text-[#6A1F35]" />
          <span className="font-mono text-xs uppercase tracking-widest font-bold">
            Creator Intelligence & Provenance
          </span>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-[#34252A]">
          Creator Performance & Living Archives
        </h1>
        <p className="mt-1.5 text-sm text-[#34252A]/80 max-w-2xl leading-relaxed">
          Real metrics calculated from verified dispatches, audience impressions, and onchain attestations. No synthetic numbers or vanity inflation.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <Loader2 className="h-6 w-6 animate-spin text-[#6A1F35]" />
          <p className="font-mono text-xs uppercase tracking-widest text-[#B08A50] font-semibold">
            Loading creator statistics...
          </p>
        </div>
      ) : (
        <>
          {/* Overview Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="neu-card rounded-2xl bg-[#FAF6EF] border border-[#E0D4C5] p-5 space-y-1.5">
              <span className="font-mono text-[10px] text-[#34252A]/60 uppercase tracking-wider block font-semibold">
                Total Reach
              </span>
              <span className="font-serif text-3xl font-bold text-[#34252A]">
                {analytics?.empty ? '0' : analytics?.totalReach}
              </span>
              <span className="font-mono text-[10px] text-emerald-800 block font-medium">Verified views</span>
            </div>

            <div className="neu-card rounded-2xl bg-[#FAF6EF] border border-[#E0D4C5] p-5 space-y-1.5">
              <span className="font-mono text-[10px] text-[#34252A]/60 uppercase tracking-wider block font-semibold">
                Engagement Rate
              </span>
              <span className="font-serif text-3xl font-bold text-[#34252A]">
                {analytics?.empty ? '0.0%' : `${analytics?.avgEngagementRate}%`}
              </span>
              <span className="font-mono text-[10px] text-[#6A1F35] block font-medium">Reactions / Reach</span>
            </div>

            <div className="neu-card rounded-2xl bg-[#FAF6EF] border border-[#E0D4C5] p-5 space-y-1.5">
              <span className="font-mono text-[10px] text-[#34252A]/60 uppercase tracking-wider block font-semibold">
                Cultural Posts
              </span>
              <span className="font-serif text-3xl font-bold text-[#34252A]">
                {analytics?.empty ? '0' : analytics?.totalPosts}
              </span>
              <span className="font-mono text-[10px] text-[#B08A50] block font-medium">Published dispatches</span>
            </div>

            <div className="neu-card rounded-2xl bg-[#FAF6EF] border border-[#E0D4C5] p-5 space-y-1.5">
              <span className="font-mono text-[10px] text-[#34252A]/60 uppercase tracking-wider block font-semibold">
                Onchain Attested
              </span>
              <span className="font-serif text-3xl font-bold text-[#34252A]">
                {analytics?.empty ? '0' : analytics?.verifiedContributions}
              </span>
              <span className="font-mono text-[10px] text-purple-800 block font-medium">Monad L1 seals</span>
            </div>
          </div>

          {/* Scatter Plot Section */}
          <ReachEngagementScatterPlot
            points={analytics?.scatterPoints || []}
            empty={analytics?.empty}
            emptyReason={analytics?.reason}
          />

          {/* Author Talk Concept Section */}
          <AuthorTalkSection />
        </>
      )}
    </div>
  )
}

export default CreatorAnalyticsPage
