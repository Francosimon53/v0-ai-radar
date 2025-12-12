import DashboardClient from "./dashboard-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function generateMetadata() {
  return {
    title: "Dashboard - AI Radar v3.0",
    description: "AI Brand Intelligence Dashboard",
  }
}

export default function DashboardPage() {
  return <DashboardClient />
}
