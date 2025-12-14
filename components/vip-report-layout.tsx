"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Download,
  Copy,
  Share2,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Target,
  Zap,
} from "lucide-react"
import { useRouter } from "next/navigation"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface VIPReportData {
  id?: string
  brandName: string
  industry?: string
  createdAt: string
  overallScore: number
  previousScore?: number | null
  shareOfVoice?: number | null
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
    sentiment?: "positive" | "neutral" | "negative"
  }[]
  keyPhrases?: string[]
  recommendations?: {
    id?: number
    title: string
    priority: "high" | "medium" | "low"
  }[]
  // 90/30/7-day action plan (optional, used in sample)
  actionPlan90_30_7?: {
    ninetyDays: string[]
    thirtyDays: string[]
    sevenDays: string[]
  }
}

interface VIPReportLayoutProps {
  report: VIPReportData
  isPreview?: boolean
  previewBadgeText?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function VIPReportLayout({
  report,
  isPreview = false,
  previewBadgeText = "Preview mode",
}: VIPReportLayoutProps) {
  const router = useRouter()

  // Helpers
  const formattedDate = new Date(report.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      case "negative":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
    }
  }

  const scoreDelta = report.previousScore ? report.overallScore - report.previousScore : null

  // Models list for footer
  const modelsUsed =
    report.modelBreakdown && report.modelBreakdown.length > 0
      ? report.modelBreakdown.map((m) => m.model).join(", ")
      : "ChatGPT, Claude"

  // Action handlers
  const handleDownloadPdf = () => {
    window.print()
  }

  const handleCopyInsights = () => {
    const insights = `VIP AI Brand Report – ${report.brandName}

AI Brand Score: ${report.overallScore}/100
Share of Voice: ${report.shareOfVoice ?? "N/A"}%

Executive Summary:
${report.summary}

Key Strengths:
${report.strengths?.map((s) => `• ${s}`).join("\n") || "• No data"}

Next Actions:
${
  report.recommendations
    ?.slice(0, 3)
    .map((r) => `• ${r.title}`)
    .join("\n") || "• No recommendations yet"
}`

    navigator.clipboard.writeText(insights)
    alert("Key insights copied to clipboard!")
  }

  const handleShare = () => {
    alert("Client sharing will be available soon.")
  }

  // Derive 90/30/7 action plan from recommendations if not provided
  const actionPlan = report.actionPlan90_30_7 || {
    ninetyDays: report.recommendations?.filter((r) => r.priority === "low").map((r) => r.title) || [],
    thirtyDays: report.recommendations?.filter((r) => r.priority === "medium").map((r) => r.title) || [],
    sevenDays: report.recommendations?.filter((r) => r.priority === "high").map((r) => r.title) || [],
  }

