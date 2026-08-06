"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useData } from "@/lib/data-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Bell, MessageSquare } from "lucide-react"

interface MessageNotificationsProps {
  role: "farmer" | "buyer" | "admin"
}

export function MessageNotifications({ role }: MessageNotificationsProps) {
  const { user } = useAuth()
  const { messages, conversations, notifications, markNotificationAsRead } = useData()
  const [showPanel, setShowPanel] = useState(false)
  const [readMessageIds, setReadMessageIds] = useState<Set<string>>(new Set())
  const panelRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [messageNotifications, setMessageNotifications] = useState<typeof notifications>([])

  // Charger les IDs de messages lus depuis localStorage
  useEffect(() => {
    const stored = localStorage.getItem("agrimarche_read_messages")
    if (stored) {
      setReadMessageIds(new Set(JSON.parse(stored)))
    }
  }, [])

  // Filtrer les notifications de messages pour l'utilisateur connecté
  useEffect(() => {
    if (!user) return
    setMessageNotifications(
      notifications.filter((n) => n.type === "user_registered" && n.title === "Nouveau message" && n.targetUser === user.name)
    )
  }, [notifications, user])

  // Fermer le panneau quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowPanel(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Trouver les messages non lus pour l'utilisateur
  const unreadMessages = (() => {
    if (!user) return 0
    
    // Compter les messages non lus dans les conversations de l'utilisateur
    const userConvIds = conversations
      .filter((c) => c.participantIds.includes(user.id))
      .map((c) => c.id)
    
    const unread = messages.filter((m) => {
      if (!userConvIds.includes(m.conversationId)) return false
      if (m.senderId === user.id) return false
      return !readMessageIds.has(m.id)
    }).length

    // Ajouter les notifications de messages non lues
    return unread + messageNotifications.filter((n) => !n.read).length
  })()

  const handleMarkAllRead = () => {
    // Marquer toutes les notifications de messages comme lues
    messageNotifications.forEach((n) => markNotificationAsRead(n.id))
    
    // Marquer tous les messages des conversations de l'utilisateur comme lus
    if (user) {
      const userConvIds = conversations
        .filter((c) => c.participantIds.includes(user.id))
        .map((c) => c.id)
      
      const newReadIds = new Set(readMessageIds)
      messages.forEach((m) => {
        if (userConvIds.includes(m.conversationId) && m.senderId !== user.id) {
          newReadIds.add(m.id)
        }
      })
      setReadMessageIds(newReadIds)
      localStorage.setItem("agrimarche_read_messages", JSON.stringify([...newReadIds]))
    }
  }

  const handleOpenMessages = () => {
    setShowPanel(false)
    if (role === "farmer") {
      router.push("/agriculteur/messages")
    } else if (role === "buyer") {
      router.push("/acheteur/messages")
    } else {
      router.push("/admin/messages")
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setShowPanel(!showPanel)}
      >
        <Bell className="h-5 w-5" />
        {unreadMessages > 0 && (
          <span className="absolute top-1 right-1 bg-destructive text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadMessages > 9 ? "9+" : unreadMessages}
          </span>
        )}
      </Button>

      {showPanel && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-card border rounded-lg shadow-lg z-50">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">Notifications de messages</h3>
            {unreadMessages > 0 && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="text-xs">
                Tout marquer lu
              </Button>
            )}
          </div>

          {messageNotifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucun nouveau message</p>
            </div>
          ) : (
            <div className="divide-y">
              {messageNotifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                    !notification.read ? "bg-muted/30" : ""
                  }`}
                  onClick={() => markNotificationAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <MessageSquare className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(notification.timestamp).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {!notification.read && <div className="w-2 h-2 bg-primary rounded-full mt-1 flex-shrink-0" />}
                  </div>
                </div>
              ))}
              {messageNotifications.length > 10 && (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  +{messageNotifications.length - 10} autres notifications
                </div>
              )}
            </div>
          )}

          <div className="p-3 border-t text-center">
            <Button variant="ghost" size="sm" onClick={handleOpenMessages} className="text-xs gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              Voir tous les messages
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}