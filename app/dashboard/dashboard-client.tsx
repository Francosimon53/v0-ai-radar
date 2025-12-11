"use client"

import { useState } from "react"
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
  Play,
  ChevronRight,
  AlertTriangle,
  Award,
  Loader2,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"

// Sample data
const brandData = {
  name: "Nike",
  score: 84,
  previousScore: 81,
  trend: 3,
  rank: 1,
  totalCompetitors: 5,
  shareOfVoice: 47,
  competitorGap: 6,
  nextAnalysis: 5,
  lastUpdated: "2 hours ago",
}

const metricsData = [
  {
    title: "Questions Tracked",
    value: "5",
    subtitle: "across 7 AI models",
    icon: HelpCircle,
  },
  {
    title: "Competitors",
    value: "4",
    subtitle: "being monitored",
    icon: Users,
  },
  {
    title: "Analyses Run",
    value: "12",
    subtitle: "this month",
    icon: BarChart3,
  },
  {
    title: "Active Alerts",
    value: "3",
    subtitle: "need attention",
    icon: Bell,
  },
]

const trendData = [
  { date: "Nov 1", nike: 78, adidas: 72, underarmour: 65, puma: 60 },
  { date: "Nov 8", nike: 80, adidas: 74, underarmour: 63, puma: 62 },
  { date: "Nov 15", nike: 79, adidas: 73, underarmour: 66, puma: 61 },
  { date: "Nov 22", nike: 82, adidas: 75, underarmour: 64, puma: 63 },
  { date: "Nov 29", nike: 81, adidas: 76, underarmour: 67, puma: 62 },
  { date: "Dec 6", nike: 84, adidas: 78, underarmour: 65, puma: 64 },
]

const sparklineData = [{ value: 72 }, { value: 74 }, { value: 73 }, { value: 75 }, { value: 76 }, { value: 78 }]

const leaderboardData = [
  { rank: 1, name: "Nike", score: 84, change: 3, isUser: true },
  { rank: 2, name: "Adidas", score: 78, change: 2, isUser: false },
  { rank: 3, name: "Under Armour", score: 65, change: -2, isUser: false },
  { rank: 4, name: "Puma", score: 64, change: 2, isUser: false },
  { rank: 5, name: "New Balance", score: 58, change: -1, isUser: false },
]

const alertsData = [
  {
    id: 1,
    type: "score_drop",
    title: "Competitor Score Increase",
    description: "Adidas score increased by 5 points",
    time: "2 hours ago",
    color: "yellow",
  },
  {
    id: 2,
    type: "milestone",
    title: "New Milestone Reached",
    description: "Your brand reached #1 ranking",
    time: "1 day ago",
    color: "green",
  },
  {
    id: 3,
    type: "threat",
    title: "Emerging Threat Detected",
    description: "Negative sentiment spike detected",
    time: "2 days ago",
    color: "red",
  },
]

const recommendedActions = [
  {
    id: 1,
    priority: "high",
    title: "Update brand messaging",
    description: "AI models showing inconsistent brand positioning",
  },
  {
    id: 2,
    priority: "medium",
    title: "Monitor Adidas campaign",
    description: "Competitor gaining share of voice",
  },
  {
    id: 3,
    priority: "low",
    title: "Review sustainability claims",
    description: "Opportunity to improve perception",
  },
]

const brandScoreSparkline = [{ value: 78 }, { value: 80 }, { value: 79 }, { value: 82 }, { value: 81 }, { value: 84 }]

export default function DashboardClient() {
  const { toast } = useToast()
  const [selectedBrands, setSelectedBrands] = useState<string[]>(["nike", "adidas"])
  const [timeRange, setTimeRange] = useState("30d")
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false)

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) => (prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]))
  }

  const brandColors: Record<string, string> = {
    nike: "#3b82f6",
    adidas: "#22c55e",
    underarmour: "#f59e0b",
    puma: "#ef4444",
  }

  const runAnalysis = async () => {
    setIsRunningAnalysis(true)

    try {
      toast({
        title: "Analysis Started",
        description: "Your brand analysis is running. This may take a few minutes.",
      })

      // Simulate analysis for demo
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Analysis Complete",
        description: "Your brand report is ready to view.",
      })
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "An error occurred while running the analysis. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRunningAnalysis(false)
    }
  }

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
                <span
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${brandData.trend >= 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                >
                  {brandData.trend >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {Math.abs(brandData.trend)} pts
                </span>
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
                  <p className="text-lg font-semibold text-green-400">+{brandData.competitorGap} pts</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Next Analysis</p>
                  <p className="text-lg font-semibold text-foreground">{brandData.nextAnalysis}h</p>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-64 h-32">
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
            </div>
          </div>
        </CardContent>
      </Card>

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
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${
                    selectedBrands.includes(brand)
                      ? "bg-slate-800 text-foreground"
                      : "bg-transparent text-muted-foreground border border-border"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                  {brand.charAt(0).toUpperCase() + brand.slice(1)}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} domain={[50, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                  />
                  {selectedBrands.includes("nike") && (
                    <Line type="monotone" dataKey="nike" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  )}
                  {selectedBrands.includes("adidas") && (
                    <Line type="monotone" dataKey="adidas" stroke="#22c55e" strokeWidth={2} dot={false} />
                  )}
                  {selectedBrands.includes("underarmour") && (
                    <Line type="monotone" dataKey="underarmour" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  )}
                  {selectedBrands.includes("puma") && (
                    <Line type="monotone" dataKey="puma" stroke="#ef4444" strokeWidth={2} dot={false} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Competitive Leaderboard</CardTitle>
            <CardDescription>AI perception rankings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {leaderboardData.map((item) => (
              <div
                key={item.rank}
                className={`flex items-center gap-3 p-3 rounded-lg ${item.isUser ? "bg-blue-500/10 border border-blue-500/30" : "bg-slate-800/50"}`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                    item.rank === 1
                      ? "bg-yellow-500/20 text-yellow-400"
                      : item.rank === 2
                        ? "bg-slate-400/20 text-slate-300"
                        : item.rank === 3
                          ? "bg-orange-500/20 text-orange-400"
                          : "bg-slate-700 text-slate-400"
                  }`}
                >
                  {item.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{item.name}</p>
                </div>
                <div className="w-16 h-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={item.change >= 0 ? "#22c55e" : "#ef4444"}
                        strokeWidth={1.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{item.score}</p>
                  <p className={`text-xs ${item.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {item.change >= 0 ? "+" : ""}
                    {item.change}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Recent Alerts</CardTitle>
              <CardDescription>Latest brand monitoring updates</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {alertsData.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border-l-2 ${
                  alert.color === "red"
                    ? "border-l-red-500"
                    : alert.color === "yellow"
                      ? "border-l-yellow-500"
                      : "border-l-green-500"
                }`}
              >
                <AlertTriangle
                  className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                    alert.color === "red"
                      ? "text-red-400"
                      : alert.color === "yellow"
                        ? "text-yellow-400"
                        : "text-green-400"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{alert.title}</p>
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recommended Actions */}
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Recommended Actions</CardTitle>
              <CardDescription>AI-powered suggestions</CardDescription>
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              size="sm"
              onClick={runAnalysis}
              disabled={isRunningAnalysis}
            >
              {isRunningAnalysis ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isRunningAnalysis ? "Running..." : "Run Analysis"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendedActions.map((action, index) => (
              <div key={action.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50">
                <span
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    action.priority === "high"
                      ? "bg-red-500/20 text-red-400"
                      : action.priority === "medium"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{action.title}</p>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
