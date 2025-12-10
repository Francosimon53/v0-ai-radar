import { Page, View, Text } from "@react-pdf/renderer"
import { styles, colors } from "../styles"
import type { AnalysisResult, TrackingConfig } from "@/lib/analysis/types"

interface ActionPlanPageProps {
  analysis: AnalysisResult
  config: TrackingConfig
}

export function ActionPlanPage({ analysis, config }: ActionPlanPageProps) {
  const actionPlan = analysis.synthesis.actionPlan

  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.mb16}>
        <Text style={styles.label}>SECTION 5</Text>
        <Text style={styles.sectionTitle}>90-Day Action Plan</Text>
        <Text style={styles.body}>
          A prioritized roadmap to improve your AI brand perception and defend against competitive threats.
        </Text>
      </View>

      {/* Urgency Banner */}
      <View style={styles.cardDanger}>
        <Text style={[styles.body, { color: colors.danger }]}>
          <Text style={{ fontFamily: "Helvetica-Bold" }}>90-DAY WINDOW: </Text>
          AI model training cycles occur quarterly. Actions taken in the next 90 days will determine your brand's
          position in the next generation of AI recommendations.
        </Text>
      </View>

      {/* Week 1-2: Immediate Actions */}
      <View style={[styles.card, { borderLeft: `4px solid ${colors.danger}`, marginTop: 12 }]}>
        <View style={styles.rowBetween}>
          <Text style={[styles.heading, { color: colors.danger }]}>Week 1-2: Immediate Actions</Text>
          <View style={[styles.badge, styles.badgeDanger]}>
            <Text>CRITICAL</Text>
          </View>
        </View>
        <Text style={[styles.bodySmall, styles.mb8]}>
          Stop the bleeding. These actions prevent further deterioration.
        </Text>

        {actionPlan.week1_2.map((action, index) => (
          <View key={index} style={styles.bulletItem}>
            <View style={[styles.bullet, { backgroundColor: colors.danger }]} />
            <Text style={styles.bulletText}>{action}</Text>
          </View>
        ))}
      </View>

      {/* Week 3-6: Short-term Actions */}
      <View style={[styles.card, { borderLeft: `4px solid ${colors.warning}`, marginTop: 12 }]}>
        <View style={styles.rowBetween}>
          <Text style={[styles.heading, { color: colors.warning }]}>Week 3-6: Build Momentum</Text>
          <View style={[styles.badge, styles.badgeWarning]}>
            <Text>HIGH PRIORITY</Text>
          </View>
        </View>
        <Text style={[styles.bodySmall, styles.mb8]}>Establish positive trajectory. Begin systematic improvement.</Text>

        {actionPlan.week3_6.map((action, index) => (
          <View key={index} style={styles.bulletItem}>
            <View style={[styles.bullet, { backgroundColor: colors.warning }]} />
            <Text style={styles.bulletText}>{action}</Text>
          </View>
        ))}
      </View>

      {/* Week 7-12: Medium-term Actions */}
      <View style={[styles.card, { borderLeft: `4px solid ${colors.success}`, marginTop: 12 }]}>
        <View style={styles.rowBetween}>
          <Text style={[styles.heading, { color: colors.success }]}>Week 7-12: Consolidate Gains</Text>
          <View style={[styles.badge, styles.badgeSuccess]}>
            <Text>STRATEGIC</Text>
          </View>
        </View>
        <Text style={[styles.bodySmall, styles.mb8]}>
          Lock in improvements. Build sustainable competitive advantage.
        </Text>

        {actionPlan.week7_12.map((action, index) => (
          <View key={index} style={styles.bulletItem}>
            <View style={[styles.bullet, { backgroundColor: colors.success }]} />
            <Text style={styles.bulletText}>{action}</Text>
          </View>
        ))}
      </View>

      {/* Success Metric */}
      <View style={[styles.card, { backgroundColor: colors.slate, marginTop: 12 }]}>
        <Text style={[styles.heading, { color: colors.white }]}>Success Metric</Text>
        <Text style={[styles.body, { color: colors.white }]}>
          Following this plan, {config.brand} should see a 15-25% improvement in AI Share of Voice within 90 days,
          translating to approximately $2.3M in protected annual revenue.
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>Confidential - {config.brand} Internal Use Only</Text>
        <Text>Page 5 of 6</Text>
      </View>
    </Page>
  )
}
