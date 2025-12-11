"use client"

import { useState, useEffect } from "react"
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
  Compass,
  Rocket,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Users,
  Activity,
  Brain,
} from "lucide-react"
import { XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from "recharts"
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
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [latestAnalysis, setLatestAnalysis] = useState<AnalysisResult | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoadError(null)
    try {
      const response = await fetch("/api/dashboard")
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API returned ${response.status}: ${errorText}`)
      }
      const result = await response.json()
      setData(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error"
      setLoadError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const runAnalysis = async () => {
    setAnalysisError(null)

    if (!data?.configId) {
      toast({
        title: "Setup Required",
        description: "Please complete the setup wizard first.",
        variant: "destructive",
      })
      return
    }

    setIsRunningAnalysis(true)

    try {
      toast({
        title: "Analysis Started",
        description: "Analyzing your brand across AI models (30-60 seconds)...",
      })

      const response = await fetch("/api/analysis/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configId: data.configId }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || result.message || `Analysis failed with status ${response.status}`)
      }

      setLatestAnalysis(result)

      toast({
        title: "Analysis Complete",
        description: `Brand score: ${result.brandScore}/100`,
      })

      loadDashboardData()
    } catch (error: any) {
      const message = error.message || "An error occurred"
      setAnalysisError(message)
      toast({
        title: "Analysis Failed",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsRunningAnalysis(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-2 border-zinc-800 border-t-blue-500 animate-spin" />
          </div>
          <p className="text-zinc-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="h-16 w-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="text-xl font-semibold text-white mb-2">Failed to Load</h1>
        <p className="text-zinc-500 mb-6 max-w-md text-sm">{loadError}</p>
        <Button
          onClick={() => {
            setIsLoading(true)
            loadDashboardData()
          }}
          className="bg-zinc-800 hover:bg-zinc-700 text-white"
        >
          Try Again
        </Button>
      </div>
    )
  }

  // No config - show welcome
  if (!data?.hasConfig) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="relative mb-6">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
            <Activity className="h-10 w-10 text-blue-400" />
          </div>
          <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
            <Sparkles className="h-3 w-3 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Welcome to AI Radar</h1>
        <p className="text-zinc-400 mb-8 max-w-md">
          Discover how AI models perceive your brand and stay ahead of the competition.
        </p>
        <Link href="/dashboard/setup">
          <Button className="gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-blue-500/25 px-6">
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
  const chartData =
    data.analysisHistory.length > 0
      ? data.analysisHistory.map((item: any) => ({
          date: new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          score: item.score || 0,
        }))
      : [{ date: "Now", score: brand.score }]

  // Score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 70) return "from-emerald-500 to-teal-400"
    if (score >= 40) return "from-amber-500 to-orange-400"
    return "from-red-500 to-rose-400"
  }

  return (
    <div className="space-y-6">
      {/* Hero Section - Brand Score */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border border-zinc-800/50 p-6 lg:p-8">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative flex flex-col lg:flex-row lg:items-center gap-8">
          {/* Score Circle */}
          <div className="relative flex-shrink-0">
            <svg className="w-44 h-44 -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-zinc-800"
              />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="url(#scoreGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="327"
                strokeDashoffset={327 - (327 * brand.score) / 100}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold text-white">{brand.score}</span>
              <span className="text-sm text-zinc-500">of 100</span>
            </div>
          </div>

          {/* Brand Info */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white">{brand.name}</h1>
                {brand.trend !== 0 && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      brand.trend > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {brand.trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {brand.trend > 0 ? "+" : ""}
                    {brand.trend}
                  </span>
                )}
              </div>
              <p className="text-zinc-500">Brand Health Score</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 lg:gap-8">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-zinc-500">Share of Voice</p>
                <p className="text-2xl font-semibold text-white">{brand.shareOfVoice}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-zinc-500">Sentiment</p>
                <p className="text-2xl font-semibold text-white capitalize">{brand.sentiment}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-zinc-500">Rank</p>
                <p className="text-2xl font-semibold text-white">#{brand.rank}</p>
              </div>
            </div>
          </div>

          {/* Mini Trend Chart */}
          {chartData.length > 1 && (
            <div className="w-full lg:w-48 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} fill="url(#chartGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {analysisError && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-red-400">Analysis Failed</h3>
              <p className="text-sm text-zinc-400 mt-1">{analysisError}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-zinc-500 hover:text-white hover:bg-zinc-800"
              onClick={() => setAnalysisError(null)}
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* CTA for First Analysis */}
      {!hasData && (
        <div className="rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Brain className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Ready to analyze {brand.name}</h3>
                <p className="text-sm text-zinc-400">Run your first AI analysis to discover your brand perception</p>
              </div>
            </div>
            <Button
              onClick={runAnalysis}
              disabled={isRunningAnalysis}
              className="gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-blue-500/25"
            >
              {isRunningAnalysis ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Run Analysis
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Strategic Plan Results */}
      {latestAnalysis?.planSummary && (
        <div className="rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800/50 overflow-hidden">
          <div className="p-6 border-b border-zinc-800/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <Compass className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Strategic Plan</h2>
                <p className="text-sm text-zinc-500">AI-generated recommendations</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* North Star Goal */}
            <div className="rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-5 w-5 text-purple-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">North Star Goal</span>
              </div>
              <p className="text-lg font-medium text-white leading-relaxed">
                {latestAnalysis.planSummary.northStarGoal}
              </p>
            </div>

            {/* Quick Wins */}
            {latestAnalysis.planSummary.quickWins && latestAnalysis.planSummary.quickWins.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Rocket className="h-5 w-5 text-emerald-400" />
                  <span className="font-semibold text-white">Quick Wins</span>
                  <span className="text-xs text-zinc-500 ml-1">Next 7 days</span>
                </div>
                <div className="grid gap-3">
                  {latestAnalysis.planSummary.quickWins.map((win, idx) => (
                    <div
                      key={win.id || idx}
                      className="flex items-start gap-3 p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600/50 transition-colors"
                    >
                      <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{win.title}</p>
                        <p className="text-sm text-zinc-400 mt-1">{win.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Link href="/dashboard/reports">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                >
                  View Full Plan
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="AI Models" value="2" subtitle="GPT-4o & Claude" icon={Brain} color="blue" />
        <StatCard
          title="Competitors"
          value={data.metrics.competitorsCount.toString()}
          subtitle="being tracked"
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Analyses"
          value={data.metrics.analysesRun.toString()}
          subtitle="this month"
          icon={Activity}
          color="emerald"
        />
        <StatCard
          title="Gap"
          value={`${brand.competitorGap >= 0 ? "+" : ""}${brand.competitorGap}`}
          subtitle="vs competitors"
          icon={brand.competitorGap >= 0 ? TrendingUp : TrendingDown}
          color={brand.competitorGap >= 0 ? "emerald" : "red"}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 rounded-xl bg-zinc-900 border border-zinc-800/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Score History</h2>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              Brand Score
            </div>
          </div>
          {chartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={12} domain={[0, 100]} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "1px solid #27272a",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    labelStyle={{ color: "#a1a1aa" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#areaGradient)"
                    dot={{ fill: "#3b82f6", strokeWidth: 0, r: 4 }}
                    activeDot={{ fill: "#3b82f6", strokeWidth: 0, r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-zinc-500">
              Run an analysis to see score history
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-800/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Button
              onClick={runAnalysis}
              disabled={isRunningAnalysis}
              className="w-full justify-start gap-3 h-12 bg-zinc-800 hover:bg-zinc-700 text-white border-0"
            >
              {isRunningAnalysis ? (
                <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
              ) : (
                <Sparkles className="h-5 w-5 text-blue-400" />
              )}
              {isRunningAnalysis ? "Running Analysis..." : "Run New Analysis"}
            </Button>
            <Link href="/dashboard/reports" className="block">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12 bg-transparent border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                <BarChart3 className="h-5 w-5 text-purple-400" />
                View Reports
              </Button>
            </Link>
            <Link href="/dashboard/competitors" className="block">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12 bg-transparent border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                <Users className="h-5 w-5 text-emerald-400" />
                Manage Competitors
              </Button>
            </Link>
            <Link href="/dashboard/settings" className="block">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12 bg-transparent border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                <Zap className="h-5 w-5 text-amber-400" />
                Upgrade Plan
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string
  value: string
  subtitle: string
  icon: any
  color: "blue" | "purple" | "emerald" | "red" | "amber"
}) {
  const colorClasses = {
    blue: "from-blue-500/20 to-blue-500/5 text-blue-400",
    purple: "from-purple-500/20 to-purple-500/5 text-purple-400",
    emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-400",
    red: "from-red-500/20 to-red-500/5 text-red-400",
    amber: "from-amber-500/20 to-amber-500/5 text-amber-400",
  }

  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800/50 p-5">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`h-10 w-10 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-zinc-500 mt-1">
        <span className="text-zinc-400">{title}</span> {subtitle}
      </div>
    </div>
  )
}
