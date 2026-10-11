import React, { useState } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useAccount } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { listUserTickets, claimTicket } from '../services/ticketService'
import { TicketPassCard } from '../components/TicketPassCard'
import { TicketVerifierModal } from '../components/TicketVerifierModal'
import { CommunitySubNav } from '@/features/communities/components/CommunitySubNav'
import { Loader2 } from 'lucide-react'

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
    <div className="space-y-8 animate-fade-in text-[#34252A]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E0D4C5] pb-5">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#B08A50]">
            Identity & Entitlements
          </span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-[#34252A] mt-1">
            Wallet-Native Ticketing
          </h1>
          <p className="text-sm text-[#34252A]/70 mt-1 max-w-2xl leading-relaxed">
            Access passes bound cryptographically to personhood and wallets — never trapped in an email inbox.
          </p>
          <div className="mt-4 pt-1">
            <CommunitySubNav />
          </div>
        </div>

        <button
          onClick={() => setVerifierOpen(true)}
          className="self-start md:self-auto px-4 py-2 neu-pill bg-[#FAF6EF] text-[#34252A] font-semibold text-xs rounded-full border border-[#E0D4C5] hover:bg-[#F0E7DA] transition-all"
        >
          🔍 Gatekeeper Verifier
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs neu-card">
          {error}
        </div>
      )}

      {/* Owned Passes */}
      <section className="space-y-4">
        <h2 className="text-base font-serif font-bold text-[#34252A] flex items-center gap-2">
          🎟️ Your Active Passes ({tickets.length})
        </h2>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="h-44 bg-[#F0E7DA]/50 border border-[#E0D4C5] rounded-2xl animate-pulse" />
            <div className="h-44 bg-[#F0E7DA]/50 border border-[#E0D4C5] rounded-2xl animate-pulse" />
          </div>
        ) : tickets.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {tickets.map((ticket) => (
              <TicketPassCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        ) : (
          <div className="p-8 neu-card bg-[#FAF6EF] border border-dashed border-[#E0D4C5] rounded-2xl text-center space-y-2">
            <p className="text-sm text-[#34252A]/70">You don't have any wallet access passes yet.</p>
            <p className="text-xs text-[#34252A]/50">
              Claim a ticket below to link it directly to your cryptographic identity.
            </p>
          </div>
        )}
      </section>

      {/* Available Cultural Passes */}
      <section className="space-y-4 pt-4 border-t border-[#E0D4C5]">
        <h2 className="text-base font-serif font-bold text-[#34252A]">Available Cultural Events</h2>

        <div className="grid md:grid-cols-2 gap-4">
          {UPCOMING_EVENTS.map((event) => (
            <div
              key={event.id}
              className="p-6 neu-card bg-[#FAF6EF] border border-[#E0D4C5] rounded-2xl flex flex-col justify-between space-y-4 hover:border-[#6A1F35]/30 transition-all"
            >
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-serif font-bold text-[#34252A] text-lg">{event.title}</h3>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 bg-[#F0E7DA] text-[#6A1F35] border border-[#E0D4C5] rounded-full uppercase font-semibold">
                    {event.type}
                  </span>
                </div>
                <p className="text-xs text-[#34252A]/70 mt-2 leading-relaxed">{event.desc}</p>
              </div>

              <button
                onClick={() => handleClaim(event)}
                disabled={claiming === event.id}
                className="w-full py-2.5 px-4 bg-[#6A1F35] text-[#FAF6EF] hover:bg-[#511528] active:bg-[#3D0F1D] font-bold text-xs uppercase tracking-wider rounded-full shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#B08A50]"
              >
                {claiming === event.id ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#FAF6EF]" />
                    <span className="text-[#FAF6EF] font-bold">Issuing Pass...</span>
                  </>
                ) : (
                  <span className="text-[#FAF6EF] font-bold tracking-wider">Claim to Linked Wallet</span>
                )}
              </button>
            </div>
          ))}
        </div>
      </section>

      <TicketVerifierModal isOpen={verifierOpen} onClose={() => setVerifierOpen(false)} />
    </div>
  )
}
