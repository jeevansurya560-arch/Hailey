import { ContentSafetyProviderInterface } from './providerInterface.js'

/**
 * Fallback provider used when no production vision classifier is configured.
 * Strictly fails closed: outputs ANALYSIS_FAILED with clear error reason.
 */
export class UnconfiguredSafetyProvider extends ContentSafetyProviderInterface {
  constructor() {
    super({
      providerName: 'unconfigured_classifier',
      modelName: 'none',
      modelVersion: 'none',
    })
  }

  async analyzeImage(imageInput, options = {}) { // eslint-disable-line no-unused-vars
    return {
      status: 'ANALYSIS_FAILED',
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
      error: 'No production vision safety classifier is configured in this environment',
    }
  }

  async analyzeVideo(videoInput, options = {}) { // eslint-disable-line no-unused-vars
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
      error: 'No production video safety classifier is configured in this environment',
    }
  }
}
