import { useParams } from 'react-router-dom'
import { User, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/features/auth/useAuth'
import { LazyWalletSection } from '@/features/wallet/LazyWalletSection'

export function ProfilePage() {
  const { handle } = useParams<{ handle: string }>()
  const { user } = useAuth()

  const isOwnProfile = user && (user.user_metadata?.handle === handle || user.email?.split('@')[0] === handle)

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="border border-[var(--ink)] bg-[var(--paper-2)] p-6 shadow-[var(--shadow-hard)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 border border-[var(--ink)] bg-[var(--paper)] flex items-center justify-center">
              <User className="h-8 w-8 text-[var(--ink-2)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold text-[var(--ink)]">
                  @{handle}
                </h1>
                {isOwnProfile && (
                  <span className="rounded bg-[var(--paper)] border border-[var(--line)] px-2 py-0.5 font-mono text-[10px] text-[var(--ink-2)]">
                    You
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-[var(--ink-2)] font-mono">
                Cultural Contributor · Monad Testnet
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <LazyWalletSection />
            <div className="flex items-center gap-2 border border-[var(--onchain)]/30 bg-[var(--paper)] px-3 py-1.5 text-xs">
              <ShieldCheck className="h-4 w-4 text-[var(--onchain)]" />
              <span className="font-mono text-[11px] text-[var(--ink)]">
                Attestations: <strong>0</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs / Subsections */}
      <div className="border border-[var(--line)] bg-[var(--paper-2)] p-6">
        <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--clay)] font-bold mb-4">
          Verified Contributions
        </h2>
        <div className="border border-dashed border-[var(--line)] p-8 text-center text-xs text-[var(--ink-2)]">
          No verified contributions recorded onchain yet.
        </div>
      </div>
    </div>
  )
}
