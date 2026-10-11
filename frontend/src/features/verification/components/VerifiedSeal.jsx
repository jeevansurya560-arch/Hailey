import React from 'react'
import { ShieldCheck, ExternalLink, Clock, AlertCircle, Sparkles } from 'lucide-react'

export function VerifiedSeal({ status, txHash }) {
  const explorerBaseUrl = import.meta.env.VITE_EXPLORER_URL || 'https://testnet.monadexplorer.com'

  if (status === 'attested') {
    const explorerLink = txHash ? `${explorerBaseUrl}/tx/${txHash}` : null

    return (
      <span className="neu-pill inline-flex items-center gap-1.5 rounded-full bg-[#6A1F35]/10 border border-[#6A1F35]/30 px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#6A1F35] shadow-xs">
        <ShieldCheck className="h-3.5 w-3.5 stroke-[2.5]" />
        <span>Verified · Monad</span>
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
      <span className="neu-pill inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 font-mono text-[10px] text-blue-800 font-semibold">
        <Sparkles className="h-3 w-3 animate-spin text-blue-700" />
        <span>Attestation Queued</span>
      </span>
    )
  }

  if (status === 'awaiting_wallet') {
    return (
      <span className="neu-pill inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 font-mono text-[10px] text-amber-800 font-semibold">
        <Clock className="h-3 w-3 text-amber-700" />
        <span>Awaiting Wallet Link</span>
      </span>
    )
  }

  if (status === 'failed') {
    return (
      <span className="neu-pill inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 font-mono text-[10px] text-red-800 font-semibold">
        <AlertCircle className="h-3 w-3 text-red-700" />
        <span>Attestation Failed</span>
      </span>
    )
  }

  return (
    <span className="neu-pill inline-flex items-center gap-1 rounded-full bg-[#F0E7DA] border border-[#E0D4C5] px-2.5 py-0.5 font-mono text-[10px] text-[#34252A]/60">
      <Clock className="h-3 w-3 text-[#34252A]/50" />
      <span>Pending Review</span>
    </span>
  )
}
