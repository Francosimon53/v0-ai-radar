import { Page, View, Text } from "@react-pdf/renderer"
import { styles, colors } from "../styles"
import type { AnalysisResult, TrackingConfig } from "@/lib/analysis/types"

interface ThreatPageProps {
  analysis: AnalysisResult
  config: TrackingConfig
}

export function ThreatPage({ analysis, config }: ThreatPageProps) {
  const threats = analysis.threats
  const sortedThreats = Object.entries(threats).sort(([, a], [, b]) => b.threatScore - a.threatScore)

  const getThreatColor = (score: number) => {
    if (score >= 8) return colors.danger
    if (score >= 5) return colors.warning
    return colors.success
  }

  const getThreatCardStyle = (score: number) => {
    if (score >= 8) return styles.cardDanger
    if (score >= 5) return styles.cardWarning
    return styles.cardSuccess
  }

  const getTimelineText = (timeline: string) => {
    switch (timeline) {
      case "short":
        return "0-3 months"
      case "medium":
        return "3-6 months"
      case "long":
        return "6-12 months"
      default:
        return timeline
    }
  }

  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.mb16}>
        <Text style={styles.label}>SECTION 3</Text>
        <Text style={styles.sectionTitle}>Competitive Threat Assessment</Text>
        <Text style={styles.body}>
          Real-time analysis of competitor positioning in AI model responses and their trajectory toward market
          dominance.
        </Text>
      </View>

      {/* Threat Summary */}
      <View style={[styles.row, styles.gap12, styles.mb16]}>
        <View style={[styles.card, { flex: 1 }]}>
          <Text style={styles.label}>CRITICAL THREATS</Text>
          <Text style={[styles.scoreMedium, { color: colors.danger }]}>
            {sortedThreats.filter(([, t]) => t.threatScore >= 8).length}
          </Text>
        </View>
        <View style={[styles.card, { flex: 1 }]}>
          <Text style={styles.label}>MODERATE THREATS</Text>
          <Text style={[styles.scoreMedium, { color: colors.warning }]}>
            {sortedThreats.filter(([, t]) => t.threatScore >= 5 && t.threatScore < 8).length}
          </Text>
        </View>
        <View style={[styles.card, { flex: 1 }]}>
          <Text style={styles.label}>LOW THREATS</Text>
          <Text style={[styles.scoreMedium, { color: colors.success }]}>
            {sortedThreats.filter(([, t]) => t.threatScore < 5).length}
          </Text>
        </View>
      </View>

      {/* Threat Cards */}
      {sortedThreats.map(([competitor, threat]) => (
        <View key={competitor} style={getThreatCardStyle(threat.threatScore)}>
          <View style={styles.rowBetween}>
            <Text style={[styles.heading, { marginBottom: 0, color: getThreatColor(threat.threatScore) }]}>
              {competitor}
            </Text>
            <View style={styles.row}>
              <Text style={[styles.scoreMedium, { color: getThreatColor(threat.threatScore) }]}>
                {threat.threatScore}
              </Text>
              <Text style={[styles.bodySmall, { marginLeft: 4 }]}>/10</Text>
            </View>
          </View>

          <View style={[styles.row, styles.gap8, styles.mt8]}>
            <View
              style={[
                styles.badge,
                threat.momentum === "gaining"
                  ? styles.badgeDanger
                  : threat.momentum === "stable"
                    ? styles.badgeWarning
                    : styles.badgeSuccess,
              ]}
            >
              <Text>
                {threat.momentum === "gaining" ? "↑ GAINING" : threat.momentum === "stable" ? "→ STABLE" : "↓ LOSING"}
              </Text>
            </View>
            <Text style={styles.bodySmall}>Timeline to critical: {getTimelineText(threat.timeline)}</Text>
          </View>

          <View style={styles.mt8}>
            <Text style={[styles.label, { marginBottom: 4 }]}>PRIMARY ATTACK VECTORS</Text>
            {threat.attackVectors.slice(0, 2).map((vector, i) => (
              <View key={i} style={styles.bulletItem}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>{vector}</Text>
              </View>
            ))}
          </View>

          <View style={styles.mt8}>
            <Text style={styles.bodySmall}>
              Attack probability: {Math.round(threat.attackProbability * 100)}% • Gap closing rate:{" "}
              {Math.round(threat.gapClosingRate * 100)}%/month
            </Text>
          </View>
        </View>
      ))}

      {/* Psychological Trigger */}
      <View style={[styles.card, { backgroundColor: colors.slate, marginTop: 8 }]}>
        <Text style={[styles.body, { color: colors.white }]}>
          "Your competitors are already optimizing for AI recommendations. Every day you delay, they move closer to
          capturing your customers before you even get a chance to compete."
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>Confidential - {config.brand} Internal Use Only</Text>
        <Text>Page 3 of 6</Text>
      </View>
    </Page>
  )
}
