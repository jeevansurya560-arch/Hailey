import React, { useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { useAccount } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { listUserTickets, claimTicket } from '../services/ticketService'
import { TicketPassCard } from '../components/TicketPassCard'
import { TicketVerifierModal } from '../components/TicketVerifierModal'

const UPCOMING_EVENTS = [
  {
    id: 'tokyo-underground-summit-2026',
    title: 'Tokyo Underground Summit 2026',
    type: 'curator_pass',
    desc: 'Autonomous arts & sound exhibition in Shibuya.',
  },
  {
    id: 'kyoto-sound-pavilion',
    title: 'Kyoto Sound & Tea Pavilion',
    type: 'vip',
    desc: 'Heritage audio rituals and interactive tea ceremony archive.',
  },
]

export function TicketingPage() {
  const { session } = useAuth()
  const { address } = useAccount()
  const [claiming, setClaiming] = useState(null)
  const [error, setError] = useState(null)
  const [verifierOpen, setVerifierOpen] = useState(false)

  const {
    data: tickets = [],
    isLoading: loading,
    refetch: loadTickets,
  } = useQuery({
    queryKey: ['tickets', session?.access_token],
    queryFn: () => (session?.access_token ? listUserTickets(session.access_token) : []),
    enabled: !!session?.access_token,
  })

  const handleClaim = async (event) => {
    if (!session?.access_token) {
      setError('Please sign in to claim a ticket.')
      return
    }

    setClaiming(event.id)
    setError(null)

    try {
      await claimTicket({
        authToken: session.access_token,
        eventId: event.id,
        eventTitle: event.title,
        walletAddress: address || undefined,
        ticketType: event.type,
      })
      await loadTickets()
    } catch (err) {
      setError(err.message || 'Failed to claim ticket pass')
    } finally {
      setClaiming(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in text-zinc-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-purple-400">
            Identity & Entitlements
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Wallet-Native Ticketing
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Access passes bound cryptographically to personhood and wallets — never trapped in an email inbox.
          </p>
        </div>

        <button
          onClick={() => setVerifierOpen(true)}
          className="self-start md:self-auto px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-purple-300 font-semibold text-xs rounded-xl border border-zinc-700 transition"
        >
          🔍 Gatekeeper Verifier
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs">
          {error}
        </div>
      )}

      {/* Owned Passes */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          🎟️ Your Active Passes ({tickets.length})
        </h2>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="h-44 bg-zinc-900 border border-zinc-800 rounded-2xl animate-pulse" />
            <div className="h-44 bg-zinc-900 border border-zinc-800 rounded-2xl animate-pulse" />
          </div>
        ) : tickets.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {tickets.map((ticket) => (
              <TicketPassCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        ) : (
          <div className="p-8 bg-zinc-900/60 border border-zinc-800 rounded-2xl text-center space-y-2">
            <p className="text-sm text-zinc-400">You don't have any wallet access passes yet.</p>
            <p className="text-xs text-zinc-500">
              Claim a ticket below to link it directly to your cryptographic identity.
            </p>
          </div>
        )}
      </section>

      {/* Available Cultural Passes */}
      <section className="space-y-4 pt-4 border-t border-zinc-800">
        <h2 className="text-base font-bold text-white">Available Cultural Events</h2>

        <div className="grid md:grid-cols-2 gap-4">
          {UPCOMING_EVENTS.map((event) => (
            <div
              key={event.id}
              className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-white text-base">{event.title}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded uppercase">
                    {event.type}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-2">{event.desc}</p>
              </div>

              <button
                onClick={() => handleClaim(event)}
                disabled={claiming === event.id}
                className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/20 transition disabled:opacity-50"
              >
                {claiming === event.id ? 'Issuing Pass...' : 'Claim to Linked Wallet'}
              </button>
            </div>
          ))}
        </div>
      </section>

      <TicketVerifierModal isOpen={verifierOpen} onClose={() => setVerifierOpen(false)} />
    </div>
  )
}
