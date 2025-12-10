export type ModelProvider = "openai" | "anthropic" | "google" | "together" | "deepseek" | "xai"

export interface QueryOptions {
  temperature?: number
  maxTokens?: number
  timeout?: number
}

export interface ModelResponse {
  model: string
  provider: ModelProvider
  response: string
  latency: number
  error?: string
}

export interface AggregatedResults {
  responses: ModelResponse[]
  successCount: number
  failureCount: number
  totalLatency: number
}

export interface ProviderConfig {
  model: string
  provider: ModelProvider
  displayName: string
}

export const MODEL_CONFIGS: ProviderConfig[] = [
  { model: "openai/gpt-4-turbo", provider: "openai", displayName: "GPT-4 Turbo" },
  { model: "anthropic/claude-3-opus-20240229", provider: "anthropic", displayName: "Claude 3 Opus" },
  { model: "google/gemini-pro", provider: "google", displayName: "Gemini Pro" },
  { model: "together/meta-llama/Llama-3-70b-chat-hf", provider: "together", displayName: "Llama 3 70B" },
  { model: "deepseek/deepseek-chat", provider: "deepseek", displayName: "DeepSeek Chat" },
  { model: "xai/grok-2", provider: "xai", displayName: "Grok 2" },
]
