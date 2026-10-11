import React from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Wallet, AlertCircle } from 'lucide-react'

export function WalletConnectButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted
        const connected = ready && account && chain

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="flex items-center gap-2 neu-burgundy-pill rounded-full px-4 py-2 font-mono text-xs uppercase tracking-wider text-[#FAF6EF] hover:bg-[#511528] transition-all font-semibold"
                  >
                    <Wallet className="h-3.5 w-3.5 text-[#B08A50]" />
                    <span>Connect Wallet</span>
                  </button>
                )
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="flex items-center gap-1.5 neu-pill rounded-full border border-rose-300 bg-rose-50 px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider text-rose-800 transition-all font-semibold"
                  >
                    <AlertCircle className="h-3.5 w-3.5 text-rose-700" />
                    <span>Switch to Monad</span>
                  </button>
                )
              }

              return (
                <div className="flex items-center gap-2">
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="flex items-center gap-1 neu-pill rounded-full border border-[#E0D4C5] bg-[#FAF6EF] px-3 py-1 font-mono text-xs text-[#34252A] hover:bg-[#F0E7DA] transition-all"
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>{chain.name}</span>
                  </button>

                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="flex items-center gap-1.5 neu-pill rounded-full border border-[#E0D4C5] bg-[#FAF6EF] px-3 py-1 font-mono text-xs text-[#34252A] hover:bg-[#F0E7DA] transition-all font-semibold"
                  >
                    <Wallet className="h-3.5 w-3.5 text-[#6A1F35]" />
                    <span>{account.displayName}</span>
                  </button>
                </div>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}
