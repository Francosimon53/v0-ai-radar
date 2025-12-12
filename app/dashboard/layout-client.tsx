"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, FileText, Bell, Settings, Activity } from "lucide-react"

export default function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Competitors", href: "/dashboard/competitors", icon: Users },
    { name: "Reports", href: "/dashboard/reports", icon: FileText },
    { name: "Alerts", href: "/dashboard/alerts", icon: Bell },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-zinc-950">
      <aside className="hidden w-64 flex-shrink-0 border-r border-zinc-800 lg:block bg-zinc-900">
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 px-5 py-6 border-b border-zinc-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">AI Radar</span>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? "bg-blue-500/20 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-6">
          <h1 className="text-lg font-semibold text-white">Dashboard</h1>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
