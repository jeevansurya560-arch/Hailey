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
                    className="flex items-center gap-2 border border-[var(--ink)] bg-[var(--paper)] px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-[var(--ink)] shadow-[2px_2px_0_var(--ink)] hover:bg-[var(--paper-2)] transition-all"
                  >
                    <Wallet className="h-3.5 w-3.5 text-[var(--clay)]" />
                    <span>Connect Wallet</span>
                  </button>
                )
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="flex items-center gap-1.5 border border-[var(--clay)] bg-[var(--paper)] px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-[var(--clay)] shadow-[2px_2px_0_var(--clay)] hover:bg-red-50 transition-all"
                  >
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Switch to Monad</span>
                  </button>
                )
              }

              return (
                <div className="flex items-center gap-2">
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="flex items-center gap-1 border border-[var(--line)] bg-[var(--paper)] px-2.5 py-1 font-mono text-xs text-[var(--ink)] hover:border-[var(--ink)] transition-colors"
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>{chain.name}</span>
                  </button>

                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="flex items-center gap-1.5 border border-[var(--ink)] bg-[var(--paper)] px-3 py-1 font-mono text-xs text-[var(--ink)] shadow-[2px_2px_0_var(--ink)] hover:bg-[var(--paper-2)] transition-colors"
                  >
                    <Wallet className="h-3.5 w-3.5 text-[var(--onchain)]" />
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
