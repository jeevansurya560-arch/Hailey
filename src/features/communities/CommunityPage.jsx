import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, UserPlus, UserCheck, Shield, BookOpen, Loader2, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/useAuth'
import { TagSticker } from '@/components/TagSticker'
import { PostCard } from '@/features/posts/PostCard'
import { PostComposer } from '@/features/posts/PostComposer'
import { CreateCollectionModal } from '@/features/collections/CreateCollectionModal'

export function CommunityPage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isMemberOverride, setIsMemberOverride] = useState(null)
  const [isCreateColOpen, setIsCreateColOpen] = useState(false)

  // 1. Fetch community details, curators, and tags
  const { data: community, isLoading: isCommLoading } = useQuery({
    queryKey: ['community', slug, user?.id],
    queryFn: async () => {
      if (!slug) return null

      // Community
      const { data: comm, error } = await supabase
        .from('communities')
        .select('*')
        .eq('slug', slug)
        .single()
      if (error || !comm) throw error || new Error('Community not found')

      // Tags
      const { data: commTags } = await supabase
        .from('community_tags')
        .select('tags(id, name, slug, kind)')
        .eq('community_id', comm.id)

      // Memberships & Curators
      const { data: memberships } = await supabase
        .from('memberships')
        .select('user_id, role, profiles(handle, display_name)')
        .eq('community_id', comm.id)

      const membersCount = memberships?.length || 0
      const isMember = !!(user && memberships?.some((m) => m.user_id === user.id))
      const curators = (memberships || []).filter((m) => m.role === 'curator').map((m) => m.profiles)

      const tags = (commTags || []).map((ct) => ct.tags).filter(Boolean)

      return {
        ...comm,
        membersCount,
        isMember,
        curators,
        tags,
      }
    },
  })

  // 2. Fetch posts in this community
  const { data: posts = [], isLoading: isPostsLoading } = useQuery({
    queryKey: ['community_posts', community?.id],
    queryFn: async () => {
      if (!community?.id) return []

      const { data: postsData, error } = await supabase
        .from('posts')
        .select(`
          id,
          author_id,
          body,
          media_url,
          media_credit,
          source_url,
          is_editorial,
          created_at,
          profiles(handle, display_name),
          post_tags(tags(id, name, slug, kind))
        `)
        .eq('community_id', community.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Fetch user reactions
      let userReactions = []
      if (user) {
        const { data: reactionsData } = await supabase
          .from('post_reactions')
          .select('post_id, kind')
          .eq('user_id', user.id)
        userReactions = reactionsData || []
      }

      // Fetch all reactions counts
      const { data: allReactions } = await supabase.from('post_reactions').select('post_id, kind')

      const reactionsCountMap = new Map()
      if (allReactions) {
        for (const r of allReactions) {
          const current = reactionsCountMap.get(r.post_id) || { likes: 0, saves: 0 }
          if (r.kind === 'like') current.likes++
          if (r.kind === 'save') current.saves++
          reactionsCountMap.set(r.post_id, current)
        }
      }

      return (postsData || []).map((p) => {
        const postReactions = userReactions.filter((r) => r.post_id === p.id)
        const counts = reactionsCountMap.get(p.id) || { likes: 0, saves: 0 }
        const tags = (p.post_tags || []).map((pt) => pt.tags).filter(Boolean)

        return {
          id: p.id,
          author_id: p.author_id,
          author: p.profiles,
          community: { slug: community.slug, name: community.name },
          body: p.body,
          media_url: p.media_url,
          media_credit: p.media_credit,
          source_url: p.source_url,
          is_editorial: p.is_editorial,
          created_at: p.created_at,
          tags,
          reactions: {
            likesCount: counts.likes,
            savesCount: counts.saves,
            isLiked: postReactions.some((r) => r.kind === 'like'),
            isSaved: postReactions.some((r) => r.kind === 'save'),
            isHidden: postReactions.some((r) => r.kind === 'hide'),
          },
        }
      })
    },
    enabled: !!community?.id,
  })

  // 3. Fetch community collections (COLL-01)
  const { data: collections = [] } = useQuery({
    queryKey: ['community_collections', community?.id],
    queryFn: async () => {
      if (!community?.id) return []
      const { data, error } = await supabase
        .from('collections')
        .select(`
          id,
          title,
          description,
          created_at,
          profiles (handle),
          collection_items (count)
        `)
        .eq('community_id', community.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled: !!community?.id,
  })

  // Join/Leave mutation
  const toggleMembershipMutation = useMutation({
    mutationFn: async (isJoining) => {
      if (!user || !community) throw new Error('Sign in required')
      if (isJoining) {
        const { error } = await supabase
          .from('memberships')
          .insert({ community_id: community.id, user_id: user.id, role: 'member' })
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('memberships')
          .delete()
          .eq('community_id', community.id)
          .eq('user_id', user.id)
        if (error) throw error
      }
    },
    onMutate: (isJoining) => {
      setIsMemberOverride(isJoining)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['community', slug] })
    },
  })

  if (isCommLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--clay)]" />
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--ink-2)]">
          Loading community...
        </p>
      </div>
    )
  }

  if (!community) {
    return (
      <div className="border border-[var(--clay)] bg-[var(--paper-2)] p-8 text-center space-y-3">
        <h2 className="font-serif text-2xl font-bold text-[var(--ink)]">Community Not Found</h2>
        <Link to="/communities" className="font-mono text-xs text-[var(--clay)] underline">
          ← Return to Communities Directory
        </Link>
      </div>
    )
  }

  const isMember = isMemberOverride ?? community.isMember

  return (
    <div className="space-y-8">
      {/* Community Header Banner */}
      <div className="border border-[var(--ink)] bg-[var(--paper-2)] p-6 md:p-8 shadow-[var(--shadow-hard)] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[11px] uppercase tracking-widest text-[var(--clay)] font-bold">
                Cultural Collective
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-[var(--ink)]">
              {community.name}
            </h1>
            <p className="mt-2 text-sm text-[var(--ink-2)] max-w-2xl leading-relaxed">
              {community.description}
            </p>
          </div>

          {user && (
            <button
              type="button"
              onClick={() => toggleMembershipMutation.mutate(!isMember)}
              disabled={toggleMembershipMutation.isPending}
              className={`flex items-center gap-1.5 px-4 py-2 font-mono text-xs uppercase tracking-wider rounded-[var(--radius)] border self-start md:self-auto transition-all ${
                isMember
                  ? 'border-[var(--moss)] bg-emerald-50 text-[var(--moss)] hover:bg-red-50 hover:text-red-700 hover:border-red-300'
                  : 'border-[var(--ink)] bg-[var(--clay)] text-[var(--paper)] shadow-[2px_2px_0_var(--ink)] hover:opacity-90'
              }`}
            >
              {isMember ? (
                <>
                  <UserCheck className="h-4 w-4" />
                  <span>Joined Community</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Join Community</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Stats and Curators metadata row */}
        <div className="flex flex-wrap items-center gap-6 border-t border-[var(--line)] pt-4 font-mono text-xs text-[var(--ink-2)]">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-[var(--clay)]" />
            <span>
              <strong>{community.membersCount}</strong> members
            </span>
          </div>

          {community.curators.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-[var(--onchain)]" />
              <span>
                Curators:{' '}
                {community.curators.map((curator) => (
                  <Link
                    key={curator.handle}
                    to={`/u/${curator.handle}`}
                    className="text-[var(--ink)] font-bold hover:underline mr-1.5"
                  >
                    @{curator.handle}
                  </Link>
                ))}
              </span>
            </div>
          )}
        </div>

        {/* Community Topic Tags */}
        {community.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {community.tags.map((tag) => (
              <TagSticker
                key={tag.id}
                id={tag.id}
                name={tag.name}
                slug={tag.slug}
                kind={tag.kind}
                size="sm"
              />
            ))}
          </div>
        )}
      </div>

      {/* Main Content Grid: Posts and Collections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Post Composer & Community Dispatches */}
        <div className="lg:col-span-2 space-y-6">
          <PostComposer
            defaultCommunityId={community.id}
            onPostCreated={() => {
              queryClient.invalidateQueries({ queryKey: ['community_posts', community.id] })
            }}
          />

          <div className="border-b border-[var(--line)] pb-2 flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-[var(--ink)]">
              Community Dispatches ({posts.length})
            </h2>
          </div>

          {isPostsLoading && (
            <div className="py-8 text-center font-mono text-xs text-[var(--ink-2)]">
              Loading dispatches...
            </div>
          )}

          {!isPostsLoading && posts.length === 0 && (
            <div className="border border-dashed border-[var(--line)] p-8 text-center font-mono text-xs text-[var(--ink-2)]">
              No dispatches shared in this community yet. Be the first to publish one!
            </div>
          )}

          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={() => {
                  queryClient.invalidateQueries({ queryKey: ['community_posts', community.id] })
                }}
              />
            ))}
          </div>
        </div>

        {/* Right 1 Col: Collections section (COLL-01 / COLL-06) */}
        <div className="space-y-6">
          <div className="border border-[var(--line)] bg-[var(--paper-2)] p-5 space-y-4 shadow-[var(--shadow-hard)]">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
              <div className="flex items-center gap-2 text-[var(--saffron)]">
                <BookOpen className="h-4 w-4" />
                <h3 className="font-serif text-base font-bold text-[var(--ink)]">
                  Community Collections
                </h3>
              </div>

              {user && (
                <button
                  type="button"
                  onClick={() => setIsCreateColOpen(true)}
                  className="flex items-center gap-1 font-mono text-[11px] font-bold text-[var(--clay)] hover:underline"
                >
                  <Plus className="h-3 w-3" />
                  <span>New</span>
                </button>
              )}
            </div>

            <p className="text-xs text-[var(--ink-2)] leading-relaxed">
              Curated archives and verified contribution sets for this collective.
            </p>

            {collections.length === 0 ? (
              <div className="border border-dashed border-[var(--line)] p-4 text-center font-mono text-[11px] text-[var(--ink-2)]">
                No collections created yet. Start one today!
              </div>
            ) : (
              <div className="space-y-2.5">
                {collections.map((col) => (
                  <Link
                    key={col.id}
                    to={`/collections/${col.id}`}
                    className="block p-3 border border-[var(--line)] bg-[var(--paper)] hover:border-[var(--ink)] transition-all space-y-1 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-sm font-bold text-[var(--ink)] group-hover:text-[var(--clay)] transition-colors">
                        {col.title}
                      </span>
                      <span className="font-mono text-[10px] text-[var(--ink-2)]">
                        {col.collection_items?.[0]?.count || 0} items
                      </span>
                    </div>

                    {col.description && (
                      <p className="text-[11px] text-[var(--ink-2)] line-clamp-2">
                        {col.description}
                      </p>
                    )}

                    <div className="font-mono text-[10px] text-[var(--ink-2)] pt-1">
                      by @{col.profiles?.handle}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Collection Modal */}
      <CreateCollectionModal
        isOpen={isCreateColOpen}
        onClose={() => setIsCreateColOpen(false)}
        communityId={community.id}
        defaultCommunityName={community.name}
      />
    </div>
  )
}
