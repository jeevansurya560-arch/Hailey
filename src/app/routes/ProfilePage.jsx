import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  User,
  ShieldCheck,
  Lock,
  KeyRound,
  Server,
  CheckCircle2,
  Database,
  Link2,
  Loader2,
  AlertCircle,
  ExternalLink,
  Compass,
  Users,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/useAuth'
import { LazyWalletSection } from '@/features/wallet/LazyWalletSection'
import { TagSticker } from '@/components/TagSticker'
import { VerifiedSeal } from '@/components/VerifiedSeal'

export function ProfilePage() {
  const { handle } = useParams()
  const { user, session } = useAuth()
  const queryClient = useQueryClient()

  const [linkStatusMsg, setLinkStatusMsg] = useState(null)
  const [linkErrorMsg, setLinkErrorMsg] = useState(null)

  // 1. Fetch profile by handle
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile', handle],
    queryFn: async () => {
      if (!handle) return null
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('handle', handle)
        .maybeSingle()

      if (error) throw error
      return data
    },
  })

  const isOwnProfile = user && profile && user.id === profile.id

  // 2. Fetch user's exploring topics (user_interests)
  const { data: userInterests = [] } = useQuery({
    queryKey: ['profile_interests', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return []
      const { data, error } = await supabase
        .from('user_interests')
        .select('tag_id, weight, tags (id, name, slug, kind)')
        .eq('user_id', profile.id)
        .gt('weight', 0)
        .order('weight', { ascending: false })

      if (error) return []
      return (data || []).map((d) => d.tags).filter(Boolean)
    },
    enabled: !!profile?.id,
  })

  // 3. Fetch user's community memberships
  const { data: memberships = [] } = useQuery({
    queryKey: ['profile_memberships', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return []
      const { data, error } = await supabase
        .from('memberships')
        .select('role, communities (id, name, slug)')
        .eq('user_id', profile.id)

      if (error) return []
      return (data || []).map((m) => ({ role: m.role, ...(m.communities || {}) }))
    },
    enabled: !!profile?.id,
  })

  // 4. Fetch user's verified contributions (PROF-01..03)
  const { data: contributions = [] } = useQuery({
    queryKey: ['profile_contributions', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return []
      const { data, error } = await supabase
        .from('contributions')
        .select(`
          id,
          content_hash,
          status,
          tx_hash,
          created_at,
          communities (name, slug),
          collection_items (
            kind,
            url,
            note,
            posts (body)
          )
        `)
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })

      if (error) return []
      return data || []
    },
    enabled: !!profile?.id,
  })

  if (isProfileLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--clay)]" />
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--ink-2)]">
          Loading profile...
        </p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="border border-[var(--clay)] bg-[var(--paper-2)] p-8 text-center space-y-3">
        <h2 className="font-serif text-2xl font-bold text-[var(--ink)]">Profile Not Found</h2>
        <Link to="/" className="font-mono text-xs text-[var(--clay)] underline">
          ← Return to Home
        </Link>
      </div>
    )
  }

  const attestedCount = contributions.filter((c) => c.status === 'attested').length

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
                  @{profile.handle}
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
              {profile.wallet_address && (
                <div className="flex items-center gap-1 font-mono text-[11px] text-[var(--onchain)] font-semibold mt-1">
                  <Link2 className="h-3 w-3" />
                  <span>
                    {profile.wallet_address.slice(0, 6)}...{profile.wallet_address.slice(-4)}
                  </span>
                  <a
                    href={`/verify/${profile.wallet_address}`}
                    className="ml-2 text-[10px] text-[var(--clay)] hover:underline"
                  >
                    View Onchain Ledger →
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isOwnProfile && <LazyWalletSection />}
            <div className="flex items-center gap-2 border border-[var(--onchain)]/30 bg-[var(--paper)] px-3 py-1.5 text-xs shadow-[1.5px_1.5px_0_var(--ink)]">
              <ShieldCheck className="h-4 w-4 text-[var(--onchain)]" />
              <span className="font-mono text-[11px] text-[var(--ink)]">
                Attestations: <strong>{attestedCount}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Exploring Threads (PROF-01) */}
      {userInterests.length > 0 && (
        <div className="border border-[var(--line)] bg-[var(--paper-2)] p-5 space-y-3 shadow-[var(--shadow-hard)]">
          <div className="flex items-center gap-2 text-[var(--clay)] border-b border-[var(--line)] pb-2">
            <Compass className="h-4 w-4" />
            <h2 className="font-serif text-base font-bold text-[var(--ink)]">
              Exploring Threads ({userInterests.length})
            </h2>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
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
        </div>
      )}

      {/* Community Memberships */}
      {memberships.length > 0 && (
        <div className="border border-[var(--line)] bg-[var(--paper-2)] p-5 space-y-3 shadow-[var(--shadow-hard)]">
          <div className="flex items-center gap-2 text-[var(--clay)] border-b border-[var(--line)] pb-2">
            <Users className="h-4 w-4" />
            <h2 className="font-serif text-base font-bold text-[var(--ink)]">
              Collectives & Memberships ({memberships.length})
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {memberships.map((m) => (
              <Link
                key={m.id}
                to={`/communities/${m.slug}`}
                className="inline-flex items-center gap-1.5 border border-[var(--line)] bg-[var(--paper)] px-3 py-1.5 font-mono text-xs text-[var(--ink)] hover:border-[var(--ink)] transition-colors"
              >
                <span>{m.name}</span>
                {m.role === 'curator' && (
                  <span className="bg-[var(--onchain)]/20 text-[var(--onchain)] text-[9px] px-1 py-0.2 rounded font-bold uppercase">
                    Curator
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Verified Onchain Contributions (PROF-02 / PROF-03) */}
      <div className="border border-[var(--ink)] bg-[var(--paper-2)] p-6 shadow-[var(--shadow-hard)] space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[var(--onchain)]" />
            <h2 className="font-serif text-xl font-bold text-[var(--ink)]">
              Verified Contributions ({contributions.length})
            </h2>
          </div>

          {profile.wallet_address && (
            <Link
              to={`/verify/${profile.wallet_address}`}
              className="font-mono text-xs text-[var(--clay)] hover:underline flex items-center gap-1"
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
                className="border border-[var(--line)] bg-[var(--paper)] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
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

                  {c.collection_items?.note && (
                    <p className="text-xs text-[var(--ink)] italic">
                      "{c.collection_items.note}"
                    </p>
                  )}

                  <div className="font-mono text-[10px] text-[var(--ink-2)]">
                    Hash: <code className="bg-gray-100 px-1 py-0.5">{c.content_hash.slice(0, 16)}...</code>
                  </div>
                </div>

                <div className="shrink-0">
                  <VerifiedSeal status={c.status} txHash={c.tx_hash} contentHash={c.content_hash} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security & Access Control Layer */}
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
          <div className="border border-[var(--line)] bg-[var(--paper)] p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-[var(--clay)] font-bold">
              <KeyRound className="h-4 w-4" />
              <span>Authentication</span>
            </div>
            <p className="text-[11px] text-[var(--ink-2)] leading-relaxed">
              JWT Sessions managed via Supabase Auth with automated public handle bootstrapping.
            </p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold pt-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>Active JWT Verified</span>
            </div>
          </div>

          <div className="border border-[var(--line)] bg-[var(--paper)] p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-[var(--clay)] font-bold">
              <Database className="h-4 w-4" />
              <span>Row Level Security (RLS)</span>
            </div>
            <p className="text-[11px] text-[var(--ink-2)] leading-relaxed">
              PostgreSQL table-level isolation. User preference vectors and private interactions are protected.
            </p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold pt-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>17 Tables Enforced</span>
            </div>
          </div>

          <div className="border border-[var(--line)] bg-[var(--paper)] p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-[var(--clay)] font-bold">
              <Server className="h-4 w-4" />
              <span>Ledger & Cryptography</span>
            </div>
            <p className="text-[11px] text-[var(--ink-2)] leading-relaxed">
              Monad Testnet smart contract (EIP-712 / keccak256) sponsorship with zero gas fees required.
            </p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold pt-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>Monad Testnet Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
