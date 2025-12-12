"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  TrendingUp,
  Target,
  Users,
  BarChart3,
  Bell,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Shield,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useRouter } from "next/navigation"

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
  const router = useRouter()

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

  const isFirstTime = !latestAnalysis && metrics.analysesRun === 0

  return (
    <div className="space-y-8">
      {isFirstTime && (
        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-950/20 via-zinc-900 to-zinc-950">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Get your first AI brand report in 3 steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Step 1: Settings */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 font-bold">
                    1
                  </div>
                  <h3 className="font-semibold text-white">Confirm your brand & industry</h3>
                </div>
                <p className="mb-4 text-sm text-zinc-400">We use this to understand your AI context.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/dashboard/settings")}
                  className="w-full border-zinc-700 hover:bg-zinc-800"
                >
                  Review settings
                </Button>
              </div>

              {/* Step 2: Competitors */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 font-bold">
                    2
                  </div>
                  <h3 className="font-semibold text-white">Add competitors</h3>
                  {metrics.competitorsCount > 0 && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                </div>
                <p className="mb-4 text-sm text-zinc-400">Tell us who to compare you against.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/dashboard/competitors")}
                  className="w-full border-zinc-700 hover:bg-zinc-800"
                >
                  {metrics.competitorsCount > 0 ? "Manage competitors" : "Add competitors"}
                </Button>
              </div>

              {/* Step 3: Run Analysis */}
              <div className="rounded-lg border border-blue-500/30 bg-gradient-to-br from-blue-950/30 to-zinc-950 p-6">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white font-bold">
                    3
                  </div>
                  <h3 className="font-semibold text-white">Run your first AI analysis</h3>
                </div>
                <p className="mb-4 text-sm text-zinc-400">We scan how AI assistants see and recommend your brand.</p>
                <Button
                  onClick={handleRunAnalysis}
                  disabled={runningAnalysis}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  size="sm"
                >
                  {runningAnalysis ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    "Run first analysis"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ZONE 1: HERO SECTION - "How AI sees your brand" */}
      <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          {/* Left side: Brand perception */}
          <div className="flex-1">
            <h1 className="mb-3 text-4xl font-bold text-white">
              How AI sees{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {brand?.name}
              </span>
            </h1>

            {/* Large Score Display */}
            <div className="mb-4 flex items-end gap-4">
              <div>
                <p className="mb-1 text-sm font-medium text-zinc-400">Brand Health Score</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-bold text-white">{brand?.score || 0}</span>
                  <span className="text-2xl text-zinc-500">/ 100</span>
                </div>
              </div>

              {/* Sentiment Badge */}
              {brand?.sentiment && (
                <Badge
                  variant="outline"
                  className={`mb-2 h-fit border-0 px-4 py-1.5 text-sm font-semibold ${
                    brand.sentiment === "positive"
                      ? "bg-green-500/10 text-green-500"
                      : brand.sentiment === "negative"
                        ? "bg-red-500/10 text-red-500"
                        : "bg-zinc-700 text-zinc-300"
                  }`}
                >
                  {brand.sentiment.charAt(0).toUpperCase() + brand.sentiment.slice(1)}
                </Badge>
              )}
            </div>

            {/* Executive Summary */}
            {latestAnalysis?.summary ? (
              <p className="max-w-2xl text-base leading-relaxed text-zinc-300">{latestAnalysis.summary}</p>
            ) : (
              <p className="max-w-2xl text-base leading-relaxed text-zinc-400">
                Run your first analysis to see how AI models perceive your brand across different contexts and queries.
              </p>
            )}
          </div>

          {/* Right side: Quick stats + Run button */}
          <div className="flex flex-col items-end gap-4 lg:min-w-[240px]">
            <div className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-zinc-400">Rank</span>
                <span className="text-3xl font-bold text-white">#{brand?.rank || 1}</span>
              </div>
              <p className="text-xs text-zinc-500">of {brand?.totalCompetitors || 1} competitors</p>

              <div className="mt-4 pt-4 border-t border-zinc-800">
                <p className="text-xs text-zinc-400">Last updated</p>
                <p className="mt-1 text-sm font-medium text-white">{brand?.lastUpdated || "Never"}</p>
              </div>
            </div>

            <Button
              onClick={handleRunAnalysis}
              disabled={runningAnalysis}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold"
              size="lg"
            >
              {runningAnalysis ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Analysis...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Run Analysis
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ZONE 2: KPI CARDS ROW */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2.5">
                <BarChart3 className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-400">Share of Voice</p>
                <p className="mt-1 text-2xl font-bold text-white">{brand?.shareOfVoice || 0}%</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-zinc-500">How often your brand appears vs competitors</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-500/10 p-2.5">
                <Users className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-400">Competitors Tracked</p>
                <p className="mt-1 text-2xl font-bold text-white">{metrics.competitorsCount}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-zinc-500">Brands you're monitoring</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-500/10 p-2.5">
                <Target className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-400">Analyses Run</p>
                <p className="mt-1 text-2xl font-bold text-white">{metrics.analysesRun}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-zinc-500">Total analysis reports generated</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-500/10 p-2.5">
                <Bell className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-400">Active Alerts</p>
                <p className="mt-1 text-2xl font-bold text-white">{metrics.activeAlerts}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-zinc-500">Unread notifications</p>
          </CardContent>
        </Card>
      </div>

      {/* ZONE 3: AI SWOT SNAPSHOT */}
      {latestAnalysis ? (
        <div>
          <h2 className="mb-4 text-2xl font-bold text-white">AI SWOT Snapshot</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Strengths */}
            <Card className="border-green-500/20 bg-zinc-900">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-green-500/10 p-1.5">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                  <CardTitle className="text-base text-white">Strengths</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {latestAnalysis.strengths && latestAnalysis.strengths.length > 0 ? (
                  <ul className="space-y-2">
                    {latestAnalysis.strengths.slice(0, 3).map((strength, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                        <span className="mt-1 text-green-500">•</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-zinc-500">No data yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Weaknesses */}
            <Card className="border-yellow-500/20 bg-zinc-900">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-yellow-500/10 p-1.5">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  </div>
                  <CardTitle className="text-base text-white">Weaknesses</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {latestAnalysis.weaknesses && latestAnalysis.weaknesses.length > 0 ? (
                  <ul className="space-y-2">
                    {latestAnalysis.weaknesses.slice(0, 3).map((weakness, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                        <span className="mt-1 text-yellow-500">•</span>
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-zinc-500">No data yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Opportunities */}
            <Card className="border-blue-500/20 bg-zinc-900">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-blue-500/10 p-1.5">
                    <Lightbulb className="h-4 w-4 text-blue-500" />
                  </div>
                  <CardTitle className="text-base text-white">Opportunities</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {latestAnalysis.opportunities && latestAnalysis.opportunities.length > 0 ? (
                  <ul className="space-y-2">
                    {latestAnalysis.opportunities.slice(0, 3).map((opportunity, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                        <span className="mt-1 text-blue-500">•</span>
                        <span>{opportunity}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-zinc-500">No data yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Threats */}
            <Card className="border-red-500/20 bg-zinc-900">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-red-500/10 p-1.5">
                    <Shield className="h-4 w-4 text-red-500" />
                  </div>
                  <CardTitle className="text-base text-white">Threats</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {latestAnalysis.threats && latestAnalysis.threats.length > 0 ? (
                  <ul className="space-y-2">
                    {latestAnalysis.threats.slice(0, 3).map((threat, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                        <span className="mt-1 text-red-500">•</span>
                        <span>{threat}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-zinc-500">No data yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="border-zinc-800 bg-zinc-900 p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Target className="mb-4 h-12 w-12 text-zinc-600" />
            <h3 className="mb-2 text-xl font-semibold text-white">No Analysis Yet</h3>
            <p className="mb-6 max-w-md text-zinc-400">
              Run your first analysis to see how AI models perceive your brand's strengths, weaknesses, opportunities,
              and threats.
            </p>
            <Button onClick={handleRunAnalysis} disabled={runningAnalysis} className="bg-blue-600 hover:bg-blue-700">
              {runningAnalysis ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                "Run First Analysis"
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* ZONE 4: COMPETITORS & AI MODELS */}
      {latestAnalysis && (latestAnalysis.competitorScores?.length > 0 || latestAnalysis.modelBreakdown?.length > 0) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: Competitor Comparison */}
          {latestAnalysis.competitorScores && latestAnalysis.competitorScores.length > 0 && (
            <Card className="border-zinc-800 bg-zinc-900">
              <CardHeader>
                <CardTitle className="text-white">Competitor Comparison</CardTitle>
                <p className="text-sm text-zinc-400">How your brand scores vs competitors in AI responses</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {latestAnalysis.competitorScores.map((competitor, i) => (
                    <div key={i}>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{competitor.name}</span>
                          {i === 0 && (
                            <Badge
                              variant="outline"
                              className="border-blue-500/50 bg-blue-500/10 text-blue-500 text-xs"
                            >
                              Top
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-zinc-400">{competitor.shareOfVoice}% SoV</span>
                          <span className="font-semibold text-white">{competitor.score}</span>
                        </div>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                          style={{ width: `${competitor.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Right: AI Models Breakdown */}
          {latestAnalysis.modelBreakdown && latestAnalysis.modelBreakdown.length > 0 && (
            <Card className="border-zinc-800 bg-zinc-900">
              <CardHeader>
                <CardTitle className="text-white">AI Models Breakdown</CardTitle>
                <p className="text-sm text-zinc-400">How different AI models perceive your brand</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {latestAnalysis.modelBreakdown.map((model, i) => (
                    <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="font-medium text-white">{model.model}</span>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`border-0 text-xs ${
                              model.sentiment === "positive"
                                ? "bg-green-500/10 text-green-500"
                                : model.sentiment === "negative"
                                  ? "bg-red-500/10 text-red-500"
                                  : "bg-zinc-700 text-zinc-400"
                            }`}
                          >
                            {model.sentiment}
                          </Badge>
                          <span className="text-sm font-semibold text-white">{model.score}</span>
                        </div>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                          style={{ width: `${model.score}%` }}
                        />
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
  )
}
