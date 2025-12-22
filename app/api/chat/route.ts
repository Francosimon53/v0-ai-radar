import { createServerClient } from "@/lib/supabase/server"

export const maxDuration = 60

const RAILWAY_API_URL = "https://ai-vibes-mcp-server-production.up.railway.app"

// Plan limits
const PLAN_LIMITS = {
  free: 10,
  pro: 100,
  enterprise: Number.POSITIVE_INFINITY,
} as const

type PlanType = keyof typeof PLAN_LIMITS

async function getUserPlanAndUsage(userId: string) {
  // Default values - assume free plan with plenty of queries for now
  // since database tables may not exist yet
  return {
    plan: "free" as PlanType,
    limit: PLAN_LIMITS.free,
    used: 0,
    remaining: PLAN_LIMITS.free,
  }
}

function extractBrandFromMessage(message: string): string | null {
  const trimmed = message.trim()

  // Pattern-based extraction first
  const patterns = [
    /(?:analyze|analizar|analysis of|análisis de)\s+["']?([A-Za-z0-9\s&-]+?)["']?(?:\s|$|,|\.|brand)/i,
    /(?:brand|marca)\s+["']?([A-Za-z0-9\s&-]+?)["']?/i,
    /(?:about|sobre)\s+["']?([A-Za-z0-9\s&-]+?)["']?(?:\s|$|,|\.)/i,
    /(?:how is|como está|what about|tell me about|dime sobre)\s+["']?([A-Za-z0-9\s&-]+?)["']?/i,
    /(?:perception of|percepción de)\s+["']?([A-Za-z0-9\s&-]+?)["']?/i,
  ]

  for (const pattern of patterns) {
    const match = message.match(pattern)
    if (match && match[1]) {
      const brand = match[1].trim()
      if (brand.length >= 2) {
        return brand
      }
    }
  }

  // If no pattern matched but the message is short (1-3 words) and looks like a brand name,
  // treat the whole message as a brand name
  const words = trimmed.split(/\s+/)
  if (words.length <= 3 && words.length >= 1) {
    // Check if it looks like a brand (starts with capital or is all lowercase, no special chars except &-)
    const potentialBrand = trimmed
    if (/^[A-Za-z0-9\s&-]+$/.test(potentialBrand) && potentialBrand.length >= 2) {
      // Filter out common non-brand words
      const nonBrandWords = [
        "hello",
        "hi",
        "hey",
        "hola",
        "help",
        "ayuda",
        "what",
        "que",
        "how",
        "como",
        "yes",
        "no",
        "ok",
        "thanks",
        "gracias",
      ]
      if (!nonBrandWords.includes(potentialBrand.toLowerCase())) {
        return potentialBrand
      }
    }
  }

  return null
}

async function callRailwayAnalysis(brandName: string, competitors: string[] = []) {
  console.log("[v0] Calling Railway API for brand:", brandName)

  const response = await fetch(`${RAILWAY_API_URL}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      brand_name: brandName,
      competitors,
      depth: "standard",
    }),
  })

  console.log("[v0] Railway API response status:", response.status)

  if (!response.ok) {
    const errorText = await response.text()
    console.error("[v0] Railway API error response:", errorText)
    throw new Error(`Railway API error: ${response.status}`)
  }

  const result = await response.json()
  console.log("[v0] Railway API result:", JSON.stringify(result).slice(0, 500))

  if (result.success) {
    return result.data
  } else {
    throw new Error(result.error || "Railway analysis failed")
  }
}

function formatAnalysisResponse(data: any, brandName: string): string {
  if (!data) {
    return `I couldn't retrieve analysis data for ${brandName}. Please try again later.`
  }

  let response = `## Brand Analysis: ${brandName}\n\n`

  if (data.overall_score !== undefined) {
    response += `**Overall AI Brand Score:** ${data.overall_score}/100\n\n`
  }

  if (data.ai_visibility) {
    response += `### AI Visibility Scores\n`
    for (const [platform, score] of Object.entries(data.ai_visibility)) {
      response += `- **${platform}:** ${score}/100\n`
    }
    response += `\n`
  }

  if (data.sentiment) {
    response += `### Sentiment Analysis\n`
    response += `- Positive: ${data.sentiment.positive}%\n`
    response += `- Neutral: ${data.sentiment.neutral}%\n`
    response += `- Negative: ${data.sentiment.negative}%\n\n`
  }

  if (data.key_themes && data.key_themes.length > 0) {
    response += `### Key Themes\n`
    data.key_themes.forEach((theme: string) => {
      response += `- ${theme}\n`
    })
    response += `\n`
  }

  if (data.swot) {
    response += `### SWOT Analysis\n`
    if (data.swot.strengths?.length) {
      response += `**Strengths:**\n`
      data.swot.strengths.forEach((s: string) => (response += `- ${s}\n`))
    }
    if (data.swot.weaknesses?.length) {
      response += `**Weaknesses:**\n`
      data.swot.weaknesses.forEach((w: string) => (response += `- ${w}\n`))
    }
    if (data.swot.opportunities?.length) {
      response += `**Opportunities:**\n`
      data.swot.opportunities.forEach((o: string) => (response += `- ${o}\n`))
    }
    if (data.swot.threats?.length) {
      response += `**Threats:**\n`
      data.swot.threats.forEach((t: string) => (response += `- ${t}\n`))
    }
    response += `\n`
  }

  if (data.recommendations && data.recommendations.length > 0) {
    response += `### Recommendations\n`
    data.recommendations.forEach((rec: string, i: number) => {
      response += `${i + 1}. ${rec}\n`
    })
    response += `\n`
  }

  if (data.analyzed_at) {
    response += `---\n*Analysis generated at ${new Date(data.analyzed_at).toLocaleString()}*`
  }

  return response
}

export async function POST(req: Request) {
  const { message, conversationId }: { message: string; conversationId?: string } = await req.json()

  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  // Get plan info (simplified, doesn't require chat_messages table)
  const { used } = await getUserPlanAndUsage(user.id)

  try {
    const brandName = extractBrandFromMessage(message)
    console.log("[v0] Extracted brand from message:", brandName, "| Original message:", message)

    let responseText: string

    if (brandName) {
      // Call Railway API for brand analysis
      try {
        const analysisData = await callRailwayAnalysis(brandName)
        responseText = formatAnalysisResponse(analysisData, brandName)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        console.error("[v0] Railway analysis error for brand:", brandName, errorMessage)

        responseText = `## Unable to Analyze "${brandName}"

I encountered an issue while trying to analyze this brand. This could happen because:

1. **The analysis service is temporarily unavailable** - Please try again in a few moments
2. **Network connectivity issues** - The service might be experiencing high load

**What you can try:**
- Wait a moment and try again
- Try a different brand to test connectivity

*Technical details: ${errorMessage}*`
      }
    } else {
      // No brand detected - provide helpful response
      responseText = `## Welcome to AI Brand Analysis

I'm your AI Brand Analyst. I can help you analyze how any brand is perceived by AI systems like ChatGPT, Claude, Gemini, and Perplexity.

**To get started, try asking:**
- "Analyze Nike's brand perception"
- "How is Apple perceived by AI?"
- "Run an analysis for Tesla"
- "What's the AI visibility of Microsoft?"
- "Analizar la marca Coca-Cola"

Or simply type a brand name like: **Nike**, **Apple**, **Tesla**, **Coca-Cola**

Just mention a brand name and I'll provide a comprehensive analysis including:
- AI visibility scores across platforms
- Sentiment analysis 
- SWOT analysis
- Actionable recommendations`
    }

    // Messages will only be stored in client state for now

    return new Response(
      JSON.stringify({
        response: responseText,
        conversationId,
        used: used + 1,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("[v0] Chat API error:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to process message",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

// GET endpoint to check user's usage
export async function GET() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  const usage = await getUserPlanAndUsage(user.id)

  return new Response(JSON.stringify(usage), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}
