import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, UserPlus, UserCheck, Shield, BookOpen, Loader2, Plus } from 'lucide-react'
import {
  fetchCommunityBySlug,
  fetchCommunityPosts,
  toggleCommunityMembership,
} from '@/features/communities/services/communityService'
import { fetchCommunityCollections } from '@/features/collections/services/collectionService'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { TagSticker } from '@/components/ui/TagSticker'
import { PostCard } from '@/features/posts/components/PostCard'
import { PostComposer } from '@/features/posts/components/PostComposer'
import { CreateCollectionModal } from '@/features/collections/components/CreateCollectionModal'

export function CommunityPage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isMemberOverride, setIsMemberOverride] = useState(null)
  const [isCreateColOpen, setIsCreateColOpen] = useState(false)

  // 1. Fetch community details, curators, and tags via communityService
  const { data: community, isLoading: isCommLoading } = useQuery({
    queryKey: ['community', slug, user?.id],
    queryFn: () => fetchCommunityBySlug(slug, user?.id),
    enabled: !!slug,
  })

  // 2. Fetch posts in this community with scoped reactions via communityService
  const { data: posts = [], isLoading: isPostsLoading } = useQuery({
    queryKey: ['community_posts', community?.id, user?.id],
    queryFn: () => fetchCommunityPosts(community, user?.id),
    enabled: !!community?.id,
  })

  // 3. Fetch community collections via collectionService
  const { data: collections = [] } = useQuery({
    queryKey: ['community_collections', community?.id],
    queryFn: () => fetchCommunityCollections(community?.id),
    enabled: !!community?.id,
  })

  // Join/Leave mutation via communityService
  const toggleMembershipMutation = useMutation({
    mutationFn: async (isJoining) => {
      if (!user || !community) throw new Error('Sign in required')
      return toggleCommunityMembership({
        communityId: community.id,
        userId: user.id,
        isJoining,
      })
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
      <div className="neu-card rounded-3xl bg-[#F0E7DA]/60 border border-[#E0D4C5] p-6 md:p-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#B08A50] font-bold">
                Cultural Collective
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-[#34252A]">
              {community.name}
            </h1>
            <p className="mt-2 text-sm text-[#34252A]/75 max-w-2xl leading-relaxed">
              {community.description}
            </p>
          </div>

          {user && (
            <button
              type="button"
              onClick={() => toggleMembershipMutation.mutate(!isMember)}
              disabled={toggleMembershipMutation.isPending}
              className={`flex items-center gap-1.5 px-4 py-2 font-mono text-xs uppercase tracking-wider rounded-full self-start md:self-auto transition-all ${
                isMember
                  ? 'neu-pill border border-emerald-300 bg-emerald-50/80 text-emerald-800 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300'
                  : 'neu-burgundy-pill text-[#FAF6EF] hover:bg-[#511528]'
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
        <div className="flex flex-wrap items-center gap-6 border-t border-[#E0D4C5] pt-4 font-mono text-xs text-[#34252A]/70">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-[#6A1F35]" />
            <span>
              <strong className="text-[#34252A]">{community.membersCount}</strong> members
            </span>
          </div>

          {community.curators.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-[#B08A50]" />
              <span>
                Curators:{' '}
                {community.curators.map((curator) => (
                  <Link
                    key={curator.handle}
                    to={`/u/${curator.handle}`}
                    className="text-[#6A1F35] font-bold hover:underline mr-1.5"
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

          <div className="border-b border-[#E0D4C5] pb-2 flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-[#34252A]">
              Community Dispatches ({posts.length})
            </h2>
          </div>

          {isPostsLoading && (
            <div className="py-8 text-center font-mono text-xs text-[#34252A]/50">
              Loading dispatches...
            </div>
          )}

          {!isPostsLoading && posts.length === 0 && (
            <div className="neu-card rounded-2xl bg-[#FAF6EF] border border-dashed border-[#E0D4C5] p-8 text-center font-mono text-xs text-[#34252A]/60">
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
          <div className="neu-card rounded-2xl bg-[#FAF6EF] border border-[#E0D4C5] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E0D4C5] pb-2.5">
              <div className="flex items-center gap-2 text-[#6A1F35]">
                <BookOpen className="h-4 w-4" />
                <h3 className="font-serif text-base font-bold text-[#34252A]">
                  Community Collections
                </h3>
              </div>

              {user && (
                <button
                  type="button"
                  onClick={() => setIsCreateColOpen(true)}
                  className="flex items-center gap-1 font-mono text-[11px] font-bold text-[#6A1F35] hover:text-[#511528] transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  <span>New</span>
                </button>
              )}
            </div>

            <p className="text-xs text-[#34252A]/65 leading-relaxed">
              Curated archives and verified contribution sets for this collective.
            </p>

            {collections.length === 0 ? (
              <div className="border border-dashed border-[#E0D4C5] rounded-xl p-4 text-center font-mono text-[11px] text-[#34252A]/60">
                No collections created yet. Start one today!
              </div>
            ) : (
              <div className="space-y-2.5">
                {collections.map((col) => (
                  <Link
                    key={col.id}
                    to={`/collections/${col.id}`}
                    className="block p-3.5 rounded-xl border border-[#E0D4C5] bg-[#F0E7DA]/40 hover:bg-[#F0E7DA]/70 hover:border-[#6A1F35]/40 transition-all space-y-1 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-sm font-bold text-[#34252A] group-hover:text-[#6A1F35] transition-colors">
                        {col.title}
                      </span>
                      <span className="font-mono text-[10px] text-[#34252A]/60">
                        {col.collection_items?.[0]?.count || 0} items
                      </span>
                    </div>

                    {col.description && (
                      <p className="text-[11px] text-[#34252A]/70 line-clamp-2">
                        {col.description}
                      </p>
                    )}

                    {/* Cultural Artifact Product Thumbnails Strip */}
                    {col.preview_thumbnails && col.preview_thumbnails.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-1 overflow-hidden">
                        {col.preview_thumbnails.slice(0, 3).map((thumb, idx) => (
                          <div
                            key={idx}
                            className="h-12 w-12 rounded-lg overflow-hidden bg-[#E0D4C5]/40 shrink-0 border border-[#E0D4C5]"
                          >
                            <img
                              src={thumb}
                              alt="Artifact Thumbnail"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              loading="lazy"
                            />
                          </div>
                        ))}
                        {col.preview_thumbnails.length > 3 && (
                          <div className="h-12 w-8 rounded-lg bg-[#E0D4C5]/60 flex items-center justify-center text-[10px] font-mono text-[#6A1F35] font-bold shrink-0">
                            +{col.preview_thumbnails.length - 3}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="font-mono text-[10px] text-[#34252A]/50 pt-1">
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
