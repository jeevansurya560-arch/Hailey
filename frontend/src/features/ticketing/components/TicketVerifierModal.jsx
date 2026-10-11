import React, { useState } from 'react'
import { verifyTicketAccess } from '../services/ticketService'

export function TicketVerifierModal({ isOpen, onClose }) {
  const [eventId, setEventId] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  const handleVerify = async (e) => {
    e.preventDefault()
    if (!eventId || !walletAddress) {
      setError('Please provide both Event ID and Wallet Address.')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await verifyTicketAccess({
        eventId: eventId.trim(),
        walletAddress: walletAddress.trim(),
      })
      setResult(res)
    } catch (err) {
      setError(err.message || 'Verification check failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#34252A]/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md p-6 md:p-8 neu-card bg-[#FAF6EF] border border-[#E0D4C5] rounded-3xl shadow-2xl text-[#34252A] space-y-4">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#34252A]/50 hover:text-[#34252A] p-1.5 rounded-full hover:bg-[#F0E7DA] transition-colors"
        >
          ✕
        </button>

        <div>
          <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#B08A50]">
            Access Gatekeeper
          </span>
          <h2 className="text-xl font-serif font-bold text-[#34252A] mt-0.5">Verify Wallet Entitlement</h2>
          <p className="text-xs text-[#34252A]/70 mt-1 leading-relaxed">
            Check if an EVM address holds valid, unrevoked access without relying on email.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs neu-card">
            {error}
          </div>
        )}

        {result && (
          <div
            className={`p-4 rounded-2xl border text-xs space-y-2 neu-card ${
              result.granted
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
                : 'bg-rose-50/80 border-rose-300 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-bold">
              <span>{result.granted ? '✅ Access Granted' : '❌ Access Denied'}</span>
            </div>
            {result.granted ? (
              <div>
                <p>Valid ticket: <span className="font-semibold text-[#34252A]">{result.ticket.event_title}</span></p>
                <p className="font-mono text-[11px] opacity-80 mt-1">Tier: {result.ticket.ticket_type} • ID: {result.ticket.id}</p>
              </div>
            ) : (
              <p className="opacity-90">{result.reason}</p>
            )}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-3.5">
          <div className="space-y-1">
            <label className="block text-xs font-mono font-medium text-[#34252A]/80">Event ID</label>
            <input
              type="text"
              placeholder="e.g. tokyo-underground-summit-2026"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full px-3.5 py-2 neu-inset-input bg-[#FAF6EF] border border-[#E0D4C5] rounded-xl text-[#34252A] text-xs font-mono placeholder:text-[#34252A]/40 focus:outline-none focus:ring-1 focus:ring-[#6A1F35]"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-mono font-medium text-[#34252A]/80">Attendee Wallet Address</label>
            <input
              type="text"
              placeholder="0x..."
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="w-full px-3.5 py-2 neu-inset-input bg-[#FAF6EF] border border-[#E0D4C5] rounded-xl text-[#34252A] text-xs font-mono placeholder:text-[#34252A]/40 focus:outline-none focus:ring-1 focus:ring-[#6A1F35]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-[#6A1F35] text-[#FAF6EF] hover:bg-[#511528] active:bg-[#3D0F1D] font-bold rounded-full text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Verifying on Registry...' : 'Check Entitlement Status'}
          </button>
        </form>
      </div>
    </div>
  )
}
