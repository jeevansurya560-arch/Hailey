import React, { Suspense } from 'react'

const WalletProvider = React.lazy(() => import('../providers/WalletProvider.jsx'))
const WalletLinkSection = React.lazy(() =>
  import('./WalletLinkSection.jsx').then((module) => ({
    default: module.WalletLinkSection,
  }))
)

export function LazyWalletSection({ profile }) {
  return (
    <Suspense
      fallback={
        <div className="neu-pill flex items-center gap-2 rounded-full border border-[#E0D4C5] bg-[#F0E7DA] px-4 py-2 font-mono text-xs text-[#34252A]/60 animate-pulse">
          <span>Loading wallet interface...</span>
        </div>
      }
    >
      <WalletProvider>
        <WalletLinkSection profile={profile} />
      </WalletProvider>
    </Suspense>
  )
}
