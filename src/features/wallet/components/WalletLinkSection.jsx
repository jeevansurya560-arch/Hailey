import React from 'react'
import { ShieldCheck, Link2, AlertCircle, Loader2 } from 'lucide-react'
import { WalletConnectButton } from './WalletConnectButton'
import { useWalletLink } from '../hooks/useWalletLink'

export function WalletLinkSection({ profile }) {
  const { linkWallet, isLinking, error, connectedAddress, isConnected } = useWalletLink()

  const linkedAddress = profile?.wallet_address?.toLowerCase() || null
  const currentConnected = connectedAddress?.toLowerCase() || null

  const isVerifiedForThisProfile = linkedAddress && currentConnected && linkedAddress === currentConnected

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <WalletConnectButton />

        {isConnected && !isVerifiedForThisProfile && (
          <button
            type="button"
            onClick={linkWallet}
            disabled={isLinking}
            className="flex items-center gap-1.5 neu-pill rounded-full border border-[#6A1F35] bg-[#FAF6EF] px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-[#6A1F35] font-bold hover:bg-[#F0E7DA] transition-all disabled:opacity-50"
          >
            {isLinking ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Signing...</span>
              </>
            ) : (
              <>
                <Link2 className="h-3.5 w-3.5" />
                <span>Verify & Link</span>
              </>
            )}
          </button>
        )}

        {isVerifiedForThisProfile && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-300 font-mono text-[11px] text-emerald-800 font-bold rounded-full neu-pill">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
            <span>Verified Owner</span>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-rose-700 font-mono text-xs mt-1 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl neu-card">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
