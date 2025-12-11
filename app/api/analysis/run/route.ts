import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { runSimpleAnalysis } from "@/lib/analysis/simple-engine"
import { buildStrategyPlan } from "@/lib/analysis/strategy-plan"

export const maxDuration = 60

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  console.log("[v0] Analysis API called at", new Date().toISOString())

  try {
    const supabase = await createServerClient()
    console.log("[v0] Supabase client created")

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

    // Fetch tracking config
    let config = null

    if (configId && configId !== "current") {
      console.log("[v0] Fetching config by ID:", configId)
      const { data, error } = await supabase
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
      const { data, error } = await supabase
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

    // Save to database
    console.log("[v0] Saving report to database...")
    const reportData = {
      id: result.id,
      user_id: user.id,
      config_id: config.id,
      brand_name: brandName,
      overall_score: result.brandScore,
      previous_score: null,
      score_change: null,
      share_of_voice: {
        brand: result.shareOfVoice,
        competitors: result.competitorScores.reduce(
          (acc, c) => {
            acc[c.name] = c.shareOfVoice
            return acc
          },
          {} as Record<string, number>,
        ),
      },
      dimensional_scores: {
        sentiment: result.sentiment,
        modelBreakdown: result.modelBreakdown,
      },
      narrative_analysis: {
        summary: result.summary,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        opportunities: result.opportunities,
        threats: result.threats,
      },
      strategy_plan: strategyPlan,
      threats: result.competitorScores.map((c) => ({
        competitor: c.name,
        score: c.score,
        shareOfVoice: c.shareOfVoice,
        level: c.score > 70 ? "high" : c.score > 50 ? "medium" : "low",
      })),
      recommendations: result.opportunities.map((opp, i) => ({
        id: i + 1,
        title: opp,
        priority: i === 0 ? "high" : "medium",
      })),
      models_queried: result.modelBreakdown.map((m) => m.model),
      total_queries: result.queriesRun,
      processing_time_ms: result.processingTime,
      status: "completed",
      created_at: result.timestamp,
    }

    const { error: saveError } = await supabase.from("reports").insert(reportData)

    if (saveError) {
      console.error("[v0] Save report FAILED:", saveError.message, saveError.details)
      // Try minimal save
      const { error: minimalError } = await supabase.from("reports").insert({
        user_id: user.id,
        config_id: config.id,
        brand_name: brandName,
        overall_score: result.brandScore,
        status: "completed",
        created_at: result.timestamp,
      })
      if (minimalError) {
        console.error("[v0] Minimal save ALSO FAILED:", minimalError.message)
      } else {
        console.log("[v0] Minimal save succeeded")
      }
    } else {
      console.log("[v0] Report saved successfully")
    }

    // Update last run timestamp
    await supabase.from("tracking_configs").update({ last_run_at: new Date().toISOString() }).eq("id", config.id)

    const response = {
      success: true,
      analysisId: result.id,
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

    console.log("[v0] Returning success response - brandScore:", response.brandScore)
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
