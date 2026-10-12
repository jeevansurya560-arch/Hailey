/**
 * tests/unit/festival_calendar.test.js
 *
 * Unit tests for the Global Festival Calendar & Cultural Knowledge Engine.
 *
 * Tests cover:
 * 1. VERIFIED_FESTIVALS dataset integrity
 * 2. Calendar date utility functions
 * 3. Festival data normalization logic
 * 4. Composable filter logic
 * 5. Event map building
 * 6. FestivalService fallback behavior
 */

import { describe, it, expect, vi } from 'vitest'

// ─── Import the static dataset ────────────────────────────────────────────────
import {
  VERIFIED_FESTIVALS,
  VERIFIED_CULTURAL_ARCHIVE,
} from '../../shared/data/culturalDatasets.js'

// ─── Pure utility functions copied from FestivalsPage for unit testing ─────────
// (In production, these would be extracted to a shared utils module)

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay()
}

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

function toISODate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function parseISODate(str) {
  if (!str) return null
  const [y, m, d] = str.split('-').map(Number)
  return { year: y, month: m - 1, day: d }
}

function formatDateRange(startDateStr, endDateStr) {
  if (!startDateStr) return ''
  const start = parseISODate(startDateStr)
  if (!start) return startDateStr
  const shortMonths = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const startMonthName = shortMonths[start.month]

  if (!endDateStr || endDateStr === startDateStr) {
    return `${startMonthName} ${start.day}, ${start.year}`
  }

  const end = parseISODate(endDateStr)
  if (!end) return `${startDateStr} – ${endDateStr}`

  if (start.year === end.year && start.month === end.month) {
    return `${startMonthName} ${start.day}–${end.day}, ${start.year}`
  }

  const endMonthName = shortMonths[end.month]
  if (start.year === end.year) {
    return `${startMonthName} ${start.day} – ${endMonthName} ${end.day}, ${start.year}`
  }

  return `${startMonthName} ${start.day}, ${start.year} – ${endMonthName} ${end.day}, ${end.year}`
}

function normalizeFestival(raw) {
  if (raw.slug && raw.alternate_names !== undefined) {
    return {
      id: raw.id,
      slug: raw.slug,
      name: raw.name,
      alternateNames: raw.alternate_names || [],
      culturalOrigin: raw.cultural_origin || '',
      religion: raw.religion || '',
      category: raw.category || '',
      countries: raw.countries || [],
      regions: raw.regions || [],
      typicalMonth: raw.typical_month,
      dateRule: raw.date_rule || '',
      significance: raw.significance || '',
      history: raw.history || '',
      rituals: raw.rituals || [],
      food: raw.food || [],
      clothing: raw.clothing || [],
      music: raw.music || [],
      occurrences: (raw.festival_occurrences || []).map(o => ({
        year: o.year,
        startDate: o.start_date,
        endDate: o.end_date,
        regionNotes: o.region_notes || '',
        verified: o.verified !== false,
      })),
      sources: raw.sources || [],
    }
  }
  return { ...raw, religion: raw.religion || '', category: raw.category || '' }
}

function buildEventMap(festivals, year) {
  const map = {}
  for (const f of festivals) {
    const occ = f.occurrences?.find(o => o.year === year)
    if (!occ?.startDate) continue
    const start = parseISODate(occ.startDate)
    const end = parseISODate(occ.endDate || occ.startDate)
    if (!start) continue
    let current = new Date(start.year, start.month, start.day)
    const endDate = end ? new Date(end.year, end.month, end.day) : current
    let steps = 0
    while (current <= endDate && steps < 32) {
      const key = toISODate(current.getFullYear(), current.getMonth(), current.getDate())
      if (!map[key]) map[key] = []
      map[key].push(f)
      current.setDate(current.getDate() + 1)
      steps++
    }
  }
  return map
}

function dateInOccurrence(dateStr, occ) {
  if (!occ?.startDate) return false
  return dateStr >= occ.startDate && dateStr <= (occ.endDate || occ.startDate)
}

function getFestivalOccurrenceStatus(occurrence, todayObj) {
  if (!occurrence?.startDate) return 'unknown'
  const todayStr = toISODate(todayObj.year, todayObj.month, todayObj.day)
  const startStr = occurrence.startDate
  const endStr = occurrence.endDate || occurrence.startDate

  if (endStr < todayStr) return 'completed'
  if (startStr <= todayStr && todayStr <= endStr) return 'today'
  return 'upcoming'
}

function applyFilters(festivals, { year, month, selectedDate = null, tradition = 'all', region = 'all', category = 'all', searchQuery = '' }) {
  return festivals.filter(f => {
    if (selectedDate) {
      const dateStr = toISODate(selectedDate.year, selectedDate.month, selectedDate.day)
      const hasDate = f.occurrences?.some(o => {
        if (o.year !== selectedDate.year) return false
        return dateInOccurrence(dateStr, o)
      })
      if (!hasDate) return false
    } else if (year !== undefined && month !== undefined) {
      const hasOccurrenceInMonth = f.occurrences?.some(o => {
        if (o.year !== year) return false
        const start = parseISODate(o.startDate)
        const end = parseISODate(o.endDate || o.startDate)
        if (!start) return false
        const occStartMonth = start.month
        const occEndMonth = end ? end.month : occStartMonth
        const occStartYear = start.year
        const occEndYear = end ? end.year : occStartYear
        const selStart = new Date(year, month, 1)
        const selEnd = new Date(year, month + 1, 0)
        const occStart = new Date(occStartYear, occStartMonth, start.day)
        const occEnd = new Date(occEndYear, occEndMonth, end ? end.day : start.day)
        return occStart <= selEnd && occEnd >= selStart
      })
      if (!hasOccurrenceInMonth) return false
    }

    if (tradition && tradition !== 'all') {
      const rel = (f.religion || '').toLowerCase()
      const trad = (f.traditionType || '').toLowerCase()
      const t = tradition.toLowerCase()
      if (!rel.includes(t) && !trad.includes(t)) return false
    }

    if (region && region !== 'all') {
      const reg = region.toLowerCase()
      const matchesRegion = (f.regions || []).some(r => r.toLowerCase().includes(reg)) ||
                            (f.countries || []).some(c => c.toLowerCase().includes(reg))
      if (!matchesRegion) return false
    }

    if (category && category !== 'all') {
      if (!(f.category || '').toLowerCase().includes(category.toLowerCase())) return false
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      const searchable = [
        f.name,
        ...(f.alternateNames || []),
        f.significance,
        f.culturalOrigin,
        ...(f.countries || []),
        ...(f.regions || []),
        f.religion,
        f.category,
      ].join(' ').toLowerCase()
      if (!searchable.includes(q)) return false
    }
    return true
  })
}

