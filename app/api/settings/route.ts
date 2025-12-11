import { type NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServiceRoleClient()

    // For now, get the first user's config (will use auth later)
    const { data: config, error: configError } = await supabase.from("tracking_configs").select("*").limit(1).single()

    if (configError && configError.code !== "PGRST116") {
      throw configError
    }

    // Get profile data
    const { data: profile, error: profileError } = await supabase.from("profiles").select("*").limit(1).single()

    // Get alert settings
    const { data: alertSettings, error: alertError } = await supabase
      .from("alert_settings")
      .select("*")
      .limit(1)
      .single()

    // Get API usage for current month
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
    const { data: usage, error: usageError } = await supabase
      .from("api_usage")
      .select("*")
      .eq("month", currentMonth)
      .limit(1)
      .single()

    // Get reports count
    const { count: reportsCount } = await supabase.from("reports").select("*", { count: "exact", head: true })

    return NextResponse.json({
      profile: profile || null,
      config: config || null,
      alertSettings: alertSettings || null,
      usage: {
        analyses: usage?.analyses_count || 0,
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
    const supabase = await createServiceRoleClient()
    const body = await request.json()
    const { type, data } = body

    if (type === "profile") {
      const { data: existing } = await supabase.from("profiles").select("id").limit(1).single()

      if (existing) {
        const { error } = await supabase
          .from("profiles")
          .update({
            full_name: data.name,
            company: data.company,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)

        if (error) throw error
      }
    }

    if (type === "tracking") {
      const { data: existing } = await supabase.from("tracking_configs").select("id").limit(1).single()

      if (existing) {
        const { error } = await supabase
          .from("tracking_configs")
          .update({
            brand: data.brand,
            competitors: data.competitors,
            industry: data.industry,
            frequency: data.frequency,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)

        if (error) throw error
      }
    }

    if (type === "notifications") {
      const { data: existing } = await supabase.from("alert_settings").select("id").limit(1).single()

      if (existing) {
        const { error } = await supabase
          .from("alert_settings")
          .update({
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
          })
          .eq("id", existing.id)

        if (error) throw error
      } else {
        // Create new alert settings
        const { error } = await supabase.from("alert_settings").insert({
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
        })

        if (error) throw error
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
