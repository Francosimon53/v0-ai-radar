"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  HelpCircle,
  Users,
  BarChart3,
  Bell,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  AlertTriangle,
  Award,
  Loader2,
  Sparkles,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import Link from "next/link"

// Types
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

export default function DashboardClient() {
  const { toast } = useToast()
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [timeRange, setTimeRange] = useState("30d")
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard")
      const result = await response.json()
      setData(result)

      // Set initial selected brands
      if (result.brand?.name) {
        setSelectedBrands([result.brand.name.toLowerCase()])
      }
    } catch (error) {
      console.error("Failed to load dashboard:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) => (prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]))
  }

  const runAnalysis = async () => {
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
        description: "Your brand analysis is running. This may take a few minutes.",
      })

      const response = await fetch("/api/analysis/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configId: data.configId }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Analysis failed")
      }

      toast({
        title: "Analysis Complete",
        description: "Your brand report is ready to view.",
      })

      // Reload dashboard data
      loadDashboardData()
    } catch (error: any) {
      toast({
        title: "Analysis Failed",
        description: error.message || "An error occurred while running the analysis.",
        variant: "destructive",
      })
    } finally {
      setIsRunningAnalysis(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!data?.hasConfig) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="h-16 w-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
          <Sparkles className="h-8 w-8 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to AI Vibes Radar</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Set up your brand tracking to see how AI models perceive your brand compared to competitors.
        </p>
        <Link href="/dashboard/setup">
          <Button className="bg-blue-600 hover:bg-blue-700">
            Start Setup Wizard
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    )
  }

  const brandData = data.brand!
  const metricsData = [
    {
      title: "Questions Tracked",
      value: data.metrics.questionsTracked.toString(),
      subtitle: "across 7 AI models",
      icon: HelpCircle,
    },
    {
      title: "Competitors",
      value: data.metrics.competitorsCount.toString(),
      subtitle: "being monitored",
      icon: Users,
    },
    {
      title: "Analyses Run",
      value: data.metrics.analysesRun.toString(),
      subtitle: "this month",
      icon: BarChart3,
    },
    {
      title: "Active Alerts",
      value: data.metrics.activeAlerts.toString(),
      subtitle: "need attention",
      icon: Bell,
    },
  ]

  const trendData = data.analysisHistory.map((item: any) => {
    const date = new Date(item.created_at)
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      [brandData.name.toLowerCase()]: item.score || 0,
      ...Object.fromEntries(
        (data.competitors || []).map((comp: string, idx: number) => [
          comp.toLowerCase(),
          item.competitor_scores?.[idx] || 0,
        ]),
      ),
    }
  })

  // Build sparkline data
  const brandScoreSparkline = data.analysisHistory.slice(-6).map((item: any) => ({
    value: item.score || 0,
  }))

  // Define brand colors dynamically
  const brandColors: Record<string, string> = {
    [brandData.name.toLowerCase()]: "#3b82f6",
  }
  ;(data.competitors || []).forEach((comp: string, idx: number) => {
    const colors = ["#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]
    brandColors[comp.toLowerCase()] = colors[idx % colors.length]
  })

  // Map alerts to display format
  const alertsData = data.recentAlerts.map((alert: any) => ({
    id: alert.id,
    type: alert.type,
    title: alert.title,
    description: alert.message,
    time: formatTimeAgo(new Date(alert.created_at)),
    color: alert.type === "score_drop" ? "red" : alert.type === "competitor_rise" ? "yellow" : "green",
  }))

  return (
    <div className="space-y-6">
      {/* Brand Health Hero */}
      <Card className="border-border bg-gradient-to-br from-blue-600/20 via-card to-card overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Award className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{brandData.name}</h2>
                  <p className="text-sm text-muted-foreground">Brand Health Score</p>
                </div>
              </div>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-5xl font-bold text-foreground">{brandData.score}</span>
                <span className="text-2xl text-muted-foreground">/100</span>
                {brandData.trend !== 0 && (
                  <span
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${brandData.trend >= 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                  >
                    {brandData.trend >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {Math.abs(brandData.trend)} pts
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Rank</p>
                  <p className="text-lg font-semibold text-foreground">
                    #{brandData.rank} of {brandData.totalCompetitors}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Share of Voice</p>
                  <p className="text-lg font-semibold text-foreground">{brandData.shareOfVoice}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gap to #2</p>
                  <p className="text-lg font-semibold text-green-400">
                    {brandData.competitorGap >= 0 ? "+" : ""}
                    {brandData.competitorGap} pts
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Next Analysis</p>
                  <p className="text-lg font-semibold text-foreground">
                    {brandData.nextAnalysis > 0 ? `${brandData.nextAnalysis}h` : "Ready"}
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-64 h-32">
              {brandScoreSparkline.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={brandScoreSparkline}>
                    <defs>
                      <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#heroGradient)"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Action - Run Analysis */}
      {brandData.score === 0 && (
        <Card className="border-blue-500/50 bg-blue-500/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">Ready to analyze your brand</h3>
                <p className="text-sm text-muted-foreground">
                  Run your first analysis to see how AI models perceive {brandData.name}
                </p>
              </div>
              <Button onClick={runAnalysis} disabled={isRunningAnalysis} className="bg-blue-600 hover:bg-blue-700">
                {isRunningAnalysis ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Run First Analysis
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricsData.map((metric, index) => (
          <Card key={index} className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center">
                  <metric.icon className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.subtitle}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <Card className="lg:col-span-2 border-border bg-card">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-foreground">Brand Score Trends</CardTitle>
                <CardDescription>Compare performance across competitors</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border border-border overflow-hidden">
                  {["7d", "30d", "90d"].map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-3 py-1.5 text-sm transition-colors ${
                        timeRange === range
                          ? "bg-blue-600 text-white"
                          : "bg-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {Object.entries(brandColors).map(([brand, color]) => (
                <button
                  key={brand}
                  onClick={() => toggleBrand(brand)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedBrands.includes(brand) ? "opacity-100" : "opacity-40 hover:opacity-70"
                  }`}
                  style={{
                    backgroundColor: `${color}20`,
                    color: color,
                    borderWidth: 1,
                    borderColor: color,
                  }}
                >
                  {brand.charAt(0).toUpperCase() + brand.slice(1)}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {trendData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                      }}
                    />
                    {Object.entries(brandColors).map(
                      ([brand, color]) =>
                        selectedBrands.includes(brand) && (
                          <Line
                            key={brand}
                            type="monotone"
                            dataKey={brand}
                            stroke={color}
                            strokeWidth={2}
                            dot={false}
                          />
                        ),
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Run an analysis to see trend data
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts & Actions */}
        <div className="space-y-6">
          {/* Recent Alerts */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground text-base">Recent Alerts</CardTitle>
                <Link href="/dashboard/alerts">
                  <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                    View All
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {alertsData.length > 0 ? (
                alertsData.slice(0, 3).map((alert: any) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border-l-4 bg-slate-800/50 ${
                      alert.color === "red"
                        ? "border-red-500"
                        : alert.color === "yellow"
                          ? "border-yellow-500"
                          : "border-green-500"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle
                        className={`h-4 w-4 mt-0.5 ${
                          alert.color === "red"
                            ? "text-red-400"
                            : alert.color === "yellow"
                              ? "text-yellow-400"
                              : "text-green-400"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{alert.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{alert.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground text-sm">No alerts yet</div>
              )}
            </CardContent>
          </Card>

          {/* Run Analysis Card */}
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <Button
                onClick={runAnalysis}
                disabled={isRunningAnalysis}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isRunningAnalysis ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Analysis...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Run Analysis Now
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-2">Last updated: {brandData.lastUpdated}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Helper function
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (seconds < 60) return "Just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
  return date.toLocaleDateString()
}
