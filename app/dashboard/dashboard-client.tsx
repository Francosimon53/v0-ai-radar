"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, TrendingUp, TrendingDown, Target, CheckCircle2, AlertCircle, Lightbulb, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface DashboardData {
  hasConfig: boolean
  brand: {
    name: string
    score: number
    previousScore: number | null
    trend: number
    rank: number
    totalCompetitors: number
    shareOfVoice: number
    sentiment: string
    lastUpdated: string
  } | null
  metrics: {
    questionsTracked: number
    competitorsCount: number
    analysesRun: number
    activeAlerts: number
  }
  latestAnalysis: {
    summary: string
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    threats: string[]
    competitorScores: { name: string; score: number; shareOfVoice: number }[]
    modelBreakdown: { model: string; score: number; sentiment: string }[]
  } | null
  configId: string | null
}

export default function DashboardClient() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [runningAnalysis, setRunningAnalysis] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      setLoading(true)
      console.log("[v0] Loading dashboard...")
      const res = await fetch("/api/dashboard")
      const data = await res.json()
      console.log("[v0] Dashboard data loaded:", data)
      setDashboardData(data)
    } catch (error) {
      console.error("[v0] Failed to load dashboard:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleRunAnalysis() {
    if (!dashboardData?.configId) return

    try {
      setRunningAnalysis(true)
      console.log("[v0] Starting analysis for config:", dashboardData.configId)

      const res = await fetch("/api/analysis/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configId: dashboardData.configId }),
      })

      const result = await res.json()
      console.log("[v0] Analysis result:", result)

      if (!res.ok) {
        throw new Error(result.error || result.message || "Analysis failed")
      }

      toast({
        title: "Success",
        description: `Analysis completed! Brand score: ${result.brandScore}/100`,
      })

      // Reload dashboard to show new results
      await loadDashboard()
    } catch (error) {
      console.error("[v0] Analysis error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to run analysis",
        variant: "destructive",
      })
    } finally {
      setRunningAnalysis(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!dashboardData?.hasConfig) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <Target className="mb-4 h-16 w-16 text-zinc-600" />
        <h2 className="mb-2 text-2xl font-bold text-white">No Configuration Found</h2>
        <p className="mb-4 text-zinc-400">Set up your brand tracking to get started</p>
        <Link href="/dashboard/setup">
          <Button>Get Started</Button>
        </Link>
      </div>
    )
  }

  const { brand, metrics, latestAnalysis } = dashboardData

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{brand?.name || "Dashboard"}</h1>
          <p className="text-zinc-400">Overview of your brand perception across AI models</p>
        </div>
        <Button onClick={handleRunAnalysis} disabled={runningAnalysis} className="bg-blue-600 hover:bg-blue-700">
          {runningAnalysis ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Analysis...
            </>
          ) : (
            "Run Analysis"
          )}
        </Button>
      </div>

      {/* Score Card */}
      <Card className="border-zinc-800 bg-zinc-900 p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-zinc-400">Brand Health Score</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-5xl font-bold text-white">{brand?.score || 0}</span>
              <span className="text-xl text-zinc-500">/ 100</span>
            </div>
            {brand && brand.trend !== 0 && (
              <div className="mt-2 flex items-center gap-1">
                {brand.trend > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={brand.trend > 0 ? "text-green-500" : "text-red-500"}>
                  {Math.abs(brand.trend)} points
                </span>
              </div>
            )}
            {brand?.sentiment && (
              <div className="mt-3">
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                    brand.sentiment === "positive"
                      ? "bg-green-500/10 text-green-500"
                      : brand.sentiment === "negative"
                        ? "bg-red-500/10 text-red-500"
                        : "bg-zinc-700 text-zinc-300"
                  }`}
                >
                  {brand.sentiment.charAt(0).toUpperCase() + brand.sentiment.slice(1)} Sentiment
                </span>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-zinc-400">Rank</p>
            <p className="mt-1 text-3xl font-bold text-white">#{brand?.rank || 1}</p>
            <p className="text-xs text-zinc-500">of {brand?.totalCompetitors || 1}</p>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-400">Share of Voice</p>
          <p className="mt-2 text-2xl font-bold text-white">{brand?.shareOfVoice || 0}%</p>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-400">Competitors</p>
          <p className="mt-2 text-2xl font-bold text-white">{metrics.competitorsCount}</p>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-400">Analyses</p>
          <p className="mt-2 text-2xl font-bold text-white">{metrics.analysesRun}</p>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-400">Active Alerts</p>
          <p className="mt-2 text-2xl font-bold text-white">{metrics.activeAlerts}</p>
        </Card>
      </div>

      {latestAnalysis && (
        <>
          {/* Executive Summary */}
          {latestAnalysis.summary && (
            <Card className="border-zinc-800 bg-zinc-900 p-6">
              <h3 className="mb-3 text-lg font-semibold text-white">Executive Summary</h3>
              <p className="text-zinc-300">{latestAnalysis.summary}</p>
            </Card>
          )}

          {/* SWOT Analysis */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Strengths */}
            {latestAnalysis.strengths && latestAnalysis.strengths.length > 0 && (
              <Card className="border-zinc-800 bg-zinc-900 p-6">
                <div className="mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-semibold text-white">Strengths</h3>
                </div>
                <ul className="space-y-2">
                  {latestAnalysis.strengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                      <span className="mt-1 text-green-500">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Weaknesses */}
            {latestAnalysis.weaknesses && latestAnalysis.weaknesses.length > 0 && (
              <Card className="border-zinc-800 bg-zinc-900 p-6">
                <div className="mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <h3 className="text-lg font-semibold text-white">Weaknesses</h3>
                </div>
                <ul className="space-y-2">
                  {latestAnalysis.weaknesses.map((weakness, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                      <span className="mt-1 text-yellow-500">•</span>
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Opportunities */}
            {latestAnalysis.opportunities && latestAnalysis.opportunities.length > 0 && (
              <Card className="border-zinc-800 bg-zinc-900 p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-white">Opportunities</h3>
                </div>
                <ul className="space-y-2">
                  {latestAnalysis.opportunities.map((opportunity, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                      <span className="mt-1 text-blue-500">•</span>
                      <span>{opportunity}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Threats */}
            {latestAnalysis.threats && latestAnalysis.threats.length > 0 && (
              <Card className="border-zinc-800 bg-zinc-900 p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-500" />
                  <h3 className="text-lg font-semibold text-white">Threats</h3>
                </div>
                <ul className="space-y-2">
                  {latestAnalysis.threats.map((threat, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                      <span className="mt-1 text-red-500">•</span>
                      <span>{threat}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

          {/* Competitor Comparison */}
          {latestAnalysis.competitorScores && latestAnalysis.competitorScores.length > 0 && (
            <Card className="border-zinc-800 bg-zinc-900 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">Competitor Comparison</h3>
              <div className="space-y-3">
                {latestAnalysis.competitorScores.map((competitor, i) => (
                  <div key={i}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-zinc-300">{competitor.name}</span>
                      <span className="text-zinc-400">{competitor.score}/100</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                      <div className="h-full bg-blue-500" style={{ width: `${competitor.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Model Breakdown */}
          {latestAnalysis.modelBreakdown && latestAnalysis.modelBreakdown.length > 0 && (
            <Card className="border-zinc-800 bg-zinc-900 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">AI Model Breakdown</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {latestAnalysis.modelBreakdown.map((model, i) => (
                  <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium text-white">{model.model}</span>
                      <span className="text-sm text-zinc-400">{model.score}/100</span>
                    </div>
                    <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                        style={{ width: `${model.score}%` }}
                      />
                    </div>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                        model.sentiment === "positive"
                          ? "bg-green-500/10 text-green-500"
                          : model.sentiment === "negative"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-zinc-700 text-zinc-400"
                      }`}
                    >
                      {model.sentiment}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {/* Last Updated */}
      <Card className="border-zinc-800 bg-zinc-900 p-6">
        <p className="text-sm text-zinc-400">
          Last updated: <span className="text-white">{brand?.lastUpdated || "Never"}</span>
        </p>
      </Card>
    </div>
  )
}
