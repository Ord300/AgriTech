"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useData } from "@/lib/data-context"
import { useCart } from "@/lib/cart-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ORDER_STATUS_LABELS } from "@/lib/types"
import { Leaf, ShoppingCart, Package, TrendingUp, LogOut, Home, ArrowRight, Menu, MessageSquare } from "lucide-react"
import { MessageNotifications } from "@/components/message-notifications"
import { BuyerOrdersPanel } from "@/components/buyer/orders-panel"
import { BuyerMessagesPanel } from "@/components/buyer/messages-panel"

export default function BuyerDashboard() {
  const { user, logout, isLoading } = useAuth()
  const { orders } = useData()
  const { totalItems, setCartOpen } = useCart()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Chargement...</div>
  }

  if (!user || user.role !== "buyer") {
    router.push("/connexion")
    return null
  }

  const buyerOrders = orders.filter((o) => o.buyerId === user.id)
  const recentOrders = buyerOrders.slice(0, 3)
  const totalSpent = buyerOrders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.totalPrice, 0)
  const pendingOrders = buyerOrders.filter((o) => o.status === "pending")

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default"
      case "delivered":
        return "secondary"
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  const openTab = (tab: string) => {
    setActiveTab(tab)
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">TerraFrais</span>
            </Link>
            <Badge variant="secondary" className="max-[374px]:hidden">Acheteur</Badge>
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
            <div className="hidden items-center gap-1 sm:flex">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                  <Home className="h-5 w-5" />
                  <span className="sr-only">Accueil</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Déconnexion</span>
              </Button>
            </div>
            <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="sticky top-16 z-40 border-t border-b bg-card p-4 sm:hidden">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 pb-3 border-b">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                <span className="text-sm font-medium text-primary-foreground">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-sm">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
            </div>
            <nav className="flex flex-col gap-2">
              <Button variant="ghost" className="justify-start gap-2" asChild onClick={() => setMobileMenuOpen(false)}>
                <Link href="/marche">
                  <ShoppingCart className="h-4 w-4" />
                  Explorer le marché
                </Link>
              </Button>
              <Button variant="ghost" className="justify-start gap-2" onClick={() => openTab("orders")}>
                <Package className="h-4 w-4" />
                Mes commandes
              </Button>
              <Button variant="ghost" className="justify-start gap-2" onClick={() => openTab("messages")}>
                <MessageSquare className="h-4 w-4" />
                Messages
              </Button>
              <Button variant="ghost" className="justify-start gap-2" asChild onClick={() => setMobileMenuOpen(false)}>
                <Link href="/">
                  <Home className="h-4 w-4" />
                  Accueil
                </Link>
              </Button>
              <Button variant="ghost" className="justify-start gap-2" asChild onClick={() => setMobileMenuOpen(false)}>
                <Link href="/acheteur/support">
                  <MessageSquare className="h-4 w-4" />
                  Support
                </Link>
              </Button>
              <Button variant="ghost" className="justify-start gap-2 text-destructive hover:text-destructive" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
            </nav>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mon Espace</h1>
            <p className="text-muted-foreground">Bienvenue, {user.name}</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="gap-2">
              <Link href="/acheteur/support">
                <MessageSquare className="h-4 w-4" />
                Support
              </Link>
            </Button>
            <Button asChild className="gap-2">
              <Link href="/marche">
                <ShoppingCart className="h-4 w-4" />
                Explorer le marché
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{buyerOrders.length}</p>
                <p className="text-sm text-muted-foreground">Commandes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/50">
                <ShoppingCart className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingOrders.length}</p>
                <p className="text-sm text-muted-foreground">En attente</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                <TrendingUp className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalSpent.toFixed(0)} €</p>
                <p className="text-sm text-muted-foreground">Total dépensé</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid h-auto w-full grid-cols-3 sm:w-fit">
            <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
            <TabsTrigger value="orders">Mes commandes</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Commandes récentes</CardTitle>
                <CardDescription>Un aperçu rapide de vos dernières commandes</CardDescription>
              </CardHeader>
              <CardContent>
                {recentOrders.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">Vous n&apos;avez pas encore passé de commande.</p>
                    <Button asChild variant="outline" className="mt-4 bg-transparent">
                      <Link href="/marche">
                        Découvrir les produits
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <p className="font-medium">{order.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.quantity} unités · {order.totalPrice.toFixed(2)} €
                          </p>
                          <p className="text-sm text-muted-foreground">Vendeur: {order.farmerName}</p>
                          <p className="text-xs text-muted-foreground">
                            Commandé le {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                        <Badge variant={getStatusBadgeVariant(order.status)}>{ORDER_STATUS_LABELS[order.status]}</Badge>
                      </div>
                    ))}
                    <div className="pt-2">
                      <Button variant="ghost" className="gap-2 px-0" onClick={() => setActiveTab("orders")}>
                        Gérer toutes mes commandes
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <BuyerOrdersPanel
              title="Mes commandes"
              description="Historique, suivi, chat et notation de vos achats"
            />
          </TabsContent>

          <TabsContent value="messages">
            <BuyerMessagesPanel className="h-[650px]" />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
