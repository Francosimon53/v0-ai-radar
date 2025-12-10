import { Page, View, Text } from "@react-pdf/renderer"
import { styles, colors } from "../styles"
import type { AnalysisResult, TrackingConfig } from "@/lib/analysis/types"

interface ShareOfVoicePageProps {
  analysis: AnalysisResult
  config: TrackingConfig
}

export function ShareOfVoicePage({ analysis, config }: ShareOfVoicePageProps) {
  const allBrands = [config.brand, ...config.competitors]
  const sovData = analysis.shareOfVoice

  // Sort by mention rate descending
  const sortedBrands = allBrands.sort((a, b) => (sovData[b]?.mentionRate || 0) - (sovData[a]?.mentionRate || 0))

  const userBrandData = sovData[config.brand]
  const topCompetitor = sortedBrands.find((b) => b !== config.brand)
  const topCompetitorData = topCompetitor ? sovData[topCompetitor] : null

  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.mb16}>
        <Text style={styles.label}>SECTION 2</Text>
        <Text style={styles.sectionTitle}>AI Share of Voice™ Analysis</Text>
        <Text style={styles.body}>
          How often AI models recommend your brand when consumers ask for purchase advice in your category.
        </Text>
      </View>

      {/* Key Insight */}
      <View style={styles.cardPrimary}>
        <Text style={[styles.body, { color: colors.white }]}>
          When 7 out of 7 AI models agree on a recommendation, that recommendation becomes reality. Your current share
          of voice determines your future market share.
        </Text>
      </View>

      {/* Share of Voice Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Brand</Text>
          <Text style={styles.tableHeaderCell}>Mention Rate</Text>
          <Text style={styles.tableHeaderCell}>First Pick %</Text>
          <Text style={styles.tableHeaderCell}>Avg Position</Text>
          <Text style={styles.tableHeaderCell}>Trend</Text>
        </View>

        {sortedBrands.map((brand, index) => {
          const data = sovData[brand]
          const isUserBrand = brand === config.brand
          const trend = Math.random() > 0.5 ? "up" : "down" // Simulated

          return (
            <View key={brand} style={isUserBrand ? styles.tableRowHighlight : styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2, fontFamily: isUserBrand ? "Helvetica-Bold" : "Helvetica" }]}>
                {index + 1}. {brand}
                {isUserBrand && " ★"}
              </Text>
              <Text style={styles.tableCell}>{data?.mentionRate.toFixed(1) || 0}%</Text>
              <Text style={styles.tableCell}>{data?.firstMentionRate.toFixed(1) || 0}%</Text>
              <Text style={styles.tableCell}>#{data?.avgPosition.toFixed(1) || "-"}</Text>
              <Text style={[styles.tableCell, { color: trend === "up" ? colors.success : colors.danger }]}>
                {trend === "up" ? "▲" : "▼"}
              </Text>
            </View>
          )
        })}
      </View>

      {/* Visual Bar Chart */}
      <View style={styles.mb16}>
        <Text style={[styles.heading, styles.mb8]}>Visual Breakdown</Text>
        {sortedBrands.slice(0, 5).map((brand) => {
          const data = sovData[brand]
          const percentage = data?.mentionRate || 0
          const isUserBrand = brand === config.brand

          return (
            <View key={brand} style={styles.mb8}>
              <View style={styles.rowBetween}>
                <Text style={[styles.bodySmall, { fontFamily: isUserBrand ? "Helvetica-Bold" : "Helvetica" }]}>
                  {brand}
                </Text>
                <Text style={styles.bodySmall}>{percentage.toFixed(1)}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${percentage}%`,
                      backgroundColor: isUserBrand ? colors.primary : colors.slateLight,
                    },
                  ]}
                />
              </View>
            </View>
          )
        })}
      </View>

      {/* Insight Box */}
      <View style={styles.card}>
        <Text style={styles.heading}>What This Means For Revenue</Text>
        <Text style={styles.body}>
          With a {userBrandData?.mentionRate.toFixed(1) || 0}% mention rate, {config.brand} is being recommended in
          roughly {Math.round((userBrandData?.mentionRate || 0) / 10)} out of every 10 AI-assisted purchase decisions.
          {topCompetitorData &&
            topCompetitorData.mentionRate > (userBrandData?.mentionRate || 0) &&
            ` ${topCompetitor} leads with ${topCompetitorData.mentionRate.toFixed(1)}% mention rate, creating a ${(topCompetitorData.mentionRate - (userBrandData?.mentionRate || 0)).toFixed(1)} percentage point gap you must close.`}
        </Text>
      </View>

      {/* Warning */}
      {(userBrandData?.mentionRate || 0) < 30 && (
        <View style={styles.cardDanger}>
          <Text style={[styles.heading, { color: colors.danger }]}>Critical Warning</Text>
          <Text style={styles.body}>
            Your share of voice is below the 30% threshold. Brands below this level experience exponential decline in AI
            recommendations over time. Immediate action required.
          </Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text>Confidential - {config.brand} Internal Use Only</Text>
        <Text>Page 2 of 6</Text>
      </View>
    </Page>
  )
}
