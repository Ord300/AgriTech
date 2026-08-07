"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useData } from "@/lib/data-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { StarRating } from "@/components/star-rating"
import { OrderChatDialog } from "@/components/order-chat-dialog"
import { ORDER_STATUS_LABELS, type Order } from "@/lib/types"
import { ArrowRight, MessageSquare, ShoppingCart } from "lucide-react"
import { toast } from "sonner"

interface BuyerOrdersPanelProps {
  title?: string
  description?: string
  emptyMessage?: string
  className?: string
}

export function BuyerOrdersPanel({
  title = "Liste des commandes",
  description = "Retrouvez toutes vos commandes passées.",
  emptyMessage = "Aucune commande trouvée pour le moment.",
  className,
}: BuyerOrdersPanelProps) {
  const { user } = useAuth()
  const { orders, ratings, addRating } = useData()
  const [isRatingOpen, setIsRatingOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [stars, setStars] = useState(5)
  const [comment, setComment] = useState("")
  const [chatOrder, setChatOrder] = useState<Order | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)

  if (!user) {
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
    return ratings.some((r) => r.farmerId === farmerId && r.authorId === user.id)
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {buyerOrders.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">{emptyMessage}</p>
              <Button asChild variant="outline" className="mt-4 bg-transparent">
                <Link href="/marche">
                  Découvrir les produits
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {buyerOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{order.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.quantity} unités · {order.totalPrice.toFixed(2)} €
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
                      <Badge variant="outline" className="border-green-200 bg-green-50 text-green-600">
                        Déjà noté
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isRatingOpen} onOpenChange={setIsRatingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Noter l&apos;agriculteur</DialogTitle>
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
            <Button onClick={submitRating}>Envoyer l&apos;avis</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <OrderChatDialog
        open={isChatOpen}
        onOpenChange={setIsChatOpen}
        order={chatOrder}
      />
    </>
  )
}
