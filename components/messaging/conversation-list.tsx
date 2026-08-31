"use client"

import { Conversation } from "@/lib/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { format, isToday, isYesterday } from "date-fns"
import { fr } from "date-fns/locale"
import { MessagesSquare } from "lucide-react"

interface ConversationListProps {
  conversations: Conversation[]
  selectedId?: string
  onSelect: (id: string) => void
  currentUserId: string
}

function formatConversationTime(date: string) {
  const d = new Date(date)
  if (isToday(d)) return format(d, "HH:mm", { locale: fr })
  if (isYesterday(d)) return "Hier"
  return format(d, "dd MMM", { locale: fr })
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  currentUserId
}: ConversationListProps) {
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

  return (
    <div className="flex flex-col h-full md:border-r border-white/5 bg-sidebar/40">
      <div className="p-3 max-[360px]:p-2.5 sm:p-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 max-[360px]:h-6 max-[360px]:w-6 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-primary/15 shrink-0">
            <MessagesSquare className="h-3.5 w-3.5 max-[360px]:h-3 max-[360px]:w-3 sm:h-4 sm:w-4 text-primary" />
          </div>
          <h2 className="text-sm max-[360px]:text-xs sm:text-base font-semibold text-foreground truncate">Conversations</h2>
          {totalUnread > 0 && (
            <Badge variant="outline" className="ml-auto border-primary/30 bg-primary/10 text-primary text-xs max-[360px]:text-[11px] px-1.5 py-0">
              {totalUnread}
            </Badge>
          )}
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col p-1.5 max-[360px]:p-1 sm:p-2 gap-1 max-[360px]:gap-0.5">
          {conversations.length === 0 && (
            <p className="p-4 max-[360px]:p-3 sm:p-6 text-xs sm:text-sm text-center text-muted-foreground">
              Aucune conversation pour le moment.
            </p>
          )}
          {conversations.map((conv) => {
            const otherIndex = conv.participantIds.findIndex((id) => id !== currentUserId)
            const otherParticipantName =
              otherIndex >= 0 ? conv.participantNames[otherIndex] : undefined
            const isSelected = selectedId === conv.id
            const hasUnread = conv.unreadCount > 0

            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={cn(
                  "group flex items-center gap-2.5 max-[360px]:gap-2 sm:gap-3 rounded-xl max-[360px]:rounded-lg p-2.5 max-[360px]:p-2 sm:p-3 text-left transition-colors",
                  "hover:bg-accent/70 active:bg-accent",
                  isSelected
                    ? "bg-primary/10 border border-primary/20"
                    : "border border-transparent",
                )}
              >
                <div className="relative shrink-0">
                  <Avatar
                    className={cn(
                      "h-9 w-9 max-[360px]:h-8 max-[360px]:w-8 sm:h-10 sm:w-10 transition-all",
                      isSelected ? "ring-2 ring-primary/50" : "",
                    )}
                  >
                    <AvatarFallback
                      className={cn(
                        "text-sm max-[360px]:text-xs",
                        hasUnread ? "bg-primary/20 text-primary font-semibold" : "",
                      )}
                    >
                      {otherParticipantName?.charAt(0) ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  {hasUnread && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 max-[360px]:h-3.5 max-[360px]:min-w-3.5 items-center justify-center rounded-full bg-primary px-1 text-[10px] max-[360px]:text-[9px] font-bold leading-none text-primary-foreground shadow-sm">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-1.5 sm:gap-2 mb-0.5">
                    <span
                      className={cn(
                        "truncate text-sm max-[360px]:text-xs",
                        hasUnread ? "font-semibold text-foreground" : "font-medium text-foreground/90",
                      )}
                    >
                      {otherParticipantName}
                    </span>
                    <span
                      className={cn(
                        "text-[11px] max-[360px]:text-[10px] whitespace-nowrap shrink-0",
                        hasUnread ? "text-primary font-medium" : "text-muted-foreground",
                      )}
                    >
                      {formatConversationTime(conv.lastMessageAt)}
                    </span>
                  </div>
                  <p className="text-xs max-[360px]:text-[11px] text-muted-foreground truncate">
                    {conv.lastMessage ?? "Nouvelle conversation"}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
