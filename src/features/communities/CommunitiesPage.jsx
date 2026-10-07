import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, UserPlus, UserCheck, Loader2 } from 'lucide-react'
import {
  fetchCommunities,
  toggleCommunityMembership,
} from '@/features/communities/services/communityService'
import { useAuth } from '@/features/auth/useAuth'
import { TagSticker } from '@/components/TagSticker'

export function CommunitiesPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [membershipOverrides, setMembershipOverrides] = useState({})

  // Fetch communities, tags, and user memberships via communityService
  const { data: communities = [], isLoading } = useQuery({
    queryKey: ['communities_list', user?.id],
    queryFn: () => fetchCommunities(user?.id),
  })

  // Join/Leave mutation via communityService
  const toggleMembershipMutation = useMutation({
    mutationFn: async ({ communityId, isJoining }) => {
      if (!user) throw new Error('Sign in required')
      return toggleCommunityMembership({
        communityId,
        userId: user.id,
        isJoining,
      })
    },
    onMutate: ({ communityId, isJoining }) => {
      setMembershipOverrides((prev) => ({ ...prev, [communityId]: isJoining }))
    },
    onError: (_err, { communityId }) => {
      setMembershipOverrides((prev) => {
        const next = { ...prev }
        delete next[communityId]
        return next
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['communities_list'] })
    },
  })

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--line)] pb-4">
        <div className="flex items-center gap-2 text-[var(--clay)] mb-1">
          <Users className="h-5 w-5" />
          <span className="font-mono text-xs uppercase tracking-widest font-bold">
            Communities Directory
          </span>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-[var(--ink)]">
          Cultural Collectives & Archives
        </h1>
        <p className="mt-1 text-sm text-[var(--ink-2)] max-w-2xl">
          Join community collectives curating authentic cultural knowledge and attesting contributions to the Monad ledger.
        </p>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--clay)]" />
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--ink-2)]">
            Loading communities...
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {communities.map((c) => {
          const isMember = membershipOverrides[c.id] ?? c.isMember
          return (
            <div
              key={c.id}
              className="border border-[var(--ink)] bg-[var(--paper-2)] p-6 shadow-[var(--shadow-hard)] flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      to={`/communities/${c.slug}`}
                      className="font-serif text-xl font-bold text-[var(--ink)] hover:text-[var(--clay)] transition-colors"
                    >
                      {c.name}
                    </Link>
                    <div className="flex items-center gap-2 font-mono text-xs text-[var(--ink-2)] mt-0.5">
                      <Users className="h-3.5 w-3.5 text-[var(--clay)]" />
                      <span>{c.membersCount} {c.membersCount === 1 ? 'member' : 'members'}</span>
                    </div>
                  </div>

                  {user && (
                    <button
                      type="button"
                      onClick={() =>
                        toggleMembershipMutation.mutate({
                          communityId: c.id,
                          isJoining: !isMember,
                        })
                      }
                      disabled={toggleMembershipMutation.isPending}
                      className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs uppercase tracking-wider rounded-[var(--radius)] border transition-all ${
                        isMember
                          ? 'border-[var(--moss)] bg-emerald-50 text-[var(--moss)] hover:bg-red-50 hover:text-red-700 hover:border-red-300'
                          : 'border-[var(--ink)] bg-[var(--clay)] text-[var(--paper)] shadow-[2px_2px_0_var(--ink)] hover:opacity-90'
                      }`}
                    >
                      {isMember ? (
                        <>
                          <UserCheck className="h-3.5 w-3.5" />
                          <span>Joined</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-3.5 w-3.5" />
                          <span>Join</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <p className="text-xs text-[var(--ink-2)] leading-relaxed">
                  {c.description}
                </p>
              </div>

              {c.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[var(--line)]">
                  {c.tags.map((t) => (
                    <TagSticker
                      key={t.id}
                      id={t.id}
                      name={t.name}
                      slug={t.slug}
                      kind={t.kind}
                      size="sm"
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
