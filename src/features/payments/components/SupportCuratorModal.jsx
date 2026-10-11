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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#34252A]/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md p-6 md:p-8 neu-card bg-[#FAF6EF] border border-[#E0D4C5] rounded-3xl shadow-2xl text-[#34252A] space-y-4">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#34252A]/50 hover:text-[#34252A] p-1.5 rounded-full hover:bg-[#F0E7DA] transition-colors"
        >
          ✕
        </button>

        {receipt ? (
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 mx-auto bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full flex items-center justify-center text-xl font-bold neu-circle">
              ✓
            </div>
            <h2 className="text-2xl font-serif font-bold tracking-tight text-[#34252A]">Support Completed!</h2>
            <p className="text-sm text-[#34252A]/70 leading-relaxed">
              Your contribution was settled directly to <span className="text-[#6A1F35] font-semibold">@{curatorHandle}</span>.
            </p>

            <div className="p-4 neu-card bg-[#F0E7DA]/50 rounded-2xl text-left text-xs space-y-2 border border-[#E0D4C5] font-mono">
              <div className="flex justify-between">
                <span className="text-[#34252A]/60">Total Paid:</span>
                <span className="text-[#34252A] font-semibold">{receipt.amount} {receipt.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#34252A]/60">Curator Payout (95%):</span>
                <span className="text-[#6A1F35] font-bold">{receipt.curator_amount} {receipt.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#34252A]/60">Protocol Fee (5%):</span>
                <span className="text-[#34252A]/70">{receipt.platform_fee} {receipt.currency}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#E0D4C5]">
                <span className="text-[#34252A]/60">Tx Hash:</span>
                <span className="text-[#34252A]/80 truncate max-w-[180px]">{receipt.tx_hash}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 neu-pill bg-[#FAF6EF] hover:bg-[#F0E7DA] text-[#34252A] border border-[#E0D4C5] font-medium rounded-full transition"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSupport} className="space-y-4">
            <div>
              <span className="text-xs uppercase font-mono font-bold tracking-wider text-[#B08A50]">Paid Curation</span>
              <h2 className="text-2xl font-serif font-bold text-[#34252A] mt-0.5">Support @{curatorHandle}</h2>
              {collectionTitle && (
                <p className="text-xs text-[#34252A]/70 mt-0.5">For curating: "{collectionTitle}"</p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs neu-card">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-mono font-medium text-[#34252A]/80 mb-1">Support Amount</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-3.5 pr-20 py-2.5 neu-inset-input bg-[#FAF6EF] border border-[#E0D4C5] rounded-xl text-[#34252A] font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[#6A1F35] transition"
                  required
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="absolute right-2 top-2 px-2.5 py-1 bg-[#F0E7DA] text-[#34252A] text-xs rounded-lg border border-[#E0D4C5] font-mono font-medium"
                >
                  <option value="USDC">USDC</option>
                  <option value="MON">MON</option>
                </select>
              </div>
            </div>

            <div className="p-3.5 neu-card bg-[#F0E7DA]/50 rounded-2xl text-xs space-y-1.5 border border-[#E0D4C5] font-mono">
              <div className="flex justify-between text-[#34252A]/70">
                <span>Curator receives (95%):</span>
                <span className="text-[#6A1F35] font-bold">{curatorPayout} {currency}</span>
              </div>
              <div className="flex justify-between text-[#34252A]/70">
                <span>Protocol ecosystem fee (5%):</span>
                <span className="text-[#34252A]/60">{platformFee} {currency}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-[#34252A]/80 mb-1">Settlement Rail</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('crypto_monad')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    paymentMethod === 'crypto_monad'
                      ? 'border-[#6A1F35] bg-[#6A1F35]/10 text-[#6A1F35] font-semibold neu-inset'
                      : 'border-[#E0D4C5] bg-[#FAF6EF] text-[#34252A]/70 hover:border-[#6A1F35]/40 neu-card'
                  }`}
                >
                  ⚡ Monad Testnet
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('crypto_evm')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    paymentMethod === 'crypto_evm'
                      ? 'border-[#6A1F35] bg-[#6A1F35]/10 text-[#6A1F35] font-semibold neu-inset'
                      : 'border-[#E0D4C5] bg-[#FAF6EF] text-[#34252A]/70 hover:border-[#6A1F35]/40 neu-card'
                  }`}
                >
                  💎 EVM / USDC
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || parsedAmount <= 0}
              className="w-full mt-2 py-3 px-4 bg-[#6A1F35] text-[#FAF6EF] hover:bg-[#511528] active:bg-[#3D0F1D] font-bold rounded-full text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Processing Settlement...' : `Confirm & Pay ${parsedAmount} ${currency}`}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
