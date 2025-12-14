"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Bell,
  TrendingDown,
  TrendingUp,
  Trophy,
  Loader2,
  FileText,
  AlertTriangle,
  Info,
  Zap,
  Clock,
} from "lucide-react"

type AlertType = "score_drop" | "competitor_rise" | "rank_change" | "milestone" | "system"
type AlertSeverity = "critical" | "warning" | "milestone" | "info"

interface Alert {
  id: string
  type: AlertType
  title: string
  message: string
  created_at: string
  severity: AlertSeverity
  read: boolean
  data?: {
    from?: number
    to?: number
    change?: number
    brand?: string
    metric?: string
  }
  models?: string[]
}

interface AlertSettings {
  emailEnabled: boolean
  scoreDropThreshold: number
  competitorAlerts: boolean
  weeklyDigest: boolean
}

const alertTypeConfig: Record<
  AlertType,
  { icon: React.ElementType; color: string; borderColor: string; bgColor: string; label: string }
> = {
  score_drop: {
    icon: TrendingDown,
    color: "text-red-500",
    borderColor: "border-l-red-500",
    bgColor: "bg-red-500/10",
    label: "Score Drops",
  },
  competitor_rise: {
    icon: TrendingUp,
    color: "text-yellow-500",
    borderColor: "border-l-yellow-500",
    bgColor: "bg-yellow-500/10",
    label: "Competitor Rises",
  },
  rank_change: {
    icon: TrendingUp,
    color: "text-purple-500",
    borderColor: "border-l-purple-500",
    bgColor: "bg-purple-500/10",
    label: "Rank Changes",
  },
  milestone: {
    icon: Trophy,
    color: "text-green-500",
    borderColor: "border-l-green-500",
    bgColor: "bg-green-500/10",
    label: "Milestones",
  },
  system: {
    icon: Bell,
    color: "text-blue-500",
    borderColor: "border-l-blue-500",
    bgColor: "bg-blue-500/10",
    label: "System",
  },
}

const MOCK_ALERTS: Alert[] = [
  {
    id: "1",
    severity: "critical",
    title: "AI Brand Score dropped by −6 points vs last scan",
    description: "Most of the drop is coming from Gemini and Perplexity responses in the US market.",
    timestamp: "Triggered 2 hours ago",
    models: ["ChatGPT", "Gemini", "Perplexity"],
  },
  {
    id: "2",
    severity: "critical",
    title: "Competitor Adidas overtook your brand in AI visibility",
    description: "Your share of voice fell from 41% to 33% in the last 7 days for 'best running shoes' queries.",
    timestamp: "Yesterday · 09:32",
    models: ["ChatGPT", "Claude"],
  },
  {
    id: "3",
    severity: "warning",
    title: "Sentiment shift detected in Claude responses",
    description: "Claude's brand perception moved from 'highly positive' to 'neutral' for sustainability topics.",
    timestamp: "2 days ago",
    models: ["Claude"],
  },
  {
    id: "4",
    severity: "milestone",
    title: "New all-time-high AI Brand Score: 87",
    description: "Strengths keywords shifted toward 'trust', 'support' and 'customer care' across all models.",
    timestamp: "3 days ago",
    models: ["ChatGPT", "Claude", "Gemini"],
  },
  {
    id: "5",
    severity: "milestone",
    title: "Share of Voice passed 45% milestone",
    description: "You now appear in 45% of AI recommendations vs competitors for top running queries.",
    timestamp: "4 days ago",
    models: ["ChatGPT", "Perplexity"],
  },
  {
    id: "6",
    severity: "warning",
    title: "Puma gaining visibility in training category",
    description: "Puma mentions increased by 12% in the 'best training shoes' category over the past week.",
    timestamp: "5 days ago",
    models: ["Gemini", "Perplexity"],
  },
  {
    id: "7",
    severity: "info",
    title: "Weekly Executive Digest generated",
    description:
      "Your AI Brand Report for the week of Dec 9–14 is ready. Key insight: sentiment improved across 3 models.",
    timestamp: "6 days ago",
    models: [],
  },
]

const severityConfig: Record<
  AlertSeverity,
  {
    icon: typeof AlertTriangle
    label: string
    badgeClass: string
    borderClass: string
    bgClass: string
  }
> = {
  critical: {
    icon: AlertTriangle,
    label: "Critical",
    badgeClass: "bg-red-500/10 text-red-400 border-red-500/30",
    borderClass: "border-l-red-500",
    bgClass: "bg-red-500/5",
  },
  warning: {
    icon: TrendingDown,
    label: "Warning",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    borderClass: "border-l-amber-500",
    bgClass: "bg-amber-500/5",
  },
  milestone: {
    icon: Trophy,
    label: "Milestone",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    borderClass: "border-l-emerald-500",
    bgClass: "bg-emerald-500/5",
  },
  info: {
    icon: Info,
    label: "Info",
    badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    borderClass: "border-l-blue-500",
    bgClass: "bg-blue-500/5",
  },
}

