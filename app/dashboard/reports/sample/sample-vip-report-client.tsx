"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Download, Copy, Share2 } from "lucide-react"

const mockReport = {
  brandName: "Nike",
  industry: "Sportswear & footwear",
  date: "Preview mode – example data only",
  overallScore: 84,
  shareOfVoice: 47,
  sentiment: "Mostly positive",
  modelsQueried: 5,
  executiveSummary:
    "AI assistants describe Nike as an innovative, performance-driven brand with strong cultural relevance. Visibility is high in running, training, and lifestyle segments, with growing traction in women's performance and sustainability narratives.",
  swot: {
    strengths: [
      "High association with performance, innovation, and elite athletes.",
      "Strong recall in running, training, and lifestyle categories.",
      "Positive perception of digital experiences (apps, community, content).",
    ],
    weaknesses: [
      "Price sensitivity vs budget competitors in some markets.",
      "Mixed perception around sustainability transparency.",
    ],
    opportunities: [
      "Own the 'everyday athlete' positioning in AI assistants' recommendations.",
      "Create targeted content for women's performance and wellness use cases.",
      "Anchor sustainability narratives around specific, verifiable initiatives.",
    ],
    threats: [
      "Competitors increasing share of voice in sustainability and comfort.",
      "AI assistants recommending marketplaces or generic categories instead of brand-first.",
    ],
  },
  competitors: [
    { name: "Adidas", score: 78, shareOfVoice: 29 },
    { name: "Puma", score: 72, shareOfVoice: 18 },
    { name: "New Balance", score: 75, shareOfVoice: 12 },
  ],
  actionPlan90_30_7: {
    ninetyDays: [
      "Launch an AI-ready content kit for top 10 use cases (running, training, lifestyle, women's performance).",
      "Standardize product descriptions and FAQs to align with AI assistants' most frequent questions.",
    ],
    thirtyDays: [
      "Audit how Nike appears across ChatGPT, Gemini, and other AI models for 3 core personas.",
      "Define a 'Brand in AI' playbook with guardrails and messaging pillars.",
    ],
    sevenDays: [
      "Run an internal workshop: 'How AI currently sees Nike' with this report as starting point.",
      "Prioritize 3 quick fixes for product pages or content gaps surfaced by AI answers.",
    ],
  },
}

