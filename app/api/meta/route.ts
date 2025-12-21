import { NextResponse } from "next/server"

export const dynamic = "force-static"

// AI model metadata for the chat interface
const AI_MODELS = [
  {
    id: "gpt-4",
    name: "GPT-4",
    provider: "OpenAI",
    color: "#10A37F",
    description: "Most capable OpenAI model for complex tasks",
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "OpenAI",
    color: "#10A37F",
    description: "Faster GPT-4 with 128K context",
  },
  {
    id: "claude-sonnet",
    name: "Claude Sonnet",
    provider: "Anthropic",
    color: "#D97706",
    description: "Balanced performance and speed",
  },
  {
    id: "claude-opus",
    name: "Claude Opus",
    provider: "Anthropic",
    color: "#D97706",
    description: "Most capable Claude model",
  },
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    provider: "Google",
    color: "#4285F4",
    description: "Google's advanced multimodal model",
  },
  {
    id: "gemini-ultra",
    name: "Gemini Ultra",
    provider: "Google",
    color: "#4285F4",
    description: "Most capable Gemini model",
  },
  {
    id: "llama-3-70b",
    name: "Llama 3 70B",
    provider: "Meta",
    color: "#0668E1",
    description: "Open-source large language model",
  },
  {
    id: "mistral-large",
    name: "Mistral Large",
    provider: "Mistral AI",
    color: "#FF7000",
    description: "Flagship Mistral model",
  },
  {
    id: "deepseek-v3",
    name: "DeepSeek V3",
    provider: "DeepSeek",
    color: "#6366F1",
    description: "Advanced reasoning model",
  },
  {
    id: "grok-2",
    name: "Grok 2",
    provider: "xAI",
    color: "#1DA1F2",
    description: "xAI's conversational model",
  },
]

export async function GET() {
  return NextResponse.json({
    models: AI_MODELS,
    defaultModel: "claude-sonnet",
    version: "1.0.0",
  })
}
