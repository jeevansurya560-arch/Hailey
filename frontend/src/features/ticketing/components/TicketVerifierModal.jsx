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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl text-zinc-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
        >
          ✕
        </button>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
            Access Gatekeeper
          </span>
          <h2 className="text-lg font-bold text-white mt-0.5">Verify Wallet Entitlement</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Check if an EVM address holds valid, unrevoked access without relying on email.
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-lg text-xs">
            {error}
          </div>
        )}

        {result && (
          <div
            className={`mt-4 p-4 rounded-xl border text-xs space-y-2 ${
              result.granted
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-bold">
              <span>{result.granted ? '✅ Access Granted' : '❌ Access Denied'}</span>
            </div>
            {result.granted ? (
              <div>
                <p>Valid ticket: <span className="font-semibold">{result.ticket.event_title}</span></p>
                <p className="font-mono text-[11px] opacity-80 mt-1">Tier: {result.ticket.ticket_type} • ID: {result.ticket.id}</p>
              </div>
            ) : (
              <p className="opacity-90">{result.reason}</p>
            )}
          </div>
        )}

        <form onSubmit={handleVerify} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Event ID</label>
            <input
              type="text"
              placeholder="e.g. tokyo-underground-summit-2026"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-purple-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Attendee Wallet Address</label>
            <input
              type="text"
              placeholder="0x..."
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-purple-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/20 text-xs transition disabled:opacity-50"
          >
            {loading ? 'Verifying on Registry...' : 'Check Entitlement Status'}
          </button>
        </form>
      </div>
    </div>
  )
}
