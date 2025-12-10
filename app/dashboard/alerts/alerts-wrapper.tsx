"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

// This is required because ssr: false cannot be used in server components
const AlertsClient = dynamic(() => import("./alerts-client"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[400px] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
})

export default function AlertsWrapper() {
  return <AlertsClient />
}
