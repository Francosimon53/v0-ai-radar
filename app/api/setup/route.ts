import { createUserClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { brand, competitors, industry, alerts } = await request.json()

    // Validate required fields
    if (!brand || !competitors || !industry) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createUserClient()

    // Get current user (optional - for demo mode, we'll create a demo config)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // For demo mode without auth, use a fixed demo user ID
    const userId = user?.id || "demo-user-id"

    // Check if user already has a tracking config
    const { data: existingConfig } = await supabase.from("tracking_configs").select("id").eq("user_id", userId).single()

    let configId: string

    if (existingConfig) {
      // Update existing config
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
      // Create new tracking config
      const { data, error } = await supabase
        .from("tracking_configs")
        .insert({
          user_id: userId,
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
        user_id: userId,
        score_drop_enabled: alerts.scoreDropEnabled,
        score_drop_threshold: Number.parseInt(alerts.scoreDropThreshold),
        competitor_enabled: alerts.competitorEnabled,
        competitor_threshold: Number.parseInt(alerts.competitorThreshold),
        weekly_digest_enabled: alerts.weeklyDigestEnabled,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      },
    )

    if (alertError) {
      console.error("Alert settings error:", alertError)
      // Don't fail the whole request if alert settings fail
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

    const userId = user?.id || "demo-user-id"

    // Get existing config
    const { data: config } = await supabase.from("tracking_configs").select("*").eq("user_id", userId).single()

    // Get alert settings
    const { data: alerts } = await supabase.from("alert_settings").select("*").eq("user_id", userId).single()

    return NextResponse.json({ config, alerts })
  } catch (error) {
    console.error("Get setup error:", error)
    return NextResponse.json({ config: null, alerts: null })
  }
}
