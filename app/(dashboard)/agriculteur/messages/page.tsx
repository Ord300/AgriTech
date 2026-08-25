"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useData } from "@/lib/data-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Leaf, Menu, X, MessagesSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { ConversationList } from "@/components/messaging/conversation-list"
import { ChatWindow } from "@/components/messaging/chat-window"
import { FarmerSidebar } from "@/components/farmer/farmer-sidebar"
import { MessageNotifications } from "@/components/message-notifications"

export default function FarmerMessagesPage() {
  const { user, isLoading } = useAuth()
  const { conversations, messages, sendMessage, users, orders, products, certificationRequests } = useData()
  const router = useRouter()
  const [selectedConvId, setSelectedConvId] = useState<string | undefined>(undefined)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileView, setMobileView] = useState<"list" | "chat">("list")

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "farmer")) {
      router.push("/connexion")
    }
  }, [isLoading, user, router])

  useEffect(() => {
    if (user && conversations.length > 0) {
      const firstConv = conversations.find((c) => c.participantIds.includes(user.id))
      if (firstConv) {
        setSelectedConvId(firstConv.id)
      }
    }
  }, [user, conversations])

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Chargement...</div>
  }

  if (!user || user.role !== "farmer") {
    return null
  }

  const currentUserId = user.id

  const farmerConversations = conversations.filter((c) => c.participantIds.includes(currentUserId))
  const totalUnread = farmerConversations.reduce((sum, c) => sum + c.unreadCount, 0)

  const selectedConv = conversations.find((c) => c.id === selectedConvId)
  const otherParticipantId = selectedConv?.participantIds.find((id) => id !== currentUserId)
  const otherParticipant = users.find((u) => u.id === otherParticipantId)

  const currentMessages = messages.filter((m) => m.conversationId === selectedConvId)

  const farmerOrders = orders.filter((o) => o.farmerId === user.id)
  const pendingOrders = farmerOrders.filter((o) => o.status === "pending")
  const farmerProducts = products.filter((p) => p.farmerId === user.id)
  const myCertificationRequests = certificationRequests.filter((r) => r.farmerId === user.id)
  const pendingCertification = myCertificationRequests.find((r) => r.status === "pending")
  const approvedCertification = myCertificationRequests.find((r) => r.status === "approved")
  const certifiedRequest = myCertificationRequests.find((r) => r.status === "paid")
  const certAttentionCount = (pendingCertification ? 1 : 0) + (approvedCertification ? 1 : 0)

  const handleSendMessage = (content: string) => {
    if (selectedConvId) {
      sendMessage(selectedConvId, currentUserId, content)
    }
  }

  return (
    <div className="farmer-theme min-h-screen bg-background text-foreground">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-sidebar/80 backdrop-blur-xl fixed left-0 top-0 h-screen">
        <FarmerSidebar
          user={user}
          certified={!!certifiedRequest}
          pendingOrdersCount={pendingOrders.length}
          productsCount={farmerProducts.length}
          certAttentionCount={certAttentionCount}
          unreadConversationsCount={totalUnread}
        />
      </aside>

      {/* Contenu principal */}
      <div className="relative flex flex-col flex-1 md:ml-64 h-screen overflow-hidden">
        {/* Décor d'arrière-plan */}
        <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-lime-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 -left-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-white/5 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="h-16 flex items-center justify-between px-4">
            <div className="flex items-center gap-4 md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <Menu className="h-5 w-5" />
              </Button>
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime-400">
                  <Leaf className="h-4 w-4 text-emerald-950" />
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-3 min-w-0">
              <div className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-lime-400/15 shadow-[0_0_20px_rgba(163,230,53,0.2)]">
                <MessagesSquare className="h-5 w-5 text-lime-400" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold leading-tight truncate">Messages</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {totalUnread > 0
                    ? `${totalUnread} message${totalUnread !== 1 ? "s" : ""} non lu${totalUnread !== 1 ? "s" : ""}`
                    : `${farmerConversations.length} conversation${farmerConversations.length !== 1 ? "s" : ""}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden lg:inline text-sm text-muted-foreground">{user.name}</span>
              <MessageNotifications role="farmer" />
            </div>
          </div>
        </header>

        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <aside className="fixed left-0 top-0 w-64 h-screen bg-sidebar border-r border-white/5 flex flex-col z-50">
              <div className="flex items-center justify-between p-4 border-b border-white/5 md:hidden">
                <span className="font-bold">Menu</span>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <FarmerSidebar
                user={user}
                certified={!!certifiedRequest}
                pendingOrdersCount={pendingOrders.length}
                productsCount={farmerProducts.length}
                certAttentionCount={certAttentionCount}
                unreadConversationsCount={totalUnread}
                onNavigate={() => setMobileMenuOpen(false)}
              />
            </aside>
          </div>
        )}

        {/* Zone de chat */}
        <main className="relative flex-1 p-3 sm:p-4 lg:p-6 min-h-0">
          <div className="mx-auto max-w-6xl h-full">
            <div className="flex h-full rounded-xl border border-white/5 bg-card/60 shadow-lg shadow-black/20 backdrop-blur-xl overflow-hidden">
              <div
                className={cn(
                  "w-64 sm:w-72 md:w-80 flex-shrink-0",
                  mobileView === "chat" ? "hidden md:block" : "block",
                )}
              >
                <ConversationList
                  conversations={farmerConversations}
                  selectedId={selectedConvId}
                  onSelect={(id) => {
                    setSelectedConvId(id)
                    setMobileView("chat")
                  }}
                  currentUserId={currentUserId}
                />
              </div>
              <div
                className={cn(
                  "flex-1 min-w-0 border-l border-white/5",
                  mobileView === "list" ? "hidden md:flex" : "flex",
                )}
              >
                <ChatWindow
                  messages={currentMessages}
                  otherParticipant={otherParticipant}
                  currentUserId={currentUserId}
                  onSendMessage={handleSendMessage}
                  onBack={() => setMobileView("list")}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
