"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { BuyerMessagesPanel } from "@/components/buyer/messages-panel"

export default function BuyerMessagesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Chargement...</div>
  }

  if (!user || user.role !== "buyer") {
    router.push("/connexion")
    return null
  }

  return <BuyerMessagesPanel className="h-[calc(100vh-140px)]" />
}
