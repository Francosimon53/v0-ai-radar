"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  FileText,
  Bell,
  Settings,
  Play,
  Sun,
  Moon,
  Menu,
  ChevronUp,
  User,
  CreditCard,
  LogOut,
  Radar,
  Search,
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
import { Suspense } from "react"

// Placeholder data
const userData = {
  name: "John Doe",
  email: "john@company.com",
  avatar: "/professional-man-avatar.png",
}

const planData = {
  name: "Free Plan",
  competitorsUsed: 3,
  competitorsLimit: 5,
}

const unreadAlerts = 3

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Competitors", href: "/dashboard/competitors", icon: Users },
  { name: "Reports", href: "/dashboard/reports", icon: FileText },
  { name: "Alerts", href: "/dashboard/alerts", icon: Bell, badge: unreadAlerts },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [darkMode, setDarkMode] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const currentPage = pageInfo[pathname] || pageInfo["/dashboard"]

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle("dark")
  }

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
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? "bg-primary text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
              {item.badge && item.badge > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-medium text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Plan Status Card */}
      <div className="px-3 pb-3">
        <div className="rounded-lg bg-slate-800 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-white">{planData.name}</span>
          </div>
          <div className="mb-2">
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
          <Button variant="secondary" size="sm" className="w-full bg-slate-700 text-white hover:bg-slate-600">
            Upgrade
          </Button>
        </div>
      </div>

      {/* User Section */}
      <div className="border-t border-slate-700 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-800">
              <Avatar className="h-10 w-10">
                <AvatarImage src={userData.avatar || "/placeholder.svg"} alt={userData.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {userData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="truncate text-sm font-medium text-white">{userData.name}</p>
                <p className="truncate text-xs text-slate-400">{userData.email}</p>
              </div>
              <ChevronUp className="h-4 w-4 text-slate-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCard className="mr-2 h-4 w-4" />
              Billing
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 bg-slate-900 lg:block">
          <SidebarContent />
        </aside>

        {/* Mobile Sidebar */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-64 bg-slate-900 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col lg:ml-64">
          {/* Header */}
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
            {/* Left: Mobile menu + Page title */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold">{currentPage.title}</h1>
                <p className="hidden text-sm text-muted-foreground sm:block">{currentPage.description}</p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="search" placeholder="Search..." className="w-48 pl-9 lg:w-64" />
              </div>
              <Button className="hidden gap-2 sm:flex">
                <Play className="h-4 w-4" />
                Run Analysis
              </Button>
              <Button size="icon" className="sm:hidden">
                <Play className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadAlerts > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
                    {unreadAlerts}
                  </span>
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 bg-background p-4 lg:p-6">{children}</main>

          {/* Mobile Bottom Navigation */}
          <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-border bg-card lg:hidden">
            {[navItems[0], navItems[2], navItems[3], navItems[4]].map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                >
                  <div className="relative">
                    <item.icon className="h-5 w-5" />
                    {item.badge && item.badge > 0 && (
                      <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-xs">{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </Suspense>
  )
}
