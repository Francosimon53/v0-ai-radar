import { generateText } from "ai"
import type {
  SynthesisData,
  ShareOfVoiceData,
  DimensionalData,
  NarrativeData,
  ThreatData,
  HistoricalData,
} from "./types"

interface AnalysisInput {
  brand: string
  competitors: string[]
  shareOfVoice: ShareOfVoiceData
  dimensional: DimensionalData
  narrative: NarrativeData
  threats: ThreatData
}

function buildSynthesisPrompt(data: AnalysisInput, historicalData?: HistoricalData): string {
  const { brand, competitors, shareOfVoice, dimensional, narrative, threats } = data

  // Format data for the prompt
  const sovSummary = Object.entries(shareOfVoice)
    .map(([b, d]) => `${b}: ${d.mentionRate.toFixed(1)}% mention rate, ${d.firstMentionRate.toFixed(1)}% first mention`)
    .join("\n")

  const dimSummary = Object.entries(dimensional.dimensions)
    .map(([dim, d]) => `${dim}: ${d.score}/100 (consensus: ${d.consensus.toFixed(2)})`)
    .join("\n")

  const threatSummary = Object.entries(threats)
    .map(([comp, t]) => `${comp}: threat score ${t.threatScore}/10, momentum: ${t.momentum}, timeline: ${t.timeline}`)
    .join("\n")

  const historicalContext = historicalData
    ? `\nHistorical trend: Brand strength has moved from ${historicalData.dataPoints[0]?.brandStrengthIndex || "N/A"} to ${historicalData.dataPoints[historicalData.dataPoints.length - 1]?.brandStrengthIndex || "N/A"} over the tracking period.`
    : ""

  return `You are a strategic brand consultant analyzing AI perception data for ${brand}.

SHARE OF VOICE DATA:
${sovSummary}

DIMENSIONAL SCORES (Brand Strength Index: ${dimensional.brandStrengthIndex}/100):
${dimSummary}

NARRATIVE ANALYSIS:
- Key themes: ${narrative.themes.join(", ")}
- Sentiment: ${(narrative.sentiment.positive * 100).toFixed(1)}% positive, ${(narrative.sentiment.negative * 100).toFixed(1)}% negative
- Stability: ${(narrative.stability * 100).toFixed(1)}%
- Key phrases: ${narrative.keyPhrases.slice(0, 5).join(", ")}

COMPETITIVE THREATS:
${threatSummary}
${historicalContext}

Based on this data, provide a strategic synthesis in the following JSON format:
{
  "bottomLine": "2 sentences max summarizing the brand's AI perception position",
  "risks": [
    {
      "title": "Risk title",
      "impact": "high|medium|low",
      "timeline": "When this could materialize",
      "costOfInaction": "What happens if ignored"
    }
  ],
  "opportunities": [
    {
      "title": "Opportunity title",
      "window": "How long is the opportunity window",
      "upside": "Potential benefit",
      "investment": "high|medium|low"
    }
  ],
  "decisions": [
    {
      "question": "Strategic question to answer",
      "optionA": "First option",
      "optionB": "Second option",
      "recommendation": "Recommended choice and why",
      "deadline": "When to decide by"
    }
  ],
  "actionPlan": {
    "week1_2": ["Immediate action items"],
    "week3_6": ["Short-term action items"],
    "week7_12": ["Medium-term action items"]
  }
}

Provide 2-3 items for risks, opportunities, and decisions. Be specific and actionable.
Return ONLY valid JSON, no other text.`
}

function parseJSONResponse(response: string): SynthesisData | null {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    const parsed = JSON.parse(jsonMatch[0])

    // Validate required fields
    if (!parsed.bottomLine || !parsed.risks || !parsed.opportunities || !parsed.decisions || !parsed.actionPlan) {
      return null
    }

    return parsed as SynthesisData
  } catch {
    return null
  }
}

function getDefaultSynthesis(brand: string): SynthesisData {
  return {
    bottomLine: `${brand}'s AI perception analysis is complete. Review the detailed metrics above for specific insights.`,
    risks: [
      {
        title: "Competitive pressure",
        impact: "medium",
        timeline: "Ongoing",
        costOfInaction: "Gradual market share erosion",
      },
    ],
    opportunities: [
      {
        title: "Strengthen AI narrative",
        window: "3-6 months",
        upside: "Improved brand perception in AI recommendations",
        investment: "medium",
      },
    ],
    decisions: [
      {
        question: "How to prioritize AI perception improvement?",
        optionA: "Focus on share of voice",
        optionB: "Focus on dimensional improvements",
        recommendation: "Prioritize based on lowest scores",
        deadline: "Within 2 weeks",
      },
    ],
    actionPlan: {
      week1_2: ["Review detailed analysis", "Identify quick wins"],
      week3_6: ["Implement targeted improvements"],
      week7_12: ["Monitor progress and adjust strategy"],
    },
  }
}

export async function synthesizeResults(data: AnalysisInput, historicalData?: HistoricalData): Promise<SynthesisData> {
  const prompt = buildSynthesisPrompt(data, historicalData)

  try {
    const { text } = await generateText({
      model: "anthropic/claude-sonnet-4-20250514",
      prompt,
      temperature: 0.3,
      maxTokens: 2000,
    })

    const parsed = parseJSONResponse(text)
    if (parsed) {
      return parsed
    }

    // Fall back to GPT-4 if Claude fails
    const { text: gptText } = await generateText({
      model: "openai/gpt-4-turbo",
      prompt,
      temperature: 0.3,
      maxTokens: 2000,
    })

    const gptParsed = parseJSONResponse(gptText)
    if (gptParsed) {
      return gptParsed
    }

    return getDefaultSynthesis(data.brand)
  } catch (error) {
    console.error("Synthesis error:", error)
    return getDefaultSynthesis(data.brand)
  }
}
