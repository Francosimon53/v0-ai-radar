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

    // Get user's tracking config
    const { data: config } = await supabase
      .from("tracking_configs")
      .select("id, primary_brand")
      .eq("user_id", user.id)
      .limit(1)
      .single()

    if (!config) {
      return NextResponse.json({ reports: [], brands: [], configId: null })
    }

    // Get all reports for this config
    const { data: reports, error } = await supabase
      .from("reports")
      .select("*")
      .eq("config_id", config.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching reports:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const transformedReports = (reports || []).map((report: any) => {
      const narrativeAnalysis = report.narrative_analysis || {}
      const dimensionalScores = report.dimensional_scores || {}
      const shareOfVoice = report.share_of_voice || {}

      return {
        id: report.id,
        date: report.created_at,
        created_at: report.created_at,
        brand: report.brand_name || config.primary_brand || "Unknown",
        score: report.overall_score || 0,
        previousScore: report.previous_score,
        scoreChange: report.score_change,
        shareOfVoice: typeof shareOfVoice === "object" ? shareOfVoice.brand || 0 : shareOfVoice,
        sentiment: dimensionalScores.sentiment || "neutral",
        strengths: narrativeAnalysis.strengths || [],
        weaknesses: narrativeAnalysis.weaknesses || [],
        opportunities: narrativeAnalysis.opportunities || [],
        threats: narrativeAnalysis.threats || [],
        summary: narrativeAnalysis.summary || "",
        modelBreakdown: dimensionalScores.modelBreakdown || [],
        competitorScores: report.threats || [],
        recommendations: report.recommendations || [],
        modelsQueried: report.models_queried || [],
        processingTime: report.processing_time_ms,
        status: report.status || "completed",
      }
    })

    const brands = [...new Set(transformedReports.map((r: any) => r.brand).filter(Boolean))]

    return NextResponse.json({
      reports: transformedReports,
      brands,
      configId: config.id,
    })
  } catch (error) {
    console.error("Reports API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get("id")

    if (!reportId) {
      return NextResponse.json({ error: "Report ID required" }, { status: 400 })
    }

    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error: deleteError } = await supabase.from("reports").delete().eq("id", reportId).eq("user_id", user.id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete report error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