// ─── 1. VERIFIED_FESTIVALS Dataset Integrity ─────────────────────────────────

describe('VERIFIED_FESTIVALS — dataset integrity', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(VERIFIED_FESTIVALS)).toBe(true)
    expect(VERIFIED_FESTIVALS.length).toBeGreaterThanOrEqual(20)
  })

  it('every festival has required fields', () => {
    for (const f of VERIFIED_FESTIVALS) {
      expect(f.id, `${f.name}: missing id`).toBeTruthy()
      expect(f.slug, `${f.name}: missing slug`).toBeTruthy()
      expect(f.name, `${f.id}: missing name`).toBeTruthy()
      expect(f.significance, `${f.name}: missing significance`).toBeTruthy()
      expect(f.history, `${f.name}: missing history`).toBeTruthy()
      expect(Array.isArray(f.rituals), `${f.name}: rituals not array`).toBe(true)
      expect(Array.isArray(f.occurrences), `${f.name}: occurrences not array`).toBe(true)
      expect(Array.isArray(f.sources), `${f.name}: sources not array`).toBe(true)
    }
  })

  it('all slugs are unique', () => {
    const slugs = VERIFIED_FESTIVALS.map(f => f.slug)
    const uniqueSlugs = new Set(slugs)
    expect(uniqueSlugs.size).toBe(slugs.length)
  })

  it('all ids are unique', () => {
    const ids = VERIFIED_FESTIVALS.map(f => f.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('all occurrence startDates are valid ISO date strings (YYYY-MM-DD)', () => {
    const isoPattern = /^\d{4}-\d{2}-\d{2}$/
    for (const f of VERIFIED_FESTIVALS) {
      for (const occ of f.occurrences || []) {
        expect(
          isoPattern.test(occ.startDate),
          `${f.name} ${occ.year}: invalid startDate "${occ.startDate}"`
        ).toBe(true)
      }
    }
  })

  it('occurrence years are within 2025–2035 range', () => {
    for (const f of VERIFIED_FESTIVALS) {
      for (const occ of f.occurrences || []) {
        expect(occ.year, `${f.name}: year out of range`).toBeGreaterThanOrEqual(2025)
        expect(occ.year, `${f.name}: year out of range`).toBeLessThanOrEqual(2035)
      }
    }
  })

  it('endDate is not before startDate when both are present', () => {
    for (const f of VERIFIED_FESTIVALS) {
      for (const occ of f.occurrences || []) {
        if (occ.endDate) {
          expect(
            occ.endDate >= occ.startDate,
            `${f.name} ${occ.year}: endDate (${occ.endDate}) is before startDate (${occ.startDate})`
          ).toBe(true)
        }
      }
    }
  })

  it('all festivals have at least one occurrence', () => {
    for (const f of VERIFIED_FESTIVALS) {
      expect(
        (f.occurrences || []).length,
        `${f.name}: has no occurrences`
      ).toBeGreaterThan(0)
    }
  })

  it('covers known major world festivals', () => {
    const slugs = new Set(VERIFIED_FESTIVALS.map(f => f.slug))
    const required = [
      'diwali-deepavali',
      'eid-al-fitr',
      'eid-al-adha',
      'chinese-new-year-spring-festival',
      'yom-kippur',
      'easter-resurrection-sunday',
      'christmas',
      'nowruz-persian-new-year',
      'holi-festival-of-colors',
      'vesak-buddha-day',
    ]
    for (const slug of required) {
      expect(slugs.has(slug), `Missing required festival: ${slug}`).toBe(true)
    }
  })

  it('contains Chinese / East Asian festivals', () => {
    const slugs = new Set(VERIFIED_FESTIVALS.map(f => f.slug))
    const chineseFestivals = [
      'chinese-new-year-spring-festival',
      'lantern-festival-yuanxiao',
      'qingming-festival',
      'dragon-boat-festival',
      'mid-autumn-festival',
    ]
    for (const slug of chineseFestivals) {
      expect(slugs.has(slug), `Missing Chinese festival: ${slug}`).toBe(true)
    }
  })

  it('all occurrences have verified flag', () => {
    for (const f of VERIFIED_FESTIVALS) {
      for (const occ of f.occurrences || []) {
        expect(
          typeof occ.verified === 'boolean',
          `${f.name} ${occ.year}: verified flag missing or not boolean`
        ).toBe(true)
      }
    }
  })
})

// ─── 2. VERIFIED_CULTURAL_ARCHIVE integrity ────────────────────────────────────

describe('VERIFIED_CULTURAL_ARCHIVE — dataset integrity', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(VERIFIED_CULTURAL_ARCHIVE)).toBe(true)
    expect(VERIFIED_CULTURAL_ARCHIVE.length).toBeGreaterThanOrEqual(3)
  })

  it('every archive entry has required fields', () => {
    for (const entry of VERIFIED_CULTURAL_ARCHIVE) {
      expect(entry.slug, 'missing slug').toBeTruthy()
      expect(entry.name, 'missing name').toBeTruthy()
      expect(entry.summary, `${entry.name}: missing summary`).toBeTruthy()
      expect(entry.history, `${entry.name}: missing history`).toBeTruthy()
    }
  })
})

// ─── 3. Calendar Date Utilities ───────────────────────────────────────────────

describe('Calendar utility — getDaysInMonth', () => {
  it('returns 31 for January', () => expect(getDaysInMonth(2025, 0)).toBe(31))
  it('returns 28 for February in non-leap year', () => expect(getDaysInMonth(2025, 1)).toBe(28))
  it('returns 29 for February in leap year', () => expect(getDaysInMonth(2028, 1)).toBe(29))
  it('returns 30 for April', () => expect(getDaysInMonth(2025, 3)).toBe(30))
  it('returns 31 for December', () => expect(getDaysInMonth(2025, 11)).toBe(31))
})

