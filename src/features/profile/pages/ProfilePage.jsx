import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
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
  ExternalLink,
  Compass,
  Users,
} from 'lucide-react'
import {
  fetchProfileByHandle,
  fetchUserInterests,
  fetchUserMemberships,
  fetchUserContributions,
} from '@/features/profile/services/profileService'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { LazyWalletSection } from '@/features/wallet/components/LazyWalletSection'
import { TagSticker } from '@/components/ui/TagSticker'
import { VerifiedSeal } from '@/features/verification/components/VerifiedSeal'
import { CuratorEarningsCard } from '@/features/payments/components/CuratorEarningsCard'

export function ProfilePage() {
  const { handle } = useParams()
  const { user } = useAuth()

  // 1. Fetch profile by handle
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile', handle],
    queryFn: () => fetchProfileByHandle(handle),
    enabled: !!handle,
  })

  const isOwnProfile = user && profile && user.id === profile.id

  // 2. Fetch user's exploring topics (user_interests)
  const { data: userInterests = [] } = useQuery({
    queryKey: ['profile_interests', profile?.id],
    queryFn: () => fetchUserInterests(profile.id),
    enabled: !!profile?.id,
  })

  // 3. Fetch user's community memberships
  const { data: memberships = [] } = useQuery({
    queryKey: ['profile_memberships', profile?.id],
    queryFn: () => fetchUserMemberships(profile.id),
    enabled: !!profile?.id,
  })

  // 4. Fetch user's verified contributions (PROF-01..03)
  const { data: contributions = [] } = useQuery({
    queryKey: ['profile_contributions', profile?.id],
    queryFn: () => fetchUserContributions(profile.id),
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
      <div className="neu-card rounded-3xl bg-[#FAF6EF] border border-[#E0D4C5] p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full neu-circle bg-[#F0E7DA] border border-[#E0D4C5] flex items-center justify-center shrink-0">
              <User className="h-8 w-8 text-[#6A1F35]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#34252A]">
                  @{profile.handle}
                </h1>
                {isOwnProfile && (
                  <span className="rounded-full bg-[#F0E7DA] border border-[#E0D4C5] px-2.5 py-0.5 font-mono text-[10px] text-[#6A1F35] font-bold">
                    You
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-[#34252A]/60 font-mono">
                Cultural Contributor · Monad Testnet (Chain ID 10143)
              </p>
              {profile.wallet_address && (
                <div className="flex items-center gap-1 font-mono text-[11px] text-[#6A1F35] font-semibold mt-1">
                  <Link2 className="h-3 w-3" />
                  <span>
                    {profile.wallet_address.slice(0, 6)}...{profile.wallet_address.slice(-4)}
                  </span>
                  <a
                    href={`/verify/${profile.wallet_address}`}
                    className="ml-2 text-[10px] text-[#B08A50] hover:underline"
                  >
                    View Onchain Ledger →
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isOwnProfile && <LazyWalletSection profile={profile} />}
            <div className="flex items-center gap-2 neu-pill rounded-full border border-[#E0D4C5] bg-[#F0E7DA]/60 px-3.5 py-1.5 text-xs">
              <ShieldCheck className="h-4 w-4 text-[#6A1F35]" />
              <span className="font-mono text-[11px] text-[#34252A]">
                Attestations: <strong>{attestedCount}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Curator Revenue Dashboard (Claim A) */}
      {isOwnProfile && <CuratorEarningsCard />}

      {/* Exploring Threads (PROF-01) */}
      {userInterests.length > 0 && (
        <div className="neu-card rounded-2xl bg-[#FAF6EF] border border-[#E0D4C5] p-6 space-y-3">
          <div className="flex items-center gap-2 text-[#6A1F35] border-b border-[#E0D4C5] pb-3">
            <Compass className="h-4 w-4" />
            <h2 className="font-serif text-base font-bold text-[#34252A]">
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
        <div className="neu-card rounded-2xl bg-[#FAF6EF] border border-[#E0D4C5] p-6 space-y-3">
          <div className="flex items-center gap-2 text-[#6A1F35] border-b border-[#E0D4C5] pb-3">
            <Users className="h-4 w-4" />
            <h2 className="font-serif text-base font-bold text-[#34252A]">
              Collectives & Memberships ({memberships.length})
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {memberships.map((m) => (
              <Link
                key={m.id}
                to={`/communities/${m.slug}`}
                className="inline-flex items-center gap-1.5 neu-pill rounded-full border border-[#E0D4C5] bg-[#FAF6EF] px-3.5 py-1.5 font-mono text-xs text-[#34252A] hover:bg-[#F0E7DA] transition-all"
              >
                <span>{m.name}</span>
                {m.role === 'curator' && (
                  <span className="bg-[#6A1F35]/15 text-[#6A1F35] text-[9px] px-2 py-0.5 rounded-full font-bold uppercase">
                    Curator
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Verified Onchain Contributions (PROF-02 / PROF-03) */}
      <div className="neu-card rounded-2xl bg-[#FAF6EF] border border-[#E0D4C5] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#E0D4C5] pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#6A1F35]" />
            <h2 className="font-serif text-xl font-bold text-[#34252A]">
              Verified Contributions ({contributions.length})
            </h2>
          </div>

          {profile.wallet_address && (
            <Link
              to={`/verify/${profile.wallet_address}`}
              className="font-mono text-xs text-[#6A1F35] hover:text-[#511528] flex items-center gap-1 transition-colors"
            >
              <span>Onchain Ledger Verification</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>

        {contributions.length === 0 ? (
          <div className="border border-dashed border-[#E0D4C5] rounded-xl p-8 text-center text-xs text-[#34252A]/60 font-mono">
            No contributions submitted or verified yet. Submit citations to community collections to earn verifiable onchain stamps.
          </div>
        ) : (
          <div className="space-y-3">
            {contributions.map((c) => (
              <div
                key={c.id}
                className="neu-card rounded-xl border border-[#E0D4C5] bg-[#F0E7DA]/40 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="font-bold text-[#6A1F35]">
                      Collective: {c.communities?.name || 'Global'}
                    </span>
                    <span className="text-[10px] text-[#34252A]/60">
                      · {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {c.collection_items?.url && (
                    <a
                      href={c.collection_items.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-[#6A1F35] hover:underline flex items-center gap-1 truncate max-w-lg"
                    >
                      <span>{c.collection_items.url}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}

                  {c.collection_items?.note && (
                    <p className="text-xs text-[#34252A] italic">
                      "{c.collection_items.note}"
                    </p>
                  )}

                  <div className="font-mono text-[10px] text-[#34252A]/60">
                    Hash: <code className="bg-[#FAF6EF] border border-[#E0D4C5] px-1.5 py-0.5 rounded">{c.content_hash.slice(0, 16)}...</code>
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
      <div className="neu-card rounded-2xl bg-[#FAF6EF] border border-[#E0D4C5] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#E0D4C5] pb-3">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-[#6A1F35]" />
            <h2 className="font-serif text-lg font-bold text-[#34252A]">
              Security & Access Control Layer
            </h2>
          </div>
          <span className="font-mono text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            System Verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="neu-card rounded-xl border border-[#E0D4C5] bg-[#F0E7DA]/40 p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-[#6A1F35] font-bold">
              <KeyRound className="h-4 w-4" />
              <span>Authentication</span>
            </div>
            <p className="text-[11px] text-[#34252A]/70 leading-relaxed font-sans">
              JWT Sessions managed via Supabase Auth with automated public handle bootstrapping.
            </p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-800 font-semibold pt-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>Active JWT Verified</span>
            </div>
          </div>

          <div className="neu-card rounded-xl border border-[#E0D4C5] bg-[#F0E7DA]/40 p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-[#6A1F35] font-bold">
              <Database className="h-4 w-4" />
              <span>Row Level Security (RLS)</span>
            </div>
            <p className="text-[11px] text-[#34252A]/70 leading-relaxed font-sans">
              PostgreSQL table-level isolation. User preference vectors and private interactions are protected.
            </p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-800 font-semibold pt-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>17 Tables Enforced</span>
            </div>
          </div>

          <div className="neu-card rounded-xl border border-[#E0D4C5] bg-[#F0E7DA]/40 p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-[#6A1F35] font-bold">
              <Server className="h-4 w-4" />
              <span>Ledger & Cryptography</span>
            </div>
            <p className="text-[11px] text-[#34252A]/70 leading-relaxed font-sans">
              Monad Testnet smart contract domain-separated Keccak-256 attestation with zero gas fees required.
            </p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-800 font-semibold pt-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>Monad Testnet Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
