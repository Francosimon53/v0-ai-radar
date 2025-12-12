"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, TrendingUp, TrendingDown, Target } from "lucide-react"
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
      const res = await fetch("/api/dashboard")
      const data = await res.json()
      setDashboardData(data)
    } catch (error) {
      console.error("Failed to load dashboard:", error)
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
      const res = await fetch("/api/analysis/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configId: dashboardData.configId }),
      })

      if (!res.ok) throw new Error("Analysis failed")

      toast({
        title: "Success",
        description: "Analysis completed successfully",
      })

      loadDashboard()
    } catch (error) {
      console.error("Analysis error:", error)
      toast({
        title: "Error",
        description: "Failed to run analysis",
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

  const { brand, metrics } = dashboardData

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{brand?.name || "Dashboard"}</h1>
          <p className="text-zinc-400">Overview of your brand perception across AI models</p>
        </div>
        <Button onClick={handleRunAnalysis} disabled={runningAnalysis}>
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

      {/* Last Updated */}
      <Card className="border-zinc-800 bg-zinc-900 p-6">
        <p className="text-sm text-zinc-400">
          Last updated: <span className="text-white">{brand?.lastUpdated || "Never"}</span>
        </p>
      </Card>
    </div>
  )
}
