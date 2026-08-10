import type React from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DataProvider } from "@/lib/data-context"
import { CartProvider } from "@/lib/cart-context"
import { CartSheet } from "@/components/cart-sheet"
import { CheckoutDialog } from "@/components/checkout-dialog"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DataProvider>
      <CartProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <CartSheet />
        <CheckoutDialog />
      </CartProvider>
    </DataProvider>
  )
}
