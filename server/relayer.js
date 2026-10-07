import {
  createPublicClient,
  createWalletClient,
  http,
  formatEther,
  defineChain,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

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
      http: [process.env.MONAD_RPC_URL || process.env.VITE_MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'MonadVision',
      url: process.env.VITE_EXPLORER_URL || 'https://testnet.monadvision.com',
    },
  },
  testnet: true,
})

import { HAILEY_CONTRIBUTIONS_ABI } from '../shared/contracts/HaileyContributions.abi.js'

export const haileyContributionsAbi = HAILEY_CONTRIBUTIONS_ABI

export class RelayerService {
  constructor(config) {
    this.rpcUrl =
      config?.rpcUrl ||
      process.env.MONAD_RPC_URL ||
      process.env.VITE_MONAD_RPC_URL ||
      'https://testnet-rpc.monad.xyz'
    this.contractAddress =
      config?.contractAddress ||
      process.env.CONTRACT_ADDRESS ||
      process.env.VITE_CONTRACT_ADDRESS ||
      '0x0000000000000000000000000000000000000000'
    this.privateKey =
      config?.privateKey ||
      process.env.RELAYER_PRIVATE_KEY ||
      process.env.ATTESTOR_PRIVATE_KEY
    this.minBalance =
      config?.minBalance ||
      parseFloat(process.env.RELAYER_MIN_BALANCE || '0.01')
  }

  getPublicClient() {
    return createPublicClient({
      chain: monadTestnet,
      transport: http(this.rpcUrl),
    })
  }

  getWalletClient() {
    if (!this.privateKey) {
      throw new Error('RELAYER_PRIVATE_KEY is not configured')
    }
    const account = privateKeyToAccount(this.privateKey)
    return createWalletClient({
      account,
      chain: monadTestnet,
      transport: http(this.rpcUrl),
    })
  }

  async checkBalance() {
    const publicClient = this.getPublicClient()
    if (!this.privateKey) {
      throw new Error('RELAYER_PRIVATE_KEY is not configured')
    }
    const account = privateKeyToAccount(this.privateKey)
    const balanceWei = await publicClient.getBalance({ address: account.address })
    const balanceEthStr = formatEther(balanceWei)
    const balanceNum = parseFloat(balanceEthStr)

    return {
      sufficient: balanceNum >= this.minBalance,
      balance: balanceEthStr,
      balanceNum,
    }
  }

  async attest(params) {
    if (!this.contractAddress || this.contractAddress === '0x0000000000000000000000000000000000000000') {
      return {
        status: 'failed',
        error: 'CONTRACT_ADDRESS is not deployed or configured',
      }
    }

    // 1. Pre-check relayer balance
    const balanceCheck = await this.checkBalance()
    if (!balanceCheck.sufficient) {
      return {
        status: 'failed',
        error: `Relayer balance (${balanceCheck.balance} MON) below minimum threshold (${this.minBalance} MON)`,
      }
    }

    const publicClient = this.getPublicClient()
    const walletClient = this.getWalletClient()

    let txHash
    try {
      // 2. Submit transaction
      txHash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: haileyContributionsAbi,
        functionName: 'attest',
        args: [
          params.contributor,
          params.communityId,
          params.contentHash,
          params.kind ?? 0,
        ],
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      return {
        status: 'failed',
        error: `Transaction submission failed: ${msg}`,
      }
    }

    // 3. Wait for receipt with 8s timeout
    try {
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
        timeout: 8000,
      })

      if (receipt.status === 'success') {
        return {
          txHash,
          status: 'attested',
        }
      } else {
        return {
          txHash,
          status: 'failed',
          error: 'Transaction reverted onchain',
        }
      }
    } catch {
      // 8s receipt timeout reached: leave status as submitted
      return {
        txHash,
        status: 'submitted',
        error: 'Receipt timed out after 8s; transaction submitted to mempool',
      }
    }
  }
}

export const relayer = new RelayerService()
