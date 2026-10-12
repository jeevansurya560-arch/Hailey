import { useMemo } from 'react'
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const MIN_YEAR = 2025
const MAX_YEAR = 2035

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay()
}

function toISODate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function FestivalCalendar({
  year,
  month,
  onYearChange,
  onMonthChange,
  eventMap = {},
  selectedDate,
  onSelectDate,
  today
}) {
  const daysInCurrentMonth = getDaysInMonth(year, month)
  const firstDow = getFirstDayOfWeek(year, month)

  // Prior month days for leading cells
  const prevMonthDays = getDaysInMonth(
    month === 0 ? year - 1 : year,
    month === 0 ? 11 : month - 1
  )

  // Calendar cells matrix (fixed 42 cells = 6 weeks)
  const calendarCells = useMemo(() => {
    const cells = []

    // Leading days from previous month
    for (let i = firstDow - 1; i >= 0; i--) {
      cells.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        isLeading: true,
        month: month === 0 ? 11 : month - 1,
        year: month === 0 ? year - 1 : year
      })
    }

    // Days in current month
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      cells.push({
        day: d,
        isCurrentMonth: true,
        isLeading: false,
        month,
        year
      })
    }

    // Trailing days from next month
    let nextD = 1
    while (cells.length < 42) {
      cells.push({
        day: nextD++,
        isCurrentMonth: false,
        isLeading: false,
        month: month === 11 ? 0 : month + 1,
        year: month === 11 ? year + 1 : year
      })
    }

    return cells
  }, [year, month, daysInCurrentMonth, firstDow, prevMonthDays])

  const handlePrevMonth = () => {
    if (month === 0) {
      if (year > MIN_YEAR) {
        onYearChange(year - 1)
        onMonthChange(11)
      }
    } else {
      onMonthChange(month - 1)
    }
  }

  const handleNextMonth = () => {
    if (month === 11) {
      if (year < MAX_YEAR) {
        onYearChange(year + 1)
        onMonthChange(0)
      }
    } else {
      onMonthChange(month + 1)
    }
  }

  const canGoPrev = year > MIN_YEAR || month > 0
  const canGoNext = year < MAX_YEAR || month < 11

  return (
    <div
      aria-label="Interactive festival calendar"
      className="neu-card rounded-2xl bg-[#FAF6EF] border border-[#E0D4C5] p-5 space-y-4"
    >
      {/* ── Calendar Navigation Header ── */}
      <div className="flex items-center justify-between pb-2">
        <button
          type="button"
          onClick={handlePrevMonth}
          disabled={!canGoPrev}
          aria-label="Previous month"
          className="p-1.5 rounded-lg text-[#34252A] hover:bg-[#F0E7DA] disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3">
          {/* Month selector dropdown */}
          <div className="relative inline-flex items-center">
            <select
              value={month}
              onChange={(e) => onMonthChange(Number(e.target.value))}
              aria-label="Select month"
              className="appearance-none pr-5 font-serif text-base font-bold text-[#34252A] bg-transparent cursor-pointer focus:outline-none"
            >
              {MONTH_NAMES.map((m, i) => (
                <option key={m} value={i} className="font-sans text-xs bg-[#FAF6EF]">
                  {m}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-0 h-3.5 w-3.5 text-[#75666B] pointer-events-none" />
          </div>

          {/* Year selector dropdown */}
          <div className="relative inline-flex items-center">
            <select
              value={year}
              onChange={(e) => onYearChange(Number(e.target.value))}
              aria-label="Select year"
              className="appearance-none pr-5 font-serif text-base font-bold text-[#6D2039] bg-transparent cursor-pointer focus:outline-none"
            >
              {Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i).map((y) => (
                <option key={y} value={y} className="font-sans text-xs bg-[#FAF6EF]">
                  {y}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-0 h-3.5 w-3.5 text-[#6D2039] pointer-events-none" />
          </div>
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          disabled={!canGoNext}
          aria-label="Next month"
          className="p-1.5 rounded-lg text-[#34252A] hover:bg-[#F0E7DA] disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* ── Weekday Labels ── */}
      <div className="grid grid-cols-7 text-center font-mono text-[10px] font-bold text-[#75666B]/60 tracking-wider">
        {DAY_NAMES.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      {/* ── Day Cells Grid ── */}
      <div className="grid grid-cols-7 gap-y-1 gap-x-1" role="grid">
        {calendarCells.map((cell, idx) => {
          const dateStr = toISODate(cell.year, cell.month, cell.day)
          const events = eventMap[dateStr] || []
          const isToday =
            today?.year === cell.year &&
            today?.month === cell.month &&
            today?.day === cell.day
          const isSelected =
            selectedDate &&
            selectedDate.year === cell.year &&
            selectedDate.month === cell.month &&
            selectedDate.day === cell.day

          const hasEvents = events.length > 0
          const hasMultipleEvents = events.length > 1

          return (
            <button
              key={`${cell.year}-${cell.month}-${cell.day}-${idx}`}
              type="button"
              onClick={() => {
                if (cell.isCurrentMonth) {
                  onSelectDate(isSelected ? null : { year: cell.year, month: cell.month, day: cell.day })
                } else {
                  // Switch to that month and select date
                  onYearChange(cell.year)
                  onMonthChange(cell.month)
                  onSelectDate({ year: cell.year, month: cell.month, day: cell.day })
                }
              }}
              aria-label={`${MONTH_NAMES[cell.month]} ${cell.day}, ${cell.year}${events.length > 0 ? ` — ${events.length} festival${events.length > 1 ? 's' : ''}` : ''}`}
              aria-pressed={isSelected}
              className={`
                relative h-11 w-full rounded-xl flex flex-col items-center justify-start pt-1.5 text-xs font-sans
                transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6D2039]
                ${
                  isSelected
                    ? 'bg-[#6D2039] text-[#FAF6EF] font-bold shadow-md ring-2 ring-[#6D2039]'
                    : isToday
                    ? 'bg-[#FAF6EF] text-[#6D2039] font-bold ring-2 ring-[#6D2039]/40 hover:bg-[#F0E7DA]'
                    : cell.isCurrentMonth
                    ? 'text-[#34252A] font-medium hover:bg-[#F0E7DA] hover:text-[#6D2039]'
                    : 'text-[#75666B]/35 font-normal hover:bg-[#F0E7DA]/50'
                }
              `}
            >
              <span className="leading-none">{cell.day}</span>

              {/* Event Marker Dots */}
              {hasEvents && (
                <div className="absolute bottom-1.5 flex items-center justify-center gap-1">
                  {hasMultipleEvents ? (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-[#FAF6EF]' : 'bg-[#6D2039]'
                      }`}
                      title={`${events.length} festivals`}
                    />
                  ) : (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-[#F0E7DA]' : 'bg-[#B28A49]'
                      }`}
                      title="1 festival"
                    />
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Legend ── */}
      <div className="pt-3 border-t border-[#E0D4C5] flex items-center justify-between text-[11px] font-sans text-[#75666B] flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#B28A49]" />
          <span>1 festival</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#6D2039]" />
          <span>Multiple festivals</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full border-2 border-[#6D2039]/40 bg-transparent" />
          <span>Today</span>
        </div>
      </div>
    </div>
  )
}
export default FestivalCalendar
