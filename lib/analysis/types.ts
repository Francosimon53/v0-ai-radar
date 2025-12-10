// Configuration for tracking a brand
export interface TrackingConfig {
  brand: string
  competitors: string[]
  industry: string
  userId: string
  analysisId?: string
}

// Share of Voice data
export interface BrandShareOfVoice {
  mentionRate: number // Percentage of times mentioned (0-100)
  firstMentionRate: number // Percentage of times mentioned first (0-100)
  avgPosition: number // Average position when mentioned (1 = first)
  totalMentions: number
}

export interface ShareOfVoiceData {
  [brandName: string]: BrandShareOfVoice
}

// Dimensional analysis data
export interface DimensionScore {
  score: number // 0-100
  consensus: number // 0-1, how much models agree
  responses: number[] // Individual model scores
}

export interface DimensionalData {
  dimensions: {
    innovation: DimensionScore
    value: DimensionScore
    trust: DimensionScore
    customerExperience: DimensionScore
    sustainability: DimensionScore
    marketLeadership: DimensionScore
    futurePotential: DimensionScore
    emotionalConnection: DimensionScore
  }
  brandStrengthIndex: number // Weighted average 0-100
}

// Narrative analysis data
export interface SentimentData {
  positive: number // 0-1
  negative: number // 0-1
  neutral: number // 0-1
}

export interface NarrativeData {
  themes: string[]
  sentiment: SentimentData
  stability: number // 0-1, how consistent are responses
  keyPhrases: string[]
  wordFrequency: { [word: string]: number }
}

// Threat assessment data
export interface CompetitorThreat {
  threatScore: number // 0-10
  attackVectors: string[]
  timeline: "short" | "medium" | "long"
  momentum: "gaining" | "stable" | "losing"
  attackProbability: number // 0-1
  gapClosingRate: number // 0-1
  contestedAreas: string[]
}

export interface ThreatData {
  [competitor: string]: CompetitorThreat
}

// Synthesis data
export interface Risk {
  title: string
  impact: "high" | "medium" | "low"
  timeline: string
  costOfInaction: string
}

export interface Opportunity {
  title: string
  window: string
  upside: string
  investment: "high" | "medium" | "low"
}

export interface Decision {
  question: string
  optionA: string
  optionB: string
  recommendation: string
  deadline: string
}

export interface ActionPlan {
  week1_2: string[]
  week3_6: string[]
  week7_12: string[]
}

export interface SynthesisData {
  bottomLine: string
  risks: Risk[]
  opportunities: Opportunity[]
  decisions: Decision[]
  actionPlan: ActionPlan
}

// Historical data for trend analysis
export interface HistoricalDataPoint {
  date: string
  brandStrengthIndex: number
  shareOfVoice: number
  threatLevel: number
}

export interface HistoricalData {
  brand: string
  dataPoints: HistoricalDataPoint[]
}

// Complete analysis result
export interface AnalysisResult {
  id: string
  config: TrackingConfig
  timestamp: string
  shareOfVoice: ShareOfVoiceData
  dimensional: DimensionalData
  narrative: NarrativeData
  threats: ThreatData
  synthesis: SynthesisData
  metadata: {
    totalProcessingTime: number
    totalQueries: number
    successfulQueries: number
    failedQueries: number
  }
}

// Internal tracking for analysis progress
export interface AnalysisProgress {
  stage: "share-of-voice" | "dimensional" | "narrative" | "threats" | "synthesis" | "complete"
  progress: number // 0-100
  currentTask: string
}
