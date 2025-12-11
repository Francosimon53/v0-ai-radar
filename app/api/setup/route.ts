import { createUserClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { brand, competitors, industry, alerts } = await request.json()

    if (!brand || !competitors || !industry) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createUserClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user already has a tracking config
    const { data: existingConfig } = await supabase
      .from("tracking_configs")
      .select("id")
      .eq("user_id", user.id)
      .single()

    let configId: string

    if (existingConfig) {
      const { data, error } = await supabase
        .from("tracking_configs")
        .update({
          brand,
          competitors,
          industry,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingConfig.id)
        .select("id")
        .single()

      if (error) throw error
      configId = data.id
    } else {
      const { data, error } = await supabase
        .from("tracking_configs")
        .insert({
          user_id: user.id,
          brand,
          competitors,
          industry,
          frequency: "weekly",
          is_active: true,
        })
        .select("id")
        .single()

      if (error) throw error
      configId = data.id
    }

    // Upsert alert settings
    const { error: alertError } = await supabase.from("alert_settings").upsert(
      {
        user_id: user.id,
        score_drop_enabled: alerts.scoreDropEnabled,
        score_drop_threshold: Number.parseInt(alerts.scoreDropThreshold),
        competitor_enabled: alerts.competitorEnabled,
        competitor_threshold: Number.parseInt(alerts.competitorThreshold),
        weekly_digest_enabled: alerts.weeklyDigestEnabled,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )

    if (alertError) {
      console.error("Alert settings error:", alertError)
    }

    return NextResponse.json({
      success: true,
      configId,
      message: "Setup completed successfully",
    })
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json({ error: "Failed to save configuration" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createUserClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: config } = await supabase.from("tracking_configs").select("*").eq("user_id", user.id).single()

    const { data: alerts } = await supabase.from("alert_settings").select("*").eq("user_id", user.id).single()

    return NextResponse.json({ config, alerts })
  } catch (error) {
    console.error("Get setup error:", error)
    return NextResponse.json({ config: null, alerts: null })
  }
}
