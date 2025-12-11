import { type NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { runFullAnalysis } from "@/lib/analysis/engine"
import { generateReport } from "@/lib/report-generator"
import { uploadReport } from "@/lib/storage/reports"
import { getNextRunDate, type TrackingConfigDb } from "@/lib/automation/scheduler"
import type { TrackingConfig } from "@/lib/analysis/types"

// Verify cron secret for security
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.warn("[Cron] CRON_SECRET not configured")
    return false
  }

  return authHeader === `Bearer ${cronSecret}`
}

export async function GET(request: NextRequest) {
  // Verify authorization
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createServiceClient()
  const results = {
    processed: 0,
    successful: 0,
    failed: 0,
    errors: [] as string[],
  }

  try {
    // Fetch all active configs that are due for analysis
    const now = new Date().toISOString()
    const { data: configs, error } = await supabase
      .from("tracking_configs")
      .select("*")
      .eq("is_active", true)
      .lte("next_run_at", now)
      .order("next_run_at", { ascending: true })
      .limit(50) // Process max 50 per run to avoid timeout

    if (error) {
      console.error("[Cron] Error fetching configs:", error)
      return NextResponse.json({ error: "Failed to fetch configs", details: error.message }, { status: 500 })
    }

    if (!configs || configs.length === 0) {
      return NextResponse.json({
        message: "No analyses due",
        ...results,
      })
    }

    console.log(`[Cron] Processing ${configs.length} configs`)

    // Process each config with delay between to respect rate limits
    for (const config of configs as TrackingConfigDb[]) {
      results.processed++

      try {
        await processConfig(supabase, config)
        results.successful++
        console.log(`[Cron] Successfully processed ${config.brand}`)
      } catch (err) {
        results.failed++
        const errorMsg = err instanceof Error ? err.message : "Unknown error"
        results.errors.push(`${config.brand}: ${errorMsg}`)
        console.error(`[Cron] Failed to process ${config.brand}:`, err)
      }

      // 2 second delay between analyses to respect rate limits
      if (results.processed < configs.length) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }

    return NextResponse.json({
      message: `Processed ${results.processed} analyses`,
      ...results,
    })
  } catch (error) {
    console.error("[Cron] Unexpected error:", error)
    return NextResponse.json(
      {
        error: "Cron job failed",
        message: error instanceof Error ? error.message : "Unknown error",
        ...results,
      },
      { status: 500 },
    )
  }
}

async function processConfig(supabase: ReturnType<typeof createServiceClient>, config: TrackingConfigDb) {
  // Prepare tracking config
  const trackingConfig: TrackingConfig = {
    brand: config.brand,
    competitors: config.competitors,
    industry: config.industry,
    userId: config.user_id,
  }

  // Fetch historical data
  const { data: historyData } = await supabase
    .from("analysis_results")
    .select("timestamp, brand_strength_index, share_of_voice")
    .eq("config_id", config.id)
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

  // Run analysis
  const analysisResult = await runFullAnalysis(trackingConfig, historicalData)

  // Generate PDF
  const pdfBuffer = await generateReport(analysisResult, trackingConfig)

  // Upload report
  const reportPath = await uploadReport(pdfBuffer, config.user_id, analysisResult.id)

  // Save to database
  await supabase.from("analysis_results").insert({
    id: analysisResult.id,
    config_id: config.id,
    user_id: config.user_id,
    brand: config.brand,
    timestamp: analysisResult.timestamp,
    brand_strength_index: analysisResult.dimensional.brandStrengthIndex,
    share_of_voice: analysisResult.shareOfVoice[config.brand]?.mentionRate || 0,
    report_path: reportPath,
    full_result: analysisResult,
  })

  // Check for alerts (compare to previous)
  const previousResult = historyData?.[0]
  if (previousResult) {
    await checkAlertConditions(supabase, config, analysisResult, previousResult)
  }

  // Update next run time
  const nextRunAt = getNextRunDate(config.frequency)
  await supabase
    .from("tracking_configs")
    .update({
      last_run_at: new Date().toISOString(),
      next_run_at: nextRunAt.toISOString(),
    })
    .eq("id", config.id)

  // Send email notification if enabled
  await sendNotificationIfEnabled(supabase, config, analysisResult)
}

async function checkAlertConditions(
  supabase: ReturnType<typeof createServiceClient>,
  config: TrackingConfigDb,
  current: Awaited<ReturnType<typeof runFullAnalysis>>,
  previous: { brand_strength_index: number; share_of_voice: number },
) {
  // Fetch user's alert settings
  const { data: settings } = await supabase.from("alert_settings").select("*").eq("user_id", config.user_id).single()

  const scoreThreshold = settings?.score_drop_threshold || 5
  const competitorThreshold = settings?.competitor_rise_threshold || 5

  const alerts: Array<{
    user_id: string
    config_id: string
    type: string
    title: string
    message: string
    severity: "high" | "medium" | "low"
    data: Record<string, unknown>
  }> = []

  // Score drop alert
  const scoreDrop = previous.brand_strength_index - current.dimensional.brandStrengthIndex
  if (scoreDrop > scoreThreshold) {
    alerts.push({
      user_id: config.user_id,
      config_id: config.id,
      type: "score_drop",
      title: "Brand Score Dropped",
      message: `Your brand strength dropped ${scoreDrop.toFixed(1)} points`,
      severity: scoreDrop > 10 ? "high" : "medium",
      data: {
        previousScore: previous.brand_strength_index,
        currentScore: current.dimensional.brandStrengthIndex,
        change: scoreDrop,
      },
    })
  }

  // Competitor alerts
  for (const [competitor, threat] of Object.entries(current.threats)) {
    if (threat.threatScore >= 7 && threat.momentum === "gaining") {
      alerts.push({
        user_id: config.user_id,
        config_id: config.id,
        type: "competitor_rise",
        title: `${competitor} Rising`,
        message: `${competitor} is gaining momentum with threat score ${threat.threatScore}/10`,
        severity: threat.threatScore >= 8 ? "high" : "medium",
        data: { competitor, ...threat },
      })
    }
  }

  if (alerts.length > 0) {
    await supabase.from("alerts").insert(alerts)
  }
}

async function sendNotificationIfEnabled(
  supabase: ReturnType<typeof createServiceClient>,
  config: TrackingConfigDb,
  analysis: Awaited<ReturnType<typeof runFullAnalysis>>,
) {
  // Fetch user's notification preferences
  const { data: settings } = await supabase.from("alert_settings").select("*").eq("user_id", config.user_id).single()

  if (!settings?.email_enabled) return

  // Fetch user email
  const { data: profile } = await supabase.from("profiles").select("email").eq("id", config.user_id).single()

  if (!profile?.email) return

  // In production, integrate with email service (Resend, SendGrid, etc.)
  console.log(`[Cron] Would send email to ${profile.email} for ${config.brand} analysis`)
}
