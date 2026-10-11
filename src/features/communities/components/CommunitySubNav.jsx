import { NavLink } from 'react-router-dom'
import { Users, ShoppingBag, Ticket } from 'lucide-react'

export function CommunitySubNav() {
  const tabs = [
    { to: '/communities', label: 'Collectives', icon: Users, exact: true },
    { to: '/markets', label: 'Markets', icon: ShoppingBag },
    { to: '/tickets', label: 'Passes', icon: Ticket },
  ]

  return (
    <nav
      aria-label="Community sections"
      className="inline-flex items-center gap-1.5 p-1.5 bg-[#F0E7DA]/70 border border-[#E0D4C5] rounded-full neu-pill"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.exact}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#6A1F35] text-[#FAF6EF] neu-burgundy-pill font-semibold'
                  : 'text-[#34252A] hover:bg-[#FAF6EF] hover:text-[#6A1F35] active:neu-inset'
              }`
            }
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{tab.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
