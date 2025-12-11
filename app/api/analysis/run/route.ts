import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { runSimpleAnalysis } from "@/lib/analysis/simple-engine"

export const maxDuration = 60 // Allow up to 60 seconds

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { configId } = body

    if (!configId) {
      return NextResponse.json({ error: "Missing configId" }, { status: 400 })
    }

    // Fetch tracking config
    const { data: config, error: configError } = await supabase
      .from("tracking_configs")
      .select("*")
      .eq("id", configId)
      .eq("user_id", user.id)
      .single()

    if (configError || !config) {
      // Try to get any config for this user
      const { data: anyConfig } = await supabase
        .from("tracking_configs")
        .select("*")
        .eq("user_id", user.id)
        .limit(1)
        .single()

      if (!anyConfig) {
        return NextResponse.json({ error: "No tracking config found" }, { status: 404 })
      }

      // Use the found config
      Object.assign(config || {}, anyConfig)
    }

    const brandName = config?.primary_brand || config?.name || "Unknown Brand"
    const competitors = config?.competitors || []
    const industry = config?.industry || "general"

    console.log(`[API] Running analysis for ${brandName}`)

    // Run the simplified analysis
    const result = await runSimpleAnalysis(brandName, competitors, industry)

    // Save to database
    const { error: saveError } = await supabase.from("reports").upsert({
      id: result.id,
      user_id: user.id,
      config_id: config?.id || configId,
      brand: brandName,
      score: result.brandScore,
      share_of_voice: result.shareOfVoice,
      sentiment: result.sentiment,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      opportunities: result.opportunities,
      threats: result.threats,
      executive_summary: result.summary,
      model_breakdown: result.modelBreakdown,
      competitor_scores: result.competitorScores,
      full_result: result,
      created_at: result.timestamp,
    })

    if (saveError) {
      console.error("[API] Error saving report:", saveError)
      // Don't fail the request - we still have the result
    }

    // Update last run timestamp
    if (config?.id) {
      await supabase.from("tracking_configs").update({ last_run_at: new Date().toISOString() }).eq("id", config.id)
    }

    return NextResponse.json({
      success: true,
      analysisId: result.id,
      brandScore: result.brandScore,
      shareOfVoice: result.shareOfVoice,
      sentiment: result.sentiment,
      summary: result.summary,
      processingTime: Date.now() - startTime,
      result,
    })
  } catch (error) {
    console.error("[API] Analysis error:", error)
    return NextResponse.json(
      {
        error: "Analysis failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
