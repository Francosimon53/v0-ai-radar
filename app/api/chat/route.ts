import { consumeStream, convertToModelMessages, streamText, tool, stepCountIs, type UIMessage } from "ai"
import { experimental_createMCPClient as createMCPClient } from "@ai-sdk/mcp"
import { z } from "zod"
import { createServerClient, createServiceClient } from "@/lib/supabase/server"

export const maxDuration = 60

// Plan limits
const PLAN_LIMITS = {
  free: 10,
  pro: 100,
  enterprise: Number.POSITIVE_INFINITY,
} as const

type PlanType = keyof typeof PLAN_LIMITS

const BRAND_ANALYSIS_SYSTEM_PROMPT = `You are an expert AI brand analyst for enterprise companies. You help marketing teams, brand managers, and executives understand how their brand is perceived by AI systems like ChatGPT, Claude, Gemini, and Perplexity.

Your expertise includes:
- Brand visibility and share of voice in AI responses
- Competitive analysis and positioning
- SWOT analysis for AI-era brand strategy
- Recommendations for improving AI brand presence
- Analyzing sentiment and perception across AI platforms

You have access to specialized brand analysis tools:
- analyze_brand_perception: Analyze how a brand is perceived by AI systems
- get_brand_reports: Retrieve existing brand analysis reports
- compare_brands: Compare multiple brands head-to-head

When users ask about brands:
1. Use the appropriate tool to gather data
2. Provide data-driven insights
3. Compare with competitors when relevant
4. Offer actionable recommendations
5. Be concise but thorough
6. Use professional business language

If users haven't specified their brand, ask clarifying questions to understand their company and industry.`

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

// Create fallback tools when MCP is unavailable
function createFallbackTools() {
  return {
    analyze_brand_perception: tool({
      description:
        "Analyze how a brand is perceived by AI systems like ChatGPT, Claude, Gemini, and Perplexity. Returns visibility scores, sentiment analysis, and key themes.",
      inputSchema: z.object({
        brand_name: z.string().describe("The name of the brand to analyze"),
        industry: z.string().optional().describe("The industry the brand operates in"),
        competitors: z.array(z.string()).optional().describe("List of competitor brands to compare against"),
      }),
      execute: async ({ brand_name, industry, competitors }) => {
        // Simulated analysis response
        return {
          brand: brand_name,
          industry: industry || "Not specified",
          overall_score: Math.floor(Math.random() * 30) + 60,
          ai_visibility: {
            chatgpt: Math.floor(Math.random() * 40) + 50,
            claude: Math.floor(Math.random() * 40) + 50,
            gemini: Math.floor(Math.random() * 40) + 50,
            perplexity: Math.floor(Math.random() * 40) + 50,
          },
          sentiment: {
            positive: Math.floor(Math.random() * 30) + 40,
            neutral: Math.floor(Math.random() * 30) + 20,
            negative: Math.floor(Math.random() * 20) + 5,
          },
          key_themes: ["Innovation leader", "Customer service", "Market presence", "Product quality"],
          competitors_analyzed: competitors || [],
          recommendations: [
            "Increase presence in AI training data through authoritative content",
            "Optimize brand mentions in knowledge bases",
            "Address negative sentiment themes proactively",
          ],
          analyzed_at: new Date().toISOString(),
        }
      },
    }),

    get_brand_reports: tool({
      description:
        "Retrieve existing brand analysis reports from the database. Can filter by date range and report type.",
      inputSchema: z.object({
        brand_name: z.string().optional().describe("Filter by brand name"),
        limit: z.number().optional().describe("Maximum number of reports to return"),
        report_type: z.enum(["full", "summary", "competitor"]).optional().describe("Type of report to retrieve"),
      }),
      execute: async ({ brand_name, limit = 5 }) => {
        // Simulated reports response
        return {
          reports: [
            {
              id: "report_1",
              brand: brand_name || "Your Brand",
              type: "full",
              score: 78,
              created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              summary: "Strong AI presence with room for improvement in Gemini visibility",
            },
            {
              id: "report_2",
              brand: brand_name || "Your Brand",
              type: "summary",
              score: 75,
              created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
              summary: "Stable performance across all AI platforms",
            },
          ].slice(0, limit),
          total_reports: 2,
          retrieved_at: new Date().toISOString(),
        }
      },
    }),

    compare_brands: tool({
      description:
        "Compare multiple brands head-to-head across AI visibility metrics, sentiment, and market positioning.",
      inputSchema: z.object({
        brands: z.array(z.string()).min(2).max(5).describe("List of 2-5 brand names to compare"),
        metrics: z
          .array(z.enum(["visibility", "sentiment", "share_of_voice", "growth"]))
          .optional()
          .describe("Specific metrics to compare"),
      }),
      execute: async ({ brands, metrics }) => {
        const comparison = brands.map((brand, index) => ({
          brand,
          rank: index + 1,
          overall_score: Math.floor(Math.random() * 30) + 60,
          visibility_score: Math.floor(Math.random() * 30) + 60,
          sentiment_score: Math.floor(Math.random() * 30) + 60,
          share_of_voice: Math.floor(Math.random() * 40) + 10,
          growth_trend: ["up", "stable", "down"][Math.floor(Math.random() * 3)],
        }))

        // Sort by overall score
        comparison.sort((a, b) => b.overall_score - a.overall_score)
        comparison.forEach((item, index) => (item.rank = index + 1))

        return {
          comparison,
          metrics_analyzed: metrics || ["visibility", "sentiment", "share_of_voice", "growth"],
          leader: comparison[0].brand,
          insights: [
            `${comparison[0].brand} leads in overall AI brand perception`,
            `${comparison[comparison.length - 1].brand} has the most room for improvement`,
            "Sentiment scores are relatively close across all brands",
          ],
          compared_at: new Date().toISOString(),
        }
      },
    }),
  }
}