describe('Calendar utility — isLeapYear', () => {
  it('identifies 2024 as a leap year', () => expect(isLeapYear(2024)).toBe(true))
  it('identifies 2028 as a leap year', () => expect(isLeapYear(2028)).toBe(true))
  it('identifies 2025 as not a leap year', () => expect(isLeapYear(2025)).toBe(false))
  it('identifies 2100 as not a leap year (century rule)', () => expect(isLeapYear(2100)).toBe(false))
  it('identifies 2000 as a leap year (400 rule)', () => expect(isLeapYear(2000)).toBe(true))
})

describe('Calendar utility — toISODate', () => {
  it('formats January 1 correctly', () => expect(toISODate(2025, 0, 1)).toBe('2025-01-01'))
  it('pads month and day with leading zero', () => expect(toISODate(2025, 2, 5)).toBe('2025-03-05'))
  it('formats December 31 correctly', () => expect(toISODate(2025, 11, 31)).toBe('2025-12-31'))
})

describe('Calendar utility — parseISODate', () => {
  it('parses a valid ISO date', () => {
    const result = parseISODate('2025-10-20')
    expect(result).toEqual({ year: 2025, month: 9, day: 20 }) // month is 0-indexed
  })
  it('parses January correctly (month 0)', () => {
    const result = parseISODate('2025-01-29')
    expect(result).toEqual({ year: 2025, month: 0, day: 29 })
  })
  it('returns null for empty string', () => expect(parseISODate('')).toBeNull())
  it('returns null for null', () => expect(parseISODate(null)).toBeNull())
})

describe('Calendar utility — getFirstDayOfWeek', () => {
  it('January 2025 starts on Wednesday (day 3)', () => expect(getFirstDayOfWeek(2025, 0)).toBe(3))
  it('returns a value between 0 and 6', () => {
    for (let m = 0; m < 12; m++) {
      const dow = getFirstDayOfWeek(2025, m)
      expect(dow).toBeGreaterThanOrEqual(0)
      expect(dow).toBeLessThanOrEqual(6)
    }
  })
})

// ─── 4. Data Normalization ────────────────────────────────────────────────────

describe('normalizeFestival — Supabase snake_case shape', () => {
  const supabaseRecord = {
    id: 'abc-123',
    slug: 'test-festival',
    name: 'Test Festival',
    alternate_names: ['Alt Name'],
    cultural_origin: 'Test Origin',
    religion: 'Test Religion',
    category: 'Religious',
    countries: ['Country A'],
    regions: ['Region A'],
    typical_month: 3,
    date_rule: 'fixed_gregorian',
    significance: 'Test significance.',
    history: 'Test history.',
    rituals: ['Ritual 1'],
    food: ['Food 1'],
    clothing: ['Clothing 1'],
    music: ['Music 1'],
    festival_occurrences: [
      { year: 2025, start_date: '2025-04-01', end_date: '2025-04-01', region_notes: 'Test notes', verified: true }
    ],
    sources: [],
  }

  it('converts snake_case to camelCase correctly', () => {
    const normalized = normalizeFestival(supabaseRecord)
    expect(normalized.alternateNames).toEqual(['Alt Name'])
    expect(normalized.culturalOrigin).toBe('Test Origin')
    expect(normalized.typicalMonth).toBe(3)
    expect(normalized.dateRule).toBe('fixed_gregorian')
  })

  it('converts festival_occurrences to camelCase', () => {
    const normalized = normalizeFestival(supabaseRecord)
    expect(normalized.occurrences).toHaveLength(1)
    expect(normalized.occurrences[0].startDate).toBe('2025-04-01')
    expect(normalized.occurrences[0].regionNotes).toBe('Test notes')
    expect(normalized.occurrences[0].verified).toBe(true)
  })
})

describe('normalizeFestival — JS camelCase shape (VERIFIED_FESTIVALS passthrough)', () => {
  it('passes through camelCase records unchanged', () => {
    const festival = VERIFIED_FESTIVALS[0]
    const normalized = normalizeFestival(festival)
    expect(normalized.id).toBe(festival.id)
    expect(normalized.slug).toBe(festival.slug)
    expect(normalized.name).toBe(festival.name)
    expect(normalized.occurrences).toEqual(festival.occurrences)
  })
})

// ─── 5. Event Map Building ────────────────────────────────────────────────────

describe('buildEventMap', () => {

  it('builds a map with entries for Diwali 2025 dates', () => {
    const map = buildEventMap(VERIFIED_FESTIVALS, 2025)
    // Diwali 2025: Oct 20–24
    expect(map['2025-10-20']).toBeDefined()
    expect(map['2025-10-20'].some(f => f.slug === 'diwali-deepavali')).toBe(true)
    expect(map['2025-10-24']).toBeDefined()
  })

  it('includes Christmas on Dec 25', () => {
    const map = buildEventMap(VERIFIED_FESTIVALS, 2025)
    expect(map['2025-12-25']).toBeDefined()
    expect(map['2025-12-25'].some(f => f.slug === 'christmas')).toBe(true)
  })

  it('includes Chinese New Year on Jan 29, 2025', () => {
    const map = buildEventMap(VERIFIED_FESTIVALS, 2025)
    expect(map['2025-01-29']).toBeDefined()
    expect(map['2025-01-29'].some(f => f.slug === 'chinese-new-year-spring-festival')).toBe(true)
  })

  it('does not include festivals from a different year', () => {
    const map = buildEventMap(VERIFIED_FESTIVALS, 2030)
    // 2025 dates should not appear
    expect(map['2025-10-20']).toBeUndefined()
    expect(map['2025-12-25']).toBeUndefined()
  })

  it('returns empty map for year with no occurrences', () => {
    // Create festivals with no 2020 occurrences
    const sampleFestivals = [VERIFIED_FESTIVALS[0]]
    const map = buildEventMap(sampleFestivals, 2020)
    expect(Object.keys(map)).toHaveLength(0)
  })

  it('handles single-day festivals correctly', () => {
    const singleDay = [{
      id: 'test-single',
      slug: 'test-single',
      name: 'Single Day Test',
      occurrences: [{ year: 2025, startDate: '2025-06-15', endDate: '2025-06-15', verified: true }]
    }]
    const map = buildEventMap(singleDay, 2025)
    expect(map['2025-06-15']).toHaveLength(1)
    expect(map['2025-06-14']).toBeUndefined()
    expect(map['2025-06-16']).toBeUndefined()
  })

  it('handles multi-day festivals spanning multiple days', () => {
    const multiDay = [{
      id: 'test-multi',
      slug: 'test-multi',
      name: 'Multi Day Test',
      occurrences: [{ year: 2025, startDate: '2025-03-01', endDate: '2025-03-05', verified: true }]
    }]
    const map = buildEventMap(multiDay, 2025)
    for (const d of ['2025-03-01', '2025-03-02', '2025-03-03', '2025-03-04', '2025-03-05']) {
      expect(map[d], `Missing day ${d}`).toBeDefined()
    }
    expect(map['2025-02-28']).toBeUndefined()
    expect(map['2025-03-06']).toBeUndefined()
  })
})

