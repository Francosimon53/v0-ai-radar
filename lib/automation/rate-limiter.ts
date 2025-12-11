import { createServiceClient } from "@/lib/supabase/server"

export type PlanType = "free" | "starter" | "pro"

// Monthly analysis limits per plan
const PLAN_LIMITS: Record<PlanType, number> = {
  free: 1,
  starter: 4,
  pro: 30,
}

export interface UsageRecord {
  user_id: string
  action: string
  count: number
  period_start: string
}

/**
 * Get the start of the current billing period (first of the month)
 */
function getCurrentPeriodStart(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}

/**
 * Check if user has available quota for an action
 */
export async function checkRateLimit(
  userId: string,
  action: string,
  plan: PlanType,
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const supabase = createServiceClient()
  const periodStart = getCurrentPeriodStart()
  const limit = PLAN_LIMITS[plan]

  const { data, error } = await supabase
    .from("api_usage")
    .select("analyses_count")
    .eq("user_id", userId)
    .eq("month", periodStart.substring(0, 7)) // YYYY-MM format
    .single()

  if (error && error.code !== "PGRST116") {
    console.error("[RateLimiter] Error checking usage:", error)
    // Fail open - allow the action if we can't check
    return { allowed: true, remaining: limit, limit }
  }

  const currentCount = data?.analyses_count || 0
  const remaining = Math.max(0, limit - currentCount)
  const allowed = currentCount < limit

  return { allowed, remaining, limit }
}

/**
 * Record usage of an action
 */
export async function recordUsage(userId: string, action: string): Promise<void> {
  const supabase = createServiceClient()
  const month = new Date().toISOString().substring(0, 7) // YYYY-MM format

  // Try to update existing record
  const { data: existing } = await supabase
    .from("api_usage")
    .select("id, analyses_count")
    .eq("user_id", userId)
    .eq("month", month)
    .single()

  if (existing) {
    await supabase
      .from("api_usage")
      .update({ analyses_count: existing.analyses_count + 1 })
      .eq("id", existing.id)
  } else {
    await supabase.from("api_usage").insert({
      user_id: userId,
      month,
      analyses_count: 1,
    })
  }
}

/**
 * Get user's current plan from their profile
 */
export async function getUserPlan(userId: string): Promise<PlanType> {
  const supabase = createServiceClient()

  const { data } = await supabase.from("profiles").select("plan").eq("id", userId).single()

  return (data?.plan as PlanType) || "free"
}
