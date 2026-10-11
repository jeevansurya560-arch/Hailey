import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Check, Users, Sparkles, Loader2, GitBranch } from 'lucide-react'
import {
  fetchCultureTagBySlug,
  fetchCulturePostsByTag,
  toggleUserInterest,
} from '@/features/communities/services/communityService'
import { fetchCulturalEntityBySlug } from '../services/culturalKnowledgeService'
import { fetchCultureMasterNodeBySlug } from '../services/cultureMasterService'
import { WikipediaCulturalArticle } from '../components/WikipediaCulturalArticle'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { TagSticker } from '@/components/ui/TagSticker'
import { PostCard } from '@/features/posts/components/PostCard'

export function CulturePage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [exploringOverride, setExploringOverride] = useState(null)
  const [activeTab, setActiveTab] = useState('dispatches') // 'dispatches' | 'encyclopedia'

  // 1. Fetch culture tag details, relations, and communities via communityService
  const { data: tag, isLoading: isTagLoading } = useQuery({
    queryKey: ['culture_tag', slug, user?.id],
    queryFn: () => fetchCultureTagBySlug(slug, user?.id),
    enabled: !!slug,
  })

  // 1b. Fetch encyclopedic record
  const { data: culturalEntity } = useQuery({
    queryKey: ['cultural_entity', slug],
    queryFn: () => fetchCulturalEntityBySlug(slug),
    enabled: !!slug,
  })

  // 1c. Fetch 1M Culture Master Dataset node if tag is absent
  const { data: masterNode, isLoading: isMasterLoading } = useQuery({
    queryKey: ['culture_master_node', slug],
    queryFn: () => fetchCultureMasterNodeBySlug(slug),
    enabled: !!slug && !tag,
  })

  // Resolve effective tag and entity from either taxonomy or 1M dataset
  const effectiveTag = tag || (masterNode ? {
    id: masterNode.slug,
    slug: masterNode.slug,
    name: masterNode.name,
    kind: masterNode.kind,
    description: masterNode.description,
    childTags: [],
    relatedTags: [],
    linkedCommunities: masterNode.community_slug ? [{ id: masterNode.community_slug, slug: masterNode.community_slug, name: masterNode.community_slug }] : [],
    isExploring: false,
  } : null)

  const effectiveEntity = culturalEntity || (masterNode ? {
    name: masterNode.name,
    slug: masterNode.slug,
    region: masterNode.origin,
    country: masterNode.origin,
    origins: `Historical and living tradition rooted in ${masterNode.origin}.`,
    summary: masterNode.description,
    history: masterNode.description,
    practices: masterNode.practices?.map((p) => p.name || p) || [],
    timeline: masterNode.timeline || [],
    sources: masterNode.sources || [],
    clothing: masterNode.artifacts?.[0]?.name || null,
    music: masterNode.kind === 'music' ? masterNode.name : null,
  } : null)

  // 2. Fetch posts associated with this tag via communityService (with scoped reactions)
  const { data: posts = [], isLoading: isPostsLoading } = useQuery({
    queryKey: ['culture_posts', effectiveTag?.id, user?.id],
    queryFn: () => fetchCulturePostsByTag(effectiveTag?.id, user?.id),
    enabled: !!effectiveTag?.id && typeof effectiveTag.id === 'number',
  })

  // Toggle Exploring mutation via communityService
  const toggleExploringMutation = useMutation({
    mutationFn: async (shouldExplore) => {
      if (!user || !effectiveTag) throw new Error('Sign in required')
      if (typeof effectiveTag.id !== 'number') return null
      return toggleUserInterest({
        userId: user.id,
        tagId: effectiveTag.id,
        shouldExplore,
      })
    },
    onMutate: (shouldExplore) => {
      setExploringOverride(shouldExplore)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['culture_tag', slug] })
      queryClient.invalidateQueries({ queryKey: ['user_interests', user?.id] })
    },
  })

  if (isTagLoading || (isMasterLoading && !tag)) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3">
        <Loader2 className="h-6 w-6 animate-spin text-[#6A1F35]" />
        <p className="font-mono text-xs uppercase tracking-widest text-[#B08A50] font-semibold">
          Loading culture thread...
        </p>
      </div>
    )
  }

  if (!effectiveTag) {
    return (
      <div className="neu-card rounded-2xl bg-[#FAF6EF] border border-[#E0D4C5] p-8 text-center space-y-3">
        <h2 className="font-serif text-2xl font-bold text-[#34252A]">Culture Thread Not Found</h2>
        <Link to="/explore" className="font-mono text-xs text-[#6A1F35] underline font-semibold">
          ← Return to Taxonomy & 1M Atlas
        </Link>
      </div>
    )
  }

  const isExploring = exploringOverride ?? effectiveTag.isExploring
  const activeTag = effectiveTag

  return (
    <div className="space-y-8">
      {/* Culture Header Card */}
      <div className="neu-card rounded-3xl bg-[#FAF6EF] border border-[#E0D4C5] p-6 md:p-8 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-mono text-xs uppercase tracking-widest font-bold px-3 py-0.5 rounded-full bg-[#6A1F35] text-[#FAF6EF] shadow-xs">
                {activeTag.kind}
              </span>

              {activeTag.parent && (
                <div className="flex items-center gap-1 font-mono text-xs text-[#34252A]/70">
                  <span>child of</span>
                  <Link
                    to={`/c/${activeTag.parent.slug}`}
                    className="text-[#6A1F35] font-semibold hover:underline"
                  >
                    {activeTag.parent.name}
                  </Link>
                </div>
              )}
            </div>

            <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-[#34252A]">
              {activeTag.name}
            </h1>

            {activeTag.description && (
              <p className="mt-2 text-sm md:text-base text-[#34252A]/80 max-w-2xl leading-relaxed">
                {activeTag.description}
              </p>
            )}
          </div>

          {user && (
            <button
              type="button"
              onClick={() => toggleExploringMutation.mutate(!isExploring)}
              disabled={toggleExploringMutation.isPending || typeof activeTag.id !== 'number'}
              className={`flex items-center gap-1.5 px-5 py-2.5 font-mono text-xs uppercase tracking-wider rounded-full border self-start md:self-auto cursor-pointer transition-all ${
                isExploring
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-red-50 hover:text-red-700 hover:border-red-300'
                  : 'neu-burgundy-pill text-[#FAF6EF]'
              }`}
            >
              {isExploring ? (
                <>
                  <Check className="h-4 w-4 stroke-[2.5]" />
                  <span>Exploring</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Add to Exploring</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Child Sub-threads */}
        {activeTag.childTags && activeTag.childTags.length > 0 && (
          <div className="border-t border-[#E0D4C5] pt-3.5 space-y-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#B08A50] font-bold">
              Sub-movements & Variations:
            </span>
            <div className="flex flex-wrap gap-2">
              {activeTag.childTags.map((child) => (
                <Link key={child.id} to={`/c/${child.slug}`}>
                  <TagSticker
                    id={child.id}
                    name={child.name}
                    slug={child.slug}
                    kind={child.kind}
                    size="sm"
                  />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related Topic Edges */}
        {activeTag.relatedTags && activeTag.relatedTags.length > 0 && (
          <div className="border-t border-[#E0D4C5] pt-3.5 space-y-2">
            <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[#B08A50] font-bold">
              <GitBranch className="h-3.5 w-3.5 text-[#6A1F35]" />
              <span>Related Cultural Threads (Culture Graph):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeTag.relatedTags.map((rel) => (
                <Link key={rel.id} to={`/c/${rel.slug}`} className="flex items-center">
                  <TagSticker
                    id={rel.id}
                    name={rel.name}
                    slug={rel.slug}
                    kind={rel.kind}
                    size="sm"
                  />
                  <span className="ml-1.5 font-mono text-[10px] text-[#34252A]/60">
                    ({Math.round(rel.weight * 100)}%)
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* View Switcher: Dispatches vs Encyclopedic Record */}
      <div className="flex items-center gap-2 border-b border-[#E0D4C5] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('dispatches')}
          className={`neu-pill px-4 py-2 font-mono text-xs uppercase tracking-wider rounded-full cursor-pointer transition-all ${
            activeTab === 'dispatches'
              ? 'neu-burgundy-pill text-[#FAF6EF] font-bold'
              : 'bg-[#F0E7DA] text-[#34252A] hover:bg-[#FAF6EF]'
          }`}
        >
          Community Dispatches ({posts.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('encyclopedia')}
          className={`neu-pill px-4 py-2 font-mono text-xs uppercase tracking-wider rounded-full cursor-pointer transition-all ${
            activeTab === 'encyclopedia'
              ? 'neu-burgundy-pill text-[#FAF6EF] font-bold'
              : 'bg-[#F0E7DA] text-[#34252A] hover:bg-[#FAF6EF]'
          }`}
        >
          Encyclopedic Archive {culturalEntity ? '· Verified' : ''}
        </button>
      </div>

      {activeTab === 'encyclopedia' ? (
        <WikipediaCulturalArticle
          entity={
            effectiveEntity || {
              name: activeTag.name,
              summary: activeTag.description || `Living cultural thread of ${activeTag.name}.`,
              history: `Historical genesis and development of ${activeTag.name} within regional and global networks.`,
              origins: `Originated in cultural homelands and traditional practices.`,
              practices: [activeTag.name + ' oral tradition', 'Craft and artifact stewardship'],
              sources: [
                {
                  title: 'Hailey Cultural Living Archives Documentation',
                  author: 'Hailey Protocol',
                  publisher: 'Autonomous Field Guide',
                  year: '2026',
                  license: 'CC-BY-SA-4.0',
                },
              ],
            }
          }
        />
      ) : (
        /* Main Grid: Dispatches and Communities */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="border-b border-[#E0D4C5] pb-2 flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-[#34252A] flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#B08A50]" />
                Top Dispatches on {activeTag.name} ({posts.length})
              </h2>
            </div>

            {isPostsLoading && (
              <div className="py-8 text-center font-mono text-xs text-[#B08A50]">
                Loading dispatches...
              </div>
            )}

            {!isPostsLoading && posts.length === 0 && (
              <div className="neu-inset rounded-2xl bg-[#F0E7DA]/40 border border-[#E0D4C5] p-8 text-center font-mono text-xs text-[#34252A]/60">
                No dispatches tagged with {activeTag.name} yet.
              </div>
            )}

            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onDelete={() => {
                    queryClient.invalidateQueries({ queryKey: ['culture_posts', activeTag.id] })
                  }}
                />
              ))}
            </div>
          </div>

          {/* Linked Communities */}
          <div className="space-y-6">
            <div className="neu-card rounded-2xl bg-[#FAF6EF] border border-[#E0D4C5] p-5 space-y-4">
              <div className="flex items-center gap-2 text-[#6A1F35] border-b border-[#E0D4C5] pb-2.5">
                <Users className="h-4 w-4 text-[#6A1F35]" />
                <h3 className="font-serif text-base font-bold text-[#34252A]">
                  Linked Collectives
                </h3>
              </div>
              {!activeTag.linkedCommunities || activeTag.linkedCommunities.length === 0 ? (
                <p className="text-xs text-[#34252A]/60">No community collectives directly linked.</p>
              ) : (
                <div className="space-y-2">
                  {activeTag.linkedCommunities.map((comm) => (
                    <Link
                      key={comm.id}
                      to={`/communities/${comm.slug}`}
                      className="block p-3 rounded-xl neu-pill bg-[#F0E7DA] border border-[#E0D4C5] hover:border-[#6A1F35]/40 transition-colors"
                    >
                      <span className="font-mono text-xs font-bold text-[#34252A] hover:text-[#6A1F35]">
                        {comm.name}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
