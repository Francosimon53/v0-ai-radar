import { type NextRequest, NextResponse } from "next/server"
import { createUserClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createUserClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: config } = await supabase
      .from("tracking_configs")
      .select("*")
      .eq("user_id", user.id)
      .limit(1)
      .single()

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    const { data: alertSettings } = await supabase.from("alert_settings").select("*").eq("user_id", user.id).single()

    const { count: reportsCount } = await supabase
      .from("reports")
      .select("*", { count: "exact", head: true })
      .eq("config_id", config?.id)

    return NextResponse.json({
      profile: profile || { email: user.email },
      config: config
        ? {
            ...config,
            brand: config.primary_brand,
          }
        : null,
      alertSettings: alertSettings || null,
      usage: {
        analyses: 0,
        reports: reportsCount || 0,
      },
    })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createUserClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type, data } = body

    if (type === "profile") {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: data.name,
        company_name: data.company,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error
    }

    if (type === "tracking") {
      const { data: existing } = await supabase
        .from("tracking_configs")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .single()

      if (existing) {
        const { error } = await supabase
          .from("tracking_configs")
          .update({
            primary_brand: data.brand,
            competitors: data.competitors,
            industry: data.industry,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)

        if (error) throw error
      }
    }

    if (type === "notifications") {
      const { error } = await supabase.from("alert_settings").upsert(
        {
          user_id: user.id,
          email_enabled: data.emailEnabled,
          score_drop_enabled: data.scoreDropEnabled,
          score_drop_threshold: Number.parseInt(data.scoreDropThreshold),
          competitor_alert_enabled: data.competitorEnabled,
          competitor_threshold: Number.parseInt(data.competitorThreshold),
          weekly_digest: data.weeklyDigest,
          digest_day: data.digestDay,
          quiet_hours_enabled: data.quietHoursEnabled,
          quiet_start: data.quietStart,
          quiet_end: data.quietEnd,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )

      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
