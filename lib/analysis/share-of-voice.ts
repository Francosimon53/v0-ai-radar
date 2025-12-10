import { queryAllModels } from "@/lib/ai-models"
import type { ShareOfVoiceData } from "./types"

// Prompt templates for purchase intent queries
const PROMPT_TEMPLATES = {
  bestBrand: (industry: string) => `What's the best ${industry} brand?`,
  recommendation: (industry: string) => `I need a ${industry} product, what do you recommend?`,
  comparison: (brand: string, competitor: string) => `Compare ${brand} vs ${competitor}`,
  situational: (situation: string, industry: string) => `${situation}, which ${industry} brand should I choose?`,
  topPicks: (industry: string) => `What are the top ${industry} brands right now?`,
  buying: (industry: string) => `I'm buying a ${industry} product for the first time. What brand should I get?`,
  quality: (industry: string) => `Which ${industry} brand has the best quality?`,
  valueForMoney: (industry: string) => `Which ${industry} brand offers the best value for money?`,
  premium: (industry: string) => `What's the most premium ${industry} brand?`,
  reliable: (industry: string) => `Which ${industry} brand is the most reliable?`,
}

// Situational contexts for varied prompts
const SITUATIONS = [
  "As a first-time buyer",
  "For professional use",
  "On a budget",
  "Looking for premium quality",
  "For everyday use",
  "For a gift",
  "As a business purchase",
  "For long-term investment",
  "As a student",
  "For my family",
]

function generatePrompts(brand: string, competitors: string[], industry: string): string[] {
  const prompts: string[] = []
  const allBrands = [brand, ...competitors]

  // Basic industry prompts (10 prompts)
  prompts.push(PROMPT_TEMPLATES.bestBrand(industry))
  prompts.push(PROMPT_TEMPLATES.recommendation(industry))
  prompts.push(PROMPT_TEMPLATES.topPicks(industry))
  prompts.push(PROMPT_TEMPLATES.buying(industry))
  prompts.push(PROMPT_TEMPLATES.quality(industry))
  prompts.push(PROMPT_TEMPLATES.valueForMoney(industry))
  prompts.push(PROMPT_TEMPLATES.premium(industry))
  prompts.push(PROMPT_TEMPLATES.reliable(industry))

  // Situational prompts (10 prompts)
  for (const situation of SITUATIONS) {
    prompts.push(PROMPT_TEMPLATES.situational(situation, industry))
  }

  // Brand vs competitor comparisons (generate up to 40 prompts)
  for (const competitor of competitors) {
    prompts.push(PROMPT_TEMPLATES.comparison(brand, competitor))
    prompts.push(PROMPT_TEMPLATES.comparison(competitor, brand))
  }

  // Direct brand questions (up to 40 more prompts to reach ~100)
  const directQuestions = [
    `Would you recommend ${brand}?`,
    `Is ${brand} a good choice for ${industry}?`,
    `What do you think about ${brand}?`,
    `How does ${brand} compare to other ${industry} brands?`,
    `Is ${brand} worth the price?`,
  ]

  for (const brandName of allBrands) {
    for (const question of directQuestions) {
      prompts.push(question.replace(brand, brandName))
      if (prompts.length >= 100) break
    }
    if (prompts.length >= 100) break
  }

  return prompts.slice(0, 100) // Ensure exactly 100 prompts
}

function extractBrandMentions(
  response: string,
  allBrands: string[],
): { mentioned: string[]; positions: { [brand: string]: number } } {
  const lowerResponse = response.toLowerCase()
  const mentioned: string[] = []
  const positions: { [brand: string]: number } = {}

  for (const brand of allBrands) {
    const lowerBrand = brand.toLowerCase()
    const index = lowerResponse.indexOf(lowerBrand)
    if (index !== -1) {
      mentioned.push(brand)
      positions[brand] = index
    }
  }

  // Sort by position to determine order of mention
  mentioned.sort((a, b) => positions[a] - positions[b])

  return { mentioned, positions }
}

export async function calculateShareOfVoice(
  brand: string,
  competitors: string[],
  industry: string,
): Promise<ShareOfVoiceData> {
  const allBrands = [brand, ...competitors]
  const prompts = generatePrompts(brand, competitors, industry)

  // Initialize tracking data for each brand
  const brandStats: {
    [brand: string]: {
      mentions: number
      firstMentions: number
      positionSum: number
      mentionedIn: number
    }
  } = {}

  for (const b of allBrands) {
    brandStats[b] = { mentions: 0, firstMentions: 0, positionSum: 0, mentionedIn: 0 }
  }

  let totalResponses = 0

  // Query all models with all prompts (batch for efficiency)
  // Process in batches of 10 to avoid overwhelming the API
  const BATCH_SIZE = 10

  for (let i = 0; i < prompts.length; i += BATCH_SIZE) {
    const batch = prompts.slice(i, i + BATCH_SIZE)

    const batchResults = await Promise.all(
      batch.map((prompt) => queryAllModels(prompt, { temperature: 0.3, maxTokens: 500 })),
    )

    for (const result of batchResults) {
      for (const modelResponse of result.responses) {
        if (modelResponse.error || !modelResponse.response) continue

        totalResponses++
        const { mentioned, positions } = extractBrandMentions(modelResponse.response, allBrands)

        for (let pos = 0; pos < mentioned.length; pos++) {
          const brandName = mentioned[pos]
          brandStats[brandName].mentions++
          brandStats[brandName].positionSum += pos + 1 // 1-indexed position
          brandStats[brandName].mentionedIn++

          if (pos === 0) {
            brandStats[brandName].firstMentions++
          }
        }
      }
    }
  }

  // Calculate final metrics
  const result: ShareOfVoiceData = {}

  for (const b of allBrands) {
    const stats = brandStats[b]
    result[b] = {
      mentionRate: totalResponses > 0 ? (stats.mentionedIn / totalResponses) * 100 : 0,
      firstMentionRate: totalResponses > 0 ? (stats.firstMentions / totalResponses) * 100 : 0,
      avgPosition: stats.mentions > 0 ? stats.positionSum / stats.mentions : 0,
      totalMentions: stats.mentions,
    }
  }

  return result
}
