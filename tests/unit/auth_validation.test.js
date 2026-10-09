import { describe, it, expect } from 'vitest'
import {
  validateHandle,
  validateFullName,
  validateDateOfBirth,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateTermsAcceptance,
  isLeapYear,
  getDaysInMonth,
} from '../../frontend/src/features/auth/utils/authValidation.js'
import {
  evaluateServerDateOfBirth,
  validateServerHandle,
  validateServerFullName,
} from '../../backend/server/security/validation/authValidation.js'

describe('Auth Validation Utilities - Unit Tests', () => {
  // ── 1. Contributor Handle Validation ─────────────────────────────
  describe('validateHandle (Client & Server)', () => {
    it('rejects null, undefined, empty, or whitespace-only handles', () => {
      expect(validateHandle(null).valid).toBe(false)
      expect(validateHandle(undefined).valid).toBe(false)
      expect(validateHandle('').valid).toBe(false)
      expect(validateHandle('   ').valid).toBe(false)

      expect(validateServerHandle(null).valid).toBe(false)
      expect(validateServerHandle('').valid).toBe(false)
    })

    it('rejects handles shorter than 3 characters', () => {
      expect(validateHandle('ab').valid).toBe(false)
      expect(validateHandle('ab').error).toContain('at least 3 characters')
      expect(validateServerHandle('a').valid).toBe(false)
    })

    it('rejects handles longer than 20 characters', () => {
      const longHandle = 'a'.repeat(21)
      expect(validateHandle(longHandle).valid).toBe(false)
      expect(validateHandle(longHandle).error).toContain('cannot exceed 20 characters')
      expect(validateServerHandle(longHandle).valid).toBe(false)
    })

    it('rejects handles with illegal characters (spaces, dashes, symbols)', () => {
      expect(validateHandle('kyoto-curator').valid).toBe(false)
      expect(validateHandle('kyoto curator').valid).toBe(false)
      expect(validateHandle('kyoto@curator').valid).toBe(false)
      expect(validateHandle('kyoto!').valid).toBe(false)

      expect(validateServerHandle('user-name').valid).toBe(false)
    })

    it('accepts and normalizes valid alphanumeric and underscore handles', () => {
      const res = validateHandle('  Kyoto_Curator_99  ')
      expect(res.valid).toBe(true)
      expect(res.sanitized).toBe('kyoto_curator_99')

      const serverRes = validateServerHandle('tokyo_archivist')
      expect(serverRes.valid).toBe(true)
      expect(serverRes.handle).toBe('tokyo_archivist')
    })
  })

  // ── 2. Full Name Validation (Unicode & International) ─────────────
  describe('validateFullName (Client & Server)', () => {
    it('rejects empty or whitespace-only names', () => {
      expect(validateFullName('').valid).toBe(false)
      expect(validateFullName('   ').valid).toBe(false)
      expect(validateFullName(null).valid).toBe(false)

      expect(validateServerFullName('').valid).toBe(false)
    })

    it('rejects names exceeding 100 characters', () => {
      const longName = 'A'.repeat(101)
      expect(validateFullName(longName).valid).toBe(false)
      expect(validateFullName(longName).error).toContain('cannot exceed 100 characters')

      expect(validateServerFullName(longName).valid).toBe(false)
    })

    it('accepts legitimate Unicode international names without English-only restrictions', () => {
      const names = [
        'José Silva',
        '林璎',
        '田中太郎',
        'Aïcha Diallo',
        'Renée Dupuis',
        'Björk Guðmundsdóttir',
        'Александр Пушкин',
        'María de la Cruz',
      ]

      for (const name of names) {
        const clientRes = validateFullName(name)
        expect(clientRes.valid, `Failed on name: ${name}`).toBe(true)
        expect(clientRes.sanitized).toBe(name)

        const serverRes = validateServerFullName(name)
        expect(serverRes.valid, `Server failed on name: ${name}`).toBe(true)
        expect(serverRes.fullName).toBe(name)
      }
    })
  })

  // ── 3. Leap Year & Month Length Calculations ─────────────────────
  describe('isLeapYear and getDaysInMonth', () => {
    it('identifies leap years correctly (century and 400-year rules)', () => {
      expect(isLeapYear(2000)).toBe(true) // 400 year rule
      expect(isLeapYear(2004)).toBe(true)
      expect(isLeapYear(2024)).toBe(true)
      expect(isLeapYear(2028)).toBe(true)

      expect(isLeapYear(1900)).toBe(false) // Century not divisible by 400
      expect(isLeapYear(2023)).toBe(false)
      expect(isLeapYear(2025)).toBe(false)
      expect(isLeapYear(2026)).toBe(false)
    })

    it('calculates correct days in each month including February in leap/non-leap years', () => {
      // 31-day months: Jan (1), Mar (3), May (5), Jul (7), Aug (8), Oct (10), Dec (12)
      expect(getDaysInMonth(1, 2026)).toBe(31)
      expect(getDaysInMonth(3, 2026)).toBe(31)
      expect(getDaysInMonth(7, 2026)).toBe(31)
      expect(getDaysInMonth(8, 2026)).toBe(31)
      expect(getDaysInMonth(12, 2026)).toBe(31)

      // 30-day months: Apr (4), Jun (6), Sep (9), Nov (11)
      expect(getDaysInMonth(4, 2026)).toBe(30)
      expect(getDaysInMonth(6, 2026)).toBe(30)
      expect(getDaysInMonth(9, 2026)).toBe(30)
      expect(getDaysInMonth(11, 2026)).toBe(30)

      // February in leap year
      expect(getDaysInMonth(2, 2024)).toBe(29)
      expect(getDaysInMonth(2, 2000)).toBe(29)

      // February in non-leap year
      expect(getDaysInMonth(2, 2026)).toBe(28)
      expect(getDaysInMonth(2, 2023)).toBe(28)
    })
  })

  // ── 4. Date of Birth & Age Calculation Matrix ─────────────────────
  describe('validateDateOfBirth (Exact 18th Birthday Boundary Testing)', () => {
    const fixedReferenceDate = new Date(2026, 9, 9) // October 9, 2026 (Month is 0-indexed: 9 = October)

    it('rejects impossible dates (e.g. Feb 30, Feb 29 on non-leap year, Nov 31)', () => {
      // Feb 29 on non-leap year 2023
      const resNonLeapFeb = validateDateOfBirth(29, 2, 2023, fixedReferenceDate)
      expect(resNonLeapFeb.valid).toBe(false)
      expect(resNonLeapFeb.error).toContain('not a leap year')

      // Nov 31
      const resNov31 = validateDateOfBirth(31, 11, 2000, fixedReferenceDate)
      expect(resNov31.valid).toBe(false)
      expect(resNov31.error).toContain('only has 30 days')

      // April 31
      const resApr31 = validateDateOfBirth(31, 4, 2000, fixedReferenceDate)
      expect(resApr31.valid).toBe(false)
    })

    it('rejects future dates', () => {
      const futureDate = validateDateOfBirth(10, 10, 2026, fixedReferenceDate)
      expect(futureDate.valid).toBe(false)
      expect(futureDate.error).toContain('cannot be in the future')
    })

    it('rejects incomplete, null, or out-of-range years', () => {
      expect(validateDateOfBirth('', '', '', fixedReferenceDate).valid).toBe(false)
      expect(validateDateOfBirth(1, 1, 1899, fixedReferenceDate).valid).toBe(false)
      expect(validateDateOfBirth(1, 1, 2027, fixedReferenceDate).valid).toBe(false)
    })

    it('accepts Feb 29 on a valid leap year', () => {
      const leapBirth = validateDateOfBirth(29, 2, 2004, fixedReferenceDate)
      expect(leapBirth.valid).toBe(true)
      expect(leapBirth.age).toBe(22)
      expect(leapBirth.isAdult).toBe(true)
    })

    it('accurately evaluates adult status on the exact 18th birthday (October 9, 2008)', () => {
      // Born October 9, 2008 -> Turns 18 today (Oct 9, 2026)
      const resToday = validateDateOfBirth(9, 10, 2008, fixedReferenceDate)
      expect(resToday.valid).toBe(true)
      expect(resToday.age).toBe(18)
      expect(resToday.isAdult).toBe(true)
      expect(resToday.isMinor).toBe(false)
      expect(resToday.ageNotice).toBeNull()

      // Server equivalent
      const serverRes = evaluateServerDateOfBirth(9, 10, 2008, fixedReferenceDate)
      expect(serverRes.valid).toBe(true)
      expect(serverRes.age).toBe(18)
      expect(serverRes.isAdult).toBe(true)
    })

    it('accurately evaluates adult status when 18th birthday was yesterday (October 8, 2008)', () => {
      // Born October 8, 2008 -> Turned 18 yesterday
      const resYesterday = validateDateOfBirth(8, 10, 2008, fixedReferenceDate)
      expect(resYesterday.valid).toBe(true)
      expect(resYesterday.age).toBe(18)
      expect(resYesterday.isAdult).toBe(true)
      expect(resYesterday.isMinor).toBe(false)
    })

    it('accurately evaluates MINOR status when 18th birthday is tomorrow (October 10, 2008)', () => {
      // Born October 10, 2008 -> Still 17 today
      const resTomorrow = validateDateOfBirth(10, 10, 2008, fixedReferenceDate)
      expect(resTomorrow.valid).toBe(true)
      expect(resTomorrow.age).toBe(17)
      expect(resTomorrow.isAdult).toBe(false)
      expect(resTomorrow.isMinor).toBe(true)
      expect(resTomorrow.ageNotice).toContain('You are under 18')

      // Server equivalent
      const serverRes = evaluateServerDateOfBirth(10, 10, 2008, fixedReferenceDate)
      expect(serverRes.valid).toBe(true)
      expect(serverRes.age).toBe(17)
      expect(serverRes.isAdult).toBe(false)
      expect(serverRes.isMinor).toBe(true)
    })

    it('accurately evaluates minor status for 15-year old (born 2011)', () => {
      const resMinor = validateDateOfBirth(15, 5, 2011, fixedReferenceDate)
      expect(resMinor.valid).toBe(true)
      expect(resMinor.age).toBe(15)
      expect(resMinor.isMinor).toBe(true)
      expect(resMinor.isAdult).toBe(false)
    })
  })

  // ── 5. Email & Password Policy Tests ─────────────────────────────
  describe('validateEmail & validatePassword', () => {
    it('validates email formats properly', () => {
      expect(validateEmail('curator@domain.org').valid).toBe(true)
      expect(validateEmail('  curator@domain.org  ').sanitized).toBe('curator@domain.org')
      expect(validateEmail('invalid-email').valid).toBe(false)
      expect(validateEmail('').valid).toBe(false)
    })

    it('validates password minimum length (8 chars)', () => {
      expect(validatePassword('1234567').valid).toBe(false)
      expect(validatePassword('1234567').error).toContain('at least 8 characters')
      expect(validatePassword('12345678').valid).toBe(true)
      expect(validatePassword('SuperSecurePassword2026!').valid).toBe(true)
    })

    it('validates password confirmation equality', () => {
      expect(validatePasswordConfirmation('secret1234', 'secret1234').valid).toBe(true)
      expect(validatePasswordConfirmation('secret1234', 'secret5678').valid).toBe(false)
      expect(validatePasswordConfirmation('secret1234', 'secret5678').error).toContain('do not match')
      expect(validatePasswordConfirmation('secret1234', '').valid).toBe(false)
    })

    it('requires explicit acceptance of Terms and Conditions', () => {
      expect(validateTermsAcceptance(true).valid).toBe(true)
      expect(validateTermsAcceptance(false).valid).toBe(false)
      expect(validateTermsAcceptance(false).error).toContain('must agree to the Terms')
      expect(validateTermsAcceptance(undefined).valid).toBe(false)
    })
  })
})
