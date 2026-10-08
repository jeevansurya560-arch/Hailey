/**
 * Re-exports canonical market service from server/services/markets/marketService.js
 * Retains backward compatibility for existing callers and tests.
 */
export {
  createMarket,
  listMarkets,
  getMarket,
  takePosition,
  resolveMarket,
} from '../services/markets/marketService.js'
