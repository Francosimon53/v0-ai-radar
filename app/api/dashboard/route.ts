import { createUserClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createUserClient()

    // Get current user (optional - skip auth for now)
    // const { data: { user } } = await supabase.auth.getUser()
    // if (!user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    // Get the first tracking config (for demo purposes without auth)
    const { data: config, error: configError } = await supabase.from("tracking_configs").select("*").limit(1).single()

    if (configError && configError.code !== "PGRST116") {
      console.error("Config error:", configError)
    }

    // If no config exists, return empty state
    if (!config) {
      return NextResponse.json({
        hasConfig: false,
        brand: null,
        latestReport: null,
        recentAlerts: [],
        analysisHistory: [],
        metrics: {
          questionsTracked: 0,
          competitorsCount: 0,
          analysesRun: 0,
          activeAlerts: 0,
        },
      })
    }

    // Get latest report for this brand
    const { data: latestReport } = await supabase
      .from("reports")
      .select("*")
      .eq("tracking_config_id", config.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    // Get recent alerts
    const { data: recentAlerts } = await supabase
      .from("alerts")
      .select("*")
      .eq("tracking_config_id", config.id)
      .order("created_at", { ascending: false })
      .limit(5)

    // Get analysis history for trend chart
    const { data: analysisHistory } = await supabase
      .from("analysis_results")
      .select("*")
      .eq("tracking_config_id", config.id)
      .order("created_at", { ascending: true })
      .limit(30)

    // Get unread alerts count
    const { count: activeAlertsCount } = await supabase
      .from("alerts")
      .select("*", { count: "exact", head: true })
      .eq("tracking_config_id", config.id)
      .eq("is_read", false)

    // Get analyses count this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: analysesThisMonth } = await supabase
      .from("reports")
      .select("*", { count: "exact", head: true })
      .eq("tracking_config_id", config.id)
      .gte("created_at", startOfMonth.toISOString())

    // Calculate metrics
    const competitors = config.competitors || []
    const previousScore =
      analysisHistory && analysisHistory.length > 1 ? analysisHistory[analysisHistory.length - 2]?.score : null

    // Calculate next analysis time
    const lastAnalysis = latestReport?.created_at ? new Date(latestReport.created_at) : null
    const frequencyHours =
      {
        daily: 24,
        weekly: 168,
        monthly: 720,
      }[config.frequency as string] || 24

    const nextAnalysisTime = lastAnalysis ? new Date(lastAnalysis.getTime() + frequencyHours * 60 * 60 * 1000) : null
    const hoursUntilNext = nextAnalysisTime
      ? Math.max(0, Math.round((nextAnalysisTime.getTime() - Date.now()) / (1000 * 60 * 60)))
      : 0

    return NextResponse.json({
      hasConfig: true,
      brand: {
        name: config.brand,
        score: latestReport?.overall_score || 0,
        previousScore: previousScore,
        trend: latestReport?.overall_score && previousScore ? latestReport.overall_score - previousScore : 0,
        rank: latestReport?.rank || 1,
        totalCompetitors: competitors.length + 1,
        shareOfVoice: latestReport?.share_of_voice || 0,
        competitorGap: latestReport?.competitor_gap || 0,
        nextAnalysis: hoursUntilNext,
        lastUpdated: latestReport?.created_at ? formatTimeAgo(new Date(latestReport.created_at)) : "Never",
      },
      latestReport,
      recentAlerts: recentAlerts || [],
      analysisHistory: analysisHistory || [],
      competitors: competitors,
      configId: config.id,
      metrics: {
        questionsTracked: 100, // Fixed - we use 100 prompts
        competitorsCount: competitors.length,
        analysesRun: analysesThisMonth || 0,
        activeAlerts: activeAlertsCount || 0,
      },
    })
  } catch (error) {
    console.error("Dashboard API error:", error)
    return NextResponse.json({ error: "Failed to load dashboard data" }, { status: 500 })
  }
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (seconds < 60) return "Just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
  return date.toLocaleDateString()
}
