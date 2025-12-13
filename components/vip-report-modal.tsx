"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { SAMPLE_VIP_REPORT } from "@/app/dashboard/reports/sampleVipReport"

interface VIPReportModalProps {
  isOpen: boolean
  onClose: () => void
}

export function VIPReportModal({ isOpen, onClose }: VIPReportModalProps) {
  const [activeSectionId, setActiveSectionId] = useState(SAMPLE_VIP_REPORT.sections[0].id)

  if (!isOpen) return null

  const activeSection =
    SAMPLE_VIP_REPORT.sections.find((s) => s.id === activeSectionId) || SAMPLE_VIP_REPORT.sections[0]

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
      // Check if it's a header-like line (short and no punctuation at end)
      if (trimmed.length < 50 && !trimmed.endsWith(".") && !trimmed.endsWith(":") && !trimmed.includes("|")) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 mx-4 flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">{SAMPLE_VIP_REPORT.title}</h2>
            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">Sample report – static example</Badge>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Navigation sidebar */}
          <div className="w-64 shrink-0 border-r border-zinc-800 bg-zinc-900/50 p-4 overflow-y-auto">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">Report sections</h3>
            <nav className="space-y-1">
              {SAMPLE_VIP_REPORT.sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSectionId(section.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    activeSectionId === section.id
                      ? "bg-blue-500/10 text-blue-400 font-medium"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </div>

          {/* Right: Content area */}
          <div className="flex-1 overflow-y-auto p-8">
            <h3 className="text-2xl font-bold text-white mb-6">{activeSection.title}</h3>
            <div className="prose prose-invert max-w-none">{renderBody(activeSection.body)}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-800 px-6 py-4 flex justify-end">
          <Button onClick={onClose} className="bg-zinc-800 hover:bg-zinc-700 text-white">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