// ─── 6. Filter Logic ──────────────────────────────────────────────────────────

describe('applyFilters — month filter', () => {
  it('returns only festivals that fall in the selected month/year', () => {
    // January 2025: Chinese New Year, New Year's Day, Lantern Festival
    const janFestivals = applyFilters(VERIFIED_FESTIVALS, {
      year: 2025,
      month: 0, // January
      tradition: 'all',
      category: 'all',
      searchQuery: '',
    })
    expect(janFestivals.length).toBeGreaterThan(0)
    // All must have a 2025 occurrence that overlaps January
    for (const f of janFestivals) {
      const has = f.occurrences?.some(o => {
        if (o.year !== 2025) return false
        const start = parseISODate(o.startDate)
        return start && start.month === 0
      })
      expect(has, `${f.name}: incorrectly shown in January`).toBe(true)
    }
  })

  it('returns Chinese New Year in January 2025', () => {
    const janFestivals = applyFilters(VERIFIED_FESTIVALS, {
      year: 2025, month: 0, tradition: 'all', category: 'all', searchQuery: '',
    })
    expect(janFestivals.some(f => f.slug === 'chinese-new-year-spring-festival')).toBe(true)
  })

  it('returns Diwali in October 2025', () => {
    const octFestivals = applyFilters(VERIFIED_FESTIVALS, {
      year: 2025, month: 9, tradition: 'all', category: 'all', searchQuery: '',
    })
    expect(octFestivals.some(f => f.slug === 'diwali-deepavali')).toBe(true)
  })

  it('does NOT return Diwali in January 2025', () => {
    const janFestivals = applyFilters(VERIFIED_FESTIVALS, {
      year: 2025, month: 0, tradition: 'all', category: 'all', searchQuery: '',
    })
    expect(janFestivals.some(f => f.slug === 'diwali-deepavali')).toBe(false)
  })

  it('returns empty array for a month with no festivals in a given year', () => {
    // Use a festival set with no February entries for 2030
    const subSet = VERIFIED_FESTIVALS.filter(f => f.slug === 'diwali-deepavali')
    const result = applyFilters(subSet, {
      year: 2030, month: 1, tradition: 'all', category: 'all', searchQuery: '',
    })
    expect(result).toHaveLength(0)
  })
})

describe('applyFilters — tradition filter', () => {
  it('filters to Hinduism festivals only', () => {
    const result = applyFilters(VERIFIED_FESTIVALS, {
      year: 2025, month: 9, tradition: 'hinduism', category: 'all', searchQuery: '',
    })
    for (const f of result) {
      expect(f.religion.toLowerCase()).toContain('hinduism')
    }
  })

  it('"all" tradition returns all festivals for the month', () => {
    const allResult = applyFilters(VERIFIED_FESTIVALS, {
      year: 2025, month: 0, tradition: 'all', category: 'all', searchQuery: '',
    })
    const filteredResult = applyFilters(VERIFIED_FESTIVALS, {
      year: 2025, month: 0, tradition: 'Islam', category: 'all', searchQuery: '',
    })
    expect(allResult.length).toBeGreaterThanOrEqual(filteredResult.length)
  })
})

describe('applyFilters — search query filter', () => {
  it('finds Diwali by name search', () => {
    const result = applyFilters(VERIFIED_FESTIVALS, {
      year: 2025, month: 9, tradition: 'all', category: 'all', searchQuery: 'diwali',
    })
    expect(result.some(f => f.slug === 'diwali-deepavali')).toBe(true)
  })

  it('finds festivals by alternate name', () => {
    const result = applyFilters(VERIFIED_FESTIVALS, {
      year: 2025, month: 0, tradition: 'all', category: 'all', searchQuery: 'spring festival',
    })
    expect(result.some(f => f.slug === 'chinese-new-year-spring-festival')).toBe(true)
  })

  it('finds festivals by country', () => {
    const result = applyFilters(VERIFIED_FESTIVALS, {
      year: 2025, month: 0, tradition: 'all', category: 'all', searchQuery: 'china',
    })
    expect(result.length).toBeGreaterThan(0)
    for (const f of result) {
      const searchable = [f.name, ...(f.alternateNames || []), ...(f.countries || [])].join(' ').toLowerCase()
      expect(searchable).toContain('china')
    }
  })

  it('returns empty for a search that matches nothing', () => {
    const result = applyFilters(VERIFIED_FESTIVALS, {
      year: 2025, month: 0, tradition: 'all', category: 'all', searchQuery: 'zzznomatch999',
    })
    expect(result).toHaveLength(0)
  })

  it('search is case-insensitive', () => {
    const lower = applyFilters(VERIFIED_FESTIVALS, {
      year: 2025, month: 9, tradition: 'all', category: 'all', searchQuery: 'diwali',
    })
    const upper = applyFilters(VERIFIED_FESTIVALS, {
      year: 2025, month: 9, tradition: 'all', category: 'all', searchQuery: 'DIWALI',
    })
    expect(lower.length).toBe(upper.length)
  })
})

