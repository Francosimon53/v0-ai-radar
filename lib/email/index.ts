import { Resend } from "resend"

let resendClient: Resend | null = null

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable is not set")
    }
    resendClient = new Resend(apiKey)
  }
  return resendClient
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const resend = getResendClient()
    const { error } = await resend.emails.send({
      from: "AI Vibes Radar <notifications@aivibesradar.com>",
      to,
      subject,
      html,
    })

    if (error) {
      console.error("[Email] Failed to send:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("[Email] Error sending email:", error)
    return false
  }
}

export { getResendClient as resend }
