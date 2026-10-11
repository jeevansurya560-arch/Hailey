import { describe, it, expect } from 'vitest'
import {
  VERIFIED_CULTURAL_ARCHIVE,
  fetchCulturalEntityBySlug,
} from '../../frontend/src/features/culture/services/culturalKnowledgeService.js'
import {
  VERIFIED_FESTIVALS,
  fetchFestivalBySlug,
} from '../../frontend/src/features/festivals/services/festivalService.js'

describe('Cultural Knowledge & Festival Archives Integrity Test', () => {
  it('contains verified cultural entities with academic citations', () => {
    expect(VERIFIED_CULTURAL_ARCHIVE.length).toBeGreaterThan(0)

    for (const item of VERIFIED_CULTURAL_ARCHIVE) {
      expect(item.name).toBeDefined()
      expect(item.region).toBeDefined()
      expect(item.country).toBeDefined()
      expect(item.practices.length).toBeGreaterThan(0)
      expect(item.sources.length).toBeGreaterThan(0)
      expect(item.timeline.length).toBeGreaterThan(0)

      for (const src of item.sources) {
        expect(src.title).toBeDefined()
        expect(src.author).toBeDefined()
        expect(src.publisher).toBeDefined()
      }
    }
  })

  it('contains multi-year festival occurrences with calendar date rules', () => {
    expect(VERIFIED_FESTIVALS.length).toBeGreaterThan(0)

    for (const fest of VERIFIED_FESTIVALS) {
      expect(fest.name).toBeDefined()
      expect(fest.culturalOrigin).toBeDefined()
      expect(fest.dateRule).toBeDefined()
      expect(fest.rituals.length).toBeGreaterThan(0)
      expect(fest.occurrences.length).toBeGreaterThanOrEqual(3)

      const years = fest.occurrences.map((o) => o.year)
      expect(years).toContain(2025)
      expect(years).toContain(2026)
      expect(years).toContain(2027)

      for (const occ of fest.occurrences) {
        expect(occ.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        expect(occ.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      }
    }
  })

  it('fetches cultural entity by slug', async () => {
    const entity = await fetchCulturalEntityBySlug('kyoto-machiya-crafts')
    expect(entity).toBeDefined()
    expect(entity.name).toBe('Kyoto Machiya & Traditional Crafts')
  })

  it('fetches festival by slug', async () => {
    const fest = await fetchFestivalBySlug('diwali-deepavali')
    expect(fest).toBeDefined()
    expect(fest.name).toBe('Diwali (Deepavali)')
  })
})
