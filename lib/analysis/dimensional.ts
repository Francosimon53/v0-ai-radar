import { queryAllModels } from "@/lib/ai-models"
import type { DimensionalData, DimensionScore } from "./types"

// Dimension definitions with weights
const DIMENSIONS = {
  innovation: { weight: 0.15, prompt: "innovation and technological advancement" },
  value: { weight: 0.12, prompt: "value for money and pricing" },
  trust: { weight: 0.15, prompt: "trustworthiness and reliability" },
  customerExperience: { weight: 0.12, prompt: "customer experience and service" },
  sustainability: { weight: 0.13, prompt: "sustainability and environmental responsibility" },
  marketLeadership: { weight: 0.13, prompt: "market leadership and industry influence" },
  futurePotential: { weight: 0.1, prompt: "future growth potential and trajectory" },
  emotionalConnection: { weight: 0.1, prompt: "emotional connection and brand loyalty" },
} as const

type DimensionKey = keyof typeof DIMENSIONS

function generateDimensionPrompt(brand: string, dimension: string): string {
  return `On a scale of 0 to 100, how would you rate ${brand}'s ${dimension}? 
Please respond with ONLY a number between 0 and 100, followed by a brief one-sentence explanation.
Format: [SCORE]: [explanation]`
}

function extractScore(response: string): number | null {
  // Try to extract a number from the response
  const patterns = [
    /^(\d{1,3}):/, // "85: explanation"
    /^(\d{1,3})\s/, // "85 explanation"
    /score[:\s]+(\d{1,3})/i, // "Score: 85"
    /rating[:\s]+(\d{1,3})/i, // "Rating: 85"
    /(\d{1,3})\/100/, // "85/100"
    /^(\d{1,3})$/, // Just the number
  ]

  for (const pattern of patterns) {
    const match = response.match(pattern)
    if (match) {
      const score = Number.parseInt(match[1], 10)
      if (score >= 0 && score <= 100) {
        return score
      }
    }
  }

  // Fallback: find first number in response
  const numberMatch = response.match(/\d{1,3}/)
  if (numberMatch) {
    const score = Number.parseInt(numberMatch[0], 10)
    if (score >= 0 && score <= 100) {
      return score
    }
  }

  return null
}

function calculateConsensus(scores: number[]): number {
  if (scores.length < 2) return 1

  const mean = scores.reduce((a, b) => a + b, 0) / scores.length
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
  const stdDev = Math.sqrt(variance)

  // Normalize: lower variance = higher consensus
  // Max reasonable stdDev is around 30 (scores spread across 0-100)
  const consensus = Math.max(0, 1 - stdDev / 30)
  return Math.round(consensus * 100) / 100
}

function calculateWeightedScore(scores: number[], consensus: number): number {
  if (scores.length === 0) return 0

  // Weight by consensus - higher consensus means we trust the average more
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length

  // If consensus is low, pull toward neutral (50)
  const adjustedScore = mean * consensus + 50 * (1 - consensus)

  return Math.round(adjustedScore * 10) / 10
}

async function analyzeDimension(brand: string, dimensionKey: DimensionKey): Promise<DimensionScore> {
  const dimension = DIMENSIONS[dimensionKey]
  const prompt = generateDimensionPrompt(brand, dimension.prompt)

  const results = await queryAllModels(prompt, { temperature: 0.2, maxTokens: 150 })

  const scores: number[] = []

  for (const response of results.responses) {
    if (response.error || !response.response) continue

    const score = extractScore(response.response)
    if (score !== null) {
      scores.push(score)
    }
  }

  const consensus = calculateConsensus(scores)
  const score = calculateWeightedScore(scores, consensus)

  return {
    score,
    consensus,
    responses: scores,
  }
}

export async function calculateDimensionalScores(brand: string, competitors: string[]): Promise<DimensionalData> {
  const dimensionKeys = Object.keys(DIMENSIONS) as DimensionKey[]

  // Query all dimensions in parallel
  const dimensionResults = await Promise.all(dimensionKeys.map((key) => analyzeDimension(brand, key)))

  // Build dimensions object
  const dimensions = {} as DimensionalData["dimensions"]
  for (let i = 0; i < dimensionKeys.length; i++) {
    dimensions[dimensionKeys[i]] = dimensionResults[i]
  }

  // Calculate Brand Strength Index (weighted average)
  let brandStrengthIndex = 0
  for (const key of dimensionKeys) {
    brandStrengthIndex += dimensions[key].score * DIMENSIONS[key].weight
  }
  brandStrengthIndex = Math.round(brandStrengthIndex * 10) / 10

  return {
    dimensions,
    brandStrengthIndex,
  }
}
