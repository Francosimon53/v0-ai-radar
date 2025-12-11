"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  User,
  Settings,
  Bell,
  CreditCard,
  Camera,
  X,
  Plus,
  AlertTriangle,
  Download,
  Trash2,
  Zap,
  Lock,
  Clock,
  FileText,
  CheckCircle,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type SettingsTab = "profile" | "tracking" | "notifications" | "billing"

const planData = {
  name: "Professional",
  price: 79,
  billingCycle: "monthly",
  nextBilling: "January 15, 2025",
  limits: {
    brands: 5,
    competitors: 20,
    analyses: 100,
  },
}

const invoiceHistory = [
  { id: "INV-001", date: "Dec 15, 2024", amount: 79, status: "paid" },
  { id: "INV-002", date: "Nov 15, 2024", amount: 79, status: "paid" },
  { id: "INV-003", date: "Oct 15, 2024", amount: 79, status: "paid" },
  { id: "INV-004", date: "Sep 15, 2024", amount: 79, status: "paid" },
]

export default function SettingsClient() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [newCompetitor, setNewCompetitor] = useState("")

  // Profile state
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    company: "",
    avatar: "",
  })

  // Tracking state
  const [tracking, setTracking] = useState({
    brand: "",
    competitors: [] as string[],
    industry: "",
    frequency: "weekly",
  })

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailEnabled: true,
    scoreDropEnabled: true,
    scoreDropThreshold: "5",
    competitorEnabled: true,
    competitorThreshold: "3",
    weeklyDigest: true,
    digestDay: "monday",
    quietHoursEnabled: false,
    quietStart: "22:00",
    quietEnd: "08:00",
  })

  // Usage stats
  const [usage, setUsage] = useState({
    analyses: 0,
    reports: 0,
  })

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/settings")
        if (!response.ok) throw new Error("Failed to load settings")

        const data = await response.json()

        if (data.profile) {
          setProfile({
            name: data.profile.full_name || "",
            email: data.profile.email || "",
            company: data.profile.company || "",
            avatar: data.profile.avatar_url || "",
          })
        }

        if (data.config) {
          setTracking({
            brand: data.config.brand || "",
            competitors: data.config.competitors || [],
            industry: data.config.industry || "",
            frequency: data.config.frequency || "weekly",
          })
        }

        if (data.alertSettings) {
          setNotifications({
            emailEnabled: data.alertSettings.email_enabled ?? true,
            scoreDropEnabled: data.alertSettings.score_drop_enabled ?? true,
            scoreDropThreshold: String(data.alertSettings.score_drop_threshold || 5),
            competitorEnabled: data.alertSettings.competitor_alert_enabled ?? true,
            competitorThreshold: String(data.alertSettings.competitor_threshold || 3),
            weeklyDigest: data.alertSettings.weekly_digest ?? true,
            digestDay: data.alertSettings.digest_day || "monday",
            quietHoursEnabled: data.alertSettings.quiet_hours_enabled ?? false,
            quietStart: data.alertSettings.quiet_start || "22:00",
            quietEnd: data.alertSettings.quiet_end || "08:00",
          })
        }

        if (data.usage) {
          setUsage(data.usage)
        }
      } catch (error) {
        console.error("Error loading settings:", error)
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [toast])

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "profile",
          data: profile,
        }),
      })

      if (!response.ok) throw new Error("Failed to save profile")

      toast({
        title: "Profile saved",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveTracking = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "tracking",
          data: tracking,
        }),
      })

      if (!response.ok) throw new Error("Failed to save tracking settings")

      toast({
        title: "Tracking settings saved",
        description: "Your brand configuration has been updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save tracking settings",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveNotifications = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "notifications",
          data: notifications,
        }),
      })

      if (!response.ok) throw new Error("Failed to save notification settings")

      toast({
        title: "Notification settings saved",
        description: "Your preferences have been updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notification settings",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const addCompetitor = () => {
    if (newCompetitor && !tracking.competitors.includes(newCompetitor)) {
      setTracking({
        ...tracking,
        competitors: [...tracking.competitors, newCompetitor],
      })
      setNewCompetitor("")
    }
  }

  const removeCompetitor = (comp: string) => {
    setTracking({
      ...tracking,
      competitors: tracking.competitors.filter((c) => c !== comp),
    })
  }

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "tracking" as const, label: "Tracking", icon: Settings },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
    { id: "billing" as const, label: "Billing", icon: CreditCard },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "text-muted-foreground hover:text-foreground hover:bg-slate-800"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          {/* Avatar & Basic Info */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-blue-600 text-xl">
                      {profile.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 p-1.5 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors">
                    <Camera className="h-3.5 w-3.5 text-white" />
                  </button>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Profile Photo</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max 2MB.</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={profile.company}
                    onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                    className="bg-background border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="bg-background border-border"
                />
              </div>

              <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" className="bg-background border-border" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" className="bg-background border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" className="bg-background border-border" />
                </div>
              </div>
              <Button variant="outline" className="border-border bg-transparent">
                Update Password
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-900/50 bg-card">
            <CardHeader>
              <CardTitle className="text-red-500 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>Irreversible and destructive actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Export Your Data</p>
                  <p className="text-sm text-muted-foreground">Download all your data as a JSON file</p>
                </div>
                <Button variant="outline" className="border-border bg-transparent">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border border-red-900/50 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Delete Account</p>
                  <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tracking Tab */}
      {activeTab === "tracking" && (
        <div className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Brand Configuration</CardTitle>
              <CardDescription>Manage your brand and tracking settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="brand">Your Brand</Label>
                <Input
                  id="brand"
                  value={tracking.brand}
                  onChange={(e) => setTracking({ ...tracking, brand: e.target.value })}
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select
                  value={tracking.industry}
                  onValueChange={(value) => setTracking({ ...tracking, industry: value })}
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="finance">Finance & Banking</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="retail">Retail & E-commerce</SelectItem>
                    <SelectItem value="automotive">Automotive</SelectItem>
                    <SelectItem value="food">Food & Beverage</SelectItem>
                    <SelectItem value="fashion">Fashion & Apparel</SelectItem>
                    <SelectItem value="travel">Travel & Hospitality</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Competitors</Label>
                <div className="flex flex-wrap gap-2">
                  {tracking.competitors.map((competitor) => (
                    <Badge
                      key={competitor}
                      variant="secondary"
                      className="bg-slate-800 text-slate-200 px-3 py-1 text-sm"
                    >
                      {competitor}
                      <button onClick={() => removeCompetitor(competitor)} className="ml-2 hover:text-red-400">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add competitor..."
                    value={newCompetitor}
                    onChange={(e) => setNewCompetitor(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCompetitor()}
                    className="bg-background border-border"
                  />
                  <Button onClick={addCompetitor} variant="outline" className="border-border bg-transparent">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button onClick={handleSaveTracking} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Brand Settings"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Analysis Schedule
              </CardTitle>
              <CardDescription>Configure how often we analyze your brand</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup
                value={tracking.frequency}
                onValueChange={(value) => setTracking({ ...tracking, frequency: value })}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-slate-800/50 cursor-pointer">
                  <RadioGroupItem value="daily" id="daily" />
                  <Label htmlFor="daily" className="flex-1 cursor-pointer">
                    <span className="font-medium">Daily</span>
                    <span className="block text-sm text-muted-foreground">Every day at 9:00 AM</span>
                  </Label>
                  <Badge className="bg-blue-600">Pro</Badge>
                </div>
                <div className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-slate-800/50 cursor-pointer">
                  <RadioGroupItem value="weekly" id="weekly" />
                  <Label htmlFor="weekly" className="flex-1 cursor-pointer">
                    <span className="font-medium">Weekly</span>
                    <span className="block text-sm text-muted-foreground">Every Monday at 9:00 AM</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-slate-800/50 cursor-pointer">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly" className="flex-1 cursor-pointer">
                    <span className="font-medium">Monthly</span>
                    <span className="block text-sm text-muted-foreground">1st of each month at 9:00 AM</span>
                  </Label>
                </div>
              </RadioGroup>

              <Button onClick={handleSaveTracking} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Schedule"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Email Notifications</CardTitle>
              <CardDescription>Choose what updates you receive via email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  checked={notifications.emailEnabled}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, emailEnabled: checked })}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Score Drop Alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified when your score drops</p>
                  </div>
                  <Switch
                    checked={notifications.scoreDropEnabled}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, scoreDropEnabled: checked })}
                    disabled={!notifications.emailEnabled}
                  />
                </div>
                {notifications.scoreDropEnabled && (
                  <div className="ml-4 flex items-center gap-2">
                    <Label className="text-sm text-muted-foreground">Alert when score drops by</Label>
                    <Select
                      value={notifications.scoreDropThreshold}
                      onValueChange={(value) => setNotifications({ ...notifications, scoreDropThreshold: value })}
                      disabled={!notifications.emailEnabled}
                    >
                      <SelectTrigger className="w-24 bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3+</SelectItem>
                        <SelectItem value="5">5+</SelectItem>
                        <SelectItem value="10">10+</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">points</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Competitor Alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified about competitor changes</p>
                  </div>
                  <Switch
                    checked={notifications.competitorEnabled}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, competitorEnabled: checked })}
                    disabled={!notifications.emailEnabled}
                  />
                </div>
                {notifications.competitorEnabled && (
                  <div className="ml-4 flex items-center gap-2">
                    <Label className="text-sm text-muted-foreground">Alert when competitor rises by</Label>
                    <Select
                      value={notifications.competitorThreshold}
                      onValueChange={(value) => setNotifications({ ...notifications, competitorThreshold: value })}
                      disabled={!notifications.emailEnabled}
                    >
                      <SelectTrigger className="w-24 bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3+</SelectItem>
                        <SelectItem value="5">5+</SelectItem>
                        <SelectItem value="10">10+</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">points</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Weekly Digest</p>
                    <p className="text-sm text-muted-foreground">Receive a weekly summary</p>
                  </div>
                  <Switch
                    checked={notifications.weeklyDigest}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyDigest: checked })}
                    disabled={!notifications.emailEnabled}
                  />
                </div>
                {notifications.weeklyDigest && (
                  <div className="ml-4 flex items-center gap-2">
                    <Label className="text-sm text-muted-foreground">Send digest on</Label>
                    <Select
                      value={notifications.digestDay}
                      onValueChange={(value) => setNotifications({ ...notifications, digestDay: value })}
                      disabled={!notifications.emailEnabled}
                    >
                      <SelectTrigger className="w-32 bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monday">Monday</SelectItem>
                        <SelectItem value="tuesday">Tuesday</SelectItem>
                        <SelectItem value="wednesday">Wednesday</SelectItem>
                        <SelectItem value="thursday">Thursday</SelectItem>
                        <SelectItem value="friday">Friday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Quiet Hours</p>
                    <p className="text-sm text-muted-foreground">Pause notifications during certain hours</p>
                  </div>
                  <Switch
                    checked={notifications.quietHoursEnabled}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, quietHoursEnabled: checked })}
                    disabled={!notifications.emailEnabled}
                  />
                </div>
                {notifications.quietHoursEnabled && (
                  <div className="ml-4 flex items-center gap-2">
                    <Label className="text-sm text-muted-foreground">From</Label>
                    <Input
                      type="time"
                      value={notifications.quietStart}
                      onChange={(e) => setNotifications({ ...notifications, quietStart: e.target.value })}
                      className="w-28 bg-background border-border"
                      disabled={!notifications.emailEnabled}
                    />
                    <Label className="text-sm text-muted-foreground">to</Label>
                    <Input
                      type="time"
                      value={notifications.quietEnd}
                      onChange={(e) => setNotifications({ ...notifications, quietEnd: e.target.value })}
                      className="w-28 bg-background border-border"
                      disabled={!notifications.emailEnabled}
                    />
                  </div>
                )}
              </div>

              <Button onClick={handleSaveNotifications} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Notification Settings"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === "billing" && (
        <div className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">Current Plan</CardTitle>
                  <CardDescription>Manage your subscription</CardDescription>
                </div>
                <Badge className="bg-blue-600 text-white">{planData.name}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-foreground">${planData.price}</span>
                <span className="text-muted-foreground">/{planData.billingCycle}</span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Analyses</span>
                    <span className="text-foreground">
                      {usage.analyses} / {planData.limits.analyses}
                    </span>
                  </div>
                  <Progress value={(usage.analyses / planData.limits.analyses) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Reports Generated</span>
                    <span className="text-foreground">{usage.reports}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setShowUpgradeDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Zap className="mr-2 h-4 w-4" />
                  Upgrade Plan
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCancelDialog(true)}
                  className="border-border text-muted-foreground hover:text-foreground"
                >
                  Cancel Plan
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">Next billing date: {planData.nextBilling}</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Billing History
              </CardTitle>
              <CardDescription>View and download past invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Invoice</TableHead>
                    <TableHead className="text-muted-foreground">Date</TableHead>
                    <TableHead className="text-muted-foreground">Amount</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-right text-muted-foreground">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoiceHistory.map((invoice) => (
                    <TableRow key={invoice.id} className="border-border">
                      <TableCell className="font-medium text-foreground">{invoice.id}</TableCell>
                      <TableCell className="text-muted-foreground">{invoice.date}</TableCell>
                      <TableCell className="text-foreground">${invoice.amount}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            invoice.status === "paid"
                              ? "bg-green-900/30 text-green-400"
                              : "bg-yellow-900/30 text-yellow-400"
                          }
                        >
                          <CheckCircle className="mr-1 h-3 w-3" />
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-red-500">Delete Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All your data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Type <span className="font-mono text-foreground">DELETE</span> to confirm:
            </p>
            <Input className="bg-background border-border" placeholder="Type DELETE" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="border-border">
              Cancel
            </Button>
            <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Plan Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription? You&apos;ll lose access to premium features.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)} className="border-border">
              Keep Plan
            </Button>
            <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
              Cancel Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Upgrade Your Plan</DialogTitle>
            <DialogDescription>Get access to more features and higher limits.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">Contact our sales team to discuss enterprise options.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)} className="border-border">
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">Contact Sales</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
