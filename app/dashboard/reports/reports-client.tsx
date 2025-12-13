"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Calendar,
  Loader2,
  TrendingUp,
  ChevronRight,
  AlertCircle,
  BarChart3,
  Users,
  Cpu,
  Sparkles,
  RefreshCw,
} from "lucide-react"
import { useRouter } from "next/navigation"

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
  }
}

export default function ReportsClient() {
  const router = useRouter()
  const [reports, setReports] = useState<ReportItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null)

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
        setSelectedReport(mapped[0])
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

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <div className="space-y-4">
          <div>
            <div className="h-8 w-48 bg-zinc-800 rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-zinc-800/50 rounded animate-pulse" />
          </div>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 bg-zinc-800/50 rounded-lg animate-pulse">
                  <div className="h-5 w-32 bg-zinc-700 rounded mb-2" />
                  <div className="h-3 w-24 bg-zinc-700/50 rounded" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="flex items-center justify-center min-h-[300px]">
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
            <Button
              onClick={() => router.push("/dashboard")}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Run first analysis
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
      {/* Left column - Report list */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Visibility Reports</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Review your past AI scans, executive summaries, and score changes.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-between">
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
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </div>
        )}

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="space-y-2">
              {reports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedReport?.id === report.id
                      ? "bg-blue-500/10 border-blue-500/50"
                      : "bg-zinc-800/50 border-zinc-700/50 hover:border-zinc-600"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">
                        {report.brandName}
                        {report.configName && <span className="text-zinc-400 font-normal"> – {report.configName}</span>}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
                        <Calendar className="h-3 w-3" />
                        {formatDate(report.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {getStatusBadge(report.status)}
                    {report.overallScore !== null && (
                      <Badge className="bg-zinc-700/50 text-zinc-300 border-zinc-600">
                        AI Score {report.overallScore}/100
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

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
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">
                      {selectedReport.brandName}
                      {selectedReport.configName && (
                        <span className="text-zinc-400 font-normal"> – {selectedReport.configName}</span>
                      )}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(selectedReport.createdAt)}
                      </span>
                      {selectedReport.overallScore !== null && (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          Score: {selectedReport.overallScore}/100
                        </span>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(selectedReport.status)}
                </div>

                <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                  <p className="text-zinc-300 leading-relaxed">
                    {selectedReport.summary ||
                      "This is where your AI executive summary will appear once the first report has been generated."}
                  </p>
                </div>
              </CardContent>
            </Card>

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
                      <p className="text-xs text-zinc-400 uppercase tracking-wide">Models Queried</p>
                      <p className="text-xl font-bold text-white">{selectedReport.modelsQueried?.length || "—"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button
              onClick={() => router.push(`/dashboard/reports/${selectedReport.id}`)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              View Full Report
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
