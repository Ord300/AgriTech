"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useCart } from "@/lib/cart-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Leaf, ShoppingCart, LogOut, Menu } from "lucide-react"
import { BuyerMessagesPanel } from "@/components/buyer/messages-panel"
import { BuyerSidebar, BuyerMobileMenu } from "@/components/buyer/buyer-sidebar"
import { MessageNotifications } from "@/components/message-notifications"

export default function BuyerMessagesPage() {
  const { user, logout, isLoading } = useAuth()
  const { totalItems, setCartOpen } = useCart()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "buyer")) {
      router.push("/connexion")
    }
  }, [isLoading, user, router])

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Chargement...</div>
  }

  if (!user || user.role !== "buyer") {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Desktop */}
      <BuyerSidebar />

      {/* Mobile Menu */}
      <BuyerMobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Content */}
      <div className="relative md:ml-64 flex flex-col min-h-[100dvh] overflow-x-hidden">
        <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="container mx-auto flex h-14 max-[360px]:h-12 sm:h-16 items-center justify-between gap-2 px-2.5 max-[360px]:px-2 sm:px-4">
            <div className="flex items-center gap-2 max-[360px]:gap-1.5 sm:gap-4">
              <Button variant="ghost" size="icon" className="md:hidden h-8 w-8 max-[360px]:h-7 max-[360px]:w-7 shrink-0" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sr-only">Menu</span>
              </Button>
              <Link href="/" className="flex items-center gap-1.5 sm:gap-2 md:hidden">
                <div className="flex h-7 w-7 max-[360px]:h-7 max-[360px]:w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-primary">
                  <Leaf className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
                </div>
                <span className="text-base max-[360px]:text-sm sm:text-xl font-bold">TerraFrais</span>
              </Link>
              <Badge variant="secondary" className="hidden md:inline-flex">Acheteur</Badge>
              <h1 className="hidden text-lg sm:text-xl font-semibold md:block">Messages</h1>
            </div>
            <div className="flex items-center gap-1.5 max-[360px]:gap-1 sm:gap-3 shrink-0">
              <span className="hidden text-sm text-muted-foreground sm:inline max-w-[100px] truncate">{user.name}</span>
              <Button
                variant="outline"
                size="icon"
                className="relative bg-transparent h-8 w-8 max-[360px]:h-7 max-[360px]:w-7 sm:h-9 sm:w-9"
                onClick={() => setCartOpen(true)}
                aria-label="Ouvrir le panier"
              >
                <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {totalItems > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 sm:-right-2 sm:-top-2 flex h-4 min-w-4 sm:h-5 sm:min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] sm:text-xs font-bold text-primary-foreground">
                    {totalItems}
                  </span>
                )}
              </Button>
              <MessageNotifications role="buyer" />
              <Button variant="ghost" size="icon" className="h-8 w-8 max-[360px]:h-7 max-[360px]:w-7 sm:h-9 sm:w-9" onClick={logout}>
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sr-only">Déconnexion</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-2.5 max-[360px]:px-2 sm:px-4 py-4 max-[360px]:py-3 sm:py-8 overflow-hidden">
          <h1 className="mb-4 max-[360px]:mb-3 sm:mb-6 text-xl max-[360px]:text-lg sm:text-3xl font-bold text-foreground md:hidden">Messages</h1>
          <BuyerMessagesPanel className="h-[calc(100dvh-160px)] max-[360px]:h-[calc(100dvh-130px)] sm:h-[calc(100vh-180px)]" />
        </main>
      </div>
    </div>
  )
}