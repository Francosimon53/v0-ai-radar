"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  FileText,
  TrendingUp,
  Target,
  Users,
  Zap,
  BarChart3,
  MessageSquareQuote,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SAMPLE_VIP_REPORT } from "../sampleVipReport"

const sections = [
  { id: "executive-summary", label: "Executive Summary", icon: FileText },
  { id: "ai-health", label: "AI Brand Health", icon: TrendingUp },
  { id: "swot", label: "SWOT Snapshot", icon: Target },
  { id: "competitors", label: "Competitor Ranking", icon: Users },
  { id: "key-phrases", label: "Key AI Phrases", icon: MessageSquareQuote },
  { id: "action-plan", label: "Action Plan", icon: Calendar },
  { id: "methodology", label: "Methodology", icon: BarChart3 },
]

export default function SampleVipReportClient() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState("executive-summary")
  const report = SAMPLE_VIP_REPORT

  const scrollToSection = (id: string) => {
    setActiveSection(id)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const renderBody = (body: string) => {
    const lines = body.split("\n")
    return lines.map((line, i) => {
      const trimmed = line.trim()
      if (!trimmed) return <br key={i} />
      if (trimmed.startsWith("•")) {
        return (
          <li key={i} className="ml-4 text-zinc-300">
            {trimmed.substring(1).trim()}
          </li>
        )
      }
      if (trimmed.endsWith(":") || (/^[A-Z]/.test(trimmed) && trimmed.length < 60 && !trimmed.includes("."))) {
        return (
          <h4 key={i} className="text-lg font-semibold text-white mt-6 mb-2">
            {trimmed}
          </h4>
        )
      }
      return (
        <p key={i} className="text-zinc-300 leading-relaxed mb-3">
          {trimmed}
        </p>
      )
    })
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Demo Banner */}
      <div className="sticky top-0 z-50 flex items-center justify-between bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 border-b border-purple-500/20 px-6 py-3">
        <div className="flex items-center gap-3">
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 font-semibold">SAMPLE REPORT</Badge>
          <span className="text-sm text-purple-200">This is a demo preview with static Nike data</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-zinc-400 hover:text-white">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="hidden lg:block w-64 sticky top-[57px] h-[calc(100vh-57px)] border-r border-zinc-800 bg-zinc-900/50 overflow-y-auto">
          <nav className="p-4 space-y-1">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 px-3">Report Sections</p>
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === section.id
                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {section.label}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-4xl mx-auto px-6 py-10">
          {/* Report Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">VIP Report</Badge>
              <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{report.title}</h1>
            <p className="text-zinc-400">
              AI brand perception analysis for <span className="text-white font-medium">{report.brandName}</span>
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-blue-400">78</p>
                <p className="text-xs text-zinc-500 mt-1">AI Brand Score</p>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-green-400">42%</p>
                <p className="text-xs text-zinc-500 mt-1">Share of Voice</p>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-purple-400">4</p>
                <p className="text-xs text-zinc-500 mt-1">Competitors Tracked</p>
              </CardContent>
            </Card>
          </div>

          {/* Report Sections */}
          <div className="space-y-12">
            {report.sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader className="border-b border-zinc-800">
                    <CardTitle className="text-xl text-white flex items-center gap-3">
                      {section.id === "executive-summary" && <FileText className="h-5 w-5 text-blue-400" />}
                      {section.id === "ai-health" && <TrendingUp className="h-5 w-5 text-green-400" />}
                      {section.id === "swot" && <Target className="h-5 w-5 text-yellow-400" />}
                      {section.id === "competitors" && <Users className="h-5 w-5 text-purple-400" />}
                      {section.id === "key-phrases" && <MessageSquareQuote className="h-5 w-5 text-cyan-400" />}
                      {section.id === "action-plan" && <Calendar className="h-5 w-5 text-orange-400" />}
                      {section.id === "methodology" && <BarChart3 className="h-5 w-5 text-zinc-400" />}
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="prose prose-invert max-w-none">{renderBody(section.body)}</div>
                  </CardContent>
                </Card>
              </section>
            ))}
          </div>

          {/* CTA Footer */}
          <div className="mt-12 p-8 rounded-xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 border border-blue-500/20 text-center">
            <h3 className="text-xl font-semibold text-white mb-2">Ready to see your own AI Brand Report?</h3>
            <p className="text-zinc-400 mb-6">Run your first analysis and get personalized insights for your brand.</p>
            <Button size="lg" onClick={() => router.push("/dashboard")} className="bg-blue-600 hover:bg-blue-700">
              <Zap className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          </div>
        </main>
      </div>
    </div>
  )
}
