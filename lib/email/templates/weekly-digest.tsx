import { Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from "@react-email/components"

interface Alert {
  type: string
  title: string
  message: string
}

interface Competitor {
  name: string
  score: number
  change: number
}

interface WeeklyDigestProps {
  userName: string
  brandName: string
  score: number
  scoreChange: number
  alerts: Alert[]
  competitors?: Competitor[]
  insights?: string[]
  reportUrl: string
  unsubscribeUrl?: string
}

export function WeeklyDigestEmail({
  userName = "User",
  brandName = "Your Brand",
  score = 75,
  scoreChange = 3,
  alerts = [],
  competitors = [],
  insights = [],
  reportUrl = "#",
  unsubscribeUrl = "#",
}: WeeklyDigestProps) {
  const isPositiveChange = scoreChange >= 0

  return (
    <Html>
      <Head />
      <Preview>Your weekly AI brand intelligence report for {brandName}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>AI Vibes Radar</Text>
          </Section>

          {/* Hero Score Section */}
          <Section style={heroSection}>
            <Text style={greeting}>Hi {userName},</Text>
            <Text style={subtitle}>
              Here&apos;s your weekly AI perception report for <strong>{brandName}</strong>
            </Text>

            <Section style={scoreCard}>
              <Text style={scoreLabel}>Brand Health Score</Text>
              <Text style={scoreValue}>{score}</Text>
              <Text
                style={{
                  ...scoreChange_style,
                  color: isPositiveChange ? "#22c55e" : "#ef4444",
                }}
              >
                {isPositiveChange ? "↑" : "↓"} {Math.abs(scoreChange)} points from last week
              </Text>
            </Section>
          </Section>

          {/* Alerts Section */}
          {alerts.length > 0 && (
            <Section style={alertsSection}>
              <Heading style={sectionTitle}>Alerts This Week</Heading>
              {alerts.map((alert, index) => (
                <Section key={index} style={alertItem}>
                  <Text style={alertTitle}>{alert.title}</Text>
                  <Text style={alertMessage}>{alert.message}</Text>
                </Section>
              ))}
            </Section>
          )}

          {/* Competitive Leaderboard */}
          {competitors.length > 0 && (
            <Section style={leaderboardSection}>
              <Heading style={sectionTitle}>Competitive Leaderboard</Heading>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={tableHeader}>Brand</th>
                    <th style={tableHeader}>Score</th>
                    <th style={tableHeader}>Change</th>
                  </tr>
                </thead>
                <tbody>
                  {competitors.map((competitor, index) => (
                    <tr key={index}>
                      <td style={tableCell}>{competitor.name}</td>
                      <td style={tableCell}>{competitor.score}</td>
                      <td
                        style={{
                          ...tableCell,
                          color: competitor.change >= 0 ? "#22c55e" : "#ef4444",
                        }}
                      >
                        {competitor.change >= 0 ? "+" : ""}
                        {competitor.change}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          )}

          {/* Key Insights */}
          {insights.length > 0 && (
            <Section style={insightsSection}>
              <Heading style={sectionTitle}>Key Insights</Heading>
              {insights.map((insight, index) => (
                <Text key={index} style={insightItem}>
                  • {insight}
                </Text>
              ))}
            </Section>
          )}

          {/* CTA Button */}
          <Section style={ctaSection}>
            <Button style={ctaButton} href={reportUrl}>
              View Full Dashboard
            </Button>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>You&apos;re receiving this because you subscribed to weekly digests.</Text>
            <Link href={unsubscribeUrl} style={unsubscribeLink}>
              Unsubscribe from weekly digests
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
  padding: "0",
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

const heroSection = {
  padding: "32px 24px",
  textAlign: "center" as const,
}

const greeting = {
  fontSize: "18px",
  color: "#1e293b",
  margin: "0 0 8px 0",
}

const subtitle = {
  fontSize: "14px",
  color: "#64748b",
  margin: "0 0 24px 0",
}

const scoreCard = {
  background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
  borderRadius: "12px",
  padding: "32px",
  margin: "0 auto",
  maxWidth: "280px",
}

const scoreLabel = {
  color: "rgba(255, 255, 255, 0.8)",
  fontSize: "14px",
  margin: "0 0 8px 0",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
}

const scoreValue = {
  color: "#ffffff",
  fontSize: "64px",
  fontWeight: "bold",
  margin: "0",
  lineHeight: "1",
}

const scoreChange_style = {
  fontSize: "16px",
  margin: "12px 0 0 0",
  fontWeight: "500",
}

const alertsSection = {
  backgroundColor: "#fef9c3",
  padding: "24px",
  margin: "0",
}

const sectionTitle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#1e293b",
  margin: "0 0 16px 0",
}

const alertItem = {
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  padding: "12px 16px",
  marginBottom: "8px",
}

const alertTitle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#1e293b",
  margin: "0 0 4px 0",
}

const alertMessage = {
  fontSize: "13px",
  color: "#64748b",
  margin: "0",
}

const leaderboardSection = {
  padding: "24px",
}

const table = {
  width: "100%",
  borderCollapse: "collapse" as const,
}

const tableHeader = {
  fontSize: "12px",
  color: "#64748b",
  textAlign: "left" as const,
  padding: "8px 12px",
  borderBottom: "1px solid #e2e8f0",
  textTransform: "uppercase" as const,
}

const tableCell = {
  fontSize: "14px",
  color: "#1e293b",
  padding: "12px",
  borderBottom: "1px solid #e2e8f0",
}

const insightsSection = {
  padding: "0 24px 24px 24px",
}

const insightItem = {
  fontSize: "14px",
  color: "#475569",
  margin: "0 0 8px 0",
  lineHeight: "1.5",
}

const ctaSection = {
  padding: "0 24px 32px 24px",
  textAlign: "center" as const,
}

const ctaButton = {
  backgroundColor: "#3b82f6",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "12px 32px",
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

export default WeeklyDigestEmail
