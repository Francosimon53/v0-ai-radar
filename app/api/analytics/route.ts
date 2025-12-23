import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    console.log("📊 [ANALYTICS API] Fetching analytics data")

    // Get all analyses from Supabase
    const { data: analyses, error } = await supabase
      .from("analysis_results")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ [ANALYTICS API] Supabase error:", error)
      // Return empty analytics instead of throwing
      return NextResponse.json(getEmptyAnalytics())
    }

    console.log(`✅ [ANALYTICS API] Found ${analyses?.length || 0} analyses`)

    // Process data for analytics
    const analytics = {
      totalAnalyses: analyses?.length || 0,

      // Top brands by score
      topBrands:
        analyses
          ?.filter((a) => a.consensus_score != null)
          .sort((a, b) => (b.consensus_score || 0) - (a.consensus_score || 0))
          .slice(0, 10)
          .map((a) => ({
            name: a.brand_name || "Unknown",
            score: a.consensus_score || 0,
            timestamp: a.created_at,
          })) || [],

      // Average scores by dimension
      averageScores: calculateAverageScores(analyses || []),

      // Analysis over time (last 30 days)
      timeline: generateTimeline(analyses || []),

      // Category breakdown
      categories: categorizeAnalyses(analyses || []),

      // Recent analyses
      recentAnalyses:
        analyses?.slice(0, 5).map((a) => ({
          brand: a.brand_name || "Unknown",
          score: a.consensus_score || 0,
          date: a.created_at,
        })) || [],
    }

    return NextResponse.json(analytics)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("❌ [ANALYTICS API] Error:", errorMessage)
    return NextResponse.json(getEmptyAnalytics())
  }
}

function getEmptyAnalytics() {
  return {
    totalAnalyses: 0,
    topBrands: [],
    averageScores: null,
    timeline: [],
    categories: [],
    recentAnalyses: [],
  }
}

function calculateAverageScores(analyses: Record<string, unknown>[]) {
  if (analyses.length === 0) return null

  const totals = {
    sentiment: 0,
    innovation: 0,
    trust: 0,
    sustainability: 0,
    value: 0,
  }

  let count = 0

  analyses.forEach((analysis) => {
    if (analysis.dimensional_scores) {
      const scores =
        typeof analysis.dimensional_scores === "string"
          ? JSON.parse(analysis.dimensional_scores as string)
          : analysis.dimensional_scores

      if (scores && typeof scores === "object") {
        const s = scores as Record<string, number>
        totals.sentiment += s.sentiment || 0
        totals.innovation += s.innovation || 0
        totals.trust += s.trust || 0
        totals.sustainability += s.sustainability || 0
        totals.value += s.value || 0
        count++
      }
    }
  })

  if (count === 0) return null

  return {
    sentiment: Math.round(totals.sentiment / count),
    innovation: Math.round(totals.innovation / count),
    trust: Math.round(totals.trust / count),
    sustainability: Math.round(totals.sustainability / count),
    value: Math.round(totals.value / count),
  }
}

function generateTimeline(analyses: Record<string, unknown>[]) {
  const last30Days = new Date()
  last30Days.setDate(last30Days.getDate() - 30)

  const timeline: { [key: string]: number } = {}

  analyses
    .filter((a) => a.created_at && new Date(a.created_at as string) >= last30Days)
    .forEach((analysis) => {
      const date = new Date(analysis.created_at as string).toISOString().split("T")[0]
      timeline[date] = (timeline[date] || 0) + 1
    })

  return Object.entries(timeline)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

function categorizeAnalyses(analyses: Record<string, unknown>[]) {
  const categories: { [key: string]: number } = {
    Technology: 0,
    Automotive: 0,
    Fashion: 0,
    "Food & Beverage": 0,
    Retail: 0,
    Entertainment: 0,
    Sports: 0,
    Finance: 0,
    Other: 0,
  }

  const techBrands = ["apple", "microsoft", "google", "meta", "nvidia", "intel", "samsung", "amazon", "ibm", "oracle"]
  const autoBrands = ["tesla", "toyota", "ford", "bmw", "mercedes", "honda", "volkswagen", "audi", "porsche"]
  const fashionBrands = ["nike", "adidas", "gucci", "zara", "h&m", "louis vuitton", "prada", "chanel"]
  const foodBrands = ["coca-cola", "pepsi", "mcdonalds", "starbucks", "nestle", "kfc", "burger king"]
  const retailBrands = ["walmart", "target", "costco", "ikea", "home depot"]
  const entertainmentBrands = ["netflix", "disney", "spotify", "youtube", "hbo", "warner"]
  const sportsBrands = ["espn", "nba", "nfl", "fifa", "ufc", "redbull"]
  const financeBrands = ["visa", "mastercard", "paypal", "jpmorgan", "goldman", "amex"]

  analyses.forEach((analysis) => {
    const brand = ((analysis.brand_name as string) || "").toLowerCase()

    if (techBrands.some((b) => brand.includes(b))) {
      categories["Technology"]++
    } else if (autoBrands.some((b) => brand.includes(b))) {
      categories["Automotive"]++
    } else if (fashionBrands.some((b) => brand.includes(b))) {
      categories["Fashion"]++
    } else if (foodBrands.some((b) => brand.includes(b))) {
      categories["Food & Beverage"]++
    } else if (retailBrands.some((b) => brand.includes(b))) {
      categories["Retail"]++
    } else if (entertainmentBrands.some((b) => brand.includes(b))) {
      categories["Entertainment"]++
    } else if (sportsBrands.some((b) => brand.includes(b))) {
      categories["Sports"]++
    } else if (financeBrands.some((b) => brand.includes(b))) {
      categories["Finance"]++
    } else {
      categories["Other"]++
    }
  })

  return Object.entries(categories)
    .filter(([, count]) => count > 0)
    .map(([category, count]) => ({ category, count }))
}
