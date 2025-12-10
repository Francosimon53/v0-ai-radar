import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import AlertsWrapper from "./alerts-wrapper"

// The dynamic import with ssr: false is now in the client component (alerts-wrapper.tsx)
export default function AlertsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <AlertsWrapper />
    </Suspense>
  )
}
