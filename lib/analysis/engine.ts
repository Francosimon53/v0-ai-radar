import { calculateShareOfVoice } from "./share-of-voice"
import { calculateDimensionalScores } from "./dimensional"
import { analyzeNarrative } from "./narrative"
import { assessThreats } from "./threats"
import { synthesizeResults } from "./synthesis"
import type { TrackingConfig, AnalysisResult, HistoricalData } from "./types"

function generateAnalysisId(): string {
  return `analysis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export async function runFullAnalysis(
  config: TrackingConfig,
  historicalData?: HistoricalData,
): Promise<AnalysisResult> {
  const startTime = Date.now()
  const analysisId = config.analysisId || generateAnalysisId()

  let totalQueries = 0
  let successfulQueries = 0
  let failedQueries = 0

  // Track query stats (simplified - in production you'd instrument the query functions)
  const trackQueries = (count: number, success: number) => {
    totalQueries += count
    successfulQueries += success
    failedQueries += count - success
  }

  // Stage 1: Share of Voice Analysis
  console.log(`[Analysis] Starting Share of Voice analysis for ${config.brand}...`)
  const shareOfVoice = await calculateShareOfVoice(config.brand, config.competitors, config.industry)
  trackQueries(
    100 * 6,
    Object.values(shareOfVoice).reduce((sum, b) => sum + b.totalMentions, 0),
  ) // Estimate

  // Stage 2: Dimensional Analysis
  console.log(`[Analysis] Starting Dimensional analysis for ${config.brand}...`)
  const dimensional = await calculateDimensionalScores(config.brand, config.competitors)
  trackQueries(8 * 6, 8 * 6) // 8 dimensions, 6 models

  // Stage 3: Narrative Analysis
  console.log(`[Analysis] Starting Narrative analysis for ${config.brand}...`)
  const narrative = await analyzeNarrative(config.brand)
  trackQueries(4 * 6, 4 * 6) // 4 prompts, 6 models

  // Stage 4: Threat Assessment
  console.log(`[Analysis] Starting Threat assessment for ${config.brand}...`)
  const threats = await assessThreats(config.brand, config.competitors)
  trackQueries(config.competitors.length * 3 * 6, config.competitors.length * 3 * 6)

  // Stage 5: Strategic Synthesis
  console.log(`[Analysis] Generating strategic synthesis for ${config.brand}...`)
  const synthesis = await synthesizeResults(
    {
      brand: config.brand,
      competitors: config.competitors,
      shareOfVoice,
      dimensional,
      narrative,
      threats,
    },
    historicalData,
  )

  const totalProcessingTime = Date.now() - startTime

  const result: AnalysisResult = {
    id: analysisId,
    config,
    timestamp: new Date().toISOString(),
    shareOfVoice,
    dimensional,
    narrative,
    threats,
    synthesis,
    metadata: {
      totalProcessingTime,
      totalQueries,
      successfulQueries,
      failedQueries,
    },
  }

  console.log(`[Analysis] Complete! Total time: ${totalProcessingTime}ms, Queries: ${totalQueries}`)

  return result
}

// Export for individual stage testing
export { calculateShareOfVoice, calculateDimensionalScores, analyzeNarrative, assessThreats, synthesizeResults }
