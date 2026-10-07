import React, { useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { getCuratorEarnings } from '../services/paymentService'

export function CuratorEarningsCard() {
  const { session } = useAuth()
  const [earnings, setEarnings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!session?.access_token) return

    getCuratorEarnings(session.access_token)
      .then((data) => setEarnings(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [session])

  if (!session) return null

  if (loading) {
    return (
      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl animate-pulse text-zinc-500 text-xs">
        Loading curator earnings...
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs text-rose-400">
        Failed to load curator earnings: {error}
      </div>
    )
  }

  return (
    <div className="p-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl text-zinc-100 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-amber-400">Paid Curation</span>
          <h3 className="text-base font-bold text-white">Curator Revenue</h3>
        </div>
        <span className="px-2.5 py-1 bg-amber-400/10 text-amber-400 text-xs font-semibold rounded-full border border-amber-400/20">
          95% Direct Share
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-zinc-800/50 rounded-xl border border-zinc-700/40">
          <span className="text-xs text-zinc-400 block mb-1">Total Earned</span>
          <span className="text-xl font-bold font-mono text-emerald-400">
            ${earnings?.totalEarned?.toFixed(2) || '0.00'}
          </span>
        </div>
        <div className="p-3 bg-zinc-800/50 rounded-xl border border-zinc-700/40">
          <span className="text-xs text-zinc-400 block mb-1">Supporters</span>
          <span className="text-xl font-bold font-mono text-white">
            {earnings?.supportCount || 0}
          </span>
        </div>
      </div>

      {earnings?.recentPayments?.length > 0 ? (
        <div className="space-y-2">
          <span className="text-xs font-semibold text-zinc-400 block">Recent Supports</span>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {earnings.recentPayments.map((p) => (
              <div
                key={p.id}
                className="p-2.5 bg-zinc-800/30 rounded-lg text-xs flex justify-between items-center border border-zinc-800"
              >
                <div>
                  <span className="font-mono text-emerald-400 font-medium">+{p.curator_amount} {p.currency}</span>
                  <span className="block text-[10px] text-zinc-500">
                    {new Date(p.completed_at || p.created_at).toLocaleDateString()}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                  {p.payment_method}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-zinc-500 italic">No curator contributions received yet.</p>
      )}
    </div>
  )
}
