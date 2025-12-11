"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  FileText,
  Calendar,
  TrendingUp,
  TrendingDown,
  Loader2,
  Sparkles,
  ChevronRight,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"
import Link from "next/link"

interface Report {
  id: string
  brand: string
  score: number
  shareOfVoice: number
  sentiment: string
  created_at: string
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
  summary: string
  modelBreakdown: { model: string; score: number; sentiment: string }[]
  competitorScores: { name: string; score: number; shareOfVoice: number }[]
}

export default function ReportsClient() {
  const { toast } = useToast()
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [configId, setConfigId] = useState<string | null>(null)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

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
      toast({
        title: "Analysis Started",
        description: "Analyzing your brand across AI models...",
      })

      const response = await fetch("/api/analysis/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configId }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Report Generated",
          description: `Brand score: ${result.brandScore}/100`,
        })
        loadReports()
      } else {
        throw new Error(result.error || result.message || "Failed to generate report")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate report",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">View and analyze your brand intelligence reports</p>
        </div>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Reports Yet</h3>
            <p className="text-muted-foreground text-center mb-8 max-w-md">
              Run your first analysis to generate a comprehensive brand intelligence report with AI-powered insights.
            </p>
            <Button onClick={handleGenerateReport} disabled={isGenerating || !configId} size="lg">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate First Report
                </>
              )}
            </Button>
            {!configId && (
              <p className="text-sm text-muted-foreground mt-4">
                <Link href="/dashboard/setup" className="text-primary hover:underline">
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">View and analyze your brand intelligence reports</p>
        </div>
        <Button onClick={handleGenerateReport} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              New Report
            </>
          )}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Report List */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">All Reports</h2>
          {reports.map((report) => (
            <Card
              key={report.id}
              className={`cursor-pointer transition-all ${
                selectedReport?.id === report.id ? "border-primary bg-primary/5" : "hover:border-primary/50"
              }`}
              onClick={() => setSelectedReport(report)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{report.brand}</span>
                  <Badge variant={report.score >= 70 ? "default" : report.score >= 50 ? "secondary" : "destructive"}>
                    {report.score}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(report.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Report Detail */}
        {selectedReport && (
          <div className="lg:col-span-2 space-y-6">
            {/* Score Overview */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedReport.brand}</h2>
                    <p className="text-muted-foreground">
                      Generated{" "}
                      {new Date(selectedReport.created_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold">{selectedReport.score}</div>
                    <div className="text-sm text-muted-foreground">Brand Score</div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{selectedReport.shareOfVoice}%</div>
                    <div className="text-xs text-muted-foreground">Share of Voice</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold capitalize">{selectedReport.sentiment}</div>
                    <div className="text-xs text-muted-foreground">Sentiment</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{selectedReport.modelBreakdown?.length || 2}</div>
                    <div className="text-xs text-muted-foreground">AI Models</div>
                  </div>
                </div>

                {/* Summary */}
                {selectedReport.summary && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2">Executive Summary</h3>
                    <p className="text-muted-foreground">{selectedReport.summary}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SWOT Analysis */}
            <div className="grid grid-cols-2 gap-4">
              <SWOTCard
                title="Strengths"
                items={selectedReport.strengths}
                icon={CheckCircle2}
                color="text-green-500"
                bgColor="bg-green-500/10"
              />
              <SWOTCard
                title="Weaknesses"
                items={selectedReport.weaknesses}
                icon={AlertTriangle}
                color="text-orange-500"
                bgColor="bg-orange-500/10"
              />
              <SWOTCard
                title="Opportunities"
                items={selectedReport.opportunities}
                icon={Target}
                color="text-blue-500"
                bgColor="bg-blue-500/10"
              />
              <SWOTCard
                title="Threats"
                items={selectedReport.threats}
                icon={Zap}
                color="text-red-500"
                bgColor="bg-red-500/10"
              />
            </div>

            {/* Model Breakdown */}
            {selectedReport.modelBreakdown && selectedReport.modelBreakdown.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">AI Model Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedReport.modelBreakdown.map((model, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{model.model}</p>
                          <p className="text-sm text-muted-foreground capitalize">{model.sentiment} sentiment</p>
                        </div>
                        <div className="text-2xl font-bold">{model.score}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Competitor Scores */}
            {selectedReport.competitorScores && selectedReport.competitorScores.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Competitor Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedReport.competitorScores.map((comp, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{comp.name}</p>
                          <p className="text-sm text-muted-foreground">{comp.shareOfVoice}% share of voice</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-2xl font-bold">{comp.score}</div>
                          {comp.score < selectedReport.score ? (
                            <TrendingDown className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                    ))}
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

function SWOTCard({
  title,
  items,
  icon: Icon,
  color,
  bgColor,
}: {
  title: string
  items: string[]
  icon: any
  color: string
  bgColor: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className={`h-8 w-8 rounded-lg ${bgColor} flex items-center justify-center`}>
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
          <h3 className="font-semibold">{title}</h3>
        </div>
        {items && items.length > 0 ? (
          <ul className="space-y-2">
            {items.map((item, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <ChevronRight className="h-3 w-3 mt-1 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No data available</p>
        )}
      </CardContent>
    </Card>
  )
}
