import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, UserPlus, UserCheck, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/useAuth'
import { TagSticker } from '@/components/TagSticker'
import type { TagKind } from '@/lib/threadColors'

interface CommunityWithDetails {
  id: string
  slug: string
  name: string
  description?: string
  membersCount: number
  isMember: boolean
  tags: { id: number; name: string; slug: string; kind: TagKind }[]
}

export function CommunitiesPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [membershipOverrides, setMembershipOverrides] = useState<Record<string, boolean>>({})

  // Fetch communities, tags, and user memberships
  const { data: communities = [], isLoading } = useQuery({
    queryKey: ['communities_list', user?.id],
    queryFn: async () => {
      // 1. Fetch communities
      const { data: commsData, error: commsErr } = await supabase
        .from('communities')
        .select('*')
        .order('name')
      if (commsErr) throw commsErr

      // 2. Fetch community tags
      const { data: commTagsData } = await supabase
        .from('community_tags')
        .select('community_id, tags(id, name, slug, kind)')

      // 3. Fetch all memberships
      const { data: membershipsData } = await supabase
        .from('memberships')
        .select('community_id, user_id')

      const commTagsMap = new Map<string, { id: number; name: string; slug: string; kind: TagKind }[]>()
      if (commTagsData) {
        for (const item of commTagsData) {
          if (!item.community_id || !item.tags) continue
          const current = commTagsMap.get(item.community_id) || []
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          current.push(item.tags as any)
          commTagsMap.set(item.community_id, current)
        }
      }

      const membersCountMap = new Map<string, number>()
      const userJoinedSet = new Set<string>()

      if (membershipsData) {
        for (const m of membershipsData) {
          membersCountMap.set(m.community_id, (membersCountMap.get(m.community_id) || 0) + 1)
          if (user && m.user_id === user.id) {
            userJoinedSet.add(m.community_id)
          }
        }
      }

      return (commsData || []).map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        description: c.description,
        membersCount: membersCountMap.get(c.id) || 0,
        isMember: userJoinedSet.has(c.id),
        tags: commTagsMap.get(c.id) || [],
      })) as CommunityWithDetails[]
    },
  })

  // Join/Leave mutation
  const toggleMembershipMutation = useMutation({
    mutationFn: async ({ communityId, isJoining }: { communityId: string; isJoining: boolean }) => {
      if (!user) throw new Error('Sign in required')
      if (isJoining) {
        const { error } = await supabase
          .from('memberships')
          .insert({ community_id: communityId, user_id: user.id, role: 'member' })
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('memberships')
          .delete()
          .eq('community_id', communityId)
          .eq('user_id', user.id)
        if (error) throw error
      }
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
