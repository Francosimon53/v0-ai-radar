import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { ChatClient } from "./chat-client"

export const metadata = {
  title: "AI Brand Chat | AI Radar",
  description: "Chat with AI to analyze your brand presence",
}

export default async function ChatPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch user's conversations
  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, title, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  // Fetch user's profile for query limits
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, queries_used, queries_limit")
    .eq("id", user.id)
    .single()

  return (
    <ChatClient
      initialConversations={conversations || []}
      userPlan={profile?.plan || "free"}
      queriesUsed={profile?.queries_used || 0}
      queriesLimit={profile?.queries_limit || 100}
    />
  )
}
