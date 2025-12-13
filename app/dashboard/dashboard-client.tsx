"use client"

// v4.0 - Premium UX upgrade

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  Target,
  Users,
  BarChart3,
  Bell,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Shield,
  Sparkles,
  FileText,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
// import { VIPReportModal } from "@/components/vip-report-modal"
// import { runBrandAnalysis } from "@/lib/analysis/run-brand-analysis"

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

interface DashboardClientProps {
  initialData: DashboardData | null
}

export default function DashboardClient({ initialData }: DashboardClientProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(initialData)
  const [loading, setLoading] = useState(!initialData)
  const [isRunning, setIsRunning] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!initialData) {
      loadDashboard()
    }
  }, [initialData])

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
      // setRunError("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  async function handleRunAnalysis() {
    if (isRunning) return

    // setRunError(null)
    setIsRunning(true)

    try {
      // const result = await runBrandAnalysis(dashboardData?.configId)

      // Refresh dashboard metrics
      // router.refresh()

      // Navigate to the new report
      await new Promise((resolve) => setTimeout(resolve, 1500))
      router.push("/dashboard/reports/sample")
      setIsRunning(false)
    } catch (error) {
      console.error("[v0] Run analysis error:", error)
      // setRunError(error instanceof Error ? error.message : "Analysis failed. Please try again.")
      setIsRunning(false)
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

  const isFirstTime = !latestAnalysis

  return (
    <div className="space-y-8">
      {/* <VIPReportModal isOpen={isVIPModalOpen} onClose={() => setIsVIPModalOpen(false)} /> */}

      <div className="fixed bottom-4 right-4 z-50 rounded-md bg-zinc-900 px-3 py-1.5 text-xs text-zinc-500 border border-zinc-800">
        v4.0
      </div>

      <div className="rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-950/30 via-zinc-900 to-zinc-950 p-8">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-3">
            See how AI recommends your brand in under 60 seconds
          </h1>
          <p className="text-lg text-zinc-400 mb-6">
            Connect your brand, add competitors and let AI run a full SWOT & ranking analysis for you and your clients.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleRunAnalysis}
              disabled={isRunning}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              {isRunning ? (
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
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/dashboard/reports/sample")}
              className="border-zinc-700 hover:bg-zinc-800 bg-transparent"
            >
              <FileText className="mr-2 h-4 w-4" />
              Preview VIP AI brand report
            </Button>
          </div>
          {/* <p className="mt-3 text-sm text-red-400">{runError}</p> */}
          <p className="text-xs text-zinc-500 mt-4">
            Preview mode – this analysis uses example data only. Your workspace admin can enable live AI scans in the
            full version.
          </p>
        </div>
      </div>

      {isFirstTime && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <p className="text-sm text-amber-300">
            <strong>No AI analysis yet.</strong> Run your first scan to unlock SWOT, competitor rankings and VIP
            reports.
          </p>
        </div>
      )}

      {isFirstTime && (
        <Card className="border-zinc-800 bg-zinc-900">
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
                <p className="mb-4 text-sm text-zinc-400">Tell us who you are so we can scan the right AI contexts.</p>
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
                <p className="mb-4 text-sm text-zinc-400">Add the 3–7 brands your clients worry about the most.</p>
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
                <p className="mb-4 text-sm text-zinc-400">
                  We ask AI assistants how they see and recommend your brand.
                </p>
                <Button
                  onClick={handleRunAnalysis}
                  disabled={isRunning}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  size="sm"
                >
                  {isRunning ? (
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

      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-xl text-white">Next: AI SWOT & competitor insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-zinc-300">
          <ul className="list-disc list-inside space-y-2">
            <li>Board-ready AI SWOT: strengths, weaknesses, opportunities and threats.</li>
            <li>Side-by-side competitor comparison based on AI scores and share of voice.</li>
            <li>Breakdown of how different AI models describe and rank your brand.</li>
          </ul>
        </CardContent>
      </Card>

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

      <div>
        <h2 className="mb-4 text-2xl font-bold text-white">AI SWOT Snapshot</h2>
        <p className="text-xs text-zinc-500">
          Score drops and new AI threats will automatically create alerts in your Alerts tab.
        </p>
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
              {latestAnalysis?.strengths && latestAnalysis.strengths.length > 0 ? (
                <ul className="space-y-2">
                  {latestAnalysis.strengths.slice(0, 3).map((strength, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                      <span className="mt-1 text-green-500">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-zinc-500 italic">Strong brand awareness in AI assistants (sample).</p>
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
              {latestAnalysis?.weaknesses && latestAnalysis.weaknesses.length > 0 ? (
                <ul className="space-y-2">
                  {latestAnalysis.weaknesses.slice(0, 3).map((weakness, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                      <span className="mt-1 text-yellow-500">•</span>
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-zinc-500 italic">Limited presence in Spanish-speaking queries (sample).</p>
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
              {latestAnalysis?.opportunities && latestAnalysis.opportunities.length > 0 ? (
                <ul className="space-y-2">
                  {latestAnalysis.opportunities.slice(0, 3).map((opportunity, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                      <span className="mt-1 text-blue-500">•</span>
                      <span>{opportunity}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-zinc-500 italic">Growing demand for AI-ready customer journeys (sample).</p>
              )}
            </CardContent>
          </Card>

          {/* Threats */}
          <Card className="border-red-500/20 bg-zinc-900">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-red-500/10 p-1.5">
                  <Shield className="h-4 w-4 text-red-500" />
                </div>
                <CardTitle className="text-base text-white">Threats</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {latestAnalysis?.threats && latestAnalysis.threats.length > 0 ? (
                <ul className="space-y-2">
                  {latestAnalysis.threats.slice(0, 3).map((threat, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                      <span className="mt-1 text-red-500">•</span>
                      <span>{threat}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-zinc-500 italic">
                  Competitors being recommended more often for key use cases (sample).
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Competitor Comparison */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-white">Competitor Comparison</CardTitle>
            <p className="text-sm text-zinc-400">How your brand scores vs competitors in AI responses</p>
          </CardHeader>
          <CardContent>
            {latestAnalysis?.competitorScores && latestAnalysis.competitorScores.length > 0 ? (
              <div className="space-y-4">
                {latestAnalysis.competitorScores.map((competitor, i) => (
                  <div key={i}>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{competitor.name}</span>
                        {i === 0 && (
                          <Badge variant="outline" className="border-blue-500/50 bg-blue-500/10 text-blue-500 text-xs">
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
            ) : (
              <div className="py-8 text-center">
                <Users className="mx-auto mb-3 h-10 w-10 text-zinc-700" />
                <p className="text-sm text-zinc-500 italic">
                  Once you run your first analysis, you'll see how each competitor is ranked by AI here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: AI Models Breakdown */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-white">AI Models Breakdown</CardTitle>
            <p className="text-sm text-zinc-400">How different AI models perceive your brand</p>
          </CardHeader>
          <CardContent>
            {latestAnalysis?.modelBreakdown && latestAnalysis.modelBreakdown.length > 0 ? (
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
            ) : (
              <div className="py-8 text-center">
                <Target className="mx-auto mb-3 h-10 w-10 text-zinc-700" />
                <p className="text-sm text-zinc-500 italic">
                  After your first analysis, this section will show how each AI model scores your brand.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
