/**
 * Re-exports canonical payment service from server/services/payments/paymentService.js
 * Retains backward compatibility for existing callers and tests.
 */
export {
  createPaymentIntent,
  confirmCryptoPayment,
  getCuratorEarnings,
  getPayerHistory,
} from '../services/payments/paymentService.js'
