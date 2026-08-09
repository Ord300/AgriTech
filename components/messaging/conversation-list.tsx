"use client"

import { useState } from "react"
import { Conversation } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface ConversationListProps {
  conversations: Conversation[]
  selectedId?: string
  onSelect: (id: string) => void
  currentUserId: string
}

export function ConversationList({ 
  conversations, 
  selectedId, 
  onSelect,
  currentUserId
}: ConversationListProps) {
  return (
    <div className="flex flex-col h-full border-r">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold text-foreground">Messages</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col">
          {conversations.map((conv) => {
            const otherParticipantName = conv.participantNames.find(
              (_, i) => conv.participantIds[i] !== currentUserId
            )
            const isSelected = selectedId === conv.id

            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={cn(
                  "flex items-start gap-3 p-4 text-left hover:bg-accent transition-colors border-b last:border-b-0",
                  isSelected && "bg-accent"
                )}
              >
                <Avatar>
                  <AvatarFallback>{otherParticipantName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-medium truncate text-foreground">{otherParticipantName}</span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {format(new Date(conv.lastMessageAt), "HH:mm", { locale: fr })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate italic">
                    {conv.lastMessage}
                  </p>
                </div>
                {conv.unreadCount > 0 && (
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                )}
              </button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
