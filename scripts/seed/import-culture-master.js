/**
 * scripts/seed/import-culture-master.js
 *
 * Production Streaming Ingestion Utility for Hailey 1,000,000 Culture Master Dataset.
 * Streams JSON objects from Hailey_1M_Culture_Master_Dataset/cultures_1m.json
 * into Supabase PostgreSQL culture_master_dataset table in batched chunks.
 *
 * Usage:
 *   node scripts/seed/import-culture-master.js [--limit 1000] [--batch 250] [--dry-run]
 */

import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

function loadEnv(filePath) {
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

const args = process.argv.slice(2)
let limit = Infinity
let batchSize = 250
let isDryRun = false

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--limit' && args[i + 1]) {
    limit = parseInt(args[i + 1], 10)
    i++
  } else if (args[i] === '--batch' && args[i + 1]) {
    batchSize = parseInt(args[i + 1], 10)
    i++
  } else if (args[i] === '--dry-run') {
    isDryRun = true
  }
}

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://ycftnowviqyapxycirwz.supabase.co'

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const datasetPath = path.resolve(
  process.cwd(),
  'Hailey_1M_Culture_Master_Dataset/cultures_1m.json'
)

if (!fs.existsSync(datasetPath)) {
  console.error(`❌ Dataset file not found at: ${datasetPath}`)
  process.exit(1)
}

console.log('🏛️ ==========================================================')
console.log('🏛️ Hailey — 1M Culture Master Dataset Streaming Ingestor')
console.log('🏛️ ==========================================================')
console.log(`📦 Source: ${datasetPath}`)
console.log(`🎯 Target URL: ${supabaseUrl}`)
console.log(`⚙️ Limit: ${limit === Infinity ? 'Full 1,000,000' : limit}`)
console.log(`⚙️ Batch Size: ${batchSize}`)
console.log(`⚙️ Dry Run: ${isDryRun ? 'YES (No DB Writes)' : 'NO'}\n`)

async function runIngestion() {
  const stream = fs.createReadStream(datasetPath, {
    encoding: 'utf8',
    highWaterMark: 128 * 1024,
  })

  let buffer = ''
  let currentBatch = []
  let totalProcessed = 0
  let totalInserted = 0
  let isAborted = false

  async function flushBatch() {
    if (currentBatch.length === 0) return
    const toInsert = [...currentBatch]
    currentBatch = []

    if (isDryRun) {
      totalInserted += toInsert.length
      console.log(`[DRY-RUN] Processed batch of ${toInsert.length} (Total: ${totalInserted})`)
      return
    }

    try {
      const rows = toInsert.map((item) => ({
        slug: item.slug,
        name: item.name,
        kind: item.kind || 'culture',
        origin: item.origin || 'Global',
        era: item.era || null,
        description: item.description || '',
        related_tags: Array.isArray(item.related_tags) ? item.related_tags : [],
        community_slug: item.community_slug || null,
        experiences: item.experiences || [],
        places: item.places || [],
        people: item.people || [],
        practices: item.practices || [],
        artifacts: item.artifacts || [],
        timeline: item.timeline || [],
        media: item.media || {},
        sources: item.sources || [],
        editorial_status: item.editorial_status || 'synthetic_research_node_requires_verification',
        expansion_metadata: item.expansion_metadata || {},
        is_original_seed: Boolean(item.expansion_metadata?.is_original_seed),
      }))

      const { error } = await supabase
        .from('culture_master_dataset')
        .upsert(rows, { onConflict: 'slug' })

      if (error) {
        console.warn(`⚠️ Warning on batch insert (${toInsert.length} items):`, error.message)
      } else {
        totalInserted += toInsert.length
        if (totalInserted % 1000 === 0 || totalInserted === limit) {
          console.log(`  ✓ Inserted ${totalInserted} records so far...`)
        }
      }
    } catch (err) {
      console.error('Batch execution error:', err.message)
    }
  }

  return new Promise((resolve, reject) => {
    stream.on('data', async (chunk) => {
      if (isAborted) return
      buffer += chunk

      let splitIdx = buffer.indexOf('}},{"slug":')
      while (splitIdx !== -1) {
        let rawItem = buffer.slice(0, splitIdx + 2)
        if (rawItem.startsWith('[')) rawItem = rawItem.slice(1)
        if (rawItem.startsWith(',')) rawItem = rawItem.slice(1)

        try {
          const parsed = JSON.parse(rawItem)
          currentBatch.push(parsed)
          totalProcessed++

          if (totalProcessed >= limit) {
            isAborted = true
            stream.destroy()
            break
          }

          if (currentBatch.length >= batchSize) {
            stream.pause()
            await flushBatch()
            stream.resume()
          }
        } catch {
          // Keep chunking if incomplete
        }

        buffer = buffer.slice(splitIdx + 3) // past the comma
        splitIdx = buffer.indexOf('}},{"slug":')
      }

      if (buffer.length > 5 * 1024 * 1024) {
        buffer = buffer.slice(-1024 * 1024)
      }
    })

    stream.on('end', async () => {
      if (buffer.length > 0 && !isAborted) {
        let lastPart = buffer.trim()
        if (lastPart.endsWith(']')) lastPart = lastPart.slice(0, -1)
        if (lastPart.startsWith(',')) lastPart = lastPart.slice(1)
        try {
          const parsed = JSON.parse(lastPart)
          currentBatch.push(parsed)
          totalProcessed++
        } catch {
          // Trailing bytes
        }
      }
      await flushBatch()
      resolve({ totalProcessed, totalInserted })
    })

    stream.on('close', async () => {
      await flushBatch()
      resolve({ totalProcessed, totalInserted })
    })

    stream.on('error', (err) => {
      reject(err)
    })
  })
}

runIngestion()
  .then(({ totalProcessed, totalInserted }) => {
    console.log('\n✅ ==========================================================')
    console.log(`✅ Ingestion Complete! Processed: ${totalProcessed}, Inserted: ${totalInserted}`)
    console.log('✅ ==========================================================\n')
  })
  .catch((err) => {
    console.error('Fatal ingestion failure:', err)
    process.exit(1)
  })
