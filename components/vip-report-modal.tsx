"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, FileText, TrendingUp, Target, Users, MessageSquare, Calendar } from "lucide-react"

interface VIPReportModalProps {
  isOpen: boolean
  onClose: () => void
}

const sections = [
  { id: "summary", label: "Executive summary", icon: FileText },
  { id: "score", label: "AI brand health & score", icon: TrendingUp },
  { id: "swot", label: "AI SWOT snapshot", icon: Target },
  { id: "competitors", label: "Competitor ranking", icon: Users },
  { id: "phrases", label: "Key AI phrases", icon: MessageSquare },
  { id: "plan", label: "90/30/7-day action plan", icon: Calendar },
]

export function VIPReportModal({ isOpen, onClose }: VIPReportModalProps) {
  const [activeSection, setActiveSection] = useState("summary")

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 mx-4 flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">Sample VIP AI Brand Report – Nike vs competitors</h2>
            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">Sample – demo content</Badge>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Note banner */}
        <div className="bg-blue-500/10 border-b border-blue-500/20 px-6 py-3">
          <p className="text-sm text-blue-300">
            This is a <strong>SAMPLE</strong> report. Once you run your first analysis, your real data will replace this
            example.
          </p>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Navigation */}
          <div className="w-64 shrink-0 border-r border-zinc-800 bg-zinc-900/50 p-4">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">Report outline</h3>
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    activeSection === section.id
                      ? "bg-blue-500/10 text-blue-400"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  <section.icon className="h-4 w-4" />
                  {section.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Right: Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeSection === "summary" && (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">Executive Summary</h3>
                <div className="space-y-4 text-zinc-300 leading-relaxed">
                  <p>
                    AI assistants currently see <strong>Nike</strong> as a leading brand in sportswear, with strong
                    global awareness and positive sentiment.
                  </p>
                  <p>Share of voice in AI answers is concentrated in performance and lifestyle footwear queries.</p>
                  <p className="text-amber-400">
                    <strong>Key risk:</strong> Competitors are catching up fast in sustainability and women-focused
                    collections.
                  </p>
                </div>
              </div>
            )}

            {activeSection === "score" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white">AI Brand Health & Score</h3>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-zinc-400 mb-1">AI Brand Score</p>
                      <p className="text-5xl font-bold text-white">
                        78 <span className="text-2xl text-zinc-500">/ 100</span>
                      </p>
                      <p className="text-sm text-zinc-500 mt-1">(sample)</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-500/10 text-green-400 border-green-500/20 mb-2">Positive</Badge>
                      <p className="text-sm text-zinc-400">Trend: Stable over the last 3 months (sample)</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "swot" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white">AI SWOT Snapshot</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
                    <h4 className="font-semibold text-green-400 mb-3">Strengths</h4>
                    <ul className="space-y-2 text-sm text-zinc-300">
                      <li>• Strong brand recognition across all AI assistants</li>
                      <li>• Consistently recommended for performance running</li>
                      <li>• High trust scores in athletic footwear queries</li>
                    </ul>
                  </div>
                  <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
                    <h4 className="font-semibold text-yellow-400 mb-3">Weaknesses</h4>
                    <ul className="space-y-2 text-sm text-zinc-300">
                      <li>• Price perception issues in budget segments</li>
                      <li>• Limited visibility in sustainability queries</li>
                      <li>• Some product line confusion in AI responses</li>
                    </ul>
                  </div>
                  <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                    <h4 className="font-semibold text-blue-400 mb-3">Opportunities</h4>
                    <ul className="space-y-2 text-sm text-zinc-300">
                      <li>• Own the "AI personal trainer" conversation</li>
                      <li>• Expand presence in women's athletic wear queries</li>
                      <li>• Build AI-native product discovery experiences</li>
                    </ul>
                  </div>
                  <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                    <h4 className="font-semibold text-red-400 mb-3">Threats</h4>
                    <ul className="space-y-2 text-sm text-zinc-300">
                      <li>• Adidas gaining ground in lifestyle segments</li>
                      <li>• New Balance rising in comfort-focused queries</li>
                      <li>• Risk of outdated info in AI training data</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "competitors" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white">Competitor Ranking & Share of Voice</h3>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-zinc-800/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Brand</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-zinc-400">AI Score</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-zinc-400">Share of Voice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      <tr className="bg-blue-500/5">
                        <td className="px-4 py-3 font-medium text-white">Nike (You)</td>
                        <td className="px-4 py-3 text-right text-white">78</td>
                        <td className="px-4 py-3 text-right text-white">42%</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-zinc-300">Adidas</td>
                        <td className="px-4 py-3 text-right text-zinc-300">72</td>
                        <td className="px-4 py-3 text-right text-zinc-300">28%</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-zinc-300">Puma</td>
                        <td className="px-4 py-3 text-right text-zinc-300">66</td>
                        <td className="px-4 py-3 text-right text-zinc-300">18%</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-zinc-300">New Balance</td>
                        <td className="px-4 py-3 text-right text-zinc-300">63</td>
                        <td className="px-4 py-3 text-right text-zinc-300">12%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-zinc-500 italic">
                  All data is sample/demo content for illustration purposes.
                </p>
              </div>
            )}

            {activeSection === "phrases" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white">Key AI Phrases About Your Brand</h3>
                <p className="text-zinc-400">These are the most common phrases AI models use when describing Nike:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Go-to brand for performance running shoes",
                    "Iconic collaborations with athletes and creators",
                    "Premium sportswear with global reach",
                    "Innovation leader in athletic footwear",
                    "Strong presence in basketball and running",
                    "Associated with elite athletic performance",
                    "Recognizable swoosh logo",
                  ].map((phrase, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="border-zinc-700 bg-zinc-800/50 text-zinc-300 py-1.5 px-3"
                    >
                      {phrase}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {activeSection === "plan" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white">90 / 30 / 7-Day Action Plan</h3>

                <div className="space-y-6">
                  <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-5">
                    <h4 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Next 7 Days – Quick Wins
                    </h4>
                    <ul className="space-y-2 text-sm text-zinc-300">
                      <li>• Audit your top 10 product pages for AI-friendly content structure</li>
                      <li>• Update FAQ sections with conversational, question-based format</li>
                      <li>• Create a "best for" guide for your top 5 products</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-5">
                    <h4 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Next 30 Days – Campaign & Content
                    </h4>
                    <ul className="space-y-2 text-sm text-zinc-300">
                      <li>• Launch a sustainability content hub with AI-optimized structure</li>
                      <li>• Develop 5 comparison guides vs top competitors</li>
                      <li>• Create AI-friendly product recommendation flows</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-5">
                    <h4 className="font-semibold text-purple-400 mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Next 90 Days – Strategic Positioning
                    </h4>
                    <ul className="space-y-2 text-sm text-zinc-300">
                      <li>• Establish thought leadership content for AI training inclusion</li>
                      <li>• Build partnerships with AI-first review platforms</li>
                      <li>• Develop proprietary AI-powered customer journey tools</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
