"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useData } from "@/lib/data-context"
import { ConversationList } from "@/components/messaging/conversation-list"
import { ChatWindow } from "@/components/messaging/chat-window"
import { cn } from "@/lib/utils"

interface BuyerMessagesPanelProps {
  className?: string
}

export function BuyerMessagesPanel({ className }: BuyerMessagesPanelProps) {
  const { user } = useAuth()
  const { conversations, messages, sendMessage, users } = useData()
  const [selectedConvId, setSelectedConvId] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!user) return

    const buyerConversations = conversations.filter((conversation) =>
      conversation.participantIds.includes(user.id),
    )

    if (buyerConversations.length === 0) {
      setSelectedConvId(undefined)
      return
    }

    if (!selectedConvId || !buyerConversations.some((conversation) => conversation.id === selectedConvId)) {
      setSelectedConvId(buyerConversations[0].id)
    }
  }, [user, conversations, selectedConvId])

  if (!user) {
    return null
  }

  const currentUserId = user.id
  const buyerConversations = conversations.filter((conversation) =>
    conversation.participantIds.includes(currentUserId),
  )

  const selectedConv = conversations.find((conversation) => conversation.id === selectedConvId)
  const otherParticipantId = selectedConv?.participantIds.find((id) => id !== currentUserId)
  const otherParticipant = users.find((u) => u.id === otherParticipantId)
  const currentMessages = messages.filter((message) => message.conversationId === selectedConvId)

  const handleSendMessage = (content: string) => {
    if (selectedConvId) {
      sendMessage(selectedConvId, currentUserId, content)
    }
  }

  return (
    <div className={cn("flex flex-col overflow-hidden rounded-xl border bg-card md:flex-row", className)}>
      <div className="h-56 w-full md:h-auto md:w-80 md:flex-shrink-0">
        <ConversationList
          conversations={buyerConversations}
          selectedId={selectedConvId}
          onSelect={setSelectedConvId}
          currentUserId={currentUserId}
        />
      </div>
      <div className="min-h-[420px] flex-1">
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
