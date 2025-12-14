"use client"

import VIPReportLayout, { type VIPReportData } from "@/components/vip-report-layout"

interface ReportData {
  id: string
  createdAt: string
  brandName: string
  overallScore: number
  previousScore?: number | null
  sentiment: "positive" | "neutral" | "negative"
  summary: string
  strengths?: string[]
  weaknesses?: string[]
  opportunities?: string[]
  threats?: string[]
  competitorScores?: {
    name: string
    score: number
    shareOfVoice?: number | null
  }[]
  modelBreakdown?: {
    model: string
    score: number
    sentiment: "positive" | "neutral" | "negative"
  }[]
  keyPhrases?: string[]
  recommendations?: {
    id: number
    title: string
    priority: "high" | "medium" | "low"
  }[]
}

export default function ReportDetailClient({ report }: { report: ReportData }) {
  // Transform to VIPReportData shape
  const vipReport: VIPReportData = {
    id: report.id,
    brandName: report.brandName,
    createdAt: report.createdAt,
    overallScore: report.overallScore,
    previousScore: report.previousScore,
    shareOfVoice: null, // Will be calculated from competitor data if available
    sentiment: report.sentiment,
    summary: report.summary,
    strengths: report.strengths,
    weaknesses: report.weaknesses,
    opportunities: report.opportunities,
    threats: report.threats,
    competitorScores: report.competitorScores,
    modelBreakdown: report.modelBreakdown,
    keyPhrases: report.keyPhrases,
    recommendations: report.recommendations,
  }

  return <VIPReportLayout report={vipReport} isPreview={false} />
}
