import { NextResponse } from "next/server"
import { createServerClient, createServiceClient } from "@/lib/supabase/server"

// Railway MCP endpoint - uses RAILWAY_MCP_URL from env vars
// Backend expects snake_case: { brand_name: "Nike" }
const RAILWAY_API_URL = process.env.RAILWAY_MCP_URL || "https://ai-vibes-mcp-server-production.up.railway.app"

interface AnalyzeRequest {
  brandName: string
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
  try {
    // Parse and validate input
    const body: AnalyzeRequest = await req.json()

    if (!body.brandName || typeof body.brandName !== "string") {
      return NextResponse.json(
        {
          error: "brandName is required",
          hint: "Send { brandName: 'Nike' } in request body. The API internally converts to brand_name (snake_case) for Railway.",
        },
        { status: 400 },
      )
    }

    const brandName = body.brandName.trim()
    if (brandName.length < 2) {
      return NextResponse.json({ error: "Brand name must be at least 2 characters" }, { status: 400 })
    }

    // Check authentication (optional - allow unauthenticated for "Start Free Analysis")
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const userId = user?.id || null

    // Call Railway API with snake_case key
    // IMPORTANT: Backend expects brand_name (snake_case), NOT brandName
    console.log("[brand/analyze] Calling Railway API for brand:", brandName)

    const railwayResponse = await fetch(`${RAILWAY_API_URL}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Backend expects brand_name (snake_case)
      body: JSON.stringify({
        brand_name: brandName,
        competitors: body.competitors || [],
        depth: "standard",
      }),
    })

    if (!railwayResponse.ok) {
      const errorText = await railwayResponse.text()
      console.error("[brand/analyze] Railway API error:", railwayResponse.status, errorText)

      // Check for specific snake_case error
      if (errorText.includes("brand_name is required")) {
        return NextResponse.json(
          {
            error: "Railway API requires brand_name (snake_case)",
            hint: "Internal error - the request body should use brand_name, not brandName",
            status: railwayResponse.status,
          },
          { status: 502 },
        )
      }

      return NextResponse.json(
        {
          error: "Failed to analyze brand",
          details: errorText,
          status: railwayResponse.status,
        },
        { status: 502 },
      )
    }

    const result: RailwayResponse = await railwayResponse.json()

    if (!result.success || !result.data) {
      return NextResponse.json(
        {
          error: result.error || "Analysis failed",
          details: "Railway returned success=false or no data",
        },
        { status: 500 },
      )
    }

    const analysisData = result.data

    // Save to Supabase using SERVICE ROLE KEY (bypasses RLS)
    // Wrapped in try/catch - never fail the response due to DB errors
    let savedToDb = false
    let dbError: string | null = null

    try {
      const supabaseAdmin = createServiceClient()

      // Build payload with ONLY columns that exist in public.analysis_results
      // NOTE: There is NO `results` column - do NOT try to insert into it
      const payload: Record<string, unknown> = {
        brand_name: analysisData.brand_name || brandName,
        analyzed_at: analysisData.timestamp || new Date().toISOString(),
      }

      // Add user_id if authenticated
      if (userId) {
        payload.user_id = userId
      }

      // competitors (jsonb) - store array directly
      if (analysisData.competitors && Array.isArray(analysisData.competitors)) {
        payload.competitors = analysisData.competitors
      }

      // consensus_score (double precision)
      if (analysisData.consensus?.overall_score !== undefined) {
        payload.consensus_score = analysisData.consensus.overall_score
      }

      // dimensional_scores (jsonb) - store consensus scores
      if (analysisData.consensus?.scores) {
        payload.dimensional_scores = analysisData.consensus.scores
      }

      // narrative_analysis (jsonb) - derive from models data
      const positioning = analysisData.models?.openai?.data?.positioning
      if (positioning) {
        payload.narrative_analysis = { positioning }
      }

      // executive_summary (text) - short summary from positioning
      if (positioning && typeof positioning === "string") {
        payload.executive_summary = positioning.substring(0, 500)
      }

      // recommendations (jsonb) - from attributes
      const attributes = analysisData.models?.openai?.data?.attributes
      if (attributes && Array.isArray(attributes)) {
        payload.recommendations = attributes
      }

      // models_used (array) - from consensus or derive from models object
      if (analysisData.consensus?.models_used) {
        payload.models_used = analysisData.consensus.models_used
      } else if (analysisData.models) {
        // Derive from models where status=success
        const modelsUsed = Object.entries(analysisData.models)
          .filter(([_, v]) => v.status === "success")
          .map(([k]) => k)
        if (modelsUsed.length > 0) {
          payload.models_used = modelsUsed
        }
      }

      // tokens_used (integer)
      if (analysisData.tokens_used !== undefined) {
        payload.tokens_used = analysisData.tokens_used
      }

      // cost_usd (numeric)
      if (analysisData.cost_usd !== undefined) {
        payload.cost_usd = analysisData.cost_usd
      }

      // processing_time_seconds (integer)
      if (analysisData.processing_time_seconds !== undefined) {
        payload.processing_time_seconds = Math.round(analysisData.processing_time_seconds)
      }

      console.log("[brand/analyze] Saving to analysis_results:", Object.keys(payload))

      const { error: insertError } = await supabaseAdmin.from("analysis_results").insert(payload)

      if (insertError) {
        // Log but don't throw - we still return the analysis
        console.error("[brand/analyze] DB insert error:", insertError.message, insertError.details, insertError.hint)
        dbError = insertError.message
      } else {
        savedToDb = true
        console.log("[brand/analyze] Successfully saved to analysis_results for brand:", brandName)
      }
    } catch (err) {
      // Catch any unexpected errors - never fail the response
      const errorMsg = err instanceof Error ? err.message : "Unknown DB error"
      console.error("[brand/analyze] Unexpected DB error:", errorMsg)
      dbError = errorMsg
    }

    // Always return the analysis response, even if DB save failed
    return NextResponse.json({
      success: true,
      data: analysisData,
      savedToDb,
      dbError,
    })
  } catch (error) {
    console.error("[brand/analyze] Unexpected error:", error)
    return NextResponse.json(
      {
        error: "Failed to process analysis request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
