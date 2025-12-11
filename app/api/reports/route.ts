import { createUserClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createUserClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: configs } = await supabase
      .from("tracking_configs")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    const configIds = (configs || []).map((c) => c.id)
    const primaryConfigId = configIds[0] || null

    if (configIds.length === 0) {
      return NextResponse.json({ reports: [], brands: [], configId: null })
    }

    const { data: reports, error } = await supabase
      .from("reports")
      .select(`
        id,
        created_at,
        brand,
        score,
        previous_score,
        share_of_voice,
        threats,
        recommendations,
        executive_summary,
        pdf_url,
        config_id
      `)
      .in("config_id", configIds)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching reports:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const transformedReports = (reports || []).map((report: any) => {
      const scoreChange = report.previous_score ? report.score - report.previous_score : 0
      const threats = report.threats || []
      const criticalThreats = Array.isArray(threats)
        ? threats.filter((t: any) => t.severity === "critical" || t.threat_level === "high").length
        : 0

      return {
        id: report.id,
        date: report.created_at,
        created_at: report.created_at,
        title: "Brand Intelligence Report",
        brand: report.brand || "Unknown",
        score: report.score || 0,
        previous_score: report.previous_score,
        scoreChange,
        share_of_voice: report.share_of_voice || 0,
        criticalThreats,
        executive_summary: report.executive_summary || "",
        generatedAt: new Date(report.created_at).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        pdf_url: report.pdf_url,
        recommendations: report.recommendations || [],
        threats: threats,
        status: "ready",
      }
    })

    const brands = [...new Set(transformedReports.map((r: any) => r.brand))]

    return NextResponse.json({
      reports: transformedReports,
      brands,
      configId: primaryConfigId,
    })
  } catch (error) {
    console.error("Reports API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get("id")

    if (!reportId) {
      return NextResponse.json({ error: "Report ID required" }, { status: 400 })
    }

    const supabase = await createUserClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: report } = await supabase
      .from("reports")
      .select("config_id")
      .eq("id", reportId)
      .eq("user_id", user.id)
      .single()

    if (!report) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const { error: deleteError } = await supabase.from("reports").delete().eq("id", reportId)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete report error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
