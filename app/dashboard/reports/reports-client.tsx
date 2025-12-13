"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, Download, ExternalLink, Loader2, TrendingUp, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { VIPReportModal } from "@/components/vip-report-modal"

interface Report {
  id: string
  created_at: string
  brand: string
  score: number
  sentiment: string
  summary: string
  shareOfVoice: number
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
}

export default function ReportsClient() {
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isVIPModalOpen, setIsVIPModalOpen] = useState(false)

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      const response = await fetch("/api/reports")
      if (response.ok) {
        const data = await response.json()
        setReports(data.reports || [])
        if (data.reports?.length > 0) {
          setSelectedReport(data.reports[0])
        }
      }
    } catch (error) {
      console.error("Failed to load reports:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSentimentBadge = (sentiment: string) => {
    const lower = sentiment.toLowerCase()
    if (lower === "positive")
      return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Positive</Badge>
    if (lower === "negative") return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Negative</Badge>
    return <Badge className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20">Neutral</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-zinc-400">Loading reports...</p>
        </div>
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <div className="space-y-6">
        <VIPReportModal isOpen={isVIPModalOpen} onClose={() => setIsVIPModalOpen(false)} />

        <div>
          <h1 className="text-3xl font-bold text-white">Client-ready AI reports</h1>
          <p className="text-zinc-400 mt-1">
            Run your first AI analysis to generate a board-ready report you can send to your clients.
          </p>
        </div>

        <Card className="border-dashed border-zinc-700 bg-zinc-900/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No reports yet</h3>
            <p className="text-zinc-400 text-center mb-8 max-w-md">
              Run your first analysis from the dashboard to generate your first executive report.
            </p>
            <Button onClick={() => router.push("/dashboard")} size="lg" className="bg-blue-600 hover:bg-blue-700">
              Generate my first VIP report
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card
            className="border-zinc-700 bg-zinc-900/50 cursor-pointer hover:border-zinc-600 transition-colors"
            onClick={() => setIsVIPModalOpen(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white">Nike – Global campaign pitch</h3>
                  <p className="text-sm text-zinc-400 mt-1">
                    Example of a full VIP AI brand report for a global client.
                  </p>
                </div>
                <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">Sample</Badge>
              </div>
              <p className="text-xs text-zinc-500">Click to preview</p>
            </CardContent>
          </Card>

          <Card
            className="border-zinc-700 bg-zinc-900/50 cursor-pointer hover:border-zinc-600 transition-colors"
            onClick={() => setIsVIPModalOpen(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white">Apple – Q4 AI visibility review</h3>
                  <p className="text-sm text-zinc-400 mt-1">
                    Example quarterly review format with SWOT and competitor ranking.
                  </p>
                </div>
                <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">Sample</Badge>
              </div>
              <p className="text-xs text-zinc-500">Click to preview</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <VIPReportModal isOpen={isVIPModalOpen} onClose={() => setIsVIPModalOpen(false)} />

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Reports</h1>
          <p className="text-zinc-400 mt-1">Review your past AI visibility scans and executive summaries.</p>
        </div>
        {/* <select className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300 text-sm">
          <option>Last 30 days</option>
          <option>All time</option>
        </select> */}
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wide mb-4">Report History</h2>
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
                      <div className="flex-1">
                        <p className="font-semibold text-white">{report.brand}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
                          <Calendar className="h-3 w-3" />
                          {formatDate(report.created_at)}
                        </div>
                      </div>
                      <Badge
                        variant={report.score >= 70 ? "default" : report.score >= 50 ? "secondary" : "destructive"}
                        className="ml-2"
                      >
                        {report.score}/100
                      </Badge>
                    </div>
                    {getSentimentBadge(report.sentiment)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {selectedReport && (
          <div className="lg:col-span-8 space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {selectedReport.brand} – AI visibility report
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(selectedReport.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        Score: {selectedReport.score}/100
                      </span>
                    </div>
                  </div>
                  {getSentimentBadge(selectedReport.sentiment)}
                </div>

                {selectedReport.summary && (
                  <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50 mb-6">
                    <p className="text-zinc-300 leading-relaxed">{selectedReport.summary}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Full Report
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-zinc-700 hover:bg-zinc-800 bg-transparent"
                    disabled
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>

            {(selectedReport.strengths?.length > 0 ||
              selectedReport.weaknesses?.length > 0 ||
              selectedReport.opportunities?.length > 0 ||
              selectedReport.threats?.length > 0) && (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Key Insights</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {selectedReport.strengths?.length > 0 && (
                      <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
                        <h4 className="font-medium text-green-500 mb-2">Strengths</h4>
                        <ul className="space-y-1">
                          {selectedReport.strengths.slice(0, 3).map((item, idx) => (
                            <li key={idx} className="text-sm text-zinc-400 flex items-start gap-2">
                              <ChevronRight className="h-4 w-4 flex-shrink-0 mt-0.5 text-green-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedReport.weaknesses?.length > 0 && (
                      <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                        <h4 className="font-medium text-yellow-500 mb-2">Weaknesses</h4>
                        <ul className="space-y-1">
                          {selectedReport.weaknesses.slice(0, 3).map((item, idx) => (
                            <li key={idx} className="text-sm text-zinc-400 flex items-start gap-2">
                              <ChevronRight className="h-4 w-4 flex-shrink-0 mt-0.5 text-yellow-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedReport.opportunities?.length > 0 && (
                      <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                        <h4 className="font-medium text-blue-500 mb-2">Opportunities</h4>
                        <ul className="space-y-1">
                          {selectedReport.opportunities.slice(0, 3).map((item, idx) => (
                            <li key={idx} className="text-sm text-zinc-400 flex items-start gap-2">
                              <ChevronRight className="h-4 w-4 flex-shrink-0 mt-0.5 text-blue-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedReport.threats?.length > 0 && (
                      <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                        <h4 className="font-medium text-red-500 mb-2">Threats</h4>
                        <ul className="space-y-1">
                          {selectedReport.threats.slice(0, 3).map((item, idx) => (
                            <li key={idx} className="text-sm text-zinc-400 flex items-start gap-2">
                              <ChevronRight className="h-4 w-4 flex-shrink-0 mt-0.5 text-red-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
