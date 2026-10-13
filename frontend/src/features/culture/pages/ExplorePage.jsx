import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search,
  LayoutGrid,
  List,
  Sparkles,
  Grid3X3,
  Play,
  Bookmark,
  Loader2,
  AlertCircle,
  FilterX,
  PenSquare,
} from 'lucide-react'
import { fetchExploreDispatches, togglePostReaction } from '@/features/feed/services/feedService'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { PostComposer } from '@/features/posts/components/PostComposer'
import { CulturalPostCard } from '../components/CulturalPostCard'
import { ExploreSidebar } from '../components/ExploreSidebar'
import { VisualStoriesTab } from '../components/VisualStoriesTab'
import { VisualStoryViewer } from '../components/VisualStoryViewer'
import { CollectionsView } from '../components/CollectionsView'
import { createStableFeedSession } from '../utils/feedSessionUtils'
import { DEMO_VIDEO_ASSET_MAP } from '../utils/postParsingUtils'

const PAGE_SIZE = 36

export function ExplorePage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Primary Explore Tabs: 'posts' | 'stories' | 'collections'
  const [activeTab, setActiveTab] = useState('posts')

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCulture, setSelectedCulture] = useState('')
  const [mediaFilter, setMediaFilter] = useState('all') // 'all' | 'video' | 'photo'
  const [sortBy, setSortBy] = useState('newest') // 'newest' | 'most_liked' | 'most_discussed'
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'

  // Post composer toggle & success feedback
  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)

  // Immersive Media Viewer state
  const [activeViewerPostId, setActiveViewerPostId] = useState(null)
  const [sessionSeed] = useState(() => Date.now())

  // Fetch real dispatches with reactions and authors
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['explore_dispatches', searchTerm, selectedCulture, sortBy, user?.id],
    queryFn: () =>
      fetchExploreDispatches({
        query: searchTerm,
        communitySlug: selectedCulture,
        orderBy: sortBy,
        page: 0,
        pageSize: PAGE_SIZE,
        userId: user?.id,
      }),
    staleTime: 1000 * 60 * 5,
  })

  const posts = data?.posts || []
  const totalPostsCount = data?.total || posts.length

  // Stable session sequence ensuring selected post is at index 0, balancing media & authors
  const sessionPosts = useMemo(() => {
    if (!activeViewerPostId || posts.length === 0) return []
    return createStableFeedSession(posts, activeViewerPostId, sessionSeed)
  }, [posts, activeViewerPostId, sessionSeed])

  // Filter by media format (Photos / Videos / All)
  const displayPosts = useMemo(() => {
    if (mediaFilter === 'video') {
      return posts.filter((p) => Boolean(p.is_video || p.video_url || DEMO_VIDEO_ASSET_MAP[p.id]))
    }
    if (mediaFilter === 'photo') {
      return posts.filter((p) => !Boolean(p.is_video || p.video_url || DEMO_VIDEO_ASSET_MAP[p.id]))
    }
    return posts
  }, [posts, mediaFilter])

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async ({ post }) => {
      if (!user) {
        window.location.href = '/login'
        return
      }
      return togglePostReaction({
        userId: user.id,
        postId: post.id,
        kind: 'like',
        isCurrentlyActive: post.reactions?.isLiked,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['explore_dispatches'] })
    },
  })

  // Save/Bookmark mutation
  const saveMutation = useMutation({
    mutationFn: async ({ post }) => {
      if (!user) {
        window.location.href = '/login'
        return
      }
      return togglePostReaction({
        userId: user.id,
        postId: post.id,
        kind: 'save',
        isCurrentlyActive: post.reactions?.isSaved,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['explore_dispatches'] })
    },
  })

  const handleLike = (post) => {
    likeMutation.mutate({ post })
  }

  const handleSave = (post) => {
    saveMutation.mutate({ post })
  }

  const handleShare = (post) => {
    const postUrl = `${window.location.origin}/post/${post.id}`
    if (navigator.share) {
      navigator.share({
        title: post.body?.slice(0, 40) || 'Cultural Dispatch on Hailey',
        url: postUrl,
      }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(postUrl)
    }
  }

  const handleTopicSelect = (query) => {
    setActiveTab('posts')
    setSearchTerm(query)
  }

  return (
    <div className="space-y-6">
      {/* ── Section A: Compact Editorial Page Introduction & Action ── */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
        <div className="space-y-1.5">
          <div className="font-mono text-xs uppercase tracking-widest text-[#B08A50] font-bold">
            EXPLORE FEED · LIVING DISPATCHES
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#34252A] leading-tight">
            Live Cultural Dispatches
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#75666B] max-w-2xl leading-relaxed">
            Real-time ethnographic photography, sacred architecture, festivals, and living crafts documented by verified authors and registered community members.
          </p>
        </div>

        {/* Publish Dispatch CTA */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={() => {
              if (!user) {
                window.location.href = '/login'
              } else {
                setIsComposerOpen((prev) => !prev)
              }
            }}
            className="neu-burgundy-pill inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-white shadow-xs cursor-pointer hover:opacity-95 transition-all"
          >
            <PenSquare className="h-4 w-4" />
            <span>{isComposerOpen ? 'Close Composer' : 'Publish Cultural Dispatch'}</span>
          </button>
        </div>
      </header>

      {/* ── Success Toast Feedback ── */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800 flex items-center justify-between shadow-xs">
          <span>{successMessage}</span>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-900 ml-2 cursor-pointer font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* ── Collapsible Dispatch Composer ── */}
      {isComposerOpen && user && (
        <div className="relative bg-white/60 p-1 rounded-3xl border border-[#E0D4C5]/80 shadow-xs">
          <PostComposer
            onPostCreated={() => {
              setIsComposerOpen(false)
              setSuccessMessage('Your cultural dispatch has been published to Explore!')
              setTimeout(() => setSuccessMessage(null), 6000)
              queryClient.invalidateQueries({ queryKey: ['explore_dispatches'] })
              queryClient.invalidateQueries({ queryKey: ['posts'] })
              refetch()
            }}
          />
        </div>
      )}

      {/* ── Section B: Search and Filter Toolbar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#75666B]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by culture, ritual, craft, or keyword..."
            className="w-full border border-[#E0D4C5] bg-white pl-10 pr-4 py-2.5 text-xs text-[#34252A] placeholder:text-[#75666B] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#6A1F35] shadow-xs"
          />
        </div>

        {/* Culture / Tradition Filter Dropdown */}
        <div className="sm:w-56">
          <select
            value={selectedCulture}
            onChange={(e) => setSelectedCulture(e.target.value)}
            className="w-full border border-[#E0D4C5] bg-white px-3 py-2.5 text-xs text-[#34252A] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#6A1F35] shadow-xs cursor-pointer"
          >
            <option value="">All Living Cultures</option>
            <option value="festivals-pageantry">Festivals & Pageantry</option>
            <option value="sacred-architecture">Sacred Architecture</option>
            <option value="performing-arts">Performing Arts</option>
            <option value="living-heritage">Living Heritage</option>
            <option value="urban-expression">Urban Expression</option>
          </select>
        </div>

        {/* Sort Selector Dropdown */}
        <div className="sm:w-40">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full border border-[#E0D4C5] bg-white px-3 py-2.5 text-xs text-[#34252A] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#6A1F35] shadow-xs cursor-pointer font-medium"
          >
            <option value="newest">Newest First</option>
            <option value="most_liked">Most Liked</option>
            <option value="most_discussed">Most Discussed</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {/* Media Format Filter Dropdown */}
        <div className="sm:w-40">
          <select
            value={mediaFilter}
            onChange={(e) => setMediaFilter(e.target.value)}
            className="w-full border border-[#E0D4C5] bg-white px-3 py-2.5 text-xs text-[#34252A] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#6A1F35] shadow-xs cursor-pointer"
          >
            <option value="all">All Media</option>
            <option value="video">Videos Only</option>
            <option value="photo">Photos Only</option>
          </select>
        </div>
      </div>

      {/* ── Section C: Three Primary Tabs + Result Count + View Toggle ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E0D4C5]/60 pb-3">
        {/* The 3 Tabs Only: Posts, Visual Stories, Collections */}
        <div className="inline-flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'posts'
                ? 'bg-[#6A1F35] text-white neu-burgundy-pill font-semibold'
                : 'text-[#34252A] hover:bg-[#F0E7DA]/60'
            }`}
          >
            <Grid3X3 className="h-3.5 w-3.5" />
            <span>Posts</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stories')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'stories'
                ? 'bg-[#6A1F35] text-white neu-burgundy-pill font-semibold'
                : 'text-[#34252A] hover:bg-[#F0E7DA]/60'
            }`}
          >
            <Play className="h-3.5 w-3.5" />
            <span>Visual Stories</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('collections')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'collections'
                ? 'bg-[#6A1F35] text-white neu-burgundy-pill font-semibold'
                : 'text-[#34252A] hover:bg-[#F0E7DA]/60'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span>Collections</span>
          </button>
        </div>

        {/* Right Controls: Result Count & Grid/List Toggle */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <span className="text-xs font-mono text-[#75666B]">
            {activeTab === 'posts'
              ? `${displayPosts.length} cultural dispatches`
              : activeTab === 'stories'
              ? '6 visual stories'
              : '8 curated collections'}
          </span>

          {activeTab === 'posts' && (
            <div className="flex items-center bg-white border border-[#E0D4C5] rounded-xl p-0.5 shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#6A1F35] text-white'
                    : 'text-[#75666B] hover:text-[#34252A]'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-[#6A1F35] text-white'
                    : 'text-[#75666B] hover:text-[#34252A]'
                }`}
                title="List View"
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Section D: Main Content Area + Right Sidebar Layout (76% / 24%) ── */}
      <div className="flex flex-col lg:flex-row gap-7 items-start">
        {/* Left Main Content Feed */}
        <main className="w-full lg:w-[73%] xl:w-[75%] shrink-0 space-y-6">
          {activeTab === 'posts' && (
            <>
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-24 space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-[#6A1F35]" />
                  <p className="text-xs font-mono uppercase tracking-widest text-[#B08A50] font-semibold">
                    Loading cultural dispatches...
                  </p>
                </div>
              )}

              {isError && (
                <div className="bg-[#FAF6EF] border border-[#6A1F35]/40 rounded-2xl p-8 text-center space-y-3 neu-card">
                  <AlertCircle className="h-8 w-8 text-[#6A1F35] mx-auto" />
                  <h3 className="font-serif text-lg font-bold text-[#34252A]">
                    Unable to load cultural dispatches
                  </h3>
                  <p className="text-xs text-[#75666B] max-w-md mx-auto">
                    {error?.message || 'A network error occurred while querying the cultural repository.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="neu-pill bg-[#6A1F35] text-white px-4 py-2 rounded-full text-xs font-medium inline-flex items-center gap-1.5"
                  >
                    <span>Retry</span>
                  </button>
                </div>
              )}

              {!isLoading && !isError && posts.length === 0 && (
                <div className="bg-white border border-[#E0D4C5] rounded-2xl p-12 text-center space-y-4 neu-card">
                  <FilterX className="h-10 w-10 text-[#B08A50] mx-auto" />
                  <h3 className="font-serif text-lg font-bold text-[#34252A]">
                    {searchTerm || selectedCulture
                      ? 'No matching dispatches found'
                      : 'No community dispatches yet'}
                  </h3>
                  <p className="text-xs text-[#75666B] max-w-sm mx-auto">
                    {searchTerm || selectedCulture
                      ? 'No cultural posts match your search or category filter. Try clearing your filters.'
                      : 'Be the first cultural ethnographer or enthusiast to publish a living tradition dispatch on Hailey.'}
                  </p>
                  {searchTerm || selectedCulture ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm('')
                        setSelectedCulture('')
                      }}
                      className="neu-pill text-xs font-semibold text-[#6A1F35] underline cursor-pointer"
                    >
                      Clear all filters
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (!user) window.location.href = '/login'
                        else setIsComposerOpen(true)
                      }}
                      className="neu-burgundy-pill inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-white cursor-pointer"
                    >
                      <PenSquare className="h-4 w-4" />
                      <span>Publish First Dispatch</span>
                    </button>
                  )}
                </div>
              )}

              {!isLoading && !isError && displayPosts.length > 0 && (
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'
                      : 'space-y-4'
                  }
                >
                  {displayPosts.map((post) => (
                    <CulturalPostCard
                      key={post.id}
                      post={post}
                      onLike={handleLike}
                      onSave={handleSave}
                      onShare={handleShare}
                      onCommentClick={(p) => {
                        window.location.href = `/post/${p.id}`
                      }}
                      onOpenViewer={(p) => setActiveViewerPostId(p.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'stories' && (
            <VisualStoriesTab
              onOpenStory={(storyIdx) => {
                // If stories tab is active, can also pass stories
              }}
            />
          )}

          {activeTab === 'collections' && (
            <CollectionsView />
          )}
        </main>

        {/* Right Sidebar (Trending Topics, Featured Visual Story, Featured Collections) */}
        <aside className="w-full lg:w-[27%] xl:w-[25%] shrink-0">
          <ExploreSidebar
            onSelectTopic={handleTopicSelect}
            onOpenFeaturedStory={() => {
              const featured = posts.find((p) => p.id === 'dispatch-024') || posts[0]
              if (featured) {
                setActiveViewerPostId(featured.id)
              }
            }}
            onOpenCollectionsTab={() => setActiveTab('collections')}
          />
        </aside>
      </div>

      {/* Immersive Portrait Media Viewer Modal */}
      {activeViewerPostId && (
        <VisualStoryViewer
          posts={sessionPosts.length > 0 ? sessionPosts : posts}
          initialPostId={activeViewerPostId}
          onClose={() => setActiveViewerPostId(null)}
        />
      )}
    </div>
  )
}

export default ExplorePage
