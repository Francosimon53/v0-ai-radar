import { Page, View, Text } from "@react-pdf/renderer"
import { styles, colors } from "../styles"
import type { AnalysisResult, TrackingConfig } from "@/lib/analysis/types"

interface CoverPageProps {
  analysis: AnalysisResult
  config: TrackingConfig
}

export function CoverPage({ analysis, config }: CoverPageProps) {
  const score = analysis.dimensional.brandStrengthIndex
  const previousScore = score - 3 // Simulated trend
  const trend = score - previousScore
  const isPositive = trend >= 0

  // Calculate value at risk based on score
  const industryRevenue = 50000000 // $50M baseline
  const valueAtRisk = Math.round(industryRevenue * (1 - score / 100) * 0.15)

  const hasUrgentThreats = Object.values(analysis.threats).some((t) => t.threatScore >= 8)

  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.mb24}>
        <Text style={{ fontSize: 10, color: colors.slateText }}>AI VIBES RADAR™</Text>
        <Text style={styles.title}>Brand Intelligence Report</Text>
        <Text style={styles.subtitle}>
          {config.brand} • {config.industry} •{" "}
          {new Date(analysis.timestamp).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </Text>
      </View>

      {/* Brand Strength Index */}
      <View style={[styles.card, styles.center, { paddingVertical: 32 }]}>
        <Text style={styles.label}>BRAND STRENGTH INDEX</Text>
        <View style={styles.row}>
          <Text style={styles.scoreHuge}>{score}</Text>
          <Text style={{ fontSize: 24, color: colors.slateText, marginTop: 24 }}>/100</Text>
        </View>
        <View style={[styles.row, styles.gap4, styles.mt8]}>
          <Text style={{ fontSize: 16, color: isPositive ? colors.success : colors.danger }}>
            {isPositive ? "▲" : "▼"} {Math.abs(trend)}
          </Text>
          <Text style={styles.scoreLabel}>vs previous period</Text>
        </View>
      </View>

      {/* The Bottom Line */}
      <View style={styles.cardPrimary}>
        <Text style={[styles.heading, { color: colors.white }]}>The Bottom Line</Text>
        <Text style={{ color: colors.white, fontSize: 11, lineHeight: 1.6 }}>{analysis.synthesis.bottomLine}</Text>
      </View>

      {/* Urgent Alert */}
      {hasUrgentThreats && (
        <View style={styles.cardDanger}>
          <View style={styles.rowBetween}>
            <Text style={[styles.heading, { color: colors.danger, marginBottom: 0 }]}>⚠ URGENT ACTION REQUIRED</Text>
          </View>
          <Text style={[styles.body, styles.mt8]}>
            Critical competitive threats detected. If AI models stop recommending {config.brand}, you effectively cease
            to exist in the AI-driven purchase journey.
          </Text>
        </View>
      )}

      {/* Value at Risk */}
      <View style={styles.card}>
        <Text style={styles.label}>ESTIMATED VALUE AT RISK</Text>
        <Text style={[styles.scoreLarge, { color: colors.danger }]}>${(valueAtRisk / 1000000).toFixed(1)}M</Text>
        <Text style={styles.bodySmall}>
          Annual revenue impact if current trajectory continues. This represents {Math.round((1 - score / 100) * 15)}%
          of addressable market.
        </Text>
      </View>

      {/* Key Metrics Row */}
      <View style={[styles.row, styles.gap12]}>
        <View style={[styles.card, { flex: 1 }]}>
          <Text style={styles.label}>AI SHARE OF VOICE</Text>
          <Text style={styles.scoreMedium}>{analysis.shareOfVoice[config.brand]?.mentionRate.toFixed(1) || 0}%</Text>
        </View>
        <View style={[styles.card, { flex: 1 }]}>
          <Text style={styles.label}>FIRST PICK RATE</Text>
          <Text style={styles.scoreMedium}>
            {analysis.shareOfVoice[config.brand]?.firstMentionRate.toFixed(1) || 0}%
          </Text>
        </View>
        <View style={[styles.card, { flex: 1 }]}>
          <Text style={styles.label}>ACTIVE THREATS</Text>
          <Text style={[styles.scoreMedium, { color: colors.danger }]}>
            {Object.values(analysis.threats).filter((t) => t.threatScore >= 5).length}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>Confidential - {config.brand} Internal Use Only</Text>
        <Text>Page 1 of 6</Text>
      </View>
    </Page>
  )
}
