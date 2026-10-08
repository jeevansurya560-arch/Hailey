import React, { useState } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { createPaymentIntent, confirmCryptoPayment } from '../services/paymentService'

export function SupportCuratorModal({
  isOpen,
  onClose,
  curatorId,
  curatorHandle = 'curator',
  collectionId = null,
  collectionTitle = null,
  onSuccess = () => {},
}) {
  const { session } = useAuth()
  const [amount, setAmount] = useState('5.00')
  const [currency, setCurrency] = useState('USDC')
  const [paymentMethod, setPaymentMethod] = useState('crypto_monad')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [receipt, setReceipt] = useState(null)

  if (!isOpen) return null

  const parsedAmount = parseFloat(amount) || 0
  const platformFee = parseFloat((parsedAmount * 0.05).toFixed(4))
  const curatorPayout = parseFloat((parsedAmount - platformFee).toFixed(4))

  const handleSupport = async (e) => {
    e.preventDefault()
    if (!session?.access_token) {
      setError('Please sign in to support this curator.')
      return
    }

    if (parsedAmount <= 0) {
      setError('Amount must be greater than zero.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // 1. Create authoritative server-side payment intent
      const payment = await createPaymentIntent({
        authToken: session.access_token,
        curatorUserId: curatorId,
        collectionId,
        amount: parsedAmount,
        currency,
        paymentMethod,
      })

      // 2. Settle payment (simulating Monad testnet tx execution or client wallet transfer)
      const simulatedTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`

      const confirmedRes = await confirmCryptoPayment({
        authToken: session.access_token,
        paymentId: payment.id,
        txHash: simulatedTxHash,
      })

      setReceipt(confirmedRes.payment)
      onSuccess(confirmedRes.payment)
    } catch (err) {
      setError(err.message || 'Payment processing failed')
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

        {receipt ? (
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 mx-auto bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center text-xl font-bold">
              ✓
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">Support Completed!</h2>
            <p className="text-sm text-zinc-400">
              Your contribution was settled directly to <span className="text-white font-medium">@{curatorHandle}</span>.
            </p>

            <div className="p-4 bg-zinc-800/60 rounded-xl text-left text-xs space-y-2 border border-zinc-700/50">
              <div className="flex justify-between">
                <span className="text-zinc-400">Total Paid:</span>
                <span className="font-mono text-white font-semibold">{receipt.amount} {receipt.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Curator Payout (95%):</span>
                <span className="font-mono text-emerald-400 font-semibold">{receipt.curator_amount} {receipt.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Protocol Fee (5%):</span>
                <span className="font-mono text-zinc-400">{receipt.platform_fee} {receipt.currency}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-zinc-700/50">
                <span className="text-zinc-400">Tx Hash:</span>
                <span className="font-mono text-zinc-300 truncate max-w-[180px]">{receipt.tx_hash}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSupport} className="space-y-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Paid Curation</span>
              <h2 className="text-lg font-bold text-white mt-0.5">Support @{curatorHandle}</h2>
              {collectionTitle && (
                <p className="text-xs text-zinc-400 mt-0.5">For curating: "{collectionTitle}"</p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-lg text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Support Amount</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-3 pr-20 py-2.5 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-400 transition"
                  required
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="absolute right-2 top-2 px-2 py-1 bg-zinc-700 text-zinc-200 text-xs rounded-lg border-0 font-medium"
                >
                  <option value="USDC">USDC</option>
                  <option value="MON">MON</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-zinc-850 bg-zinc-800/40 rounded-xl text-xs space-y-1.5 border border-zinc-800">
              <div className="flex justify-between text-zinc-400">
                <span>Curator receives (95%):</span>
                <span className="font-mono text-zinc-200">{curatorPayout} {currency}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Protocol ecosystem fee (5%):</span>
                <span className="font-mono text-zinc-400">{platformFee} {currency}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Settlement Rail</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('crypto_monad')}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    paymentMethod === 'crypto_monad'
                      ? 'border-amber-400 bg-amber-400/10 text-white font-medium'
                      : 'border-zinc-800 bg-zinc-800/50 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  ⚡ Monad Testnet
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('crypto_evm')}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    paymentMethod === 'crypto_evm'
                      ? 'border-amber-400 bg-amber-400/10 text-white font-medium'
                      : 'border-zinc-800 bg-zinc-800/50 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  💎 EVM / USDC
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || parsedAmount <= 0}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
            >
              {loading ? 'Processing Settlement...' : `Confirm & Pay ${parsedAmount} ${currency}`}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
