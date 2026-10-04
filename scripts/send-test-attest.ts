import fs from 'node:fs'
import path from 'node:path'
import { relayer } from '../server/relayer'
import { computeCommunityId, computeContentHash } from '../server/hash'
import type { Address } from 'viem'

// Load .env.local and .env into process.env if present
function loadEnv(filePath: string) {
  const fullPath = path.resolve(process.cwd(), filePath)
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim()
        const val = trimmed.slice(eqIdx + 1).trim()
        if (!process.env[key]) {
          process.env[key] = val
        }
      }
    }
  }
}

loadEnv('.env.local')
loadEnv('.env')

async function main() {
  console.log('=== Hailey — Send Test Attestation ===')

  const contractAddress = process.env.CONTRACT_ADDRESS || process.env.VITE_CONTRACT_ADDRESS
  const explorerBase = process.env.VITE_EXPLORER_URL || 'https://testnet.monadvision.com'
  const contributorAddress = (process.env.TEST_CONTRIBUTOR_ADDRESS ||
    process.env.ATTESTOR_ADDRESS ||
    '0x000000000000000000000000000000000000dEaD') as Address

  if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
    console.error('Error: CONTRACT_ADDRESS is not set. Please deploy HaileyContributions and add the address to .env.local')
    process.exit(1)
  }

  const sampleSlug = 'streetwear-archive'
  const communityId = computeCommunityId(sampleSlug)
  const sampleItemId = `test-item-${Date.now()}`
  const sampleCollectionId = 'col-demo-archive'

  const contentHash = computeContentHash({
    itemId: sampleItemId,
    collectionId: sampleCollectionId,
    communitySlug: sampleSlug,
    item: {
      kind: 'post',
      post_id: 'sample-post-id',
      note: 'Test attestation from local CLI script',
    },
  })

  console.log(`Target Contract:  ${contractAddress}`)
  console.log(`Contributor:      ${contributorAddress}`)
  console.log(`Community Slug:   ${sampleSlug} (ID: ${communityId.slice(0, 14)}...)`)
  console.log(`Content Hash:     ${contentHash}`)

  console.log('\nChecking relayer balance...')
  const balance = await relayer.checkBalance()
  console.log(`Relayer Balance:  ${balance.balance} MON (Sufficient: ${balance.sufficient})`)

  if (!balance.sufficient) {
    console.error(`Insufficient balance. Please fund relayer wallet from https://faucet.monad.xyz`)
    process.exit(1)
  }

  console.log('\nSending attestation transaction to Monad Testnet...')
  const result = await relayer.attest({
    contributor: contributorAddress,
    communityId,
    contentHash,
    kind: 0,
  })

  console.log(`\nResult Status:    ${result.status.toUpperCase()}`)
  if (result.txHash) {
    console.log(`Transaction Hash: ${result.txHash}`)
    console.log(`Explorer Link:    ${explorerBase}/tx/${result.txHash}`)
  }
  if (result.error) {
    console.log(`Note / Error:     ${result.error}`)
  }
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
