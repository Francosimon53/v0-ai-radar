"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

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

  return (
    <div className="px-6 py-8 space-y-6 max-w-6xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            VIP AI Brand Report <span className="text-primary">– Sample</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            This is a sample executive-style report using example data only. Your real reports will use live AI
            visibility scans.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">Preview mode</Badge>
          <Button variant="outline" onClick={() => router.push("/dashboard/reports")}>
            Back to Reports
          </Button>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">AI Brand Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {mockReport.overallScore}
              <span className="text-base text-muted-foreground"> / 100</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Overall strength vs other brands in AI responses.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Share of Voice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {mockReport.shareOfVoice}
              <span className="text-base">%</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              How often Nike appears vs key competitors in AI answers.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Models Queried</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{mockReport.modelsQueried}</div>
            <p className="mt-1 text-xs text-muted-foreground">Major AI assistants used in this visibility scan.</p>
          </CardContent>
        </Card>
      </div>

      {/* Executive summary */}
      <Card>
        <CardHeader>
          <CardTitle>Executive summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">{mockReport.date}</p>
          <p className="text-sm leading-relaxed">{mockReport.executiveSummary}</p>
        </CardContent>
      </Card>

      {/* AI SWOT snapshot */}
      <Card>
        <CardHeader>
          <CardTitle>AI SWOT snapshot</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-emerald-400">Strengths</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {mockReport.swot.strengths.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-amber-400">Weaknesses</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {mockReport.swot.weaknesses.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-sky-400">Opportunities</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {mockReport.swot.opportunities.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-rose-400">Threats</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {mockReport.swot.threats.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Competitor comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Competitor comparison (AI visibility)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">How AI assistants score and mention Nike vs key competitors.</p>
          <div className="grid gap-3 md:grid-cols-3">
            {mockReport.competitors.map((c) => (
              <div
                key={c.name}
                className="rounded-xl border bg-gradient-to-br from-zinc-900/60 to-zinc-900/20 p-3 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{c.name}</span>
                  <span className="text-xs text-muted-foreground">Share of voice: {c.shareOfVoice}%</span>
                </div>
                <div className="text-2xl font-semibold">
                  {c.score}
                  <span className="text-xs text-muted-foreground"> / 100</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 90 / 30 / 7-day plan */}
      <Card>
        <CardHeader>
          <CardTitle>90 / 30 / 7-day action plan</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Next 90 days</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {mockReport.actionPlan90_30_7.ninetyDays.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Next 30 days</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {mockReport.actionPlan90_30_7.thirtyDays.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Next 7 days</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {mockReport.actionPlan90_30_7.sevenDays.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Call to action */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-4">
        <p className="text-xs text-muted-foreground">
          This is a static sample. Your real reports will be generated once AI scans are enabled in your workspace.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
          <Button disabled>Download PDF (coming soon)</Button>
        </div>
      </div>
    </div>
  )
}
