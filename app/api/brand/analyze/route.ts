import { NextResponse } from "next/server"
import { createServerClient, createServiceClient } from "@/lib/supabase/server"

// Railway MCP endpoint - uses RAILWAY_MCP_URL from env vars
// Backend expects snake_case: { brand_name: "Nike" }
const RAILWAY_API_URL = process.env.RAILWAY_MCP_URL || "https://ai-vibes-mcp-server-production.up.railway.app"

interface AnalyzeRequest {
  brandName?: string
  brand_name?: string // Accept both camelCase and snake_case from client
  competitors?: string[]
}

interface RailwayResponse {
  success: boolean
  data?: {
    brand_name: string
    competitors?: string[]
    consensus?: {
      overall_score?: number
      scores?: Record<string, number>
      models_used?: string[]
    }
    models?: Record<
      string,
      {
        status: string
        data?: {
          positioning?: string
          attributes?: string[]
        }
      }
    >
    timestamp?: string
    processing_time_seconds?: number
    tokens_used?: number
    cost_usd?: number
  }
  error?: string
}

export async function POST(req: Request) {
  console.log("🔵 [Brand/Analyze API] POST iniciado")

  try {
    // Parse and validate input
    let body: AnalyzeRequest
    try {
      body = await req.json()
      console.log("📥 [Brand/Analyze] Body recibido:", JSON.stringify(body, null, 2))
    } catch (parseError) {
      console.error("❌ [Brand/Analyze] Error parsing body:", parseError)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON body",
          message: parseError instanceof Error ? parseError.message : "Parse error",
        },
        { status: 400 },
      )
    }

    const inputBrandName = body.brandName || body.brand_name
    console.log("📥 [Brand/Analyze] Brand name input:", inputBrandName)

    if (!inputBrandName || typeof inputBrandName !== "string") {
      console.error("❌ [Brand/Analyze] brandName faltante o inválido")
      return NextResponse.json(
        {
          success: false,
          error: "brandName is required",
          hint: "Send { brandName: 'Nike' } or { brand_name: 'Nike' } in request body.",
        },
        { status: 400 },
      )
    }

    const brandName = inputBrandName.trim()
    if (brandName.length < 2) {
      console.error("❌ [Brand/Analyze] Brand name muy corto:", brandName)
      return NextResponse.json({ success: false, error: "Brand name must be at least 2 characters" }, { status: 400 })
    }

    // Check authentication (optional - allow unauthenticated for "Start Free Analysis")
    console.log("🔌 [Brand/Analyze] Verificando autenticación...")
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const userId = user?.id || null
    console.log("📥 [Brand/Analyze] User ID:", userId || "no autenticado")

    // Call Railway API with snake_case key
    // IMPORTANT: Backend expects brand_name (snake_case), NOT brandName
    console.log("🔌 [Brand/Analyze] Llamando Railway API para marca:", brandName)
    console.log("🔌 [Brand/Analyze] Railway URL:", `${RAILWAY_API_URL}/analyze`)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout

    let railwayResponse: Response
    try {
      const requestBody = {
        brand_name: brandName,
        competitors: body.competitors || [],
        depth: "standard",
      }
      console.log("🔌 [Brand/Analyze] Request body:", JSON.stringify(requestBody))

      railwayResponse = await fetch(`${RAILWAY_API_URL}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Backend expects brand_name (snake_case)
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      })
      console.log("✅ [Brand/Analyze] Railway respondió con status:", railwayResponse.status)
    } catch (fetchError) {
      clearTimeout(timeoutId)
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.error("❌ [Brand/Analyze] Railway timeout después de 30s")
        return NextResponse.json(
          { success: false, error: "Request timed out", details: "Railway API did not respond within 30 seconds" },
          { status: 504 },
        )
      }
      console.error("❌ [Brand/Analyze] Fetch error:", fetchError)
      throw fetchError
    }
    clearTimeout(timeoutId)

    if (!railwayResponse.ok) {
      let errorText: string
      try {
        errorText = await railwayResponse.text()
      } catch {
        errorText = `HTTP ${railwayResponse.status}`
      }
      console.error("❌ [Brand/Analyze] Railway error:", railwayResponse.status, errorText)

      return NextResponse.json(
        {
          success: false,
          error: "Failed to analyze brand",
          details: errorText,
          status: railwayResponse.status,
        },
        { status: 502 },
      )
    }

    let result: RailwayResponse
    try {
      result = await railwayResponse.json()
      console.log("✅ [Brand/Analyze] Railway JSON parseado, keys:", Object.keys(result))
    } catch (parseError) {
      console.error("❌ [Brand/Analyze] Error parseando Railway response:", parseError)
      return NextResponse.json(
        { success: false, error: "Invalid response from Railway API", details: "JSON parse error" },
        { status: 502 },
      )
    }

    if (!result.success || !result.data) {
      console.error("❌ [Brand/Analyze] Railway success=false o sin data:", result.error)
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Analysis failed",
          details: "Railway returned success=false or no data",
        },
        { status: 500 },
      )
    }

    console.log("✅ [Brand/Analyze] Análisis exitoso para:", brandName)
    const analysisData = result.data

    // If you want persistence, add `results jsonb` column to analysis_results table
    let savedToDb = false
    let dbError: string | null = null

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log("💾 [Brand/Analyze] Iniciando guardado en Supabase...")
      try {
        const supabaseAdmin = createServiceClient()

        // Build payload with ONLY columns that are guaranteed to exist
        // NOTE: Do NOT include `results` column unless you've added it manually
        const payload: Record<string, unknown> = {
          brand_name: analysisData.brand_name || brandName,
          analyzed_at: analysisData.timestamp || new Date().toISOString(),
        }

        // Add user_id if authenticated
        if (userId) {
          payload.user_id = userId
        }

        // Optional fields - only add if data exists
        if (analysisData.consensus?.overall_score !== undefined) {
          payload.consensus_score = analysisData.consensus.overall_score
        }

        if (analysisData.consensus?.scores) {
          payload.dimensional_scores = analysisData.consensus.scores
        }

        if (analysisData.consensus?.models_used) {
          payload.models_used = analysisData.consensus.models_used
        }

        if (analysisData.processing_time_seconds !== undefined) {
          payload.processing_time_seconds = Math.round(analysisData.processing_time_seconds)
        }

        if (analysisData.tokens_used !== undefined) {
          payload.tokens_used = analysisData.tokens_used
        }

        if (analysisData.cost_usd !== undefined) {
          payload.cost_usd = analysisData.cost_usd
        }

        console.log("💾 [Brand/Analyze] Payload keys:", Object.keys(payload))

        const { error: insertError } = await supabaseAdmin.from("analysis_results").insert(payload)

        if (insertError) {
          console.error(
            "❌ [Brand/Analyze] DB insert error (non-blocking):",
            insertError.message,
            insertError.details,
            insertError.hint,
          )
          dbError = insertError.message
        } else {
          console.log("✅ [Brand/Analyze] Guardado exitoso en DB")
          savedToDb = true
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown DB error"
        console.error("❌ [Brand/Analyze] DB error (non-blocking):", errorMsg)
        dbError = errorMsg
      }
    } else {
      console.log("📥 [Brand/Analyze] SUPABASE_SERVICE_ROLE_KEY no disponible, saltando persistencia")
    }

    // Always return the analysis response, even if DB save failed
    console.log("✅ [Brand/Analyze] Enviando respuesta exitosa, savedToDb:", savedToDb)
    return NextResponse.json({
      success: true,
      data: analysisData,
      savedToDb,
      dbError,
    })
  } catch (error) {
    console.error("❌ [Brand/Analyze] Error inesperado:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process analysis request",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.stack : undefined) : undefined,
      },
      { status: 500 },
    )
  }
}
