// Shared helper to run brand analysis - used by both Dashboard and Reports page
export type RunAnalysisResult = {
  reportId: string
  success: boolean
}

export async function runBrandAnalysis(configId?: string): Promise<RunAnalysisResult> {
  const response = await fetch("/api/analysis/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ configId: configId || "current" }),
  })

  if (!response.ok) {
    // Read JSON to show a more useful error message
    const error = await response.json().catch(() => null)
    throw new Error(error?.error ?? "Failed to run analysis")
  }

  const data = await response.json()

  if (!data.reportId) {
    throw new Error("Analysis completed but backend did not return reportId")
  }

  return {
    reportId: data.reportId,
    success: true,
  }
}
