import { renderToBuffer } from "@react-pdf/renderer"
import { ReportDocument } from "./components/ReportDocument"
import type { AnalysisResult, TrackingConfig } from "@/lib/analysis/types"

export interface ReportGeneratorConfig {
  includeWatermark?: boolean
  quality?: "draft" | "final"
}

/**
 * Generates a PDF report from an analysis result
 * Returns the PDF as a Buffer for upload to storage
 */
export async function generateReport(
  analysis: AnalysisResult,
  config: TrackingConfig,
  options: ReportGeneratorConfig = {},
): Promise<Buffer> {
  const { quality = "final" } = options

  // Create the PDF document
  const document = ReportDocument({ analysis, config })

  // Render to buffer
  const buffer = await renderToBuffer(document)

  return Buffer.from(buffer)
}

/**
 * Generates a report filename based on brand and date
 */
export function generateReportFilename(config: TrackingConfig): string {
  const date = new Date().toISOString().split("T")[0]
  const sanitizedBrand = config.brand.toLowerCase().replace(/[^a-z0-9]/g, "-")
  return `ai-vibes-radar-${sanitizedBrand}-${date}.pdf`
}

// Re-export types and components for testing
export { ReportDocument } from "./components/ReportDocument"
export type { AnalysisResult, TrackingConfig }
