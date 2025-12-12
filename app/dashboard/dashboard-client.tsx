"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Sparkles, TrendingUp, Users, BarChart3, Loader2 } from "lucide-react"
import { Target } from "lucide-react" // Import Target component

interface DashboardData {
  brand: string
  configId: string
  score: number
  shareOfVoice: number
  sentiment: string
  competitorsCount: number
  analysisCount: number
}

export default function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard")
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login")
          return
        }
        throw new Error("Failed to load dashboard")
      }
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error("[v0] Dashboard load error:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRunAnalysis = async () => {
    if (!data?.configId) return

    setIsRunningAnalysis(true)
    try {
      const response = await fetch("/api/analysis/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configId: data.configId }),
      })

      if (!response.ok) throw new Error("Analysis failed")

      const result = await response.json()
      toast({
        title: "Analysis Complete",
        description: `Brand Score: ${result.brandScore}/100`,
      })

      await loadDashboardData()
    } catch (error) {
      console.error("[v0] Analysis error:", error)
      toast({
        title: "Error",
        description: "Failed to run analysis",
        variant: "destructive",
      })
    } finally {
      setIsRunningAnalysis(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <p>No data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{data.brand}</h1>
          <p className="text-muted-foreground">Brand Health Score</p>
        </div>
        <Button onClick={handleRunAnalysis} disabled={isRunningAnalysis}>
          {isRunningAnalysis ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Run Analysis
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brand Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" /> {/* Use Target component */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.score}/100</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Share of Voice</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.shareOfVoice}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Competitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.competitorsCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analyses</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.analysisCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ready to analyze {data.brand}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Run your first analysis to see how AI models perceive your brand</p>
          <Button onClick={handleRunAnalysis} disabled={isRunningAnalysis}>
            {isRunningAnalysis ? "Running..." : "Run Analysis"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
