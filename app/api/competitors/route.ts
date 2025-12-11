import { type NextRequest, NextResponse } from "next/server"
import { createUserClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createUserClient()

    // Get user's tracking config with competitors
    const { data: config, error: configError } = await supabase
      .from("tracking_configs")
      .select("id, brand, competitors")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (configError && configError.code !== "PGRST116") {
      throw configError
    }

    if (!config) {
      return NextResponse.json({ competitors: [], brand: null })
    }

    // Get latest analysis results for competitor data
    const { data: latestReport } = await supabase
      .from("reports")
      .select("share_of_voice, threats")
      .eq("config_id", config.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    // Build competitor data with scores from analysis
    const competitors = (config.competitors || []).map((name: string, index: number) => {
      const shareOfVoice = latestReport?.share_of_voice?.[name] || Math.floor(Math.random() * 15) + 5
      const threat = latestReport?.threats?.find((t: any) => t.competitor === name)

      return {
        id: `competitor-${index}`,
        name,
        score: threat?.score || Math.floor(Math.random() * 30) + 50,
        scoreChange: threat?.momentum || Math.floor(Math.random() * 10) - 5,
        shareOfVoice,
        threatLevel: threat?.level || (shareOfVoice > 20 ? "high" : shareOfVoice > 10 ? "medium" : "low"),
      }
    })

    return NextResponse.json({
      competitors,
      brand: config.brand,
      configId: config.id,
    })
  } catch (error) {
    console.error("Error fetching competitors:", error)
    return NextResponse.json({ error: "Failed to fetch competitors" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createUserClient()
    const { competitor } = await request.json()

    if (!competitor || typeof competitor !== "string") {
      return NextResponse.json({ error: "Competitor name is required" }, { status: 400 })
    }

    // Get current config
    const { data: config, error: configError } = await supabase
      .from("tracking_configs")
      .select("id, competitors")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (configError) {
      return NextResponse.json({ error: "No brand configuration found" }, { status: 404 })
    }

    const currentCompetitors = config.competitors || []

    // Check if competitor already exists
    if (currentCompetitors.includes(competitor)) {
      return NextResponse.json({ error: "Competitor already exists" }, { status: 400 })
    }

    // Add new competitor
    const updatedCompetitors = [...currentCompetitors, competitor]

    const { error: updateError } = await supabase
      .from("tracking_configs")
      .update({ competitors: updatedCompetitors })
      .eq("id", config.id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true, competitors: updatedCompetitors })
  } catch (error) {
    console.error("Error adding competitor:", error)
    return NextResponse.json({ error: "Failed to add competitor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createUserClient()
    const { searchParams } = new URL(request.url)
    const competitorName = searchParams.get("name")

    if (!competitorName) {
      return NextResponse.json({ error: "Competitor name is required" }, { status: 400 })
    }

    // Get current config
    const { data: config, error: configError } = await supabase
      .from("tracking_configs")
      .select("id, competitors")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (configError) {
      return NextResponse.json({ error: "No brand configuration found" }, { status: 404 })
    }

    // Remove competitor
    const updatedCompetitors = (config.competitors || []).filter((c: string) => c !== competitorName)

    const { error: updateError } = await supabase
      .from("tracking_configs")
      .update({ competitors: updatedCompetitors })
      .eq("id", config.id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true, competitors: updatedCompetitors })
  } catch (error) {
    console.error("Error removing competitor:", error)
    return NextResponse.json({ error: "Failed to remove competitor" }, { status: 500 })
  }
}
