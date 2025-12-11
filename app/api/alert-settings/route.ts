import { createUserClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createUserClient()

    const { data: config } = await supabase.from("tracking_configs").select("id").limit(1).single()

    if (!config) {
      return NextResponse.json({ settings: null })
    }

    const { data: settings } = await supabase.from("alert_settings").select("*").eq("config_id", config.id).single()

    if (!settings) {
      return NextResponse.json({
        settings: {
          emailEnabled: true,
          scoreDropThreshold: 5,
          competitorAlerts: true,
          weeklyDigest: true,
          quietHoursEnabled: false,
          quietHoursStart: "22:00",
          quietHoursEnd: "08:00",
        },
      })
    }

    return NextResponse.json({
      settings: {
        emailEnabled: settings.email_enabled ?? true,
        scoreDropThreshold: settings.score_drop_threshold ?? 5,
        competitorAlerts: settings.competitor_alerts ?? true,
        weeklyDigest: settings.weekly_digest ?? true,
        quietHoursEnabled: settings.quiet_hours_enabled ?? false,
        quietHoursStart: settings.quiet_hours_start ?? "22:00",
        quietHoursEnd: settings.quiet_hours_end ?? "08:00",
      },
    })
  } catch (error) {
    console.error("Error fetching alert settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createUserClient()
    const settings = await request.json()

    const { data: config } = await supabase.from("tracking_configs").select("id").limit(1).single()

    if (!config) {
      return NextResponse.json({ error: "No tracking config found" }, { status: 400 })
    }

    const { error } = await supabase.from("alert_settings").upsert(
      {
        config_id: config.id,
        email_enabled: settings.emailEnabled,
        score_drop_threshold: settings.scoreDropThreshold,
        competitor_alerts: settings.competitorAlerts,
        weekly_digest: settings.weeklyDigest,
        quiet_hours_enabled: settings.quietHoursEnabled,
        quiet_hours_start: settings.quietHoursStart,
        quiet_hours_end: settings.quietHoursEnd,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "config_id",
      },
    )

    if (error) {
      console.error("Error saving alert settings:", error)
      return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in alert settings API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
