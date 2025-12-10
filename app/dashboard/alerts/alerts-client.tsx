"use client"

import type React from "react"
import dynamic from "next/dynamic"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Bell,
  Settings,
  TrendingDown,
  TrendingUp,
  Trophy,
  AlertCircle,
  ChevronRight,
  ArrowDown,
  ArrowUp,
  LayoutDashboard,
  Loader2,
} from "lucide-react"

const AlertChart = dynamic(() => import("./alert-chart"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
    </div>
  ),
})

type AlertType = "score_drop" | "competitor_rise" | "rank_change" | "milestone" | "system"
type AlertSeverity = "high" | "medium" | "low"

interface Alert {
  id: string
  type: AlertType
  title: string
  message: string
  time: string
  timestamp: Date
  severity: AlertSeverity
  read: boolean
  data?: {
    from?: number
    to?: number
    change?: number
    brand?: string
    metric?: string
  }
}

// Sample alert data
const sampleAlerts: Alert[] = [
  {
    id: "1",
    type: "score_drop",
    title: "Innovation score dropped 6 points",
    message:
      "Your innovation perception fell from 88 to 82. This correlates with competitor Adidas launching their new campaign.",
    time: "2 hours ago",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    severity: "high",
    read: false,
    data: { from: 88, to: 82, change: -6, metric: "Innovation" },
  },
  {
    id: "2",
    type: "competitor_rise",
    title: "Adidas gained 5 points in sustainability",
    message: "Adidas sustainability score rose from 73 to 78, closing the gap with your brand.",
    time: "1 day ago",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    severity: "medium",
    read: false,
    data: { from: 73, to: 78, change: 5, brand: "Adidas", metric: "Sustainability" },
  },
  {
    id: "3",
    type: "milestone",
    title: "You reached #1 in customer trust!",
    message: "Congratulations! Your brand is now ranked #1 for customer trust perception among your competitors.",
    time: "3 days ago",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    severity: "low",
    read: true,
  },
  {
    id: "4",
    type: "system",
    title: "Weekly analysis complete",
    message: "Your weekly brand intelligence report is ready to view.",
    time: "5 days ago",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    severity: "low",
    read: true,
  },
  {
    id: "5",
    type: "rank_change",
    title: "Your ranking improved in value perception",
    message: "Nike moved from #3 to #2 in value perception category, surpassing New Balance.",
    time: "1 week ago",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    severity: "medium",
    read: true,
    data: { from: 3, to: 2, metric: "Value Perception" },
  },
  {
    id: "6",
    type: "score_drop",
    title: "Affordability perception declined",
    message: "Your affordability score decreased by 4 points following the price increase announcement.",
    time: "2 weeks ago",
    timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    severity: "medium",
    read: true,
    data: { from: 65, to: 61, change: -4, metric: "Affordability" },
  },
]

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
    icon: ArrowUp,
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
    icon: LayoutDashboard,
    color: "text-blue-500",
    borderColor: "border-l-blue-500",
    bgColor: "bg-blue-500/10",
    label: "System",
  },
}

const filterTabs: { key: AlertType | "all"; label: string }[] = [
  { key: "all", label: "All Alerts" },
  { key: "score_drop", label: "Score Drops" },
  { key: "competitor_rise", label: "Competitor" },
  { key: "rank_change", label: "Rank Changes" },
  { key: "milestone", label: "Milestones" },
  { key: "system", label: "System" },
]

