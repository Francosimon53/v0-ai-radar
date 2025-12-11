import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"

let supabaseClient: ReturnType<typeof createSupabaseBrowserClient> | null = null

export function createClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[v0] Missing Supabase environment variables:", {
      hasUrl: !!supabaseUrl,
      hasAnonKey: !!supabaseAnonKey,
    })
    throw new Error("Missing Supabase configuration")
  }

  supabaseClient = createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey)
  return supabaseClient
}

export const createBrowserClient = createClient
