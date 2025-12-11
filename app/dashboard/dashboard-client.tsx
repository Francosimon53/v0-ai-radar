"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Loader2,
  Sparkles,
  Zap,
  Target,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Compass,
  Rocket,
  CheckCircle2,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
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
    competitorGap: number
    sentiment: string
    nextAnalysis: number
    lastUpdated: string
  } | null
  latestReport: any
  recentAlerts: any[]
  analysisHistory: any[]
  competitors: string[]
  configId: string | null
  metrics: {
    questionsTracked: number
    competitorsCount: number
    analysesRun: number
    activeAlerts: number
  }
}

interface PlanSummary {
  northStarGoal: string
  quickWins: Array<{
    id?: string
    title: string
    description: string
  }>
  backlogCount?: number
}

interface AnalysisResult {
  success: boolean
  analysisId: string
  brandScore: number
  processingTime: number
  remaining?: number
  planSummary?: PlanSummary
}

export default function DashboardClient() {
  const { toast } = useToast()
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false)
  const [latestAnalysis, setLatestAnalysis] = useState<AnalysisResult | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    console.log("[v0] Loading dashboard data...")
    try {
      const response = await fetch("/api/dashboard")
      const result = await response.json()
      console.log("[v0] Dashboard data loaded:", {
        hasConfig: result.hasConfig,
        configId: result.configId,
        brandName: result.brand?.name,
      })
      setData(result)
    } catch (error) {
      console.error("[v0] Failed to load dashboard:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const runAnalysis = async () => {
    console.log("[v0] Run Analysis clicked - configId:", data?.configId)

    if (!data?.configId) {
      console.log("[v0] No configId - showing setup required toast")
      toast({
        title: "Setup Required",
        description: "Please complete the setup wizard first.",
        variant: "destructive",
      })
      return
    }

    setIsRunningAnalysis(true)
    console.log("[v0] Starting analysis request...")

    try {
      toast({
        title: "Analysis Started",
        description: "Analyzing your brand across AI models...",
      })

      console.log("[v0] Calling /api/analysis/run with configId:", data.configId)
      const response = await fetch("/api/analysis/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configId: data.configId }),
      })

      console.log("[v0] API response status:", response.status)
      const result = await response.json()
      console.log("[v0] API response:", result)

      if (!response.ok) {
        throw new Error(result.error || result.message || "Analysis failed")
      }

      console.log("[v0] Analysis succeeded - brandScore:", result.brandScore, "planSummary:", !!result.planSummary)
      setLatestAnalysis(result)

      toast({
        title: "Analysis Complete",
        description: `Brand score: ${result.brandScore}/100`,
      })

      loadDashboardData()
    } catch (error: any) {
      console.error("[v0] Analysis FAILED:", error)
      toast({
        title: "Analysis Failed",
        description: error.message || "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsRunningAnalysis(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!data?.hasConfig) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <Sparkles className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">Welcome to AI Radar</h1>
        <p className="text-muted-foreground mb-8 max-w-md text-lg">
          Discover how AI models perceive your brand and stay ahead of the competition.
        </p>
        <Link href="/dashboard/setup">
          <Button size="lg" className="gap-2">
            Start Setup
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    )
  }

  const brand = data.brand!
  const hasData = brand.score > 0

  // Prepare chart data
  const chartData = data.analysisHistory.map((item: any) => ({
    date: new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    score: item.score || 0,
  }))

  return (
    <div className="space-y-6">
      {/* Hero Score Card */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-card via-card to-primary/5">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-8">
            {/* Score Circle */}
            <div className="relative">
              <svg className="w-40 h-40 -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted/20"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="url(#scoreGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="314"
                  strokeDashoffset={314 - (314 * brand.score) / 100}
                  className="score-ring"
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--accent))" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
                <span className="text-4xl font-bold text-foreground">{brand.score}</span>
                <span className="text-sm text-muted-foreground">/ 100</span>
              </div>
            </div>

            {/* Brand Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{brand.name}</h1>
                <p className="text-muted-foreground">Brand Health Score</p>
              </div>

              {brand.trend !== 0 && (
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                    brand.trend > 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {brand.trend > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {brand.trend > 0 ? "+" : ""}
                  {brand.trend} points from last analysis
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 pt-2">
                <div>
                  <p className="text-sm text-muted-foreground">Share of Voice</p>
                  <p className="text-2xl font-semibold text-foreground">{brand.shareOfVoice}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sentiment</p>
                  <p className="text-2xl font-semibold capitalize text-foreground">{brand.sentiment}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rank</p>
                  <p className="text-2xl font-semibold text-foreground">#{brand.rank}</p>
                </div>
              </div>
            </div>

            {/* Mini Chart */}
            {chartData.length > 1 && (
              <div className="w-full lg:w-64 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* CTA for first analysis */}
      {!hasData && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Ready to analyze {brand.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Run your first analysis to see how AI models perceive your brand
                  </p>
                </div>
              </div>
              <Button onClick={runAnalysis} disabled={isRunningAnalysis} size="lg">
                {isRunningAnalysis ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Run Analysis
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {latestAnalysis?.planSummary && (
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Compass className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-lg">Strategic Plan</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* North Star Goal */}
            <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary uppercase tracking-wide">North Star Goal</span>
              </div>
              <p className="text-lg font-semibold text-foreground">{latestAnalysis.planSummary.northStarGoal}</p>
            </div>

            {/* Quick Wins */}
            {latestAnalysis.planSummary.quickWins && latestAnalysis.planSummary.quickWins.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Rocket className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Quick Wins (Next 7 Days)</span>
                </div>
                <div className="space-y-3">
                  {latestAnalysis.planSummary.quickWins.map((win, idx) => (
                    <div
                      key={win.id || idx}
                      className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                    >
                      <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{win.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">{win.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View Full Plan CTA */}
            <div className="flex justify-end pt-2">
              <Link href="/dashboard/reports">
                <Button variant="ghost" size="sm" className="gap-1 text-primary">
                  View Full Strategic Plan
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="AI Models" value="2" subtitle="GPT-4o & Claude" icon={Target} trend={null} />
        <StatCard
          title="Competitors"
          value={data.metrics.competitorsCount.toString()}
          subtitle="being tracked"
          icon={BarChart3}
          trend={null}
        />
        <StatCard
          title="Analyses"
          value={data.metrics.analysesRun.toString()}
          subtitle="this month"
          icon={Zap}
          trend={null}
        />
        <StatCard
          title="Competitor Gap"
          value={`${brand.competitorGap >= 0 ? "+" : ""}${brand.competitorGap}`}
          subtitle="points ahead"
          icon={TrendingUp}
          trend={brand.competitorGap > 0 ? "up" : brand.competitorGap < 0 ? "down" : null}
        />
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Score History</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      domain={[0, 100]}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Run an analysis to see score history
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={runAnalysis}
                disabled={isRunningAnalysis}
                className="w-full justify-start bg-transparent"
                variant="outline"
              >
                {isRunningAnalysis ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                {isRunningAnalysis ? "Running..." : "Run New Analysis"}
              </Button>
              <Link href="/dashboard/reports" className="block">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Reports
                </Button>
              </Link>
              <Link href="/dashboard/competitors" className="block">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Target className="mr-2 h-4 w-4" />
                  Manage Competitors
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Last Updated */}
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Last updated</p>
              <p className="font-medium">{brand.lastUpdated}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}: {
  title: string
  value: string
  subtitle: string
  icon: any
  trend: "up" | "down" | null
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          {trend && (
            <div className={`flex items-center ${trend === "up" ? "text-success" : "text-destructive"}`}>
              {trend === "up" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            </div>
          )}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  )
}
