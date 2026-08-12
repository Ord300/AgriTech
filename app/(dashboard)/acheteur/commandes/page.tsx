"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useCart } from "@/lib/cart-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Leaf, ShoppingCart, LogOut, Menu } from "lucide-react"
import { BuyerOrdersPanel } from "@/components/buyer/orders-panel"
import { BuyerSidebar, BuyerMobileMenu } from "@/components/buyer/buyer-sidebar"
import { MessageNotifications } from "@/components/message-notifications"

export default function MesCommandesPage() {
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
      <div className="relative md:ml-64 flex flex-col">
        <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
              <Link href="/" className="flex items-center gap-2 md:hidden">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                  <Leaf className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">TerraFrais</span>
              </Link>
              <Badge variant="secondary" className="hidden md:inline-flex">Acheteur</Badge>
              <h1 className="hidden text-xl font-semibold md:block">Mes commandes</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-muted-foreground sm:inline">{user.name}</span>
              <Button
                variant="outline"
                size="icon"
                className="relative bg-transparent"
                onClick={() => setCartOpen(true)}
                aria-label="Ouvrir le panier"
              >
                <ShoppingCart className="h-4 w-4" />
                {totalItems > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground">
                    {totalItems}
                  </span>
                )}
              </Button>
              <MessageNotifications role="buyer" />
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Déconnexion</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground md:hidden">Mes commandes</h1>
              <p className="text-muted-foreground">Historique et détails de vos achats</p>
            </div>
            <Button asChild variant="outline" className="gap-2">
              <Link href="/acheteur">
                <ArrowLeft className="h-4 w-4" />
                Retour au tableau
              </Link>
            </Button>
          </div>

          <BuyerOrdersPanel />
        </main>
      </div>
    </div>
  )
}