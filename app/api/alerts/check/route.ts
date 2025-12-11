import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import type { AnalysisResult } from "@/lib/analysis/types"

interface AlertCondition {
  type: "score_drop" | "competitor_rise" | "rank_change" | "milestone" | "system"
  title: string
  message: string
  severity: "high" | "medium" | "low"
  data: Record<string, unknown>
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { configId, currentResult, previousResult } = body as {
      configId: string
      currentResult: AnalysisResult
      previousResult?: Partial<AnalysisResult>
    }

    if (!configId || !currentResult) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Fetch user's alert settings
    const { data: settings } = await supabase.from("alert_settings").select("*").eq("user_id", user.id).single()

    const scoreDropThreshold = settings?.score_drop_threshold || 5
    const competitorRiseThreshold = settings?.competitor_rise_threshold || 5

    const alerts: AlertCondition[] = []

    // Check score drop
    if (previousResult?.dimensional?.brandStrengthIndex) {
      const scoreDrop = previousResult.dimensional.brandStrengthIndex - currentResult.dimensional.brandStrengthIndex
      if (scoreDrop > scoreDropThreshold) {
        alerts.push({
          type: "score_drop",
          title: "Brand Score Dropped",
          message: `Your brand strength index dropped from ${previousResult.dimensional.brandStrengthIndex.toFixed(0)} to ${currentResult.dimensional.brandStrengthIndex.toFixed(0)} (${scoreDrop.toFixed(1)} points)`,
          severity: scoreDrop > 10 ? "high" : "medium",
          data: {
            previousScore: previousResult.dimensional.brandStrengthIndex,
            currentScore: currentResult.dimensional.brandStrengthIndex,
            change: scoreDrop,
          },
        })
      }
    }

    // Check competitor rise
    if (previousResult?.shareOfVoice && currentResult.shareOfVoice) {
      const brand = currentResult.config.brand
      for (const competitor of currentResult.config.competitors) {
        const prevShare = previousResult.shareOfVoice[competitor]?.mentionRate || 0
        const currShare = currentResult.shareOfVoice[competitor]?.mentionRate || 0
        const rise = currShare - prevShare

        if (rise > competitorRiseThreshold) {
          alerts.push({
            type: "competitor_rise",
            title: `${competitor} Gaining Share`,
            message: `${competitor}'s share of voice increased from ${prevShare.toFixed(1)}% to ${currShare.toFixed(1)}%`,
            severity: rise > 10 ? "high" : "medium",
            data: {
              competitor,
              previousShare: prevShare,
              currentShare: currShare,
              change: rise,
            },
          })
        }
      }
    }

    // Check rank change
    if (previousResult?.shareOfVoice && currentResult.shareOfVoice) {
      const brand = currentResult.config.brand
      const prevRank = calculateRank(previousResult.shareOfVoice, brand)
      const currRank = calculateRank(currentResult.shareOfVoice, brand)

      if (prevRank !== currRank) {
        const improved = currRank < prevRank
        alerts.push({
          type: "rank_change",
          title: improved ? "Rank Improved!" : "Rank Dropped",
          message: `Your brand moved from #${prevRank} to #${currRank} in share of voice`,
          severity: improved ? "low" : "medium",
          data: {
            previousRank: prevRank,
            currentRank: currRank,
            improved,
          },
        })
      }
    }

    // Check milestones
    const bsi = currentResult.dimensional.brandStrengthIndex
    const milestones = [
      { threshold: 90, title: "Elite Status!", message: "Your brand strength reached 90+!" },
      { threshold: 80, title: "Strong Position", message: "Your brand strength reached 80+!" },
      { threshold: 50, title: "First Milestone", message: "Your brand strength reached 50!" },
    ]

    for (const milestone of milestones) {
      if (
        bsi >= milestone.threshold &&
        (!previousResult?.dimensional?.brandStrengthIndex ||
          previousResult.dimensional.brandStrengthIndex < milestone.threshold)
      ) {
        alerts.push({
          type: "milestone",
          title: milestone.title,
          message: milestone.message,
          severity: "low",
          data: { score: bsi, milestone: milestone.threshold },
        })
        break // Only one milestone at a time
      }
    }

    // Check for #1 position
    const currentRank = calculateRank(currentResult.shareOfVoice, currentResult.config.brand)
    if (currentRank === 1 && previousResult?.shareOfVoice) {
      const prevRank = calculateRank(previousResult.shareOfVoice, currentResult.config.brand)
      if (prevRank !== 1) {
        alerts.push({
          type: "milestone",
          title: "You're #1!",
          message: "Your brand is now the top recommended in AI responses!",
          severity: "low",
          data: { rank: 1 },
        })
      }
    }

    // Save alerts to database
    if (alerts.length > 0) {
      const alertRecords = alerts.map((alert) => ({
        user_id: user.id,
        config_id: configId,
        type: alert.type,
        title: alert.title,
        message: alert.message,
        severity: alert.severity,
        data: alert.data,
        is_read: false,
      }))

      const { error: insertError } = await supabase.from("alerts").insert(alertRecords)
      if (insertError) {
        console.error("[Alerts] Error inserting alerts:", insertError)
      }
    }

    return NextResponse.json({
      alertsCreated: alerts,
      count: alerts.length,
    })
  } catch (error) {
    console.error("[Alerts] Error:", error)
    return NextResponse.json(
      { error: "Failed to check alerts", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

function calculateRank(shareOfVoice: Record<string, { mentionRate: number }>, brand: string): number {
  const sorted = Object.entries(shareOfVoice)
    .sort(([, a], [, b]) => b.mentionRate - a.mentionRate)
    .map(([name]) => name)

  return sorted.indexOf(brand) + 1 || sorted.length + 1
}
