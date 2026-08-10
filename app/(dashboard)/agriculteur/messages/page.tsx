"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useData } from "@/lib/data-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { ConversationList } from "@/components/messaging/conversation-list"
import { ChatWindow } from "@/components/messaging/chat-window"

export default function FarmerMessagesPage() {
  const { user, isLoading } = useAuth()
  const { conversations, messages, sendMessage, users } = useData()
  const router = useRouter()
  const [selectedConvId, setSelectedConvId] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (user && conversations.length > 0) {
      const firstConv = conversations.find(c => c.participantIds.includes(user.id))
      if (firstConv) {
        setSelectedConvId(firstConv.id)
      }
    }
  }, [user, conversations])

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Chargement...</div>
  }

  if (!user || user.role !== "farmer") {
    router.push("/connexion")
    return null
  }

  const currentUserId = user.id
  
  const farmerConversations = conversations.filter(c => 
    c.participantIds.includes(currentUserId)
  )

  const selectedConv = conversations.find(c => c.id === selectedConvId)
  const otherParticipantId = selectedConv?.participantIds.find(id => id !== currentUserId)
  const otherParticipant = users.find(u => u.id === otherParticipantId)
  
  const currentMessages = messages.filter(m => m.conversationId === selectedConvId)

  const handleSendMessage = (content: string) => {
    if (selectedConvId) {
      sendMessage(selectedConvId, currentUserId, content)
    }
  }

  return (
    <div className="farmer-theme min-h-screen bg-background text-foreground p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-lime-300" asChild>
            <Link href="/agriculteur">
              <ArrowLeft className="h-4 w-4" />
              Tableau de bord
            </Link>
          </Button>
          <h1 className="text-lg font-semibold">Messages</h1>
        </div>
        <div className="flex h-[calc(100vh-120px)] rounded-xl border border-white/5 bg-card/60 shadow-lg backdrop-blur-xl overflow-hidden">
          <div className="w-80 flex-shrink-0">
            <ConversationList
              conversations={farmerConversations}
              selectedId={selectedConvId}
              onSelect={setSelectedConvId}
              currentUserId={currentUserId}
            />
          </div>
          <div className="flex-1">
            <ChatWindow
              messages={currentMessages}
              otherParticipant={otherParticipant}
              currentUserId={currentUserId}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
