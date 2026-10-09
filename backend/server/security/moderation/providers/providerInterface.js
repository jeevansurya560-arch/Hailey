/**
 * @typedef {Object} CategoryAnalysis
 * @property {number} score Confidence score between 0.0 and 1.0
 * @property {boolean} detected Boolean flag indicating if category exceeds internal detection threshold
 */

/**
 * @typedef {Object} NormalizedSafetyResult
 * @property {'ANALYZED' | 'ANALYSIS_FAILED' | 'UNSUPPORTED'} status
 * @property {{
 *   blood: CategoryAnalysis,
 *   graphicViolence: CategoryAnalysis,
 *   gore: CategoryAnalysis,
 *   severeInjury: CategoryAnalysis
 * }} categories
 * @property {number} overallRisk Aggregated risk score between 0.0 and 1.0
 * @property {string} provider Provider identifier
 * @property {string} model Model identifier
 * @property {string} modelVersion Model version string
 * @property {string} analyzedAt ISO timestamp of analysis
 * @property {string | null} [error] Error description if analysis failed or unsupported
 */

/**
 * Base Abstract Interface for Content Safety Providers.
 * Pluggable adapter pattern isolating classifier implementations from business logic.
 */
export class ContentSafetyProviderInterface {
  constructor(config = {}) {
    this.providerName = config.providerName || 'unnamed_provider'
    this.modelName = config.modelName || 'generic_vision'
    this.modelVersion = config.modelVersion || '1.0.0'
  }

  /**
   * Analyzes an image for graphic content (blood, violence, gore, severe injury).
   *
   * @param {Uint8Array | ArrayBuffer | Buffer} imageInput Decoded raw pixel bytes or image buffer
   * @param {Object} [options]
   * @returns {Promise<NormalizedSafetyResult>}
   */
  async analyzeImage(imageInput, options = {}) { // eslint-disable-line no-unused-vars
    throw new Error('analyzeImage() must be implemented by the safety provider subclass')
  }

  /**
   * Analyzes a video for graphic content across extracted sample frames.
   * If real frame extraction is unavailable, returns structured UNSUPPORTED status.
   *
   * @param {Uint8Array | ArrayBuffer | Buffer} videoInput Video buffer or stream reference
   * @param {Object} [options]
   * @returns {Promise<NormalizedSafetyResult>}
   */
  async analyzeVideo(videoInput, options = {}) { // eslint-disable-line no-unused-vars
    // Default base implementation: explicit unsupported signal without crashing
    return {
      status: 'UNSUPPORTED',
      categories: {
        blood: { score: 0.0, detected: false },
        graphicViolence: { score: 0.0, detected: false },
        gore: { score: 0.0, detected: false },
        severeInjury: { score: 0.0, detected: false },
      },
      overallRisk: 0.0,
      provider: this.providerName,
      model: this.modelName,
      modelVersion: this.modelVersion,
      analyzedAt: new Date().toISOString(),
      error: 'Video frame extraction and temporal safety pipeline not configured',
    }
  }
}
