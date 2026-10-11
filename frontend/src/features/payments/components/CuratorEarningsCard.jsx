import React, { useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
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
      <div className="p-4 neu-card bg-[#FAF6EF] border border-[#E0D4C5] rounded-2xl animate-pulse text-[#34252A]/50 text-xs">
        Loading curator earnings...
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 neu-card bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800">
        Failed to load curator earnings: {error}
      </div>
    )
  }

  return (
    <div className="p-6 neu-card bg-[#FAF6EF] border border-[#E0D4C5] rounded-2xl text-[#34252A] space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs uppercase font-mono font-bold tracking-wider text-[#B08A50]">Paid Curation</span>
          <h3 className="text-lg font-serif font-bold text-[#34252A]">Curator Revenue Dashboard</h3>
        </div>
        <span className="px-3 py-1 bg-[#F0E7DA] text-[#6A1F35] text-xs font-semibold rounded-full border border-[#E0D4C5] neu-pill">
          95% Direct Share
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 neu-card bg-[#F0E7DA]/50 rounded-xl border border-[#E0D4C5]">
          <span className="text-xs text-[#34252A]/60 block mb-1">Total Earned</span>
          <span className="text-xl font-bold font-mono text-[#6A1F35]">
            ${earnings?.totalEarned?.toFixed(2) || '0.00'}
          </span>
        </div>
        <div className="p-3.5 neu-card bg-[#F0E7DA]/50 rounded-xl border border-[#E0D4C5]">
          <span className="text-xs text-[#34252A]/60 block mb-1">Supporters</span>
          <span className="text-xl font-bold font-mono text-[#34252A]">
            {earnings?.supportCount || 0}
          </span>
        </div>
      </div>

      {earnings?.recentPayments?.length > 0 ? (
        <div className="space-y-2">
          <span className="text-xs font-semibold text-[#34252A]/70 block">Recent Supports</span>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {earnings.recentPayments.map((p) => (
              <div
                key={p.id}
                className="p-3 bg-[#FAF6EF] rounded-xl text-xs flex justify-between items-center border border-[#E0D4C5] neu-card"
              >
                <div>
                  <span className="font-mono text-[#6A1F35] font-semibold">+{p.curator_amount} {p.currency}</span>
                  <span className="block text-[10px] text-[#34252A]/50 font-mono">
                    {new Date(p.completed_at || p.created_at).toLocaleDateString()}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#34252A]/70 bg-[#F0E7DA] px-2.5 py-0.5 rounded-full border border-[#E0D4C5]">
                  {p.payment_method}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-[#34252A]/60 italic">No curator contributions received yet.</p>
      )}
    </div>
  )
}
