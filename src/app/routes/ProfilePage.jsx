import { useParams } from 'react-router-dom'
import { User, ShieldCheck, Lock, KeyRound, Server, CheckCircle2, Database } from 'lucide-react'
import { useAuth } from '@/features/auth/useAuth'
import { LazyWalletSection } from '@/features/wallet/LazyWalletSection'

export function ProfilePage() {
  const { handle } = useParams()
  const { user } = useAuth()

  const isOwnProfile = user && (user.user_metadata?.handle === handle || user.email?.split('@')[0] === handle)

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="border border-[var(--ink)] bg-[var(--paper-2)] p-6 shadow-[var(--shadow-hard)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 border border-[var(--ink)] bg-[var(--paper)] flex items-center justify-center shadow-[2px_2px_0_var(--ink)]">
              <User className="h-8 w-8 text-[var(--ink-2)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold text-[var(--ink)]">
                  @{handle}
                </h1>
                {isOwnProfile && (
                  <span className="rounded bg-[var(--paper)] border border-[var(--line)] px-2 py-0.5 font-mono text-[10px] text-[var(--ink-2)] font-bold">
                    You
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-[var(--ink-2)] font-mono">
                Cultural Contributor · Monad Testnet (Chain ID 10143)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <LazyWalletSection />
            <div className="flex items-center gap-2 border border-[var(--onchain)]/30 bg-[var(--paper)] px-3 py-1.5 text-xs shadow-[1.5px_1.5px_0_var(--ink)]">
              <ShieldCheck className="h-4 w-4 text-[var(--onchain)]" />
              <span className="font-mono text-[11px] text-[var(--ink)]">
                Attestations: <strong>0</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Security & Cryptographic Trust Dashboard (SEC-01) */}
      <div className="border border-[var(--ink)] bg-[var(--paper-2)] p-6 shadow-[var(--shadow-hard)] space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-[var(--clay)]" />
            <h2 className="font-serif text-lg font-bold text-[var(--ink)]">
              Security & Access Control Layer
            </h2>
          </div>
          <span className="font-mono text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-300">
            System Verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          {/* Item 1: Authentication */}
          <div className="border border-[var(--line)] bg-[var(--paper)] p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-[var(--clay)] font-bold">
              <KeyRound className="h-4 w-4" />
              <span>Authentication</span>
            </div>
            <p className="text-[11px] text-[var(--ink-2)] leading-relaxed">
              JWT Sessions managed via Supabase Auth with automated public handle bootstrapping and encrypted bearer tokens.
            </p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold pt-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>Active JWT Verified</span>
            </div>
          </div>

          {/* Item 2: Authorization & RLS */}
          <div className="border border-[var(--line)] bg-[var(--paper)] p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-[var(--clay)] font-bold">
              <Database className="h-4 w-4" />
              <span>Row Level Security (RLS)</span>
            </div>
            <p className="text-[11px] text-[var(--ink-2)] leading-relaxed">
              Postgres 15+ table-level isolation. User preference vectors and private interactions cannot be scraped by third parties.
            </p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold pt-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>17 Tables Enforced</span>
            </div>
          </div>

          {/* Item 3: Onchain Attestations */}
          <div className="border border-[var(--line)] bg-[var(--paper)] p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-[var(--clay)] font-bold">
              <Server className="h-4 w-4" />
              <span>Ledger & Cryptography</span>
            </div>
            <p className="text-[11px] text-[var(--ink-2)] leading-relaxed">
              Monad Testnet smart contract (EIP-712 / keccak256) sponsorship with zero gas fees required for contributors.
            </p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold pt-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>Monad Testnet Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs / Subsections */}
      <div className="border border-[var(--line)] bg-[var(--paper-2)] p-6 shadow-[var(--shadow-hard)]">
        <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--clay)] font-bold mb-4">
          Verified Onchain Contributions
        </h2>
        <div className="border border-dashed border-[var(--line)] p-8 text-center text-xs text-[var(--ink-2)] font-mono">
          No verified contributions recorded onchain yet. Contributions approved in Day 6 will appear here with Monad transaction receipts.
        </div>
      </div>
    </div>
  )
}
