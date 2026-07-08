"use client"

import { useState } from "react"
import { useData } from "@/lib/data-context"
import { ConversationList } from "@/components/messaging/conversation-list"
import { ChatWindow } from "@/components/messaging/chat-window"

export default function FarmerMessagesPage() {
  const { conversations, messages, sendMessage, users } = useData()
  const [selectedConvId, setSelectedConvId] = useState<string | undefined>(
    conversations.find(c => c.participantIds.includes("farmer-1"))?.id
  )

  const currentUserId = "farmer-1" // Simulate logged in farmer
  
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
    <div className="flex h-[calc(100vh-140px)] rounded-xl border bg-card overflow-hidden">
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
  )
}
