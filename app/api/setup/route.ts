import { createUserClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    console.log("[v0] Setup API called")

    const body = await request.json()
    console.log("[v0] Request body:", JSON.stringify(body, null, 2))

    const { brand, competitors, industry, alerts } = body

    if (!brand || !competitors || !industry) {
      console.log("[v0] Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createUserClient()
    console.log("[v0] Supabase client created")

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error("[v0] Auth error:", userError)
      return NextResponse.json({ error: "Authentication error: " + userError.message }, { status: 401 })
    }

    if (!user) {
      console.log("[v0] No user found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] User authenticated:", user.id)

    // Check if user already has a tracking config
    const { data: existingConfig, error: checkError } = await supabase
      .from("tracking_configs")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("[v0] Error checking existing config:", checkError)
    }

    console.log("[v0] Existing config:", existingConfig)

    let configId: string

    if (existingConfig) {
      console.log("[v0] Updating existing config:", existingConfig.id)
      const { data, error } = await supabase
        .from("tracking_configs")
        .update({
          name: brand,
          primary_brand: brand,
          competitors,
          industry,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingConfig.id)
        .select("id")
        .single()

      if (error) {
        console.error("[v0] Update error:", error)
        return NextResponse.json({ error: "Failed to update config: " + error.message }, { status: 500 })
      }
      configId = data.id
    } else {
      console.log("[v0] Creating new config for user:", user.id)
      const { data, error } = await supabase
        .from("tracking_configs")
        .insert({
          user_id: user.id,
          name: brand,
          primary_brand: brand,
          competitors,
          industry,
          frequency: "weekly",
          is_active: true,
        })
        .select("id")
        .single()

      if (error) {
        console.error("[v0] Insert error:", error)
        return NextResponse.json({ error: "Failed to create config: " + error.message }, { status: 500 })
      }
      configId = data.id
    }

    console.log("[v0] Config saved with ID:", configId)

    // Upsert alert settings
    if (alerts) {
      console.log("[v0] Saving alert settings")
      const { error: alertError } = await supabase.from("alert_settings").upsert(
        {
          user_id: user.id,
          score_drop_enabled: alerts.scoreDropEnabled ?? true,
          score_drop_threshold: Number.parseInt(alerts.scoreDropThreshold) || 5,
          competitor_enabled: alerts.competitorEnabled ?? true,
          competitor_threshold: Number.parseInt(alerts.competitorThreshold) || 3,
          weekly_digest_enabled: alerts.weeklyDigestEnabled ?? true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )

      if (alertError) {
        console.error("[v0] Alert settings error:", alertError)
        // Don't fail the whole setup for alert settings
      }
    }

    console.log("[v0] Setup completed successfully")

    return NextResponse.json({
      success: true,
      configId,
      message: "Setup completed successfully",
    })
  } catch (error) {
    console.error("[v0] Setup error:", error)
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: "Failed to save configuration: " + message }, { status: 500 })
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
