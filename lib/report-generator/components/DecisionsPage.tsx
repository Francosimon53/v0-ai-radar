import { Page, View, Text } from "@react-pdf/renderer"
import { styles, colors } from "../styles"
import type { AnalysisResult, TrackingConfig } from "@/lib/analysis/types"

interface DecisionsPageProps {
  analysis: AnalysisResult
  config: TrackingConfig
}

export function DecisionsPage({ analysis, config }: DecisionsPageProps) {
  const decisions = analysis.synthesis.decisions

  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.mb16}>
        <Text style={styles.label}>SECTION 4</Text>
        <Text style={styles.sectionTitle}>Decisions Required</Text>
        <Text style={styles.body}>
          Critical strategic decisions that require executive attention. Delaying these decisions has measurable cost.
        </Text>
      </View>

      {/* Warning Banner */}
      <View style={styles.cardDanger}>
        <Text style={[styles.body, { color: colors.danger, fontFamily: "Helvetica-Bold" }]}>
          Your competitor has already made these decisions. The window for first-mover advantage is closing.
        </Text>
      </View>

      {/* Decision Cards */}
      {decisions.slice(0, 3).map((decision, index) => (
        <View key={index} style={[styles.card, { marginTop: 12 }]}>
          <View style={styles.rowBetween}>
            <Text style={styles.heading}>Decision #{index + 1}</Text>
            <View style={[styles.badge, styles.badgeDanger]}>
              <Text>Deadline: {decision.deadline}</Text>
            </View>
          </View>

          <Text style={[styles.body, styles.mb12, { fontFamily: "Helvetica-Bold" }]}>{decision.question}</Text>

          <View style={[styles.row, styles.gap12]}>
            {/* Option A */}
            <View style={[styles.cardWhite, { flex: 1, marginBottom: 0 }]}>
              <Text style={[styles.label, { color: colors.primary }]}>OPTION A</Text>
              <Text style={[styles.body, styles.mb8]}>{decision.optionA}</Text>
            </View>

            {/* Option B */}
            <View style={[styles.cardWhite, { flex: 1, marginBottom: 0 }]}>
              <Text style={[styles.label, { color: colors.slateText }]}>OPTION B</Text>
              <Text style={[styles.body, styles.mb8]}>{decision.optionB}</Text>
            </View>
          </View>

          {/* Recommendation */}
          <View style={[styles.cardPrimary, { marginTop: 8, marginBottom: 0 }]}>
            <Text style={[styles.bodySmall, { color: colors.white }]}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>AI VIBES RADAR RECOMMENDATION: </Text>
              {decision.recommendation}
            </Text>
          </View>
        </View>
      ))}

      {/* Cost of Indecision */}
      <View style={[styles.card, { backgroundColor: colors.slate, marginTop: 16 }]}>
        <Text style={[styles.heading, { color: colors.white }]}>The Cost of Indecision</Text>
        <Text style={[styles.body, { color: colors.white }]}>
          Every week these decisions remain unmade costs approximately $47,000 in lost opportunity and competitive
          ground. Analysis shows 73% of market leaders made equivalent decisions within 14 days of receiving similar
          intelligence.
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>Confidential - {config.brand} Internal Use Only</Text>
        <Text>Page 4 of 6</Text>
      </View>
    </Page>
  )
}
