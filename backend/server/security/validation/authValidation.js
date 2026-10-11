/**
 * Server-Side Authentication & Profile Validation Utilities
 *
 * Enforces server-authoritative validation for registration payloads,
 * age eligibility calculations, handles, and terms acceptance.
 */

/**
 * Checks if a given year is a leap year.
 *
 * @param {number} year
 * @returns {boolean}
 */
export function isLeapYear(year) {
  if (!Number.isInteger(year)) return false
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

/**
 * Returns the maximum number of days in a given month and year.
 *
 * @param {number} month 1-12
 * @param {number} year
 * @returns {number}
 */
export function getDaysInMonth(month, year) {
  if (!Number.isInteger(month) || month < 1 || month > 12) return 31
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28
  }
  if ([4, 6, 9, 11].includes(month)) {
    return 30
  }
  return 31
}

/**
 * Server-authoritative DOB & Age calculation.
 *
 * @param {number|string} day
 * @param {number|string} month
 * @param {number|string} year
 * @param {Date} [referenceDate=new Date()]
 * @returns {{
 *   valid: boolean,
 *   error?: string,
 *   age?: number,
 *   isAdult?: boolean,
 *   isMinor?: boolean,
 *   birthDateString?: string
 * }}
 */
export function evaluateServerDateOfBirth(day, month, year, referenceDate = new Date()) {
  const d = parseInt(day, 10)
  const m = parseInt(month, 10)
  const y = parseInt(year, 10)

  if (isNaN(d) || isNaN(m) || isNaN(y)) {
    return { valid: false, error: 'Complete Day, Month, and Year are required' }
  }

  const currentYear = referenceDate.getFullYear()
  if (y < 1900 || y > currentYear) {
    return { valid: false, error: `Invalid birth year: must be between 1900 and ${currentYear}` }
  }

  if (m < 1 || m > 12) {
    return { valid: false, error: 'Invalid birth month: must be between 1 and 12' }
  }

  const maxDays = getDaysInMonth(m, y)
  if (d < 1 || d > maxDays) {
    return { valid: false, error: `Invalid birth day for specified month/year (max: ${maxDays})` }
  }

  const birthDate = new Date(y, m - 1, d)
  if (
    birthDate.getFullYear() !== y ||
    birthDate.getMonth() !== m - 1 ||
    birthDate.getDate() !== d
  ) {
    return { valid: false, error: 'Invalid calendar date' }
  }

  if (birthDate > referenceDate) {
    return { valid: false, error: 'Date of birth cannot be in the future' }
  }

  let age = referenceDate.getFullYear() - birthDate.getFullYear()
  const monthDiff = referenceDate.getMonth() - birthDate.getMonth()
  const dayDiff = referenceDate.getDate() - birthDate.getDate()

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--
  }

  return {
    valid: true,
    age,
    isAdult: age >= 18,
    isMinor: age < 18,
    birthDateString: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
  }
}

/**
 * Validates contributor handle format.
 *
 * @param {string} handle
 * @returns {{ valid: boolean, error?: string, handle?: string }}
 */
export function validateServerHandle(handle) {
  if (!handle || typeof handle !== 'string') {
    return { valid: false, error: 'Handle is required' }
  }

  const trimmed = handle.trim().toLowerCase()
  if (trimmed.length < 3 || trimmed.length > 20) {
    return { valid: false, error: 'Handle must be between 3 and 20 characters' }
  }

  if (!/^[a-z0-9_]+$/.test(trimmed)) {
    return { valid: false, error: 'Handle must contain only lowercase alphanumeric characters and underscores' }
  }

  return { valid: true, handle: trimmed }
}

/**
 * Validates full name on server.
 *
 * @param {string} fullName
 * @returns {{ valid: boolean, error?: string, fullName?: string }}
 */
export function validateServerFullName(fullName) {
  if (!fullName || typeof fullName !== 'string') {
    return { valid: false, error: 'Full name is required' }
  }

  const trimmed = fullName.trim()
  if (!trimmed || trimmed.length > 100) {
    return { valid: false, error: 'Full name must be between 1 and 100 characters' }
  }

  return { valid: true, fullName: trimmed }
}
