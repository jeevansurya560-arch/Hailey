import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, UserPlus, UserCheck, Loader2 } from 'lucide-react'
import {
  fetchCommunities,
  toggleCommunityMembership,
} from '@/features/communities/services/communityService'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { TagSticker } from '@/components/ui/TagSticker'
import BlurText from '@/components/BlurText'
import { CommunitySubNav } from '../components/CommunitySubNav'

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
      <div className="border-b border-[#E0D4C5] pb-5">
        <div className="flex items-center gap-2 text-[#6A1F35] mb-1.5">
          <Users className="h-5 w-5" />
          <span className="font-mono text-xs uppercase tracking-widest font-bold text-[#B08A50]">
            Communities Directory
          </span>
        </div>
        <BlurText
          as="h1"
          text="Cultural Collectives & Archives"
          delay={110}
          animateBy="words"
          direction="top"
          className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-[#34252A]"
        />
        <p className="mt-1.5 text-sm text-[#34252A]/70 max-w-2xl leading-relaxed">
          Join community collectives curating authentic cultural knowledge and attesting contributions to the Monad ledger.
        </p>
        <div className="mt-4 pt-2">
          <CommunitySubNav />
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <Loader2 className="h-6 w-6 animate-spin text-[#6A1F35]" />
          <p className="font-mono text-xs uppercase tracking-widest text-[#34252A]/60">
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
              className="neu-card rounded-2xl bg-[#FAF6EF] border border-[#E0D4C5] p-6 flex flex-col justify-between space-y-4 hover:-translate-y-0.5 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      to={`/communities/${c.slug}`}
                      className="font-serif text-xl font-bold text-[#34252A] hover:text-[#6A1F35] transition-colors"
                    >
                      {c.name}
                    </Link>
                    <div className="flex items-center gap-2 font-mono text-xs text-[#34252A]/60 mt-0.5">
                      <Users className="h-3.5 w-3.5 text-[#6A1F35]" />
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
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider rounded-full transition-all ${
                        isMember
                          ? 'neu-pill border border-emerald-300 bg-emerald-50/80 text-emerald-800 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300'
                          : 'neu-burgundy-pill text-[#FAF6EF] hover:bg-[#511528]'
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

                <p className="text-xs text-[#34252A]/70 leading-relaxed">
                  {c.description}
                </p>
              </div>

              {c.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[#E0D4C5]/70">
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
