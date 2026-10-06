import React, { Suspense } from 'react'

const WalletProvider = React.lazy(() => import('./WalletProvider.jsx'))
const WalletConnectButton = React.lazy(() =>
  import('./WalletConnectButton.jsx').then((module) => ({
    default: module.WalletConnectButton,
  }))
)

export function LazyWalletSection() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center gap-2 border border-[var(--line)] bg-[var(--paper)] px-3 py-1.5 font-mono text-xs text-[var(--ink-2)] animate-pulse">
          <span>Loading wallet interface...</span>
        </div>
      }
    >
      <WalletProvider>
        <WalletConnectButton />
      </WalletProvider>
    </Suspense>
  )
}