export default function SampleVipReportClient() {
  const router = useRouter()

  const handleDownloadPdf = () => {
    alert("In this demo, PDF export will be available soon.")
  }

  const handleCopyInsights = () => {
    const insights = `AI Brand Report - ${mockReport.brandName}
    
AI Brand Score: ${mockReport.overallScore}/100
Share of Voice: ${mockReport.shareOfVoice}%

Executive Summary:
${mockReport.executiveSummary}

Key Strengths:
${mockReport.swot.strengths.map((s) => `• ${s}`).join("\n")}

Next 7 Days:
${mockReport.actionPlan90_30_7.sevenDays.map((s) => `• ${s}`).join("\n")}`

    navigator.clipboard.writeText(insights)
    alert("Key insights copied to clipboard!")
  }

  const handleShare = () => {
    alert("Client sharing will be available soon.")
  }

  return (
    <div className="px-6 py-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">VIP AI Brand Report – Sample</h1>
            <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">Preview mode</Badge>
          </div>
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            This is a sample executive-style report using example data only. Your real reports will use live AI
            visibility scans.
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/dashboard/reports")}>
          Back to Reports
        </Button>
      </div>

      <div className="space-y-2">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-zinc-400 uppercase tracking-wide">AI Brand Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white">
                {mockReport.overallScore}
                <span className="text-lg text-zinc-400 font-normal"> / 100</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-zinc-400 uppercase tracking-wide">Share of Voice</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white">
                {mockReport.shareOfVoice}
                <span className="text-lg text-zinc-400 font-normal">%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-zinc-400 uppercase tracking-wide">Models Queried</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white">{mockReport.modelsQueried}</div>
            </CardContent>
          </Card>
        </div>
        <p className="text-xs text-zinc-500 text-center">
          Benchmarked vs closest AI-visible competitors in your category.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 border-b border-zinc-800 pb-4">
        <Button onClick={handleDownloadPdf} className="bg-blue-600 hover:bg-blue-700">
          <Download className="mr-2 h-4 w-4" />
          Download sample as PDF
        </Button>
        <Button
          variant="outline"
          onClick={handleCopyInsights}
          className="border-zinc-700 hover:bg-zinc-800 bg-transparent"
        >
          <Copy className="mr-2 h-4 w-4" />
          Copy key insights
        </Button>
        <Button variant="ghost" onClick={handleShare} className="text-zinc-400 hover:text-white">
          <Share2 className="mr-2 h-4 w-4" />
          Share with client (coming soon)
        </Button>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-zinc-400 uppercase tracking-wide">
            Executive summary (for clients)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-400 mb-3">{mockReport.date}</p>
          <p className="text-zinc-200 leading-relaxed max-w-3xl">{mockReport.executiveSummary}</p>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">AI SWOT snapshot</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {/* Strengths */}
          <div className="rounded-lg border border-zinc-800 p-4 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              <span className="text-green-400">Strengths</span>
            </h3>
            <ul className="space-y-2 text-sm text-zinc-300">
              {mockReport.swot.strengths.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* Weaknesses */}
          <div className="rounded-lg border border-zinc-800 p-4 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
              <span className="text-yellow-400">Weaknesses</span>
            </h3>
            <ul className="space-y-2 text-sm text-zinc-300">
              {mockReport.swot.weaknesses.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* Opportunities */}
          <div className="rounded-lg border border-zinc-800 p-4 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
              <span className="text-blue-400">Opportunities</span>
            </h3>
            <ul className="space-y-2 text-sm text-zinc-300">
              {mockReport.swot.opportunities.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* Threats */}
          <div className="rounded-lg border border-zinc-800 p-4 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500"></span>
              <span className="text-red-400">Threats</span>
            </h3>
            <ul className="space-y-2 text-sm text-zinc-300">
              {mockReport.swot.threats.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg font-semibold text-white">Competitor comparison (AI visibility)</CardTitle>
          <p className="text-sm text-zinc-400">How AI assistants score and mention Nike vs key competitors.</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {mockReport.competitors.map((c) => (
              <div key={c.name} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
                <p className="font-medium text-white">{c.name}</p>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-white">
                    {c.score}
                    <span className="text-sm text-zinc-400 font-normal">/100</span>
                  </span>
                  <span className="text-xs text-zinc-400">SoV: {c.shareOfVoice}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg font-semibold text-white">90 / 30 / 7-day action plan</CardTitle>
          <p className="text-sm text-zinc-400">
            Practical roadmap you can paste into your internal plan or client deck.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white border-b border-zinc-800 pb-2">Next 90 days</h3>
              <ul className="space-y-2 text-sm text-zinc-300">
                {mockReport.actionPlan90_30_7.ninetyDays.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white border-b border-zinc-800 pb-2">Next 30 days</h3>
              <ul className="space-y-2 text-sm text-zinc-300">
                {mockReport.actionPlan90_30_7.thirtyDays.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-cyan-500 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white border-b border-zinc-800 pb-2">Next 7 days</h3>
              <ul className="space-y-2 text-sm text-zinc-300">
                {mockReport.actionPlan90_30_7.sevenDays.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="text-xs text-zinc-500 italic pt-2 border-t border-zinc-800">
            Tip: Use &quot;Copy key insights&quot; at the top of this page to reuse these bullets in your own slides.
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-4">
        <p className="text-xs text-zinc-500">
          This is a static sample. Your real reports will be generated once AI scans are enabled in your workspace.
        </p>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard")}
          className="border-zinc-700 hover:bg-zinc-800 bg-transparent"
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  )
}
