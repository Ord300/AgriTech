"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useData } from "@/lib/data-context"
import { ORDER_STATUS_LABELS, type Order } from "@/lib/types"
import { Calendar, Check, MessageSquare, Package, Phone, Smartphone, Truck, User, X } from "lucide-react"

interface OrderDetailsDialogProps {
  order: Order | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onContact: (order: Order) => void
  onUpdateStatus: (orderId: string, status: Order["status"]) => void
}

export function OrderDetailsDialog({
  order,
  open,
  onOpenChange,
  onContact,
  onUpdateStatus,
}: OrderDetailsDialogProps) {
  const { transactions } = useData()
  const [confirmReject, setConfirmReject] = useState(false)

  useEffect(() => {
    if (!open) setConfirmReject(false)
  }, [open])

  if (!order) return null

  const transaction = transactions.find((t) => t.orderIds.includes(order.id))
  const unitPrice = order.quantity > 0 ? order.totalPrice / order.quantity : order.totalPrice
  // Le rejet est possible à tout moment tant que la commande n'est pas livrée ou déjà annulée
  const canReject = order.status === "pending" || order.status === "confirmed"
  // Contacter l'acheteur est possible à tout moment (y compris avant confirmation)
  const canContact = order.status === "pending" || order.status === "confirmed"

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="farmer-theme text-foreground w-[calc(100%-1rem)] sm:max-w-md sm:w-full max-h-[92vh] flex flex-col gap-0 p-0">
        <DialogHeader className="shrink-0 border-b border-white/5 px-4 pb-4 pt-5 sm:px-6 sm:pt-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <DialogTitle className="text-left text-base sm:text-lg">Détails de la commande</DialogTitle>
            <Badge variant={getStatusBadgeVariant(order.status)} className="w-fit shrink-0">{ORDER_STATUS_LABELS[order.status]}</Badge>
          </div>
          <DialogDescription className="text-left text-xs sm:text-sm">Commande #{order.id}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[60vh] px-4 sm:px-6">
        <div className="space-y-4 py-2">
          {/* Produit */}
          <div className="rounded-lg border p-4">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Package className="h-4 w-4 text-primary" />
              Produit
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Produit</span>
                <span className="font-medium">{order.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantité</span>
                <span className="font-medium">{order.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prix unitaire</span>
                <span className="font-medium">{unitPrice.toFixed(2)} FC</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between">
                <span className="font-medium">Total</span>
                <span className="font-bold text-primary">{order.totalPrice.toFixed(2)} FC</span>
              </div>
            </div>
          </div>

          {/* Acheteur */}
          <div className="rounded-lg border p-4">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <User className="h-4 w-4 text-primary" />
              Acheteur
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Nom</span>
                <span className="font-medium">{order.buyerName}</span>
              </div>
              {order.buyerPhone && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    Téléphone
                  </span>
                  <span className="font-medium">{order.buyerPhone}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Commandé le
                </span>
                <span className="font-medium">
                  {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Paiement Mobile Money associé */}
          {transaction && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Smartphone className="h-4 w-4 text-primary" />
                Paiement {transaction.method === "mpesa" ? "M-Pesa" : "Orange Money"}
              </h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>
                  Référence : <span className="font-mono">{transaction.reference}</span>
                </p>
                <p>
                  Net perçu : <span className="font-semibold text-primary">{transaction.farmerAmount.toFixed(2)} FC</span>
                  {" "}(commission plateforme : {transaction.commission.toFixed(2)} FC)
                </p>
              </div>
            </div>
          )}
        </div>
        </ScrollArea>

        <DialogFooter className="shrink-0 flex-col gap-2 border-t border-white/5 px-4 py-3 sm:px-6 sm:py-4">
          {/* Actions principales */}
          <div className="flex w-full flex-col gap-2">
            {order.status === "pending" && (
              <Button className="w-full gap-2" onClick={() => onUpdateStatus(order.id, "confirmed")}>
                <Check className="h-4 w-4" />
                Confirmer la commande
              </Button>
            )}
            {order.status === "confirmed" && (
              <Button variant="secondary" className="w-full gap-2" onClick={() => onUpdateStatus(order.id, "delivered")}>
                <Truck className="h-4 w-4" />
                Marquer livrée
              </Button>
            )}
            {canContact && (
              <Button variant="outline" className="w-full gap-2 bg-transparent" onClick={() => onContact(order)}>
                <MessageSquare className="h-4 w-4" />
                Contacter l&apos;acheteur
              </Button>
            )}
          </div>

          {/* Rejet possible à tout moment */}
          {canReject && !confirmReject && (
            <Button
              variant="ghost"
              className="w-full gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setConfirmReject(true)}
            >
              <X className="h-4 w-4" />
              Rejeter la commande
            </Button>
          )}
          {canReject && confirmReject && (
            <div className="w-full rounded-lg border border-destructive/30 bg-destructive/10 p-3">
              <p className="mb-2 text-center text-sm font-medium text-destructive">
                Confirmer le rejet de cette commande ?
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => setConfirmReject(false)}>
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={() => onUpdateStatus(order.id, "cancelled")}
                >
                  Oui, rejeter
                </Button>
              </div>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
