import React from 'react'
import { ShieldCheck, ExternalLink, Clock, AlertCircle, Sparkles } from 'lucide-react'

export function VerifiedSeal({ status, txHash, contentHash, size = 'sm' }) {
  const explorerBaseUrl = import.meta.env.VITE_EXPLORER_URL || 'https://testnet.monadexplorer.com'

  if (status === 'attested') {
    const explorerLink = txHash ? `${explorerBaseUrl}/tx/${txHash}` : null

    return (
      <span className="inline-flex items-center gap-1.5 rounded bg-[var(--onchain)]/15 border border-[var(--onchain)] px-2 py-0.5 font-mono text-[11px] font-bold text-[var(--onchain)] shadow-xs">
        <ShieldCheck className="h-3.5 w-3.5 stroke-[2.5]" />
        <span>Verified · on Monad</span>
        {explorerLink && (
          <a
            href={explorerLink}
            target="_blank"
            rel="noopener noreferrer"
            title={`View Monad Transaction Receipt: ${txHash}`}
            className="hover:opacity-75 inline-flex items-center ml-0.5"
          >
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
        )}
      </span>
    )
  }

  if (status === 'submitted') {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-blue-50 border border-blue-300 px-2 py-0.5 font-mono text-[10px] text-blue-800 font-semibold">
        <Sparkles className="h-3 w-3 animate-spin" />
        <span>Attestation Queued</span>
      </span>
    )
  }

  if (status === 'awaiting_wallet') {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-amber-50 border border-amber-300 px-2 py-0.5 font-mono text-[10px] text-amber-800 font-semibold">
        <Clock className="h-3 w-3" />
        <span>Awaiting Wallet Link</span>
      </span>
    )
  }

  if (status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-red-50 border border-red-300 px-2 py-0.5 font-mono text-[10px] text-red-800 font-semibold">
        <AlertCircle className="h-3 w-3" />
        <span>Attestation Failed</span>
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded bg-gray-50 border border-[var(--line)] px-2 py-0.5 font-mono text-[10px] text-[var(--ink-2)]">
      <Clock className="h-3 w-3" />
      <span>Pending Review</span>
    </span>
  )
}
