import type React from "react"
import { Loader2 } from "lucide-react"
import DashboardLayoutClient from "./layout-client"
import { Suspense } from "react"

export const dynamic = "force-dynamic"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#050507]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </Suspense>
  )
}