describe('applyFilters — selectedDate filter', () => {
  it('filters festivals occurring on a specific day', () => {
    const result = applyFilters(VERIFIED_FESTIVALS, {
      year: 2025,
      month: 0,
      selectedDate: { year: 2025, month: 0, day: 29 },
      tradition: 'all',
      region: 'all',
      category: 'all',
      searchQuery: '',
    })
    expect(result.some(f => f.slug === 'chinese-new-year-spring-festival')).toBe(true)
  })

  it('does not return festivals not occurring on the selected day', () => {
    const result = applyFilters(VERIFIED_FESTIVALS, {
      year: 2025,
      month: 0,
      selectedDate: { year: 2025, month: 0, day: 15 },
      tradition: 'all',
      region: 'all',
      category: 'all',
      searchQuery: '',
    })
    expect(result.some(f => f.slug === 'chinese-new-year-spring-festival')).toBe(false)
  })

  it('handles multi-day festivals across their occurrence range', () => {
    // Diwali 2025 is Oct 20–24
    const resultStart = applyFilters(VERIFIED_FESTIVALS, {
      year: 2025,
      month: 9,
      selectedDate: { year: 2025, month: 9, day: 20 },
      tradition: 'all',
      region: 'all',
      category: 'all',
      searchQuery: '',
    })
    expect(resultStart.some(f => f.slug === 'diwali-deepavali')).toBe(true)

    const resultMid = applyFilters(VERIFIED_FESTIVALS, {
      year: 2025,
      month: 9,
      selectedDate: { year: 2025, month: 9, day: 22 },
      tradition: 'all',
      region: 'all',
      category: 'all',
      searchQuery: '',
    })
    expect(resultMid.some(f => f.slug === 'diwali-deepavali')).toBe(true)
  })
})

describe('applyFilters — region filter', () => {
  it('filters festivals by region', () => {
    const result = applyFilters(VERIFIED_FESTIVALS, {
      year: 2025,
      month: 0,
      selectedDate: null,
      tradition: 'all',
      region: 'East Asia',
      category: 'all',
      searchQuery: '',
    })
    expect(result.length).toBeGreaterThan(0)
    expect(result.some(f => f.slug === 'chinese-new-year-spring-festival')).toBe(true)
  })
})

describe('getFestivalOccurrenceStatus — tracking completed, today, upcoming', () => {
  const today = { year: 2026, month: 9, day: 15 } // Oct 15, 2026

  it('identifies completed festival when endDate < today', () => {
    const pastOcc = { startDate: '2025-10-20', endDate: '2025-10-24' }
    expect(getFestivalOccurrenceStatus(pastOcc, today)).toBe('completed')
  })

  it('identifies today/ongoing festival when startDate <= today <= endDate', () => {
    const todayOcc = { startDate: '2026-10-10', endDate: '2026-10-20' }
    expect(getFestivalOccurrenceStatus(todayOcc, today)).toBe('today')
  })

  it('identifies upcoming festival when startDate > today', () => {
    const futureOcc = { startDate: '2026-12-25', endDate: '2026-12-25' }
    expect(getFestivalOccurrenceStatus(futureOcc, today)).toBe('upcoming')
  })

  it('correctly handles single-day occurrence without endDate', () => {
    const singlePast = { startDate: '2026-01-01' }
    expect(getFestivalOccurrenceStatus(singlePast, today)).toBe('completed')

    const singleFuture = { startDate: '2026-11-01' }
    expect(getFestivalOccurrenceStatus(singleFuture, today)).toBe('upcoming')
  })
})

describe('Calendar grid 6-row height stability', () => {
  function buildGridCells(year, month) {
    const daysInMonth = getDaysInMonth(year, month)
    const firstDow = getFirstDayOfWeek(year, month)
    const cells = []
    for (let i = 0; i < firstDow; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    while (cells.length < 42) cells.push(null)
    return cells
  }

  it('produces exactly 42 cells for February in non-leap year (2025)', () => {
    const cells = buildGridCells(2025, 1) // Feb 2025
    expect(cells).toHaveLength(42)
  })

  it('produces exactly 42 cells for February in leap year (2028)', () => {
    const cells = buildGridCells(2028, 1) // Feb 2028
    expect(cells).toHaveLength(42)
  })

  it('produces exactly 42 cells for 31-day months (January, December)', () => {
    expect(buildGridCells(2025, 0)).toHaveLength(42)
    expect(buildGridCells(2025, 11)).toHaveLength(42)
  })

  it('produces exactly 42 cells for every month across 2025–2035', () => {
    for (let y = 2025; y <= 2035; y++) {
      for (let m = 0; m < 12; m++) {
        expect(buildGridCells(y, m)).toHaveLength(42)
      }
    }
  })
})

// ─── 7. Cross-year Date Consistency ──────────────────────────────────────────

describe('Cross-year date consistency', () => {
  it('Islamic festivals shift ~11 days earlier each year', () => {
    const eidFitr = VERIFIED_FESTIVALS.find(f => f.slug === 'eid-al-fitr')
    const occ2025 = eidFitr?.occurrences?.find(o => o.year === 2025)
    const occ2026 = eidFitr?.occurrences?.find(o => o.year === 2026)
    if (occ2025 && occ2026) {
      const d2025 = new Date(occ2025.startDate)
      const d2026 = new Date(occ2026.startDate)
      // Islamic calendar: Eid shifts ~11 days EARLIER within each solar year.
      // d2025 = 2025-03-31, d2026 = 2026-03-20
      // In absolute time, d2026 > d2025 (2026 is a later year).
      // But within the solar year, Eid 2026 falls 11 days earlier (day 79) than Eid 2025 (day 90).
      // Check day-of-year position: 2026 Eid day-of-year < 2025 Eid day-of-year
      const dayOfYear = (d) => {
        const start = new Date(Date.UTC(d.getUTCFullYear(), 0, 0))
        return Math.floor((d - start) / (1000 * 60 * 60 * 24))
      }
      const doy2025 = dayOfYear(d2025)
      const doy2026 = dayOfYear(d2026)
      const shiftDays = doy2025 - doy2026  // positive: 2026 Eid is earlier in the year
      expect(shiftDays).toBeGreaterThanOrEqual(8)
      expect(shiftDays).toBeLessThanOrEqual(15)
    }
  })

  it('Fixed Gregorian festivals (Christmas) stay on Dec 25 every year', () => {
    const christmas = VERIFIED_FESTIVALS.find(f => f.slug === 'christmas')
    const occurrences = christmas?.occurrences || []
    expect(occurrences.length).toBeGreaterThan(5)
    for (const occ of occurrences) {
      expect(occ.startDate.endsWith('-12-25'), `Christmas ${occ.year} is not on Dec 25`).toBe(true)
    }
  })

  it('Nowruz stays near March 20–21 every year', () => {
    const nowruz = VERIFIED_FESTIVALS.find(f => f.slug === 'nowruz-persian-new-year')
    const occurrences = nowruz?.occurrences || []
    for (const occ of occurrences) {
      const parsed = parseISODate(occ.startDate)
      expect(parsed.month, `Nowruz ${occ.year}: not in March`).toBe(2) // March = month 2 (0-indexed)
      expect(parsed.day, `Nowruz ${occ.year}: not on day 20–21`).toBeGreaterThanOrEqual(20)
      expect(parsed.day, `Nowruz ${occ.year}: not on day 20–21`).toBeLessThanOrEqual(21)
    }
  })
})

// ─── 8. FestivalService Fallback ──────────────────────────────────────────────

describe('fetchAllFestivals — Supabase fallback', () => {
  it('VERIFIED_FESTIVALS is returned when Supabase has no data', async () => {
    // Mock Supabase to return empty (simulating missing seed data)
    const mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      }))
    }

    // Inline the fallback logic
    async function fetchAllFestivalsWithMock(supabase) {
      try {
        const { data, error } = await supabase
          .from('festivals')
          .select('*, festival_occurrences (*)')
          .order('name', { ascending: true })
        if (!error && data && data.length > 0) return data
      } catch {}
      return VERIFIED_FESTIVALS
    }

    const result = await fetchAllFestivalsWithMock(mockSupabase)
    expect(result).toBe(VERIFIED_FESTIVALS)
    expect(result.length).toBeGreaterThanOrEqual(20)
  })

  it('VERIFIED_FESTIVALS is returned when Supabase throws an error', async () => {
    const mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          order: vi.fn(() => Promise.reject(new Error('network error')))
        }))
      }))
    }

    async function fetchAllFestivalsWithMock(supabase) {
      try {
        const { data, error } = await supabase
          .from('festivals')
          .select('*, festival_occurrences (*)')
          .order('name', { ascending: true })
        if (!error && data && data.length > 0) return data
      } catch {}
      return VERIFIED_FESTIVALS
    }

    const result = await fetchAllFestivalsWithMock(mockSupabase)
    expect(result).toBe(VERIFIED_FESTIVALS)
  })

  it('returns Supabase data when the table has rows', async () => {
    const mockData = [
      {
        id: 'sb-1', slug: 'test-db-festival', name: 'DB Festival',
        alternate_names: [], cultural_origin: 'Test', countries: [], regions: [],
        typical_month: 1, date_rule: 'fixed_gregorian',
        significance: 'DB test', history: 'DB history',
        rituals: [], food: [], clothing: [], music: [],
        festival_occurrences: [
          { year: 2025, start_date: '2025-01-01', end_date: '2025-01-01', region_notes: '', verified: true }
        ],
        sources: []
      }
    ]
    const mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockData, error: null }))
        }))
      }))
    }

    async function fetchAllFestivalsWithMock(supabase) {
      try {
        const { data, error } = await supabase
          .from('festivals')
          .select('*, festival_occurrences (*)')
          .order('name', { ascending: true })
        if (!error && data && data.length > 0) return data
      } catch {}
      return VERIFIED_FESTIVALS
    }

    const result = await fetchAllFestivalsWithMock(mockSupabase)
    expect(result).toStrictEqual(mockData)
    expect(result).not.toBe(VERIFIED_FESTIVALS)
  })
})