  return (
    <div className="ai-report-print-area">
      <div className="px-6 py-8 space-y-8 max-w-6xl mx-auto">
        {/* ─────────────────────────────────────────────────────────────────────
            Section 1: Header / Hero
        ───────────────────────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white print:text-black">
                  VIP AI Brand Report
                </h1>
                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 print:bg-blue-100 print:text-blue-700">
                  AI visibility snapshot
                </Badge>
                {isPreview && (
                  <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 print:hidden">
                    {previewBadgeText}
                  </Badge>
                )}
              </div>
              <p className="text-zinc-400 text-sm md:text-base">
                <span className="font-semibold text-white">{report.brandName}</span>
                {report.industry && <span className="text-zinc-500"> · {report.industry}</span>}
                <span className="text-zinc-500"> · {formattedDate}</span>
              </p>
              <p className="text-zinc-500 text-sm max-w-2xl leading-relaxed">
                High-level summary of how AI assistants are currently ranking, describing, and recommending this brand
                versus its main competitors.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/reports")}
              className="gap-2 shrink-0 print:hidden"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Reports
            </Button>
          </div>

          {/* Action bar */}
          <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-4 print:hidden">
            <Button onClick={handleDownloadPdf} className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <Button
              variant="outline"
              onClick={handleCopyInsights}
              className="gap-2 border-zinc-700 hover:bg-zinc-800 bg-transparent"
            >
              <Copy className="h-4 w-4" />
              Copy insights
            </Button>
            <Button variant="ghost" onClick={handleShare} className="gap-2 text-zinc-400 hover:text-white">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────
            Section 2: Top Metrics Row (4 KPI cards)
        ───────────────────────────────────────────────────────────────────── */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {/* Card 1: AI Brand Score */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-zinc-400 uppercase tracking-wide">AI Brand Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white">
                {report.overallScore}
                <span className="text-lg text-zinc-500 font-normal"> / 100</span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">Aggregate score across all AI assistants.</p>
            </CardContent>
          </Card>

          {/* Card 2: Share of Voice */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-zinc-400 uppercase tracking-wide">Share of Voice</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white">
                {report.shareOfVoice ?? "N/A"}
                {report.shareOfVoice !== null && report.shareOfVoice !== undefined && (
                  <span className="text-lg text-zinc-500 font-normal">%</span>
                )}
              </div>
              <p className="text-xs text-zinc-500 mt-1">Share of AI recommendations vs competitors.</p>
            </CardContent>
          </Card>

          {/* Card 3: Models Queried */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-zinc-400 uppercase tracking-wide">Models Queried</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white">{report.modelBreakdown?.length || 2}</div>
              <p className="text-xs text-zinc-500 mt-1 truncate" title={modelsUsed}>
                {modelsUsed}
              </p>
            </CardContent>
          </Card>

          {/* Card 4: Trend */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-zinc-400 uppercase tracking-wide">Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {scoreDelta !== null ? (
                <>
                  <div
                    className={`text-4xl font-bold flex items-center gap-2 ${
                      scoreDelta >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {scoreDelta >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                    {scoreDelta >= 0 ? "+" : ""}
                    {scoreDelta}
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">vs previous: {report.previousScore}/100</p>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-zinc-500">—</div>
                  <p className="text-xs text-zinc-500 mt-1">First analysis – no trend yet.</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────
            Section 3: Executive Summary
        ───────────────────────────────────────────────────────────────────── */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              Executive Summary
              <Badge className={getSentimentColor(report.sentiment)} variant="outline">
                {report.sentiment}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-zinc-300 leading-relaxed">{report.summary}</p>

            {/* Optional quick bullets */}
            <div className="grid gap-4 md:grid-cols-3 pt-4 border-t border-zinc-800">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-green-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  What&apos;s working
                </h4>
                <p className="text-sm text-zinc-400">
                  {report.strengths?.[0] || "Strong brand recall in AI recommendations."}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-yellow-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Main risks
                </h4>
                <p className="text-sm text-zinc-400">
                  {report.threats?.[0] || "Competitor visibility growing in key segments."}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Where to focus
                </h4>
                <p className="text-sm text-zinc-400">
                  {report.opportunities?.[0] || "Expand AI-ready content for top use cases."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─────────────────────────────────────────────────────────────────────
            Section 4: SWOT Snapshot (2x2 grid)
        ───────────────────────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">AI SWOT Snapshot</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Strengths */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-green-400">Strengths</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {report.strengths && report.strengths.length > 0 ? (
                  <ul className="space-y-2 text-sm text-zinc-300">
                    {report.strengths.slice(0, 5).map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-zinc-500 italic">No data available yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Weaknesses */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-yellow-500" />
                  <span className="text-yellow-400">Weaknesses</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {report.weaknesses && report.weaknesses.length > 0 ? (
                  <ul className="space-y-2 text-sm text-zinc-300">
                    {report.weaknesses.slice(0, 5).map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-yellow-500 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-zinc-500 italic">No data available yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Opportunities */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-blue-400">Opportunities</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {report.opportunities && report.opportunities.length > 0 ? (
                  <ul className="space-y-2 text-sm text-zinc-300">
                    {report.opportunities.slice(0, 5).map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-zinc-500 italic">No data available yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Threats */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-red-400">Threats</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {report.threats && report.threats.length > 0 ? (
                  <ul className="space-y-2 text-sm text-zinc-300">
                    {report.threats.slice(0, 5).map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-zinc-500 italic">No data available yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────
            Section 5: Competitor Radar
        ───────────────────────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-white">Competitor Radar</h2>
            <p className="text-sm text-zinc-500">
              How your AI Brand Score and Share of Voice compare against tracked competitors.
            </p>
          </div>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6">
              {report.competitorScores && report.competitorScores.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800 text-left text-zinc-400">
                        <th className="pb-3 font-medium">Competitor</th>
                        <th className="pb-3 font-medium">AI Score</th>
                        <th className="pb-3 font-medium">Share of Voice</th>
                        <th className="pb-3 font-medium">Position</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Your brand row first */}
                      <tr className="border-b border-zinc-800/50 bg-blue-500/5">
                        <td className="py-3 flex items-center gap-2">
                          <span className="font-semibold text-white">{report.brandName}</span>
                          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">Your brand</Badge>
                        </td>
                        <td className="py-3 text-white font-semibold">{report.overallScore}/100</td>
                        <td className="py-3 text-white">
                          {report.shareOfVoice !== null && report.shareOfVoice !== undefined
                            ? `${report.shareOfVoice}%`
                            : "N/A"}
                        </td>
                        <td className="py-3 text-white">—</td>
                      </tr>
                      {/* Competitor rows */}
                      {[...report.competitorScores]
                        .sort((a, b) => b.score - a.score)
                        .map((comp, idx) => (
                          <tr key={idx} className="border-b border-zinc-800/50">
                            <td className="py-3 text-zinc-300">{comp.name}</td>
                            <td className="py-3 text-zinc-300">{comp.score}/100</td>
                            <td className="py-3 text-zinc-300">
                              {comp.shareOfVoice !== null && comp.shareOfVoice !== undefined
                                ? `${comp.shareOfVoice}%`
                                : "N/A"}
                            </td>
                            <td className="py-3 text-zinc-400">#{idx + 1}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-zinc-500 text-center py-8">
                  Once you add competitors and run an analysis, their AI visibility will appear here.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────
            Section 6: 90/30/7-day Playbook
        ───────────────────────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              90 / 30 / 7-day Playbook
            </h2>
            <p className="text-sm text-zinc-500">Prioritized actions to strengthen your AI brand presence.</p>
          </div>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6">
              {actionPlan.ninetyDays.length > 0 ||
              actionPlan.thirtyDays.length > 0 ||
              actionPlan.sevenDays.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-3">
                  {/* 90 days */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-white border-b border-zinc-800 pb-2">Next 90 days</h3>
                    {actionPlan.ninetyDays.length > 0 ? (
                      <ul className="space-y-2 text-sm text-zinc-300">
                        {actionPlan.ninetyDays.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-zinc-500 italic">No strategic items yet.</p>
                    )}
                  </div>

                  {/* 30 days */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-white border-b border-zinc-800 pb-2">Next 30 days</h3>
                    {actionPlan.thirtyDays.length > 0 ? (
                      <ul className="space-y-2 text-sm text-zinc-300">
                        {actionPlan.thirtyDays.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-cyan-500 mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-zinc-500 italic">No tactical items yet.</p>
                    )}
                  </div>

                  {/* 7 days */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-white border-b border-zinc-800 pb-2">Next 7 days</h3>
                    {actionPlan.sevenDays.length > 0 ? (
                      <ul className="space-y-2 text-sm text-zinc-300">
                        {actionPlan.sevenDays.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-zinc-500 italic">No immediate actions yet.</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-zinc-500 text-center py-8">
                  Your AI action plan will appear here after the next analysis.
                </p>
              )}
              <p className="text-xs text-zinc-500 italic pt-4 border-t border-zinc-800 mt-6">
                Tip: Use &quot;Copy insights&quot; at the top of this page to paste these bullets into your own slides
                or client decks.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────
            Section 7: Key Phrases (optional)
        ───────────────────────────────────────────────────────────────────── */}
        {report.keyPhrases && report.keyPhrases.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Key Phrases in AI Outputs</h2>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2">
                  {report.keyPhrases.map((phrase, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="bg-zinc-800/50 text-zinc-300 border-zinc-700 px-3 py-1"
                    >
                      {phrase}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────────
            Footer / Metadata
        ───────────────────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-zinc-800 pt-6 text-xs text-zinc-500">
          <div className="space-y-1">
            <p>
              Generated by AI Radar using {modelsUsed} on {formattedDate}.
            </p>
            <p>
              This report is based on AI-generated analysis and should be combined with your internal performance data.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="gap-2 border-zinc-700 hover:bg-zinc-800 bg-transparent shrink-0 print:hidden"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
