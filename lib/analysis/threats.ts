import { queryAllModels } from "@/lib/ai-models"
import type { ThreatData, CompetitorThreat } from "./types"

function getThreatPrompts(brand: string, competitor: string): string[] {
  return [
    `How could ${competitor} take market share from ${brand}? Be specific about strategies and tactics.`,
    `Is ${competitor} gaining or losing momentum compared to ${brand}? Explain your reasoning.`,
    `In a head-to-head comparison, where does ${competitor} beat ${brand}? List specific areas.`,
  ]
}

function extractAttackVectors(response: string): string[] {
  const vectors: string[] = []

  // Look for numbered lists or bullet points
  const listPatterns = [/(?:^|\n)\s*(?:\d+[.)]\s*|[-•]\s*)([^.\n]+)/g, /(?:by|through|via|using)\s+([^,.]+)/gi]

  for (const pattern of listPatterns) {
    let match
    while ((match = pattern.exec(response)) !== null) {
      const vector = match[1].trim()
      if (vector.length > 10 && vector.length < 100) {
        vectors.push(vector)
      }
    }
  }

  // Deduplicate and limit
  const unique = [...new Set(vectors)]
  return unique.slice(0, 5)
}

function analyzeMomentum(response: string): "gaining" | "stable" | "losing" {
  const lower = response.toLowerCase()

  const gainingIndicators = ["gaining", "growing", "increasing", "rising", "improving", "accelerating", "surging"]
  const losingIndicators = ["losing", "declining", "decreasing", "falling", "weakening", "struggling", "slowing"]

  let gainingScore = 0
  let losingScore = 0

  for (const word of gainingIndicators) {
    if (lower.includes(word)) gainingScore++
  }

  for (const word of losingIndicators) {
    if (lower.includes(word)) losingScore++
  }

  if (gainingScore > losingScore) return "gaining"
  if (losingScore > gainingScore) return "losing"
  return "stable"
}

function extractContestedAreas(response: string): string[] {
  const areas: string[] = []

  // Common business areas to look for
  const areaKeywords = [
    "price",
    "pricing",
    "cost",
    "value",
    "quality",
    "performance",
    "reliability",
    "innovation",
    "technology",
    "features",
    "service",
    "support",
    "customer",
    "design",
    "style",
    "aesthetics",
    "availability",
    "distribution",
    "reach",
    "marketing",
    "brand",
    "reputation",
    "sustainability",
    "environmental",
  ]

  const lower = response.toLowerCase()
  for (const area of areaKeywords) {
    if (lower.includes(area)) {
      areas.push(area)
    }
  }

  return [...new Set(areas)].slice(0, 6)
}

function calculateThreatScore(
  attackProbability: number,
  momentum: "gaining" | "stable" | "losing",
  gapClosingRate: number,
  contestedAreas: string[],
): number {
  // Weights: Attack probability (30%), Momentum score (30%), Gap closing rate (25%), Contested areas (15%)
  const momentumScore = momentum === "gaining" ? 0.8 : momentum === "stable" ? 0.5 : 0.2
  const contestedScore = Math.min(contestedAreas.length / 6, 1)

  const score = attackProbability * 0.3 + momentumScore * 0.3 + gapClosingRate * 0.25 + contestedScore * 0.15

  return Math.round(score * 100) / 10 // Scale to 0-10
}

function determineTimeline(
  threatScore: number,
  momentum: "gaining" | "stable" | "losing",
): "short" | "medium" | "long" {
  if (threatScore >= 7 && momentum === "gaining") return "short"
  if (threatScore >= 5 || momentum === "gaining") return "medium"
  return "long"
}

async function analyzeCompetitor(brand: string, competitor: string): Promise<CompetitorThreat> {
  const prompts = getThreatPrompts(brand, competitor)

  const results = await Promise.all(
    prompts.map((prompt) => queryAllModels(prompt, { temperature: 0.3, maxTokens: 600 })),
  )

  // Aggregate responses
  const allResponses: string[] = []
  for (const result of results) {
    for (const response of result.responses) {
      if (!response.error && response.response) {
        allResponses.push(response.response)
      }
    }
  }

  const combinedText = allResponses.join(" ")

  // Extract analysis components
  const attackVectors = extractAttackVectors(combinedText)
  const contestedAreas = extractContestedAreas(combinedText)

  // Analyze momentum across all responses
  const momentumVotes = allResponses.map(analyzeMomentum)
  const momentumCounts = { gaining: 0, stable: 0, losing: 0 }
  for (const vote of momentumVotes) {
    momentumCounts[vote]++
  }
  const momentum = Object.entries(momentumCounts).sort((a, b) => b[1] - a[1])[0][0] as "gaining" | "stable" | "losing"

  // Calculate scores based on content analysis
  const attackProbability = Math.min(attackVectors.length / 5, 1)
  const gapClosingRate = momentum === "gaining" ? 0.7 : momentum === "stable" ? 0.4 : 0.2

  const threatScore = calculateThreatScore(attackProbability, momentum, gapClosingRate, contestedAreas)
  const timeline = determineTimeline(threatScore, momentum)

  return {
    threatScore,
    attackVectors,
    timeline,
    momentum,
    attackProbability,
    gapClosingRate,
    contestedAreas,
  }
}

export async function assessThreats(brand: string, competitors: string[]): Promise<ThreatData> {
  // Analyze all competitors in parallel
  const results = await Promise.all(competitors.map((competitor) => analyzeCompetitor(brand, competitor)))

  const threats: ThreatData = {}
  for (let i = 0; i < competitors.length; i++) {
    threats[competitors[i]] = results[i]
  }

  return threats
}
