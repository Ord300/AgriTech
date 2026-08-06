"use client"

import { useAuth } from "@/lib/auth-context"
import { useData } from "@/lib/data-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Home, LogOut, MessageSquare } from "lucide-react"
import { ORDER_STATUS_LABELS, type Order } from "@/lib/types"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { StarRating } from "@/components/star-rating"
import { toast } from "sonner"
import { OrderChatDialog } from "@/components/order-chat-dialog"

export default function MesCommandesPage() {
  const { user, logout, isLoading } = useAuth()
  const { orders, ratings, addRating } = useData()
  const [isRatingOpen, setIsRatingOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [stars, setStars] = useState(5)
  const [comment, setComment] = useState("")
  const [chatOrder, setChatOrder] = useState<Order | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
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

  const handleRate = (order: Order) => {
    setSelectedOrder(order)
    setStars(5)
    setComment("")
    setIsRatingOpen(true)
  }

  const submitRating = () => {
    if (!selectedOrder || !user) return

    addRating({
      farmerId: selectedOrder.farmerId,
      authorId: user.id,
      authorName: user.name,
      stars,
      comment,
    })

    toast.success("Votre avis a été enregistré !")
    setIsRatingOpen(false)
  }

  const handleOpenChat = (order: Order) => {
    setChatOrder(order)
    setIsChatOpen(true)
  }

  const hasRated = (farmerId: string) => {
    return ratings.some((r) => r.farmerId === farmerId && r.authorId === user?.id)
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
                      <p className="text-sm text-muted-foreground">Agriculteur : {order.farmerName}</p>
                      <p className="text-xs text-muted-foreground">
                        Commandé le {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={getStatusBadgeVariant(order.status)}>{ORDER_STATUS_LABELS[order.status]}</Badge>
                      {order.status === "confirmed" && (
                        <Button size="sm" variant="outline" onClick={() => handleOpenChat(order)} className="gap-1.5">
                          <MessageSquare className="h-4 w-4" />
                          Chatter
                        </Button>
                      )}
                      {order.status === "delivered" && !hasRated(order.farmerId) && (
                        <Button size="sm" variant="outline" onClick={() => handleRate(order)}>
                          Noter
                        </Button>
                      )}
                      {hasRated(order.farmerId) && (
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Déjà noté</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={isRatingOpen} onOpenChange={setIsRatingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Noter l'agriculteur</DialogTitle>
            <DialogDescription>
              Votre avis aide les autres acheteurs et encourage les agriculteurs.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm font-medium">Votre note pour {selectedOrder?.farmerName}</span>
              <StarRating rating={stars} readonly={false} onChange={setStars} size="lg" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Votre commentaire</label>
              <Textarea 
                placeholder="Partagez votre expérience..." 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRatingOpen(false)}>Annuler</Button>
            <Button onClick={submitRating}>Envoyer l'avis</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Chat Dialog */}
      <OrderChatDialog
        open={isChatOpen}
        onOpenChange={setIsChatOpen}
        order={chatOrder}
      />
    </div>
  )
}
