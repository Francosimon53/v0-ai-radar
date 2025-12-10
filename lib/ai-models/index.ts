import type { AggregatedResults, ModelResponse, QueryOptions } from "./types"
import { queryOpenAI } from "./providers/openai"
import { queryAnthropic } from "./providers/anthropic"
import { queryGoogle } from "./providers/google"
import { queryTogether } from "./providers/together"
import { queryDeepSeek } from "./providers/deepseek"
import { queryXAI } from "./providers/xai"

const DEFAULT_TIMEOUT = 30000 // 30 seconds
const MAX_RETRIES = 2

type QueryFunction = (prompt: string, options?: QueryOptions) => Promise<ModelResponse>

interface ProviderEntry {
  name: string
  query: QueryFunction
}

const providers: ProviderEntry[] = [
  { name: "OpenAI", query: queryOpenAI },
  { name: "Anthropic", query: queryAnthropic },
  { name: "Google", query: queryGoogle },
  { name: "Together", query: queryTogether },
  { name: "DeepSeek", query: queryDeepSeek },
  { name: "xAI", query: queryXAI },
]

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  let timeoutId: NodeJS.Timeout
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
  })

  try {
    const result = await Promise.race([promise, timeoutPromise])
    clearTimeout(timeoutId!)
    return result
  } catch (error) {
    clearTimeout(timeoutId!)
    throw error
  }
}

async function queryWithRetry(
  queryFn: QueryFunction,
  prompt: string,
  options?: QueryOptions,
  retries: number = MAX_RETRIES,
): Promise<ModelResponse> {
  const timeout = options?.timeout ?? DEFAULT_TIMEOUT

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await withTimeout(queryFn(prompt, options), timeout, `Query timed out after ${timeout}ms`)

      // If we got a successful response (no error), return it
      if (!result.error) {
        return result
      }

      // If this was the last attempt, return the error result
      if (attempt === retries) {
        return result
      }

      // Otherwise, retry
      console.log(`Retry attempt ${attempt + 1} for ${result.model}`)
    } catch (error) {
      if (attempt === retries) {
        // Return a failed response on final attempt
        return {
          model: "unknown",
          provider: "openai", // placeholder
          response: "",
          latency: 0,
          error: error instanceof Error ? error.message : "Unknown error",
        }
      }
    }
  }

  // This should never be reached, but TypeScript needs it
  return {
    model: "unknown",
    provider: "openai",
    response: "",
    latency: 0,
    error: "Unexpected error in retry logic",
  }
}

export async function queryAllModels(prompt: string, options?: QueryOptions): Promise<AggregatedResults> {
  const startTime = Date.now()

  // Query all providers in parallel using Promise.allSettled
  const results = await Promise.allSettled(providers.map(({ query }) => queryWithRetry(query, prompt, options)))

  // Process results
  const responses: ModelResponse[] = results.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value
    }
    // Handle rejected promises (shouldn't happen with our retry logic, but just in case)
    return {
      model: providers[index].name,
      provider: "openai" as const,
      response: "",
      latency: 0,
      error: result.reason?.message || "Unknown error",
    }
  })

  const successCount = responses.filter((r) => !r.error).length
  const failureCount = responses.filter((r) => r.error).length
  const totalLatency = Date.now() - startTime

  return {
    responses,
    successCount,
    failureCount,
    totalLatency,
  }
}

// Export individual query functions for direct use
export { queryOpenAI } from "./providers/openai"
export { queryAnthropic } from "./providers/anthropic"
export { queryGoogle } from "./providers/google"
export { queryTogether } from "./providers/together"
export { queryDeepSeek } from "./providers/deepseek"
export { queryXAI } from "./providers/xai"

// Export types
export * from "./types"
