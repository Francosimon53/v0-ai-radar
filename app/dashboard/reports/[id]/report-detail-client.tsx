"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Target } from "lucide-react"
import { useRouter } from "next/navigation"

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
  const router = useRouter()

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

  const getScoreLabel = (score: number) => {
    if (score >= 75) return { label: "Strong", color: "text-green-400" }
    if (score >= 50) return { label: "Moderate", color: "text-yellow-400" }
    return { label: "At Risk", color: "text-red-400" }
  }

  const scoreData = getScoreLabel(report.overallScore)
  const scoreDelta = report.previousScore ? report.overallScore - report.previousScore : null

  // Group recommendations by priority
  const groupedRecs = {
    high: report.recommendations?.filter((r) => r.priority === "high") || [],
    medium: report.recommendations?.filter((r) => r.priority === "medium") || [],
    low: report.recommendations?.filter((r) => r.priority === "low") || [],
  }

  // Sort competitors by score
  const sortedCompetitors = [...(report.competitorScores || [])].sort((a, b) => b.score - a.score)

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100 p-6 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{report.brandName} – AI Brand Report</h1>
          <p className="text-zinc-400 mt-1">Generated on {formattedDate}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge className={getSentimentColor(report.sentiment)} variant="outline">
            {report.sentiment}
          </Badge>
          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20" variant="outline">
            Score {report.overallScore}/100
          </Badge>
          <Button variant="outline" size="sm" disabled className="gap-2 bg-transparent">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/reports")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Reports
          </Button>
        </div>
      </div>

      {/* Section 1: Executive Summary */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-xl">Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-300 leading-relaxed">{report.summary}</p>
          {report.previousScore && (
            <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center gap-2 text-sm">
              <span className="text-zinc-400">Previous score:</span>
              <span className="font-semibold">{report.previousScore}/100</span>
              {scoreDelta !== null && (
                <span className={`flex items-center gap-1 ${scoreDelta >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {scoreDelta >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {scoreDelta >= 0 ? "+" : ""}
                  {scoreDelta} points
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 2: AI Brand Health Snapshot (3-column) */}
      <div>
        <h2 className="text-2xl font-bold mb-4">AI Brand Health Snapshot</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-base">Overall Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{report.overallScore}</div>
              <div className={`text-sm mt-1 ${scoreData.color}`}>{scoreData.label}</div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-base">Sentiment</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={getSentimentColor(report.sentiment)} variant="outline">
                {report.sentiment}
              </Badge>
              <p className="text-sm text-zinc-400 mt-2">
                {report.sentiment === "positive"
                  ? "AI models view your brand favorably."
                  : report.sentiment === "negative"
                    ? "AI models express concerns about your brand."
                    : "AI models show a balanced perspective."}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-base">Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {scoreDelta !== null ? (
                <>
                  <div className={`text-2xl font-bold ${scoreDelta >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {scoreDelta >= 0 ? "+" : ""}
                    {scoreDelta}
                  </div>
                  <p className="text-sm text-zinc-400 mt-1">
                    {scoreDelta >= 0 ? "Improving" : "Declining"} since last report
                  </p>
                </>
              ) : (
                <p className="text-sm text-zinc-400">First measurement – trend will appear after the next analysis.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 3: AI SWOT Snapshot (2x2 grid) */}
      <div>
        <h2 className="text-2xl font-bold mb-4">AI SWOT Snapshot</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strengths */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              {report.strengths && report.strengths.length > 0 ? (
                <ul className="space-y-2 text-sm text-zinc-300">
                  {report.strengths.slice(0, 5).map((item, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-green-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-zinc-500 italic">No items detected yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Weaknesses */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                Weaknesses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {report.weaknesses && report.weaknesses.length > 0 ? (
                <ul className="space-y-2 text-sm text-zinc-300">
                  {report.weaknesses.slice(0, 5).map((item, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-yellow-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-zinc-500 italic">No items detected yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Opportunities */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              {report.opportunities && report.opportunities.length > 0 ? (
                <ul className="space-y-2 text-sm text-zinc-300">
                  {report.opportunities.slice(0, 5).map((item, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-blue-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-zinc-500 italic">No items detected yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Threats */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                Threats
              </CardTitle>
            </CardHeader>
            <CardContent>
              {report.threats && report.threats.length > 0 ? (
                <ul className="space-y-2 text-sm text-zinc-300">
                  {report.threats.slice(0, 5).map((item, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-red-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-zinc-500 italic">No items detected yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 4: Competitor Comparison */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Competitor Comparison</h2>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="pt-6">
            {sortedCompetitors.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800 text-left text-sm text-zinc-400">
                      <th className="pb-3 font-medium">Competitor</th>
                      <th className="pb-3 font-medium">AI Score</th>
                      <th className="pb-3 font-medium">Share of Voice</th>
                      <th className="pb-3 font-medium">Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCompetitors.map((comp, idx) => (
                      <tr key={idx} className="border-b border-zinc-800/50">
                        <td className="py-3 flex items-center gap-2">
                          {comp.name}
                          {idx === 0 && (
                            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">Top</Badge>
                          )}
                        </td>
                        <td className="py-3">{comp.score}/100</td>
                        <td className="py-3">{comp.shareOfVoice !== null ? `${comp.shareOfVoice}%` : "N/A"}</td>
                        <td className="py-3">#{idx + 1}</td>
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

      {/* Section 5: AI Models Breakdown */}
      <div>
        <h2 className="text-2xl font-bold mb-4">AI Models Breakdown</h2>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="pt-6">
            {report.modelBreakdown && report.modelBreakdown.length > 0 ? (
              <div className="space-y-4">
                {report.modelBreakdown.map((model, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{model.model}</span>
                        <Badge className={getSentimentColor(model.sentiment)} variant="outline">
                          {model.sentiment}
                        </Badge>
                      </div>
                      <span className="text-sm font-semibold">{model.score}/100</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                        style={{ width: `${model.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500 text-center py-8">Model breakdown will appear here after analysis.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section 6: Action Plan */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Action Plan</h2>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="pt-6">
            {groupedRecs.high.length > 0 || groupedRecs.medium.length > 0 || groupedRecs.low.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* High Priority */}
                <div>
                  <h3 className="text-sm font-semibold text-red-400 mb-3 uppercase tracking-wide">High Priority</h3>
                  {groupedRecs.high.length > 0 ? (
                    <ul className="space-y-2 text-sm text-zinc-300">
                      {groupedRecs.high.map((rec) => (
                        <li key={rec.id} className="flex gap-2">
                          <span className="text-red-400">•</span>
                          <span>{rec.title}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-zinc-500 italic">No high priority items.</p>
                  )}
                </div>

                {/* Medium Priority */}
                <div>
                  <h3 className="text-sm font-semibold text-yellow-400 mb-3 uppercase tracking-wide">
                    Medium Priority
                  </h3>
                  {groupedRecs.medium.length > 0 ? (
                    <ul className="space-y-2 text-sm text-zinc-300">
                      {groupedRecs.medium.map((rec) => (
                        <li key={rec.id} className="flex gap-2">
                          <span className="text-yellow-400">•</span>
                          <span>{rec.title}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-zinc-500 italic">No medium priority items.</p>
                  )}
                </div>

                {/* Low Priority */}
                <div>
                  <h3 className="text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wide">Low Priority</h3>
                  {groupedRecs.low.length > 0 ? (
                    <ul className="space-y-2 text-sm text-zinc-300">
                      {groupedRecs.low.map((rec) => (
                        <li key={rec.id} className="flex gap-2">
                          <span className="text-blue-400">•</span>
                          <span>{rec.title}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-zinc-500 italic">No low priority items.</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-zinc-500 text-center py-8">
                Your AI action plan will appear here after the next analysis.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section 7: Key Phrases */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Key Phrases Detected in AI Outputs</h2>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="pt-6">
            {report.keyPhrases && report.keyPhrases.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {report.keyPhrases.map((phrase, idx) => (
                  <Badge key={idx} variant="outline" className="bg-zinc-800/50 text-zinc-300 border-zinc-700 px-3 py-1">
                    {phrase}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500 text-center py-8">
                Key phrases will appear here once we have enough AI mentions to analyze.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