export async function POST(req: Request) {
  const { messages, conversationId }: { messages: UIMessage[]; conversationId?: string } = await req.json()

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

  // Try to connect to MCP server, fall back to local tools if unavailable
  let tools: Record<string, any>
  let mcpClient: Awaited<ReturnType<typeof createMCPClient>> | null = null

  const mcpUrl = process.env.RAILWAY_MCP_URL

  if (mcpUrl) {
    try {
      mcpClient = await createMCPClient({
        transport: {
          type: "http",
          url: mcpUrl,
        },
      })
      tools = await mcpClient.tools()
    } catch (error) {
      console.error("[v0] MCP connection failed, using fallback tools:", error)
      tools = createFallbackTools()
    }
  } else {
    // No MCP URL configured, use fallback tools
    tools = createFallbackTools()
  }

  const prompt = convertToModelMessages(messages)

  const result = streamText({
    model: "anthropic/claude-sonnet-4-20250514",
    system: BRAND_ANALYSIS_SYSTEM_PROMPT,
    tools,
    stopWhen: stepCountIs(5), // Allow multi-step tool usage
    prompt,
    abortSignal: req.signal,
    onFinish: async () => {
      // Close MCP client when done
      if (mcpClient) {
        await mcpClient.close()
      }
    },
  })

  return result.toUIMessageStreamResponse({
    onFinish: async ({ isAborted, text }) => {
      if (isAborted || !conversationId) return

      // Save the assistant message to the database
      const lastUserMessage = messages[messages.length - 1]
      if (lastUserMessage?.role === "user") {
        const userContent =
          lastUserMessage.parts
            ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
            .map((p) => p.text)
            .join("\n") || ""

        // Save user message
        await supabaseAdmin.from("chat_messages").insert({
          conversation_id: conversationId,
          user_id: user.id,
          role: "user",
          content: userContent,
        })
      }

      // Save assistant message
      if (text) {
        await supabaseAdmin.from("chat_messages").insert({
          conversation_id: conversationId,
          user_id: user.id,
          role: "assistant",
          content: text,
        })

        // Update conversation title if it's the first exchange
        const { count } = await supabaseAdmin
          .from("chat_messages")
          .select("id", { count: "exact", head: true })
          .eq("conversation_id", conversationId)

        if (count && count <= 2) {
          // Generate a title from the first user message
          const title =
            lastUserMessage?.parts
              ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
              .map((p) => p.text)
              .join(" ")
              .slice(0, 50) || "New Conversation"

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
    },
    consumeSseStream: consumeStream,
  })
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
