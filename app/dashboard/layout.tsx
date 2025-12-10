"use client"

import type React from "react"
import { LayoutDashboard, Users, FileText, Bell, Settings, Loader2 } from "lucide-react"
import DashboardLayoutClient from "./layout-client"
import { Suspense } from "react" // Import Suspense

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

export const dynamic = "force-dynamic"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </Suspense>
  )
}
