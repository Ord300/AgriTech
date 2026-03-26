"use client"

import { useAuth } from "@/lib/auth-context"
import { useData } from "@/lib/data-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Home, LogOut } from "lucide-react"
import { ORDER_STATUS_LABELS } from "@/lib/types"

export default function MesCommandesPage() {
  const { user, logout, isLoading } = useAuth()
  const { orders } = useData()
  const router = useRouter()

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Chargement...</div>
  }

  if (!user || user.role !== "buyer") {
    router.push("/connexion")
    return null
  }

  const buyerOrders = orders.filter((order) => order.buyerId === user.id)

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

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary" />
              <span className="text-xl font-bold">AgriMarché</span>
            </Link>
            <Badge variant="secondary" className="max-[374px]:hidden">Acheteur</Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{user.name}</span>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/acheteur">
                <Home className="h-5 w-5" />
                <span className="sr-only">Tableau de bord</span>
              </Link>
            </Button>
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
            <h1 className="text-3xl font-bold text-foreground">Mes commandes</h1>
            <p className="text-muted-foreground">Historique et détails de vos achats</p>
          </div>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/acheteur">
              <ArrowLeft className="h-4 w-4" />
              Retour au tableau
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des commandes</CardTitle>
            <CardDescription>Retrouvez toutes vos commandes passées.</CardDescription>
          </CardHeader>
          <CardContent>
            {buyerOrders.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-muted-foreground">Aucune commande trouvée pour le moment.</p>
                <Button asChild variant="outline" className="mt-4">
                  <Link href="/marche">Aller au marché</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {buyerOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">{order.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.quantity} unités • {order.totalPrice.toFixed(2)} €
                      </p>
                      <p className="text-sm text-muted-foreground">Vendeur : {order.farmerName}</p>
                      <p className="text-xs text-muted-foreground">
                        Commandé le {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(order.status)}>{ORDER_STATUS_LABELS[order.status]}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
