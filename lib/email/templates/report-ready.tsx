import { Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from "@react-email/components"

interface ReportReadyProps {
  userName: string
  brandName: string
  reportDate: string
  score: number
  scoreChange?: number
  highlights: string[]
  reportUrl: string
  dashboardUrl?: string
  unsubscribeUrl?: string
}

export function ReportReadyEmail({
  userName = "there",
  brandName = "Your Brand",
  reportDate = "December 10, 2024",
  score = 75,
  scoreChange = 0,
  highlights = [
    "Your brand was mentioned in 65% of AI recommendations",
    "Quality perception improved across all models",
    "One competitor gained significant ground in pricing discussions",
  ],
  reportUrl = "#",
  dashboardUrl = "#",
  unsubscribeUrl = "#",
}: ReportReadyProps) {
  const isPositiveChange = scoreChange >= 0

  return (
    <Html>
      <Head />
      <Preview>
        Your AI brand report for {brandName} is ready - Score: {score}/100
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>AI Vibes Radar</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Section style={reportBadge}>
              <Text style={reportBadgeText}>📊 New Report Ready</Text>
            </Section>

            <Heading style={title}>Your Report is Ready</Heading>
            <Text style={subtitle}>
              Hi {userName}, your latest AI perception analysis for <strong>{brandName}</strong> has been completed.
            </Text>
            <Text style={dateText}>Report Date: {reportDate}</Text>

            {/* Score Card */}
            <Section style={scoreCard}>
              <Text style={scoreLabel}>Brand Health Score</Text>
              <Text style={scoreValue}>{score}</Text>
              {scoreChange !== 0 && (
                <Text
                  style={{
                    ...scoreChangeStyle,
                    color: isPositiveChange ? "#22c55e" : "#ef4444",
                  }}
                >
                  {isPositiveChange ? "↑" : "↓"} {Math.abs(scoreChange)} from previous
                </Text>
              )}
            </Section>

            {/* Highlights */}
            <Section style={highlightsSection}>
              <Heading style={highlightsTitle}>Key Highlights</Heading>
              {highlights.map((highlight, index) => (
                <Text key={index} style={highlightItem}>
                  • {highlight}
                </Text>
              ))}
            </Section>

            {/* CTA Buttons */}
            <Section style={ctaSection}>
              <Button style={primaryButton} href={reportUrl}>
                Download PDF Report
              </Button>
              <Button style={secondaryButton} href={dashboardUrl}>
                View Dashboard
              </Button>
            </Section>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>Reports are generated based on your tracking configuration.</Text>
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

const content = {
  padding: "32px",
  textAlign: "center" as const,
}

const reportBadge = {
  backgroundColor: "#dbeafe",
  borderRadius: "20px",
  padding: "8px 16px",
  display: "inline-block",
  margin: "0 0 20px 0",
}

const reportBadgeText = {
  color: "#1d4ed8",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0",
}

const title = {
  fontSize: "26px",
  fontWeight: "bold",
  color: "#1e293b",
  margin: "0 0 12px 0",
}

const subtitle = {
  fontSize: "15px",
  color: "#64748b",
  margin: "0 0 8px 0",
  lineHeight: "1.6",
}

const dateText = {
  fontSize: "13px",
  color: "#94a3b8",
  margin: "0 0 24px 0",
}

const scoreCard = {
  background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
  borderRadius: "12px",
  padding: "28px",
  margin: "0 auto 28px auto",
  maxWidth: "260px",
}

const scoreLabel = {
  color: "rgba(255, 255, 255, 0.8)",
  fontSize: "13px",
  margin: "0 0 8px 0",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
}

const scoreValue = {
  color: "#ffffff",
  fontSize: "56px",
  fontWeight: "bold",
  margin: "0",
  lineHeight: "1",
}

const scoreChangeStyle = {
  fontSize: "14px",
  margin: "10px 0 0 0",
  fontWeight: "500",
}

const highlightsSection = {
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  padding: "20px",
  margin: "0 0 28px 0",
  textAlign: "left" as const,
}

const highlightsTitle = {
  fontSize: "15px",
  fontWeight: "600",
  color: "#1e293b",
  margin: "0 0 12px 0",
}

const highlightItem = {
  fontSize: "14px",
  color: "#475569",
  margin: "0 0 8px 0",
  lineHeight: "1.5",
}

const ctaSection = {
  textAlign: "center" as const,
}

const primaryButton = {
  backgroundColor: "#3b82f6",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "600",
  textDecoration: "none",
  padding: "12px 24px",
  display: "inline-block",
  marginRight: "12px",
  marginBottom: "12px",
}

const secondaryButton = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  color: "#1e293b",
  fontSize: "15px",
  fontWeight: "600",
  textDecoration: "none",
  padding: "12px 24px",
  display: "inline-block",
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
  fontSize: "12px",
  color: "#94a3b8",
  margin: "0 0 8px 0",
}

const unsubscribeLink = {
  fontSize: "12px",
  color: "#64748b",
}

export default ReportReadyEmail
