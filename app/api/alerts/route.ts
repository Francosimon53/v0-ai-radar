import { createUserClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createUserClient()
    const { searchParams } = new URL(request.url)

    const type = searchParams.get("type")
    const read = searchParams.get("read")

    // Get user's tracking config first
    const { data: config } = await supabase.from("tracking_configs").select("id").limit(1).single()

    if (!config) {
      return NextResponse.json({ alerts: [], unreadCount: 0 })
    }

    // Build query
    let query = supabase.from("alerts").select("*").eq("config_id", config.id).order("created_at", { ascending: false })

    if (type && type !== "all") {
      query = query.eq("type", type)
    }

    if (read === "unread") {
      query = query.eq("read", false)
    } else if (read === "read") {
      query = query.eq("read", true)
    }

    const { data: alerts, error } = await query.limit(50)

    if (error) {
      console.error("Error fetching alerts:", error)
      return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 })
    }

    // Get unread count
    const { count: unreadCount } = await supabase
      .from("alerts")
      .select("*", { count: "exact", head: true })
      .eq("config_id", config.id)
      .eq("read", false)

    return NextResponse.json({
      alerts: alerts || [],
      unreadCount: unreadCount || 0,
    })
  } catch (error) {
    console.error("Error in alerts API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createUserClient()
    const { alertId, read } = await request.json()

    if (alertId === "all") {
      // Mark all as read
      const { data: config } = await supabase.from("tracking_configs").select("id").limit(1).single()

      if (config) {
        await supabase.from("alerts").update({ read: true }).eq("config_id", config.id)
      }
    } else {
      // Mark single alert
      await supabase.from("alerts").update({ read }).eq("id", alertId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating alert:", error)
    return NextResponse.json({ error: "Failed to update alert" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createUserClient()
    const { searchParams } = new URL(request.url)
    const alertId = searchParams.get("id")

    if (!alertId) {
      return NextResponse.json({ error: "Alert ID required" }, { status: 400 })
    }

    const { error } = await supabase.from("alerts").delete().eq("id", alertId)

    if (error) {
      return NextResponse.json({ error: "Failed to delete alert" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting alert:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
