import { createServerClient } from "@/lib/supabase/server"
import Anthropic from "@anthropic-ai/sdk"

export const maxDuration = 60

const RAILWAY_API_URL = "https://ai-vibes-mcp-server-production.up.railway.app"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// Plan limits
const PLAN_LIMITS = {
  free: 10,
  pro: 100,
  enterprise: Number.POSITIVE_INFINITY,
} as const

type PlanType = keyof typeof PLAN_LIMITS

async function getUserPlanAndUsage(userId: string) {
  return {
    plan: "free" as PlanType,
    limit: PLAN_LIMITS.free,
    used: 0,
    remaining: PLAN_LIMITS.free,
  }
}

function extractBrandFromMessage(message: string): string | null {
  const commonBrands = [
    "nike",
    "apple",
    "tesla",
    "google",
    "microsoft",
    "amazon",
    "meta",
    "facebook",
    "coca-cola",
    "pepsi",
    "mcdonalds",
    "starbucks",
    "netflix",
    "disney",
    "uber",
    "airbnb",
    "spotify",
    "samsung",
    "sony",
    "adidas",
    "puma",
    "bmw",
    "mercedes",
    "toyota",
    "ford",
    "walmart",
    "target",
    "costco",
    "ikea",
    "lego",
    "rolex",
    "gucci",
    "louis vuitton",
    "chanel",
    "hermes",
    "zara",
    "h&m",
    "uniqlo",
    "oracle",
    "salesforce",
    "adobe",
    "intel",
    "nvidia",
    "amd",
    "ibm",
    "cisco",
    "visa",
    "mastercard",
    "paypal",
    "stripe",
    "square",
    "shopify",
  ]

  const lowerMessage = message.toLowerCase()

  // Check for known brands first
  for (const brand of commonBrands) {
    if (lowerMessage.includes(brand)) {
      return brand.charAt(0).toUpperCase() + brand.slice(1)
    }
  }

  // Pattern-based extraction
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

  // Short message handling (1-3 words)
  const trimmed = message.trim()
  const words = trimmed.split(/\s+/)
  if (words.length <= 3 && words.length >= 1) {
    const potentialBrand = trimmed
    if (/^[A-Za-z0-9\s&-]+$/.test(potentialBrand) && potentialBrand.length >= 2) {
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
        "please",
        "por favor",
        "good",
        "bad",
        "bueno",
        "malo",
        "start",
        "comenzar",
        "empezar",
      ]
      if (!nonBrandWords.includes(potentialBrand.toLowerCase())) {
        return potentialBrand
      }
    }
  }

  return null
}

async function callAnthropicWithRetry(systemPrompt: string, userMessage: string, maxRetries = 3): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`🔵 [Anthropic] Intento ${i + 1}/${maxRetries}`)

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      })

      console.log("✅ [Anthropic] Respuesta exitosa")

      if (response.content[0].type === "text") {
        return response.content[0].text
      }

      throw new Error("Respuesta inesperada de Anthropic")
    } catch (error: any) {
      console.error(`❌ [Anthropic] Error intento ${i + 1}:`, {
        message: error.message,
        status: error.status,
        type: error.type,
      })

      if (i === maxRetries - 1) {
        throw new Error(`Anthropic failed after ${maxRetries} attempts: ${error.message}`)
      }

      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, i)))
    }
  }

  throw new Error("Retry logic failed unexpectedly")
}

async function handleConversationalMode(message: string): Promise<string> {
  console.log("💬 [CHAT] Modo conversacional activado")

  const systemPrompt = `Eres un asistente experto en análisis de marca con inteligencia artificial. Tu nombre es AI Brand Analyst.

Tu especialidad es ayudar a empresarios y marketers a entender cómo las diferentes plataformas de AI (ChatGPT, Claude, Gemini, Perplexity) perciben sus marcas.

CAPACIDADES:
- Analizar la percepción de cualquier marca mencionada
- Proporcionar scores multidimensionales (Sentiment, Innovation, Trust, Sustainability, Value)
- Dar insights estratégicos sobre posicionamiento de marca
- Responder preguntas sobre branding y marketing digital

INSTRUCCIONES:
- Sé amigable y profesional
- Si el usuario pregunta qué puedes hacer, explica tus capacidades
- Si mencionan una marca, ofrécete a analizarla
- Si preguntan algo fuera de tu especialidad, reconócelo pero intenta conectarlo con branding si es posible
- Responde en el mismo idioma que el usuario
- Usa un tono conversacional pero experto

Responde de manera concisa y útil.`

  try {
    const responseText = await callAnthropicWithRetry(systemPrompt, message)
    return responseText
  } catch (error: any) {
    console.error("❌ [CHAT] Error en modo conversacional:", error.message)
    // Return helpful fallback
    return `¡Hola! Soy tu AI Brand Analyst. Puedo ayudarte a analizar cómo cualquier marca es percibida por sistemas de AI como ChatGPT, Claude, Gemini y Perplexity.

**Para empezar, simplemente menciona una marca:**
- "Analiza Nike"
- "¿Cómo perciben a Apple?"
- "Tesla"
- "Coca-Cola"

Te proporcionaré un análisis completo incluyendo scores de visibilidad, análisis de sentimiento, SWOT y recomendaciones estratégicas.`
  }
}

