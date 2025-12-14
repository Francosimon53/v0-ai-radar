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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Lock,
  Loader2,
  Bot,
  Globe,
  MessageSquare,
  TrendingDown,
  Users,
  Target,
  Mail,
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

  const [selectedMarkets, setSelectedMarkets] = useState<string[]>(["North America", "Latin America"])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["English", "Spanish"])

  const [activeThemes, setActiveThemes] = useState<string[]>([
    "Performance & training",
    "Lifestyle & culture",
    "Sustainability",
  ])

  const [alertPrefs, setAlertPrefs] = useState({
    scoreDrops: true,
    highThreatCompetitors: true,
    milestones: true,
    weeklySummary: false,
  })

  const [deliveryChannels, setDeliveryChannels] = useState({
    email: true,
    inApp: true,
    slack: false,
  })

  const [enabledAssistants, setEnabledAssistants] = useState<string[]>([])

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

  const aiAssistants = [
    { name: "ChatGPT", description: "General-purpose AI assistant by OpenAI", status: "live" as const },
    { name: "Claude", description: "Conversational AI by Anthropic", status: "live" as const },
    { name: "Gemini", description: "Multimodal AI by Google", status: "coming-soon" as const },
    { name: "Perplexity", description: "Search-centric AI assistant", status: "coming-soon" as const },
    { name: "Copilot", description: "Microsoft AI assistant", status: "coming-soon" as const },
  ]

  const markets = ["North America", "Latin America", "Europe", "Asia–Pacific", "Middle East & Africa"]
  const languages = ["English", "Spanish", "Portuguese", "French"]
  const brandThemes = [
    "Performance & training",
    "Lifestyle & culture",
    "Sustainability",
    "Pricing & discounts",
    "Community & creators",
    "Customer support",
  ]

  const toggleAssistant = (name: string) => {
    setEnabledAssistants((prev) => (prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]))
  }

  const toggleMarket = (market: string) => {
    setSelectedMarkets((prev) => (prev.includes(market) ? prev.filter((m) => m !== market) : [...prev, market]))
  }

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) => (prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]))
  }

  const toggleTheme = (theme: string) => {
    setActiveThemes((prev) => (prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme]))
  }

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

              <p className="text-xs text-muted-foreground">
                Your profile details are used to personalize AI reports and executive summaries in your workspace.
              </p>

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

      {activeTab === "tracking" && (
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-500" />
              AI Tracking
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Configure which AI assistants are monitored for your brand. Only assistants marked as{" "}
              <span className="text-emerald-400 font-medium">Live</span> are actively queried during real analyses and
              included in your VIP reports.
            </p>
          </div>

          {/* A) AI Assistants Monitored */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                AI assistants monitored
              </CardTitle>
              <CardDescription>Select which AI assistants to include in your visibility scans.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {aiAssistants.map((assistant) => {
                  const isLive = assistant.status === "live"
                  const isEnabled = enabledAssistants.includes(assistant.name)
                  return (
                    <div
                      key={assistant.name}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                        isLive && isEnabled
                          ? "border-blue-500/50 bg-blue-950/20"
                          : isLive
                            ? "border-border bg-zinc-900/50"
                            : "border-zinc-800/50 bg-zinc-900/30 opacity-70"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{assistant.name}</p>
                          {/* Status badge */}
                          {isLive ? (
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] px-1.5 py-0">
                              Live
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-zinc-700 text-zinc-500 text-[10px] px-1.5 py-0">
                              Coming soon
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{assistant.description}</p>
                      </div>
                      {/* Toggle - disabled for coming-soon assistants */}
                      <Switch
                        checked={isLive ? isEnabled : false}
                        onCheckedChange={() => isLive && toggleAssistant(assistant.name)}
                        disabled={!isLive}
                        className={`ml-3 ${!isLive ? "opacity-40 cursor-not-allowed" : ""}`}
                      />
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-muted-foreground pt-2 border-t border-zinc-800/50">
                Only assistants marked as <span className="text-emerald-400">Live</span> are currently included in AI
                Brand Score, SWOT analysis, and 90/30/7-day action plans.{" "}
                <span className="text-zinc-500">Coming soon</span> assistants are preview-only for now.
              </p>
            </CardContent>
          </Card>

          {/* B) Markets & Languages */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Markets & languages
              </CardTitle>
              <CardDescription className="leading-relaxed">
                Preview which regions and languages are prioritized in your AI scans. In the full version, these
                settings control where we search and in which languages we analyse AI responses about your brand.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Markets Card */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                <Label className="text-sm font-medium text-foreground mb-3 block">Markets</Label>
                <div className="flex flex-wrap gap-2">
                  {markets.map((market) => {
                    const isSelected = selectedMarkets.includes(market)
                    return (
                      <button
                        key={market}
                        onClick={() => toggleMarket(market)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300"
                        }`}
                      >
                        {market}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Languages Card */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                <Label className="text-sm font-medium text-foreground mb-3 block">Languages</Label>
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang) => {
                    const isSelected = selectedLanguages.includes(lang)
                    const isPrimary = lang === "English"
                    return (
                      <button
                        key={lang}
                        onClick={() => toggleLanguage(lang)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300"
                        }`}
                      >
                        {lang}
                        {isPrimary && isSelected && (
                          <span className="text-[10px] uppercase tracking-wider bg-blue-500/30 px-1.5 py-0.5 rounded">
                            Primary
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                In the production version, these preferences will influence AI Brand Score, SWOT insights and action
                plans for each market.
              </p>
            </CardContent>
          </Card>

          {/* C) Brand Themes Being Monitored */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Target className="h-5 w-5" />
                Brand themes being monitored
              </CardTitle>
              <CardDescription>Key narratives and topics that AI assistants associate with your brand.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {brandThemes.map((theme) => {
                  const isActive = activeThemes.includes(theme)
                  return (
                    <button
                      key={theme}
                      onClick={() => toggleTheme(theme)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        isActive
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {theme}
                    </button>
                  )
                })}
              </div>

              <p className="text-xs text-muted-foreground">
                Your AI reports and alerts will use these themes as the main lenses for SWOT and competitor analysis.
              </p>
            </CardContent>
          </Card>

          {/* Keep existing Brand Configuration card */}
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
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-500" />
              Notification preferences
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Control how often you are notified about AI score changes, new threats, and milestones.
            </p>
          </div>

          {/* A) Alert Types */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Alert types</CardTitle>
              <CardDescription>Choose which AI Radar alerts should trigger notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-zinc-900/50 transition-colors">
                <div className="flex items-start gap-3">
                  <TrendingDown className="h-5 w-5 text-red-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Score drops</p>
                    <p className="text-sm text-muted-foreground">
                      Notify me when AI Brand Score drops by more than 5 points.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={alertPrefs.scoreDrops}
                  onCheckedChange={(checked) => setAlertPrefs({ ...alertPrefs, scoreDrops: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-zinc-900/50 transition-colors">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-orange-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">New high-threat competitors</p>
                    <p className="text-sm text-muted-foreground">
                      Notify me when a competitor becomes medium or high threat in AI visibility.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={alertPrefs.highThreatCompetitors}
                  onCheckedChange={(checked) => setAlertPrefs({ ...alertPrefs, highThreatCompetitors: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-zinc-900/50 transition-colors">
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Milestones</p>
                    <p className="text-sm text-muted-foreground">
                      Notify me when your brand reaches important milestones.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={alertPrefs.milestones}
                  onCheckedChange={(checked) => setAlertPrefs({ ...alertPrefs, milestones: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-zinc-900/50 transition-colors">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Weekly summary</p>
                    <p className="text-sm text-muted-foreground">Receive a weekly summary of AI insights and alerts.</p>
                  </div>
                </div>
                <Switch
                  checked={alertPrefs.weeklySummary}
                  onCheckedChange={(checked) => setAlertPrefs({ ...alertPrefs, weeklySummary: checked })}
                />
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

      {activeTab === "billing" && (
        <div className="space-y-6">
          {/* Plan Information */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Current Plan</CardTitle>
              <CardDescription>Details of your current subscription plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Plan Name</p>
                  <p className="text-sm text-muted-foreground">{planData.name}</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Price</p>
                  <p className="text-sm text-muted-foreground">
                    ${planData.price} / {planData.billingCycle}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Next Billing</p>
                  <p className="text-sm text-muted-foreground">{planData.nextBilling}</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Usage Limits</p>
                  <div className="text-sm text-muted-foreground">
                    <p>Brands: {planData.limits.brands}</p>
                    <p>Competitors: {planData.limits.competitors}</p>
                    <p>Analyses: {planData.limits.analyses}</p>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowUpgradeDialog(true)}
                className="border-border bg-transparent"
              >
                Upgrade Plan
              </Button>
            </CardContent>
          </Card>

          {/* Usage Statistics */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Usage Statistics</CardTitle>
              <CardDescription>Your current usage of AI services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Analyses Completed</p>
                  <p className="text-sm text-muted-foreground">{usage.analyses}</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Reports Generated</p>
                  <p className="text-sm text-muted-foreground">{usage.reports}</p>
                </div>
              </div>
              <Progress value={Math.min((usage.analyses / planData.limits.analyses) * 100, 100)} />
            </CardContent>
          </Card>

          {/* Invoice History */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Invoice History</CardTitle>
              <CardDescription>View your past invoices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Invoice ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoiceHistory.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>{invoice.date}</TableCell>
                      <TableCell>${invoice.amount}</TableCell>
                      <TableCell>
                        <Badge
                          className={`bg-${invoice.status === "paid" ? "emerald-500" : "red-500"}/20 text-${invoice.status === "paid" ? "emerald-400" : "red-400"} border-${invoice.status === "paid" ? "emerald-500" : "red-500"}/30 text-[10px] px-1.5 py-0`}
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
