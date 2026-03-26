import type React from "react"
import { DataProvider } from "@/lib/data-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DataProvider>{children}</DataProvider>
}
