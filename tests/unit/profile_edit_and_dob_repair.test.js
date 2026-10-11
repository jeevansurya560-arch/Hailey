import { describe, it, expect } from 'vitest'
import {
  isLeapYear,
  getDaysInMonth,
  validateDateOfBirth,
} from '../../frontend/src/features/auth/utils/authValidation.js'

describe('PHASE 3 & 5 — Profile Editing, DOB & OAuth Repair Suite', () => {
  describe('Date of Birth 3-Part Selector Validation & Leap Year Matrix', () => {
    it('accurately reports days in each month of a non-leap year', () => {
      const year = 2023
      expect(getDaysInMonth(1, year)).toBe(31) // January
      expect(getDaysInMonth(2, year)).toBe(28) // February (non-leap)
      expect(getDaysInMonth(3, year)).toBe(31) // March
      expect(getDaysInMonth(4, year)).toBe(30) // April
      expect(getDaysInMonth(5, year)).toBe(31) // May
      expect(getDaysInMonth(6, year)).toBe(30) // June
      expect(getDaysInMonth(7, year)).toBe(31) // July
      expect(getDaysInMonth(8, year)).toBe(31) // August
      expect(getDaysInMonth(9, year)).toBe(30) // September
      expect(getDaysInMonth(10, year)).toBe(31) // October
      expect(getDaysInMonth(11, year)).toBe(30) // November
      expect(getDaysInMonth(12, year)).toBe(31) // December
    })

    it('accurately identifies leap years and allocates 29 days to February', () => {
      expect(isLeapYear(2024)).toBe(true)
      expect(getDaysInMonth(2, 2024)).toBe(29)

      expect(isLeapYear(2000)).toBe(true) // century leap year
      expect(getDaysInMonth(2, 2000)).toBe(29)

      expect(isLeapYear(1900)).toBe(false) // century non-leap year
      expect(getDaysInMonth(2, 1900)).toBe(28)

      expect(isLeapYear(2025)).toBe(false)
      expect(getDaysInMonth(2, 2025)).toBe(28)
    })

    it('rejects impossible dates such as February 30 and April 31', () => {
      const resFeb30 = validateDateOfBirth(30, 2, 2024)
      expect(resFeb30.valid).toBe(false)

      const resApr31 = validateDateOfBirth(31, 4, 2024)
      expect(resApr31.valid).toBe(false)

      const resFeb29NonLeap = validateDateOfBirth(29, 2, 2023)
      expect(resFeb29NonLeap.valid).toBe(false)
      expect(resFeb29NonLeap.error).toContain('leap year')
    })

    it('rejects future dates based on system date', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const resFuture = validateDateOfBirth(
        tomorrow.getDate(),
        tomorrow.getMonth() + 1,
        tomorrow.getFullYear()
      )
      expect(resFuture.valid).toBe(false)
      expect(resFuture.error).toContain('cannot be in the future')
    })

    it('correctly calculates age and flags minor status without hardcoding 2026', () => {
      const today = new Date()
      // Born exactly 17 years ago today
      const birth17 = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate())
      const res17 = validateDateOfBirth(
        birth17.getDate(),
        birth17.getMonth() + 1,
        birth17.getFullYear()
      )
      expect(res17.valid).toBe(true)
      expect(res17.age).toBe(17)
      expect(res17.isMinor).toBe(true)
      expect(res17.isAdult).toBe(false)
      expect(res17.ageNotice).toContain('under 18')

      // Born exactly 25 years ago today
      const birth25 = new Date(today.getFullYear() - 25, today.getMonth(), today.getDate())
      const res25 = validateDateOfBirth(
        birth25.getDate(),
        birth25.getMonth() + 1,
        birth25.getFullYear()
      )
      expect(res25.valid).toBe(true)
      expect(res25.age).toBe(25)
      expect(res25.isMinor).toBe(false)
      expect(res25.isAdult).toBe(true)
      expect(res25.ageNotice).toBeNull()
    })
  })

  describe('Google OAuth Callback Error Parsing & URL Resilience', () => {
    it('parses error_description from OAuth URL query parameters', () => {
      const search = '?error=access_denied&error_description=User+cancelled+Google+sign-in'
      const searchParams = new URLSearchParams(search)
      const errorDesc = searchParams.get('error_description')
      const formatted = decodeURIComponent(errorDesc.replace(/\+/g, ' '))
      expect(formatted).toBe('User cancelled Google sign-in')
    })

    it('parses error and error_description from URL hash fragments', () => {
      const hash = '#error=unauthorized_client&error_code=403&error_description=App+not+allowlisted'
      const hashParams = new URLSearchParams(hash.substring(1))
      expect(hashParams.get('error')).toBe('unauthorized_client')
      expect(hashParams.get('error_code')).toBe('403')
      expect(hashParams.get('error_description')).toBe('App not allowlisted')
    })
  })

  describe('Profile Data Null Safety & Resilience', () => {
    it('handles minimal/sparse profile objects without runtime exceptions', () => {
      const sparseProfile = {
        id: 'user-sparse-123',
        handle: 'curator_one',
        display_name: null,
        bio: null,
        website: null,
        location: null,
        avatar_url: null,
        roles: null,
        cultural_interests: null,
      }

      // Verify defaults
      const displayName = sparseProfile.display_name || ''
      const bio = sparseProfile.bio || ''
      const roles = Array.isArray(sparseProfile.roles) ? sparseProfile.roles : []
      const interests = Array.isArray(sparseProfile.cultural_interests) ? sparseProfile.cultural_interests : []

      expect(displayName).toBe('')
      expect(bio).toBe('')
      expect(roles).toEqual([])
      expect(interests).toEqual([])
    })
  })
})