// ─── 9. formatDateRange Formatting ───────────────────────────────────────────

describe('formatDateRange — display date ranges cleanly', () => {
  it('formats multi-day same-month range correctly (e.g. Navaratri 2026)', () => {
    expect(formatDateRange('2026-10-11', '2026-10-20')).toBe('Oct 11–20, 2026')
  })

  it('formats single-day event without end date', () => {
    expect(formatDateRange('2025-12-25')).toBe('Dec 25, 2025')
  })

  it('formats single-day event when endDate equals startDate', () => {
    expect(formatDateRange('2025-12-25', '2025-12-25')).toBe('Dec 25, 2025')
  })

  it('formats cross-month multi-day event in the same year', () => {
    expect(formatDateRange('2025-03-29', '2025-04-02')).toBe('Mar 29 – Apr 2, 2025')
  })

  it('formats cross-year multi-day event', () => {
    expect(formatDateRange('2025-12-30', '2026-01-02')).toBe('Dec 30, 2025 – Jan 2, 2026')
  })

  it('handles empty or missing start date gracefully', () => {
    expect(formatDateRange('')).toBe('')
    expect(formatDateRange(null)).toBe('')
  })
})

// ─── 10. Sharad Navaratri 2026 Verified Dates & Range UI ──────────────────────

