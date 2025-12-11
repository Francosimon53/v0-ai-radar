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

    const { data: configs } = await supabase.from("tracking_configs").select("id").eq("user_id", user.id)

    const configIds = (configs || []).map((c) => c.id)

    if (configIds.length === 0) {
      return NextResponse.json({ reports: [], brands: [] })
    }

    const { data: reports, error } = await supabase
      .from("reports")
      .select(`
        id,
        created_at,
        brand_score,
        share_of_voice,
        threats,
        recommendations,
        pdf_url,
        tracking_config_id,
        tracking_configs (
          brand,
          competitors
        )
      `)
      .in("tracking_config_id", configIds)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching reports:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const transformedReports = (reports || []).map((report: any, index: number, arr: any[]) => {
      const previousReport = arr[index + 1]
      const scoreChange = previousReport ? report.brand_score - previousReport.brand_score : 0
      const threats = report.threats || []
      const criticalThreats = threats.filter((t: any) => t.severity === "critical" || t.threat_level === "high").length

      return {
        id: report.id,
        date: report.created_at,
        title: "Brand Intelligence Report",
        brand: report.tracking_configs?.brand || "Unknown",
        score: report.brand_score || 0,
        scoreChange,
        shareOfVoice: report.share_of_voice || 0,
        criticalThreats,
        generatedAt: new Date(report.created_at).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        pdfUrl: report.pdf_url,
        recommendations: report.recommendations || [],
        threats: threats,
        status: "ready",
      }
    })

    const brands = [...new Set(transformedReports.map((r: any) => r.brand))]

    return NextResponse.json({ reports: transformedReports, brands })
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
      .select("tracking_config_id, tracking_configs!inner(user_id)")
      .eq("id", reportId)
      .single()

    if (!report || (report.tracking_configs as any)?.user_id !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const { error } = await supabase.from("reports").delete().eq("id", reportId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete report error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
