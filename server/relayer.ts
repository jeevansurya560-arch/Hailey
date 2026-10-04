import {
  createPublicClient,
  createWalletClient,
  http,
  formatEther,
  defineChain,
  type Address,
  type Hash,
  type Hex,
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

export const haileyContributionsAbi = [
  {
    type: 'function',
    name: 'attest',
    inputs: [
      { name: 'contributor', type: 'address' },
      { name: 'communityId', type: 'bytes32' },
      { name: 'contentHash', type: 'bytes32' },
      { name: 'kind', type: 'uint8' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'attested',
    inputs: [{ name: 'contentHash', type: 'bytes32' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'count',
    inputs: [
      { name: 'contributor', type: 'address' },
      { name: 'communityId', type: 'bytes32' },
    ],
    outputs: [{ name: '', type: 'uint32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'attestor',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
] as const

export interface AttestResult {
  txHash?: Hash
  status: 'attested' | 'failed' | 'submitted'
  error?: string
}

export class RelayerService {
  private rpcUrl: string
  private contractAddress: Address
  private privateKey?: Hex
  private minBalance: number

  constructor(config?: {
    rpcUrl?: string
    contractAddress?: Address
    privateKey?: Hex
    minBalance?: number
  }) {
    this.rpcUrl =
      config?.rpcUrl ||
      process.env.MONAD_RPC_URL ||
      process.env.VITE_MONAD_RPC_URL ||
      'https://testnet-rpc.monad.xyz'
    this.contractAddress =
      config?.contractAddress ||
      (process.env.CONTRACT_ADDRESS as Address) ||
      (process.env.VITE_CONTRACT_ADDRESS as Address)
    this.privateKey =
      config?.privateKey ||
      (process.env.ATTESTOR_PRIVATE_KEY as Hex | undefined)
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
      throw new Error('ATTESTOR_PRIVATE_KEY is not configured')
    }
    const account = privateKeyToAccount(this.privateKey)
    return createWalletClient({
      account,
      chain: monadTestnet,
      transport: http(this.rpcUrl),
    })
  }

  async checkBalance(): Promise<{ sufficient: boolean; balance: string; balanceNum: number }> {
    const publicClient = this.getPublicClient()
    if (!this.privateKey) {
      throw new Error('ATTESTOR_PRIVATE_KEY is not configured')
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

  async attest(params: {
    contributor: Address
    communityId: Hex
    contentHash: Hex
    kind?: number // 0 = Collection
  }): Promise<AttestResult> {
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

    let txHash: Hash | undefined
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
    } catch (err: unknown) {
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
