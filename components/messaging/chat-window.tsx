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
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-muted/20">
        <div className="bg-muted p-6 rounded-full mb-4">
          <UserIcon className="w-12 h-12" />
        </div>
        <p className="text-lg">Sélectionnez une conversation pour commencer</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3 bg-card">
        {onBack && (
          <Button variant="ghost" size="icon" className="md:hidden shrink-0" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="relative">
          <Avatar>
            <AvatarImage src={otherParticipant.avatar} />
            <AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-card" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground">{otherParticipant.name}</h3>
          <p className="text-xs text-muted-foreground">En ligne</p>
        </div>
        {headerAction}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-4">
          {messages.map((msg) => {
            const isMe = msg.senderId === currentUserId
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col max-w-[80%]",
                  isMe ? "self-end items-end" : "self-start items-start"
                )}
              >
                <div
                  className={cn(
                    "px-4 py-2 rounded-2xl text-sm shadow-sm",
                    isMe
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-muted text-foreground rounded-tl-none"
                  )}
                >
                  {msg.content}
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 px-1">
                  {format(new Date(msg.timestamp), "HH:mm", { locale: fr })}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-card">
        <div className="flex gap-2">
          <Input
            placeholder="Écrivez votre message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 rounded-full px-6 focus-visible:ring-primary"
          />
          <Button 
            onClick={handleSend} 
            size="icon" 
            className="rounded-full shrink-0 h-10 w-10"
            disabled={!inputValue.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
