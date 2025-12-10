import { generateText } from "ai"
import type { ModelResponse, QueryOptions } from "../types"

export async function queryAnthropic(prompt: string, options?: QueryOptions): Promise<ModelResponse> {
  const startTime = Date.now()

  try {
    const { text } = await generateText({
      model: "anthropic/claude-3-opus-20240229",
      prompt,
      temperature: options?.temperature ?? 0.7,
      maxTokens: options?.maxTokens ?? 1000,
    })

    return {
      model: "claude-3-opus-20240229",
      provider: "anthropic",
      response: text,
      latency: Date.now() - startTime,
    }
  } catch (error) {
    return {
      model: "claude-3-opus-20240229",
      provider: "anthropic",
      response: "",
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
