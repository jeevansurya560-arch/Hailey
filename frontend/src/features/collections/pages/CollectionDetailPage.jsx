import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  BookOpen,
  Plus,
  ExternalLink,
  FileText,
  StickyNote,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Lock,
  MapPin,
  Image as ImageIcon,
} from 'lucide-react'
import {
  fetchCollectionDetail,
  triageCollectionItem,
  CURATED_CULTURAL_COLLECTIONS,
} from '@/features/collections/services/collectionService'
import { ProposeItemModal } from '../components/ProposeItemModal'
import { SupportCuratorModal } from '@/features/payments/components/SupportCuratorModal'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function CollectionDetailPage() {
  const { id } = useParams()
  const { user, session } = useAuth()
  const queryClient = useQueryClient()

  const [isProposeOpen, setIsProposeOpen] = useState(false)
  const [isSupportOpen, setIsSupportOpen] = useState(false)
  const [triageActionError, setTriageActionError] = useState(null)
  const [triageSuccessMsg, setTriageSuccessMsg] = useState(null)

  // 1. Fetch collection details, community, and items via collectionService
  const { data, isLoading, isError } = useQuery({
    queryKey: ['collection_detail', id, user?.id],
    queryFn: () => fetchCollectionDetail({ collectionId: id, currentUserId: user?.id }),
    enabled: !!id,
  })

  // Curator triage mutation calling collectionService
  const triageMutation = useMutation({
    mutationFn: async ({ itemId, action }) => {
      if (!session?.access_token) {
        throw new Error('Authentication session expired. Please sign in again.')
      }

      setTriageActionError(null)
      setTriageSuccessMsg(null)

      return triageCollectionItem({
        itemId,
        action,
        accessToken: session.access_token,
      })
    },
    onSuccess: (data, variables) => {
      setTriageSuccessMsg(
        variables.action === 'approve'
          ? 'Item approved! Contribution record queued for Monad attestation.'
          : 'Proposal rejected.'
      )
      queryClient.invalidateQueries({ queryKey: ['collection_detail', id] })
    },
    onError: (err) => {
      setTriageActionError(err instanceof Error ? err.message : 'Triage action failed')
    },
  })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--clay)]" />
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--ink-2)]">
          Loading archive collection...
        </p>
      </div>
    )
  }

  if (isError || !data?.collection) {
    return (
      <div className="border border-[var(--clay)] bg-[var(--paper-2)] p-8 text-center space-y-3">
        <h2 className="font-serif text-2xl font-bold text-[var(--ink)]">Collection Not Found</h2>
        <Link to="/communities" className="font-mono text-xs text-[var(--clay)] underline">
          ← Return to Communities
        </Link>
      </div>
    )
  }

  const { collection, isCurator, items, userPosts } = data
  const isPersonal = !collection.community_id

  const approvedItems = items.filter((item) => item.status === 'approved')
  const pendingItems = items.filter((item) => item.status === 'pending')

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="neu-card rounded-3xl bg-[#F0E7DA]/60 border border-[#E0D4C5] p-6 md:p-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#B08A50] font-bold flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                {isPersonal ? 'Personal Archive' : 'Community Collection'}
              </span>

              {collection.communities && (
                <>
                  <span className="text-[#34252A]/50 font-mono text-xs">in</span>
                  <Link
                    to={`/communities/${collection.communities.slug}`}
                    className="font-mono text-xs text-[#6A1F35] font-bold hover:underline"
                  >
                    {collection.communities.name}
                  </Link>
                </>
              )}
            </div>

            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-[#34252A]">
              {collection.title}
            </h1>

            {collection.description && (
              <p className="mt-2 text-sm text-[#34252A]/75 max-w-2xl leading-relaxed">
                {collection.description}
              </p>
            )}

            <div className="flex items-center gap-3 mt-3 font-mono text-xs text-[#34252A]/60">
              <span>
                Curated by{' '}
                <Link
                  to={`/u/${collection.profiles?.handle || 'member'}`}
                  className="font-bold text-[#6A1F35] hover:underline"
                >
                  @{collection.profiles?.handle || 'member'}
                </Link>
              </span>
              <span>·</span>
              <span>
                {approvedItems.length} {approvedItems.length === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
            {collection.created_by !== user?.id && (
              <button
                type="button"
                onClick={() => setIsSupportOpen(true)}
                className="flex items-center gap-1.5 neu-pill border border-amber-300/80 bg-amber-500/10 text-amber-900 px-4 py-2 font-mono text-xs uppercase tracking-wider rounded-full shadow-sm hover:bg-amber-500/20 transition-all"
              >
                <span>⚡ Support Curator</span>
              </button>
            )}

            {user && (
              <button
                type="button"
                onClick={() => setIsProposeOpen(true)}
                className="flex items-center gap-1.5 neu-burgundy-pill px-4 py-2 font-mono text-xs uppercase tracking-wider text-[#FAF6EF] hover:bg-[#511528] rounded-full transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>{isPersonal ? 'Add Item' : 'Propose Item'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Curator Triage Section (COLL-05 / System Design §8.2) */}
      {isCurator && pendingItems.length > 0 && (
        <div className="neu-card rounded-2xl bg-[#6A1F35]/5 border border-[#6A1F35]/20 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E0D4C5] pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#6A1F35]" />
              <h2 className="font-serif text-lg font-bold text-[#34252A]">
                Curator Triage Queue ({pendingItems.length} pending)
              </h2>
            </div>
            <span className="font-mono text-[10px] uppercase font-bold text-[#6A1F35] bg-[#6A1F35]/10 px-2.5 py-0.5 rounded-full border border-[#6A1F35]/20">
              Curator Access
            </span>
          </div>

          <p className="text-xs text-[#34252A]/70">
            Review proposed cultural artifacts. Approving creates a verifiable contribution record for onchain Monad attestation.
          </p>

          {triageSuccessMsg && (
            <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
              <span>{triageSuccessMsg}</span>
            </div>
          )}

          {triageActionError && (
            <div className="flex items-center gap-2 text-xs text-rose-800 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{triageActionError}</span>
            </div>
          )}

          <div className="space-y-3">
            {pendingItems.map((item) => {
              const isOwnProposal = user?.id === item.added_by
              return (
                <div
                  key={item.id}
                  className="neu-card rounded-xl border border-[#E0D4C5] bg-[#FAF6EF] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="uppercase font-bold text-[#6A1F35]">[{item.kind}]</span>
                      <span className="text-[#34252A]/60">Proposed by</span>
                      <Link to={`/u/${item.profiles?.handle}`} className="font-bold text-[#34252A] hover:underline">
                        @{item.profiles?.handle}
                      </Link>
                      <span className="text-[10px] text-[#34252A]/50">
                        · {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {item.url && (
                      <div className="flex items-center gap-1.5 font-mono text-xs text-[#6A1F35]">
                        <ExternalLink className="h-3 w-3 shrink-0" />
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline truncate max-w-md">
                          {item.url}
                        </a>
                      </div>
                    )}

                    {item.note && (
                      <p className="text-xs text-[#34252A] italic bg-[#F0E7DA]/50 p-2.5 rounded-lg border border-[#E0D4C5]">
                        "{item.note}"
                      </p>
                    )}

                    {item.posts && (
                      <div className="text-xs text-[#34252A]/70 line-clamp-2 pl-2 border-l-2 border-[#6A1F35]">
                        Dispatch: {item.posts.body}
                      </div>
                    )}
                  </div>

                  {/* Approve / Reject Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isOwnProposal ? (
                      <span className="font-mono text-[11px] text-[#34252A]/50 italic bg-[#F0E7DA]/40 px-3 py-1 rounded-full border border-[#E0D4C5]">
                        Self-proposal (waiting for peer curator)
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => triageMutation.mutate({ itemId: item.id, action: 'approve' })}
                          disabled={triageMutation.isPending}
                          className="flex items-center gap-1 neu-pill bg-emerald-700 hover:bg-emerald-800 text-white font-mono text-xs px-3.5 py-1.5 rounded-full transition-all"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Approve</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => triageMutation.mutate({ itemId: item.id, action: 'reject' })}
                          disabled={triageMutation.isPending}
                          className="flex items-center gap-1 neu-pill border border-[#E0D4C5] bg-[#FAF6EF] hover:bg-rose-50 hover:text-rose-700 font-mono text-xs px-3.5 py-1.5 text-[#34252A]/70 rounded-full transition-all"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Main Items Grid */}
      <div className="space-y-4">
        <div className="border-b border-[#E0D4C5] pb-2 flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-[#34252A]">
            Archived Items ({approvedItems.length})
          </h2>
        </div>

        {approvedItems.length === 0 && (
          <div className="neu-card rounded-2xl bg-[#FAF6EF] border border-dashed border-[#E0D4C5] p-12 text-center font-mono text-xs text-[#34252A]/60">
            No items in this collection yet. Propose the first cultural citation above!
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {approvedItems.map((item) => {
            const itemImage = item.image_url || item.posts?.media_url
            return (
              <div
                key={item.id}
                className="neu-card rounded-2xl bg-[#FAF6EF] border border-[#E0D4C5] overflow-hidden flex flex-col justify-between hover:border-[#6A1F35]/40 hover:shadow-md transition-all group"
              >
                {/* Cultural Artifact Image (if present) */}
                {itemImage && (
                  <div className="relative w-full aspect-[16/10] bg-[#E0D4C5]/30 overflow-hidden">
                    <img
                      src={itemImage}
                      alt={item.title || item.note || 'Cultural Artifact'}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    {item.cultural_origin && (
                      <div className="absolute bottom-2.5 left-3 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FAF6EF]/90 backdrop-blur-md text-[10px] font-mono font-bold text-[#6A1F35]">
                        <MapPin className="h-3 w-3" />
                        <span>{item.cultural_origin}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between font-mono text-[11px] border-b border-[#E0D4C5] pb-2">
                      <span className="flex items-center gap-1 font-bold text-[#6A1F35] uppercase">
                        {itemImage && <ImageIcon className="h-3 w-3" />}
                        {item.kind === 'link' && !itemImage && <ExternalLink className="h-3 w-3" />}
                        {item.kind === 'post' && !itemImage && <FileText className="h-3 w-3" />}
                        {item.kind === 'note' && !itemImage && <StickyNote className="h-3 w-3" />}
                        {item.kind}
                      </span>

                      <span className="text-[#34252A]/60 flex items-center gap-1">
                        <Lock className="h-2.5 w-2.5 text-emerald-700" />
                        Added by @{item.profiles?.handle || item.added_by_handle}
                      </span>
                    </div>

                    {item.title && (
                      <h3 className="font-serif text-base font-bold text-[#34252A] group-hover:text-[#6A1F35] transition-colors">
                        {item.title}
                      </h3>
                    )}

                    {item.craft_medium && (
                      <span className="inline-block text-[10px] font-mono uppercase tracking-wider text-[#B08A50] font-semibold bg-[#F0E7DA] px-2 py-0.5 rounded-md border border-[#E0D4C5]">
                        {item.craft_medium}
                      </span>
                    )}

                    {item.note && (
                      <p className="text-xs text-[#34252A]/80 leading-relaxed bg-[#F0E7DA]/40 p-3 rounded-xl border border-[#E0D4C5]/80">
                        {item.note}
                      </p>
                    )}

                    {item.url && (
                      <div className="pt-1">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-mono text-[#6A1F35] font-semibold hover:underline flex items-center gap-1.5 break-all"
                        >
                          <ExternalLink className="h-3 w-3 shrink-0" />
                          <span>Citation Archive: {item.url}</span>
                        </a>
                      </div>
                    )}

                    {item.posts && (
                      <div className="space-y-1 p-2.5 rounded-xl border border-[#E0D4C5] bg-[#F0E7DA]/30">
                        <span className="font-mono text-[10px] text-[#34252A]/60">
                          Dispatch by @{item.posts.profiles?.handle}:
                        </span>
                        <p className="text-xs text-[#34252A] line-clamp-2">
                          {item.posts.body}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#E0D4C5] font-mono text-[10px] text-[#34252A]/60">
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    {item.attestation_hash ? (
                      <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" />
                        Monad: {item.attestation_hash.slice(0, 10)}...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" />
                        Curator Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Related Cultural Collections Directory */}
      <div className="pt-6 border-t border-[#E0D4C5] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#B08A50] font-bold">
              Explore Living Heritage
            </span>
            <h2 className="font-serif text-xl font-bold text-[#34252A]">
              Other Cultural Collections & Living Archives
            </h2>
          </div>
          <Link
            to="/communities"
            className="text-xs font-mono text-[#6A1F35] font-semibold hover:underline"
          >
            View All Collectives →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CURATED_CULTURAL_COLLECTIONS.filter((c) => c.id !== collection.id).map((other) => (
            <Link
              key={other.id}
              to={`/collections/${other.id}`}
              className="neu-card rounded-2xl bg-[#FAF6EF] border border-[#E0D4C5] overflow-hidden hover:border-[#6A1F35]/40 hover:-translate-y-1 transition-all group flex flex-col justify-between"
            >
              {other.items[0]?.image_url && (
                <div className="w-full h-32 overflow-hidden bg-[#E0D4C5]/30 relative">
                  <img
                    src={other.items[0].image_url}
                    alt={other.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-2 text-[10px] font-mono text-white/90 font-medium">
                    {other.items.length} Artifacts
                  </span>
                </div>
              )}
              <div className="p-4 space-y-1">
                <h4 className="font-serif text-sm font-bold text-[#34252A] group-hover:text-[#6A1F35] transition-colors line-clamp-1">
                  {other.title}
                </h4>
                <p className="text-xs text-[#34252A]/70 line-clamp-2">
                  {other.description}
                </p>
                <div className="pt-2 text-[10px] font-mono text-[#6A1F35] font-semibold">
                  Curated by @{other.owner.handle} →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Propose Modal */}
      <ProposeItemModal
        isOpen={isProposeOpen}
        onClose={() => setIsProposeOpen(false)}
        collectionId={collection.id}
        isPersonal={isPersonal}
        userPosts={userPosts}
      />

      {/* Paid Curation Support Modal */}
      <SupportCuratorModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        curatorId={collection.created_by}
        curatorHandle={collection.profiles?.handle || 'curator'}
        collectionId={collection.id}
        collectionTitle={collection.title}
      />
    </div>
  )
}
