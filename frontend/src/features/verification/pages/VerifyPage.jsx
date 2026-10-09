import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ShieldCheck, ExternalLink, Loader2, ArrowLeft, Building2, AlertCircle } from 'lucide-react'
import {
  fetchCommunitiesForVerification,
  getCommunityAttestationCounts,
} from '@/features/verification/services/attestationService'

export function VerifyPage() {
  const { address } = useParams()
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'
  const explorerBaseUrl = import.meta.env.VITE_EXPLORER_URL || 'https://testnet.monadexplorer.com'

  const normalizedAddress = address?.toLowerCase() || '0x0000000000000000000000000000000000000000'

  // 1. Fetch communities via Attestation service
  const { data: communities = [] } = useQuery({
    queryKey: ['communities_verify'],
    queryFn: fetchCommunitiesForVerification,
  })

  // 2. Query Monad Testnet blockchain for counts per community via Attestation service
  const { data: onchainCounts = [], isLoading, isError } = useQuery({
    queryKey: ['onchain_verify', normalizedAddress, communities.length, contractAddress],
    queryFn: () => getCommunityAttestationCounts(normalizedAddress, communities, contractAddress),
    enabled: !!normalizedAddress && communities.length > 0,
  })

  const totalVerifiedCount = onchainCounts.reduce(
    (acc, curr) => acc + (typeof curr.count === 'number' ? curr.count : 0),
    0
  )

  const hasAnyUnavailable = onchainCounts.some((item) => item.status === 'unavailable')

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--ink-2)] hover:text-[var(--ink)] mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </Link>

        {/* Header Card */}
        <div className="border border-[var(--ink)] bg-[var(--paper-2)] p-6 md:p-8 shadow-[var(--shadow-hard)] space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-[var(--onchain)]" />
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--onchain)] font-bold">
              Monad Onchain Ledger Verification
            </span>
          </div>

          <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[var(--ink)] break-all">
            {address}
          </h1>

          <p className="text-xs md:text-sm text-[var(--ink-2)] leading-relaxed font-mono">
            This verification view reads directly from the deployed Hailey smart contract on Monad Testnet (Chain ID 10143).
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-[var(--line)] font-mono text-xs">
            <div className="flex items-center gap-1.5 text-[var(--ink)]">
              <span>Total Attestations:</span>
              <strong className="text-[var(--onchain)] text-sm">{totalVerifiedCount}</strong>
              {hasAnyUnavailable && (
                <span className="text-amber-600 text-[10px] flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> (some queries unavailable)
                </span>
              )}
            </div>

            <a
              href={`${explorerBaseUrl}/address/${normalizedAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[var(--clay)] hover:underline ml-auto"
            >
              <span>View on Monad Explorer</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Per-Community Breakdown */}
      <div className="border border-[var(--line)] bg-[var(--paper-2)] p-6 shadow-[var(--shadow-hard)] space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-[var(--clay)]" />
            <h2 className="font-serif text-lg font-bold text-[var(--ink)]">
              Collective Attestation Breakdown
            </h2>
          </div>
          <span className="font-mono text-[10px] text-[var(--ink-2)]">
            Contract: {contractAddress.slice(0, 8)}...
          </span>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--onchain)]" />
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--ink-2)]">
              Querying Monad smart contract...
            </p>
          </div>
        )}

        {isError && (
          <div className="text-xs text-[var(--clay)] p-4 border border-red-200 bg-red-50 font-mono">
            Unable to query Monad testnet RPC. Please verify network connectivity.
          </div>
        )}

        {!isLoading && onchainCounts.length > 0 && (
          <div className="divide-y divide-[var(--line)]">
            {onchainCounts.map(({ community, count, status, errorMessage }) => (
              <div
                key={community.id}
                className="py-3 flex items-center justify-between font-mono text-xs"
              >
                <div>
                  <Link
                    to={`/communities/${community.slug}`}
                    className="font-bold text-[var(--ink)] hover:text-[var(--clay)] transition-colors"
                  >
                    {community.name}
                  </Link>
                  <div className="text-[10px] text-[var(--ink-2)]">
                    Slug: {community.slug}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {status === 'unavailable' ? (
                    <span className="px-2.5 py-1 rounded font-bold bg-amber-50 text-amber-700 border border-amber-200" title={errorMessage}>
                      Verification unavailable
                    </span>
                  ) : (
                    <span
                      className={`px-2.5 py-1 rounded font-bold ${
                        count > 0
                          ? 'bg-[var(--onchain)]/20 text-[var(--onchain)] border border-[var(--onchain)]/30'
                          : 'bg-gray-100 text-[var(--ink-2)]'
                      }`}
                    >
                      {count} {count === 1 ? 'Attestation' : 'Attestations'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
