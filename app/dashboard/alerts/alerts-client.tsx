"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  Bell,
  Settings,
  TrendingDown,
  TrendingUp,
  Trophy,
  ChevronRight,
  ArrowDown,
  ArrowUp,
  LayoutDashboard,
  Loader2,
  Trash2,
  CheckCheck,
} from "lucide-react"
import dynamic from "next/dynamic"

const AlertChart = dynamic(() => import("./alert-chart"), { ssr: false })

type AlertType = "score_drop" | "competitor_rise" | "rank_change" | "milestone" | "system"
type AlertSeverity = "high" | "medium" | "low"

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

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins} minutes ago`
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString()
}

export default function AlertsClient() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [activeFilter, setActiveFilter] = useState<AlertType | "all">("all")
  const { toast } = useToast()

  // Alert settings state
  const [alertSettings, setAlertSettings] = useState({
    emailEnabled: true,
    scoreDropThreshold: 5,
    competitorAlerts: true,
    weeklyDigest: true,
    quietHoursEnabled: false,
    quietHoursStart: "22:00",
    quietHoursEnd: "08:00",
  })

  useEffect(() => {
    fetchAlerts()
    fetchAlertSettings()
  }, [activeFilter])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (activeFilter !== "all") params.set("type", activeFilter)

      const response = await fetch(`/api/alerts?${params}`)
      const data = await response.json()

      if (data.alerts) {
        setAlerts(data.alerts)
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error("Error fetching alerts:", error)
      toast({
        title: "Error",
        description: "Failed to load alerts",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAlertSettings = async () => {
    try {
      const response = await fetch("/api/alert-settings")
      const data = await response.json()
      if (data.settings) {
        setAlertSettings(data.settings)
      }
    } catch (error) {
      console.error("Error fetching alert settings:", error)
    }
  }

  const handleMarkAsRead = async (alertId: string) => {
    try {
      await fetch("/api/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId, read: true }),
      })

      setAlerts(alerts.map((a) => (a.id === alertId ? { ...a, read: true } : a)))
      setUnreadCount(Math.max(0, unreadCount - 1))
    } catch (error) {
      console.error("Error marking alert as read:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await fetch("/api/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId: "all", read: true }),
      })

      setAlerts(alerts.map((a) => ({ ...a, read: true })))
      setUnreadCount(0)

      toast({
        title: "All alerts marked as read",
        description: `${alerts.filter((a) => !a.read).length} alerts updated`,
      })
    } catch (error) {
      console.error("Error marking all as read:", error)
    }
  }

  const handleDeleteAlert = async (alertId: string) => {
    try {
      await fetch(`/api/alerts?id=${alertId}`, { method: "DELETE" })

      const deletedAlert = alerts.find((a) => a.id === alertId)
      setAlerts(alerts.filter((a) => a.id !== alertId))
      if (deletedAlert && !deletedAlert.read) {
        setUnreadCount(Math.max(0, unreadCount - 1))
      }

      toast({
        title: "Alert deleted",
        description: "The alert has been removed",
      })
    } catch (error) {
      console.error("Error deleting alert:", error)
    }
  }

  const handleAlertClick = (alert: Alert) => {
    setSelectedAlert(alert)
    setShowDetail(true)
    if (!alert.read) {
      handleMarkAsRead(alert.id)
    }
  }

  const handleSaveSettings = async () => {
    try {
      await fetch("/api/alert-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alertSettings),
      })

      toast({
        title: "Settings saved",
        description: "Your alert preferences have been updated",
      })
      setShowSettings(false)
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    }
  }

  const filterTabs = [
    { key: "all" as const, label: "All", count: alerts.length },
    { key: "score_drop" as const, label: "Score Drops", count: alerts.filter((a) => a.type === "score_drop").length },
    {
      key: "competitor_rise" as const,
      label: "Competitors",
      count: alerts.filter((a) => a.type === "competitor_rise").length,
    },
    { key: "milestone" as const, label: "Milestones", count: alerts.filter((a) => a.type === "milestone").length },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Alerts</h1>
          <p className="text-slate-400 mt-1">Stay informed about changes in your brand perception</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full">{unreadCount} unread</span>
          )}
          {alerts.some((a) => !a.read) && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === tab.key ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {tab.label}
            <span
              className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                activeFilter === tab.key ? "bg-blue-600" : "bg-slate-700"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Empty State */}
      {alerts.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mb-4">
              <Bell className="h-8 w-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No alerts yet</h3>
            <p className="text-slate-400 text-center max-w-sm">
              When there are significant changes in your brand perception, you'll see alerts here.
            </p>
          </CardContent>
        </Card>
      ) : (
        /* Alert List */
        <div className="space-y-3">
          {alerts.map((alert) => {
            const config = alertTypeConfig[alert.type]
            const Icon = config.icon

            return (
              <Card
                key={alert.id}
                className={`bg-slate-800/50 border-slate-700 border-l-4 ${config.borderColor} cursor-pointer hover:bg-slate-800 transition-colors ${
                  !alert.read ? "bg-blue-500/5" : ""
                }`}
                onClick={() => handleAlertClick(alert)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${config.bgColor}`}>
                      <Icon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {!alert.read && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                          <h3 className="font-medium text-white">{alert.title}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 whitespace-nowrap">
                            {formatTimeAgo(alert.created_at)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteAlert(alert.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-400" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-400 mt-1 line-clamp-2">{alert.message}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-500 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Alert Detail Modal */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">{selectedAlert?.title}</DialogTitle>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <p className="text-slate-300">{selectedAlert.message}</p>

              {selectedAlert.data && (
                <div className="space-y-4">
                  {/* Mini Chart */}
                  <div className="h-32 bg-slate-800 rounded-lg p-4">
                    <AlertChart data={selectedAlert.data} type={selectedAlert.type} />
                  </div>

                  {/* Metrics */}
                  {selectedAlert.data.from !== undefined && selectedAlert.data.to !== undefined && (
                    <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Before</p>
                        <p className="text-lg font-bold text-white">{selectedAlert.data.from}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedAlert.data.change && selectedAlert.data.change > 0 ? (
                          <ArrowUp className="h-5 w-5 text-green-500" />
                        ) : (
                          <ArrowDown className="h-5 w-5 text-red-500" />
                        )}
                        <span
                          className={`font-bold ${
                            selectedAlert.data.change && selectedAlert.data.change > 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {selectedAlert.data.change && selectedAlert.data.change > 0 ? "+" : ""}
                          {selectedAlert.data.change}
                        </span>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500">After</p>
                        <p className="text-lg font-bold text-white">{selectedAlert.data.to}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="text-xs text-slate-500">{formatTimeAgo(selectedAlert.created_at)}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Settings Sheet */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent className="bg-slate-900 border-slate-700">
          <SheetHeader>
            <SheetTitle className="text-white">Alert Settings</SheetTitle>
          </SheetHeader>
          <div className="space-y-6 mt-6">
            {/* Email Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Email Notifications</Label>
                <p className="text-sm text-slate-400">Receive alerts via email</p>
              </div>
              <Switch
                checked={alertSettings.emailEnabled}
                onCheckedChange={(checked) => setAlertSettings({ ...alertSettings, emailEnabled: checked })}
              />
            </div>

            {/* Score Drop Threshold */}
            <div className="space-y-2">
              <Label className="text-white">Score Drop Threshold</Label>
              <p className="text-sm text-slate-400">Alert when score drops by this many points</p>
              <Select
                value={alertSettings.scoreDropThreshold.toString()}
                onValueChange={(value) =>
                  setAlertSettings({ ...alertSettings, scoreDropThreshold: Number.parseInt(value) })
                }
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="3">3 points</SelectItem>
                  <SelectItem value="5">5 points</SelectItem>
                  <SelectItem value="10">10 points</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Competitor Alerts */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Competitor Alerts</Label>
                <p className="text-sm text-slate-400">Get notified when competitors improve</p>
              </div>
              <Switch
                checked={alertSettings.competitorAlerts}
                onCheckedChange={(checked) => setAlertSettings({ ...alertSettings, competitorAlerts: checked })}
              />
            </div>

            {/* Weekly Digest */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Weekly Digest</Label>
                <p className="text-sm text-slate-400">Receive a weekly summary email</p>
              </div>
              <Switch
                checked={alertSettings.weeklyDigest}
                onCheckedChange={(checked) => setAlertSettings({ ...alertSettings, weeklyDigest: checked })}
              />
            </div>

            {/* Save Button */}
            <Button className="w-full" onClick={handleSaveSettings}>
              Save Settings
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
