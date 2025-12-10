import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import AlertsClient from "./alerts-client"

export default function AlertsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <AlertsClient />
    </Suspense>
  )
}
