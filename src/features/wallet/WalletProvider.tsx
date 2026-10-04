import React from 'react'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { walletConfig } from './config'

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={walletConfig}>
      <RainbowKitProvider
        theme={lightTheme({
          accentColor: '#B8452E',
          accentColorForeground: '#F7F2E8',
          borderRadius: 'small',
          fontStack: 'system',
        })}
      >
        {children}
      </RainbowKitProvider>
    </WagmiProvider>
  )
}

export default WalletProvider
