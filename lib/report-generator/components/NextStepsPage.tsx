import { Page, View, Text } from "@react-pdf/renderer"
import { styles, colors } from "../styles"
import type { AnalysisResult, TrackingConfig } from "@/lib/analysis/types"

interface NextStepsPageProps {
  analysis: AnalysisResult
  config: TrackingConfig
}

export function NextStepsPage({ analysis, config }: NextStepsPageProps) {
  const nextReportDate = new Date()
  nextReportDate.setDate(nextReportDate.getDate() + 7)

  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.mb16}>
        <Text style={styles.label}>SECTION 6</Text>
        <Text style={styles.sectionTitle}>What's Next</Text>
        <Text style={styles.body}>Your ongoing AI brand monitoring and strategic support.</Text>
      </View>

      {/* Next Report */}
      <View style={styles.card}>
        <Text style={styles.heading}>Next Report</Text>
        <View style={styles.row}>
          <Text style={[styles.scoreLarge, { color: colors.primary }]}>
            {nextReportDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </Text>
          <View style={{ marginLeft: 16 }}>
            <Text style={styles.body}>Your next AI Brand Intelligence Report will be delivered automatically.</Text>
            <Text style={styles.bodySmall}>
              We'll track changes in AI model responses and alert you to any significant shifts.
            </Text>
          </View>
        </View>
      </View>

      {/* What We'll Monitor */}
      <View style={[styles.card, styles.mt16]}>
        <Text style={styles.heading}>What We'll Be Watching</Text>

        <View style={styles.bulletItem}>
          <View style={styles.bullet} />
          <Text style={styles.bulletText}>Changes in your Share of Voice across all 7 AI models</Text>
        </View>
        <View style={styles.bulletItem}>
          <View style={styles.bullet} />
          <Text style={styles.bulletText}>Competitor momentum and new market entrants</Text>
        </View>
        <View style={styles.bulletItem}>
          <View style={styles.bullet} />
          <Text style={styles.bulletText}>Narrative shifts in how AI describes {config.brand}</Text>
        </View>
        <View style={styles.bulletItem}>
          <View style={styles.bullet} />
          <Text style={styles.bulletText}>Impact of your actions on brand perception</Text>
        </View>
        <View style={styles.bulletItem}>
          <View style={styles.bullet} />
          <Text style={styles.bulletText}>Emerging threats and opportunities in {config.industry}</Text>
        </View>
      </View>

      {/* Alert Settings */}
      <View style={[styles.card, styles.mt16]}>
        <Text style={styles.heading}>Real-Time Alerts Active</Text>
        <Text style={styles.body}>You'll receive immediate notifications if:</Text>

        <View style={[styles.row, styles.gap12, styles.mt8]}>
          <View style={[styles.cardDanger, { flex: 1, marginBottom: 0 }]}>
            <Text style={styles.bodySmall}>Brand score drops more than 5 points</Text>
          </View>
          <View style={[styles.cardWarning, { flex: 1, marginBottom: 0 }]}>
            <Text style={styles.bodySmall}>Competitor gains significant ground</Text>
          </View>
          <View style={[styles.cardSuccess, { flex: 1, marginBottom: 0 }]}>
            <Text style={styles.bodySmall}>Positive momentum detected</Text>
          </View>
        </View>
      </View>

      {/* Contact */}
      <View style={[styles.card, { backgroundColor: colors.slate, marginTop: 16 }]}>
        <Text style={[styles.heading, { color: colors.white }]}>Need Strategic Support?</Text>
        <Text style={[styles.body, { color: colors.white }]}>
          Our brand intelligence team is available to help you interpret these findings and develop a customized action
          plan.
        </Text>
        <View style={styles.mt8}>
          <Text style={[styles.bodySmall, { color: colors.grayDark }]}>Email: support@aivibesradar.com</Text>
          <Text style={[styles.bodySmall, { color: colors.grayDark }]}>Schedule a call: aivibesradar.com/consult</Text>
        </View>
      </View>

      {/* Closing Statement */}
      <View style={[styles.center, { marginTop: 24 }]}>
        <Text style={[styles.body, { textAlign: "center", fontStyle: "italic" }]}>
          "In the age of AI, perception is reality. Your brand exists only if AI remembers it."
        </Text>
        <Text style={[styles.bodySmall, { marginTop: 8 }]}>— AI Vibes Radar™</Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>Confidential - {config.brand} Internal Use Only</Text>
        <Text>Page 6 of 6</Text>
      </View>
    </Page>
  )
}
