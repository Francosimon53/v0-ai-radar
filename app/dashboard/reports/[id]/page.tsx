import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import ReportDetailClient from "./report-detail-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ReportDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  // Fetch the specific report
  const { data: report, error } = await supabase
    .from("reports")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single()

  if (error || !report) {
    notFound()
  }

  // Transform the report data to match the expected shape
  const narrativeAnalysis = report.narrative_analysis || {}
  const dimensionalScores = report.dimensional_scores || {}
  const shareOfVoice = report.share_of_voice || {}

  const transformedReport = {
    id: report.id,
    createdAt: report.created_at,
    brandName: report.brand_name || "Unknown Brand",
    overallScore: report.overall_score || 0,
    previousScore: report.previous_score,
    sentiment: (dimensionalScores.sentiment || "neutral") as "positive" | "neutral" | "negative",
    summary: narrativeAnalysis.summary || "No summary available.",
    strengths: narrativeAnalysis.strengths || [],
    weaknesses: narrativeAnalysis.weaknesses || [],
    opportunities: narrativeAnalysis.opportunities || [],
    threats: narrativeAnalysis.threats || [],
    competitorScores: report.competitor_scores || [],
    modelBreakdown: dimensionalScores.modelBreakdown || [],
    keyPhrases: narrativeAnalysis.keyPhrases || [],
    recommendations: report.recommendations || [],
  }

  return <ReportDetailClient report={transformedReport} />
}
