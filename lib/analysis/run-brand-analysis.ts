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

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "Analysis failed" }))
    throw new Error(errorData.error || "Analysis failed")
  }

  const data = await res.json()

  if (!data.analysisId) {
    throw new Error("No report ID returned from analysis")
  }

  return {
    analysisId: data.analysisId,
    success: true,
  }
}
