"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminMessagesPage() {
  const router = useRouter()

  useEffect(() => {
    // La messagerie est désormais intégrée au tableau de bord admin (sidebar à gauche)
    router.replace("/admin?section=messages")
  }, [router])

  return <div className="flex min-h-screen items-center justify-center">Chargement...</div>
}