describe('Sharad Navaratri 2026 — verified dates and behavior', () => {
  const navaratri = VERIFIED_FESTIVALS.find(f => f.slug === 'navratri')
  const occ2026 = navaratri?.occurrences?.find(o => o.year === 2026)

  it('navratri exists in VERIFIED_FESTIVALS', () => {
    expect(navaratri).toBeDefined()
    expect(navaratri.name).toContain('Navratri')
  })

  it('has verified 2026 occurrence with start date Oct 11, 2026 and end date Oct 20, 2026', () => {
    expect(occ2026).toBeDefined()
    expect(occ2026.startDate).toBe('2026-10-11')
    expect(occ2026.endDate).toBe('2026-10-20')
    expect(occ2026.verified).toBe(true)
  })

  it('contains documentation citing Ghatasthapana on Oct 11 and Vijayadashami on Oct 20', () => {
    expect(occ2026.regionNotes).toContain('Oct 11')
    expect(occ2026.regionNotes).toContain('Oct 20')
    expect(occ2026.regionNotes).toContain('Vijayadashami')
  })

  it('cites authoritative references in sources (Drik Panchang, Times of India, Indian Express)', () => {
    const sources = navaratri.sources.map(s => `${s.title} ${s.publisher}`).join(' ')
    expect(sources).toContain('Drik Panchang')
    expect(sources).toContain('Times of India')
    expect(sources).toContain('Indian Express')
  })

  it('selecting Oct 11 identifies Navaratri as starting that day with intact start date', () => {
    const results = applyFilters(VERIFIED_FESTIVALS, {
      year: 2026,
      month: 9,
      selectedDate: { year: 2026, month: 9, day: 11 },
    })
    const found = results.find(f => f.slug === 'navratri')
    expect(found).toBeDefined()
    const foundOcc = found.occurrences.find(o => o.year === 2026)
    expect(foundOcc.startDate).toBe('2026-10-11')
    expect(foundOcc.endDate).toBe('2026-10-20')
  })

  it('selecting Oct 20 preserves identical festival identity and does not overwrite start date', () => {
    const results = applyFilters(VERIFIED_FESTIVALS, {
      year: 2026,
      month: 9,
      selectedDate: { year: 2026, month: 9, day: 20 },
    })
    const found = results.find(f => f.slug === 'navratri')
    expect(found).toBeDefined()
    const foundOcc = found.occurrences.find(o => o.year === 2026)
    // Start date MUST NOT be rewritten to 2026-10-20
    expect(foundOcc.startDate).toBe('2026-10-11')
    expect(foundOcc.endDate).toBe('2026-10-20')
  })

  it('selecting mid-observance date (Oct 15) preserves identical identity and full date range', () => {
    const results = applyFilters(VERIFIED_FESTIVALS, {
      year: 2026,
      month: 9,
      selectedDate: { year: 2026, month: 9, day: 15 },
    })
    const found = results.find(f => f.slug === 'navratri')
    expect(found).toBeDefined()
    const foundOcc = found.occurrences.find(o => o.year === 2026)
    expect(foundOcc.startDate).toBe('2026-10-11')
    expect(foundOcc.endDate).toBe('2026-10-20')
  })

  it('buildEventMap places event markers across all 10 days of Navaratri 2026 (Oct 11–20)', () => {
    const map = buildEventMap(VERIFIED_FESTIVALS, 2026)
    for (let day = 11; day <= 20; day++) {
      const key = `2026-10-${String(day).padStart(2, '0')}`
      expect(map[key], `Missing event marker on ${key}`).toBeDefined()
      expect(map[key].some(f => f.slug === 'navratri')).toBe(true)
    }
    // Days outside the range do not have the Navaratri marker
    expect(map['2026-10-10']?.some(f => f.slug === 'navratri')).toBeFalsy()
    expect(map['2026-10-21']?.some(f => f.slug === 'navratri')).toBeFalsy()
  })

  it('completion status is derived strictly from endDate, not startDate', () => {
    // Before start: Oct 10, 2026 -> upcoming
    expect(getFestivalOccurrenceStatus(occ2026, { year: 2026, month: 9, day: 10 })).toBe('upcoming')

    // At start: Oct 11, 2026 -> ongoing (today)
    expect(getFestivalOccurrenceStatus(occ2026, { year: 2026, month: 9, day: 11 })).toBe('today')

    // Mid-festival: Oct 15, 2026 -> ongoing (today)
    expect(getFestivalOccurrenceStatus(occ2026, { year: 2026, month: 9, day: 15 })).toBe('today')

    // Final day (Vijayadashami): Oct 20, 2026 -> ongoing (today)
    expect(getFestivalOccurrenceStatus(occ2026, { year: 2026, month: 9, day: 20 })).toBe('today')

    // Day after culmination: Oct 21, 2026 -> completed
    expect(getFestivalOccurrenceStatus(occ2026, { year: 2026, month: 9, day: 21 })).toBe('completed')
  })
})

// ─── 11. Data-flow Synchronization & Filter Consistency ──────────────────────

describe('Data-flow synchronization — calendar markers and result cards', () => {
  it('calendar markers derive strictly from filtered festivals so markers never appear when explorer reports 0', () => {
    // Filter for an event that doesn't exist in October 2026
    const filtered = applyFilters(VERIFIED_FESTIVALS, {
      year: 2026,
      month: 9,
      searchQuery: 'NonExistentFestivalXyz123',
    })
    expect(filtered).toHaveLength(0)

    // Markers generated from filtered list must also have 0 markers for this filter
    const map = buildEventMap(filtered, 2026)
    for (let day = 1; day <= 31; day++) {
      const key = `2026-10-${String(day).padStart(2, '0')}`
      expect(map[key]).toBeUndefined()
    }
  })

  it('when tradition filter is applied, only matching festivals produce calendar markers', () => {
    const hinduOnly = applyFilters(VERIFIED_FESTIVALS, {
      year: 2026,
      month: 9,
      tradition: 'Hinduism',
    })
    const map = buildEventMap(hinduOnly, 2026)

    // Ensure all markers in October 2026 belong only to Hinduism
    for (const [dateKey, fList] of Object.entries(map)) {
      if (dateKey.startsWith('2026-10-')) {
        for (const f of fList) {
          expect(f.religion.toLowerCase()).toContain('hinduism')
        }
      }
    }
  })

  it('supports multiple festivals occurring on the same date without dropping any', () => {
    const multiFestDate = [
      {
        id: 'f-1', slug: 'fest-one', name: 'Festival One',
        occurrences: [{ year: 2026, startDate: '2026-05-15', endDate: '2026-05-15', verified: true }]
      },
      {
        id: 'f-2', slug: 'fest-two', name: 'Festival Two',
        occurrences: [{ year: 2026, startDate: '2026-05-15', endDate: '2026-05-15', verified: true }]
      }
    ]
    const map = buildEventMap(multiFestDate, 2026)
    expect(map['2026-05-15']).toHaveLength(2)
    expect(map['2026-05-15'].map(f => f.slug)).toEqual(['fest-one', 'fest-two'])
  })

  it('clearing selectedDate restores full monthly results', () => {
    const monthOnly = applyFilters(VERIFIED_FESTIVALS, {
      year: 2026,
      month: 9,
      selectedDate: null,
    })
    const dateSpecific = applyFilters(VERIFIED_FESTIVALS, {
      year: 2026,
      month: 9,
      selectedDate: { year: 2026, month: 9, day: 11 },
    })

    expect(monthOnly.length).toBeGreaterThanOrEqual(dateSpecific.length)
    expect(dateSpecific.every(d => monthOnly.some(m => m.id === d.id))).toBe(true)
  })
})

// ─── 12. Full Decade 2025–2035 Navigation & Leap Year Integrity ───────────────

