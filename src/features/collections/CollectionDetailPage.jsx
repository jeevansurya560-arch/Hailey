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
} from 'lucide-react'
import {
  fetchCollectionDetail,
  triageCollectionItem,
} from '@/features/collections/services/collectionService'
import { useAuth } from '@/features/auth/useAuth'
import { ProposeItemModal } from './ProposeItemModal'

export function CollectionDetailPage() {
  const { id } = useParams()
  const { user, session } = useAuth()
  const queryClient = useQueryClient()

  const [isProposeOpen, setIsProposeOpen] = useState(false)
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
      <div className="border border-[var(--ink)] bg-[var(--paper-2)] p-6 md:p-8 shadow-[var(--shadow-hard)] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-mono text-[11px] uppercase tracking-widest text-[var(--clay)] font-bold flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                {isPersonal ? 'Personal Archive' : 'Community Collection'}
              </span>

              {collection.communities && (
                <>
                  <span className="text-[var(--ink-2)] font-mono text-xs">in</span>
                  <Link
                    to={`/communities/${collection.communities.slug}`}
                    className="font-mono text-xs text-[var(--clay)] font-bold hover:underline"
                  >
                    {collection.communities.name}
                  </Link>
                </>
              )}
            </div>

            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-[var(--ink)]">
              {collection.title}
            </h1>

            {collection.description && (
              <p className="mt-2 text-sm text-[var(--ink-2)] max-w-2xl leading-relaxed">
                {collection.description}
              </p>
            )}

            <div className="flex items-center gap-3 mt-3 font-mono text-xs text-[var(--ink-2)]">
              <span>
                Curated by{' '}
                <Link
                  to={`/u/${collection.profiles?.handle || 'member'}`}
                  className="font-bold text-[var(--ink)] hover:underline"
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

          {user && (
            <button
              type="button"
              onClick={() => setIsProposeOpen(true)}
              className="flex items-center gap-1.5 border border-[var(--ink)] bg-[var(--clay)] px-4 py-2 font-mono text-xs uppercase tracking-wider text-[var(--paper)] shadow-[2px_2px_0_var(--ink)] hover:opacity-90 transition-all self-start md:self-auto"
            >
              <Plus className="h-4 w-4" />
              <span>{isPersonal ? 'Add Item' : 'Propose Item'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Curator Triage Section (COLL-05 / System Design §8.2) */}
      {isCurator && pendingItems.length > 0 && (
        <div className="border border-[var(--onchain)]/40 bg-purple-950/5 dark:bg-purple-900/10 p-6 shadow-[var(--shadow-hard)] space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[var(--onchain)]" />
              <h2 className="font-serif text-lg font-bold text-[var(--ink)]">
                Curator Triage Queue ({pendingItems.length} pending)
              </h2>
            </div>
            <span className="font-mono text-[10px] uppercase font-bold text-[var(--onchain)] bg-[var(--onchain)]/10 px-2 py-0.5 border border-[var(--onchain)]/20">
              Curator Access
            </span>
          </div>

          <p className="text-xs text-[var(--ink-2)]">
            Review proposed cultural artifacts. Approving creates a verifiable contribution record for onchain Monad attestation.
          </p>

          {triageSuccessMsg && (
            <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 p-2.5 border border-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
              <span>{triageSuccessMsg}</span>
            </div>
          )}

          {triageActionError && (
            <div className="flex items-center gap-2 text-xs text-[var(--clay)] bg-red-50 p-2.5 border border-red-200">
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
                  className="border border-[var(--line)] bg-[var(--paper)] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="uppercase font-bold text-[var(--clay)]">[{item.kind}]</span>
                      <span className="text-[var(--ink-2)]">Proposed by</span>
                      <Link to={`/u/${item.profiles?.handle}`} className="font-bold text-[var(--ink)] hover:underline">
                        @{item.profiles?.handle}
                      </Link>
                      <span className="text-[10px] text-[var(--ink-2)]">
                        · {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {item.url && (
                      <div className="flex items-center gap-1.5 font-mono text-xs text-[var(--clay)]">
                        <ExternalLink className="h-3 w-3 shrink-0" />
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline truncate max-w-md">
                          {item.url}
                        </a>
                      </div>
                    )}

                    {item.note && (
                      <p className="text-xs text-[var(--ink)] italic bg-[var(--paper-2)] p-2 border border-[var(--line)]">
                        "{item.note}"
                      </p>
                    )}

                    {item.posts && (
                      <div className="text-xs text-[var(--ink-2)] line-clamp-2 pl-2 border-l-2 border-[var(--clay)]">
                        Dispatch: {item.posts.body}
                      </div>
                    )}
                  </div>

                  {/* Approve / Reject Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isOwnProposal ? (
                      <span className="font-mono text-[11px] text-[var(--ink-2)] italic bg-gray-100 px-2.5 py-1 border">
                        Self-proposal (waiting for peer curator)
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => triageMutation.mutate({ itemId: item.id, action: 'approve' })}
                          disabled={triageMutation.isPending}
                          className="flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white font-mono text-xs px-3 py-1.5 rounded shadow-[1.5px_1.5px_0_var(--ink)] transition-all"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Approve</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => triageMutation.mutate({ itemId: item.id, action: 'reject' })}
                          disabled={triageMutation.isPending}
                          className="flex items-center gap-1 border border-[var(--line)] bg-[var(--paper)] hover:bg-red-50 hover:text-red-700 font-mono text-xs px-3 py-1.5 text-[var(--ink-2)] transition-all"
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
        <div className="border-b border-[var(--line)] pb-2 flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-[var(--ink)]">
            Archived Items ({approvedItems.length})
          </h2>
        </div>

        {approvedItems.length === 0 && (
          <div className="border border-dashed border-[var(--line)] p-12 text-center font-mono text-xs text-[var(--ink-2)]">
            No items in this collection yet. Propose the first cultural citation above!
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {approvedItems.map((item) => (
            <div
              key={item.id}
              className="border border-[var(--ink)] bg-[var(--paper-2)] p-5 shadow-[var(--shadow-hard)] space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between font-mono text-[11px] border-b border-[var(--line)] pb-2">
                  <span className="flex items-center gap-1 font-bold text-[var(--clay)] uppercase">
                    {item.kind === 'link' && <ExternalLink className="h-3 w-3" />}
                    {item.kind === 'post' && <FileText className="h-3 w-3" />}
                    {item.kind === 'note' && <StickyNote className="h-3 w-3" />}
                    {item.kind}
                  </span>

                  <span className="text-[var(--ink-2)] flex items-center gap-1">
                    <Lock className="h-2.5 w-2.5 text-emerald-700" />
                    Added by @{item.profiles?.handle}
                  </span>
                </div>

                {item.url && (
                  <div>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-[var(--clay)] font-semibold hover:underline flex items-center gap-1 break-all"
                    >
                      <span>{item.url}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                )}

                {item.note && (
                  <p className="text-xs text-[var(--ink)] leading-relaxed bg-[var(--paper)] p-3 border border-[var(--line)]">
                    {item.note}
                  </p>
                )}

                {item.posts && (
                  <div className="space-y-1.5 p-3 border border-[var(--line)] bg-[var(--paper)]">
                    <span className="font-mono text-[10px] text-[var(--ink-2)]">
                      Referenced Dispatch by @{item.posts.profiles?.handle}:
                    </span>
                    <p className="text-xs text-[var(--ink)] line-clamp-3">
                      {item.posts.body}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[var(--line)] font-mono text-[10px] text-[var(--ink-2)]">
                <span>{new Date(item.created_at).toLocaleDateString()}</span>
                <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="h-3 w-3" />
                  Approved
                </span>
              </div>
            </div>
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
    </div>
  )
}
