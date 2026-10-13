import React, { useState, useEffect, useRef, useMemo } from 'react'
import { getDaysInMonth, validateDateOfBirth } from '../utils/authValidation'

const MONTH_OPTIONS = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
]

const CURRENT_SYSTEM_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from(
  { length: CURRENT_SYSTEM_YEAR - 1900 + 1 },
  (_, i) => String(CURRENT_SYSTEM_YEAR - i)
)

function parseDateValue(val) {
  if (!val || typeof val !== 'string') return { day: '', month: '', year: '' }
  const parts = val.split('-')
  if (parts.length === 3) {
    const [y, m, d] = parts
    const parsedY = y && !isNaN(parseInt(y, 10)) ? String(parseInt(y, 10)) : ''
    const parsedM = m && !isNaN(parseInt(m, 10)) ? String(parseInt(m, 10)) : ''
    const parsedD = d && !isNaN(parseInt(d, 10)) ? String(parseInt(d, 10)) : ''
    return { year: parsedY, month: parsedM, day: parsedD }
  }
  return { day: '', month: '', year: '' }
}

/**
 * Coordinated 3-part Date of Birth Selector (Day, Month, Year)
 * Built to Hailey's editorial specifications:
 * - Porcelain/ivory (#FAF6EF) and subtle border (#E0D4C5)
 * - Burgundy (#6A1F35) focus treatment
 * - Synchronized day counts with leap-year handling
 * - Accessible labels & keyboard navigation
 * - Compact responsive grid
 */