export default function AlertsClient() {
  const [alerts, setAlerts] = useState<Alert[]>(sampleAlerts)
  const [activeFilter, setActiveFilter] = useState<AlertType | "all">("all")
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Settings state
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [scoreDropEnabled, setScoreDropEnabled] = useState(true)
  const [scoreDropThreshold, setScoreDropThreshold] = useState("5")
  const [competitorEnabled, setCompetitorEnabled] = useState(true)
  const [competitorThreshold, setCompetitorThreshold] = useState("5")
  const [weeklyDigest, setWeeklyDigest] = useState(true)
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false)

  const filteredAlerts = activeFilter === "all" ? alerts : alerts.filter((a) => a.type === activeFilter)

  const unreadCount = alerts.filter((a) => !a.read).length
  const getCountByType = (type: AlertType) => alerts.filter((a) => a.type === type).length

  const handleAlertClick = (alert: Alert) => {
    setSelectedAlert(alert)
    setIsDetailOpen(true)
    // Mark as read
    setAlerts((prev) => prev.map((a) => (a.id === alert.id ? { ...a, read: true } : a)))
  }

  const markAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })))
  }

  // Generate chart data for the selected alert
  const getChartData = (alert: Alert) => {
    if (!alert.data) return []
    const baseValue = alert.data.to || 75
    return Array.from({ length: 7 }, (_, i) => ({
      date: `Day ${i + 1}`,
      value: baseValue + Math.floor(Math.random() * 10 - 5) + (i < 5 ? (alert.data?.change || 0) * (1 - i / 5) : 0),
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alerts</h1>
          <p className="text-muted-foreground">Stay informed about changes in your brand perception</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5">
            <Bell className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">{unreadCount} unread</span>
          </div>
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={unreadCount === 0}>
            Mark all read
          </Button>
          <Button variant="outline" size="icon" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-4">
        {filterTabs.map((tab) => {
          const count = tab.key === "all" ? alerts.length : getCountByType(tab.key as AlertType)
          const isActive = activeFilter === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-background"
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="mb-2 font-medium">No alerts</h3>
              <p className="text-sm text-muted-foreground">
                {activeFilter === "all"
                  ? "You're all caught up! No alerts at this time."
                  : `No ${alertTypeConfig[activeFilter as AlertType]?.label.toLowerCase()} alerts.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => {
            const config = alertTypeConfig[alert.type]
            const Icon = config.icon
            return (
              <Card
                key={alert.id}
                className={`cursor-pointer border-l-4 transition-all hover:shadow-md ${config.borderColor} ${
                  !alert.read ? "bg-blue-500/5" : ""
                }`}
                onClick={() => handleAlertClick(alert)}
              >
                <CardContent className="flex items-start gap-4 p-4">
                  <div className={`rounded-lg p-2 ${config.bgColor}`}>
                    <Icon className={`h-5 w-5 ${config.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {!alert.read && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                        <h3 className={`font-medium ${!alert.read ? "text-foreground" : "text-muted-foreground"}`}>
                          {alert.title}
                        </h3>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">{alert.time}</span>
                    </div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{alert.message}</p>
                    {alert.data && (
                      <div className="mt-2 flex items-center gap-3">
                        {alert.data.change !== undefined && (
                          <span
                            className={`flex items-center gap-1 text-sm font-medium ${
                              alert.data.change > 0 ? "text-green-500" : "text-red-500"
                            }`}
                          >
                            {alert.data.change > 0 ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : (
                              <ArrowDown className="h-3 w-3" />
                            )}
                            {Math.abs(alert.data.change)} points
                          </span>
                        )}
                        {alert.data.metric && (
                          <span className="rounded bg-muted px-2 py-0.5 text-xs">{alert.data.metric}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Alert Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          {selectedAlert && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2 ${alertTypeConfig[selectedAlert.type].bgColor}`}>
                    {(() => {
                      const Icon = alertTypeConfig[selectedAlert.type].icon
                      return <Icon className={`h-5 w-5 ${alertTypeConfig[selectedAlert.type].color}`} />
                    })()}
                  </div>
                  <div>
                    <DialogTitle>{selectedAlert.title}</DialogTitle>
                    <p className="text-sm text-muted-foreground">{selectedAlert.time}</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                {/* Mini Chart */}
                {selectedAlert.data && (
                  <div className="h-32 rounded-lg bg-muted/50 p-3">
                    <AlertChart data={getChartData(selectedAlert)} />
                  </div>
                )}

                <p className="text-sm">{selectedAlert.message}</p>

                {/* Possible Causes */}
                <div className="rounded-lg border p-3">
                  <h4 className="mb-2 text-sm font-medium">Possible Causes</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <AlertCircle className="h-3 w-3" />
                      Recent competitor marketing campaign
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertCircle className="h-3 w-3" />
                      Product launch timing
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertCircle className="h-3 w-3" />
                      Social media sentiment shift
                    </li>
                  </ul>
                </div>

                {/* Recommended Actions */}
                <div className="rounded-lg border p-3">
                  <h4 className="mb-2 text-sm font-medium">Recommended Actions</h4>
                  <ol className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                        1
                      </span>
                      Review competitor's recent campaigns and messaging
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                        2
                      </span>
                      Analyze customer feedback for recurring themes
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                        3
                      </span>
                      Consider targeted content addressing perception gap
                    </li>
                  </ol>
                </div>

                <Button className="w-full" onClick={() => setIsDetailOpen(false)}>
                  View Full Report
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Settings Sheet */}
      <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Alert Settings</SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Email Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive alerts via email</p>
              </div>
              <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
            </div>

            {/* Score Drop Alerts */}
            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Score Drop Alerts</Label>
                  <p className="text-sm text-muted-foreground">Alert when scores fall significantly</p>
                </div>
                <Switch checked={scoreDropEnabled} onCheckedChange={setScoreDropEnabled} />
              </div>
              {scoreDropEnabled && (
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-muted-foreground">Threshold:</Label>
                  <Select value={scoreDropThreshold} onValueChange={setScoreDropThreshold}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 points</SelectItem>
                      <SelectItem value="5">5 points</SelectItem>
                      <SelectItem value="10">10 points</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Competitor Alerts */}
            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Competitor Rise Alerts</Label>
                  <p className="text-sm text-muted-foreground">Alert when competitors gain ground</p>
                </div>
                <Switch checked={competitorEnabled} onCheckedChange={setCompetitorEnabled} />
              </div>
              {competitorEnabled && (
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-muted-foreground">Threshold:</Label>
                  <Select value={competitorThreshold} onValueChange={setCompetitorThreshold}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 points</SelectItem>
                      <SelectItem value="5">5 points</SelectItem>
                      <SelectItem value="10">10 points</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Weekly Digest */}
            <div className="flex items-center justify-between">
              <div>
                <Label>Weekly Digest</Label>
                <p className="text-sm text-muted-foreground">Get a summary every Monday</p>
              </div>
              <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
            </div>

            {/* Quiet Hours */}
            <div className="flex items-center justify-between">
              <div>
                <Label>Quiet Hours</Label>
                <p className="text-sm text-muted-foreground">No alerts 10pm - 8am</p>
              </div>
              <Switch checked={quietHoursEnabled} onCheckedChange={setQuietHoursEnabled} />
            </div>

            <Button className="w-full" onClick={() => setIsSettingsOpen(false)}>
              Save Settings
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
