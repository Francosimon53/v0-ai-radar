"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  FileText,
  Bell,
  Settings,
  Sun,
  Moon,
  Menu,
  ChevronUp,
  User,
  CreditCard,
  LogOut,
  Radar,
  Search,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { createBrowserClient } from "@/lib/supabase/client"

interface UserData {
  name: string
  email: string
  avatar: string | null
}

interface PlanData {
  name: string
  competitorsUsed: number
  competitorsLimit: number
  analysesUsed: number
  analysesLimit: number
}

const planLimits: Record<string, { competitors: number; analyses: number }> = {
  free: { competitors: 5, analyses: 1 },
  starter: { competitors: 10, analyses: 4 },
  pro: { competitors: 25, analyses: 30 },
  enterprise: { competitors: 100, analyses: 999 },
}

const pageInfo: Record<string, { title: string; description: string }> = {
  "/dashboard": {
    title: "Dashboard",
    description: "Overview of your brand perception across AI models",
  },
  "/dashboard/competitors": {
    title: "Competitors",
    description: "Track and compare competitor brand perception",
  },
  "/dashboard/reports": {
    title: "Reports",
    description: "View and download your AI perception reports",
  },
  "/dashboard/alerts": {
    title: "Alerts",
    description: "Notifications about significant perception changes",
  },
  "/dashboard/settings": {
    title: "Settings",
    description: "Manage your account and preferences",
  },
}

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false)

  const [userData, setUserData] = useState<UserData>({
    name: "User",
    email: "",
    avatar: null,
  })
  const [planData, setPlanData] = useState<PlanData>({
    name: "Free Plan",
    competitorsUsed: 0,
    competitorsLimit: 5,
    analysesUsed: 0,
    analysesLimit: 1,
  })
  const [unreadAlerts, setUnreadAlerts] = useState(0)
  const [configId, setConfigId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const currentPage = pageInfo[pathname] || pageInfo["/dashboard"]

  useEffect(() => {
    async function loadSidebarData() {
      try {
        const supabase = createBrowserClient()

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          // Get profile
          const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

          if (profile) {
            const plan = profile.plan || "free"
            const limits = planLimits[plan] || planLimits.free

            setUserData({
              name: profile.full_name || user.email?.split("@")[0] || "User",
              email: user.email || "",
              avatar: profile.avatar_url,
            })

            // Get tracking config for competitors count
            const { data: config } = await supabase
              .from("tracking_configs")
              .select("id, competitors")
              .eq("user_id", user.id)
              .single()

            const competitorsUsed = config?.competitors?.length || 0
            if (config) {
              setConfigId(config.id)
            }

            // Get current month usage
            const currentMonth = new Date().toISOString().slice(0, 7)
            const { data: usage } = await supabase
              .from("api_usage")
              .select("analyses_count")
              .eq("user_id", user.id)
              .eq("month", currentMonth)
              .single()

            setPlanData({
              name: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
              competitorsUsed,
              competitorsLimit: limits.competitors,
              analysesUsed: usage?.analyses_count || 0,
              analysesLimit: limits.analyses,
            })
          }

          // Get unread alerts count
          const { count } = await supabase
            .from("alerts")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("is_read", false)

          setUnreadAlerts(count || 0)
        }
      } catch (error) {
        console.error("Error loading sidebar data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSidebarData()
  }, [pathname]) // Refetch when navigating

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle("dark")
  }

  const runAnalysis = async () => {
    if (!configId) {
      toast({
        title: "No Configuration",
        description: "Please complete the setup wizard first.",
        variant: "destructive",
      })
      router.push("/dashboard/setup")
      return
    }

    setIsRunningAnalysis(true)

    try {
      toast({
        title: "Analysis Started",
        description: "Your brand analysis is running. This may take a few minutes.",
      })

      const response = await fetch("/api/analysis/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configId }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Analysis failed")
      }

      toast({
        title: "Analysis Complete",
        description: "Your brand report is ready to view.",
      })

      // Refresh the page to show new data
      router.refresh()
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "An error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRunningAnalysis(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Competitors", href: "/dashboard/competitors", icon: Users },
    { name: "Reports", href: "/dashboard/reports", icon: FileText },
    { name: "Alerts", href: "/dashboard/alerts", icon: Bell, badge: unreadAlerts },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ]

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo Section */}
      <div className="flex items-center gap-3 border-b border-slate-700 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Radar className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold text-white">AI Vibes Radar</span>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? "bg-primary text-primary-foreground" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5" />
                {item.name}
              </div>
              {item.badge && item.badge > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-medium text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Plan Status Card */}
      <div className="mx-3 mb-4 rounded-lg bg-slate-800 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-white">{planData.name}</span>
          <Link href="/dashboard/settings" className="text-xs text-primary hover:underline">
            Upgrade
          </Link>
        </div>
        <div className="space-y-2">
          <div>
            <div className="mb-1 flex justify-between text-xs text-slate-400">
              <span>Competitors</span>
              <span>
                {planData.competitorsUsed}/{planData.competitorsLimit}
              </span>
            </div>
            <Progress
              value={(planData.competitorsUsed / planData.competitorsLimit) * 100}
              className="h-1.5 bg-slate-700"
            />
          </div>
          <div>
            <div className="mb-1 flex justify-between text-xs text-slate-400">
              <span>Analyses this month</span>
              <span>
                {planData.analysesUsed}/{planData.analysesLimit}
              </span>
            </div>
            <Progress value={(planData.analysesUsed / planData.analysesLimit) * 100} className="h-1.5 bg-slate-700" />
          </div>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="border-t border-slate-700 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-800">
              <Avatar className="h-9 w-9">
                <AvatarImage src={userData.avatar || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {userData.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 truncate">
                <p className="text-sm font-medium text-white">{userData.name}</p>
                <p className="truncate text-xs text-slate-400">{userData.email}</p>
              </div>
              <ChevronUp className="h-4 w-4 text-slate-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <CreditCard className="mr-2 h-4 w-4" />
                Billing
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-500">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 bg-slate-900 lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 bg-slate-900 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold">{currentPage.title}</h1>
              <p className="text-sm text-muted-foreground">{currentPage.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search..." className="w-64 pl-9" />
            </div>

            <Button onClick={runAnalysis} disabled={isRunningAnalysis} className="gap-2">
              {isRunningAnalysis ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Running...</span>
                </>
              ) : (
                <>
                  <Radar className="h-4 w-4" />
                  <span className="hidden sm:inline">Run Analysis</span>
                </>
              )}
            </Button>

            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/dashboard/alerts">
                <Bell className="h-5 w-5" />
                {unreadAlerts > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-medium text-white">
                    {unreadAlerts}
                  </span>
                )}
              </Link>
            </Button>

            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>

        {/* Mobile Bottom Navigation */}
        <nav className="flex border-t bg-card lg:hidden">
          {navItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex flex-1 flex-col items-center gap-1 py-3 text-xs ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
                {item.badge && item.badge > 0 && (
                  <span className="absolute right-1/4 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-medium text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
