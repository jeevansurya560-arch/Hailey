import React, { useState } from 'react'

export function TicketPassCard({ ticket }) {
  const [now] = useState(() => Date.now())
  if (!ticket) return null

  const isExpired = ticket.expires_at && new Date(ticket.expires_at).getTime() < now
  const isRevoked = ticket.status === 'revoked'
  const isUsed = ticket.status === 'used'

  const getStatusBadge = () => {
    if (isRevoked) {
      return <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs rounded-full font-medium">Revoked</span>
    }
    if (isExpired) {
      return <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 border border-zinc-700 text-xs rounded-full font-medium">Expired</span>
    }
    if (isUsed) {
      return <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs rounded-full font-medium">Used</span>
    }
    return <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs rounded-full font-medium">Active Entitlement</span>
  }

  return (
    <div className="relative overflow-hidden p-5 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl shadow-xl space-y-4">
      {/* Decorative pass cutout notches */}
      <div className="absolute -left-3 top-1/2 w-6 h-6 bg-black rounded-full" />
      <div className="absolute -right-3 top-1/2 w-6 h-6 bg-black rounded-full" />

      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400">
            Wallet-Native Access Pass
          </span>
          <h3 className="text-lg font-bold text-white mt-0.5">{ticket.event_title}</h3>
          <span className="text-xs text-zinc-400 block mt-0.5">Event ID: {ticket.event_id}</span>
        </div>
        {getStatusBadge()}
      </div>

      <div className="p-3 bg-zinc-850 bg-zinc-900/80 rounded-xl border border-zinc-800 text-xs space-y-1.5 font-mono">
        <div className="flex justify-between">
          <span className="text-zinc-500">Tier:</span>
          <span className="text-zinc-200 uppercase">{ticket.ticket_type}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Wallet Entitlement:</span>
          <span className="text-purple-300 truncate max-w-[160px]">{ticket.owner_wallet_address}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Pass Hash:</span>
          <span className="text-zinc-400 truncate max-w-[160px]">{ticket.id}</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-800/80">
        <span>Issued: {new Date(ticket.issued_at).toLocaleDateString()}</span>
        <span>Cryptographically Linked</span>
      </div>
    </div>
  )
}
