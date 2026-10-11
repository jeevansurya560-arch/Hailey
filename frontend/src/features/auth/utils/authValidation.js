/**
 * Client-Side Authentication & Profile Validation Utilities
 *
 * Enforces Hailey protocol rules for handles, names, date of birth,
 * age eligibility self-declaration, passwords, and terms acceptance.
 */

/**
 * Validates a contributor handle.
 * Requirements:
 * - 3 to 20 characters
 * - Lowercase alphanumeric characters and underscores only
 * - Trimmed of leading/trailing whitespace
 *
 * @param {string} handle
 * @returns {{ valid: boolean, error?: string, sanitized?: string }}
 */
export function validateHandle(handle) {
  if (typeof handle !== 'string') {
    return { valid: false, error: 'Contributor handle is required.' }
  }

  const trimmed = handle.trim().toLowerCase()
  if (!trimmed) {
    return { valid: false, error: 'Contributor handle is required.' }
  }

  if (trimmed.length < 3) {
    return { valid: false, error: 'Handle must be at least 3 characters long.' }
  }

  if (trimmed.length > 20) {
    return { valid: false, error: 'Handle cannot exceed 20 characters.' }
  }

  if (!/^[a-z0-9_]+$/.test(trimmed)) {
    return {
      valid: false,
      error: 'Handle can only contain lowercase letters, numbers, and underscores.',
    }
  }

  return { valid: true, sanitized: trimmed }
}

/**
 * Validates a user's full name.
 * Requirements:
 * - Non-empty string when trimmed
 * - 1 to 100 characters
 * - Supports all valid Unicode names (no English-only constraint)
 *
 * @param {string} fullName
 * @returns {{ valid: boolean, error?: string, sanitized?: string }}
 */
export function validateFullName(fullName) {
  if (typeof fullName !== 'string') {
    return { valid: false, error: 'Full name is required.' }
  }

  const trimmed = fullName.trim()
  if (!trimmed) {
    return { valid: false, error: 'Full name is required.' }
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'Full name cannot exceed 100 characters.' }
  }

  return { valid: true, sanitized: trimmed }
}

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
 * Validates a Date of Birth given Day, Month, Year and evaluates age eligibility.
 *
 * Requirements:
 * - Day: 1 to 31 (accurate for selected month & year, including leap years)
 * - Month: 1 to 12
 * - Year: reasonable range (1900 to current year)
 * - Complete date validation (no impossible or future dates)
 * - Exact age calculation based on whether 18th birthday has passed
 * - Informative message for users under 18
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
 *   birthDateString?: string,
 *   declaredBirthYear?: number,
 *   ageNotice?: string
 * }}
 */
export function validateDateOfBirth(day, month, year, referenceDate = new Date()) {
  const d = parseInt(day, 10)
  const m = parseInt(month, 10)
  const y = parseInt(year, 10)

  if (isNaN(d) || isNaN(m) || isNaN(y)) {
    return { valid: false, error: 'Please enter a complete Date of Birth (Day, Month, Year).' }
  }

  const currentYear = referenceDate.getFullYear()

  if (y < 1900 || y > currentYear) {
    return {
      valid: false,
      error: `Year must be between 1900 and ${currentYear}.`,
    }
  }

  if (m < 1 || m > 12) {
    return { valid: false, error: 'Month must be between 1 (January) and 12 (December).' }
  }

  const maxDays = getDaysInMonth(m, y)
  if (d < 1 || d > maxDays) {
    if (m === 2 && d === 29 && !isLeapYear(y)) {
      return { valid: false, error: `February ${y} is not a leap year and has only 28 days.` }
    }
    return { valid: false, error: `Selected month only has ${maxDays} days.` }
  }

  // Check JavaScript calendar object rollover
  const birthDate = new Date(y, m - 1, d)
  if (
    birthDate.getFullYear() !== y ||
    birthDate.getMonth() !== m - 1 ||
    birthDate.getDate() !== d
  ) {
    return { valid: false, error: 'Invalid calendar date.' }
  }

  if (birthDate > referenceDate) {
    return { valid: false, error: 'Date of birth cannot be in the future.' }
  }

  // Accurate age calculation (comparing exact day/month/year to reference date)
  let age = referenceDate.getFullYear() - birthDate.getFullYear()
  const monthDiff = referenceDate.getMonth() - birthDate.getMonth()
  const dayDiff = referenceDate.getDate() - birthDate.getDate()

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--
  }

  const isAdult = age >= 18
  const isMinor = age < 18
  const birthDateString = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  let ageNotice = null
  if (isMinor) {
    ageNotice =
      'You are under 18. You will have full access to general-audience cultural guides, but mature and age-restricted (18+) archives will remain restricted.'
  }

  return {
    valid: true,
    age,
    isAdult,
    isMinor,
    birthDateString,
    declaredBirthYear: y,
    ageNotice,
  }
}

/**
 * Validates an email address.
 *
 * @param {string} email
 * @returns {{ valid: boolean, error?: string, sanitized?: string }}
 */
export function validateEmail(email) {
  if (typeof email !== 'string') {
    return { valid: false, error: 'Email address is required.' }
  }

  const trimmed = email.trim()
  if (!trimmed) {
    return { valid: false, error: 'Email address is required.' }
  }

  // Standard safe email pattern
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Please enter a valid email address.' }
  }

  return { valid: true, sanitized: trimmed }
}

/**
 * Validates a password.
 *
 * @param {string} password
 * @returns {{ valid: boolean, error?: string }}
 */
export function validatePassword(password) {
  if (typeof password !== 'string' || !password) {
    return { valid: false, error: 'Password is required.' }
  }

  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long.' }
  }

  if (password.length > 128) {
    return { valid: false, error: 'Password cannot exceed 128 characters.' }
  }

  return { valid: true }
}

/**
 * Validates that confirm password matches password.
 *
 * @param {string} password
 * @param {string} confirmPassword
 * @returns {{ valid: boolean, error?: string }}
 */
export function validatePasswordConfirmation(password, confirmPassword) {
  if (typeof confirmPassword !== 'string' || !confirmPassword) {
    return { valid: false, error: 'Please confirm your password.' }
  }

  if (password !== confirmPassword) {
    return { valid: false, error: 'Passwords do not match.' }
  }

  return { valid: true }
}

/**
 * Validates that Terms and Conditions were explicitly accepted.
 *
 * @param {boolean} accepted
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateTermsAcceptance(accepted) {
  if (accepted !== true) {
    return {
      valid: false,
      error: 'You must agree to the Terms and Conditions and Privacy Policy to create an account.',
    }
  }

  return { valid: true }
}
