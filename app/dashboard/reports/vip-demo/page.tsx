import ReportDetailClient from "../[id]/report-detail-client"
import { Badge } from "@/components/ui/badge"

const demoReport = {
  id: "demo-nike-001",
  createdAt: new Date().toISOString(),
  brandName: "Nike",
  overallScore: 82,
  previousScore: 76,
  sentiment: "positive" as const,
  summary:
    "Nike enjoys strong AI visibility and generally positive sentiment across major AI assistants. Most models associate the brand with performance, innovation, and global reach, but there are areas to improve around price perception and sustainability messaging.",
  strengths: [
    "Strong association with performance and elite athletes.",
    "High global recognition across multiple markets.",
    "Consistent brand voice across most AI-generated answers.",
  ],
  weaknesses: [
    "Some models highlight high prices as a barrier.",
    "Mixed signals around sustainability commitments.",
    "Occasional confusion with specific product lines in search.",
  ],
  opportunities: [
    "Leverage AI assistants for personalized product guidance.",
    "Strengthen sustainability narrative in long-form answers.",
    "Own more conversational queries around training and coaching.",
  ],
  threats: [
    "Competitors gaining AI visibility on budget-friendly segments.",
    "Shadow content from unofficial resellers creating noise.",
    "Risk of outdated training data on some models.",
  ],
  competitorScores: [
    { name: "Nike (You)", score: 82, shareOfVoice: 34 },
    { name: "Adidas", score: 78, shareOfVoice: 24 },
    { name: "Puma", score: 71, shareOfVoice: 16 },
    { name: "Under Armour", score: 67, shareOfVoice: 14 },
  ],
  modelBreakdown: [
    { model: "ChatGPT", score: 85, sentiment: "positive" as const },
    { model: "Claude", score: 80, sentiment: "positive" as const },
    { model: "Gemini", score: 78, sentiment: "positive" as const },
  ],
  keyPhrases: ["high-performance sportswear", "elite athletes", "global brand", "running shoes", "innovation"],
  recommendations: [
    { id: 1, title: "Launch a focused AI content playbook for top 20 product queries.", priority: "high" as const },
    { id: 2, title: "Update sustainability messaging across long-form AI responses.", priority: "high" as const },
    { id: 3, title: "Create exclusive AI-powered training journeys for runners.", priority: "medium" as const },
    { id: 4, title: "Differentiate clearly between premium and entry-level lines.", priority: "medium" as const },
    { id: 5, title: "Monitor and clean up unofficial reseller mentions.", priority: "low" as const },
  ],
}

export default function VIPDemoPage() {
  return (
    <div>
      <div className="sticky top-0 z-50 flex items-center justify-center gap-3 bg-purple-500/10 border-b border-purple-500/20 px-4 py-3">
        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 font-semibold">VIP DEMO</Badge>
        <span className="text-sm text-purple-200">This report uses sample data to preview the premium layout</span>
      </div>

      {/* Reuse the existing premium report layout */}
      <ReportDetailClient report={demoReport} />
    </div>
  )
}
