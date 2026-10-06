import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { monadTestnet } from './chain'
import { http } from 'viem'

const rpcUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MONAD_RPC_URL) ||
  'https://testnet-rpc.monad.xyz'

const projectId =
  (typeof import.meta !== 'undefined' &&
    import.meta.env?.VITE_WALLETCONNECT_PROJECT_ID) ||
  '3fcc6bba0f1de962d911bb5b5c3dba68'

export const walletConfig = getDefaultConfig({
  appName: 'Hailey',
  projectId,
  chains: [monadTestnet],
  transports: {
    [monadTestnet.id]: http(rpcUrl),
  },
  ssr: false,
})
