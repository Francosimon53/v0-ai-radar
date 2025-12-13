// Shared helper to run brand analysis - used by both Dashboard and Reports page
export type RunAnalysisResult = {
  analysisId: string
  success: boolean
}

export async function runBrandAnalysis(configId?: string): Promise<RunAnalysisResult> {
  const res = await fetch("/api/analysis/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ configId: configId || "current" }),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const errorMessage = data?.error || data?.message || "Analysis failed"
    throw new Error(errorMessage)
  }

  const reportId = data?.analysisId || data?.reportId || data?.id

  if (!reportId) {
    console.error("[v0] API response missing report ID:", data)
    throw new Error("Analysis completed but no report ID was returned. Please check your database configuration.")
  }

  return {
    analysisId: reportId,
    success: true,
  }
}
