import { useEffect } from 'react'
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Compass, Users, User, LogIn, LogOut } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/useAuth'
import { supabase } from '@/lib/supabase'

export function AppShell() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // ONB-01: Check user interests count for signed-in users
  const { data: interestsCount, isLoading: checkingInterests } = useQuery({
    queryKey: ['user_interests_count', user?.id],
    queryFn: async () => {
      if (!user) return null
      const { count, error } = await supabase
        .from('user_interests')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (error) return null
      return count ?? 0
    },
    enabled: !!user,
  })

  // Redirect signed-in users with 0 interests to /onboarding
  useEffect(() => {
    if (
      user &&
      !checkingInterests &&
      interestsCount === 0 &&
      location.pathname !== '/onboarding' &&
      location.pathname !== '/login'
    ) {
      navigate('/onboarding', { replace: true })
    }
  }, [user, checkingInterests, interestsCount, location.pathname, navigate])

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/explore', label: 'Explore', icon: Compass },
    { to: '/communities', label: 'Communities', icon: Users },
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
          <Link to="/" className="flex items-center gap-2">
            <span className="font-serif text-2xl font-black tracking-tight text-[var(--ink)]">
              Hailey
            </span>
            <span className="rounded bg-[var(--clay)] px-1.5 py-0.5 font-mono text-[10px] uppercase font-bold text-[var(--paper)]">
              Field Guide
            </span>
          </Link>

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
                className="flex items-center gap-1 border border-[var(--ink)] bg-[var(--clay)] px-3 py-1 font-mono text-xs uppercase tracking-wider text-[var(--paper)] hover:opacity-90 transition-opacity"
              >
                <LogIn className="h-3 w-3" />
                <span>Sign In</span>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main Page Area */}
      <main className="flex-1 max-w-[1100px] w-full mx-auto px-4 py-6 md:px-6 mb-16 md:mb-6">
        <Outlet />
      </main>

      {/* Bottom Nav (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--ink)] bg-[var(--paper-2)] flex items-center justify-around py-2 px-4 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1 px-3 transition-colors ${
                  isActive
                    ? 'text-[var(--clay)] font-bold'
                    : 'text-[var(--ink-2)] hover:text-[var(--ink)]'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span className="font-mono text-[10px] uppercase tracking-wider">
                {item.label}
              </span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
