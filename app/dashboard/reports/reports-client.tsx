"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { FileText, Download, Calendar, TrendingUp, TrendingDown, Loader2, Play, ExternalLink } from "lucide-react"
import Link from "next/link"

interface Report {
  id: string
  brand: string
  score: number
  previous_score: number | null
  share_of_voice: number
  created_at: string
  pdf_url: string | null
  executive_summary: string
}

export default function ReportsClient() {
  const { toast } = useToast()
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [configId, setConfigId] = useState<string | null>(null)

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      const response = await fetch("/api/reports")
      if (response.ok) {
        const data = await response.json()
        setReports(data.reports || [])
        setConfigId(data.configId || null)
      }
    } catch (error) {
      console.error("Failed to load reports:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateReport = async () => {
    if (!configId) {
      toast({
        title: "Setup Required",
        description: "Please complete the setup wizard first.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/analysis/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configId }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Report Generated",
          description: "Your new report is ready to view",
        })
        loadReports()
      } else {
        throw new Error(result.error || result.message || "Failed to generate report")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">View and download your brand intelligence reports</p>
        </div>

        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Reports Yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Run your first analysis to generate a brand intelligence report with AI-powered insights.
            </p>
            <Button
              onClick={handleGenerateReport}
              disabled={isGenerating || !configId}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Generate First Report
                </>
              )}
            </Button>
            {!configId && (
              <p className="text-sm text-muted-foreground mt-4">
                <Link href="/dashboard/setup" className="text-blue-500 hover:underline">
                  Complete setup
                </Link>{" "}
                to generate reports
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">View and download your brand intelligence reports</p>
        </div>
        <Button
          onClick={handleGenerateReport}
          disabled={isGenerating || !configId}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              New Report
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-4">
        {reports.map((report) => {
          const scoreChange = report.previous_score ? report.score - report.previous_score : 0
          const date = new Date(report.created_at)

          return (
            <Card key={report.id} className="border-border bg-card hover:border-blue-500/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{report.brand} Analysis Report</h3>
                      <Badge variant="outline" className="text-blue-400 border-blue-400/50">
                        Score: {report.score}
                      </Badge>
                      {scoreChange !== 0 && (
                        <span
                          className={`flex items-center gap-1 text-sm ${scoreChange > 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          {scoreChange > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          {scoreChange > 0 ? "+" : ""}
                          {scoreChange}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{report.executive_summary}</p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span>Share of Voice: {report.share_of_voice.toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {report.pdf_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={report.pdf_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          PDF
                        </a>
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/reports/${report.id}`}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
