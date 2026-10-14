import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
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
  Bookmark,
  User,
} from 'lucide-react'
import {
  fetchProfileByHandle,
  ensureUserProfile,
  fetchUserSavedPosts,
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
import { EditProfileErrorBoundary } from '../components/EditProfileErrorBoundary'
import { UserAvatar } from '@/components/ui/UserAvatar'

export function ProfilePage() {
  const { handle } = useParams()
  const { user, loading: isAuthLoading } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') || 'posts'
  const [activeTab, setActiveTab] = useState(initialTab) // 'posts' | 'saved' | 'analytics' | 'threads' | 'collectives' | 'attestations'
  const [viewMode, setViewMode] = useState('feed') // 'feed' | 'grid'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [copiedProfile, setCopiedProfile] = useState(false)

  // Sync tab if query parameter changes
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && ['posts', 'saved', 'analytics', 'threads', 'collectives', 'attestations'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  // 1. Fetch profile by handle or authenticated user session
  const isOwnRoute = !handle || handle === 'me'
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile', handle, user?.id],
    queryFn: async () => {
      if (isOwnRoute) {
        if (!user) return null
        return ensureUserProfile(user)
      }
      let prof = await fetchProfileByHandle(handle)
      if (!prof && user) {
        const userHandle = user.user_metadata?.handle || user.email?.split('@')[0]
        if (handle === userHandle || handle === user.id) {
          prof = await ensureUserProfile(user)
        }
      }
      return prof
    },
    enabled: (!isOwnRoute && !!handle) || (isOwnRoute && !isAuthLoading),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const isOwnProfile = !!(user && profile && (user.id === profile.id || isOwnRoute))

  // 2. Fetch author's posts
  const { data: userPosts = [], isLoading: isPostsLoading } = useQuery({
    queryKey: ['profile_posts', profile?.id],
    queryFn: () => fetchUserPosts(profile.id),
    enabled: !!profile?.id,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  // 3. Fetch user's saved posts (only for own profile)
  const { data: savedPosts = [], isLoading: isSavedLoading } = useQuery({
    queryKey: ['profile_saved_posts', profile?.id],
    queryFn: () => fetchUserSavedPosts(profile.id),
    enabled: !!profile?.id && isOwnProfile,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  // 3. Fetch follow statistics
  const { data: followStats = { followersCount: 0, followingCount: 0, isFollowing: false } } =
    useQuery({
      queryKey: ['profile_follow_stats', profile?.id, user?.id],
      queryFn: () => fetchFollowStats(profile.id, user?.id),
      enabled: !!profile?.id,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
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
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
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

  if (isAuthLoading || (isProfileLoading && !profile)) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--clay)]" />
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--ink-2)]">
          Loading cultural profile...
        </p>
      </div>
    )
  }

  if (isOwnRoute && !user) {
    return (
      <div className="border border-[#E0D4C5]/80 bg-white rounded-2xl p-12 text-center space-y-5 max-w-lg mx-auto neu-card">
        <div className="h-14 w-14 mx-auto rounded-full bg-[#FAF6EF] border border-[#E0D4C5] flex items-center justify-center">
          <User className="h-7 w-7 text-[#6A1F35]" />
        </div>
        <div className="space-y-1.5">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#34252A]">
            Field Guide Passport
          </h2>
          <p className="text-xs font-sans text-[#75666B] leading-relaxed">
            Sign in to view your cultural dispatches, saved archives, creator analytics, and field notes.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/login"
            className="w-full sm:w-auto bg-[#6A1F35] hover:bg-[#511528] text-white px-6 py-2.5 rounded-full font-sans text-xs font-bold shadow-xs transition-colors"
          >
            Sign In / Register
          </Link>
          <Link
            to="/explore"
            className="w-full sm:w-auto border border-[#E0D4C5] bg-[#FAF6EF] hover:bg-[#F0E7DA] text-[#34252A] px-5 py-2.5 rounded-full font-sans text-xs font-bold transition-colors"
          >
            Explore Field Guide →
          </Link>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="border border-[#E0D4C5]/80 bg-white rounded-2xl p-12 text-center space-y-4 max-w-lg mx-auto neu-card">
        <h2 className="font-serif text-2xl font-bold text-[#34252A]">Profile Not Found</h2>
        <p className="text-xs font-sans text-[#75666B]">
          The requested cultural contributor @{handle || 'unknown'} does not exist or has not claimed their profile yet.
        </p>
        <Link
          to="/"
          className="inline-block bg-[#6A1F35] hover:bg-[#511528] text-white px-5 py-2.5 rounded-full font-sans text-xs font-bold shadow-xs transition-colors"
        >
          ← Return to Field Guide Home
        </Link>
      </div>
    )
  }

  const attestedCount = contributions.filter((c) => c.status === 'attested').length

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* ─── Profile Header Card ─────────────────────────── */}
      <div className="bg-white rounded-2xl md:rounded-3xl border border-[#E0D4C5]/80 p-6 md:p-8 neu-card space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
          {/* Avatar (Circle Style) */}
          <div className="relative group shrink-0">
            <UserAvatar
              src={profile.avatar_url}
              handle={profile.handle}
              displayName={profile.display_name}
              size="2xl"
              className="ring-4 ring-[#FAF6EF] shadow-md border border-[#E0D4C5]"
            />

            {isOwnProfile && (
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-[#6A1F35] text-white shadow-md hover:bg-[#511528] hover:scale-105 transition-all"
                title="Edit profile photo"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Details & Actions */}
          <div className="flex-1 space-y-3 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#34252A]">
                  @{profile.handle}
                </h1>

                {profile.is_editorial && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#6A1F35] px-2.5 py-0.5 text-[10px] uppercase font-bold text-white shadow-xs">
                    <ShieldCheck className="h-3 w-3" />
                    Editorial
                  </span>
                )}

                <span className="inline-flex items-center gap-1 border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 rounded-full text-[10px] text-emerald-800 font-semibold shadow-xs">
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
                      className="border border-[#E0D4C5] bg-[#FAF6EF] hover:bg-[#F0E7DA] px-4 py-1.5 rounded-full text-xs font-semibold text-[#34252A] hover:border-[#6A1F35]/40 transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-[#6A1F35]" />
                      <span>Edit Profile</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleShareProfile}
                      className="border border-[#E0D4C5] bg-[#FAF6EF] hover:bg-[#F0E7DA] px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#34252A] hover:border-[#6A1F35]/40 transition-all shadow-xs flex items-center gap-1.5"
                      title="Copy profile link"
                    >
                      {copiedProfile ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="h-3.5 w-3.5 text-[#75666B]" />
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
                      className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-xs ${
                        followStats.isFollowing
                          ? 'border border-[#E0D4C5] bg-[#FAF6EF] text-[#34252A] hover:bg-red-50 hover:text-red-700'
                          : 'bg-[#6A1F35] text-white hover:bg-[#511528]'
                      }`}
                    >
                      {followStats.isFollowing ? 'Following' : 'Follow'}
                    </button>

                    <button
                      type="button"
                      onClick={handleMessageAuthor}
                      className="border border-[#E0D4C5] bg-[#FAF6EF] hover:bg-[#F0E7DA] px-4 py-1.5 rounded-full text-xs font-semibold text-[#34252A] hover:border-[#6A1F35]/40 transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-[#6A1F35]" />
                      <span>Message</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleShareProfile}
                      className="border border-[#E0D4C5] bg-[#FAF6EF] hover:bg-[#F0E7DA] p-2 rounded-full text-[#34252A] hover:border-[#6A1F35]/40 transition-all shadow-xs"
                      title="Share Profile"
                    >
                      {copiedProfile ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Share2 className="h-3.5 w-3.5 text-[#75666B]" />
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Counters Bar */}
            <div className="flex items-center gap-6 md:gap-8 text-xs border-y border-[#E0D4C5]/60 py-3 my-3">
              <div>
                <strong className="font-serif text-sm md:text-base font-bold text-[#34252A] mr-1">
                  {userPosts.length}
                </strong>
                <span className="font-sans text-xs text-[#75666B]">dispatches</span>
              </div>
              <div>
                <strong className="font-serif text-sm md:text-base font-bold text-[#34252A] mr-1">
                  {followStats.followersCount}
                </strong>
                <span className="font-sans text-xs text-[#75666B]">followers</span>
              </div>
              <div>
                <strong className="font-serif text-sm md:text-base font-bold text-[#34252A] mr-1">
                  {followStats.followingCount}
                </strong>
                <span className="font-sans text-xs text-[#75666B]">following</span>
              </div>
              <div>
                <strong className="font-serif text-sm md:text-base font-bold text-[#34252A] mr-1">
                  {attestedCount}
                </strong>
                <span className="font-sans text-xs text-[#75666B]">attested</span>
              </div>
            </div>

            {/* Bio & Profile Metadata */}
            <div className="space-y-2 text-xs">
              {profile.display_name && (
                <p className="font-serif font-bold text-base text-[#34252A]">
                  {profile.display_name}
                </p>
              )}

              {profile.bio ? (
                <p className="text-[#34252A]/90 whitespace-pre-wrap leading-relaxed max-w-xl font-sans text-xs sm:text-sm">
                  {profile.bio}
                </p>
              ) : (
                isOwnProfile && (
                  <p className="text-[#75666B] italic font-sans text-xs">
                    No bio added yet. Click &quot;Edit Profile&quot; to share your cultural focus with the network!
                  </p>
                )
              )}

              <div className="flex flex-wrap items-center gap-4 text-[#75666B] font-sans text-xs pt-1">
                {profile.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[#6A1F35]" />
                    <span>{profile.location}</span>
                  </div>
                )}

                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[#6A1F35] hover:text-[#511528] hover:underline font-semibold"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <span>{profile.website.replace(/^https?:\/\//, '')}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}

                {profile.wallet_address && (
                  <div className="flex items-center gap-1.5 text-[#6A1F35] font-semibold">
                    <Link2 className="h-3.5 w-3.5" />
                    <span>
                      {profile.wallet_address.slice(0, 6)}...{profile.wallet_address.slice(-4)}
                    </span>
                    <Link
                      to={`/verify/${profile.wallet_address}`}
                      className="ml-1 text-[11px] text-[#B08A50] hover:underline"
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
          <div className="pt-4 border-t border-[#E0D4C5]/60 flex flex-wrap items-center justify-between gap-3">
            <LazyWalletSection profile={profile} />
            <div className="flex items-center gap-2 border border-[#E0D4C5] bg-[#FAF6EF] px-3.5 py-1.5 rounded-full text-xs shadow-xs">
              <ShieldCheck className="h-4 w-4 text-[#6A1F35]" />
              <span className="font-sans text-xs text-[#34252A]">
                Onchain Attestations: <strong>{attestedCount}</strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ─── Navigation Tabs ─────────────────────────── */}
      <div className="border-b border-[#E0D4C5] flex items-center justify-between pb-1">
        <div className="flex items-center gap-2 md:gap-6 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('posts')}
            className={`text-xs uppercase tracking-wider py-3 px-2 border-b-2 font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'posts'
                ? 'border-[#6A1F35] text-[#6A1F35]'
                : 'border-transparent text-[#75666B] hover:text-[#34252A]'
            }`}
          >
            <Grid className="h-3.5 w-3.5" />
            <span>Dispatches ({userPosts.length})</span>
          </button>

          {isOwnProfile && (
            <button
              type="button"
              onClick={() => setActiveTab('saved')}
              className={`text-xs uppercase tracking-wider py-3 px-2 border-b-2 font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'saved'
                  ? 'border-[#6A1F35] text-[#6A1F35]'
                  : 'border-transparent text-[#75666B] hover:text-[#34252A]'
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span>Saved ({savedPosts.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`text-xs uppercase tracking-wider py-3 px-2 border-b-2 font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'border-[#6A1F35] text-[#6A1F35]'
                : 'border-transparent text-[#75666B] hover:text-[#34252A]'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Integrated Analytics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('threads')}
            className={`text-xs uppercase tracking-wider py-3 px-2 border-b-2 font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'threads'
                ? 'border-[#6A1F35] text-[#6A1F35]'
                : 'border-transparent text-[#75666B] hover:text-[#34252A]'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Threads ({userInterests.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('collectives')}
            className={`text-xs uppercase tracking-wider py-3 px-2 border-b-2 font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'collectives'
                ? 'border-[#6A1F35] text-[#6A1F35]'
                : 'border-transparent text-[#75666B] hover:text-[#34252A]'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Collectives ({memberships.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('attestations')}
            className={`text-xs uppercase tracking-wider py-3 px-2 border-b-2 font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'attestations'
                ? 'border-[#6A1F35] text-[#6A1F35]'
                : 'border-transparent text-[#75666B] hover:text-[#34252A]'
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>Attestations ({contributions.length})</span>
          </button>
        </div>

        {((activeTab === 'posts' && userPosts.length > 0) || (activeTab === 'saved' && savedPosts.length > 0)) && (
          <div className="hidden sm:flex items-center gap-1 border border-[#E0D4C5] bg-white p-1 rounded-xl shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode('feed')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'feed'
                  ? 'bg-[#6A1F35] text-white shadow-xs'
                  : 'text-[#75666B] hover:text-[#34252A]'
              }`}
              title="Feed View"
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[#6A1F35] text-white shadow-xs'
                  : 'text-[#75666B] hover:text-[#34252A]'
              }`}
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
              <Loader2 className="h-6 w-6 animate-spin text-[#6A1F35]" />
            </div>
          ) : userPosts.length === 0 ? (
            <div className="border border-dashed border-[#E0D4C5] bg-white rounded-2xl p-12 text-center space-y-3 neu-card">
              <div className="h-12 w-12 mx-auto rounded-full bg-[#FAF6EF] border border-[#E0D4C5] flex items-center justify-center">
                <Grid className="h-5 w-5 text-[#6A1F35]" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#34252A]">
                No Dispatches Yet
              </h3>
              <p className="text-xs font-sans text-[#75666B] max-w-sm mx-auto">
                {isOwnProfile
                  ? 'You have not published any cultural dispatches yet. Share documentation or archival discoveries from the Explore feed.'
                  : `@${profile.handle} has not published any dispatches yet.`}
              </p>
              {isOwnProfile && (
                <Link
                  to="/explore"
                  className="inline-block bg-[#6A1F35] hover:bg-[#511528] text-white px-5 py-2 rounded-full font-sans text-xs font-semibold shadow-xs mt-2 transition-colors"
                >
                  Explore Archives →
                </Link>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            /* Photo Grid */
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {userPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/post/${post.id}`}
                  className="group relative aspect-square rounded-2xl border border-[#E0D4C5]/80 bg-[#FAF6EF] overflow-hidden neu-card"
                >
                  {post.media_url ? (
                    <img
                      src={post.media_url}
                      alt="Dispatch"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full p-4 flex flex-col justify-between bg-[#FAF6EF]">
                      <p className="text-xs font-serif line-clamp-4 text-[#34252A] leading-relaxed">
                        {post.body}
                      </p>
                      <span className="font-sans text-[10px] uppercase text-[#6A1F35] font-bold">
                        Read Dispatch →
                      </span>
                    </div>
                  )}

                  {/* Hover Overlay with Likes & Comments */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-sans text-xs font-bold">
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

      {/* ─── Tab Content: Saved Posts ─────────────────────────────────── */}
      {activeTab === 'saved' && (
        <div className="space-y-6">
          {isSavedLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-[#6A1F35]" />
            </div>
          ) : savedPosts.length === 0 ? (
            <div className="border border-dashed border-[#E0D4C5] bg-white rounded-2xl p-12 text-center space-y-3 neu-card">
              <div className="h-12 w-12 mx-auto rounded-full bg-[#FAF6EF] border border-[#E0D4C5] flex items-center justify-center">
                <Bookmark className="h-5 w-5 text-[#6A1F35]" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#34252A]">
                No Saved Dispatches
              </h3>
              <p className="text-xs font-sans text-[#75666B] max-w-sm mx-auto">
                Bookmark cultural dispatches from the Explore feed to curate your private research archive.
              </p>
              <Link
                to="/explore"
                className="inline-block bg-[#6A1F35] hover:bg-[#511528] text-white px-5 py-2 rounded-full font-sans text-xs font-semibold shadow-xs mt-2 transition-colors"
              >
                Explore Living Archives →
              </Link>
            </div>
          ) : viewMode === 'grid' ? (
            /* Saved Grid */
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {savedPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/post/${post.id}`}
                  className="group relative aspect-square rounded-2xl border border-[#E0D4C5]/80 bg-[#FAF6EF] overflow-hidden neu-card"
                >
                  {post.media_url ? (
                    <img
                      src={post.media_url}
                      alt="Saved Dispatch"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full p-4 flex flex-col justify-between bg-[#FAF6EF]">
                      <p className="text-xs font-serif line-clamp-4 text-[#34252A] leading-relaxed">
                        {post.body}
                      </p>
                      <span className="font-sans text-[10px] uppercase text-[#6A1F35] font-bold">
                        Read Dispatch →
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-sans text-xs font-bold">
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
            /* Saved Feed */
            <div className="space-y-6">
              {savedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onDelete={() => {
                    queryClient.invalidateQueries({ queryKey: ['profile_saved_posts', profile.id] })
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
              <Loader2 className="h-6 w-6 animate-spin text-[#6A1F35]" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Analytics Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border border-[#E0D4C5]/80 bg-white rounded-2xl p-4 neu-card space-y-1">
                  <span className="font-sans text-[10px] text-[#75666B] uppercase tracking-wider block font-semibold">
                    Total Reach
                  </span>
                  <span className="font-serif text-2xl font-bold text-[#34252A]">
                    {analytics?.empty ? '0' : analytics?.totalReach}
                  </span>
                  <span className="font-sans text-[10px] text-emerald-700 block">Verified views</span>
                </div>

                <div className="border border-[#E0D4C5]/80 bg-white rounded-2xl p-4 neu-card space-y-1">
                  <span className="font-sans text-[10px] text-[#75666B] uppercase tracking-wider block font-semibold">
                    Engagement Rate
                  </span>
                  <span className="font-serif text-2xl font-bold text-[#34252A]">
                    {analytics?.empty ? '0.0%' : `${analytics?.avgEngagementRate}%`}
                  </span>
                  <span className="font-sans text-[10px] text-indigo-700 block">Reactions / Reach</span>
                </div>

                <div className="border border-[#E0D4C5]/80 bg-white rounded-2xl p-4 neu-card space-y-1">
                  <span className="font-sans text-[10px] text-[#75666B] uppercase tracking-wider block font-semibold">
                    Cultural Posts
                  </span>
                  <span className="font-serif text-2xl font-bold text-[#34252A]">
                    {userPosts.length}
                  </span>
                  <span className="font-sans text-[10px] text-[#B08A50] block">Published dispatches</span>
                </div>

                <div className="border border-[#E0D4C5]/80 bg-white rounded-2xl p-4 neu-card space-y-1">
                  <span className="font-sans text-[10px] text-[#75666B] uppercase tracking-wider block font-semibold">
                    Onchain Attested
                  </span>
                  <span className="font-serif text-2xl font-bold text-[#34252A]">
                    {attestedCount}
                  </span>
                  <span className="font-sans text-[10px] text-purple-700 block">Monad L1 seals</span>
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
        <div className="border border-[#E0D4C5]/80 bg-white rounded-2xl p-6 space-y-4 neu-card">
          <div className="flex items-center gap-2 text-[#6A1F35] border-b border-[#E0D4C5]/60 pb-3">
            <Compass className="h-4 w-4" />
            <h2 className="font-serif text-base font-bold text-[#34252A]">
              Exploring Cultural Taxonomy ({userInterests.length})
            </h2>
          </div>
          {userInterests.length === 0 ? (
            <p className="text-xs font-sans text-[#75666B] py-4">
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
        <div className="border border-[#E0D4C5]/80 bg-white rounded-2xl p-6 space-y-4 neu-card">
          <div className="flex items-center gap-2 text-[#6A1F35] border-b border-[#E0D4C5]/60 pb-3">
            <Users className="h-4 w-4" />
            <h2 className="font-serif text-base font-bold text-[#34252A]">
              Collective Memberships ({memberships.length})
            </h2>
          </div>
          {memberships.length === 0 ? (
            <p className="text-xs font-sans text-[#75666B] py-4">
              No community memberships joined yet.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2.5 pt-1">
              {memberships.map((m) => (
                <Link
                  key={m.id}
                  to={`/communities/${m.slug}`}
                  className="inline-flex items-center gap-2 border border-[#E0D4C5] bg-[#FAF6EF] hover:bg-[#F0E7DA] px-4 py-2 rounded-full font-sans text-xs font-semibold text-[#34252A] shadow-xs transition-all"
                >
                  <span className="font-bold">{m.name}</span>
                  {m.role === 'curator' && (
                    <span className="bg-[#6A1F35] text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase">
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
        <div className="border border-[#E0D4C5]/80 bg-white rounded-2xl p-6 neu-card space-y-4">
          <div className="flex items-center justify-between border-b border-[#E0D4C5]/60 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#6A1F35]" />
              <h2 className="font-serif text-xl font-bold text-[#34252A]">
                Verified Onchain Contributions ({contributions.length})
              </h2>
            </div>

            {profile.wallet_address && (
              <Link
                to={`/verify/${profile.wallet_address}`}
                className="font-sans text-xs text-[#6A1F35] hover:underline flex items-center gap-1 font-bold"
              >
                <span>Onchain Ledger Verification</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>

          {contributions.length === 0 ? (
            <div className="border border-dashed border-[#E0D4C5] rounded-xl p-8 text-center text-xs text-[#75666B] font-sans">
              No contributions submitted or verified yet. Submit citations to community collections to earn verifiable onchain stamps.
            </div>
          ) : (
            <div className="space-y-3">
              {contributions.map((c) => (
                <div
                  key={c.id}
                  className="border border-[#E0D4C5]/70 bg-[#FAF6EF] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-sans text-xs">
                      <span className="font-bold text-[#6A1F35]">
                        Collective: {c.communities?.name || 'Global'}
                      </span>
                      <span className="text-[11px] text-[#75666B]">
                        · {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {c.collection_items?.url && (
                      <a
                        href={c.collection_items.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-sans text-[#6A1F35] hover:underline flex items-center gap-1 truncate max-w-lg"
                      >
                        <span>{c.collection_items.url}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>

                  <span
                    className={`font-sans text-[10px] uppercase px-2.5 py-0.5 rounded-full font-bold self-start md:self-center ${
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
      {isEditModalOpen && (
        <EditProfileErrorBoundary onClose={() => setIsEditModalOpen(false)}>
          <EditProfileModal
            profile={profile}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onUpdated={() => {
              queryClient.invalidateQueries({ queryKey: ['profile'] })
            }}
          />
        </EditProfileErrorBoundary>
      )}
    </div>
  )
}
export default ProfilePage
