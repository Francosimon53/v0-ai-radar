import ReportDetailClient from "../[id]/report-detail-client"
import { Badge } from "@/components/ui/badge"

const demoReport = {
  id: "demo-001",
  createdAt: new Date().toISOString(),
  brandName: "Acme Corp",
  overallScore: 72,
  previousScore: 65,
  sentiment: "positive" as const,
  summary:
    "Acme Corp shows strong brand recognition in AI conversations, particularly in the B2B software space. ChatGPT and Claude consistently mention Acme when users ask about enterprise solutions, though there's room to improve visibility in the SMB segment. The brand is perceived as reliable and innovative, with AI models frequently highlighting your cloud infrastructure and customer support as key differentiators.",
  strengths: [
    "Strong association with enterprise-grade reliability",
    "Frequently mentioned alongside industry leaders like Salesforce and HubSpot",
    "AI models highlight exceptional customer support as a key differentiator",
    "Cloud infrastructure is perceived as cutting-edge",
    "Positive sentiment around recent product launches",
  ],
  weaknesses: [
    "Limited visibility in SMB-focused conversations",
    "Pricing perceived as premium compared to newer competitors",
    "Mobile experience rarely mentioned by AI models",
    "Brand story not well articulated in AI responses",
  ],
  opportunities: [
    "Expand content strategy to target SMB keywords",
    "Create more case studies for AI training data",
    "Develop thought leadership content on emerging trends",
    "Partner with AI companies for better brand representation",
  ],
  threats: [
    "Emerging competitors gaining AI mindshare rapidly",
    "Negative reviews from 2023 still surface in some AI responses",
    "Category becoming commoditized in AI recommendations",
    "Competitors investing heavily in AI-optimized content",
  ],
  competitorScores: [
    { name: "Acme Corp (You)", score: 72, shareOfVoice: 28 },
    { name: "TechRival Inc", score: 78, shareOfVoice: 32 },
    { name: "CloudFirst", score: 65, shareOfVoice: 22 },
    { name: "DataFlow", score: 58, shareOfVoice: 18 },
  ],
  modelBreakdown: [
    { model: "GPT-4o", score: 75, sentiment: "positive" as const },
    { model: "Claude 3.5", score: 71, sentiment: "positive" as const },
    { model: "Gemini Pro", score: 68, sentiment: "neutral" as const },
    { model: "Llama 3", score: 70, sentiment: "positive" as const },
  ],
  keyPhrases: [
    "enterprise solution",
    "reliable platform",
    "cloud infrastructure",
    "customer support",
    "B2B software",
    "scalable",
    "secure",
    "integration capabilities",
    "industry leader",
    "trusted provider",
  ],
  recommendations: [
    { id: 1, title: "Create 10+ case studies optimized for AI crawlers", priority: "high" as const },
    { id: 2, title: "Address 2023 negative reviews with public responses", priority: "high" as const },
    { id: 3, title: "Develop SMB-focused landing pages and content", priority: "high" as const },
    { id: 4, title: "Publish monthly thought leadership articles", priority: "medium" as const },
    { id: 5, title: "Update product documentation for AI readability", priority: "medium" as const },
    { id: 6, title: "Launch customer testimonial video series", priority: "medium" as const },
    { id: 7, title: "Optimize mobile experience and promote it", priority: "low" as const },
    { id: 8, title: "Create comparison pages vs top competitors", priority: "low" as const },
    { id: 9, title: "Build AI-specific FAQ section on website", priority: "low" as const },
  ],
}

export default function VIPDemoPage() {
  return (
    <div>
      {/* Demo banner */}
      <div className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-amber-500/10 border-b border-amber-500/20 px-4 py-2">
        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Demo Mode</Badge>
        <span className="text-sm text-amber-300">This is sample data – not yet connected to live AI models</span>
      </div>

      {/* Reuse the existing premium report layout */}
      <ReportDetailClient report={demoReport} />
    </div>
  )
}
