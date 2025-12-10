import { generateText } from "ai"
import type { ModelResponse, QueryOptions } from "../types"

export async function queryOpenAI(prompt: string, options?: QueryOptions): Promise<ModelResponse> {
  const startTime = Date.now()

  try {
    const { text } = await generateText({
      model: "openai/gpt-4-turbo",
      prompt,
      temperature: options?.temperature ?? 0.7,
      maxTokens: options?.maxTokens ?? 1000,
    })

    return {
      model: "gpt-4-turbo",
      provider: "openai",
      response: text,
      latency: Date.now() - startTime,
    }
  } catch (error) {
    return {
      model: "gpt-4-turbo",
      provider: "openai",
      response: "",
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
