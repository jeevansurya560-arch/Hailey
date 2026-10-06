import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Check, Users, Sparkles, Loader2, GitBranch } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/useAuth'
import { TagSticker } from '@/components/TagSticker'
import { PostCard } from '@/features/posts/PostCard'
import { getThreadColor } from '@/lib/threadColors'

export function CulturePage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [exploringOverride, setExploringOverride] = useState(null)

  // 1. Fetch culture tag details, relations, and communities
  const { data: tag, isLoading: isTagLoading } = useQuery({
    queryKey: ['culture_tag', slug, user?.id],
    queryFn: async () => {
      if (!slug) return null

      // Base Tag
      const { data: baseTag, error: tagErr } = await supabase
        .from('tags')
        .select('id, slug, name, kind, description, parent_id')
        .eq('slug', slug)
        .single()
      if (tagErr || !baseTag) throw tagErr || new Error('Tag not found')

      // Parent tag if present
      let parent = null
      if (baseTag.parent_id) {
        const { data: parentData } = await supabase
          .from('tags')
          .select('id, name, slug, kind')
          .eq('id', baseTag.parent_id)
          .maybeSingle()
        parent = parentData
      }

      // Child tags
      const { data: childData } = await supabase
        .from('tags')
        .select('id, name, slug, kind')
        .eq('parent_id', baseTag.id)

      // Related edges
      const { data: edgesData } = await supabase
        .from('tag_edges')
        .select('dst, weight, tags!tag_edges_dst_fkey(id, name, slug, kind)')
        .eq('src', baseTag.id)
        .order('weight', { ascending: false })

      // Linked communities
      const { data: commTags } = await supabase
        .from('community_tags')
        .select('communities(id, name, slug)')
        .eq('tag_id', baseTag.id)

      // User Exploring status
      let isExploring = false
      if (user) {
        const { data: interest } = await supabase
          .from('user_interests')
          .select('weight')
          .eq('user_id', user.id)
          .eq('tag_id', baseTag.id)
          .maybeSingle()
        isExploring = (interest?.weight ?? 0) > 0
      }

      const relatedTags = (edgesData || []).map((e) => ({
        ...e.tags,
        weight: e.weight,
      })).filter(Boolean)

      const linkedCommunities = (commTags || []).map((ct) => ct.communities).filter(Boolean)

      return {
        ...baseTag,
        parent,
        childTags: childData || [],
        relatedTags,
        linkedCommunities,
        isExploring,
      }
    },
  })

  // 2. Fetch posts associated with this tag
  const { data: posts = [], isLoading: isPostsLoading } = useQuery({
    queryKey: ['culture_posts', tag?.id],
    queryFn: async () => {
      if (!tag?.id) return []

      const { data: postTags, error } = await supabase
        .from('post_tags')
        .select(`
          posts (
            id,
            author_id,
            body,
            media_url,
            media_credit,
            source_url,
            is_editorial,
            created_at,
            profiles(handle, display_name),
            communities(slug, name),
            post_tags(tags(id, name, slug, kind))
          )
        `)
        .eq('tag_id', tag.id)
        .limit(20)

      if (error) throw error

      // User reactions
      let userReactions = []
      if (user) {
        const { data: reactionsData } = await supabase
          .from('post_reactions')
          .select('post_id, kind')
          .eq('user_id', user.id)
        userReactions = reactionsData || []
      }

      // Counts
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

      return (postTags || []).map((pt) => {
        const p = pt.posts
        if (!p) return null
        const pReactions = userReactions.filter((r) => r.post_id === p.id)
        const counts = reactionsCountMap.get(p.id) || { likes: 0, saves: 0 }
        const tags = (p.post_tags || []).map((item) => item.tags).filter(Boolean)

        return {
          id: p.id,
          author_id: p.author_id,
          author: p.profiles,
          community: p.communities,
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
            isLiked: pReactions.some((r) => r.kind === 'like'),
            isSaved: pReactions.some((r) => r.kind === 'save'),
            isHidden: pReactions.some((r) => r.kind === 'hide'),
          },
        }
      }).filter(Boolean)
    },
    enabled: !!tag?.id,
  })

  // Toggle Exploring mutation (CULT-04)
  const toggleExploringMutation = useMutation({
    mutationFn: async (shouldExplore) => {
      if (!user || !tag) throw new Error('Sign in required')
      if (shouldExplore) {
        const { error } = await supabase
          .from('user_interests')
          .upsert({ user_id: user.id, tag_id: tag.id, weight: 5, source: 'culture_page' }, { onConflict: 'user_id,tag_id' })
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('user_interests')
          .delete()
          .eq('user_id', user.id)
          .eq('tag_id', tag.id)
        if (error) throw error
      }
    },
    onMutate: (shouldExplore) => {
      setExploringOverride(shouldExplore)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['culture_tag', slug] })
      queryClient.invalidateQueries({ queryKey: ['user_interests', user?.id] })
    },
  })

  if (isTagLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--clay)]" />
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--ink-2)]">
          Loading culture thread...
        </p>
      </div>
    )
  }

  if (!tag) {
    return (
      <div className="border border-[var(--clay)] bg-[var(--paper-2)] p-8 text-center space-y-3">
        <h2 className="font-serif text-2xl font-bold text-[var(--ink)]">Culture Thread Not Found</h2>
        <Link to="/explore" className="font-mono text-xs text-[var(--clay)] underline">
          ← Return to Taxonomy
        </Link>
      </div>
    )
  }

  const isExploring = exploringOverride ?? tag.isExploring

  return (
    <div className="space-y-8">
      {/* Culture Header Card */}
      <div className="border border-[var(--ink)] bg-[var(--paper-2)] p-6 md:p-8 shadow-[var(--shadow-hard)] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span
                className="font-mono text-xs uppercase tracking-widest font-bold px-2 py-0.5 rounded text-white"
                style={{ backgroundColor: getThreadColor(tag.kind) }}
              >
                {tag.kind}
              </span>

              {tag.parent && (
                <div className="flex items-center gap-1 font-mono text-xs text-[var(--ink-2)]">
                  <span>child of</span>
                  <Link
                    to={`/c/${tag.parent.slug}`}
                    className="text-[var(--clay)] font-semibold hover:underline"
                  >
                    {tag.parent.name}
                  </Link>
                </div>
              )}
            </div>

            <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-[var(--ink)]">
              {tag.name}
            </h1>

            {tag.description && (
              <p className="mt-2 text-sm md:text-base text-[var(--ink-2)] max-w-2xl leading-relaxed">
                {tag.description}
              </p>
            )}
          </div>

          {user && (
            <button
              type="button"
              onClick={() => toggleExploringMutation.mutate(!isExploring)}
              disabled={toggleExploringMutation.isPending}
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
        {tag.childTags.length > 0 && (
          <div className="border-t border-[var(--line)] pt-3 space-y-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--ink-2)] font-bold">
              Sub-movements & Variations:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {tag.childTags.map((child) => (
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
        {tag.relatedTags.length > 0 && (
          <div className="border-t border-[var(--line)] pt-3 space-y-2">
            <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[var(--ink-2)] font-bold">
              <GitBranch className="h-3.5 w-3.5 text-[var(--clay)]" />
              <span>Related Cultural Threads (Culture Graph):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {tag.relatedTags.map((rel) => (
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

      {/* Main Grid: Dispatches and Communities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="border-b border-[var(--line)] pb-2 flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-[var(--ink)] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--clay)]" />
              Top Dispatches on {tag.name} ({posts.length})
            </h2>
          </div>

          {isPostsLoading && (
            <div className="py-8 text-center font-mono text-xs text-[var(--ink-2)]">
              Loading dispatches...
            </div>
          )}

          {!isPostsLoading && posts.length === 0 && (
            <div className="border border-dashed border-[var(--line)] p-8 text-center font-mono text-xs text-[var(--ink-2)]">
              No dispatches tagged with {tag.name} yet.
            </div>
          )}

          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={() => {
                  queryClient.invalidateQueries({ queryKey: ['culture_posts', tag.id] })
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
            {tag.linkedCommunities.length === 0 ? (
              <p className="text-xs text-[var(--ink-2)]">No community collectives directly linked.</p>
            ) : (
              <div className="space-y-2">
                {tag.linkedCommunities.map((comm) => (
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
    </div>
  )
}
