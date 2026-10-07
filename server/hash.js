/**
 * Re-exports canonical hashing functions from shared/crypto/hashing.js
 * Ensures backwards compatibility for serverless functions while maintaining
 * single-source-of-truth cryptography without node:crypto.
 */
export {
  computeCommunityId,
  computeItemContent,
  computeContentHash,
} from '../shared/crypto/hashing.js'
