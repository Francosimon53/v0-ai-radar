import { generateObject } from "ai"
import { z } from "zod"
import type { TrackingConfig, AnalysisResult, HistoricalData } from "./types"

// --- Schema for the pillar system + 90-30-7 plan ---

export const StrategyPlanSchema = z.object({
  northStarGoal: z.string().describe("Main business goal for the next 90 days, in simple language"),
  pillars: z
    .array(
      z.object({
        id: z.enum(["strategy", "operations", "product", "marketing", "people", "ai_maturity"]),
        name: z.string(),
        score: z.number().min(1).max(5),
        strengths: z.array(z.string()),
        weaknesses: z.array(z.string()),
      }),
    )
    .min(3)
    .max(6),
  backlog: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        pillarId: z.enum(["strategy", "operations", "product", "marketing", "people", "ai_maturity"]),
        impact: z.number().int().min(1).max(5),
        ease: z.number().int().min(1).max(5),
        urgency: z.number().int().min(1).max(5),
        totalScore: z.number(),
        horizon: z.enum(["quick_win", "30_days", "90_days"]),
      }),
    )
    .max(30),
  plan90_30_7: z.object({
    quickWins: z
      .array(
        z.object({
          id: z.string(),
          title: z.string(),
          description: z.string(),
        }),
      )
      .max(10),
    thirtyDayFocus: z
      .array(
        z.object({
          id: z.string(),
          title: z.string(),
          description: z.string(),
        }),
      )
      .max(10),
    ninetyDayProjects: z
      .array(
        z.object({
          id: z.string(),
          title: z.string(),
          description: z.string(),
        }),
      )
      .max(10),
  }),
})

export type StrategyPlan = z.infer<typeof StrategyPlanSchema>

/**
 * Builds a structured, actionable strategy plan (pillars + backlog + 90-30-7)
 * based on the current analysis result and tracking configuration.
 */
export async function buildStrategyPlan(
  analysisResult: AnalysisResult | any,
  trackingConfig: TrackingConfig,
  historicalData?: HistoricalData | undefined,
): Promise<StrategyPlan> {
  const { object } = await generateObject({
    model: "openai/gpt-4o-mini",
    schema: StrategyPlanSchema,
    temperature: 0.4,
    messages: [
      {
        role: "system",
        content: [
          "You are a senior strategy and operations consultant specialized in brand competitiveness and AI adoption.",
          "Your job is to transform an existing brand analysis into:",
          "1) A diagnosis across core business pillars.",
          "2) A prioritized backlog of actions.",
          "3) A 90-30-7 day action plan.",
          "",
          "Key rules:",
          "- Be concrete and practical, avoid fluff.",
          "- Return ONLY JSON that matches the provided schema.",
          "- Actions must be realistic for a normal business (no futuristic nonsense).",
          "- Connect recommendations to what the analysis already shows (strengths, threats, share of voice, trends, etc.).",
        ].join("\n"),
      },
      {
        role: "user",
        content: [
          "Here is all the context you need to build the plan.",
          "",
          "=== Tracking config (target brand) ===",
          JSON.stringify(trackingConfig, null, 2),
          "",
          "=== Current analysis result (runFullAnalysis) ===",
          JSON.stringify(analysisResult, null, 2),
          "",
          historicalData
            ? ["=== Relevant historical data ===", JSON.stringify(historicalData, null, 2)].join("\n")
            : "",
          "",
          "Using all this information, generate a complete strategic plan that STRICTLY matches the schema.",
        ].join("\n"),
      },
    ],
  })

  return object
}
