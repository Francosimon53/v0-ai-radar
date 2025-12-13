"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Loader2,
  ChevronRight,
  AlertCircle,
  BarChart3,
  Users,
  Cpu,
  Sparkles,
  RefreshCw,
  Download,
  ExternalLink,
  CheckCircle,
  XCircle,
  Lightbulb,
  ShieldAlert,
  Eye,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { runBrandAnalysis } from "@/lib/analysis/run-brand-analysis"

type ReportItem = {
  id: string
  brandName: string
  configName?: string
  createdAt: string
  status: "completed" | "processing" | "failed"
  overallScore: number | null
  sentiment: string
  summary: string
  shareOfVoice: number
  modelsQueried: string[]
  strengths?: string[]
  weaknesses?: string[]
  opportunities?: string[]
  threats?: string[]
}

function mapApiToReportItem(apiReport: any): ReportItem {
  return {
    id: apiReport.id,
    brandName: apiReport.brand || "Unknown Brand",
    configName: apiReport.configName,
    createdAt: apiReport.created_at || apiReport.date,
    status: apiReport.status || "completed",
    overallScore: apiReport.score ?? null,
    sentiment: apiReport.sentiment || "neutral",
    summary: apiReport.summary || "",
    shareOfVoice: apiReport.shareOfVoice || 0,
    modelsQueried: apiReport.modelsQueried || [],
    strengths: apiReport.strengths || [],
    weaknesses: apiReport.weaknesses || [],
    opportunities: apiReport.opportunities || [],
    threats: apiReport.threats || [],
  }
}