async function callRailwayAnalysis(brandName: string, competitors: string[] = []) {
  console.log("🔌 [Railway] Iniciando llamada para marca:", brandName)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch(`${RAILWAY_API_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
      throw new Error(`Railway API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log("✅ [Railway] Success:", result.success)

    if (result.success) {
      return result.data
    } else {
      throw new Error(result.error || "Railway analysis failed")
    }
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === "AbortError") {
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
    if (data.consensus.models_used?.length > 0) {
      response += `*Models consulted: ${data.consensus.models_used.join(", ")}*\n\n`
    }
  }

  if (data.models) {
    const errors = Object.entries(data.models)
      .filter(([_, v]: [string, any]) => v.status === "error")
      .map(([k]) => k)
    if (errors.length > 0) {
      response += `> ⚠️ *Some models returned errors: ${errors.join(", ")}*\n\n`
    }
    const openaiData = data.models.openai?.data
    if (openaiData?.positioning) {
      response += `### Brand Positioning\n${openaiData.positioning}\n\n`
    }
    if (openaiData?.attributes?.length > 0) {
      response += `### Key Attributes\n`
      openaiData.attributes.forEach((attr: string) => {
        response += `- ${attr}\n`
      })
      response += `\n`
    }
  }

  if (data.overall_score !== undefined && !data.consensus) {
    response += `**Overall AI Brand Score:** ${data.overall_score}/100\n\n`
  }

  if (data.sentiment) {
    response += `### Sentiment Analysis\n`
    response += `- Positive: ${data.sentiment.positive}%\n`
    response += `- Neutral: ${data.sentiment.neutral}%\n`
    response += `- Negative: ${data.sentiment.negative}%\n\n`
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

  if (data.recommendations?.length > 0) {
    response += `### Recommendations\n`
    data.recommendations.forEach((rec: string, i: number) => {
      response += `${i + 1}. ${rec}\n`
    })
  }

  return response
}

async function saveAnalysisResult(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  userId: string,
  brandName: string,
  analysisData: any,
): Promise<void> {
  try {
    const payload: Record<string, any> = {
      user_id: userId,
      brand_name: brandName,
      analyzed_at: new Date().toISOString(),
    }
    if (analysisData.overall_score !== undefined) {
      payload.rank = analysisData.overall_score
    }
    const dimensionalScores: Record<string, any> = {}
    if (analysisData.ai_visibility) dimensionalScores.ai_visibility = analysisData.ai_visibility
    if (analysisData.sentiment) dimensionalScores.sentiment = analysisData.sentiment
    if (analysisData.competitors) dimensionalScores.competitors = analysisData.competitors
    if (Object.keys(dimensionalScores).length > 0) payload.dimensional_scores = dimensionalScores
    if (analysisData.swot) payload.threat_assessment = { swot: analysisData.swot }
    if (analysisData.recommendations) payload.recommendations = analysisData.recommendations

    const { error } = await supabase.from("analysis_results").insert(payload)
    if (error) console.error("❌ [Supabase] Insert error:", error.message)
    else console.log("✅ [Supabase] Guardado exitoso")
  } catch (error) {
    console.error("❌ [Supabase] Error:", error instanceof Error ? error.message : error)
  }
}

export async function POST(req: Request) {
  console.log("🔵 [Chat API] POST iniciado")

  let body: { message: string; conversationId?: string }
  try {
    body = await req.json()
    console.log("📥 [Chat API] Message:", body.message)
  } catch (parseError) {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const { message, conversationId } = body

  if (!message || message.trim() === "") {
    return new Response(JSON.stringify({ error: "Message is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

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

  const { used } = await getUserPlanAndUsage(user.id)

  try {
    const brandName = extractBrandFromMessage(message)
    console.log("📥 [Chat API] Marca detectada:", brandName || "(ninguna - modo conversacional)")

    let responseText: string

    if (brandName) {
      console.log("🏷️ [CHAT] Modo análisis de marca:", brandName)
      try {
        const analysisData = await callRailwayAnalysis(brandName)
        responseText = formatAnalysisResponse(analysisData, brandName)

        saveAnalysisResult(supabase, user.id, brandName, analysisData).catch((err) => {
          console.error("❌ Background save failed:", err)
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        console.error("❌ [Railway] Error:", errorMessage)
        responseText = `## Unable to Analyze "${brandName}"

I encountered an issue while analyzing this brand. Please try again in a few moments.

*Error: ${errorMessage}*`
      }
    } else {
      console.log("💬 [CHAT] Modo conversacional")
      responseText = await handleConversationalMode(message)
    }

    return new Response(
      JSON.stringify({
        response: responseText,
        conversationId,
        used: used + 1,
        mode: brandName ? "brand_analysis" : "conversational",
        brand: brandName || undefined,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )
  } catch (error) {
    console.error("❌ [Chat API] Error crítico:", error)
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}

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
