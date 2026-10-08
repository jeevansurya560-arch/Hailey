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
            className="flex items-center gap-1.5 border border-[var(--onchain)] bg-[var(--paper)] px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-[var(--onchain)] font-bold shadow-[2px_2px_0_var(--onchain)] hover:bg-emerald-50 transition-all disabled:opacity-50"
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
          <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-500 font-mono text-[11px] text-emerald-800 font-bold rounded-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Verified Owner</span>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-red-600 font-mono text-xs mt-1">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
