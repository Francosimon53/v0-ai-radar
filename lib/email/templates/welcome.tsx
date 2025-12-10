import { Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from "@react-email/components"

interface WelcomeEmailProps {
  userName: string
  setupWizardUrl: string
}

export function WelcomeEmail({ userName = "there", setupWizardUrl = "#" }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to AI Vibes Radar - Let&apos;s get you started!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>AI Vibes Radar</Text>
          </Section>

          {/* Welcome Content */}
          <Section style={content}>
            <Heading style={title}>Welcome aboard, {userName}!</Heading>
            <Text style={subtitle}>
              You&apos;ve just taken the first step toward understanding how AI perceives your brand. We&apos;re excited
              to help you stay ahead of the competition.
            </Text>

            {/* What to Expect */}
            <Section style={whatToExpectSection}>
              <Heading style={sectionTitle}>What to expect</Heading>
              <Text style={expectItem}>
                <strong>Weekly Reports</strong> - Comprehensive analysis of how 7 leading AI models perceive your brand
              </Text>
              <Text style={expectItem}>
                <strong>Real-time Alerts</strong> - Instant notifications when your brand perception changes
              </Text>
              <Text style={expectItem}>
                <strong>Competitive Intelligence</strong> - See how you stack up against your competitors in AI
                recommendations
              </Text>
            </Section>

            {/* Steps to Get Started */}
            <Section style={stepsSection}>
              <Heading style={sectionTitle}>3 steps to get started</Heading>

              <Section style={step}>
                <Text style={stepNumber}>1</Text>
                <Section style={stepContent}>
                  <Text style={stepTitle}>Add your brand</Text>
                  <Text style={stepDescription}>Enter your brand name and select your industry</Text>
                </Section>
              </Section>

              <Section style={step}>
                <Text style={stepNumber}>2</Text>
                <Section style={stepContent}>
                  <Text style={stepTitle}>Add competitors</Text>
                  <Text style={stepDescription}>Track up to 5 competitors to benchmark against</Text>
                </Section>
              </Section>

              <Section style={step}>
                <Text style={stepNumber}>3</Text>
                <Section style={stepContent}>
                  <Text style={stepTitle}>Run your first analysis</Text>
                  <Text style={stepDescription}>Get your initial AI perception report within minutes</Text>
                </Section>
              </Section>
            </Section>

            {/* CTA Button */}
            <Section style={ctaSection}>
              <Button style={ctaButton} href={setupWizardUrl}>
                Complete Setup
              </Button>
            </Section>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Need help?{" "}
              <Link href="https://aivibesradar.com/help" style={footerLink}>
                Visit our Help Center
              </Link>{" "}
              or{" "}
              <Link href="mailto:support@aivibesradar.com" style={footerLink}>
                contact support
              </Link>
            </Text>
            <Text style={footerCopyright}>© 2025 AI Vibes Radar. All rights reserved.</Text>
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
  padding: "40px 32px",
}

const title = {
  fontSize: "28px",
  fontWeight: "bold",
  color: "#1e293b",
  margin: "0 0 16px 0",
  textAlign: "center" as const,
}

const subtitle = {
  fontSize: "16px",
  color: "#64748b",
  margin: "0 0 32px 0",
  textAlign: "center" as const,
  lineHeight: "1.6",
}

const whatToExpectSection = {
  margin: "0 0 32px 0",
}

const sectionTitle = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#1e293b",
  margin: "0 0 16px 0",
}

const expectItem = {
  fontSize: "14px",
  color: "#475569",
  margin: "0 0 12px 0",
  lineHeight: "1.5",
  paddingLeft: "16px",
  borderLeft: "3px solid #3b82f6",
}

const stepsSection = {
  backgroundColor: "#f8fafc",
  borderRadius: "12px",
  padding: "24px",
  margin: "0 0 32px 0",
}

const step = {
  display: "flex",
  marginBottom: "20px",
}

const stepNumber = {
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  fontSize: "16px",
  fontWeight: "bold",
  textAlign: "center" as const,
  lineHeight: "32px",
  margin: "0 16px 0 0",
  flexShrink: 0,
}

const stepContent = {
  flex: 1,
}

const stepTitle = {
  fontSize: "15px",
  fontWeight: "600",
  color: "#1e293b",
  margin: "0 0 4px 0",
}

const stepDescription = {
  fontSize: "13px",
  color: "#64748b",
  margin: "0",
}

const ctaSection = {
  textAlign: "center" as const,
}

const ctaButton = {
  backgroundColor: "#3b82f6",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  padding: "14px 40px",
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
  fontSize: "13px",
  color: "#64748b",
  margin: "0 0 12px 0",
}

const footerLink = {
  color: "#3b82f6",
  textDecoration: "underline",
}

const footerCopyright = {
  fontSize: "12px",
  color: "#94a3b8",
  margin: "0",
}

export default WelcomeEmail
