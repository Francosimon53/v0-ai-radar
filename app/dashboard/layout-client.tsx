"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, FileText, Bell, Settings, Loader2, Sparkles, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false)

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Competitors", href: "/dashboard/competitors", icon: Users },
    { name: "Reports", href: "/dashboard/reports", icon: FileText },
    { name: "Alerts", href: "/dashboard/alerts", icon: Bell },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ]

  const runAnalysis = async () => {
    setIsRunningAnalysis(true)
    try {
      const response = await fetch("/api/analysis/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configId: "test" }),
      })
      const result = await response.json()
      console.log("[v0] Analysis result:", result)
      alert(`Analysis complete! Score: ${result.brandScore}/100`)
      window.location.reload()
    } catch (error) {
      console.error("[v0] Analysis error:", error)
      alert("Analysis failed: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setIsRunningAnalysis(false)
    }
  }

  return (
    <div className="flex h-screen bg-zinc-950">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-zinc-800 lg:block bg-zinc-900">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 py-6 border-b border-zinc-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">AI Radar</span>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? "bg-blue-500/20 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-6">
          <div>
            <h1 className="text-lg font-semibold text-white">Dashboard</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={runAnalysis}
              disabled={isRunningAnalysis}
              className="gap-2 bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isRunningAnalysis ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Run Analysis
                </>
              )}
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
