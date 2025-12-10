import { Document, Text, View } from "@react-pdf/renderer"
import { CoverPage } from "./CoverPage"
import { ShareOfVoicePage } from "./ShareOfVoicePage"
import { ThreatPage } from "./ThreatPage"
import { DecisionsPage } from "./DecisionsPage"
import { ActionPlanPage } from "./ActionPlanPage"
import { NextStepsPage } from "./NextStepsPage"
import { styles } from "../styles"
import type { AnalysisResult, TrackingConfig } from "@/lib/analysis/types"

interface ReportDocumentProps {
  analysis: AnalysisResult
  config: TrackingConfig
}

export function ReportDocument({ analysis, config }: ReportDocumentProps) {
  return (
    <Document
      title={`AI Brand Intelligence Report - ${config.brand}`}
      author="AI Vibes Radar"
      subject={`Brand analysis for ${config.brand} in ${config.industry}`}
      keywords={`brand intelligence, AI, ${config.brand}, ${config.industry}`}
    >
      {/* Watermark wrapper for all pages */}
      <CoverPage analysis={analysis} config={config} />
      <ShareOfVoicePage analysis={analysis} config={config} />
      <ThreatPage analysis={analysis} config={config} />
      <DecisionsPage analysis={analysis} config={config} />
      <ActionPlanPage analysis={analysis} config={config} />
      <NextStepsPage analysis={analysis} config={config} />
    </Document>
  )
}

// Watermark component for use within pages
export function Watermark() {
  return (
    <View style={styles.watermark}>
      <Text>CONFIDENTIAL</Text>
    </View>
  )
}
