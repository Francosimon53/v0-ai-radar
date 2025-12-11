import { render } from "@react-email/components"
import { sendEmail } from "./index"
import { WeeklyDigestEmail } from "./templates/weekly-digest"
import { AlertNotificationEmail } from "./templates/alert-notification"
import { WelcomeEmail } from "./templates/welcome"
import { TrialEndingEmail } from "./templates/trial-ending"
import { ReportReadyEmail } from "./templates/report-ready"
import { createServiceRoleClient } from "@/lib/supabase/server"
import type { AnalysisResult } from "@/lib/analysis/types"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://ai-viber-radar.app"

interface UserData {
  id: string
  email: string
  name: string
  brand_name?: string
}

async function getUserData(userId: string): Promise<UserData | null> {
  const supabase = createServiceRoleClient()

  const { data: user, error } = await supabase.from("profiles").select("id, email, full_name").eq("id", userId).single()

  if (error || !user) {
    console.error("[Email] Failed to fetch user:", error)
    return null
  }

  // Get user's primary brand
  const { data: config } = await supabase
    .from("tracking_configs")
    .select("brand")
    .eq("user_id", userId)
    .limit(1)
    .single()

  return {
    id: user.id,
    email: user.email,
    name: user.full_name || "",
    brand_name: config?.brand,
  }
}

export async function sendWeeklyDigest(userId: string, analysisResult: AnalysisResult): Promise<boolean> {
  const user = await getUserData(userId)
  if (!user) return false

  const html = await render(
    WeeklyDigestEmail({
      userName: user.name || "there",
      brandName: user.brand_name || "Your Brand",
      score: analysisResult.synthesis.overall_score,
      scoreChange: 0, // Would need historical data to calculate
      alerts: [],
      competitors: analysisResult.share_of_voice.competitors.slice(0, 5).map((c) => ({
        name: c.brand,
        score: Math.round(c.mention_rate * 100),
        change: 0,
      })),
      insights: analysisResult.synthesis.recommendations.slice(0, 3).map((r) => r.action),
      reportUrl: `${APP_URL}/dashboard`,
      unsubscribeUrl: `${APP_URL}/dashboard/settings`,
    }),
  )

  return sendEmail(user.email, `Weekly AI Brand Report: ${user.brand_name || "Your Brand"}`, html)
}

export async function sendAlertNotification(
  userId: string,
  alert: {
    type: "warning" | "success" | "info" | "danger"
    title: string
    message: string
    beforeValue?: string | number
    afterValue?: string | number
    recommendedAction?: string
  },
): Promise<boolean> {
  const user = await getUserData(userId)
  if (!user) return false

  const html = await render(
    AlertNotificationEmail({
      userName: user.name || "there",
      alertType: alert.type,
      alertTitle: alert.title,
      alertMessage: alert.message,
      beforeValue: alert.beforeValue,
      afterValue: alert.afterValue,
      recommendedAction: alert.recommendedAction,
      actionUrl: `${APP_URL}/dashboard/alerts`,
      unsubscribeUrl: `${APP_URL}/dashboard/settings`,
    }),
  )

  return sendEmail(user.email, alert.title, html)
}

export async function sendWelcomeEmail(userId: string): Promise<boolean> {
  const user = await getUserData(userId)
  if (!user) return false

  const html = await render(
    WelcomeEmail({
      userName: user.name || "there",
      setupWizardUrl: `${APP_URL}/dashboard/setup`,
    }),
  )

  return sendEmail(user.email, "Welcome to AI Vibes Radar - Let's get you started!", html)
}

export async function sendTrialEndingEmail(userId: string, daysRemaining: number): Promise<boolean> {
  const user = await getUserData(userId)
  if (!user) return false

  const html = await render(
    TrialEndingEmail({
      userName: user.name || "there",
      daysRemaining,
      upgradeUrl: `${APP_URL}/dashboard/settings?tab=billing`,
    }),
  )

  const urgency = daysRemaining <= 1 ? "URGENT: " : ""
  return sendEmail(
    user.email,
    `${urgency}Your trial ends in ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""}`,
    html,
  )
}

export async function sendReportReadyEmail(
  userId: string,
  reportUrl: string,
  analysisResult: AnalysisResult,
): Promise<boolean> {
  const user = await getUserData(userId)
  if (!user) return false

  const highlights = [
    `Your brand was mentioned in ${Math.round(analysisResult.share_of_voice.primary_brand.mention_rate * 100)}% of AI recommendations`,
    ...analysisResult.synthesis.recommendations.slice(0, 2).map((r) => r.action),
  ]

  const html = await render(
    ReportReadyEmail({
      userName: user.name || "there",
      brandName: user.brand_name || "Your Brand",
      reportDate: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      score: analysisResult.synthesis.overall_score,
      highlights,
      reportUrl,
      dashboardUrl: `${APP_URL}/dashboard`,
      unsubscribeUrl: `${APP_URL}/dashboard/settings`,
    }),
  )

  return sendEmail(
    user.email,
    `Your AI Brand Report is Ready - Score: ${analysisResult.synthesis.overall_score}/100`,
    html,
  )
}
