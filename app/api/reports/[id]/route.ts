import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: report, error } = await supabase
      .from("reports")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single()

    if (error || !report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    const narrativeAnalysis = report.narrative_analysis || {}
    const dimensionalScores = report.dimensional_scores || {}
    const shareOfVoice = report.share_of_voice || {}

    const transformedReport = {
      id: report.id,
      createdAt: report.created_at,
      brandName: report.brand_name || "Unknown",
      overallScore: report.overall_score || 0,
      previousScore: report.previous_score,
      sentiment: dimensionalScores.sentiment || "neutral",
      summary: narrativeAnalysis.summary || "No summary available.",
      strengths: narrativeAnalysis.strengths || [],
      weaknesses: narrativeAnalysis.weaknesses || [],
      opportunities: narrativeAnalysis.opportunities || [],
      threats: narrativeAnalysis.threats || [],
      competitorScores: report.threats || [],
      modelBreakdown: dimensionalScores.modelBreakdown || [],
      keyPhrases: report.key_phrases || [],
      recommendations: report.recommendations || [],
    }

    return NextResponse.json(transformedReport)
  } catch (error) {
    console.error("Report detail API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
