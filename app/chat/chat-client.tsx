"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
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
  Sparkles,
  ArrowLeft,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
}

interface ChatClientProps {
  initialConversations: Conversation[]
  userPlan: string
  queriesUsed: number
  queriesLimit: number
}

export function ChatClient({ initialConversations, userPlan, queriesUsed, queriesLimit }: ChatClientProps) {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [input, setInput] = useState("")
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, setMessages, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { conversationId: activeConversationId },
    }),
  })

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Load messages when conversation changes
  useEffect(() => {
    if (activeConversationId) {
      loadConversationMessages(activeConversationId)
    } else {
      setMessages([])
    }
  }, [activeConversationId, setMessages])

  const loadConversationMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`)
      if (response.ok) {
        const { messages: dbMessages } = await response.json()
        const formattedMessages = dbMessages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          parts: [{ type: "text", text: msg.content }],
        }))
        setMessages(formattedMessages)
      }
    } catch (error) {
      console.error("Failed to load messages:", error)
    }
  }

  const handleNewConversation = async () => {
    setIsCreatingConversation(true)
    try {
      const response = await fetch("/api/conversations", { method: "POST" })
      if (response.ok) {
        const { conversation } = await response.json()
        setConversations([conversation, ...conversations])
        setActiveConversationId(conversation.id)
        setMessages([])
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || status !== "ready") return

    // Create conversation if none exists
    if (!activeConversationId) {
      setIsCreatingConversation(true)
      try {
        const response = await fetch("/api/conversations", { method: "POST" })
        if (response.ok) {
          const { conversation } = await response.json()
          setConversations([conversation, ...conversations])
          setActiveConversationId(conversation.id)
          // Send message after conversation is created
          setTimeout(() => {
            sendMessage({ text: input })
            setInput("")
          }, 100)
        }
      } catch (error) {
        console.error("Failed to create conversation:", error)
      } finally {
        setIsCreatingConversation(false)
      }
      return
    }

    sendMessage({ text: input })
    setInput("")
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

  const isLoading = status === "streaming" || status === "submitted"

  return (
    <div className="flex h-screen bg-zinc-950 text-slate-100">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-zinc-900 border-r border-zinc-800 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              <span className="font-semibold">AI Brand Chat</span>
            </div>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* New Conversation Button */}
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

          {/* Query Usage Badge */}
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
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${Math.min((queriesUsed / queriesLimit) * 100, 100)}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-slate-500 capitalize">{userPlan} plan</div>
            </div>
          </div>

          {/* Conversation List */}
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

          {/* Back to Dashboard */}
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

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
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

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-amber-400" />
                </div>
                <h2 className="text-xl font-semibold text-slate-100 mb-2">AI Brand Analysis Chat</h2>
                <p className="text-slate-400 max-w-md mb-6">
                  Ask me anything about your brand&apos;s AI presence, competitor analysis, or strategies to improve
                  your visibility in AI responses.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                  {[
                    "How is my brand perceived by ChatGPT?",
                    "Compare my brand with competitors",
                    "What's my share of voice in AI?",
                    "How can I improve my AI presence?",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="px-4 py-3 text-sm text-left bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 rounded-lg transition-colors text-slate-300"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn("flex gap-4", message.role === "user" ? "justify-end" : "justify-start")}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3",
                      message.role === "user" ? "bg-amber-500 text-zinc-900" : "bg-zinc-800 text-slate-100",
                    )}
                  >
                    {message.parts?.map((part, index) => {
                      if (part.type === "text") {
                        return (
                          <div key={index} className="whitespace-pre-wrap text-sm leading-relaxed">
                            {part.text}
                          </div>
                        )
                      }
                      return null
                    })}
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium">You</span>
                    </div>
                  )}
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="bg-zinc-800 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Analyzing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
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
                  placeholder="Ask about your brand's AI presence..."
                  rows={1}
                  className="w-full resize-none bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 pr-12 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                  style={{ minHeight: "48px", maxHeight: "200px" }}
                />
              </div>
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-amber-500 hover:bg-amber-600 text-zinc-900 h-12 w-12 rounded-xl"
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

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .max-w-3xl,
          .max-w-3xl * {
            visibility: visible;
          }
          .max-w-3xl {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
        }
      `}</style>
    </div>
  )
}
