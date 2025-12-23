"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, BarChart3, Activity, Clock, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Analytics {
  totalAnalyses: number
  topBrands: Array<{ name: string; score: number; timestamp: string }>
  averageScores: {
    sentiment: number
    innovation: number
    trust: number
    sustainability: number
    value: number
  } | null
  timeline: Array<{ date: string; count: number }>
  categories: Array<{ category: string; count: number }>
  recentAnalyses: Array<{ brand: string; score: number; date: string }>
}

export default function AnalyticsClient() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  async function fetchAnalytics() {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/analytics")
      if (!response.ok) {
        throw new Error("Failed to fetch analytics")
      }
      const data = await response.json()
      setAnalytics(data)
    } catch (err) {
      console.error("Failed to fetch analytics:", err)
      setError("Failed to load analytics data")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
            <p className="text-zinc-400">Brand perception analysis insights</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-zinc-900 border-zinc-800 animate-pulse">
              <CardHeader className="h-20 bg-zinc-800/50 rounded-t-lg" />
              <CardContent className="h-16 bg-zinc-800/30" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-zinc-400">Brand perception analysis insights</p>
        </div>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={fetchAnalytics} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!analytics || analytics.totalAnalyses === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-zinc-400">Brand perception analysis insights</p>
        </div>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-12 text-center">
            <BarChart3 className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Analytics Data Yet</h3>
            <p className="text-zinc-400 mb-6">Start analyzing brands in the AI Chat to see insights here.</p>
            <Button asChild className="bg-orange-500 hover:bg-orange-600">
              <a href="/chat">Start Analyzing Brands</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const COLORS = ["#FF6B00", "#FF8C00", "#FFA500", "#FFB732", "#FFC864", "#FFD896", "#FFE8C8"]

  const avgScore =
    analytics.topBrands.length > 0
      ? Math.round(analytics.topBrands.reduce((sum, b) => sum + (b.score || 0), 0) / analytics.topBrands.length)
      : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-zinc-400">Brand perception analysis insights</p>
        </div>
        <Button onClick={fetchAnalytics} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">Total Analyses</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{analytics.totalAnalyses}</div>
            <p className="text-xs text-zinc-500">All time</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">Avg Overall Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{avgScore}</div>
            <p className="text-xs text-zinc-500">Out of 100</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">Categories</CardTitle>
            <Activity className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{analytics.categories.length}</div>
            <p className="text-xs text-zinc-500">Industries covered</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">Last 30 Days</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {analytics.timeline.reduce((sum, t) => sum + t.count, 0)}
            </div>
            <p className="text-xs text-zinc-500">Recent analyses</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Brands */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Top 10 Brands by Score</CardTitle>
            <CardDescription className="text-zinc-400">Highest rated brands</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.topBrands.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.topBrands} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" domain={[0, 100]} stroke="#9CA3AF" />
                  <YAxis dataKey="name" type="category" width={100} stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#18181B", border: "1px solid #3F3F46", borderRadius: "8px" }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Bar dataKey="score" fill="#FF6B00" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-zinc-500">No brand data available</div>
            )}
          </CardContent>
        </Card>

        {/* Average Dimensional Scores */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Average Dimensional Scores</CardTitle>
            <CardDescription className="text-zinc-400">Across all analyses</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.averageScores ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { dimension: "Sentiment", score: analytics.averageScores.sentiment },
                    { dimension: "Innovation", score: analytics.averageScores.innovation },
                    { dimension: "Trust", score: analytics.averageScores.trust },
                    { dimension: "Sustainability", score: analytics.averageScores.sustainability },
                    { dimension: "Value", score: analytics.averageScores.value },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="dimension" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#18181B", border: "1px solid #3F3F46", borderRadius: "8px" }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Bar dataKey="score" fill="#FFA500" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-zinc-500">
                No dimensional data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Analysis Timeline</CardTitle>
            <CardDescription className="text-zinc-400">Last 30 days activity</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.timeline.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="date"
                    stroke="#9CA3AF"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    }
                  />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#18181B", border: "1px solid #3F3F46", borderRadius: "8px" }}
                    labelStyle={{ color: "#fff" }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#FF6B00"
                    strokeWidth={2}
                    dot={{ fill: "#FF6B00", strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: "#FFA500" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-zinc-500">No timeline data available</div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Category Breakdown</CardTitle>
            <CardDescription className="text-zinc-400">Analyses by industry</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.categories.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.categories}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: "#6B7280" }}
                  >
                    {analytics.categories.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#18181B", border: "1px solid #3F3F46", borderRadius: "8px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-zinc-500">No category data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Analyses Table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Analyses</CardTitle>
          <CardDescription className="text-zinc-400">Latest brand analyses</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.recentAnalyses.length > 0 ? (
            <div className="space-y-3">
              {analytics.recentAnalyses.map((analysis, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <div>
                    <p className="font-medium text-white">{analysis.brand}</p>
                    <p className="text-sm text-zinc-400">
                      {new Date(analysis.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-500">{analysis.score || "N/A"}</p>
                    <p className="text-xs text-zinc-500">Score</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-500">No recent analyses</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
