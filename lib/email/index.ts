import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
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

export { resend }
