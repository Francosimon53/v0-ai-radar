import { generateText } from "ai"
import type { ModelResponse, QueryOptions } from "../types"

export async function queryTogether(prompt: string, options?: QueryOptions): Promise<ModelResponse> {
  const startTime = Date.now()

  try {
    const { text } = await generateText({
      model: "together/meta-llama/Llama-3-70b-chat-hf",
      prompt,
      temperature: options?.temperature ?? 0.7,
      maxTokens: options?.maxTokens ?? 1000,
    })

    return {
      model: "Llama-3-70b-chat-hf",
      provider: "together",
      response: text,
      latency: Date.now() - startTime,
    }
  } catch (error) {
    return {
      model: "Llama-3-70b-chat-hf",
      provider: "together",
      response: "",
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
