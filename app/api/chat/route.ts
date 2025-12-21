import { createServerClient, createServiceClient } from "@/lib/supabase/server"

export const maxDuration = 60

const RAILWAY_API_URL = "https://ai-vibes-mcp-server-production.up.railway.app"

// Plan limits
const PLAN_LIMITS = {
  free: 10,
  pro: 100,
  enterprise: Number.POSITIVE_INFINITY,
} as const

type PlanType = keyof typeof PLAN_LIMITS

// Helper to get user's plan and usage
async function getUserPlanAndUsage(userId: string) {
  const supabaseAdmin = createServiceClient()

  // Get user's subscription/plan
  const { data: profile } = await supabaseAdmin.from("profiles").select("subscription_tier").eq("id", userId).single()

  const plan = (profile?.subscription_tier as PlanType) || "free"
  const limit = PLAN_LIMITS[plan]

  // Count messages this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count } = await supabaseAdmin
    .from("chat_messages")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("role", "user")
    .gte("created_at", startOfMonth.toISOString())

  return {
    plan,
    limit,
    used: count || 0,
    remaining: limit === Number.POSITIVE_INFINITY ? Number.POSITIVE_INFINITY : limit - (count || 0),
  }
}

function extractBrandFromMessage(message: string): string | null {
  // Common patterns for brand mentions
  const patterns = [
    /(?:analyze|analizar|analysis of|análisis de)\s+["']?([A-Za-z0-9\s&]+?)["']?(?:\s|$|,|\.|brand)/i,
    /(?:brand|marca)\s+["']?([A-Za-z0-9\s&]+?)["']?/i,
    /(?:about|sobre)\s+["']?([A-Za-z0-9\s&]+?)["']?(?:\s|$|,|\.)/i,
    /(?:how is|como está|what about)\s+["']?([A-Za-z0-9\s&]+?)["']?/i,
  ]

  for (const pattern of patterns) {
    const match = message.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  return null
}

async function callRailwayAnalysis(brandName: string, competitors: string[] = []) {
  try {
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

    if (!response.ok) {
      throw new Error(`Railway API error: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()

    if (result.success) {
      return result.data
    } else {
      throw new Error(result.error || "Railway analysis failed")
    }
  } catch (error) {
    console.error("[v0] Railway API error:", error)
    throw error
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
  const supabaseAdmin = createServiceClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  // Check plan limits
  const { plan, limit, used, remaining } = await getUserPlanAndUsage(user.id)

  if (remaining <= 0) {
    return new Response(
      JSON.stringify({
        error: "Query limit exceeded",
        message: `You've used all ${limit} queries for this month on the ${plan} plan. Upgrade to Pro or Enterprise for more queries.`,
        plan,
        used,
        limit,
      }),
      {
        status: 429,
        headers: { "Content-Type": "application/json" },
      },
    )
  }

  try {
    const brandName = extractBrandFromMessage(message)
    let responseText: string

    if (brandName) {
      // Call Railway API for brand analysis
      try {
        const analysisData = await callRailwayAnalysis(brandName)
        responseText = formatAnalysisResponse(analysisData, brandName)
      } catch (error) {
        responseText = `I encountered an error analyzing "${brandName}". The analysis service may be temporarily unavailable. Please try again in a moment.\n\nError: ${error instanceof Error ? error.message : "Unknown error"}`
      }
    } else {
      // No brand detected - provide helpful response
      responseText = `I'm your AI Brand Analyst. I can help you analyze how any brand is perceived by AI systems like ChatGPT, Claude, Gemini, and Perplexity.

**To get started, try asking:**
- "Analyze Nike's brand perception"
- "How is Apple perceived by AI?"
- "Run an analysis for Tesla"
- "What's the AI visibility of Microsoft?"

Just mention a brand name and I'll provide a comprehensive analysis including:
- AI visibility scores across platforms
- Sentiment analysis
- SWOT analysis
- Actionable recommendations`
    }

    // Save messages to database
    if (conversationId) {
      // Save user message
      await supabaseAdmin.from("chat_messages").insert({
        conversation_id: conversationId,
        user_id: user.id,
        role: "user",
        content: message,
      })

      // Save assistant message
      await supabaseAdmin.from("chat_messages").insert({
        conversation_id: conversationId,
        user_id: user.id,
        role: "assistant",
        content: responseText,
      })

      // Update conversation title if first message
      const { count } = await supabaseAdmin
        .from("chat_messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", conversationId)

      if (count && count <= 2) {
        const title = message.slice(0, 50) + (message.length > 50 ? "..." : "")
        await supabaseAdmin
          .from("conversations")
          .update({ title, updated_at: new Date().toISOString() })
          .eq("id", conversationId)
      } else {
        await supabaseAdmin
          .from("conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", conversationId)
      }
    }

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
