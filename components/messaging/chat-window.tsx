"use client"

import { useState, useRef, useEffect, type ReactNode } from "react"
import { ChatMessage, User } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, User as UserIcon, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface ChatWindowProps {
  messages: ChatMessage[]
  otherParticipant: User | undefined
  currentUserId: string
  onSendMessage: (content: string) => void
  headerAction?: ReactNode
  onBack?: () => void
}

export function ChatWindow({
  messages,
  otherParticipant,
  currentUserId,
  onSendMessage,
  headerAction,
  onBack,
}: ChatWindowProps) {
  const [inputValue, setInputValue] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim())
      setInputValue("")
    }
  }

  if (!otherParticipant) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-muted/20 p-4 text-center">
        <div className="bg-muted p-4 max-[360px]:p-3 sm:p-6 rounded-full mb-3 sm:mb-4">
          <UserIcon className="w-8 h-8 max-[360px]:w-6 max-[360px]:h-6 sm:w-12 sm:h-12" />
        </div>
        <p className="text-sm max-[360px]:text-xs sm:text-lg px-2">Sélectionnez une conversation pour commencer</p>
        <p className="text-xs max-[360px]:text-[11px] text-muted-foreground mt-1 sm:hidden">Choisissez un contact dans la liste</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background min-h-0">
      {/* Header */}
      <div className="p-2.5 max-[360px]:p-2 sm:p-4 border-b flex items-center gap-2 max-[360px]:gap-1.5 sm:gap-3 bg-card shrink-0">
        {onBack && (
          <Button variant="ghost" size="icon" className="md:hidden shrink-0 h-8 w-8 max-[360px]:h-7 max-[360px]:w-7" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        )}
        <div className="relative shrink-0">
          <Avatar className="h-8 w-8 max-[360px]:h-7 max-[360px]:w-7 sm:h-10 sm:w-10">
            <AvatarImage src={otherParticipant.avatar} />
            <AvatarFallback className="text-sm max-[360px]:text-xs">{otherParticipant.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="absolute bottom-0 right-0 h-2 w-2 max-[360px]:h-1.5 max-[360px]:w-1.5 sm:h-2.5 sm:w-2.5 rounded-full bg-emerald-400 ring-2 ring-card" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm max-[360px]:text-xs sm:text-base text-foreground truncate">{otherParticipant.name}</h3>
          <p className="text-[11px] max-[360px]:text-[10px] sm:text-xs text-muted-foreground">En ligne</p>
        </div>
        {headerAction && <div className="shrink-0">{headerAction}</div>}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2.5 max-[360px]:p-2 sm:p-4">
        <div className="flex flex-col gap-3 max-[360px]:gap-2 sm:gap-4">
          {messages.map((msg) => {
            const isMe = msg.senderId === currentUserId
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
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 rounded-full px-4 max-[360px]:px-3 sm:px-6 py-2 h-9 max-[360px]:h-8 sm:h-10 text-sm max-[360px]:text-xs focus-visible:ring-primary"
          />
          <Button 
            onClick={handleSend} 
            size="icon" 
            className="rounded-full shrink-0 h-9 w-9 max-[360px]:h-8 max-[360px]:w-8 sm:h-10 sm:w-10"
            disabled={!inputValue.trim()}
          >
            <Send className="w-3.5 h-3.5 max-[360px]:w-3 max-[360px]:h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
