import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import {
  fetchCultureMasterNodes,
  fetchCultureMasterNodeBySlug,
  fetchCultureMasterDistribution,
} from '../../frontend/src/features/culture/services/cultureMasterService.js'

describe('Hailey 1,000,000 Culture Master Dataset Suite', () => {
  it('verifies SQL migration 0007 exists and defines high-performance schema', () => {
    const migrationPath = path.resolve('supabase/migrations/0007_culture_master_dataset.sql')
    expect(fs.existsSync(migrationPath)).toBe(true)

    const sqlContent = fs.readFileSync(migrationPath, 'utf8')
    expect(sqlContent).toContain('create table if not exists public.culture_master_dataset')
    expect(sqlContent).toContain('idx_culture_master_slug')
    expect(sqlContent).toContain('idx_culture_master_origin')
    expect(sqlContent).toContain('idx_culture_master_fts')
    expect(sqlContent).toContain('enable row level security')
    expect(sqlContent).toContain('search_culture_master_nodes')
    expect(sqlContent).toContain('get_culture_master_stats')
  })

  it('validates distribution metrics for 1M dataset', async () => {
    const dist = await fetchCultureMasterDistribution()
    expect(dist.total_records).toBe(1000000)
    expect(dist.original_seed_records).toBe(50)
    expect(dist.priority_regions.India).toBe(220000)
    expect(dist.priority_regions['United States']).toBe(190000)
    expect(dist.priority_regions.Germany).toBe(150000)
    expect(dist.priority_regions.Japan).toBe(120000)
  })

  it('fetches master dataset nodes with pagination and query filters', async () => {
    const resAll = await fetchCultureMasterNodes({ page: 1, limit: 10 })
    expect(resAll.nodes.length).toBeGreaterThan(0)
    expect(resAll.pagination.total).toBeGreaterThan(0)

    // Filter by origin India
    const resIndia = await fetchCultureMasterNodes({ origin: 'India' })
    expect(resIndia.nodes.length).toBeGreaterThan(0)
    for (const node of resIndia.nodes) {
      expect(node.origin.toLowerCase()).toBe('india')
    }

    // Filter by kind music
    const resMusic = await fetchCultureMasterNodes({ kind: 'music' })
    expect(resMusic.nodes.length).toBeGreaterThan(0)
    for (const node of resMusic.nodes) {
      expect(node.kind.toLowerCase()).toBe('music')
    }

    // Filter by seed only
    const resSeeds = await fetchCultureMasterNodes({ seedOnly: true })
    expect(resSeeds.nodes.length).toBeGreaterThan(0)
    for (const node of resSeeds.nodes) {
      expect(node.is_original_seed).toBe(true)
    }
  })

  it('fetches single master node by slug with complete research metadata', async () => {
    const slug = 'culture_0_0_1'
    const node = await fetchCultureMasterNodeBySlug(slug)
    expect(node).toBeDefined()
    expect(node.slug).toBe(slug)
    expect(node.origin).toBe('India')
    expect(node.kind).toBe('music')
    expect(node.experiences.length).toBeGreaterThan(0)
    expect(node.places.length).toBeGreaterThan(0)
    expect(node.practices.length).toBeGreaterThan(0)
    expect(node.timeline.length).toBeGreaterThan(0)
    expect(node.sources.length).toBeGreaterThan(0)
  })

  it('ensures bulk ingestion script is present and valid', () => {
    const scriptPath = path.resolve('scripts/seed/import-culture-master.js')
    expect(fs.existsSync(scriptPath)).toBe(true)
    const scriptContent = fs.readFileSync(scriptPath, 'utf8')
    expect(scriptContent).toContain('runIngestion')
    expect(scriptContent).toContain('culture_master_dataset')
  })
})
