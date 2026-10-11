import React, { useState } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { createMarket } from '../services/marketService'

export function CreateMarketModal({ isOpen, onClose, onCreated }) {
  const { session } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('cultural_preservation')
  const [resolutionSource, setResolutionSource] = useState('')
  const [deadlineDays, setDeadlineDays] = useState('30')
  const [optionsStr, setOptionsStr] = useState('Yes, No')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!session?.access_token) {
      setError('Please sign in to create a cultural outcome market.')
      return
    }

    const optionsList = optionsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    if (optionsList.length < 2) {
      setError('At least two comma-separated options are required (e.g. Yes, No).')
      return
    }

    setLoading(true)
    setError(null)

    const deadline = new Date(Date.now() + parseInt(deadlineDays, 10) * 24 * 60 * 60 * 1000).toISOString()

    try {
      const created = await createMarket({
        authToken: session.access_token,
        title: title.trim(),
        description: description.trim(),
        category,
        resolutionSource: resolutionSource.trim(),
        resolutionDeadline: deadline,
        options: optionsList,
      })

      onCreated(created)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to create market')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#34252A]/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg p-6 md:p-8 neu-card bg-[#FAF6EF] border border-[#E0D4C5] rounded-3xl shadow-2xl text-[#34252A] max-h-[90vh] overflow-y-auto space-y-4">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#34252A]/50 hover:text-[#34252A] p-1.5 rounded-full hover:bg-[#F0E7DA] transition-colors"
        >
          ✕
        </button>

        <div>
          <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#B08A50]">
            Cultural Forecasting
          </span>
          <h2 className="text-2xl font-serif font-bold text-[#34252A] mt-0.5">Create Cultural Outcome Market</h2>
          <p className="text-xs text-[#34252A]/70 mt-1 leading-relaxed">
            Markets must specify an objective, verifiable cultural milestone with a clear evidence source.
          </p>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs neu-card">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-mono font-medium text-[#34252A]/80">Proposition Title</label>
            <input
              type="text"
              placeholder="e.g. Will the Shibuya Sound Archive cross 10,000 onchain attestations?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 neu-inset-input bg-[#FAF6EF] border border-[#E0D4C5] rounded-xl text-[#34252A] placeholder:text-[#34252A]/40 text-xs focus:outline-none focus:ring-1 focus:ring-[#6A1F35]"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-mono font-medium text-[#34252A]/80">Outcome Description & Criteria</label>
            <textarea
              rows="3"
              placeholder="State the exact conditions required for this market to resolve."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 neu-inset-input bg-[#FAF6EF] border border-[#E0D4C5] rounded-xl text-[#34252A] placeholder:text-[#34252A]/40 text-xs focus:outline-none focus:ring-1 focus:ring-[#6A1F35]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-mono font-medium text-[#34252A]/80">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 neu-inset-input bg-[#FAF6EF] border border-[#E0D4C5] rounded-xl text-[#34252A] text-xs focus:outline-none focus:ring-1 focus:ring-[#6A1F35]"
              >
                <option value="cultural_preservation">Cultural Preservation</option>
                <option value="exhibition">Exhibition / Event</option>
                <option value="archive_milestone">Archive Milestone</option>
                <option value="community_growth">Community Growth</option>
                <option value="trend_forecast">Trend Forecast</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-mono font-medium text-[#34252A]/80">Deadline Duration</label>
              <select
                value={deadlineDays}
                onChange={(e) => setDeadlineDays(e.target.value)}
                className="w-full px-3 py-2.5 neu-inset-input bg-[#FAF6EF] border border-[#E0D4C5] rounded-xl text-[#34252A] text-xs focus:outline-none focus:ring-1 focus:ring-[#6A1F35]"
              >
                <option value="7">7 Days</option>
                <option value="14">14 Days</option>
                <option value="30">30 Days</option>
                <option value="90">90 Days</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-mono font-medium text-[#34252A]/80">Authoritative Resolution Source</label>
            <input
              type="text"
              placeholder="e.g. Official Monadvision explorer count / Tokyo Arts Council Announcement"
              value={resolutionSource}
              onChange={(e) => setResolutionSource(e.target.value)}
              className="w-full px-3.5 py-2.5 neu-inset-input bg-[#FAF6EF] border border-[#E0D4C5] rounded-xl text-[#34252A] placeholder:text-[#34252A]/40 text-xs focus:outline-none focus:ring-1 focus:ring-[#6A1F35]"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-mono font-medium text-[#34252A]/80">Options (comma-separated)</label>
            <input
              type="text"
              placeholder="e.g. Yes, No (or Option A, Option B)"
              value={optionsStr}
              onChange={(e) => setOptionsStr(e.target.value)}
              className="w-full px-3.5 py-2.5 neu-inset-input bg-[#FAF6EF] border border-[#E0D4C5] rounded-xl text-[#34252A] text-xs focus:outline-none focus:ring-1 focus:ring-[#6A1F35] font-mono"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-[#6A1F35] text-[#FAF6EF] hover:bg-[#511528] active:bg-[#3D0F1D] font-bold rounded-full text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Deploying Market...' : 'Publish Cultural Market'}
          </button>
        </form>
      </div>
    </div>
  )
}