export function DateOfBirthSelector({
  value = '',
  onChange,
  disabled = false,
  error = null,
  idPrefix = 'auth-dob',
}) {
  const initial = parseDateValue(value)
  const [selectedDay, setSelectedDay] = useState(initial.day)
  const [selectedMonth, setSelectedMonth] = useState(initial.month)
  const [selectedYear, setSelectedYear] = useState(initial.year)

  // Track the canonical value last emitted to the parent
  const lastEmittedValueRef = useRef(value || '')

  // Sync internal state if the external prop `value` changes independently
  useEffect(() => {
    if (value !== lastEmittedValueRef.current) {
      lastEmittedValueRef.current = value || ''
      const nextParsed = parseDateValue(value)
      setSelectedDay(nextParsed.day)
      setSelectedMonth(nextParsed.month)
      setSelectedYear(nextParsed.year)
    }
  }, [value])

  // Compute maximum valid days in selected month and year
  const maxDays = useMemo(() => {
    const m = selectedMonth ? parseInt(selectedMonth, 10) : 1
    const y = selectedYear ? parseInt(selectedYear, 10) : 2000
    return getDaysInMonth(m, y)
  }, [selectedMonth, selectedYear])

  // Emit canonical date string when parts change
  const handlePartChange = (part, nextVal) => {
    let nextDay = part === 'day' ? nextVal : selectedDay
    let nextMonth = part === 'month' ? nextVal : selectedMonth
    let nextYear = part === 'year' ? nextVal : selectedYear

    // Safely adjust day if the new month/year has fewer days (e.g. Feb 31 -> Feb 28/29)
    if (nextMonth) {
      const m = parseInt(nextMonth, 10)
      const y = nextYear ? parseInt(nextYear, 10) : 2000
      const limit = getDaysInMonth(m, y)
      if (nextDay && parseInt(nextDay, 10) > limit) {
        nextDay = String(limit)
      }
    }

    setSelectedDay(nextDay)
    setSelectedMonth(nextMonth)
    setSelectedYear(nextYear)

    if (nextDay && nextMonth && nextYear) {
      const canonical = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(nextDay).padStart(2, '0')}`
      lastEmittedValueRef.current = canonical
      const validation = validateDateOfBirth(nextDay, nextMonth, nextYear)
      onChange?.(canonical, validation)
    } else {
      lastEmittedValueRef.current = ''
      onChange?.('', { valid: false, error: 'Please enter a complete Date of Birth.' })
    }
  }

  // Pre-validate if complete date is selected
  const activeValidation = useMemo(() => {
    if (selectedDay && selectedMonth && selectedYear) {
      return validateDateOfBirth(selectedDay, selectedMonth, selectedYear)
    }
    return null
  }, [selectedDay, selectedMonth, selectedYear])

  return (
    <fieldset className="space-y-1.5 border-0 p-0 m-0">
      <legend className="block text-xs font-mono uppercase tracking-wider text-[#34252A]/80 font-medium">
        Date of Birth
      </legend>

      <div className="grid grid-cols-3 gap-2">
        {/* Month Selector */}
        <div className="space-y-1">
          <label
            htmlFor={`${idPrefix}-month`}
            className="block text-[10px] font-mono text-[#75666B] uppercase font-semibold"
          >
            Month
          </label>
          <select
            id={`${idPrefix}-month`}
            name="dob-month"
            value={selectedMonth}
            disabled={disabled}
            onChange={(e) => handlePartChange('month', e.target.value)}
            className="w-full neu-inset-input rounded-xl border border-[#E0D4C5] bg-[#FAF6EF] px-2.5 py-2 text-xs font-mono text-[#34252A] focus:outline-none focus:ring-1 focus:ring-[#6A1F35] focus:border-[#6A1F35] transition-all cursor-pointer disabled:opacity-50"
          >
            <option value="">Month</option>
            {MONTH_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Day Selector */}
        <div className="space-y-1">
          <label
            htmlFor={`${idPrefix}-day`}
            className="block text-[10px] font-mono text-[#75666B] uppercase font-semibold"
          >
            Day
          </label>
          <select
            id={`${idPrefix}-day`}
            name="dob-day"
            value={selectedDay}
            disabled={disabled}
            onChange={(e) => handlePartChange('day', e.target.value)}
            className="w-full neu-inset-input rounded-xl border border-[#E0D4C5] bg-[#FAF6EF] px-2.5 py-2 text-xs font-mono text-[#34252A] focus:outline-none focus:ring-1 focus:ring-[#6A1F35] focus:border-[#6A1F35] transition-all cursor-pointer disabled:opacity-50"
          >
            <option value="">Day</option>
            {Array.from({ length: maxDays }, (_, i) => String(i + 1)).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Year Selector */}
        <div className="space-y-1">
          <label
            htmlFor={`${idPrefix}-year`}
            className="block text-[10px] font-mono text-[#75666B] uppercase font-semibold"
          >
            Year
          </label>
          <select
            id={`${idPrefix}-year`}
            name="dob-year"
            value={selectedYear}
            disabled={disabled}
            onChange={(e) => handlePartChange('year', e.target.value)}
            className="w-full neu-inset-input rounded-xl border border-[#E0D4C5] bg-[#FAF6EF] px-2.5 py-2 text-xs font-mono text-[#34252A] focus:outline-none focus:ring-1 focus:ring-[#6A1F35] focus:border-[#6A1F35] transition-all cursor-pointer disabled:opacity-50"
          >
            <option value="">Year</option>
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Field Level Error or Age Eligibility Guidance */}
      {error && (
        <p className="text-[11px] font-mono text-red-600 mt-1">
          {error}
        </p>
      )}

      {activeValidation && !activeValidation.valid && (
        <p className="text-[11px] font-mono text-red-600 mt-1">
          {activeValidation.error}
        </p>
      )}

      {activeValidation?.valid && activeValidation.isMinor && (
        <div className="p-2 rounded-lg bg-[#FAF6EF] border border-[#B08A50]/30 text-[#75666B] text-[10px] font-mono leading-tight mt-1">
          <span className="font-semibold text-[#B08A50]">Cultural Guide Access: </span>
          {activeValidation.ageNotice}
        </div>
      )}
    </fieldset>
  )
}

export default DateOfBirthSelector
