/**
 * Single Canonical Source of Truth for HaileyContributions Smart Contract
 * Deployed on Monad Testnet (Chain ID 10143)
 */

export const HAILEY_CONTRIBUTIONS_ABI = [
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
  {
    type: 'function',
    name: 'setAttestor',
    inputs: [{ name: 'newAttestor', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'Attested',
    inputs: [
      { name: 'contributor', type: 'address', indexed: true },
      { name: 'communityId', type: 'bytes32', indexed: true },
      { name: 'contentHash', type: 'bytes32', indexed: false },
      { name: 'kind', type: 'uint8', indexed: false },
      { name: 'at', type: 'uint64', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'AttestorUpdated',
    inputs: [
      { name: 'previousAttestor', type: 'address', indexed: true },
      { name: 'newAttestor', type: 'address', indexed: true },
    ],
  },
]

export const DEFAULT_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'
