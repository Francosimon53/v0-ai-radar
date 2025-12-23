import AnalyticsClient from "./analytics-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function generateMetadata() {
  return {
    title: "Analytics - AI Radar",
    description: "Brand perception analysis insights and statistics",
  }
}

export default function AnalyticsPage() {
  return <AnalyticsClient />
}
