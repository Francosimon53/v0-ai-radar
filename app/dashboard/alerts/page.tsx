import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import AlertsWrapper from "./alerts-wrapper"

export const dynamic = "force-dynamic"

function LoadingFallback() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}

export default function AlertsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AlertsWrapper />
    </Suspense>
  )
}
