import { ContentSafetyProviderInterface } from './providerInterface.js'

/**
 * Deterministic Mock Safety Provider for unit and integration testing.
 * Provides configurable score presets without calling external AI/ML services.
 */
export class MockSafetyProvider extends ContentSafetyProviderInterface {
  constructor(config = {}) {
    super({
      providerName: config.providerName || 'mock_graphic_safety',
      modelName: config.modelName || 'mock_vision_classifier',
      modelVersion: config.modelVersion || 'v1.0.0-test',
    })

    this.presetScores = {
      blood: config.blood ?? 0.0,
      graphicViolence: config.graphicViolence ?? 0.0,
      gore: config.gore ?? 0.0,
      severeInjury: config.severeInjury ?? 0.0,
    }

    this.shouldFail = config.shouldFail || false
    this.failureMessage = config.failureMessage || 'Mock classifier service error'
  }

  setCategoryScore(category, score) {
    if (this.presetScores[category] !== undefined) {
      this.presetScores[category] = Math.max(0.0, Math.min(1.0, Number(score)))
    }
  }

  setSimulatedFailure(shouldFail, message = 'Simulated provider failure') {
    this.shouldFail = Boolean(shouldFail)
    this.failureMessage = message
  }

  simulateSafe() {
    this.shouldFail = false
    this.presetScores = { blood: 0.02, graphicViolence: 0.01, gore: 0.0, severeInjury: 0.0 }
  }

  simulateViolence(score = 0.85) {
    this.shouldFail = false
    this.presetScores = { blood: 0.1, graphicViolence: score, gore: 0.05, severeInjury: 0.05 }
  }

  simulateBlood(score = 0.88) {
    this.shouldFail = false
    this.presetScores = { blood: score, graphicViolence: 0.1, gore: 0.05, severeInjury: 0.05 }
  }

  simulateGore(score = 0.90) {
    this.shouldFail = false
    this.presetScores = { blood: 0.4, graphicViolence: 0.3, gore: score, severeInjury: 0.3 }
  }

  simulateSevereInjury(score = 0.82) {
    this.shouldFail = false
    this.presetScores = { blood: 0.2, graphicViolence: 0.2, gore: 0.1, severeInjury: score }
  }

  async analyzeImage(imageInput, options = {}) {
    if (this.shouldFail) {
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
        error: this.failureMessage,
      }
    }

    if (!imageInput) {
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
        error: 'Missing image input bytes',
      }
    }

    const bloodScore = options.blood ?? this.presetScores.blood
    const violenceScore = options.graphicViolence ?? this.presetScores.graphicViolence
    const goreScore = options.gore ?? this.presetScores.gore
    const injuryScore = options.severeInjury ?? this.presetScores.severeInjury

    const overallRisk = Math.max(bloodScore, violenceScore, goreScore, injuryScore)

    return {
      status: 'ANALYZED',
      categories: {
        blood: { score: bloodScore, detected: bloodScore >= 0.5 },
        graphicViolence: { score: violenceScore, detected: violenceScore >= 0.5 },
        gore: { score: goreScore, detected: goreScore >= 0.5 },
        severeInjury: { score: injuryScore, detected: injuryScore >= 0.5 },
      },
      overallRisk,
      provider: this.providerName,
      model: this.modelName,
      modelVersion: this.modelVersion,
      analyzedAt: new Date().toISOString(),
      error: null,
    }
  }

  async analyzeVideo(videoInput, options = {}) {
    if (this.shouldFail) {
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
        error: this.failureMessage,
      }
    }

    return super.analyzeVideo(videoInput, options)
  }
}
