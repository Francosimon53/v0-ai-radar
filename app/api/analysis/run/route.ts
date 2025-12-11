import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { runSimpleAnalysis } from "@/lib/analysis/simple-engine"
import { buildStrategyPlan } from "@/lib/analysis/strategy-plan"

export const maxDuration = 60

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

    // Fetch tracking config - try specific ID first, then fallback to any config for user
    let config = null

    if (configId && configId !== "current") {
      const { data } = await supabase
        .from("tracking_configs")
        .select("*")
        .eq("id", configId)
        .eq("user_id", user.id)
        .single()
      config = data
    }

    if (!config) {
      const { data } = await supabase
        .from("tracking_configs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()
      config = data
    }

    if (!config) {
      return NextResponse.json({ error: "No tracking config found. Please complete setup first." }, { status: 404 })
    }

    const brandName = config.primary_brand || config.name || "Unknown Brand"
    const competitors = config.competitors || []
    const industry = config.industry || "general"

    console.log(`[Analysis] Running analysis for ${brandName} with ${competitors.length} competitors`)

    // Run the simplified analysis
    const result = await runSimpleAnalysis(brandName, competitors, industry)

    console.log(`[Analysis] Building strategic plan for ${brandName}...`)
    let strategyPlan = null
    try {
      const trackingConfig = {
        brand: brandName,
        competitors,
        industry,
        userId: user.id,
      }
      strategyPlan = await buildStrategyPlan(result, trackingConfig, undefined)
      console.log(`[Analysis] Strategy plan built successfully`)
    } catch (strategyError) {
      console.error(`[Analysis] Strategy plan generation failed (non-fatal):`, strategyError)
      // Non-fatal - continue without strategy plan
    }

    // Save to database with columns that match the actual schema
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
      console.error("[Analysis] Error saving report:", saveError)
      // Try with minimal columns if full insert fails
      const { error: minimalError } = await supabase.from("reports").insert({
        user_id: user.id,
        config_id: config.id,
        brand_name: brandName,
        overall_score: result.brandScore,
        status: "completed",
        created_at: result.timestamp,
      })

      if (minimalError) {
        console.error("[Analysis] Minimal save also failed:", minimalError)
      }
    }

    // Update last run timestamp
    await supabase.from("tracking_configs").update({ last_run_at: new Date().toISOString() }).eq("id", config.id)

    return NextResponse.json({
      success: true,
      analysisId: result.id,
      brandScore: result.brandScore,
      shareOfVoice: result.shareOfVoice,
      sentiment: result.sentiment,
      summary: result.summary,
      processingTime: Date.now() - startTime,
      result,
      // Strategy plan summary for quick access
      strategyPlan: strategyPlan
        ? {
            northStarGoal: strategyPlan.northStarGoal,
            quickWins: strategyPlan.plan90_30_7?.quickWins || [],
            backlogCount: strategyPlan.backlog?.length || 0,
          }
        : null,
    })
  } catch (error) {
    console.error("[Analysis] Error:", error)
    return NextResponse.json(
      {
        error: "Analysis failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