export default function ReportsClient() {
  const router = useRouter()
  const [reports, setReports] = useState<ReportItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  const sortedReports = useMemo(() => {
    return [...reports].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [reports])

  const selectedReport = useMemo(() => {
    if (!selectedReportId && sortedReports.length > 0) {
      return sortedReports[0]
    }
    return sortedReports.find((r) => r.id === selectedReportId) || null
  }, [sortedReports, selectedReportId])

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/reports")
      if (!response.ok) {
        throw new Error("Failed to load reports")
      }
      const data = await response.json()
      const mapped = (data.reports || []).map(mapApiToReportItem)
      setReports(mapped)
      if (mapped.length > 0) {
        setSelectedReportId(mapped[0].id)
      }
    } catch (err) {
      console.error("Failed to load reports:", err)
      setError("We couldn't load your reports. Please try again in a moment.")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    if (status === "completed") {
      return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Completed</Badge>
    }
    if (status === "processing") {
      return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Processing</Badge>
    }
    return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Failed</Badge>
  }

  async function handleRunFirstAnalysis() {
    if (isRunningAnalysis) return

    setAnalysisError(null)
    setIsRunningAnalysis(true)

    try {
      const result = await runBrandAnalysis()

      // Navigate to the new report
      router.push(`/dashboard/reports/${result.analysisId}`)
    } catch (error) {
      console.error("Failed to run analysis from Reports page:", error)
      setAnalysisError(error instanceof Error ? error.message : "Analysis failed. Please try again.")
      setIsRunningAnalysis(false)
    }
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] mt-8">
        <div className="space-y-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <div className="h-6 w-40 bg-zinc-800 rounded animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 bg-zinc-800/50 rounded-lg animate-pulse">
                  <div className="h-5 w-32 bg-zinc-700 rounded mb-2" />
                  <div className="h-3 w-24 bg-zinc-700/50 rounded" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            <p className="text-zinc-400 text-sm">Loading reports...</p>
          </div>
        </div>
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-lg w-full border-zinc-700 bg-gradient-to-b from-zinc-900 to-zinc-900/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 opacity-50 blur-xl" />
          <CardContent className="relative p-8 flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">No AI reports yet</h2>
            <p className="text-zinc-400 mb-6 leading-relaxed">
              Run your first AI brand analysis to generate executive-ready reports you can share with clients or
              stakeholders.
            </p>
            <ul className="text-left text-zinc-400 space-y-2 mb-8 w-full max-w-sm">
              <li className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                <span>AI SWOT of strengths, weaknesses, opportunities, and threats.</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                <span>Competitor ranking and share of voice vs your key rivals.</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                <span>90 / 30 / 7-day action plan for your next campaigns.</span>
              </li>
            </ul>
            {analysisError && (
              <div className="w-full mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400">{analysisError}</p>
              </div>
            )}
            <div className="flex flex-col items-center gap-3 w-full">
              <Button
                onClick={handleRunFirstAnalysis}
                disabled={isRunningAnalysis}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
              >
                {isRunningAnalysis ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running analysis...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Run first analysis
                  </>
                )}
              </Button>
              <Button
                onClick={() => router.push("/dashboard/reports/sample")}
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-white"
                disabled={isRunningAnalysis}
              >
                <Eye className="mr-2 h-4 w-4" />
                Preview sample VIP report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] mt-8">
      {/* Left column - Report list */}
      <Card className="bg-zinc-900 border-zinc-800 h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-white">AI Brand Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-400">{error}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadReports}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          )}

          {sortedReports.map((report) => (
            <div
              key={report.id}
              onClick={() => setSelectedReportId(report.id)}
              data-active={selectedReport?.id === report.id}
              className="rounded-lg px-3 py-3 cursor-pointer hover:bg-zinc-900/60 data-[active=true]:bg-zinc-800 border border-transparent data-[active=true]:border-zinc-700 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{report.brandName}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{formatDate(report.createdAt)}</p>
                </div>
                {report.overallScore !== null && (
                  <Badge variant="secondary" className="bg-zinc-700 text-zinc-200 ml-2 shrink-0">
                    {report.overallScore}/100
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Right column - Report detail */}
      <div className="space-y-4">
        {!selectedReport ? (
          <Card className="bg-zinc-900 border-zinc-800 min-h-[400px] flex items-center justify-center">
            <CardContent className="text-center p-8">
              <FileText className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400">
                Select a report on the left to view the AI executive summary, SWOT insights, and next actions.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Header Card */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">
                      AI visibility report for {selectedReport.brandName}
                    </h2>
                    <p className="text-sm text-zinc-400">Generated on {formatDate(selectedReport.createdAt)}</p>
                  </div>
                  {getStatusBadge(selectedReport.status)}
                </div>
              </CardContent>
            </Card>

            {/* Top Metrics Row */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-400 uppercase tracking-wide">AI Brand Score</p>
                      <p className="text-xl font-bold text-white">
                        {selectedReport.overallScore !== null ? `${selectedReport.overallScore}/100` : "—"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-400 uppercase tracking-wide">Share of Voice</p>
                      <p className="text-xl font-bold text-white">
                        {selectedReport.shareOfVoice ? `${selectedReport.shareOfVoice}%` : "—"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Cpu className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-400 uppercase tracking-wide">Competitors Scanned</p>
                      <p className="text-xl font-bold text-white">{selectedReport.modelsQueried?.length || "—"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Executive Summary */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-white">Executive summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-300 leading-relaxed">
                  {selectedReport.summary ||
                    "This is a placeholder executive summary. Once the first real report is generated, your client will see a concise overview of AI strengths, risks, and next actions here."}
                </p>
              </CardContent>
            </Card>

            {/* SWOT Preview */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-400 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedReport.strengths && selectedReport.strengths.length > 0 ? (
                    <ul className="text-sm text-zinc-300 space-y-1">
                      {selectedReport.strengths.slice(0, 3).map((s, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-zinc-500 italic">Will appear after your first full AI scan.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-yellow-400 flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Weaknesses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedReport.weaknesses && selectedReport.weaknesses.length > 0 ? (
                    <ul className="text-sm text-zinc-300 space-y-1">
                      {selectedReport.weaknesses.slice(0, 3).map((w, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-yellow-500 mt-1">•</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-zinc-500 italic">Will appear after your first full AI scan.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-400 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedReport.opportunities && selectedReport.opportunities.length > 0 ? (
                    <ul className="text-sm text-zinc-300 space-y-1">
                      {selectedReport.opportunities.slice(0, 3).map((o, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{o}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-zinc-500 italic">Will appear after your first full AI scan.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-red-400 flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4" />
                    Threats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedReport.threats && selectedReport.threats.length > 0 ? (
                    <ul className="text-sm text-zinc-300 space-y-1">
                      {selectedReport.threats.slice(0, 3).map((t, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-red-500 mt-1">•</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-zinc-500 italic">Will appear after your first full AI scan.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* CTA Row */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-zinc-400">Ready for clients</p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                    <Button
                      onClick={() => router.push(`/dashboard/reports/${selectedReport.id}`)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open full report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
