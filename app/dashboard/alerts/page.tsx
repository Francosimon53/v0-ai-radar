import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

// This prevents Recharts from being executed during server-side rendering
const AlertsClient = dynamic(() => import("./alerts-client"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[400px] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
})

export default function AlertsPage() {
  return <AlertsClient />
}
