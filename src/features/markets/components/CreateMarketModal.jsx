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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl text-zinc-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
        >
          ✕
        </button>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
            Cultural Forecasting
          </span>
          <h2 className="text-xl font-bold text-white mt-0.5">Create Cultural Outcome Market</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Markets must specify an objective, verifiable cultural milestone with a clear evidence source.
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-lg text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Proposition Title</label>
            <input
              type="text"
              placeholder="e.g. Will the Shibuya Sound Archive cross 10,000 onchain attestations?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Outcome Description & Criteria</label>
            <textarea
              rows="3"
              placeholder="State the exact conditions required for this market to resolve."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-400"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-xs"
              >
                <option value="cultural_preservation">Cultural Preservation</option>
                <option value="exhibition">Exhibition / Event</option>
                <option value="archive_milestone">Archive Milestone</option>
                <option value="community_growth">Community Growth</option>
                <option value="trend_forecast">Trend Forecast</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Deadline Duration</label>
              <select
                value={deadlineDays}
                onChange={(e) => setDeadlineDays(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-xs"
              >
                <option value="7">7 Days</option>
                <option value="14">14 Days</option>
                <option value="30">30 Days</option>
                <option value="90">90 Days</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Authoritative Resolution Source</label>
            <input
              type="text"
              placeholder="e.g. Official Monadvision explorer count / Tokyo Arts Council Announcement"
              value={resolutionSource}
              onChange={(e) => setResolutionSource(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Options (comma-separated)</label>
            <input
              type="text"
              placeholder="e.g. Yes, No (or Option A, Option B)"
              value={optionsStr}
              onChange={(e) => setOptionsStr(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-400 font-mono"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 text-xs transition disabled:opacity-50"
          >
            {loading ? 'Deploying Market...' : 'Publish Cultural Market'}
          </button>
        </form>
      </div>
    </div>
  )
}
