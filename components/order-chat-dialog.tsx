"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useData } from "@/lib/data-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Truck, X } from "lucide-react"
import type { Order, ChatMessage } from "@/lib/types"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface OrderChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order | null
}

export function OrderChatDialog({ open, onOpenChange, order }: OrderChatDialogProps) {
  const { user } = useAuth()
  const { users, messages, sendMessage, startConversation, updateOrderStatus } = useData()
  const { toast } = useToast()

  const [conversationId, setConversationId] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState("")

  // Trouver l'autre participant
  const otherParticipantId = order
    ? order.farmerId === user?.id
      ? order.buyerId
      : order.farmerId
    : null

  const otherParticipant = users.find((u) => u.id === otherParticipantId)

  // Trouver ou créer la conversation quand la commande est confirmée
  useEffect(() => {
    if (!open || !order || !user) return

    // Créer la conversation entre l'agriculteur et l'acheteur
    const otherId = order.farmerId === user.id ? order.buyerId : order.farmerId
    const otherName = order.farmerId === user.id ? order.buyerName : order.farmerName

    if (otherId.startsWith("guest-")) {
      // Pour les invités, on utilise un ID de conversation basé sur la commande
      const guestConvId = `conv-order-${order.id}`
      setConversationId(guestConvId)
      return
    }

    const convId = startConversation([user.id, otherId], [user.name, otherName])
    setConversationId(convId)
  }, [open, order, user])

  // Vérifier si la commande est livrée pour fermer le chat
  useEffect(() => {
    if (order?.status === "delivered" && open) {
      // Fermer le chat
      onOpenChange(false)
    }
  }, [order?.status, open, onOpenChange])

  if (!order || !user) return null

  const currentMessages: ChatMessage[] = conversationId
    ? messages.filter((m) => m.conversationId === conversationId)
    : []

  // Pour les commandes invitées, on génère des messages depuis localStorage
  const guestMessages: ChatMessage[] = conversationId?.startsWith("conv-order-")
    ? (() => {
        const stored = localStorage.getItem(`agrimarche_order_chat_${order.id}`)
        return stored ? JSON.parse(stored) : []
      })()
    : []

  const allMessages = conversationId?.startsWith("conv-order-") ? guestMessages : currentMessages

  const handleSendMessage = () => {
    if (!inputValue.trim() || !conversationId) return

    if (conversationId.startsWith("conv-order-")) {
      // Message pour une commande invité
      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        conversationId,
        senderId: user.id,
        content: inputValue.trim(),
        timestamp: new Date().toISOString(),
        read: false,
      }
      const stored = localStorage.getItem(`agrimarche_order_chat_${order.id}`)
      const existing = stored ? JSON.parse(stored) : []
      localStorage.setItem(`agrimarche_order_chat_${order.id}`, JSON.stringify([...existing, newMessage]))
    } else {
      sendMessage(conversationId, user.id, inputValue.trim())
    }

    setInputValue("")
  }

  const handleMarkDelivered = () => {
    updateOrderStatus(order.id, "delivered")
    toast({
      title: "Commande livrée",
      description: `La commande de ${order.buyerName} pour "${order.productName}" a été marquée comme livrée.`,
    })
    // Le useEffect ci-dessus fermera le chat
  }

  const isFarmer = order.farmerId === user.id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-1rem)] max-[360px]:w-[calc(100%-0.75rem)] sm:max-w-lg flex flex-col h-[70vh] max-[360px]:h-[75vh] sm:h-[70vh] max-h-[85dvh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-3 max-[360px]:p-2.5 sm:p-4 border-b bg-card shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 max-[360px]:gap-1.5 sm:gap-3 min-w-0">
              <Avatar className="h-8 w-8 max-[360px]:h-7 max-[360px]:w-7 sm:h-10 sm:w-10 shrink-0">
                <AvatarImage src={otherParticipant?.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm max-[360px]:text-xs">
                  {(otherParticipant?.name || order.buyerName).charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <DialogTitle className="text-sm max-[360px]:text-xs sm:text-base truncate">
                  {otherParticipant?.name || order.buyerName}
                </DialogTitle>
                <DialogDescription className="text-[11px] max-[360px]:text-[10px] sm:text-xs truncate">
                  {order.productName} · {order.quantity} unités · {order.totalPrice.toFixed(2)} FC
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-1 max-[360px]:gap-1 sm:gap-2 shrink-0">
              {isFarmer && order.status === "confirmed" && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleMarkDelivered}
                  className="gap-1 sm:gap-1.5 h-8 max-[360px]:h-7 text-xs max-[360px]:text-[11px] px-2 max-[360px]:px-1.5 sm:px-3"
                >
                  <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Marquer livré</span>
                  <span className="xs:hidden">Livré</span>
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8 max-[360px]:h-7 max-[360px]:w-7 shrink-0" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
                <span className="sr-only">Fermer</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-2.5 max-[360px]:p-2 sm:p-4 min-h-0">
          <div className="flex flex-col gap-3 max-[360px]:gap-2 sm:gap-4">
            {allMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-6 max-[360px]:py-4 sm:py-8 text-center px-2">
                <div className="bg-muted p-3 max-[360px]:p-2.5 sm:p-4 rounded-full mb-3">
                  <Send className="h-5 w-5 max-[360px]:h-4 max-[360px]:w-4 sm:h-6 sm:w-6" />
                </div>
                <p className="text-xs max-[360px]:text-[11px] sm:text-sm leading-relaxed">
                  Envoyez un message à {otherParticipant?.name || order.buyerName} pour discuter de votre commande.
                </p>
              </div>
            )}
            {allMessages.map((msg) => {
              const isMe = msg.senderId === user.id
              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[85%] max-[360px]:max-w-[88%] sm:max-w-[80%]",
                    isMe ? "self-end items-end" : "self-start items-start"
                  )}
                >
                  <div
                    className={cn(
                      "px-3 max-[360px]:px-2.5 sm:px-4 py-1.5 max-[360px]:py-1 sm:py-2 rounded-2xl max-[360px]:rounded-xl text-xs max-[360px]:text-[13px] sm:text-sm shadow-sm break-words",
                      isMe
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-muted text-foreground rounded-tl-none"
                    )}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] max-[360px]:text-[9px] text-muted-foreground mt-1 px-1">
                    {format(new Date(msg.timestamp), "HH:mm", { locale: fr })}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Input */}
        <div className="p-2.5 max-[360px]:p-2 sm:p-4 border-t bg-card shrink-0">
          <div className="flex gap-1.5 max-[360px]:gap-1 sm:gap-2 items-end">
            <Input
              placeholder="Écrivez votre message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1 rounded-full px-4 max-[360px]:px-3 sm:px-6 h-9 max-[360px]:h-8 sm:h-10 text-sm max-[360px]:text-xs focus-visible:ring-primary"
            />
            <Button
              onClick={handleSendMessage}
              size="icon"
              className="rounded-full shrink-0 h-9 w-9 max-[360px]:h-8 max-[360px]:w-8 sm:h-10 sm:w-10"
              disabled={!inputValue.trim()}
            >
              <Send className="h-3.5 w-3.5 max-[360px]:h-3 max-[360px]:w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}