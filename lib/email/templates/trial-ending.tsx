import { Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from "@react-email/components"

interface TrialEndingProps {
  userName: string
  daysRemaining: number
  upgradeUrl: string
  features?: string[]
}

export function TrialEndingEmail({
  userName = "there",
  daysRemaining = 3,
  upgradeUrl = "#",
  features = [
    "Unlimited AI model queries",
    "Weekly automated reports",
    "Real-time alerts",
    "Competitive analysis",
    "PDF report exports",
  ],
}: TrialEndingProps) {
  const urgencyColor = daysRemaining <= 1 ? "#ef4444" : "#f59e0b"

  return (
    <Html>
      <Head />
      <Preview>
        Your trial ends in {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} - Upgrade now to keep your data
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>AI Vibes Radar</Text>
          </Section>

          {/* Urgency Banner */}
          <Section
            style={{
              ...urgencyBanner,
              backgroundColor: urgencyColor,
            }}
          >
            <Text style={urgencyText}>
              ⏰ Your trial ends in {daysRemaining} day
              {daysRemaining !== 1 ? "s" : ""}
            </Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={title}>Don&apos;t lose your progress, {userName}</Heading>
            <Text style={subtitle}>
              Your free trial is ending soon. Upgrade now to continue monitoring how AI perceives your brand.
            </Text>

            {/* What You'll Lose */}
            <Section style={loseSection}>
              <Heading style={loseSectionTitle}>What you&apos;ll lose if you don&apos;t upgrade:</Heading>
              <Text style={loseItem}>✗ Access to your dashboard and reports</Text>
              <Text style={loseItem}>✗ Historical brand perception data</Text>
              <Text style={loseItem}>✗ Competitor tracking insights</Text>
              <Text style={loseItem}>✗ Real-time AI monitoring</Text>
            </Section>

            {/* What You'll Keep */}
            <Section style={keepSection}>
              <Heading style={keepSectionTitle}>Upgrade to keep these features:</Heading>
              {features.map((feature, index) => (
                <Text key={index} style={keepItem}>
                  ✓ {feature}
                </Text>
              ))}
            </Section>

            {/* CTA Buttons */}
            <Section style={ctaSection}>
              <Button style={ctaButton} href={upgradeUrl}>
                Upgrade Now
              </Button>
              <Text style={priceNote}>Starting at $29/month • Cancel anytime</Text>
            </Section>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Questions about pricing?{" "}
              <Link href="mailto:support@aivibesradar.com" style={footerLink}>
                Contact us
              </Link>
            </Text>
            <Link href="#" style={unsubscribeLink}>
              Unsubscribe from trial reminders
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  maxWidth: "600px",
  borderRadius: "8px",
  overflow: "hidden" as const,
}

const header = {
  backgroundColor: "#0f172a",
  padding: "24px",
  textAlign: "center" as const,
}

const logo = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0",
}

const urgencyBanner = {
  padding: "16px",
  textAlign: "center" as const,
}

const urgencyText = {
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0",
}

const content = {
  padding: "32px",
}

const title = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#1e293b",
  margin: "0 0 12px 0",
  textAlign: "center" as const,
}

const subtitle = {
  fontSize: "15px",
  color: "#64748b",
  margin: "0 0 28px 0",
  textAlign: "center" as const,
  lineHeight: "1.6",
}

const loseSection = {
  backgroundColor: "#fef2f2",
  borderRadius: "8px",
  padding: "20px",
  margin: "0 0 20px 0",
}

const loseSectionTitle = {
  fontSize: "15px",
  fontWeight: "600",
  color: "#991b1b",
  margin: "0 0 12px 0",
}

const loseItem = {
  fontSize: "14px",
  color: "#dc2626",
  margin: "0 0 8px 0",
}

const keepSection = {
  backgroundColor: "#f0fdf4",
  borderRadius: "8px",
  padding: "20px",
  margin: "0 0 28px 0",
}

const keepSectionTitle = {
  fontSize: "15px",
  fontWeight: "600",
  color: "#166534",
  margin: "0 0 12px 0",
}

const keepItem = {
  fontSize: "14px",
  color: "#15803d",
  margin: "0 0 8px 0",
}

const ctaSection = {
  textAlign: "center" as const,
}

const ctaButton = {
  backgroundColor: "#3b82f6",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "bold",
  textDecoration: "none",
  padding: "16px 48px",
  display: "inline-block",
}

const priceNote = {
  fontSize: "13px",
  color: "#64748b",
  margin: "16px 0 0 0",
}

const hr = {
  borderColor: "#e2e8f0",
  margin: "0",
}

const footer = {
  padding: "24px",
  textAlign: "center" as const,
}

const footerText = {
  fontSize: "13px",
  color: "#64748b",
  margin: "0 0 12px 0",
}

const footerLink = {
  color: "#3b82f6",
  textDecoration: "underline",
}

const unsubscribeLink = {
  fontSize: "12px",
  color: "#94a3b8",
}

export default TrialEndingEmail