describe('Decade 2025–2035 navigation and leap year support', () => {
  it('covers all 132 months from 2025 to 2035 with valid day counts', () => {
    let monthCount = 0
    for (let year = 2025; year <= 2035; year++) {
      for (let month = 0; month < 12; month++) {
        monthCount++
        const days = getDaysInMonth(year, month)
        expect(days).toBeGreaterThanOrEqual(28)
        expect(days).toBeLessThanOrEqual(31)
      }
    }
    expect(monthCount).toBe(132)
  })

  it('correctly calculates leap year days for February 2028 and February 2032', () => {
    expect(getDaysInMonth(2028, 1)).toBe(29)
    expect(getDaysInMonth(2032, 1)).toBe(29)
    expect(getDaysInMonth(2025, 1)).toBe(28)
    expect(getDaysInMonth(2026, 1)).toBe(28)
    expect(getDaysInMonth(2027, 1)).toBe(28)
    expect(getDaysInMonth(2029, 1)).toBe(28)
  })

  it('toISODate and parseISODate are timezone-safe and never shift Gregorian dates', () => {
    // Tests for edge cases like first and last day of months
    const testCases = [
      { y: 2026, m: 9, d: 11, expected: '2026-10-11' },
      { y: 2026, m: 9, d: 20, expected: '2026-10-20' },
      { y: 2025, m: 0, d: 1, expected: '2025-01-01' },
      { y: 2035, m: 11, d: 31, expected: '2035-12-31' },
    ]

    for (const { y, m, d, expected } of testCases) {
      const iso = toISODate(y, m, d)
      expect(iso).toBe(expected)
      const parsed = parseISODate(iso)
      expect(parsed).toEqual({ year: y, month: m, day: d })
    }
  })
})

// ─── 13. Comprehensive Global Observance Catalogue & 2025–2035 Coverage ───────

describe('Systematic Global Observance Catalogue & 2025–2035 Coverage', () => {
  const YEARS = [2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035]

  it('contains at least 40 unique festival records', () => {
    expect(VERIFIED_FESTIVALS.length).toBeGreaterThanOrEqual(40)
  })

  it('every festival has occurrences for all 11 calendar years (2025–2035)', () => {
    for (const fest of VERIFIED_FESTIVALS) {
      for (const year of YEARS) {
        const occ = fest.occurrences.find(o => o.year === year)
        expect(occ, `${fest.name} should have an occurrence for year ${year}`).toBeDefined()
        expect(occ?.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        if (occ?.endDate) {
          expect(occ.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
          expect(occ.endDate >= occ.startDate).toBe(true)
        }
      }
    }
  })

  it('covers all major cultural traditions specified in the directive', () => {
    const religions = new Set(VERIFIED_FESTIVALS.map(f => f.religion.toLowerCase()))
    expect(Array.from(religions).some(r => r.includes('hindu'))).toBe(true)
    expect(Array.from(religions).some(r => r.includes('buddhis'))).toBe(true)
    expect(Array.from(religions).some(r => r.includes('jain'))).toBe(true)
    expect(Array.from(religions).some(r => r.includes('sikh'))).toBe(true)
    expect(Array.from(religions).some(r => r.includes('islam'))).toBe(true)
    expect(Array.from(religions).some(r => r.includes('juda'))).toBe(true)
    expect(Array.from(religions).some(r => r.includes('christ'))).toBe(true)
    expect(Array.from(religions).some(r => r.includes('shinto') || r.includes('folk'))).toBe(true)
    expect(Array.from(religions).some(r => r.includes('indigenous') || r.includes('andean') || r.includes('māori'))).toBe(true)
  })

  it('covers all major world regions specified in the directive', () => {
    const allRegions = new Set(VERIFIED_FESTIVALS.flatMap(f => f.regions))
    expect(allRegions.has('South Asia')).toBe(true)
    expect(allRegions.has('East Asia')).toBe(true)
    expect(allRegions.has('Middle East & North Africa') || allRegions.has('Middle East')).toBe(true)
    expect(allRegions.has('Europe')).toBe(true)
    expect(allRegions.has('Africa') || allRegions.has('West Africa') || allRegions.has('East Africa')).toBe(true)
    expect(allRegions.has('Americas') || allRegions.has('North America') || allRegions.has('South America')).toBe(true)
    expect(allRegions.has('Southeast Asia')).toBe(true)
    expect(allRegions.has('Oceania')).toBe(true)
  })

  it('correctly filters newly expanded festivals across multiple regions and traditions', () => {
    // Test Krishna Janmashtami
    const janmashtami = applyFilters(VERIFIED_FESTIVALS, { searchQuery: 'Janmashtami' })
    expect(janmashtami.some(f => f.name.includes('Janmashtami'))).toBe(true)

    // Test Chuseok in Korea
    const chuseok = applyFilters(VERIFIED_FESTIVALS, { searchQuery: 'Chuseok' })
    expect(chuseok.some(f => f.name === 'Chuseok')).toBe(true)
    const chuseokRecord = chuseok.find(f => f.name === 'Chuseok')
    expect(chuseokRecord.regions).toContain('East Asia')

    // Test Matariki in New Zealand
    const matariki = applyFilters(VERIFIED_FESTIVALS, { searchQuery: 'Matariki' })
    expect(matariki.some(f => f.name === 'Matariki')).toBe(true)
    const matarikiRecord = matariki.find(f => f.name === 'Matariki')
    expect(matarikiRecord.regions).toContain('Oceania')

    // Test Inti Raymi in Peru
    const intiRaymi = applyFilters(VERIFIED_FESTIVALS, { searchQuery: 'Inti Raymi' })
    expect(intiRaymi.some(f => f.name === 'Inti Raymi')).toBe(true)
    const intiRecord = intiRaymi.find(f => f.name === 'Inti Raymi')
    expect(intiRecord.countries).toContain('Peru')

    // Test Juneteenth in US
    const juneteenth = applyFilters(VERIFIED_FESTIVALS, { searchQuery: 'Juneteenth' })
    expect(juneteenth.some(f => f.name === 'Juneteenth')).toBe(true)
    const juneRecord = juneteenth.find(f => f.name === 'Juneteenth')
    expect(juneRecord.category).toBe('Historical & Civic')

    // Test Sukkot
    const sukkot = applyFilters(VERIFIED_FESTIVALS, { searchQuery: 'Sukkot' })
    expect(sukkot.some(f => f.name === 'Sukkot')).toBe(true)
    const sukkotRecord = sukkot.find(f => f.name === 'Sukkot')
    expect(sukkotRecord.religion).toContain('Judaism')
  })
})


