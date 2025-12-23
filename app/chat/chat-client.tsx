"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  MessageSquare,
  Plus,
  Send,
  Download,
  Share2,
  Trash2,
  Menu,
  X,
  ArrowLeft,
  Loader2,
  Copy,
  Check,
  RefreshCw,
  Radar,
  FileDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { generateBrandAnalysisPDF, parseAnalysisFromMessage } from "@/lib/pdf-generator"

interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp?: number
}

interface ChatClientProps {
  initialConversations: Conversation[]
  userPlan: string
  queriesUsed: number
  queriesLimit: number
}

const TypingIndicator = () => (
  <div className="flex items-center gap-2 text-slate-400">
    <div className="flex gap-1">
      <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
      <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
    <span className="text-sm">AI is analyzing...</span>
  </div>
)

const QUICK_BRANDS = ["Nike", "Apple", "Tesla", "Coca-Cola", "Amazon", "Google", "Netflix", "Spotify"]

function isBrandAnalysisMessage(content: string): boolean {
  const analysisIndicators = [
    /brand\s*(analysis|score|perception)/i,
    /overall\s*score/i,
    /sentiment\s*analysis/i,
    /swot/i,
    /ai\s*visibility/i,
    /dimensional\s*scores?/i,
    /share\s*of\s*voice/i,
    /brand\s*positioning/i,
    /recommendation/i,
    /\d+\/100/,
  ]
  return analysisIndicators.some((pattern) => pattern.test(content))
}

function extractBrandFromContent(content: string): string | undefined {
  const patterns = [
    /(?:analysis of|analyzing|brand[:\s]+)([A-Z][a-zA-Z]+)/i,
    /^##\s*(?:Brand\s*Analysis[:\s]*)?([A-Z][a-zA-Z]+)/m,
    /\*\*([A-Z][a-zA-Z]+)\*\*/,
  ]
  for (const pattern of patterns) {
    const match = content.match(pattern)
    if (match) return match[1]
  }
  return undefined
}

