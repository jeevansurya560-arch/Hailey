import { useState, useEffect } from 'react'
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Compass, Users, User, LogOut, ShieldCheck, Ticket, TrendingUp, Calendar, BarChart3, Sparkles } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { fetchUserInterestsCount } from '@/features/feed/services/feedService'
import { CulturalAssistantModal } from '@/features/assistant/components/CulturalAssistantModal'

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

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/explore', label: 'Explore', icon: Compass },
    { to: '/festivals', label: 'Festivals', icon: Calendar },
    { to: '/communities', label: 'Collectives', icon: Users },
    { to: '/tickets', label: 'Passes', icon: Ticket },
    { to: '/markets', label: 'Markets', icon: TrendingUp },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    {
      to: user ? `/u/${user.user_metadata?.handle || user.email?.split('@')[0] || 'me'}` : '/login',
      label: 'Profile',
      icon: User,
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[var(--paper)] text-[var(--ink)] antialiased">
      {/* Top Nav (Desktop) */}
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--paper)]/95 backdrop-blur">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-serif text-2xl font-black tracking-tight text-[var(--ink)]">
                Hailey
              </span>
              <span className="rounded bg-[var(--clay)] px-1.5 py-0.5 font-mono text-[10px] uppercase font-bold text-[var(--paper)]">
                Field Guide
              </span>
            </Link>

            {/* Cryptographic & RLS Security Status Badge */}
            <div className="hidden sm:inline-flex items-center gap-1.5 border border-emerald-800/30 bg-emerald-950/10 dark:bg-emerald-500/10 px-2 py-0.5 rounded font-mono text-[10px] text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span className="font-semibold flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 inline" />
                RLS Protected · Monad L1
              </span>
            </div>
          </div>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `font-mono text-xs uppercase tracking-wider transition-colors hover:text-[var(--clay)] ${
                    isActive
                      ? 'text-[var(--clay)] font-bold border-b border-[var(--clay)] pb-0.5'
                      : 'text-[var(--ink-2)]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            {/* Global AI Assistant Trigger */}
            <button
              type="button"
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-1.5 border border-[var(--clay)] bg-[var(--paper)] text-[var(--clay)] px-2.5 py-1 font-mono text-xs uppercase tracking-wider font-bold rounded shadow-[1px_1px_0_var(--clay)] hover:bg-[var(--clay)] hover:text-[var(--paper)] transition-all"
            >
              <Sparkles className="h-3 w-3" />
              <span>Ask AI</span>
            </button>

            {user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-[var(--line)]">
                <span className="font-mono text-xs text-[var(--ink-2)] truncate max-w-[120px]">
                  @{user.user_metadata?.handle || user.email?.split('@')[0]}
                </span>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="flex items-center gap-1 border border-[var(--line)] px-2.5 py-1 font-mono text-xs text-[var(--ink-2)] hover:border-[var(--ink)] hover:text-[var(--ink)] transition-colors"
                >
                  <LogOut className="h-3 w-3" />
                  <span>Exit</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="border border-[var(--ink)] bg-[var(--paper)] px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-[var(--ink)] shadow-[2px_2px_0_var(--ink)] hover:bg-[var(--paper-2)] transition-all"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1100px] w-full mx-auto px-4 py-6 md:px-6 md:py-8 mb-16 md:mb-0">
        <Outlet />
      </main>

      {/* Cultural Assistant Modal */}
      <CulturalAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />

      {/* Bottom Nav (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--line)] bg-[var(--paper)]/95 backdrop-blur md:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 p-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                    isActive ? 'text-[var(--clay)] font-bold' : 'text-[var(--ink-2)]'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </div>
      </nav>

      {/* Minimal Footer */}
      <footer className="hidden md:block border-t border-[var(--line)] bg-[var(--paper-2)] py-6 text-center text-xs font-mono text-[var(--ink-2)]">
        <div className="max-w-[1100px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span>Hailey Living Field Guide</span>
            <span>·</span>
            <span>Monad Testnet (10143)</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/explore" className="hover:underline">Taxonomy</Link>
            <Link to="/communities" className="hover:underline">Collectives</Link>
            <Link to="/tickets" className="hover:underline">Passes</Link>
            <Link to="/markets" className="hover:underline">Markets</Link>
            <Link to="/reddit" className="hover:underline">Reddit Dispatches</Link>
            <Link to="/terms" className="hover:underline">Terms</Link>
            <Link to="/privacy" className="hover:underline">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
