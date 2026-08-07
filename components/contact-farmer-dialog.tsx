"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useData } from "@/lib/data-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { X, LogIn } from "lucide-react"
import type { User } from "@/lib/types"
import { ChatWindow } from "./messaging/chat-window"

interface ContactFarmerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  farmerId: string
  farmerName: string
}

export function ContactFarmerDialog({ open, onOpenChange, farmerId, farmerName }: ContactFarmerDialogProps) {
  const { user } = useAuth()
  const { users, messages, sendMessage, startConversation } = useData()
  const { toast } = useToast()

  const [conversationId, setConversationId] = useState<string | null>(null)

  const farmer = users.find((u) => u.id === farmerId)

  useEffect(() => {
    if (!open || !user || !farmerId) return

    // Allow ANY user (even guests if they had an ID, but here they must be logged in as they use user.id) to chat with the farmer.
    // If the user is the farmer themselves, it might not make sense, but we handle it.
    if (user.id === farmerId) {
      return
    }

    const convId = startConversation([user.id, farmerId], [user.name, farmerName])
    setConversationId(convId)
  }, [open, user, farmerId, farmerName, startConversation])

  if (!open) return null

  const currentMessages = conversationId
    ? messages.filter((m) => m.conversationId === conversationId)
    : []

  const handleSendMessage = (content: string) => {
    if (!conversationId || !user) return
    sendMessage(conversationId, user.id, content)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg flex flex-col h-[70vh] p-0 gap-0">
        <DialogHeader className="p-4 border-b bg-card hidden">
          <DialogTitle>Contacter {farmerName}</DialogTitle>
        </DialogHeader>
        
        {!user ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <LogIn className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Connexion requise</h3>
            <p className="text-muted-foreground">
              Vous devez être connecté pour contacter cet agriculteur.
            </p>
            <Button onClick={() => window.location.href = "/connexion"}>
              Se connecter
            </Button>
          </div>
        ) : user.id === farmerId ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4">
            <h3 className="text-xl font-semibold">C'est vous !</h3>
            <p className="text-muted-foreground">
              Vous ne pouvez pas vous envoyer de message à vous-même.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="absolute right-2 top-2 z-10 rounded-full bg-background/80 hover:bg-background"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Fermer</span>
            </Button>
            <ChatWindow
              messages={currentMessages}
              otherParticipant={farmer}
              currentUserId={user.id}
              onSendMessage={handleSendMessage}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
