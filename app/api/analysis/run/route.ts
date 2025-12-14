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
    console.log("[v0] Supabase clients created (user + service role)")

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log("[v0] Auth check - user:", user?.id, "error:", authError?.message)

    if (authError || !user) {
      console.log("[v0] UNAUTHORIZED - no user")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { configId } = body
    console.log("[v0] Request body configId:", configId)

    let config = null

    if (configId && configId !== "current") {
      console.log("[v0] Fetching config by ID:", configId)
      const { data, error } = await supabaseAdmin
        .from("tracking_configs")
        .select("*")
        .eq("id", configId)
        .eq("user_id", user.id)
        .single()
      config = data
      console.log("[v0] Config by ID result:", data ? "found" : "not found", error?.message)
    }

    if (!config) {
      console.log("[v0] Fetching any config for user")
      const { data, error } = await supabaseAdmin
        .from("tracking_configs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()
      config = data
      console.log("[v0] Any config result:", data ? "found" : "not found", error?.message)
    }

    if (!config) {
      console.log("[v0] NO CONFIG FOUND - returning 404")
      return NextResponse.json({ error: "No tracking config found. Please complete setup first." }, { status: 404 })
    }

    const brandName = config.primary_brand || config.name || "Unknown Brand"
    const competitors = config.competitors || []
    const industry = config.industry || "general"

    console.log(
      `[v0] Starting analysis for brand: ${brandName}, competitors: ${competitors.length}, industry: ${industry}`,
    )

    // Run the simplified analysis
    console.log("[v0] Calling runSimpleAnalysis...")
    const result = await runSimpleAnalysis(brandName, competitors, industry)
    console.log("[v0] Analysis complete - brandScore:", result.brandScore, "queriesSucceeded:", result.queriesSucceeded)

    // Build strategy plan
    console.log("[v0] Building strategy plan...")
    let strategyPlan = null
    try {
      const trackingConfig = {
        brand: brandName,
        competitors,
        industry,
        userId: user.id,
      }
      strategyPlan = await buildStrategyPlan(result, trackingConfig, undefined)
      console.log("[v0] Strategy plan built - northStarGoal:", strategyPlan?.northStarGoal?.substring(0, 50))
    } catch (strategyError) {
      console.error("[v0] Strategy plan FAILED:", strategyError)
    }

    console.log("[v0] Saving report to database with service role client...")

    // Build SWOT snapshot object
    const swotSnapshot = {
      strengths: result.strengths || [],
      weaknesses: result.weaknesses || [],
      opportunities: result.opportunities || [],
      threats: result.threats || [],
    }

    // Build competitors block
    const competitorBlock = result.competitorScores.map((c) => ({
      name: c.name,
      score: c.score,
      shareOfVoice: c.shareOfVoice,
      threatLevel: c.score > 70 ? "high" : c.score > 50 ? "medium" : "low",
    }))

    // Build 90/30/7 action plan
    const actionPlan = strategyPlan?.plan90_30_7 || {
      quickWins: result.opportunities.slice(0, 2),
      thirtyDayGoals: result.opportunities.slice(2, 4),
      ninetyDayVision: strategyPlan?.northStarGoal || "Improve AI brand visibility",
    }

    const { data: report, error: insertError } = await supabaseAdmin
      .from("reports")
      .insert({
        profile_id: user.id,
        brand_name: brandName,
        summary: result.summary,
        overall_score: result.brandScore,
        swot: swotSnapshot,
        competitors: competitorBlock,
        actions_90_30_7: actionPlan,
        models_queried: result.modelBreakdown.map((m) => m.model),
        status: "completed",
      })
      .select("id")
      .single()

    if (insertError) {
      console.error("[v0] Error inserting report:", insertError)
      return NextResponse.json({ error: "Failed to save report", details: insertError.message }, { status: 500 })
    }

    const reportId = report?.id

    if (!reportId) {
      console.error("[v0] CRITICAL: No reportId after save")
      return NextResponse.json({ error: "Failed to save report", message: "No ID returned" }, { status: 500 })
    }

    console.log("[v0] Report saved successfully with ID:", reportId)

    // Update last run timestamp with service role
    await supabaseAdmin.from("tracking_configs").update({ last_run_at: new Date().toISOString() }).eq("id", config.id)

    const response = {
      success: true,
      analysisId: reportId,
      reportId: reportId,
      brandScore: result.brandScore,
      shareOfVoice: result.shareOfVoice,
      sentiment: result.sentiment,
      summary: result.summary,
      processingTime: Date.now() - startTime,
      result,
      planSummary: strategyPlan
        ? {
            northStarGoal: strategyPlan.northStarGoal,
            quickWins: strategyPlan.plan90_30_7?.quickWins || [],
            backlogCount: strategyPlan.backlog?.length || 0,
          }
        : null,
    }

    console.log("[v0] SUCCESS - returning reportId:", reportId, "brandScore:", response.brandScore)
    return NextResponse.json(response)
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
