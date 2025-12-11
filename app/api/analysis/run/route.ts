import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { runFullAnalysis } from "@/lib/analysis/engine"
import { generateReport } from "@/lib/report-generator"
import { uploadReport, getReportUrl } from "@/lib/storage/reports"
import { checkRateLimit, recordUsage, getUserPlan } from "@/lib/automation/rate-limiter"
import type { TrackingConfig } from "@/lib/analysis/types"

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Verify authentication
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get request body
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
      return NextResponse.json({ error: "Tracking config not found" }, { status: 404 })
    }

    // Check rate limits based on plan
    const plan = await getUserPlan(user.id)
    const { allowed, remaining, limit } = await checkRateLimit(user.id, "analysis", plan)

    if (!allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `You've used all ${limit} analyses for this month. Upgrade your plan for more.`,
          remaining: 0,
          limit,
        },
        { status: 429 },
      )
    }

    // Prepare tracking config for analysis
    const trackingConfig: TrackingConfig = {
      brand: config.brand,
      competitors: config.competitors,
      industry: config.industry,
      userId: user.id,
    }

    // Fetch historical data for trend analysis
    const { data: historyData } = await supabase
      .from("analysis_results")
      .select("timestamp, brand_strength_index, share_of_voice")
      .eq("config_id", configId)
      .order("timestamp", { ascending: false })
      .limit(30)

    const historicalData =
      historyData && historyData.length > 0
        ? {
            brand: config.brand,
            dataPoints: historyData.map(
              (h: { timestamp: string; brand_strength_index: number; share_of_voice: number }) => ({
                date: h.timestamp,
                brandStrengthIndex: h.brand_strength_index,
                shareOfVoice: h.share_of_voice,
                threatLevel: 0,
              }),
            ),
          }
        : undefined

    // Run the full analysis
    console.log(`[Analysis] Starting analysis for ${config.brand}...`)
    const analysisResult = await runFullAnalysis(trackingConfig, historicalData)

    // Generate PDF report
    console.log(`[Analysis] Generating PDF report...`)
    const pdfBuffer = await generateReport(analysisResult, trackingConfig)

    // Upload to storage
    console.log(`[Analysis] Uploading report to storage...`)
    const reportPath = await uploadReport(pdfBuffer, user.id, analysisResult.id)
    const reportUrl = await getReportUrl(reportPath)

    // Save analysis result to database
    const { error: saveError } = await supabase.from("analysis_results").insert({
      id: analysisResult.id,
      config_id: configId,
      user_id: user.id,
      brand: config.brand,
      timestamp: analysisResult.timestamp,
      brand_strength_index: analysisResult.dimensional.brandStrengthIndex,
      share_of_voice: analysisResult.shareOfVoice[config.brand]?.mentionRate || 0,
      report_path: reportPath,
      full_result: analysisResult,
    })

    if (saveError) {
      console.error("[Analysis] Error saving result:", saveError)
    }

    const { error: reportSaveError } = await supabase.from("reports").insert({
      id: analysisResult.id,
      user_id: user.id,
      config_id: configId,
      brand: config.brand,
      score: analysisResult.dimensional.brandStrengthIndex,
      previous_score: historyData?.[0]?.brand_strength_index || null,
      share_of_voice: analysisResult.shareOfVoice[config.brand]?.mentionRate || 0,
      threats: analysisResult.threats,
      recommendations: analysisResult.synthesis.recommendations,
      strengths: analysisResult.synthesis.strengths,
      executive_summary: analysisResult.synthesis.executiveSummary,
      pdf_url: reportUrl,
      created_at: analysisResult.timestamp,
    })

    if (reportSaveError) {
      console.error("[Analysis] Error saving report:", reportSaveError)
    }

    // Record usage
    await recordUsage(user.id, "analysis")

    // Check for alert conditions
    await checkAndCreateAlerts(supabase, user.id, configId, analysisResult, historyData?.[0])

    // Update tracking config
    await supabase.from("tracking_configs").update({ last_run_at: new Date().toISOString() }).eq("id", configId)

    const processingTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      analysisId: analysisResult.id,
      brandStrengthIndex: analysisResult.dimensional.brandStrengthIndex,
      reportUrl,
      processingTime,
      remaining: remaining - 1,
    })
  } catch (error) {
    console.error("[Analysis] Error:", error)
    return NextResponse.json(
      { error: "Analysis failed", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

async function checkAndCreateAlerts(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  userId: string,
  configId: string,
  current: Awaited<ReturnType<typeof runFullAnalysis>>,
  previous?: { brand_strength_index: number; share_of_voice: number },
) {
  const alerts: Array<{
    user_id: string
    config_id: string
    type: string
    title: string
    message: string
    severity: "high" | "medium" | "low"
    data: Record<string, unknown>
  }> = []

  // Check score drop
  if (previous && previous.brand_strength_index - current.dimensional.brandStrengthIndex > 5) {
    alerts.push({
      user_id: userId,
      config_id: configId,
      type: "score_drop",
      title: "Brand Score Dropped",
      message: `Your brand strength index dropped from ${previous.brand_strength_index} to ${current.dimensional.brandStrengthIndex}`,
      severity: "high",
      data: {
        previousScore: previous.brand_strength_index,
        currentScore: current.dimensional.brandStrengthIndex,
        change: previous.brand_strength_index - current.dimensional.brandStrengthIndex,
      },
    })
  }

  // Check for high threats
  const highThreats = Object.entries(current.threats).filter(([_, t]) => t.threatScore >= 7)
  for (const [competitor, threat] of highThreats) {
    alerts.push({
      user_id: userId,
      config_id: configId,
      type: "competitor_rise",
      title: `${competitor} Gaining Ground`,
      message: `${competitor} has a threat score of ${threat.threatScore}/10 with ${threat.momentum} momentum`,
      severity: threat.threatScore >= 8 ? "high" : "medium",
      data: { competitor, ...threat },
    })
  }

  // Check for milestone
  if (current.dimensional.brandStrengthIndex >= 90) {
    alerts.push({
      user_id: userId,
      config_id: configId,
      type: "milestone",
      title: "Milestone Achieved!",
      message: `Your brand strength index reached ${current.dimensional.brandStrengthIndex}!`,
      severity: "low",
      data: { score: current.dimensional.brandStrengthIndex },
    })
  }

  // Insert alerts
  if (alerts.length > 0) {
    await supabase.from("alerts").insert(alerts)
  }
}
