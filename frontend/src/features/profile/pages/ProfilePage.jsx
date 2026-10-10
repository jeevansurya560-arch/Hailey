import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ShieldCheck,
  Lock,
  Globe,
  MapPin,
  Link2,
  Loader2,
  ExternalLink,
  Compass,
  Users,
  Grid,
  List,
  BarChart3,
  MessageSquare,
  Share2,
  Check,
  Edit3,
  Award,
} from 'lucide-react'
import {
  fetchProfileByHandle,
  fetchProfileById,
  fetchUserInterests,
  fetchUserMemberships,
  fetchUserContributions,
  fetchUserPosts,
  fetchFollowStats,
  toggleFollow,
} from '@/features/profile/services/profileService'
import { fetchCreatorAnalytics } from '@/features/analytics/services/analyticsService'
import { ReachEngagementScatterPlot } from '@/features/analytics/components/ReachEngagementScatterPlot'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { LazyWalletSection } from '@/features/wallet/components/LazyWalletSection'
import { TagSticker } from '@/components/ui/TagSticker'
import { CuratorEarningsCard } from '@/features/payments/components/CuratorEarningsCard'
import { PostCard } from '@/features/posts/components/PostCard'
import { EditProfileModal } from '../components/EditProfileModal'

export function ProfilePage() {
  const { handle } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState('posts') // 'posts' | 'analytics' | 'threads' | 'collectives' | 'attestations'
  const [viewMode, setViewMode] = useState('feed') // 'feed' | 'grid'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [copiedProfile, setCopiedProfile] = useState(false)

  // 1. Fetch profile by handle (or fallback to user profile if 'me')
  const isMeRoute = handle === 'me'
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile', handle, user?.id],
    queryFn: async () => {
      if (isMeRoute && user?.id) {
        return fetchProfileById(user.id)
      }
      return fetchProfileByHandle(handle)
    },
    enabled: !!handle || (isMeRoute && !!user?.id),
  })

  const isOwnProfile = user && profile && user.id === profile.id

  // 2. Fetch author's posts
  const { data: userPosts = [], isLoading: isPostsLoading } = useQuery({
    queryKey: ['profile_posts', profile?.id],
    queryFn: () => fetchUserPosts(profile.id),
    enabled: !!profile?.id,
  })

  // 3. Fetch follow statistics
  const { data: followStats = { followersCount: 0, followingCount: 0, isFollowing: false } } =
    useQuery({
      queryKey: ['profile_follow_stats', profile?.id, user?.id],
      queryFn: () => fetchFollowStats(profile.id, user?.id),
      enabled: !!profile?.id,
    })

  // 4. Fetch user's exploring topics (user_interests)
  const { data: userInterests = [] } = useQuery({
    queryKey: ['profile_interests', profile?.id],
    queryFn: () => fetchUserInterests(profile.id),
    enabled: !!profile?.id,
  })

  // 5. Fetch user's community memberships
  const { data: memberships = [] } = useQuery({
    queryKey: ['profile_memberships', profile?.id],
    queryFn: () => fetchUserMemberships(profile.id),
    enabled: !!profile?.id,
  })

  // 6. Fetch user's verified contributions
  const { data: contributions = [] } = useQuery({
    queryKey: ['profile_contributions', profile?.id],
    queryFn: () => fetchUserContributions(profile.id),
    enabled: !!profile?.id,
  })

  // 7. Fetch creator analytics for integrated analytics tab
  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ['profile_creator_analytics', profile?.id],
    queryFn: () => fetchCreatorAnalytics(profile.id),
    enabled: !!profile?.id && activeTab === 'analytics',
  })

  // Follow / Unfollow mutation
  const handleToggleFollow = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    try {
      await toggleFollow({
        currentUserId: user.id,
        targetUserId: profile.id,
        isCurrentlyFollowing: followStats.isFollowing,
      })
      queryClient.invalidateQueries({ queryKey: ['profile_follow_stats', profile.id, user.id] })
    } catch (err) {
      alert('Follow action failed: ' + err.message)
    }
  }

  // Share profile URL
  const handleShareProfile = async () => {
    const url = window.location.href
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
      }
      setCopiedProfile(true)
      setTimeout(() => setCopiedProfile(false), 2500)
    } catch (err) {
      console.warn('Share profile failed:', err)
    }
  }

  // Message author
  const handleMessageAuthor = () => {
    if (!user) {
      navigate('/login')
      return
    }
    navigate(`/messages?with=${profile.id}`)
  }

  if (isProfileLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--clay)]" />
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--ink-2)]">
          Loading cultural profile...
        </p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="border border-[var(--clay)] bg-[var(--paper-2)] p-12 text-center space-y-4 max-w-lg mx-auto shadow-[var(--shadow-hard)]">
        <h2 className="font-serif text-2xl font-bold text-[var(--ink)]">Profile Not Found</h2>
        <p className="text-xs font-mono text-[var(--ink-2)]">
          The requested cultural contributor @{handle} does not exist or has not claimed their profile yet.
        </p>
        <Link
          to="/"
          className="inline-block border border-[var(--ink)] bg-[var(--clay)] text-[var(--paper)] px-4 py-2 font-mono text-xs uppercase font-bold shadow-[1.5px_1.5px_0_var(--ink)]"
        >
          ← Return to Field Guide Home
        </Link>
      </div>
    )
  }

  const attestedCount = contributions.filter((c) => c.status === 'attested').length

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* ─── Instagram-Grade Profile Header ─────────────────────────── */}
      <div className="border border-[var(--ink)] bg-[var(--paper-2)] p-6 md:p-8 shadow-[var(--shadow-hard)] space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
          {/* Avatar (Instagram Circle Style) */}
          <div className="relative group shrink-0">
            <div className="h-24 w-24 md:h-28 md:w-28 rounded-full border-2 border-[var(--ink)] bg-[var(--paper)] overflow-hidden shadow-[2px_2px_0_var(--ink)] flex items-center justify-center">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.handle}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-serif text-3xl font-black text-[var(--clay)] uppercase">
                  {(profile.handle || 'H').slice(0, 2)}
                </span>
              )}
            </div>

            {isOwnProfile && (
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="absolute bottom-0 right-0 p-1.5 rounded-full border border-[var(--ink)] bg-[var(--clay)] text-[var(--paper)] shadow-sm hover:scale-105 transition-transform"
                title="Edit profile photo"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Details & Actions */}
          <div className="flex-1 space-y-4 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-[var(--ink)]">
                  @{profile.handle}
                </h1>

                {profile.is_editorial && (
                  <span className="inline-flex items-center gap-1 rounded bg-[var(--clay)] px-2 py-0.5 font-mono text-[9px] uppercase font-bold text-[var(--paper)]">
                    <ShieldCheck className="h-3 w-3" />
                    Editorial
                  </span>
                )}

                <span className="inline-flex items-center gap-1 border border-emerald-800/30 bg-emerald-50 px-2 py-0.5 rounded font-mono text-[10px] text-emerald-800 font-semibold">
                  <Lock className="h-2.5 w-2.5" />
                  RLS Verified
                </span>
              </div>

              {/* Action Buttons Bar */}
              <div className="flex items-center gap-2 flex-wrap">
                {isOwnProfile ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(true)}
                      className="border border-[var(--ink)] bg-[var(--paper)] px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider font-bold text-[var(--ink)] hover:bg-[var(--paper-2)] transition-colors shadow-[1.5px_1.5px_0_var(--ink)] flex items-center gap-1.5"
                    >
                      <Edit3 className="h-3 w-3 text-[var(--clay)]" />
                      <span>Edit Profile</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleShareProfile}
                      className="border border-[var(--line)] bg-[var(--paper)] px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-[var(--ink)] hover:border-[var(--ink)] transition-colors flex items-center gap-1"
                      title="Copy profile link"
                    >
                      {copiedProfile ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="h-3.5 w-3.5 text-[var(--ink-2)]" />
                          <span>Share</span>
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleToggleFollow}
                      className={`border border-[var(--ink)] px-4 py-1.5 font-mono text-xs uppercase tracking-wider font-bold transition-all shadow-[1.5px_1.5px_0_var(--ink)] ${
                        followStats.isFollowing
                          ? 'bg-[var(--paper)] text-[var(--ink)] hover:bg-red-50 hover:text-red-700'
                          : 'bg-[var(--clay)] text-[var(--paper)] hover:opacity-90'
                      }`}
                    >
                      {followStats.isFollowing ? 'Following' : 'Follow'}
                    </button>

                    <button
                      type="button"
                      onClick={handleMessageAuthor}
                      className="border border-[var(--ink)] bg-[var(--paper)] px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider font-bold text-[var(--ink)] hover:bg-[var(--paper-2)] transition-colors shadow-[1.5px_1.5px_0_var(--ink)] flex items-center gap-1.5"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-[var(--clay)]" />
                      <span>Message</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleShareProfile}
                      className="border border-[var(--line)] bg-[var(--paper)] p-2 text-[var(--ink)] hover:border-[var(--ink)] transition-colors"
                      title="Share Profile"
                    >
                      {copiedProfile ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Share2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Instagram Counters Bar */}
            <div className="flex items-center gap-6 md:gap-8 font-mono text-xs border-y border-[var(--line)] py-2.5">
              <div>
                <strong className="font-serif text-sm md:text-base font-bold text-[var(--ink)] mr-1">
                  {userPosts.length}
                </strong>
                <span className="text-[var(--ink-2)]">dispatches</span>
              </div>
              <div>
                <strong className="font-serif text-sm md:text-base font-bold text-[var(--ink)] mr-1">
                  {followStats.followersCount}
                </strong>
                <span className="text-[var(--ink-2)]">followers</span>
              </div>
              <div>
                <strong className="font-serif text-sm md:text-base font-bold text-[var(--ink)] mr-1">
                  {followStats.followingCount}
                </strong>
                <span className="text-[var(--ink-2)]">following</span>
              </div>
              <div>
                <strong className="font-serif text-sm md:text-base font-bold text-[var(--ink)] mr-1">
                  {attestedCount}
                </strong>
                <span className="text-[var(--ink-2)]">attested</span>
              </div>
            </div>

            {/* Bio & Profile Metadata */}
            <div className="space-y-2 text-xs">
              {profile.display_name && (
                <p className="font-serif font-bold text-sm text-[var(--ink)]">
                  {profile.display_name}
                </p>
              )}

              {profile.bio ? (
                <p className="text-[var(--ink)] whitespace-pre-wrap leading-relaxed max-w-xl font-sans text-xs">
                  {profile.bio}
                </p>
              ) : (
                isOwnProfile && (
                  <p className="text-[var(--ink-2)] italic font-mono text-[11px]">
                    No bio added yet. Click "Edit Profile" to share your cultural focus with the network!
                  </p>
                )
              )}

              <div className="flex flex-wrap items-center gap-4 text-[var(--ink-2)] font-mono text-[11px] pt-1">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-[var(--clay)]" />
                    <span>{profile.location}</span>
                  </div>
                )}

                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[var(--clay)] hover:underline font-bold"
                  >
                    <Globe className="h-3 w-3" />
                    <span>{profile.website.replace(/^https?:\/\//, '')}</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                )}

                {profile.wallet_address && (
                  <div className="flex items-center gap-1 text-[var(--onchain)] font-semibold">
                    <Link2 className="h-3 w-3" />
                    <span>
                      {profile.wallet_address.slice(0, 6)}...{profile.wallet_address.slice(-4)}
                    </span>
                    <Link
                      to={`/verify/${profile.wallet_address}`}
                      className="ml-1 text-[10px] text-[var(--clay)] hover:underline"
                    >
                      (Ledger →)
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Curator Revenue Dashboard & Wallet Connect (if own profile) */}
        {isOwnProfile && (
          <div className="pt-4 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-3">
            <LazyWalletSection profile={profile} />
            <div className="flex items-center gap-2 border border-[var(--onchain)]/30 bg-[var(--paper)] px-3 py-1.5 text-xs shadow-[1.5px_1.5px_0_var(--ink)]">
              <ShieldCheck className="h-4 w-4 text-[var(--onchain)]" />
              <span className="font-mono text-[11px] text-[var(--ink)]">
                Onchain Attestations: <strong>{attestedCount}</strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ─── Instagram-Grade Navigation Tabs ─────────────────────────── */}
      <div className="border-b border-[var(--line)] flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('posts')}
            className={`font-mono text-xs uppercase tracking-wider py-3 px-1 border-b-2 font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'posts'
                ? 'border-[var(--clay)] text-[var(--clay)]'
                : 'border-transparent text-[var(--ink-2)] hover:text-[var(--ink)]'
            }`}
          >
            <Grid className="h-3.5 w-3.5" />
            <span>Dispatches ({userPosts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`font-mono text-xs uppercase tracking-wider py-3 px-1 border-b-2 font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'border-[var(--clay)] text-[var(--clay)]'
                : 'border-transparent text-[var(--ink-2)] hover:text-[var(--ink)]'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Integrated Analytics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('threads')}
            className={`font-mono text-xs uppercase tracking-wider py-3 px-1 border-b-2 font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'threads'
                ? 'border-[var(--clay)] text-[var(--clay)]'
                : 'border-transparent text-[var(--ink-2)] hover:text-[var(--ink)]'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Threads ({userInterests.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('collectives')}
            className={`font-mono text-xs uppercase tracking-wider py-3 px-1 border-b-2 font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'collectives'
                ? 'border-[var(--clay)] text-[var(--clay)]'
                : 'border-transparent text-[var(--ink-2)] hover:text-[var(--ink)]'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Collectives ({memberships.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('attestations')}
            className={`font-mono text-xs uppercase tracking-wider py-3 px-1 border-b-2 font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'attestations'
                ? 'border-[var(--clay)] text-[var(--clay)]'
                : 'border-transparent text-[var(--ink-2)] hover:text-[var(--ink)]'
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>Attestations ({contributions.length})</span>
          </button>
        </div>

        {activeTab === 'posts' && userPosts.length > 0 && (
          <div className="hidden sm:flex items-center gap-1 border border-[var(--line)] bg-[var(--paper-2)] p-0.5 rounded">
            <button
              type="button"
              onClick={() => setViewMode('feed')}
              className={`p-1 rounded ${viewMode === 'feed' ? 'bg-[var(--paper)] text-[var(--ink)] shadow-sm' : 'text-[var(--ink-2)]'}`}
              title="Feed View"
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded ${viewMode === 'grid' ? 'bg-[var(--paper)] text-[var(--ink)] shadow-sm' : 'text-[var(--ink-2)]'}`}
              title="Grid View"
            >
              <Grid className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ─── Tab Content 1: Dispatches / Posts ──────────────────────── */}
      {activeTab === 'posts' && (
        <div className="space-y-6">
          {isPostsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-5 w-5 animate-spin text-[var(--clay)]" />
            </div>
          ) : userPosts.length === 0 ? (
            <div className="border border-dashed border-[var(--line)] bg-[var(--paper-2)] p-12 text-center space-y-3">
              <div className="h-10 w-10 mx-auto rounded-full border border-[var(--ink-2)] flex items-center justify-center">
                <Grid className="h-5 w-5 text-[var(--ink-2)]" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[var(--ink)]">
                No Dispatches Yet
              </h3>
              <p className="text-xs font-mono text-[var(--ink-2)] max-w-sm mx-auto">
                {isOwnProfile
                  ? 'You have not published any cultural dispatches yet. Share documentation or archival discoveries from the Home feed.'
                  : `@${profile.handle} has not published any dispatches yet.`}
              </p>
              {isOwnProfile && (
                <Link
                  to="/"
                  className="inline-block border border-[var(--ink)] bg-[var(--clay)] text-[var(--paper)] px-4 py-2 font-mono text-xs uppercase font-bold shadow-[1.5px_1.5px_0_var(--ink)] mt-2"
                >
                  Create First Dispatch →
                </Link>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            /* Instagram Photo Grid */
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {userPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/post/${post.id}`}
                  className="group relative aspect-square border border-[var(--ink)] bg-[var(--paper-2)] overflow-hidden shadow-[1.5px_1.5px_0_var(--ink)]"
                >
                  {post.media_url ? (
                    <img
                      src={post.media_url}
                      alt="Dispatch"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full p-4 flex flex-col justify-between bg-[var(--paper)]">
                      <p className="text-xs font-serif line-clamp-4 text-[var(--ink)] leading-relaxed">
                        {post.body}
                      </p>
                      <span className="font-mono text-[9px] uppercase text-[var(--clay)] font-bold">
                        Read Dispatch →
                      </span>
                    </div>
                  )}

                  {/* Hover Overlay with Likes & Comments */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-mono text-xs font-bold">
                    <span className="flex items-center gap-1">
                      ❤️ {post.reactions?.likesCount ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      💬 {post.reactions?.commentsCount ?? 0}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* Feed List View */
            <div className="space-y-6">
              {userPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onDelete={() => {
                    queryClient.invalidateQueries({ queryKey: ['profile_posts', profile.id] })
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Tab Content 2: Integrated Creator Analytics ─────────────── */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Revenue Card if own profile */}
          {isOwnProfile && <CuratorEarningsCard />}

          {isAnalyticsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--clay)]" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Analytics Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border border-[var(--ink)] bg-[var(--paper-2)] p-4 shadow-[2px_2px_0_var(--ink)] space-y-1">
                  <span className="font-mono text-[10px] text-[var(--ink-2)] uppercase tracking-wider block">
                    Total Reach
                  </span>
                  <span className="font-serif text-2xl font-bold text-[var(--ink)]">
                    {analytics?.empty ? '0' : analytics?.totalReach}
                  </span>
                  <span className="font-mono text-[10px] text-[var(--moss)] block">Verified views</span>
                </div>

                <div className="border border-[var(--ink)] bg-[var(--paper-2)] p-4 shadow-[2px_2px_0_var(--ink)] space-y-1">
                  <span className="font-mono text-[10px] text-[var(--ink-2)] uppercase tracking-wider block">
                    Engagement Rate
                  </span>
                  <span className="font-serif text-2xl font-bold text-[var(--ink)]">
                    {analytics?.empty ? '0.0%' : `${analytics?.avgEngagementRate}%`}
                  </span>
                  <span className="font-mono text-[10px] text-[var(--indigo)] block">Reactions / Reach</span>
                </div>

                <div className="border border-[var(--ink)] bg-[var(--paper-2)] p-4 shadow-[2px_2px_0_var(--ink)] space-y-1">
                  <span className="font-mono text-[10px] text-[var(--ink-2)] uppercase tracking-wider block">
                    Cultural Posts
                  </span>
                  <span className="font-serif text-2xl font-bold text-[var(--ink)]">
                    {userPosts.length}
                  </span>
                  <span className="font-mono text-[10px] text-[var(--saffron)] block">Published dispatches</span>
                </div>

                <div className="border border-[var(--ink)] bg-[var(--paper-2)] p-4 shadow-[2px_2px_0_var(--ink)] space-y-1">
                  <span className="font-mono text-[10px] text-[var(--ink-2)] uppercase tracking-wider block">
                    Onchain Attested
                  </span>
                  <span className="font-serif text-2xl font-bold text-[var(--ink)]">
                    {attestedCount}
                  </span>
                  <span className="font-mono text-[10px] text-purple-700 block">Monad L1 seals</span>
                </div>
              </div>

              {/* Scatter Plot */}
              <ReachEngagementScatterPlot
                points={analytics?.scatterPoints || []}
                empty={analytics?.empty}
                emptyReason={analytics?.reason}
              />
            </div>
          )}
        </div>
      )}

      {/* ─── Tab Content 3: Exploring Threads ────────────────────────── */}
      {activeTab === 'threads' && (
        <div className="border border-[var(--line)] bg-[var(--paper-2)] p-6 space-y-4 shadow-[var(--shadow-hard)]">
          <div className="flex items-center gap-2 text-[var(--clay)] border-b border-[var(--line)] pb-2">
            <Compass className="h-4 w-4" />
            <h2 className="font-serif text-base font-bold text-[var(--ink)]">
              Exploring Cultural Taxonomy ({userInterests.length})
            </h2>
          </div>
          {userInterests.length === 0 ? (
            <p className="text-xs font-mono text-[var(--ink-2)] py-4">
              No threads selected yet. Visit the Explore section to tag topics.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 pt-1">
              {userInterests.map((t) => (
                <Link key={t.id} to={`/c/${t.slug}`}>
                  <TagSticker
                    id={t.id}
                    name={t.name}
                    slug={t.slug}
                    kind={t.kind}
                    size="sm"
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Tab Content 4: Collectives & Memberships ─────────────────── */}
      {activeTab === 'collectives' && (
        <div className="border border-[var(--line)] bg-[var(--paper-2)] p-6 space-y-4 shadow-[var(--shadow-hard)]">
          <div className="flex items-center gap-2 text-[var(--clay)] border-b border-[var(--line)] pb-2">
            <Users className="h-4 w-4" />
            <h2 className="font-serif text-base font-bold text-[var(--ink)]">
              Collective Memberships ({memberships.length})
            </h2>
          </div>
          {memberships.length === 0 ? (
            <p className="text-xs font-mono text-[var(--ink-2)] py-4">
              No community memberships joined yet.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2.5 pt-1">
              {memberships.map((m) => (
                <Link
                  key={m.id}
                  to={`/communities/${m.slug}`}
                  className="inline-flex items-center gap-2 border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2 font-mono text-xs text-[var(--ink)] hover:border-[var(--ink)] shadow-[1px_1px_0_var(--line)] transition-all"
                >
                  <span className="font-bold">{m.name}</span>
                  {m.role === 'curator' && (
                    <span className="bg-[var(--onchain)]/20 text-[var(--onchain)] text-[9px] px-1.5 py-0.2 rounded font-bold uppercase">
                      Curator
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Tab Content 5: Attestations & Ledger ─────────────────────── */}
      {activeTab === 'attestations' && (
        <div className="border border-[var(--ink)] bg-[var(--paper-2)] p-6 shadow-[var(--shadow-hard)] space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[var(--onchain)]" />
              <h2 className="font-serif text-xl font-bold text-[var(--ink)]">
                Verified Onchain Contributions ({contributions.length})
              </h2>
            </div>

            {profile.wallet_address && (
              <Link
                to={`/verify/${profile.wallet_address}`}
                className="font-mono text-xs text-[var(--clay)] hover:underline flex items-center gap-1 font-bold"
              >
                <span>Onchain Ledger Verification</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>

          {contributions.length === 0 ? (
            <div className="border border-dashed border-[var(--line)] p-8 text-center text-xs text-[var(--ink-2)] font-mono">
              No contributions submitted or verified yet. Submit citations to community collections to earn verifiable onchain stamps.
            </div>
          ) : (
            <div className="space-y-3">
              {contributions.map((c) => (
                <div
                  key={c.id}
                  className="border border-[var(--line)] bg-[var(--paper)] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-[1px_1px_0_var(--line)]"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="font-bold text-[var(--clay)]">
                        Collective: {c.communities?.name || 'Global'}
                      </span>
                      <span className="text-[10px] text-[var(--ink-2)]">
                        · {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {c.collection_items?.url && (
                      <a
                        href={c.collection_items.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-[var(--clay)] hover:underline flex items-center gap-1 truncate max-w-lg"
                      >
                        <span>{c.collection_items.url}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>

                  <span
                    className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded font-bold self-start md:self-center ${
                      c.status === 'attested'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Edit Profile Modal ─────────────────────────────────────── */}
      <EditProfileModal
        profile={profile}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdated={() => {
          queryClient.invalidateQueries({ queryKey: ['profile'] })
        }}
      />
    </div>
  )
}
export default ProfilePage
