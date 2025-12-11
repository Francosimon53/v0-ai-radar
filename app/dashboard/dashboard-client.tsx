"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  AlertTriangle,
  Lightbulb,
  Zap,
  BarChart3,
  Users,
  Brain,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Compass,
  Rocket,
  ChevronRight,
} from "lucide-react"

interface DashboardData {
  brand: string
  configId: string
  score: number
  previousScore: number | null
  shareOfVoice: number
  sentiment: string
  competitorsCount: number
  analysisCount: number
  lastAnalysis: string | null
}

interface AnalysisResult {
  success: boolean
  brandScore: number
  shareOfVoice: number
  sentiment: string
  summary: string
  result: {
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    threats: string[]
    modelBreakdown: { model: string; score: number; sentiment: string }[]
    competitorScores: { name: string; score: number; shareOfVoice: number }[]
  }
  planSummary?: {
    northStarGoal: string
    quickWins: { title: string; description: string }[]
    backlogCount: number
  }
}

export default function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [latestAnalysis, setLatestAnalysis] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

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
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const runAnalysis = async () => {
    if (!data?.configId) {
      toast({
        title: "Setup Required",
        description: "Please complete the setup wizard first.",
        variant: "destructive",
      })
      router.push("/dashboard/setup")
      return
    }

    setIsRunningAnalysis(true)
    setLatestAnalysis(null)

    try {
      toast({
        title: "Analysis Started",
        description: "Analyzing your brand with AI models (30-60 seconds)...",
      })

      const response = await fetch("/api/analysis/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configId: data.configId }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || result.message || "Analysis failed")
      }

      setLatestAnalysis(result)
      loadDashboardData()

      toast({
        title: "Analysis Complete",
        description: `Brand score: ${result.brandScore}/100`,
      })
    } catch (err: any) {
      toast({
        title: "Analysis Failed",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsRunningAnalysis(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
            <h3 className="font-semibold text-lg">Error Loading Dashboard</h3>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const scoreColor = (score: number) => {
    if (score >= 70) return "text-emerald-500"
    if (score >= 50) return "text-amber-500"
    return "text-red-500"
  }

  const sentimentIcon = (sentiment: string) => {
    if (sentiment === "positive") return <TrendingUp className="h-5 w-5 text-emerald-500" />
    if (sentiment === "negative") return <TrendingDown className="h-5 w-5 text-red-500" />
    return <BarChart3 className="h-5 w-5 text-amber-500" />
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{data?.brand || "Your Brand"}</h1>
          <p className="text-muted-foreground mt-1">AI Brand Perception Analysis</p>
        </div>
        <Button
          onClick={runAnalysis}
          disabled={isRunningAnalysis}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg"
        >
          {isRunningAnalysis ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Run Analysis
            </>
          )}
        </Button>
      </div>

      {/* Analysis Running State */}
      {isRunningAnalysis && (
        <Card className="border-blue-500/50 bg-blue-500/5">
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
                <Brain className="h-8 w-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">Analyzing {data?.brand}</h3>
                <p className="text-muted-foreground">Querying AI models for brand perception data...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Latest Analysis Results */}
      {latestAnalysis && !isRunningAnalysis && (
        <div className="space-y-6">
          {/* Score Hero */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
              <div className="grid md:grid-cols-4 gap-8 items-center">
                {/* Score Circle */}
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-slate-700"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="url(#scoreGradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${(latestAnalysis.brandScore / 100) * 352} 352`}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold text-white">{latestAnalysis.brandScore}</span>
                      <span className="text-sm text-slate-400">/100</span>
                    </div>
                  </div>
                  <span className="mt-2 text-slate-300 font-medium">Brand Score</span>
                </div>

                {/* Key Metrics */}
                <div className="space-y-4">
                  <div>
                    <p className="text-slate-400 text-sm">Share of Voice</p>
                    <p className="text-2xl font-bold text-white">{latestAnalysis.shareOfVoice}%</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Sentiment</p>
                    <div className="flex items-center gap-2">
                      {sentimentIcon(latestAnalysis.sentiment)}
                      <span className="text-xl font-semibold text-white capitalize">{latestAnalysis.sentiment}</span>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="md:col-span-2">
                  <p className="text-slate-400 text-sm mb-2">Executive Summary</p>
                  <p className="text-slate-200 leading-relaxed">{latestAnalysis.summary}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* SWOT Analysis */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-emerald-600">
                  <Shield className="h-4 w-4" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {latestAnalysis.result.strengths.map((s, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="h-4 w-4" />
                  Weaknesses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {latestAnalysis.result.weaknesses.map((w, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-500/30 bg-blue-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-600">
                  <Lightbulb className="h-4 w-4" />
                  Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {latestAnalysis.result.opportunities.map((o, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <Zap className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-red-500/30 bg-red-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-600">
                  <Target className="h-4 w-4" />
                  Threats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {latestAnalysis.result.threats.map((t, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Model Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI Model Breakdown
              </CardTitle>
              <CardDescription>How each AI model perceives your brand</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {latestAnalysis.result.modelBreakdown.map((model, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Brain className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{model.model}</p>
                        <p className="text-sm text-muted-foreground capitalize">{model.sentiment} sentiment</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${scoreColor(model.score)}`}>{model.score}</p>
                      <p className="text-xs text-muted-foreground">/100</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Competitor Comparison */}
          {latestAnalysis.result.competitorScores.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Competitor Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Your Brand */}
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex-1">
                      <p className="font-semibold">{data?.brand} (You)</p>
                      <div className="h-2 rounded-full bg-muted mt-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                          style={{ width: `${latestAnalysis.shareOfVoice}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{latestAnalysis.brandScore}</p>
                      <p className="text-xs text-muted-foreground">{latestAnalysis.shareOfVoice}% SoV</p>
                    </div>
                  </div>

                  {/* Competitors */}
                  {latestAnalysis.result.competitorScores.map((comp, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                      <div className="flex-1">
                        <p className="font-medium">{comp.name}</p>
                        <div className="h-2 rounded-full bg-muted mt-2 overflow-hidden">
                          <div
                            className="h-full bg-slate-400 rounded-full"
                            style={{ width: `${comp.shareOfVoice}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${scoreColor(comp.score)}`}>{comp.score}</p>
                        <p className="text-xs text-muted-foreground">{comp.shareOfVoice}% SoV</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Strategic Plan */}
          {latestAnalysis.planSummary && (
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-br from-violet-950 via-slate-900 to-slate-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Compass className="h-5 w-5 text-violet-400" />
                    Strategic Plan
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    AI-generated action plan based on your analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* North Star Goal */}
                  <div className="p-4 rounded-lg bg-violet-500/10 border border-violet-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-5 w-5 text-violet-400" />
                      <span className="text-sm font-medium text-violet-300">North Star Goal</span>
                    </div>
                    <p className="text-lg text-white">{latestAnalysis.planSummary.northStarGoal}</p>
                  </div>

                  {/* Quick Wins */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Rocket className="h-5 w-5 text-emerald-400" />
                      <span className="text-sm font-medium text-emerald-300">Quick Wins (Next 7 Days)</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      {latestAnalysis.planSummary.quickWins.slice(0, 4).map((win, i) => (
                        <div key={i} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-white text-sm">{win.title}</p>
                              <p className="text-xs text-slate-400 mt-1">{win.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* View Full Plan */}
                  <Button
                    variant="outline"
                    className="w-full border-violet-500/30 text-violet-300 hover:bg-violet-500/10 bg-transparent"
                    onClick={() => router.push("/dashboard/reports")}
                  >
                    View Full Strategic Plan
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Empty State - No Analysis Yet */}
      {!latestAnalysis && !isRunningAnalysis && (
        <Card className="border-dashed">
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Ready to Analyze {data?.brand}</h3>
                <p className="text-muted-foreground mt-1 max-w-md">
                  Run your first AI analysis to see how GPT-4 and Claude perceive your brand compared to competitors.
                </p>
              </div>
              <Button
                onClick={runAnalysis}
                size="lg"
                className="mt-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Run First Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data?.competitorsCount || 0}</p>
                <p className="text-sm text-muted-foreground">Competitors</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data?.analysisCount || 0}</p>
                <p className="text-sm text-muted-foreground">Analyses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Brain className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">2</p>
                <p className="text-sm text-muted-foreground">AI Models</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data?.score || 0}</p>
                <p className="text-sm text-muted-foreground">Last Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
