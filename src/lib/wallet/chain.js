import { defineChain } from 'viem'

export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [
        (typeof import.meta !== 'undefined' &&
          import.meta.env?.VITE_MONAD_RPC_URL) ||
          'https://testnet-rpc.monad.xyz',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'MonadVision',
      url:
        (typeof import.meta !== 'undefined' &&
          import.meta.env?.VITE_EXPLORER_URL) ||
          'https://testnet.monadvision.com',
    },
  },
  testnet: true,
})
