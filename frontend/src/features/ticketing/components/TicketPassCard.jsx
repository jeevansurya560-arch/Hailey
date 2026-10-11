import React, { useState } from 'react'

export function TicketPassCard({ ticket }) {
  const [now] = useState(() => Date.now())
  if (!ticket) return null

  const isExpired = ticket.expires_at && new Date(ticket.expires_at).getTime() < now
  const isRevoked = ticket.status === 'revoked'
  const isUsed = ticket.status === 'used'

  const getStatusBadge = () => {
    if (isRevoked) {
      return <span className="px-2.5 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 text-xs rounded-full font-medium">Revoked</span>
    }
    if (isExpired) {
      return <span className="px-2.5 py-0.5 bg-[#F0E7DA] text-[#34252A]/60 border border-[#E0D4C5] text-xs rounded-full font-medium">Expired</span>
    }
    if (isUsed) {
      return <span className="px-2.5 py-0.5 bg-[#F0E7DA] text-[#34252A]/70 border border-[#E0D4C5] text-xs rounded-full font-medium">Used</span>
    }
    return <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs rounded-full font-medium">Active Entitlement</span>
  }

  return (
    <div className="relative overflow-hidden p-5 neu-card bg-[#FAF6EF] border border-[#E0D4C5] rounded-2xl space-y-4 text-[#34252A]">
      {/* Decorative pass cutout notches */}
      <div className="absolute -left-3 top-1/2 w-6 h-6 bg-[#FAF6EF] border border-[#E0D4C5] rounded-full shadow-inner" />
      <div className="absolute -right-3 top-1/2 w-6 h-6 bg-[#FAF6EF] border border-[#E0D4C5] rounded-full shadow-inner" />

      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#B08A50]">
            Wallet-Native Access Pass
          </span>
          <h3 className="text-lg font-serif font-bold text-[#34252A] mt-0.5">{ticket.event_title}</h3>
          <span className="text-xs text-[#34252A]/60 block mt-0.5 font-mono">Event ID: {ticket.event_id}</span>
        </div>
        {getStatusBadge()}
      </div>

      <div className="p-3.5 neu-card bg-[#F0E7DA]/50 rounded-xl border border-[#E0D4C5] text-xs space-y-1.5 font-mono">
        <div className="flex justify-between">
          <span className="text-[#34252A]/60">Tier:</span>
          <span className="text-[#34252A] font-semibold uppercase">{ticket.ticket_type}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#34252A]/60">Wallet Entitlement:</span>
          <span className="text-[#6A1F35] font-semibold truncate max-w-[160px]">{ticket.owner_wallet_address}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#34252A]/60">Pass Hash:</span>
          <span className="text-[#34252A]/70 truncate max-w-[160px]">{ticket.id}</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-[#34252A]/60 pt-2 border-t border-[#E0D4C5]">
        <span>Issued: {new Date(ticket.issued_at).toLocaleDateString()}</span>
        <span className="text-[#B08A50]">Cryptographically Linked</span>
      </div>
    </div>
  )
}
