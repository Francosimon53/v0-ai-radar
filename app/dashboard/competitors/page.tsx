import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import CompetitorsClient from "./competitors-client"

export const dynamic = "force-dynamic"

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
    </div>
  )
}

export default function CompetitorsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CompetitorsClient />
    </Suspense>
  )
}
