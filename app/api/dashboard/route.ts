import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get tracking config
    const { data: config, error: configError } = await supabase
      .from("tracking_configs")
      .select("*")
      .eq("user_id", user.id)
      .limit(1)
      .single()

    if (configError && configError.code !== "PGRST116") {
      console.error("Config error:", configError)
    }

    // If no config exists, return empty state
    if (!config) {
      return NextResponse.json({
        hasConfig: false,
        brand: null,
        latestReport: null,
        latestAnalysis: null,
        recentAlerts: [],
        analysisHistory: [],
        competitors: [],
        configId: null,
        metrics: {
          questionsTracked: 0,
          competitorsCount: 0,
          analysesRun: 0,
          activeAlerts: 0,
        },
      })
    }

    const brandName = config.primary_brand || config.name || "Unknown"
    const competitors = config.competitors || []

    // Get latest report
    const { data: latestReport } = await supabase
      .from("reports")
      .select("*")
      .eq("config_id", config.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    // Get recent alerts
    const { data: recentAlerts } = await supabase
      .from("alerts")
      .select("*")
      .eq("config_id", config.id)
      .order("created_at", { ascending: false })
      .limit(5)

    // Get analysis history from reports table
    const { data: analysisHistory } = await supabase
      .from("reports")
      .select("id, created_at, overall_score, share_of_voice, dimensional_scores, threats")
      .eq("config_id", config.id)
      .order("created_at", { ascending: true })
      .limit(30)

    // Get unread alerts count
    const { count: activeAlertsCount } = await supabase
      .from("alerts")
      .select("*", { count: "exact", head: true })
      .eq("config_id", config.id)
      .eq("is_read", false)

    // Get analyses count this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: analysesThisMonth } = await supabase
      .from("reports")
      .select("*", { count: "exact", head: true })
      .eq("config_id", config.id)
      .gte("created_at", startOfMonth.toISOString())

    // Extract data from latest report
    const currentScore = latestReport?.overall_score || 0
    const shareOfVoiceData = latestReport?.share_of_voice || {}
    const shareOfVoice = typeof shareOfVoiceData === "object" ? shareOfVoiceData.brand || 0 : shareOfVoiceData
    const dimensionalScores = latestReport?.dimensional_scores || {}
    const sentiment = dimensionalScores.sentiment || "neutral"

    // Calculate previous score for trend
    const previousReport =
      analysisHistory && analysisHistory.length > 1 ? analysisHistory[analysisHistory.length - 2] : null
    const previousScore = previousReport?.overall_score || null

    // Calculate competitor gap from threats data
    const threatData = latestReport?.threats || []
    const topCompetitorScore = threatData.length > 0 ? Math.max(...threatData.map((t: any) => t.score || 0)) : 0
    const competitorGap = currentScore - topCompetitorScore

    // Calculate rank
    const allScores = [currentScore, ...threatData.map((t: any) => t.score || 0)].sort((a, b) => b - a)
    const rank = allScores.indexOf(currentScore) + 1

    // Transform analysis history for charts
    const transformedHistory = (analysisHistory || []).map((report: any) => ({
      id: report.id,
      created_at: report.created_at,
      score: report.overall_score || 0,
      share_of_voice:
        typeof report.share_of_voice === "object" ? report.share_of_voice.brand || 0 : report.share_of_voice,
      sentiment: report.dimensional_scores?.sentiment || "neutral",
      competitor_scores: report.threats || [],
    }))

    const latestAnalysis = latestReport
      ? {
          summary: latestReport.narrative_analysis?.summary || "",
          strengths: latestReport.narrative_analysis?.strengths || [],
          weaknesses: latestReport.narrative_analysis?.weaknesses || [],
          opportunities: latestReport.narrative_analysis?.opportunities || [],
          threats: latestReport.narrative_analysis?.threats || [],
          competitorScores: (latestReport.threats || []).map((t: any) => ({
            name: t.competitor || t.name || "Unknown",
            score: t.score || 0,
            shareOfVoice: t.shareOfVoice || 0,
          })),
          modelBreakdown: (dimensionalScores.modelBreakdown || []).map((m: any) => ({
            model: m.model || "Unknown",
            score: m.score || 0,
            sentiment: m.sentiment || "neutral",
          })),
        }
      : null

    return NextResponse.json({
      hasConfig: true,
      brand: {
        name: brandName,
        score: currentScore,
        previousScore,
        trend: previousScore ? currentScore - previousScore : 0,
        rank,
        totalCompetitors: competitors.length + 1,
        shareOfVoice,
        competitorGap,
        sentiment,
        nextAnalysis: 0,
        lastUpdated: latestReport?.created_at ? formatTimeAgo(new Date(latestReport.created_at)) : "Never",
      },
      latestReport: latestReport
        ? {
            ...latestReport,
            score: latestReport.overall_score,
            brand: latestReport.brand_name,
          }
        : null,
      latestAnalysis,
      recentAlerts: recentAlerts || [],
      analysisHistory: transformedHistory,
      competitors,
      configId: config.id,
      metrics: {
        questionsTracked: 10,
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
