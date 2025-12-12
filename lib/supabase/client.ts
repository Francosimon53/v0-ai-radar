import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"

let supabaseClient: ReturnType<typeof createSupabaseBrowserClient> | null = null

export function createClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[v0] Missing Supabase environment variables")
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: new Error("Supabase not configured") }),
        signOut: async () => ({ error: null }),
        signInWithPassword: async () => ({
          data: { user: null, session: null },
          error: new Error("Supabase not configured"),
        }),
        signUp: async () => ({ data: { user: null, session: null }, error: new Error("Supabase not configured") }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: null }),
            eq: () => ({ single: async () => ({ data: null, error: null }) }),
          }),
          gte: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
        }),
        insert: async () => ({ data: null, error: null }),
        update: async () => ({ data: null, error: null }),
        delete: async () => ({ data: null, error: null }),
      }),
    } as any
  }

  supabaseClient = createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey)
  return supabaseClient
}

export const createBrowserClient = createClient
