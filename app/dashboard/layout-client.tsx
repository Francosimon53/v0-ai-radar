"use client"

import type React from "react"

import { Bell, LayoutDashboard, Settings, Users, FileText, MessageSquare, BarChart3 } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "AI Chat", href: "/chat", icon: MessageSquare },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Competitors", href: "/dashboard/competitors", icon: Users },
    { name: "Reports", href: "/dashboard/reports", icon: FileText },
    { name: "Alerts", href: "/dashboard/alerts", icon: Bell },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-zinc-800 bg-zinc-900">
        <div className="flex h-16 items-center border-b border-zinc-800 px-6">
          <h1 className="text-xl font-bold text-white">AI Radar</h1>
        </div>

        <nav className="space-y-1 p-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            const Icon = item.icon

            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${
                    isActive
                      ? "bg-orange-600 text-white hover:bg-orange-700"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  <Icon className="mr-2 h-5 w-5" />
                  {item.name}
                </Button>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="pl-64">
        <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-900">
          <div className="flex h-16 items-center justify-between px-8">
            <h2 className="text-lg font-semibold text-white">Dashboard</h2>
          </div>
        </header>

        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}
