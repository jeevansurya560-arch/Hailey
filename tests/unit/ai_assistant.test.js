import { describe, it, expect } from 'vitest'
import { aiAssistantService } from '../../server/services/ai/aiProviderService.js'

describe('server/services/ai/aiProviderService.js - Cultural AI Grounding Test', () => {
  it('answers queries matching verified cultural records with academic citations', async () => {
    const res = await aiAssistantService.answerCulturalQuery('Tell me about Kyoto Machiya traditions')
    expect(res.grounded).toBe(true)
    expect(res.sources.length).toBeGreaterThan(0)
    expect(res.answer).toContain('Kyoto')
    expect(res.answer).toContain('Machiya')
  })

  it('answers festival queries with verified observances', async () => {
    const res = await aiAssistantService.answerCulturalQuery('What are the rituals of Diwali?')
    expect(res.grounded).toBe(true)
    expect(res.sources.length).toBeGreaterThan(0)
    expect(res.answer).toContain('Diwali')
    expect(res.answer).toContain('diyas')
  })

  it('returns safe fallback without fabricating when external provider key is unset', async () => {
    const res = await aiAssistantService.answerCulturalQuery('What is an unknown mythical festival XYZ-999?')
    expect(res.grounded).toBe(false)
    expect(res.sources.length).toBe(0)
    expect(res.provider).toBe('safe_offline_fallback')
    expect(res.answer).toContain('Hailey Cultural Assistant only provides responses verified by primary anthropological sources')
  })

  it('rejects invalid empty query with error', async () => {
    await expect(aiAssistantService.answerCulturalQuery('')).rejects.toThrow('Query must be a non-empty string')
  })
})
