import { generateText } from "ai"
import type { ModelResponse, QueryOptions } from "../types"

export async function queryDeepSeek(prompt: string, options?: QueryOptions): Promise<ModelResponse> {
  const startTime = Date.now()

  try {
    const { text } = await generateText({
      model: "deepseek/deepseek-chat",
      prompt,
      temperature: options?.temperature ?? 0.7,
      maxTokens: options?.maxTokens ?? 1000,
    })

    return {
      model: "deepseek-chat",
      provider: "deepseek",
      response: text,
      latency: Date.now() - startTime,
    }
  } catch (error) {
    return {
      model: "deepseek-chat",
      provider: "deepseek",
      response: "",
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