export function ChatClient({
  initialConversations,
  userPlan,
  queriesUsed: initialQueriesUsed,
  queriesLimit,
}: ChatClientProps) {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [input, setInput] = useState("")
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [queriesUsed, setQueriesUsed] = useState(initialQueriesUsed)
  const [isNewChat, setIsNewChat] = useState(true)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (activeConversationId) {
      loadConversationMessages(activeConversationId)
      setIsNewChat(false)
    }
  }, [activeConversationId])

  const loadConversationMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`)
      if (response.ok) {
        const { messages: dbMessages } = await response.json()
        const formattedMessages: Message[] = dbMessages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.created_at).getTime(),
        }))
        setMessages(formattedMessages)
      }
    } catch (error) {
      console.error("Failed to load messages:", error)
    }
  }

  const handleNewConversation = async () => {
    setMessages([])
    setIsNewChat(true)
    setActiveConversationId(null)

    setIsCreatingConversation(true)
    try {
      const response = await fetch("/api/conversations", { method: "POST" })
      if (response.ok) {
        const { conversation } = await response.json()
        setConversations([conversation, ...conversations])
        setActiveConversationId(conversation.id)
      }
    } catch (error) {
      console.error("Failed to create conversation:", error)
    } finally {
      setIsCreatingConversation(false)
    }
  }

  const handleDeleteConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`, { method: "DELETE" })
      if (response.ok) {
        setConversations(conversations.filter((c) => c.id !== id))
        if (activeConversationId === id) {
          setActiveConversationId(null)
          setMessages([])
        }
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error)
    }
  }

  const handleCopyMessage = useCallback(async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch {
      console.error("Failed to copy")
    }
  }, [])

  const handleRegenerate = useCallback(async () => {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")
    if (!lastUserMessage || isLoading) return

    // Remove last assistant message
    setMessages((prev) => {
      const lastAssistantIndex = prev.map((m) => m.role).lastIndexOf("assistant")
      if (lastAssistantIndex >= 0) {
        return prev.slice(0, lastAssistantIndex)
      }
      return prev
    })

    // Resend the last user message
    setInput(lastUserMessage.content)
    setTimeout(() => {
      const form = document.querySelector("form")
      form?.requestSubmit()
    }, 100)
  }, [messages, isLoading])

  const handleQuickBrand = useCallback((brand: string) => {
    setInput(`Analyze ${brand}'s brand perception`)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setIsNewChat(false)

    const userMessageObj: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userMessage,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, userMessageObj])
    setIsLoading(true)

    let conversationId = activeConversationId

    if (!conversationId) {
      setIsCreatingConversation(true)
      try {
        const response = await fetch("/api/conversations", { method: "POST" })
        if (response.ok) {
          const { conversation } = await response.json()
          setConversations([conversation, ...conversations])
          setActiveConversationId(conversation.id)
          conversationId = conversation.id
        } else {
          throw new Error("Failed to create conversation")
        }
      } catch (error) {
        console.error("Failed to create conversation:", error)
        setIsLoading(false)
        setIsCreatingConversation(false)
        return
      } finally {
        setIsCreatingConversation(false)
      }
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          conversationId,
        }),
      })

      const data = await response.json()

      const assistantContent = !response.ok
        ? data.error || "Sorry, something went wrong. Please try again."
        : data.response || "Analyzing brand perception..."

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: assistantContent,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      if (typeof data.used === "number") {
        setQueriesUsed(data.used)
      }

      if (data.conversationId && !activeConversationId) {
        setActiveConversationId(data.conversationId)
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Failed to connect to the server. Please check your connection and try again.",
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportPDF = useCallback(() => {
    window.print()
  }, [])

  const handleShare = useCallback(async () => {
    if (!activeConversationId) return
    const url = `${window.location.origin}/chat?id=${activeConversationId}`
    try {
      await navigator.clipboard.writeText(url)
      alert("Link copied to clipboard!")
    } catch {
      alert("Failed to copy link")
    }
  }, [activeConversationId])

  const handleExportMessagePDF = useCallback((content: string) => {
    const brandName = extractBrandFromContent(content)
    const analysis = parseAnalysisFromMessage(content, brandName)
    generateBrandAnalysisPDF(analysis)
  }, [])

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return ""
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-slate-100 print:bg-white print:text-black">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-zinc-900 border-r border-zinc-800 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 print:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Radar className="h-5 w-5 text-amber-400" />
              <span className="font-semibold">AI Brand Chat</span>
            </div>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-3">
            <Button
              onClick={handleNewConversation}
              disabled={isCreatingConversation}
              className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-900 font-medium"
            >
              {isCreatingConversation ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              New Conversation
            </Button>
          </div>

          <div className="px-3 pb-3">
            <div className="bg-zinc-800/50 rounded-lg px-3 py-2 text-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span>Queries used</span>
                <span className="text-amber-400 font-medium">
                  {queriesUsed}/{queriesLimit}
                </span>
              </div>
              <div className="mt-2 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((queriesUsed / queriesLimit) * 100, 100)}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-slate-500 capitalize">{userPlan} plan</div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-3">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Recent Conversations</div>
            <div className="space-y-1">
              {conversations.length === 0 ? (
                <div className="text-sm text-slate-500 py-4 text-center">No conversations yet</div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={cn(
                      "group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                      activeConversationId === conversation.id
                        ? "bg-zinc-800 text-slate-100"
                        : "hover:bg-zinc-800/50 text-slate-400",
                    )}
                    onClick={() => setActiveConversationId(conversation.id)}
                  >
                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1 truncate text-sm">{conversation.title}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteConversation(conversation.id)
                      }}
                    >
                      <Trash2 className="h-3 w-3 text-red-400" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3 border-t border-zinc-800">
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-400 hover:text-slate-100"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </aside>

      {/* Main chat area */}
      <main className="flex-1 flex flex-col min-w-0 print:block">
        <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/50 print:hidden">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-lg">
              {activeConversationId
                ? conversations.find((c) => c.id === activeConversationId)?.title || "Chat"
                : "New Chat"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {messages.some((m) => m.role === "assistant") && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerate}
                disabled={isLoading}
                className="border-zinc-700 text-slate-300 hover:bg-zinc-800 bg-transparent"
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                Regenerate
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              disabled={messages.length === 0}
              className="border-zinc-700 text-slate-300 hover:bg-zinc-800 bg-transparent"
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              disabled={!activeConversationId}
              className="border-zinc-700 text-slate-300 hover:bg-zinc-800 bg-transparent"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center animate-in fade-in duration-500">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mb-6 animate-pulse">
                  <Radar className="h-10 w-10 text-amber-400" />
                </div>
                <h2 className="text-2xl font-semibold text-slate-100 mb-3">AI Brand Analysis Chat</h2>
                <p className="text-slate-400 max-w-md mb-8">
                  Ask me anything about how brands are perceived by AI systems like ChatGPT, Claude, and Gemini.
                </p>

                <div className="w-full max-w-lg mb-8">
                  <p className="text-sm text-slate-500 mb-3">Quick analyze:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {QUICK_BRANDS.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => handleQuickBrand(brand)}
                        className="px-4 py-2 text-sm rounded-full border border-zinc-700 hover:border-amber-500 hover:bg-amber-500/10 transition-all text-slate-300 hover:text-amber-400"
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                  {[
                    "How is Nike perceived by ChatGPT?",
                    "Compare Apple vs Samsung in AI",
                    "What's Tesla's share of voice?",
                    "How can I improve my AI presence?",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="px-4 py-3 text-sm text-left bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 rounded-xl transition-all text-slate-300"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-4 transition-all duration-300",
                    message.role === "user" ? "justify-end" : "justify-start",
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {message.role === "assistant" && (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
                      <Radar className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <div className={cn("flex flex-col max-w-[80%]", message.role === "user" && "items-end")}>
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 shadow-sm",
                        message.role === "user"
                          ? "bg-amber-500 text-zinc-900"
                          : "bg-zinc-800 border border-zinc-700 text-slate-100",
                      )}
                    >
                      {message.role === "assistant" ? (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          className="prose prose-sm prose-invert max-w-none prose-headings:text-amber-400 prose-headings:font-semibold prose-p:text-slate-200 prose-p:leading-relaxed prose-strong:text-amber-300 prose-li:text-slate-300 prose-a:text-amber-400 prose-code:bg-zinc-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-amber-300 prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-700"
                          components={{
                            table: ({ children }) => (
                              <div className="overflow-x-auto my-4">
                                <table className="min-w-full divide-y divide-zinc-700 border border-zinc-700 rounded-lg">
                                  {children}
                                </table>
                              </div>
                            ),
                            th: ({ children }) => (
                              <th className="px-3 py-2 bg-zinc-800 text-left text-xs font-semibold text-amber-400 uppercase tracking-wider">
                                {children}
                              </th>
                            ),
                            td: ({ children }) => (
                              <td className="px-3 py-2 text-sm text-slate-300 border-t border-zinc-700">{children}</td>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 px-2">
                      <span className="text-xs text-slate-500">{formatTime(message.timestamp)}</span>
                      {message.role === "assistant" && (
                        <>
                          <button
                            onClick={() => handleCopyMessage(message.id, message.content)}
                            className="text-slate-500 hover:text-slate-300 transition-colors"
                            title="Copy message"
                          >
                            {copiedMessageId === message.id ? (
                              <Check className="h-3.5 w-3.5 text-green-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                          {isBrandAnalysisMessage(message.content) && (
                            <button
                              onClick={() => handleExportMessagePDF(message.content)}
                              className="text-slate-500 hover:text-amber-400 transition-colors flex items-center gap-1"
                              title="Export as PDF Report"
                            >
                              <FileDown className="h-3.5 w-3.5" />
                              <span className="text-xs">PDF</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  {message.role === "user" && (
                    <div className="w-10 h-10 rounded-xl bg-zinc-700 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-slate-300">You</span>
                    </div>
                  )}
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex gap-4 justify-start transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
                  <Radar className="h-5 w-5 text-white animate-pulse" />
                </div>
                <div className="bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3">
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="border-t border-zinc-800 bg-zinc-900/50 p-4 print:hidden">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                  }}
                  placeholder="Ask about any brand's AI presence..."
                  rows={1}
                  className="w-full resize-none bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  style={{ minHeight: "48px", maxHeight: "200px" }}
                />
              </div>
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={cn(
                  "bg-amber-500 hover:bg-amber-600 text-zinc-900 h-12 w-12 rounded-xl transition-all",
                  isLoading && "animate-pulse",
                )}
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              AI responses are for informational purposes. Verify important insights with your own research.
            </p>
          </form>
        </div>
      </main>
    </div>
  )
}
