import { useState, useEffect, useRef } from 'react'
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Home,
  Compass,
  Users,
  User,
  LogOut,
  ShieldCheck,
  Ticket,
  TrendingUp,
  Calendar,
  BarChart3,
  Sparkles,
  ChevronDown,
  ShoppingBag,
  MessageSquare,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { fetchUserInterestsCount } from '@/features/feed/services/feedService'
import { CulturalAssistantModal } from '@/features/assistant/components/CulturalAssistantModal'

function BotanicalEmblem({ className = "h-8 w-8 text-[#6A1F35]" }) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 32V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M18 8C14 11 9 13 5 13C8 16 13 16 18 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18 8C22 11 27 13 31 13C28 16 23 16 18 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18 17C13.5 19.5 8.5 20.5 5 22C8.5 24 13.5 23 18 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18 17C22.5 19.5 27.5 20.5 31 22C27.5 24 22.5 23 18 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="18" cy="5" r="2" fill="currentColor"/>
    </svg>
  )
}

function BotanicalBranch({ className = "text-[#B08A50]/25" }) {
  return (
    <svg className={className} width="160" height="60" viewBox="0 0 160 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M160 60C130 45 95 40 60 48C40 52 20 45 5 25" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M60 48C56 36 62 26 74 22C64 22 55 28 50 40" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      <path d="M95 40C98 28 108 20 120 18C110 16 98 22 92 32" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      <path d="M125 45C132 35 144 30 156 30C145 27 134 30 126 38" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  )
}

export function AppShell() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)

  // ONB-01: Check user interests count for signed-in users via feedService
  const { data: interestsCount, isLoading: checkingInterests } = useQuery({
    queryKey: ['user_interests_count', user?.id],
    queryFn: () => (user ? fetchUserInterestsCount(user.id) : null),
    enabled: !!user,
  })

  // Suggest onboarding for signed-in users with 0 interests on initial home visit, without hijacking deliberate navigation
  useEffect(() => {
    const hasDismissed = user?.id ? sessionStorage.getItem(`onboarding_dismissed_${user.id}`) : null
    if (
      user &&
      !checkingInterests &&
      interestsCount === 0 &&
      !hasDismissed &&
      location.pathname === '/'
    ) {
      navigate('/onboarding', { replace: true })
    }
  }, [user, checkingInterests, interestsCount, location.pathname, navigate])

  const profilePath = user
    ? `/u/${user.user_metadata?.handle || user.email?.split('@')[0] || 'me'}`
    : '/login'

  const [isCommunityOpen, setIsCommunityOpen] = useState(false)
  const communityRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (communityRef.current && !communityRef.current.contains(e.target)) {
        setIsCommunityOpen(false)
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setIsCommunityOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Close community menu on route change
  useEffect(() => {
    setIsCommunityOpen(false)
  }, [location.pathname])

  const navItems = [
    { to: '/', label: 'Home', icon: Home, exact: true },
    { to: '/explore', label: 'Explore', icon: Compass },
    { to: '/festivals', label: 'Festivals', icon: Calendar },
    { to: '/communities', label: 'Community', icon: Users, hasChevron: true },
    { to: '/messages', label: 'Messages', icon: MessageSquare },
    { to: profilePath, label: 'Profile', icon: User },
  ]

  const currentPath = location.pathname.replace(/\/+$/, '') || '/'
  const isAuthPage = [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
  ].includes(currentPath)

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EF] text-[#34252A] antialiased">
      {/* Reference Header (Hidden on Auth Pages) */}
      {!isAuthPage && (
        <header className="sticky top-0 z-40 border-b border-[#E0D4C5] bg-[#FAF6EF]/95 backdrop-blur-md">
          <div className="max-w-[1400px] mx-auto flex items-center justify-between px-4 py-3 md:px-8 relative">
            {/* Subtle Decorative Botanical Branch behind header right */}
            <div className="absolute right-32 top-0 pointer-events-none hidden md:block">
              <BotanicalBranch />
            </div>

          {/* Left Brand: Botanical Emblem + Hailey Wordmark + Subtitle */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <BotanicalEmblem className="h-9 w-9 text-[#6A1F35] transition-transform group-hover:scale-105" />
            <div className="flex flex-col">
              <span className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#34252A] leading-none">
                Hailey
              </span>
              <span className="font-sans text-[10px] md:text-[11px] tracking-[0.25em] text-[#75666B] uppercase font-medium mt-1">
                PEOPLE · CULTURE · BELONGING
              </span>
            </div>
          </Link>

          {/* Right Controls: User Avatar & Sign Out */}
          <div className="flex items-center gap-3 md:gap-4 z-10">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={profilePath}
                  className="relative group rounded-full overflow-hidden border border-[#E0D4C5] p-0.5 hover:border-[#6A1F35] transition-colors"
                >
                  <img
                    src={user.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop"}
                    alt={user.user_metadata?.handle || "User Avatar"}
                    className="h-8 w-8 md:h-9 md:w-9 rounded-full object-cover"
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="flex items-center gap-1.5 border border-[#6A1F35]/30 hover:border-[#6A1F35] bg-transparent text-[#6A1F35] hover:bg-[#6A1F35]/5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 border border-[#6A1F35]/30 hover:border-[#6A1F35] text-[#6A1F35] hover:bg-[#6A1F35]/5 px-4 py-1.5 rounded-full text-xs font-medium transition-colors"
              >
                <LogOut className="h-3.5 w-3.5 rotate-180" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </header>
      )}

      {/* Floating Centered Pill Navigation Bar (Desktop & Tablet) - Hidden on Auth Pages */}
      {!isAuthPage && (
        <div className="w-full pt-4 pb-2 px-4 relative z-50">
          <nav className="hidden md:flex items-center justify-center gap-1.5 max-w-fit mx-auto bg-white/90 backdrop-blur-md border border-[#E0D4C5]/80 rounded-full p-1.5 neu-pill relative z-50">
          {navItems.map((item) => {
            const Icon = item.icon
            const isCommunityItem = item.label === 'Community'
            const isItemActive = isCommunityItem
              ? ['/communities', '/markets', '/tickets'].some((p) => location.pathname.startsWith(p))
              : item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to)

            if (isCommunityItem) {
              return (
                <div
                  key={item.label}
                  ref={communityRef}
                  className="relative z-50"
                >
                  <button
                    type="button"
                    onClick={() => setIsCommunityOpen((prev) => !prev)}
                    aria-expanded={isCommunityOpen}
                    aria-haspopup="true"
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-[#6A1F35] ${
                      isItemActive
                        ? 'bg-[#6A1F35] text-white neu-burgundy-pill'
                        : 'text-[#34252A] hover:bg-[#F0E7DA]/60 active:neu-inset'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isItemActive ? 'text-white' : 'text-[#6A1F35]'}`} />
                    <span>{item.label}</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${
                        isItemActive ? 'text-white' : 'text-[#75666B]'
                      } ${isCommunityOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Dropdown Menu for Community Sub-Destinations */}
                  {isCommunityOpen && (
                    <div
                      role="menu"
                      aria-label="Community sections"
                      className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 bg-[#FAF6EF] border border-[#E0D4C5] rounded-2xl shadow-2xl p-2 z-[100] neu-card space-y-1 animate-fade-in"
                    >
                      <Link
                        to="/communities"
                        onClick={() => setIsCommunityOpen(false)}
                        role="menuitem"
                        className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                          location.pathname.startsWith('/communities')
                            ? 'bg-[#6A1F35] text-white'
                            : 'hover:bg-[#F0E7DA] text-[#34252A]'
                        }`}
                      >
                        <Users className={`h-4 w-4 mt-0.5 ${location.pathname.startsWith('/communities') ? 'text-white' : 'text-[#6A1F35]'}`} />
                        <div>
                          <span className="block text-xs font-bold leading-tight">Collectives</span>
                          <span className={`block text-[11px] leading-tight mt-0.5 ${location.pathname.startsWith('/communities') ? 'text-white/80' : 'text-[#75666B]'}`}>
                            Cultural hubs & archives
                          </span>
                        </div>
                      </Link>

                      <Link
                        to="/markets"
                        onClick={() => setIsCommunityOpen(false)}
                        role="menuitem"
                        className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                          location.pathname.startsWith('/markets')
                            ? 'bg-[#6A1F35] text-white'
                            : 'hover:bg-[#F0E7DA] text-[#34252A]'
                        }`}
                      >
                        <ShoppingBag className={`h-4 w-4 mt-0.5 ${location.pathname.startsWith('/markets') ? 'text-white' : 'text-[#6A1F35]'}`} />
                        <div>
                          <span className="block text-xs font-bold leading-tight">Markets</span>
                          <span className={`block text-[11px] leading-tight mt-0.5 ${location.pathname.startsWith('/markets') ? 'text-white/80' : 'text-[#75666B]'}`}>
                            Cultural outcome markets & bazaar
                          </span>
                        </div>
                      </Link>

                      <Link
                        to="/tickets"
                        onClick={() => setIsCommunityOpen(false)}
                        role="menuitem"
                        className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                          location.pathname.startsWith('/tickets')
                            ? 'bg-[#6A1F35] text-white'
                            : 'hover:bg-[#F0E7DA] text-[#34252A]'
                        }`}
                      >
                        <Ticket className={`h-4 w-4 mt-0.5 ${location.pathname.startsWith('/tickets') ? 'text-white' : 'text-[#6A1F35]'}`} />
                        <div>
                          <span className="block text-xs font-bold leading-tight">Passes</span>
                          <span className={`block text-[11px] leading-tight mt-0.5 ${location.pathname.startsWith('/tickets') ? 'text-white/80' : 'text-[#75666B]'}`}>
                            Sacred experiences & ticket passes
                          </span>
                        </div>
                      </Link>

                      <Link
                        to="/analytics"
                        onClick={() => setIsCommunityOpen(false)}
                        role="menuitem"
                        className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                          location.pathname.startsWith('/analytics')
                            ? 'bg-[#6A1F35] text-white'
                            : 'hover:bg-[#F0E7DA] text-[#34252A]'
                        }`}
                      >
                        <BarChart3 className={`h-4 w-4 mt-0.5 ${location.pathname.startsWith('/analytics') ? 'text-white' : 'text-[#6A1F35]'}`} />
                        <div>
                          <span className="block text-xs font-bold leading-tight">Analytics</span>
                          <span className={`block text-[11px] leading-tight mt-0.5 ${location.pathname.startsWith('/analytics') ? 'text-white/80' : 'text-[#75666B]'}`}>
                            Cultural reach & engagement
                          </span>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              )
            }

            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-[#6A1F35] ${
                  isItemActive
                    ? 'bg-[#6A1F35] text-white neu-burgundy-pill'
                    : 'text-[#34252A] hover:bg-[#F0E7DA]/60 active:neu-inset'
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    isItemActive ? 'text-white' : 'text-[#6A1F35]'
                  }`}
                />
                <span>{item.label}</span>
              </NavLink>
            )
          })}

          {/* Ask AI Pill Button */}
          <button
            type="button"
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-[#34252A] hover:bg-[#F0E7DA]/60 active:neu-inset transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#6A1F35]"
          >
            <Sparkles className="h-4 w-4 text-[#6A1F35]" />
            <span>Ask AI</span>
          </button>
        </nav>
      </div>
      )}

      {/* Main Content Area */}
      <main
        className={`flex-1 w-full mx-auto relative z-0 ${
          isAuthPage
            ? 'px-4 py-6 sm:py-10 max-w-7xl flex items-center justify-center'
            : 'max-w-[1400px] px-4 sm:px-6 lg:px-8 py-4 mb-16 md:mb-6'
        }`}
      >
        <Outlet />
      </main>

      {/* Cultural Assistant Modal */}
      <CulturalAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />

      {/* Bottom Nav (Mobile Only) - Hidden on Auth Pages */}
      {!isAuthPage && (
        <nav
          aria-label="Mobile Navigation"
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#E0D4C5] bg-[#FAF6EF]/95 backdrop-blur-md md:hidden shadow-lg pb-[env(safe-area-inset-bottom,0.5rem)]"
        >
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isCommunityItem = item.label === 'Community'
              const isItemActive = isCommunityItem
                ? ['/communities', '/markets', '/tickets'].some((p) => location.pathname.startsWith(p))
                : item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to)
              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={`flex flex-col items-center gap-0.5 p-1 text-[11px] font-medium transition-colors ${
                    isItemActive ? 'text-[#6A1F35] font-bold' : 'text-[#75666B]'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      isItemActive ? 'text-[#6A1F35]' : 'text-[#75666B]'
                    }`}
                  />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
            <button
              type="button"
              onClick={() => setIsAiModalOpen(true)}
              className="flex flex-col items-center gap-0.5 p-1 text-[11px] font-medium text-[#75666B]"
            >
              <Sparkles className="h-5 w-5 text-[#6A1F35]" />
              <span>Ask AI</span>
            </button>
          </div>
        </nav>
      )}

      {/* Refined Editorial Footer - Hidden on Auth Pages */}
      {!isAuthPage && (
        <footer className="hidden md:block border-t border-[#E0D4C5] bg-[#F0E7DA]/60 py-6 text-center text-xs text-[#75666B]">
          <div className="max-w-[1400px] mx-auto px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[#34252A]">
              <span className="font-serif font-semibold">Hailey Living Field Guide</span>
              <span>·</span>
              <span>People · Culture · Belonging</span>
            </div>
            <div className="flex items-center gap-6 text-[#75666B]">
              <Link to="/explore" className="hover:text-[#6A1F35] transition-colors">Taxonomy</Link>
              <Link to="/festivals" className="hover:text-[#6A1F35] transition-colors">Festivals</Link>
              <Link to="/communities" className="hover:text-[#6A1F35] transition-colors">Collectives</Link>
              <Link to="/tickets" className="hover:text-[#6A1F35] transition-colors">Passes</Link>
              <Link to="/markets" className="hover:text-[#6A1F35] transition-colors">Markets</Link>
              <Link to="/reddit" className="hover:text-[#6A1F35] transition-colors">Reddit Dispatches</Link>
              <span className="text-[#E0D4C5]">|</span>
              <Link to="/terms" className="hover:text-[#6A1F35] transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-[#6A1F35] transition-colors">Privacy</Link>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}

