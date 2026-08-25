"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { User } from "@/lib/types"
import {
  Leaf,
  Home,
  ClipboardList,
  Package,
  Star,
  MessageSquare,
  ShoppingCart,
  LogOut,
  BadgeCheck,
} from "lucide-react"

interface FarmerSidebarProps {
  user: User
  certified?: boolean
  pendingOrdersCount?: number
  productsCount?: number
  certAttentionCount?: number
  unreadConversationsCount?: number
  onNavigate?: () => void
}

export function FarmerSidebar({
  user,
  certified,
  pendingOrdersCount = 0,
  productsCount = 0,
  certAttentionCount = 0,
  unreadConversationsCount = 0,
  onNavigate,
}: FarmerSidebarProps) {
  const pathname = usePathname()
  const { logout } = useAuth()

  const navItems = [
    {
      href: "/agriculteur",
      label: "Tableau de bord",
      icon: Home,
      active: pathname === "/agriculteur",
    },
    {
      href: "/agriculteur#module-commandes",
      label: "Commandes",
      icon: ClipboardList,
      active: false,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
      badgeClass: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    },
    {
      href: "/agriculteur#module-produits",
      label: "Produits",
      icon: Package,
      active: false,
      badge: productsCount > 0 ? productsCount : undefined,
      badgeClass: "border-lime-400/30 bg-lime-400/10 text-lime-300",
    },
    {
      href: "/agriculteur#module-certification",
      label: "Certification",
      icon: Star,
      active: false,
      badge: certAttentionCount > 0 ? certAttentionCount : undefined,
      badgeClass: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    },
    {
      href: "/agriculteur/messages",
      label: "Messages",
      icon: MessageSquare,
      active: pathname.startsWith("/agriculteur/messages"),
      badge: unreadConversationsCount > 0 ? unreadConversationsCount : undefined,
      badgeClass: "border-lime-400/30 bg-lime-400/10 text-lime-300",
    },
  ]

  return (
    <>
      {/* Brand */}
      <div className="p-6 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2" onClick={onNavigate}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime-400 shadow-[0_0_20px_rgba(163,230,53,0.35)]">
            <Leaf className="h-5 w-5 text-emerald-950" />
          </div>
          <span className="text-lg font-bold">TerraFrais</span>
        </Link>
      </div>

      {/* Profil */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-lime-400/30">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="bg-lime-400/20 text-lime-300">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="flex items-center gap-1 font-medium text-sm truncate">
              {user.name}
              {certified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-lime-400" />}
            </p>
            <p className="text-xs text-lime-400/80 capitalize">
              Agriculteur{certified ? " certifié" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {navItems.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 text-muted-foreground hover:bg-lime-400/10 hover:text-lime-200",
              item.active &&
                "bg-lime-400/10 text-lime-300 hover:bg-lime-400/15 hover:text-lime-200 border-l-2 border-l-lime-400 rounded-l-none",
            )}
            asChild
          >
            <Link href={item.href} onClick={onNavigate}>
              <item.icon className="h-5 w-5" />
              <span className="text-sm font-medium">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <Badge variant="outline" className={cn("ml-auto", item.badgeClass)}>
                  {item.badge}
                </Badge>
              )}
            </Link>
          </Button>
        ))}

        <Button
          variant="outline"
          className="w-full justify-start gap-3 mt-4 border-lime-400/20 bg-transparent text-lime-300 hover:bg-lime-400/10 hover:text-lime-200"
          asChild
        >
          <Link href="/marche" onClick={onNavigate}>
            <ShoppingCart className="h-5 w-5" />
            <span className="text-sm font-medium">Le Marché</span>
          </Link>
        </Button>
      </nav>

      {/* Pied */}
      <div className="p-4 border-t border-white/5">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10"
          onClick={() => {
            logout()
            onNavigate?.()
          }}
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm">Déconnexion</span>
        </Button>
      </div>
    </>
  )
}
