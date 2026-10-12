const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

export function MonthSelector({ selectedMonth, onSelectMonth }) {
  return (
    <nav
      aria-label="Calendar month selection"
      className="neu-card rounded-2xl bg-[#FAF6EF] border border-[#E0D4C5] p-1.5 flex items-center justify-between overflow-x-auto scrollbar-none"
    >
      <div className="grid grid-cols-12 w-full min-w-[580px] gap-1">
        {SHORT_MONTHS.map((monthName, idx) => {
          const isSelected = selectedMonth === idx
          return (
            <button
              key={monthName}
              type="button"
              onClick={() => onSelectMonth(idx)}
              aria-pressed={isSelected}
              className={`py-2 text-center font-sans text-xs font-semibold rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6D2039] ${
                isSelected
                  ? 'bg-[#6D2039] text-[#FAF6EF] shadow-sm font-bold'
                  : 'text-[#34252A]/75 hover:bg-[#F0E7DA] hover:text-[#6D2039]'
              }`}
            >
              {monthName}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
export default MonthSelector
