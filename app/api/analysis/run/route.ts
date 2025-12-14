import { type NextRequest, NextResponse } from "next/server"
import { createServerClient, createServiceClient } from "@/lib/supabase/server"
import { runSimpleAnalysis } from "@/lib/analysis/simple-engine"
import { buildStrategyPlan } from "@/lib/analysis/strategy-plan"

export const maxDuration = 60

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  console.log("[v0] Analysis API called at", new Date().toISOString())

  try {
    const supabase = await createServerClient()
    const supabaseAdmin = createServiceClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("[v0] UNAUTHORIZED - no user")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { configId } = body
    console.log("[v0] Request body configId:", configId, "user.id:", user.id)

    let config = null
    let actualConfigId = null

    if (configId && configId !== "current") {
      const { data, error } = await supabaseAdmin
        .from("brand_configs")
        .select("*")
        .eq("id", configId)
        .eq("user_id", user.id)
        .single()
      config = data
      actualConfigId = data?.id
      console.log("[v0] Config by ID from brand_configs:", data ? "found" : "not found", error?.message)
    }

    if (!config) {
      const { data, error } = await supabaseAdmin
        .from("brand_configs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()
      config = data
      actualConfigId = data?.id
      console.log("[v0] Any config from brand_configs:", data ? "found" : "not found", error?.message)
    }

    if (!config || !actualConfigId) {
      console.log("[v0] Creating default brand_config for user")
      const { data: newConfig, error: createError } = await supabaseAdmin
        .from("brand_configs")
        .insert({
          user_id: user.id,
          brand_name: "My Brand",
          industry: "general",
          competitors: [],
        })
        .select("*")
        .single()

      if (createError || !newConfig) {
        console.error(
          "[v0] Failed to create brand_config:",
          createError?.message,
          createError?.details,
          createError?.hint,
        )
        return NextResponse.json(
          { error: "Failed to create brand configuration", details: createError?.message },
          { status: 500 },
        )
      }

      config = newConfig
      actualConfigId = newConfig.id
      console.log("[v0] Created brand_config with ID:", actualConfigId)
    }

    const brandName = config.brand_name || config.primary_brand || config.name || "Unknown Brand"
    const competitors = config.competitors || []
    const industry = config.industry || "general"

    console.log(
      `[v0] Starting analysis for brand: ${brandName}, competitors: ${competitors.length}, industry: ${industry}`,
    )

    // Run the simplified analysis
    const result = await runSimpleAnalysis(brandName, competitors, industry)
    console.log("[v0] Analysis complete - brandScore:", result.brandScore)

    // Build strategy plan
    let strategyPlan = null
    try {
      const trackingConfig = {
        brand: brandName,
        competitors,
        industry,
        userId: user.id,
      }
      strategyPlan = await buildStrategyPlan(result, trackingConfig, undefined)
    } catch (strategyError) {
      console.error("[v0] Strategy plan FAILED:", strategyError)
    }

    const shareOfVoiceData = {
      brand: result.shareOfVoice,
      competitors: result.competitorScores.map((c) => ({
        name: c.name,
        shareOfVoice: c.shareOfVoice,
      })),
    }

    const dimensionalScores = {
      visibility: result.brandScore,
      sentiment: result.sentiment === "positive" ? 80 : result.sentiment === "negative" ? 30 : 55,
      authority: Math.round(result.brandScore * 0.9),
      relevance: Math.round(result.brandScore * 1.05),
    }

    const narrativeAnalysis = {
      summary: result.summary,
      strengths: result.strengths || [],
      weaknesses: result.weaknesses || [],
      opportunities: result.opportunities || [],
      threats: result.threats || [],
      swot: {
        strengths: result.strengths || [],
        weaknesses: result.weaknesses || [],
        opportunities: result.opportunities || [],
        threats: result.threats || [],
      },
      competitorScores: result.competitorScores,
      actions_90_30_7: strategyPlan?.plan90_30_7 || {
        quickWins: result.opportunities.slice(0, 2),
        thirtyDayGoals: result.opportunities.slice(2, 4),
        ninetyDayVision: strategyPlan?.northStarGoal || "Improve AI brand visibility",
      },
    }

    const threatsData = (result.threats || []).map((threat, i) => ({
      id: i + 1,
      description: threat,
      severity: i === 0 ? "high" : "medium",
    }))

    const recommendationsData = (strategyPlan?.plan90_30_7?.quickWins || result.opportunities || []).map((rec, i) => ({
      id: i + 1,
      action: rec,
      priority: i < 2 ? "high" : "medium",
      timeframe: i < 2 ? "7 days" : "30 days",
    }))

    console.log("[v0] Inserting report with config_id:", actualConfigId, "user_id:", user.id)

    const { data: report, error: insertError } = await supabaseAdmin
      .from("reports")
      .insert({
        config_id: actualConfigId,
        user_id: user.id,
        brand_name: brandName,
        overall_score: result.brandScore,
        share_of_voice: shareOfVoiceData,
        dimensional_scores: dimensionalScores,
        narrative_analysis: narrativeAnalysis,
        threats: threatsData,
        recommendations: recommendationsData,
        models_queried: result.modelBreakdown.map((m) => m.model),
        total_queries: result.queriesSucceeded,
        processing_time_ms: Date.now() - startTime,
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .select("*")
      .single()

    if (insertError) {
      console.error("[v0] Error inserting report:", insertError.message, insertError.details, insertError.hint)
      return NextResponse.json({ error: "Failed to save report", details: insertError.message }, { status: 500 })
    }

    if (!report?.id) {
      console.error("[v0] CRITICAL: No reportId after save")
      return NextResponse.json({ error: "Failed to save report", message: "No ID returned" }, { status: 500 })
    }

    console.log("[v0] Report saved successfully with ID:", report.id)

    // Update last run timestamp on brand_config
    await supabaseAdmin.from("brand_configs").update({ updated_at: new Date().toISOString() }).eq("id", actualConfigId)

    return NextResponse.json({
      success: true,
      reportId: report.id,
      report,
      brandScore: result.brandScore,
      shareOfVoice: result.shareOfVoice,
      sentiment: result.sentiment,
      summary: result.summary,
      processingTime: Date.now() - startTime,
    })
  } catch (error) {
    console.error("[v0] FATAL ERROR:", error)
    return NextResponse.json(
      {
        error: "Analysis failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
