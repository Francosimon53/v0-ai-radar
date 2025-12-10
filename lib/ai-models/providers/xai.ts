import { generateText } from "ai"
import type { ModelResponse, QueryOptions } from "../types"

export async function queryXAI(prompt: string, options?: QueryOptions): Promise<ModelResponse> {
  const startTime = Date.now()

  try {
    const { text } = await generateText({
      model: "xai/grok-2",
      prompt,
      temperature: options?.temperature ?? 0.7,
      maxTokens: options?.maxTokens ?? 1000,
    })

    return {
      model: "grok-2",
      provider: "xai",
      response: text,
      latency: Date.now() - startTime,
    }
  } catch (error) {
    return {
      model: "grok-2",
      provider: "xai",
      response: "",
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
