"use client"

import { useState } from "react"
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
} from "lucide-react"

type SettingsTab = "profile" | "tracking" | "notifications" | "billing"

// Sample user data
const userData = {
  name: "John Doe",
  email: "john@company.com",
  company: "Nike Inc.",
  avatar: "/professional-man-avatar.png",
}

const planData = {
  name: "Professional",
  price: 79,
  billingCycle: "monthly",
  nextBilling: "January 15, 2025",
  usage: {
    brands: { used: 3, limit: 5 },
    competitors: { used: 12, limit: 20 },
    analyses: { used: 45, limit: 100 },
  },
}

const invoiceHistory = [
  { id: "INV-001", date: "Dec 15, 2024", amount: 79, status: "paid" },
  { id: "INV-002", date: "Nov 15, 2024", amount: 79, status: "paid" },
  { id: "INV-003", date: "Oct 15, 2024", amount: 79, status: "paid" },
  { id: "INV-004", date: "Sep 15, 2024", amount: 79, status: "paid" },
]

const brandConfig = {
  name: "Nike",
  competitors: ["Adidas", "Under Armour", "Puma", "New Balance"],
  industry: "Athletic Footwear",
}

export default function SettingsClient() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newCompetitor, setNewCompetitor] = useState("")
  const [competitors, setCompetitors] = useState(brandConfig.competitors)

  // Profile state
  const [profile, setProfile] = useState({
    name: userData.name,
    email: userData.email,
    company: userData.company,
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

  // Tracking settings
  const [tracking, setTracking] = useState({
    analysisFrequency: "weekly",
    nextAnalysis: "Dec 18, 2024 at 9:00 AM",
  })

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  const addCompetitor = () => {
    if (newCompetitor && !competitors.includes(newCompetitor)) {
      setCompetitors([...competitors, newCompetitor])
      setNewCompetitor("")
    }
  }

  const removeCompetitor = (comp: string) => {
    setCompetitors(competitors.filter((c) => c !== comp))
  }

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "tracking" as const, label: "Tracking", icon: Settings },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
    { id: "billing" as const, label: "Billing", icon: CreditCard },
  ]

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
                    <AvatarImage src={userData.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-blue-600 text-xl">JD</AvatarFallback>
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
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Change Password</CardTitle>
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
                <Lock className="h-4 w-4 mr-2" />
                Update Password
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-500/30 bg-card">
            <CardHeader>
              <CardTitle className="text-red-400">Danger Zone</CardTitle>
              <CardDescription>Irreversible account actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50">
                <div>
                  <p className="font-medium text-foreground">Export Your Data</p>
                  <p className="text-sm text-muted-foreground">Download all your reports and settings</p>
                </div>
                <Button variant="outline" className="border-border bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <div>
                  <p className="font-medium text-foreground">Delete Account</p>
                  <p className="text-sm text-muted-foreground">Permanently delete your account and data</p>
                </div>
                <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      )}

      {/* Tracking Tab */}
      {activeTab === "tracking" && (
        <div className="space-y-6">
          {/* Brand Configuration */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Brand Configuration</CardTitle>
              <CardDescription>Manage your tracked brand</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="brand-name">Brand Name</Label>
                <Input id="brand-name" defaultValue={brandConfig.name} className="bg-background border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select defaultValue={brandConfig.industry}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Athletic Footwear">Athletic Footwear</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Fashion">Fashion</SelectItem>
                    <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Competitors */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Competitors</CardTitle>
              <CardDescription>
                Manage brands you&apos;re comparing against ({competitors.length}/{planData.usage.competitors.limit})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {competitors.map((comp) => (
                  <Badge key={comp} variant="secondary" className="bg-slate-800 text-foreground px-3 py-1.5">
                    {comp}
                    <button
                      onClick={() => removeCompetitor(comp)}
                      className="ml-2 hover:text-red-400 transition-colors"
                    >
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
                  className="bg-background border-border"
                  onKeyDown={(e) => e.key === "Enter" && addCompetitor()}
                />
                <Button
                  variant="outline"
                  className="border-border bg-transparent"
                  onClick={addCompetitor}
                  disabled={competitors.length >= planData.usage.competitors.limit}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Frequency */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Analysis Frequency</CardTitle>
              <CardDescription>How often should we analyze your brand perception?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={tracking.analysisFrequency}
                onValueChange={(v) => setTracking({ ...tracking, analysisFrequency: v })}
              >
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/50">
                  <RadioGroupItem value="daily" id="daily" disabled />
                  <Label htmlFor="daily" className="flex-1 cursor-pointer">
                    <span className="flex items-center gap-2">
                      Daily
                      <Badge className="bg-amber-500/20 text-amber-400 text-xs">Pro</Badge>
                    </span>
                    <span className="text-sm text-muted-foreground block">Run analysis every 24 hours</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/50">
                  <RadioGroupItem value="weekly" id="weekly" />
                  <Label htmlFor="weekly" className="flex-1 cursor-pointer">
                    Weekly
                    <span className="text-sm text-muted-foreground block">Run analysis every 7 days</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/50">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly" className="flex-1 cursor-pointer">
                    Monthly
                    <span className="text-sm text-muted-foreground block">Run analysis every 30 days</span>
                  </Label>
                </div>
              </RadioGroup>

              <div className="flex items-center justify-between p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="font-medium text-foreground">Next Scheduled Analysis</p>
                    <p className="text-sm text-muted-foreground">{tracking.nextAnalysis}</p>
                  </div>
                </div>
                <Button variant="outline" className="border-border bg-transparent">
                  Run Now
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          {/* Email Notifications */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Email Notifications</CardTitle>
              <CardDescription>Control which emails you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Enable Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive alerts and updates via email</p>
                </div>
                <Switch
                  checked={notifications.emailEnabled}
                  onCheckedChange={(v) => setNotifications({ ...notifications, emailEnabled: v })}
                />
              </div>

              <Separator className="bg-border" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Score Drop Alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified when your score drops significantly</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select
                      value={notifications.scoreDropThreshold}
                      onValueChange={(v) => setNotifications({ ...notifications, scoreDropThreshold: v })}
                      disabled={!notifications.scoreDropEnabled}
                    >
                      <SelectTrigger className="w-24 bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3+ pts</SelectItem>
                        <SelectItem value="5">5+ pts</SelectItem>
                        <SelectItem value="10">10+ pts</SelectItem>
                      </SelectContent>
                    </Select>
                    <Switch
                      checked={notifications.scoreDropEnabled}
                      onCheckedChange={(v) => setNotifications({ ...notifications, scoreDropEnabled: v })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Competitor Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when competitors gain or lose significant ground
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select
                      value={notifications.competitorThreshold}
                      onValueChange={(v) => setNotifications({ ...notifications, competitorThreshold: v })}
                      disabled={!notifications.competitorEnabled}
                    >
                      <SelectTrigger className="w-24 bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3+ pts</SelectItem>
                        <SelectItem value="5">5+ pts</SelectItem>
                        <SelectItem value="10">10+ pts</SelectItem>
                      </SelectContent>
                    </Select>
                    <Switch
                      checked={notifications.competitorEnabled}
                      onCheckedChange={(v) => setNotifications({ ...notifications, competitorEnabled: v })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Digest */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Weekly Digest</CardTitle>
              <CardDescription>Receive a summary of your brand performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Enable Weekly Digest</p>
                  <p className="text-sm text-muted-foreground">Get a comprehensive summary every week</p>
                </div>
                <Switch
                  checked={notifications.weeklyDigest}
                  onCheckedChange={(v) => setNotifications({ ...notifications, weeklyDigest: v })}
                />
              </div>

              {notifications.weeklyDigest && (
                <div className="space-y-2">
                  <Label>Delivery Day</Label>
                  <Select
                    value={notifications.digestDay}
                    onValueChange={(v) => setNotifications({ ...notifications, digestDay: v })}
                  >
                    <SelectTrigger className="bg-background border-border">
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
            </CardContent>
          </Card>

          {/* Quiet Hours */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Quiet Hours</CardTitle>
              <CardDescription>Pause notifications during specific hours</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Enable Quiet Hours</p>
                  <p className="text-sm text-muted-foreground">No notifications during these hours</p>
                </div>
                <Switch
                  checked={notifications.quietHoursEnabled}
                  onCheckedChange={(v) => setNotifications({ ...notifications, quietHoursEnabled: v })}
                />
              </div>

              {notifications.quietHoursEnabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={notifications.quietStart}
                      onChange={(e) => setNotifications({ ...notifications, quietStart: e.target.value })}
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={notifications.quietEnd}
                      onChange={(e) => setNotifications({ ...notifications, quietEnd: e.target.value })}
                      className="bg-background border-border"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === "billing" && (
        <div className="space-y-6">
          {/* Current Plan */}
          <Card className="border-blue-500/30 bg-gradient-to-br from-blue-600/10 to-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    {planData.name} Plan
                    <Badge className="bg-blue-500/20 text-blue-400">Current</Badge>
                  </CardTitle>
                  <CardDescription>
                    ${planData.price}/month · Next billing: {planData.nextBilling}
                  </CardDescription>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowUpgradeDialog(true)}>
                  <Zap className="h-4 w-4 mr-2" />
                  Upgrade
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Brands</span>
                    <span className="text-foreground">
                      {planData.usage.brands.used}/{planData.usage.brands.limit}
                    </span>
                  </div>
                  <Progress
                    value={(planData.usage.brands.used / planData.usage.brands.limit) * 100}
                    className="h-2 bg-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Competitors</span>
                    <span className="text-foreground">
                      {planData.usage.competitors.used}/{planData.usage.competitors.limit}
                    </span>
                  </div>
                  <Progress
                    value={(planData.usage.competitors.used / planData.usage.competitors.limit) * 100}
                    className="h-2 bg-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Analyses</span>
                    <span className="text-foreground">
                      {planData.usage.analyses.used}/{planData.usage.analyses.limit}
                    </span>
                  </div>
                  <Progress
                    value={(planData.usage.analyses.used / planData.usage.analyses.limit) * 100}
                    className="h-2 bg-slate-800"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Payment Method</CardTitle>
              <CardDescription>Manage your payment information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-16 rounded bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">VISA</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">•••• •••• •••• 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 12/26</p>
                  </div>
                </div>
                <Button variant="outline" className="border-border bg-transparent">
                  Update
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Billing History */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Billing History</CardTitle>
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
                        <Badge className="bg-green-500/20 text-green-400">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Paid
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Billing Contact */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Billing Contact</CardTitle>
              <CardDescription>Where invoices and billing notifications are sent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Billing Email</Label>
                  <Input defaultValue="billing@company.com" className="bg-background border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input defaultValue="Nike Inc." className="bg-background border-border" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cancel Subscription */}
          <Card className="border-red-500/30 bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Cancel Subscription</p>
                  <p className="text-sm text-muted-foreground">
                    Your subscription will remain active until {planData.nextBilling}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10 bg-transparent"
                  onClick={() => setShowCancelDialog(true)}
                >
                  Cancel Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. All your data, reports, and settings will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">To confirm, type &quot;DELETE&quot; below:</p>
            <Input placeholder="Type DELETE to confirm" className="bg-background border-border" />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-border bg-transparent"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive">Delete Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Cancel Subscription</DialogTitle>
            <DialogDescription>
              We&apos;re sorry to see you go. Your subscription will remain active until the end of your current billing
              period.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-foreground">Before you go, would you like to:</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Downgrade to a lower tier instead?</li>
              <li>• Pause your subscription temporarily?</li>
              <li>• Speak with our support team?</li>
            </ul>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-border bg-transparent"
              onClick={() => setShowCancelDialog(false)}
            >
              Keep Subscription
            </Button>
            <Button variant="destructive">Cancel Anyway</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Upgrade Your Plan</DialogTitle>
            <DialogDescription>Get more brands, competitors, and analyses</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-border bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Business</CardTitle>
                <CardDescription>
                  <span className="text-2xl font-bold text-foreground">$149</span>/month
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>✓ 10 Brands</p>
                <p>✓ 50 Competitors</p>
                <p>✓ Unlimited Analyses</p>
                <p>✓ Daily Analysis Frequency</p>
                <p>✓ Priority Support</p>
              </CardContent>
            </Card>
            <Card className="border-blue-500/50 bg-blue-500/10">
              <CardHeader>
                <CardTitle className="text-lg text-foreground flex items-center gap-2">
                  Enterprise
                  <Badge className="bg-blue-500/20 text-blue-400">Popular</Badge>
                </CardTitle>
                <CardDescription>
                  <span className="text-2xl font-bold text-foreground">Custom</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>✓ Unlimited Brands</p>
                <p>✓ Unlimited Competitors</p>
                <p>✓ Unlimited Analyses</p>
                <p>✓ Real-time Monitoring</p>
                <p>✓ Dedicated Account Manager</p>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-border bg-transparent"
              onClick={() => setShowUpgradeDialog(false)}
            >
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">Contact Sales</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
