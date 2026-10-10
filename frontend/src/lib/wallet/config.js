import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import {
  injectedWallet,
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { createConfig, http } from 'wagmi'
import { monadTestnet } from './chain'

const rpcUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MONAD_RPC_URL) ||
  'https://testnet-rpc.monad.xyz'

const projectId =
  (typeof import.meta !== 'undefined' &&
    import.meta.env?.VITE_WALLETCONNECT_PROJECT_ID) ||
  ''

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended Wallets',
      wallets: [
        injectedWallet,
        metaMaskWallet,
        coinbaseWallet,
        ...(projectId ? [walletConnectWallet] : []),
      ],
    },
  ],
  {
    appName: 'Hailey',
    projectId: projectId || 'hailey-monad-l1',
  }
)

export const walletConfig = createConfig({
  connectors,
  chains: [monadTestnet],
  transports: {
    [monadTestnet.id]: http(rpcUrl),
  },
  ssr: false,
})

