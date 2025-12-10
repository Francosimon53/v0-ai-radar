import { generateText } from "ai"
import type { ModelResponse, QueryOptions } from "../types"

export async function queryGoogle(prompt: string, options?: QueryOptions): Promise<ModelResponse> {
  const startTime = Date.now()

  try {
    const { text } = await generateText({
      model: "google/gemini-pro",
      prompt,
      temperature: options?.temperature ?? 0.7,
      maxTokens: options?.maxTokens ?? 1000,
    })

    return {
      model: "gemini-pro",
      provider: "google",
      response: text,
      latency: Date.now() - startTime,
    }
  } catch (error) {
    return {
      model: "gemini-pro",
      provider: "google",
      response: "",
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
