"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
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
  Loader2,
  Sparkles,
  Activity,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent } from "@/components/ui/sheet"
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
  free: { competitors: 5, analyses: 3 },
  starter: { competitors: 10, analyses: 10 },
  pro: { competitors: 25, analyses: 50 },
  enterprise: { competitors: 100, analyses: 999 },
}

const pageInfo: Record<string, { title: string; description: string }> = {
  "/dashboard": {
    title: "Dashboard",
    description: "Brand intelligence overview",
  },
  "/dashboard/competitors": {
    title: "Competitors",
    description: "Competitive analysis",
  },
  "/dashboard/reports": {
    title: "Reports",
    description: "Intelligence reports",
  },
  "/dashboard/alerts": {
    title: "Alerts",
    description: "Real-time notifications",
  },
  "/dashboard/settings": {
    title: "Settings",
    description: "Account preferences",
  },
  "/dashboard/setup": {
    title: "Setup",
    description: "Configure tracking",
  },
}

export default function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false)

  const [userData, setUserData] = useState<UserData>({
    name: "User",
    email: "",
    avatar: null,
  })
  const [planData, setPlanData] = useState<PlanData>({
    name: "Free",
    competitorsUsed: 0,
    competitorsLimit: 5,
    analysesUsed: 0,
    analysesLimit: 3,
  })
  const [unreadAlerts, setUnreadAlerts] = useState(0)
  const [configId, setConfigId] = useState<string | null>(null)

  const currentPage = pageInfo[pathname] || pageInfo["/dashboard"]

  useEffect(() => {
    setMounted(true)
    setTheme("dark")
    loadSidebarData()
  }, [])

  async function loadSidebarData() {
    try {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (profile) {
          const plan = profile.plan || "free"
          const limits = planLimits[plan] || planLimits.free

          setUserData({
            name: profile.full_name || user.email?.split("@")[0] || "User",
            email: user.email || "",
            avatar: profile.avatar_url,
          })

          const { data: config } = await supabase
            .from("tracking_configs")
            .select("id, competitors")
            .eq("user_id", user.id)
            .single()

          const competitorsUsed = config?.competitors?.length || 0
          if (config) {
            setConfigId(config.id)
          }

          const startOfMonth = new Date()
          startOfMonth.setDate(1)
          startOfMonth.setHours(0, 0, 0, 0)

          const { count: reportsCount } = await supabase
            .from("reports")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .gte("created_at", startOfMonth.toISOString())

          setPlanData({
            name: plan.charAt(0).toUpperCase() + plan.slice(1),
            competitorsUsed,
            competitorsLimit: limits.competitors,
            analysesUsed: reportsCount || 0,
            analysesLimit: limits.analyses,
          })
        }

        const { count } = await supabase
          .from("alerts")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("is_read", false)

        setUnreadAlerts(count || 0)
      }
    } catch (error) {
      console.error("Error loading sidebar data:", error)
    }
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const runAnalysis = async () => {
    if (isRunningAnalysis) return

    if (!configId) {
      toast({
        title: "Setup Required",
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
        description: "Running AI analysis (30-60 seconds)...",
      })

      const response = await fetch("/api/analysis/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configId }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || result.message || "Analysis failed")
      }

      toast({
        title: "Analysis Complete",
        description: `Brand score: ${result.brandScore}/100`,
      })

      router.refresh()
      window.location.reload()
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "An error occurred",
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
    <div className="flex h-full flex-col bg-[#0a0a0f]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400">
          <Activity className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="text-lg font-bold text-white">AI Radar</span>
          <span className="ml-1.5 rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-medium text-blue-400">PRO</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2">
        <div className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500">Menu</div>
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`group relative mb-1 flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/10 text-white"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-blue-400 to-cyan-400" />
              )}
              <div className="flex items-center gap-3">
                <item.icon className={`h-[18px] w-[18px] ${isActive ? "text-blue-400" : ""}`} />
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

      {/* Usage Stats */}
      <div className="mx-3 mb-3 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 p-4 border border-zinc-800/50">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-white">{planData.name} Plan</span>
          <Link
            href="/dashboard/settings"
            className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            Upgrade
          </Link>
        </div>
        <div className="space-y-3">
          <div>
            <div className="mb-1.5 flex justify-between text-xs">
              <span className="text-zinc-500">Competitors</span>
              <span className="font-mono text-zinc-400">
                {planData.competitorsUsed}
                <span className="text-zinc-600">/{planData.competitorsLimit}</span>
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${Math.min((planData.competitorsUsed / planData.competitorsLimit) * 100, 100)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="mb-1.5 flex justify-between text-xs">
              <span className="text-zinc-500">Analyses</span>
              <span className="font-mono text-zinc-400">
                {planData.analysesUsed}
                <span className="text-zinc-600">/{planData.analysesLimit}</span>
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                style={{ width: `${Math.min((planData.analysesUsed / planData.analysesLimit) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="border-t border-zinc-800/50 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/5">
              <Avatar className="h-9 w-9 ring-2 ring-zinc-700">
                <AvatarImage src={userData.avatar || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-400 text-white text-sm font-semibold">
                  {userData.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 truncate">
                <p className="text-sm font-medium text-white">{userData.name}</p>
                <p className="truncate text-xs text-zinc-500">{userData.email}</p>
              </div>
              <ChevronUp className="h-4 w-4 text-zinc-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800">
            <DropdownMenuItem asChild className="text-zinc-300 focus:bg-zinc-800 focus:text-white">
              <Link href="/dashboard/settings">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="text-zinc-300 focus:bg-zinc-800 focus:text-white">
              <Link href="/dashboard/settings">
                <CreditCard className="mr-2 h-4 w-4" />
                Billing
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:bg-red-500/10 focus:text-red-400">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-[#050507]">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-zinc-800/50 lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 bg-[#0a0a0f] p-0 border-zinc-800">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-zinc-800/50 bg-[#0a0a0f]/80 backdrop-blur-xl px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-zinc-400 hover:text-white hover:bg-zinc-800"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-white">{currentPage.title}</h1>
              <p className="text-sm text-zinc-500">{currentPage.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Run Analysis Button */}
            <Button
              onClick={runAnalysis}
              disabled={isRunningAnalysis}
              className="gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-blue-500/25"
            >
              {isRunningAnalysis ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline">Run Analysis</span>
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="relative text-zinc-400 hover:text-white hover:bg-zinc-800"
              asChild
            >
              <Link href="/dashboard/alerts">
                <Bell className="h-5 w-5" />
                {unreadAlerts > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-medium text-white">
                    {unreadAlerts}
                  </span>
                )}
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              {mounted && theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-[#050507] p-4 lg:p-6">{children}</main>

        {/* Mobile Nav */}
        <nav className="flex border-t border-zinc-800/50 bg-[#0a0a0f] lg:hidden">
          {navItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors ${
                  isActive ? "text-blue-400" : "text-zinc-500"
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
