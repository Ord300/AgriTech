import type React from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DataProvider } from "@/lib/data-context"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DataProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </DataProvider>
  )
}
