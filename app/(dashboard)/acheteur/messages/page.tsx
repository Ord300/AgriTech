"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useData } from "@/lib/data-context"
import { useRouter } from "next/navigation"
import { ConversationList } from "@/components/messaging/conversation-list"
import { ChatWindow } from "@/components/messaging/chat-window"

export default function BuyerMessagesPage() {
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

  if (!user || user.role !== "buyer") {
    router.push("/connexion")
    return null
  }

  const currentUserId = user.id
  
  const buyerConversations = conversations.filter(c => 
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
    <div className="flex h-[calc(100vh-140px)] rounded-xl border bg-card overflow-hidden">
      <div className="w-80 flex-shrink-0">
        <ConversationList
          conversations={buyerConversations}
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
  )
}