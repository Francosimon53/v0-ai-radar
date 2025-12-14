"use client"

import VIPReportLayout, { type VIPReportData } from "@/components/vip-report-layout"

const mockReport: VIPReportData = {
  brandName: "Nike",
  industry: "Sportswear & footwear",
  createdAt: new Date().toISOString(),
  overallScore: 84,
  previousScore: 78,
  shareOfVoice: 47,
  sentiment: "positive",
  summary:
    "AI assistants describe Nike as an innovative, performance-driven brand with strong cultural relevance. Visibility is high in running, training, and lifestyle segments, with growing traction in women's performance and sustainability narratives. The brand maintains a leadership position across most AI models, though competitors are gaining ground in specific niches.",
  strengths: [
    "High association with performance, innovation, and elite athletes.",
    "Strong recall in running, training, and lifestyle categories.",
    "Positive perception of digital experiences (apps, community, content).",
    "Consistent brand voice across AI model responses.",
  ],
  weaknesses: [
    "Price sensitivity vs budget competitors in some markets.",
    "Mixed perception around sustainability transparency.",
    "Limited visibility in emerging wellness/recovery segments.",
  ],
  opportunities: [
    "Own the 'everyday athlete' positioning in AI assistants' recommendations.",
    "Create targeted content for women's performance and wellness use cases.",
    "Anchor sustainability narratives around specific, verifiable initiatives.",
    "Expand AI-ready content for voice-first and conversational commerce.",
  ],
  threats: [
    "Competitors increasing share of voice in sustainability and comfort.",
    "AI assistants recommending marketplaces or generic categories instead of brand-first.",
    "New entrants gaining traction in niche performance segments.",
  ],
  competitorScores: [
    { name: "Adidas", score: 78, shareOfVoice: 29 },
    { name: "Puma", score: 72, shareOfVoice: 12 },
    { name: "New Balance", score: 75, shareOfVoice: 8 },
    { name: "Under Armour", score: 68, shareOfVoice: 4 },
  ],
  modelBreakdown: [
    { model: "ChatGPT", score: 86, sentiment: "positive" },
    { model: "Claude", score: 82, sentiment: "positive" },
    { model: "Gemini", score: 81, sentiment: "positive" },
    { model: "Perplexity", score: 84, sentiment: "positive" },
  ],
  keyPhrases: [
    "innovative",
    "performance-driven",
    "Just Do It",
    "athletic excellence",
    "lifestyle brand",
    "premium quality",
    "sustainability efforts",
    "digital fitness",
  ],
  actionPlan90_30_7: {
    ninetyDays: [
      "Launch an AI-ready content kit for top 10 use cases (running, training, lifestyle, women's performance).",
      "Standardize product descriptions and FAQs to align with AI assistants' most frequent questions.",
      "Develop a sustainability content hub with verifiable metrics and third-party certifications.",
    ],
    thirtyDays: [
      "Audit how Nike appears across ChatGPT, Gemini, Claude, and Perplexity for 3 core personas.",
      "Define a 'Brand in AI' playbook with guardrails and messaging pillars.",
      "Identify and fix top 5 content gaps surfaced by AI assistant responses.",
    ],
    sevenDays: [
      "Run an internal workshop: 'How AI currently sees Nike' with this report as starting point.",
      "Prioritize 3 quick fixes for product pages or content gaps surfaced by AI answers.",
      "Set up weekly AI visibility monitoring for brand mentions and competitor comparisons.",
    ],
  },
}

export default function SampleVipReportClient() {
  return <VIPReportLayout report={mockReport} isPreview={true} previewBadgeText="Sample data" />
}
