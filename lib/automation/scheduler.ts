export type AnalysisFrequency = "daily" | "weekly" | "monthly"

export interface TrackingConfigDb {
  id: string
  user_id: string
  brand: string
  competitors: string[]
  industry: string
  frequency: AnalysisFrequency
  next_run_at: string
  last_run_at: string | null
  is_active: boolean
  created_at: string
}

/**
 * Calculate the next run date based on frequency
 */
export function getNextRunDate(frequency: AnalysisFrequency, fromDate: Date = new Date()): Date {
  const nextRun = new Date(fromDate)

  switch (frequency) {
    case "daily":
      nextRun.setDate(nextRun.getDate() + 1)
      break
    case "weekly":
      nextRun.setDate(nextRun.getDate() + 7)
      break
    case "monthly":
      nextRun.setMonth(nextRun.getMonth() + 1)
      break
  }

  // Set to 9 AM UTC
  nextRun.setUTCHours(9, 0, 0, 0)

  return nextRun
}

/**
 * Check if a tracking config is due for analysis
 */
export function isDueForAnalysis(config: TrackingConfigDb): boolean {
  if (!config.is_active) return false

  const now = new Date()
  const nextRun = new Date(config.next_run_at)

  return now >= nextRun
}

/**
 * Get configs that are due for analysis
 */
export function filterDueConfigs(configs: TrackingConfigDb[]): TrackingConfigDb[] {
  return configs.filter(isDueForAnalysis)
}
