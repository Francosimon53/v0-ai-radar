import { NextResponse } from "next/server"
import { createUserClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/email"
import { render } from "@react-email/components"
import { WelcomeEmail } from "@/lib/email/templates/welcome"

export async function POST() {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Test endpoint disabled in production" }, { status: 403 })
  }

  try {
    const supabase = await createUserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Send test welcome email
    const html = await render(
      WelcomeEmail({
        userName: user.user_metadata?.name || "there",
        setupWizardUrl: "https://aivibesradar.com/dashboard/setup",
      }),
    )

    const success = await sendEmail(user.email, "[TEST] Welcome to AI Vibes Radar", html)

    if (success) {
      return NextResponse.json({ message: "Test email sent successfully" })
    } else {
      return NextResponse.json({ error: "Failed to send test email" }, { status: 500 })
    }
  } catch (error) {
    console.error("[Email Test] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
