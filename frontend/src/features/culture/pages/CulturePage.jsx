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
import { RedditCulturalDispatches } from '@/features/reddit/components/RedditCulturalDispatches'
import { RedditErrorBoundary } from '@/features/reddit/components/RedditErrorBoundary'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { TagSticker } from '@/components/ui/TagSticker'
import { PostCard } from '@/features/posts/components/PostCard'
import { getThreadColor } from '@/features/communities/threadColors'

export function CulturePage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [exploringOverride, setExploringOverride] = useState(null)
  const [activeTab, setActiveTab] = useState('dispatches') // 'dispatches' | 'encyclopedia' | 'reddit'

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
        <Loader2 className="h-6 w-6 animate-spin text-[var(--clay)]" />
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--ink-2)]">
          Loading culture thread...
        </p>
      </div>
    )
  }

  if (!effectiveTag) {
    return (
      <div className="border border-[var(--clay)] bg-[var(--paper-2)] p-8 text-center space-y-3">
        <h2 className="font-serif text-2xl font-bold text-[var(--ink)]">Culture Thread Not Found</h2>
        <Link to="/explore" className="font-mono text-xs text-[var(--clay)] underline">
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
      <div className="border border-[var(--ink)] bg-[var(--paper-2)] p-6 md:p-8 shadow-[var(--shadow-hard)] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span
                className="font-mono text-xs uppercase tracking-widest font-bold px-2 py-0.5 rounded text-white"
                style={{ backgroundColor: getThreadColor(activeTag.kind) }}
              >
                {activeTag.kind}
              </span>

              {activeTag.parent && (
                <div className="flex items-center gap-1 font-mono text-xs text-[var(--ink-2)]">
                  <span>child of</span>
                  <Link
                    to={`/c/${activeTag.parent.slug}`}
                    className="text-[var(--clay)] font-semibold hover:underline"
                  >
                    {activeTag.parent.name}
                  </Link>
                </div>
              )}
            </div>

            <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-[var(--ink)]">
              {activeTag.name}
            </h1>

            {activeTag.description && (
              <p className="mt-2 text-sm md:text-base text-[var(--ink-2)] max-w-2xl leading-relaxed">
                {activeTag.description}
              </p>
            )}
          </div>

          {user && (
            <button
              type="button"
              onClick={() => toggleExploringMutation.mutate(!isExploring)}
              disabled={toggleExploringMutation.isPending || typeof activeTag.id !== 'number'}
              className={`flex items-center gap-1.5 px-4 py-2 font-mono text-xs uppercase tracking-wider rounded-[var(--radius)] border self-start md:self-auto transition-all ${
                isExploring
                  ? 'border-[var(--moss)] bg-emerald-50 text-[var(--moss)] hover:bg-red-50 hover:text-red-700 hover:border-red-300'
                  : 'border-[var(--ink)] bg-[var(--clay)] text-[var(--paper)] shadow-[2px_2px_0_var(--ink)] hover:opacity-90'
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
          <div className="border-t border-[var(--line)] pt-3 space-y-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--ink-2)] font-bold">
              Sub-movements & Variations:
            </span>
            <div className="flex flex-wrap gap-1.5">
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
          <div className="border-t border-[var(--line)] pt-3 space-y-2">
            <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[var(--ink-2)] font-bold">
              <GitBranch className="h-3.5 w-3.5 text-[var(--clay)]" />
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
                  <span className="ml-1 font-mono text-[9px] text-[var(--ink-2)]">
                    ({Math.round(rel.weight * 100)}%)
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* View Switcher: Dispatches vs Encyclopedic Record vs Reddit Field Archives */}
      <div className="flex items-center gap-2 border-b border-[var(--line)] pb-2 flex-wrap">
        <button
          type="button"
          onClick={() => setActiveTab('dispatches')}
          className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider rounded transition-all ${
            activeTab === 'dispatches'
              ? 'bg-[var(--ink)] text-[var(--paper)] font-bold shadow-[2px_2px_0_var(--ink)]'
              : 'text-[var(--ink-2)] hover:text-[var(--ink)]'
          }`}
        >
          Community Dispatches ({posts.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('encyclopedia')}
          className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider rounded transition-all ${
            activeTab === 'encyclopedia'
              ? 'bg-[var(--clay)] text-[var(--paper)] font-bold shadow-[2px_2px_0_var(--ink)]'
              : 'text-[var(--ink-2)] hover:text-[var(--clay)]'
          }`}
        >
          Encyclopedic Archive {culturalEntity ? '· Verified' : ''}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reddit')}
          className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider rounded transition-all flex items-center gap-1.5 ${
            activeTab === 'reddit'
              ? 'bg-[#FF4500] text-white font-bold shadow-[2px_2px_0_var(--ink)]'
              : 'text-[var(--ink-2)] hover:text-[#FF4500]'
          }`}
        >
          <span>Reddit Field Archives</span>
        </button>
      </div>

      {activeTab === 'reddit' ? (
        <RedditErrorBoundary>
          <RedditCulturalDispatches
            culturalTopic={activeTag.name}
            defaultQuery={activeTag.name}
            initialSubreddit="Folklore"
          />
        </RedditErrorBoundary>
      ) : activeTab === 'encyclopedia' ? (
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
            <div className="border-b border-[var(--line)] pb-2 flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-[var(--ink)] flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[var(--clay)]" />
                Top Dispatches on {activeTag.name} ({posts.length})
              </h2>
            </div>

          {isPostsLoading && (
            <div className="py-8 text-center font-mono text-xs text-[var(--ink-2)]">
              Loading dispatches...
            </div>
          )}

          {!isPostsLoading && posts.length === 0 && (
            <div className="border border-dashed border-[var(--line)] p-8 text-center font-mono text-xs text-[var(--ink-2)]">
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
          <div className="border border-[var(--line)] bg-[var(--paper-2)] p-5 space-y-4">
            <div className="flex items-center gap-2 text-[var(--clay)] border-b border-[var(--line)] pb-2">
              <Users className="h-4 w-4" />
              <h3 className="font-serif text-base font-bold text-[var(--ink)]">
                Linked Collectives
              </h3>
            </div>
            {!activeTag.linkedCommunities || activeTag.linkedCommunities.length === 0 ? (
              <p className="text-xs text-[var(--ink-2)]">No community collectives directly linked.</p>
            ) : (
              <div className="space-y-2">
                {activeTag.linkedCommunities.map((comm) => (
                  <Link
                    key={comm.id}
                    to={`/communities/${comm.slug}`}
                    className="block p-2 border border-[var(--line)] bg-[var(--paper)] hover:border-[var(--ink)] transition-colors"
                  >
                    <span className="font-mono text-xs font-bold text-[var(--ink)]">
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
