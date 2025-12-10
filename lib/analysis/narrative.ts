import { queryAllModels } from "@/lib/ai-models"
import type { NarrativeData, SentimentData } from "./types"

// Narrative analysis prompts
function getNarrativePrompts(brand: string): string[] {
  return [
    `Describe ${brand} in one paragraph. What defines this brand?`,
    `What are ${brand}'s main strengths and weaknesses?`,
    `What words or phrases come to mind when you think of ${brand}?`,
    `What concerns might someone have about choosing ${brand}?`,
  ]
}

// Common stop words to filter out
const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "as",
  "is",
  "was",
  "are",
  "were",
  "been",
  "be",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "can",
  "this",
  "that",
  "these",
  "those",
  "it",
  "its",
  "they",
  "their",
  "them",
  "we",
  "our",
  "you",
  "your",
  "he",
  "she",
  "him",
  "her",
  "his",
  "i",
  "my",
  "me",
  "what",
  "which",
  "who",
  "whom",
  "when",
  "where",
  "why",
  "how",
  "all",
  "each",
  "every",
  "both",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "not",
  "only",
  "own",
  "same",
  "so",
  "than",
  "too",
  "very",
  "just",
  "also",
  "now",
  "here",
  "there",
  "then",
  "brand",
  "company",
  "product",
  "products",
  "service",
  "services",
  "business",
])

// Positive and negative sentiment words
const POSITIVE_WORDS = new Set([
  "excellent",
  "great",
  "good",
  "best",
  "amazing",
  "outstanding",
  "superior",
  "innovative",
  "reliable",
  "trusted",
  "quality",
  "premium",
  "leading",
  "top",
  "strong",
  "successful",
  "impressive",
  "exceptional",
  "remarkable",
  "fantastic",
  "wonderful",
  "perfect",
  "ideal",
  "preferred",
  "recommended",
  "popular",
  "loved",
  "respected",
  "admired",
  "renowned",
  "acclaimed",
  "celebrated",
  "distinguished",
])

const NEGATIVE_WORDS = new Set([
  "poor",
  "bad",
  "worst",
  "terrible",
  "awful",
  "disappointing",
  "inferior",
  "unreliable",
  "expensive",
  "overpriced",
  "slow",
  "outdated",
  "lacking",
  "weak",
  "failing",
  "struggling",
  "problematic",
  "concerning",
  "questionable",
  "controversial",
  "criticized",
  "troubled",
  "declining",
  "risky",
  "uncertain",
  "limited",
  "basic",
  "average",
  "mediocre",
  "ordinary",
  "common",
])

function extractWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
}

function calculateWordFrequency(texts: string[]): { [word: string]: number } {
  const frequency: { [word: string]: number } = {}

  for (const text of texts) {
    const words = extractWords(text)
    for (const word of words) {
      frequency[word] = (frequency[word] || 0) + 1
    }
  }

  return frequency
}

function extractThemes(wordFrequency: { [word: string]: number }, topN = 10): string[] {
  return Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word]) => word)
}

function extractKeyPhrases(texts: string[], brand: string): string[] {
  const phrases: { [phrase: string]: number } = {}
  const brandLower = brand.toLowerCase()

  for (const text of texts) {
    // Extract 2-3 word phrases
    const words = text.toLowerCase().split(/\s+/)
    for (let i = 0; i < words.length - 1; i++) {
      const twoWord = `${words[i]} ${words[i + 1]}`.replace(/[^a-z\s]/g, "")
      if (twoWord.length > 5 && !twoWord.includes(brandLower)) {
        phrases[twoWord] = (phrases[twoWord] || 0) + 1
      }

      if (i < words.length - 2) {
        const threeWord = `${words[i]} ${words[i + 1]} ${words[i + 2]}`.replace(/[^a-z\s]/g, "")
        if (threeWord.length > 8 && !threeWord.includes(brandLower)) {
          phrases[threeWord] = (phrases[threeWord] || 0) + 1
        }
      }
    }
  }

  return Object.entries(phrases)
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([phrase]) => phrase)
}

function calculateSentiment(texts: string[]): SentimentData {
  let positiveCount = 0
  let negativeCount = 0
  let totalWords = 0

  for (const text of texts) {
    const words = extractWords(text)
    totalWords += words.length

    for (const word of words) {
      if (POSITIVE_WORDS.has(word)) positiveCount++
      if (NEGATIVE_WORDS.has(word)) negativeCount++
    }
  }

  const sentimentWords = positiveCount + negativeCount
  const neutralCount = totalWords - sentimentWords

  const total = totalWords || 1
  return {
    positive: Math.round((positiveCount / total) * 1000) / 1000,
    negative: Math.round((negativeCount / total) * 1000) / 1000,
    neutral: Math.round((neutralCount / total) * 1000) / 1000,
  }
}

function calculateStability(responses: string[]): number {
  if (responses.length < 2) return 1

  // Calculate stability by comparing word overlap between responses
  const wordSets = responses.map((r) => new Set(extractWords(r)))

  let totalSimilarity = 0
  let comparisons = 0

  for (let i = 0; i < wordSets.length; i++) {
    for (let j = i + 1; j < wordSets.length; j++) {
      const intersection = [...wordSets[i]].filter((w) => wordSets[j].has(w)).length
      const union = new Set([...wordSets[i], ...wordSets[j]]).size
      const similarity = union > 0 ? intersection / union : 0
      totalSimilarity += similarity
      comparisons++
    }
  }

  return comparisons > 0 ? Math.round((totalSimilarity / comparisons) * 100) / 100 : 1
}

export async function analyzeNarrative(brand: string): Promise<NarrativeData> {
  const prompts = getNarrativePrompts(brand)

  // Query all models with all prompts
  const results = await Promise.all(
    prompts.map((prompt) => queryAllModels(prompt, { temperature: 0.4, maxTokens: 500 })),
  )

  // Collect all successful responses
  const allResponses: string[] = []
  for (const result of results) {
    for (const response of result.responses) {
      if (!response.error && response.response) {
        allResponses.push(response.response)
      }
    }
  }

  // Analyze the collected responses
  const wordFrequency = calculateWordFrequency(allResponses)
  const themes = extractThemes(wordFrequency)
  const keyPhrases = extractKeyPhrases(allResponses, brand)
  const sentiment = calculateSentiment(allResponses)
  const stability = calculateStability(allResponses)

  return {
    themes,
    sentiment,
    stability,
    keyPhrases,
    wordFrequency,
  }
}
