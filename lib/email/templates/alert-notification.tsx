import { Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from "@react-email/components"

interface AlertNotificationProps {
  userName: string
  alertType: "warning" | "success" | "info" | "danger"
  alertTitle: string
  alertMessage: string
  beforeValue?: string | number
  afterValue?: string | number
  recommendedAction?: string
  actionUrl: string
  unsubscribeUrl?: string
}

export function AlertNotificationEmail({
  userName = "User",
  alertType = "warning",
  alertTitle = "Alert",
  alertMessage = "Something changed.",
  beforeValue,
  afterValue,
  recommendedAction,
  actionUrl = "#",
  unsubscribeUrl = "#",
}: AlertNotificationProps) {
  const iconColors = {
    warning: "#f59e0b",
    success: "#22c55e",
    info: "#3b82f6",
    danger: "#ef4444",
  }

  const iconSymbols = {
    warning: "⚠️",
    success: "✓",
    info: "ℹ",
    danger: "!",
  }

  return (
    <Html>
      <Head />
      <Preview>{alertTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>AI Vibes Radar</Text>
          </Section>

          {/* Alert Content */}
          <Section style={content}>
            <Section
              style={{
                ...alertIcon,
                backgroundColor: `${iconColors[alertType]}15`,
                borderColor: iconColors[alertType],
              }}
            >
              <Text
                style={{
                  ...alertIconText,
                  color: iconColors[alertType],
                }}
              >
                {iconSymbols[alertType]}
              </Text>
            </Section>

            <Heading style={title}>{alertTitle}</Heading>
            <Text style={greeting}>Hi {userName},</Text>
            <Text style={message}>{alertMessage}</Text>

            {/* Before/After Comparison */}
            {beforeValue !== undefined && afterValue !== undefined && (
              <Section style={comparisonSection}>
                <table style={comparisonTable}>
                  <tbody>
                    <tr>
                      <td style={comparisonCell}>
                        <Text style={comparisonLabel}>Before</Text>
                        <Text style={comparisonValue}>{beforeValue}</Text>
                      </td>
                      <td style={comparisonArrow}>→</td>
                      <td style={comparisonCell}>
                        <Text style={comparisonLabel}>After</Text>
                        <Text style={comparisonValue}>{afterValue}</Text>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Section>
            )}

            {/* Recommended Action */}
            {recommendedAction && (
              <Section style={actionSection}>
                <Text style={actionLabel}>Recommended Action</Text>
                <Text style={actionText}>{recommendedAction}</Text>
              </Section>
            )}

            {/* CTA Button */}
            <Section style={ctaSection}>
              <Button style={ctaButton} href={actionUrl}>
                View Details
              </Button>
            </Section>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>You received this alert based on your notification settings.</Text>
            <Link href={unsubscribeUrl} style={unsubscribeLink}>
              Manage notification preferences
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
  maxWidth: "500px",
  borderRadius: "8px",
  overflow: "hidden" as const,
}

const header = {
  backgroundColor: "#0f172a",
  padding: "20px",
  textAlign: "center" as const,
}

const logo = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "0",
}

const content = {
  padding: "32px 24px",
  textAlign: "center" as const,
}

const alertIcon = {
  width: "64px",
  height: "64px",
  borderRadius: "50%",
  border: "2px solid",
  margin: "0 auto 20px auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}

const alertIconText = {
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0",
  lineHeight: "64px",
}

const title = {
  fontSize: "22px",
  fontWeight: "600",
  color: "#1e293b",
  margin: "0 0 16px 0",
}

const greeting = {
  fontSize: "14px",
  color: "#64748b",
  margin: "0 0 8px 0",
}

const message = {
  fontSize: "15px",
  color: "#475569",
  margin: "0 0 24px 0",
  lineHeight: "1.6",
}

const comparisonSection = {
  margin: "0 0 24px 0",
}

const comparisonTable = {
  width: "100%",
  maxWidth: "300px",
  margin: "0 auto",
}

const comparisonCell = {
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  padding: "16px",
  textAlign: "center" as const,
  width: "40%",
}

const comparisonArrow = {
  fontSize: "24px",
  color: "#94a3b8",
  textAlign: "center" as const,
  width: "20%",
}

const comparisonLabel = {
  fontSize: "12px",
  color: "#64748b",
  margin: "0 0 4px 0",
  textTransform: "uppercase" as const,
}

const comparisonValue = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#1e293b",
  margin: "0",
}

const actionSection = {
  backgroundColor: "#f0f9ff",
  borderRadius: "8px",
  padding: "16px",
  margin: "0 0 24px 0",
  textAlign: "left" as const,
}

const actionLabel = {
  fontSize: "12px",
  color: "#0369a1",
  margin: "0 0 4px 0",
  textTransform: "uppercase" as const,
  fontWeight: "600",
}

const actionText = {
  fontSize: "14px",
  color: "#0c4a6e",
  margin: "0",
  lineHeight: "1.5",
}

const ctaSection = {
  textAlign: "center" as const,
}

const ctaButton = {
  backgroundColor: "#3b82f6",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "600",
  textDecoration: "none",
  padding: "12px 28px",
  display: "inline-block",
}

const hr = {
  borderColor: "#e2e8f0",
  margin: "0",
}

const footer = {
  padding: "20px",
  textAlign: "center" as const,
}

const footerText = {
  fontSize: "12px",
  color: "#94a3b8",
  margin: "0 0 8px 0",
}

const unsubscribeLink = {
  fontSize: "12px",
  color: "#64748b",
}

export default AlertNotificationEmail
