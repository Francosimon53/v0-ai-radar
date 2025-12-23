import { createServerClient } from "@/lib/supabase/server"
import { generateText } from "ai"

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
  console.log("🔌 [Railway] Iniciando llamada para marca:", brandName)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout

  try {
    console.log("🔌 [Railway] URL:", `${RAILWAY_API_URL}/analyze`)
    console.log("🔌 [Railway] Body:", JSON.stringify({ brand_name: brandName, competitors, depth: "standard" }))

    const response = await fetch(`${RAILWAY_API_URL}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Backend expects brand_name (snake_case)
      body: JSON.stringify({
        brand_name: brandName,
        competitors,
        depth: "standard",
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    console.log("✅ [Railway] Response status:", response.status)

    if (!response.ok) {
      let errorText: string
      try {
        errorText = await response.text()
      } catch {
        errorText = `HTTP ${response.status}`
      }
      console.error("❌ [Railway] Error response:", errorText)
      throw new Error(`Railway API error: ${response.status} - ${errorText}`)
    }

    let result: any
    try {
      result = await response.json()
    } catch {
      console.error("❌ [Railway] JSON parse failed")
      throw new Error("Invalid JSON response from Railway")
    }

    console.log("✅ [Railway] Result keys:", Object.keys(result))
    console.log("✅ [Railway] Success:", result.success)

    if (result.success) {
      return result.data
    } else {
      console.error("❌ [Railway] Analysis failed:", result.error)
      throw new Error(result.error || "Railway analysis failed")
    }
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === "AbortError") {
      console.error("❌ [Railway] Request timed out after 30s")
      throw new Error("Railway API request timed out after 30 seconds")
    }
    throw error
  }
}

function formatAnalysisResponse(data: any, brandName: string): string {
  if (!data) {
    return `I couldn't retrieve analysis data for ${brandName}. Please try again later.`
  }

  let response = `## Brand Analysis: ${brandName}\n\n`

  // Handle consensus data from Railway response
  if (data.consensus) {
    if (data.consensus.overall_score !== undefined) {
      response += `**Overall AI Brand Score:** ${data.consensus.overall_score}/100\n\n`
    }

    if (data.consensus.scores) {
      response += `### Dimensional Scores\n`
      for (const [dimension, score] of Object.entries(data.consensus.scores)) {
        const label = dimension.charAt(0).toUpperCase() + dimension.slice(1).replace(/_/g, " ")
        response += `- **${label}:** ${score}/100\n`
      }
      response += `\n`
    }

    if (data.consensus.models_used && data.consensus.models_used.length > 0) {
      response += `*Models consulted: ${data.consensus.models_used.join(", ")}*\n\n`
    }
  }

  // Handle individual model data
  if (data.models) {
    // Show model warnings for errors
    const errors = Object.entries(data.models)
      .filter(([_, v]: [string, any]) => v.status === "error")
      .map(([k]) => k)

    if (errors.length > 0) {
      response += `> ⚠️ *Some models returned errors: ${errors.join(", ")}*\n\n`
    }

    // Extract positioning from OpenAI if available
    const openaiData = data.models.openai?.data
    if (openaiData?.positioning) {
      response += `### Brand Positioning\n${openaiData.positioning}\n\n`
    }

    // Extract attributes if available
    if (openaiData?.attributes && openaiData.attributes.length > 0) {
      response += `### Key Attributes\n`
      openaiData.attributes.forEach((attr: string) => {
        response += `- ${attr}\n`
      })
      response += `\n`
    }
  }

  // Legacy format support (in case Railway returns different structure)
  if (data.overall_score !== undefined && !data.consensus) {
    response += `**Overall AI Brand Score:** ${data.overall_score}/100\n\n`
  }

  if (data.ai_visibility && !data.consensus) {
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

  if (data.timestamp || data.analyzed_at) {
    response += `---\n*Analysis generated at ${new Date(data.timestamp || data.analyzed_at).toLocaleString()}*`
  }

  return response
}

async function saveAnalysisResult(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  userId: string,
  brandName: string,
  analysisData: any,
): Promise<void> {
  console.log("💾 [Supabase] Iniciando guardado para:", brandName)

  try {
    // Build schema-safe payload with only guaranteed columns
    const payload: Record<string, any> = {
      user_id: userId,
      brand_name: brandName,
      analyzed_at: new Date().toISOString(),
    }

    // Add optional fields if they exist in the analysis data
    if (analysisData.overall_score !== undefined) {
      payload.rank = analysisData.overall_score
    }

    if (analysisData.share_of_voice !== undefined) {
      payload.share_of_voice = analysisData.share_of_voice
    }

    // Store dimensional scores (including competitors if present)
    const dimensionalScores: Record<string, any> = {}
    if (analysisData.ai_visibility) {
      dimensionalScores.ai_visibility = analysisData.ai_visibility
    }
    if (analysisData.sentiment) {
      dimensionalScores.sentiment = analysisData.sentiment
    }
    if (analysisData.competitors && Array.isArray(analysisData.competitors)) {
      // Store competitors inside dimensional_scores to avoid column issues
      dimensionalScores.competitors = analysisData.competitors
    }
    if (Object.keys(dimensionalScores).length > 0) {
      payload.dimensional_scores = dimensionalScores
    }

    // Store narrative analysis
    if (analysisData.key_themes || analysisData.description) {
      payload.narrative_analysis = {
        key_themes: analysisData.key_themes || [],
        description: analysisData.description || "",
      }
    }

    // Store SWOT in threat_assessment
    if (analysisData.swot) {
      payload.threat_assessment = {
        swot: analysisData.swot,
      }
    }

    // Store recommendations
    if (analysisData.recommendations && Array.isArray(analysisData.recommendations)) {
      payload.recommendations = analysisData.recommendations
    }

    // Store executive summary if available
    if (analysisData.summary || analysisData.executive_summary) {
      payload.executive_summary = analysisData.summary || analysisData.executive_summary
    }

    // Store models used
    if (analysisData.models_used) {
      payload.models_used = analysisData.models_used
    }

    // Store processing time
    if (analysisData.processing_time_seconds !== undefined) {
      payload.processing_time_seconds = analysisData.processing_time_seconds
    }

    console.log("💾 [Supabase] Payload keys:", Object.keys(payload))

    const { error } = await supabase.from("analysis_results").insert(payload)

    if (error) {
      // Log error but don't throw - we still want to return the response
      console.error("❌ [Supabase] Insert error:", error.message, error.details, error.hint)
    } else {
      console.log("✅ [Supabase] Guardado exitoso para:", brandName)
    }
  } catch (error) {
    // Catch any unexpected errors - never fail the chat response
    console.error("❌ [Supabase] Error inesperado:", error instanceof Error ? error.message : error)
  }
}

async function conversationalResponse(message: string): Promise<string> {
  console.log("💬 [Chat API] Iniciando respuesta conversacional")

  const systemPrompt = `Eres un asistente especializado en análisis de marcas con AI. Tu nombre es AI Brand Analyst.

Puedes:
- Analizar cualquier marca mencionada (Nike, Apple, Tesla, Coca-Cola, etc.)
- Proporcionar scores de percepción de marca basados en cómo los sistemas de AI (ChatGPT, Claude, Gemini, Perplexity) perciben las marcas
- Dar recomendaciones estratégicas de branding
- Responder preguntas sobre branding, marketing y posicionamiento de marca

Para analizar una marca, el usuario solo necesita mencionarla en el chat.

Responde de manera amigable y profesional. Si el usuario saluda, responde cordialmente y explica brevemente lo que puedes hacer. Si preguntan sobre tus capacidades, explícalas claramente.

Siempre responde en el mismo idioma que el usuario.`

  try {
    const { text } = await generateText({
      model: "anthropic/claude-sonnet-4-20250514",
      system: systemPrompt,
      prompt: message,
      maxTokens: 1024,
    })

    console.log("✅ [Chat API] Respuesta conversacional generada")
    return text
  } catch (error) {
    console.error("❌ [Chat API] Error en respuesta conversacional:", error)
    // Fallback response if AI fails
    return `¡Hola! Soy tu AI Brand Analyst. Puedo ayudarte a analizar cómo cualquier marca es percibida por sistemas de AI como ChatGPT, Claude, Gemini y Perplexity.

**Para empezar, simplemente menciona una marca:**
- "Analiza Nike"
- "¿Cómo perciben a Apple?"
- "Tesla"
- "Coca-Cola"

Te proporcionaré un análisis completo incluyendo scores de visibilidad, análisis de sentimiento, SWOT y recomendaciones estratégicas.`
  }
}

export async function POST(req: Request) {
  console.log("🔵 [Chat API] POST iniciado")

  let body: { message: string; conversationId?: string }

  try {
    body = await req.json()
    console.log("📥 [Chat API] Body recibido:", JSON.stringify(body, null, 2))
  } catch (parseError) {
    console.error("❌ [Chat API] Error parsing body:", parseError)
    return new Response(
      JSON.stringify({
        error: "Invalid JSON body",
        message: parseError instanceof Error ? parseError.message : "Parse error",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    )
  }

  const { message, conversationId } = body

  console.log("🔌 [Chat API] Creando cliente Supabase...")
  const supabase = await createServerClient()

  console.log("🔌 [Chat API] Obteniendo usuario...")
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.error("❌ [Chat API] Usuario no autenticado")
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }
  console.log("✅ [Chat API] Usuario autenticado:", user.id)

  // Get plan info (simplified, doesn't require chat_messages table)
  const { used } = await getUserPlanAndUsage(user.id)
  console.log("📥 [Chat API] Queries usadas:", used)

  try {
    const brandName = extractBrandFromMessage(message)
    console.log("📥 [Chat API] Marca extraída:", brandName, "| Mensaje original:", message)

    let responseText: string

    if (brandName) {
      // Call Railway API for brand analysis
      console.log("🔌 [Chat API] Iniciando análisis para marca:", brandName)
      try {
        const analysisData = await callRailwayAnalysis(brandName)
        console.log("✅ [Chat API] Análisis completado, formateando respuesta...")
        responseText = formatAnalysisResponse(analysisData, brandName)

        console.log("💾 [Chat API] Guardando resultado en background...")
        saveAnalysisResult(supabase, user.id, brandName, analysisData).catch((err) => {
          console.error("❌ [Chat API] Background save failed:", err)
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        console.error("❌ [Chat API] Error en análisis Railway:", errorMessage)

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
      console.log("💬 [Chat API] No se detectó marca, usando modo conversacional")
      responseText = await conversationalResponse(message)
    }

    console.log("✅ [Chat API] Enviando respuesta exitosa")
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
    console.error("❌ [Chat API] Error general:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to process message",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.stack : undefined) : undefined,
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
