// Static sample VIP report data for Nike demo
export type VipReportSection = {
  id: string
  title: string
  body: string
}

export type VipSampleReport = {
  title: string
  brandName: string
  sections: VipReportSection[]
}

export const SAMPLE_VIP_REPORT: VipSampleReport = {
  title: "Sample VIP AI Brand Report – Nike vs competitors",
  brandName: "Nike",
  sections: [
    {
      id: "executive-summary",
      title: "Executive Summary",
      body: "AI assistants currently see Nike as a leading sportswear brand with strong global awareness and consistently positive sentiment. When users ask for recommendations related to running shoes, training gear or everyday athleisure, Nike is frequently mentioned as a top choice.\n\nAcross AI models, Nike is strongly associated with innovation, performance, and inspirational storytelling. Collaborations with athletes and creators are perceived as a key differentiator, helping the brand stay culturally relevant across multiple markets.\n\nHowever, competitors are closing the gap in two critical areas: sustainability positioning and women-focused collections. In several AI answers, brands like Adidas and Lululemon are recommended ahead of Nike when users explicitly ask for eco-friendly or women-first sportswear options.\n\nOverall, Nike's AI brand score is solid and stable, but there is clear upside in strengthening its narrative around sustainability, inclusivity, and localized collections for Spanish-speaking markets.",
    },
    {
      id: "ai-health",
      title: "AI Brand Health & Trend",
      body: 'AI Brand Health & Trend\n\nAI Brand Score (sample): 78 / 100\nTrend (last 3 months, sample): Stable with a slight positive bias.\n\nAI assistants most often recommend Nike for:\n• Performance running shoes and training footwear\n• Versatile athleisure outfits for everyday use\n• Iconic collaborations and limited-edition drops\n\nRisk signals:\n• In "sustainable sportswear" queries, Nike is sometimes ranked behind competitors.\n• In "women\'s gym outfits" queries, rivals appear more frequently in the top suggestions.\n• In Spanish-language queries, Nike is under-represented compared to English results.',
    },
    {
      id: "swot",
      title: "AI SWOT Snapshot",
      body: 'Strengths\n• Strong global awareness and top-of-mind recall in AI recommendations.\n• Clear association with performance, innovation and elite athletes.\n• Powerful storytelling assets (Just Do It, athlete partnerships, iconic campaigns).\n\nWeaknesses\n• Inconsistent positioning around sustainability across AI answers.\n• Limited perceived leadership in women-first collections vs key competitors.\n• Under-optimized presence in Spanish-language and Latin American AI queries.\n\nOpportunities\n• Own the narrative around "AI-ready" digital experiences for runners and athletes.\n• Launch targeted content to dominate sustainability and circular fashion queries.\n• Create localized AI content strategies for Spanish-speaking and emerging markets.\n\nThreats\n• Competitors gaining share of voice in "eco-friendly" and "inclusive sizing" segments.\n• New digital-native brands with aggressive creator strategies in social + AI channels.\n• Rapid changes in AI search surfaces can reshuffle rankings without notice.',
    },
    {
      id: "competitors",
      title: "Competitor Ranking & Share of Voice",
      body: "Based on a sample of AI assistant answers across key queries (example data):\n\n• Nike – AI Score: 78 / 100 | Share of Voice: 42%\n• Adidas – AI Score: 72 / 100 | Share of Voice: 28%\n• Puma – AI Score: 66 / 100 | Share of Voice: 18%\n• New Balance – AI Score: 63 / 100 | Share of Voice: 12%\n\nInterpretation (sample):\nNike currently leads in both AI score and share of voice, especially in performance-oriented and lifestyle queries. Adidas is the closest challenger, often mentioned in the same answers as Nike. Puma and New Balance over-index in niche use cases (comfort, heritage, niche running communities) where their story is more focused.",
    },
    {
      id: "key-phrases",
      title: "Key AI Phrases About Your Brand",
      body: 'These are examples of phrases that AI assistants use – or could use – when describing Nike:\n\n• "Go-to brand for performance running shoes."\n• "Combines innovation, technology and bold design in sportswear."\n• "Trusted by elite athletes and everyday runners worldwide."\n• "Iconic collaborations that connect sport, music and street culture."\n• "Strong choice for versatile gym-to-street outfits."\n• "Progressively integrating sustainability into materials and supply chain."\n\nUse cases:\nThese phrases can be turned into headlines, landing page copy, campaign ideas and creative briefs to stay aligned with how AI already talks about the brand.',
    },
    {
      id: "action-plan",
      title: "90 / 30 / 7-Day AI Visibility Action Plan",
      body: 'Next 7 Days – Quick Wins\n• Align your core brand messaging with the strongest AI phrases identified in this report.\n• Audit your top 10 landing pages to ensure they clearly reflect performance + innovation.\n• Create a simple FAQ or resource page optimized for "best running shoes" and "training gear" queries.\n\nNext 30 Days – Campaign & Content\n• Launch a focused content sprint around sustainability and circular sportswear, using language that AI can easily parse (materials, durability, recycling).\n• Produce creator-led content that highlights women-first collections and inclusive sizing, then distribute it across your main channels.\n• Localize key landing pages and product descriptions for Spanish-speaking markets, targeting the same high-intent queries that work in English.\n\nNext 90 Days – Strategic Positioning\n• Design an always-on "AI-ready content library" for your brand: structured landing pages, educational articles, and Q&A content aligned with your strategic keywords.\n• Partner with your key retail and marketplace channels to ensure product data, titles and descriptions are consistent with your AI positioning.\n• Define internal AI KPIs (AI brand score, share of voice, sentiment trends) and review them quarterly as part of your executive reporting.',
    },
    {
      id: "methodology",
      title: "Methodology & Data Sources",
      body: "This sample report is based on simulated AI data to illustrate the final experience your clients will receive. In the live product, your report will be generated from:\n\n• Aggregated answers from multiple AI assistants and search surfaces.\n• A structured set of brand and competitor queries aligned with your industry.\n• A scoring model that converts AI mentions, sentiment and ranking into an AI Brand Score.\n\nAll data will be presented at an executive level, with enough detail for your team to take clear action in the next 7, 30 and 90 days.",
    },
  ],
}