type FilterType = "all" | "critical" | "warning" | "milestone"

export default function AlertsClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")
  const [alerts] = useState<Alert[]>(MOCK_ALERTS)
  const { toast } = useToast()

  const kpis = useMemo(
    () => ({
      open: 7,
      critical: 2,
      milestones: 4,
    }),
    [],
  )

  const filteredAlerts = useMemo(() => {
    if (activeFilter === "all") return alerts
    if (activeFilter === "milestone") return alerts.filter((a) => a.severity === "milestone" || a.severity === "info")
    return alerts.filter((a) => a.severity === activeFilter)
  }, [alerts, activeFilter])

  const filterPills: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "critical", label: "Critical" },
    { key: "warning", label: "Warnings" },
    { key: "milestone", label: "Milestones" },
  ]

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const handleViewReport = (alertId: string) => {
    toast({
      title: "Opening report...",
      description: "Navigating to the related VIP report.",
    })
    router.push("/dashboard/reports/sample")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  const showEmptyState = alerts.length === 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Alerts & signals</h1>
          <p className="text-zinc-400 mt-1 max-w-2xl">
            Monitor how AI is talking about your brand in real time. Score drops, competitor surges and key milestones
            appear here first so your team can react before it shows up on social or search.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {filterPills.map((pill) => (
            <button
              key={pill.key}
              onClick={() => setActiveFilter(pill.key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeFilter === pill.key
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Bell className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Open alerts</p>
                <p className="text-2xl font-bold text-white">{kpis.open}</p>
                <p className="text-xs text-zinc-500">Active items that may require follow-up.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <Zap className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Critical this week</p>
                <p className="text-2xl font-bold text-white">{kpis.critical}</p>
                <p className="text-xs text-zinc-500">Major score drops or competitor surges.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Positive milestones</p>
                <p className="text-2xl font-bold text-white">{kpis.milestones}</p>
                <p className="text-xs text-zinc-500">New highs in AI Brand Score or share of voice.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showEmptyState ? (
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-4">
              <Bell className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">You're all clear for now</h3>
            <p className="text-zinc-400 text-center max-w-md mb-6">
              No active AI alerts. When we detect score drops, competitor surges or new milestones, they'll appear here
              so your team can act early.
            </p>
            <Button onClick={() => router.push("/dashboard")} className="bg-blue-600 hover:bg-blue-700">
              Run a new analysis
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const config = severityConfig[alert.severity]
            const Icon = config.icon

            return (
              <Card
                key={alert.id}
                className={`border-zinc-800 bg-zinc-900 border-l-4 ${config.borderClass} hover:bg-zinc-800/80 transition-colors`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${config.bgClass}`}>
                      <Icon
                        className={`h-5 w-5 ${
                          alert.severity === "critical"
                            ? "text-red-400"
                            : alert.severity === "warning"
                              ? "text-amber-400"
                              : alert.severity === "milestone"
                                ? "text-emerald-400"
                                : "text-blue-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={config.badgeClass}>
                            {config.label}
                          </Badge>
                          <h3 className="font-medium text-white">{alert.title}</h3>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-zinc-500 whitespace-nowrap">
                          <Clock className="h-3 w-3" />
                          {alert.timestamp}
                        </div>
                      </div>
                      <p className="text-sm text-zinc-400 mt-1">{alert.description}</p>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
                        <div className="flex items-center gap-2 flex-wrap">
                          {alert.models && alert.models.length > 0 && (
                            <span className="text-xs text-zinc-500">Models: {alert.models.join(", ")}</span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewReport(alert.id)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-7 px-2"
                        >
                          <FileText className="h-3.5 w-3.5 mr-1.5" />
                          View report
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {filteredAlerts.length === 0 && (
            <Card className="border-zinc-800 bg-zinc-900">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-8 w-8 text-zinc-600 mb-3" />
                <p className="text-zinc-400 text-center">
                  No {filterPills.find((p) => p.key === activeFilter)?.label.toLowerCase()} alerts to show.
                </p>
                <Button variant="ghost" size="sm" onClick={() => setActiveFilter("all")} className="mt-2 text-blue-400">
                  View all alerts
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <p className="text-xs text-zinc-500 text-center pt-4 border-t border-zinc-800">
        Note: This is a demo workspace. Alert data is simulated. In the production version, alerts are generated from
        real AI Brand Score changes, competitor activity and configured notification rules.
      </p>
    </div>
  )
}
