"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useData } from "@/lib/data-context"
import {
  LayoutDashboard,
  ShoppingCart,
  MessageSquare,
  LifeBuoy,
  LogOut,
  Leaf,
  Store,
  X,
} from "lucide-react"

interface BuyerSidebarProps {
  onNavigate?: () => void
}

export function BuyerSidebar({ onNavigate }: BuyerSidebarProps) {
  const { user, logout } = useAuth()
  const { orders, supportTickets, conversations } = useData()
  const pathname = usePathname()

  if (!user) return null

  const buyerOrders = orders.filter((o) => o.buyerId === user.id)
  const pendingOrders = buyerOrders.filter((o) => o.status === "pending").length

  const openTickets = supportTickets.filter((t) => t.buyerId === user.id && t.status !== "closed").length

  const unreadMessages = conversations
    .filter((c) => c.participantIds.includes(user.id))
    .reduce((sum, c) => sum + c.unreadCount, 0)

  const navItems = [
    { href: "/acheteur", label: "Tableau de bord", icon: LayoutDashboard, badge: undefined },
    { href: "/acheteur/commandes", label: "Commandes", icon: ShoppingCart, badge: pendingOrders },
    { href: "/acheteur/messages", label: "Messages", icon: MessageSquare, badge: unreadMessages },
    { href: "/acheteur/support", label: "Support", icon: LifeBuoy, badge: openTickets },
  ]

  const isActive = (href: string) => {
    if (href === "/acheteur") return pathname === "/acheteur"
    return pathname.startsWith(href)
  }

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-card/80 backdrop-blur-xl fixed left-0 top-0 h-screen z-40">
      <div className="p-6 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-[0_0_20px_rgba(34,197,94,0.35)]">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">TerraFrais</span>
        </Link>
      </div>

      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-primary/30">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="bg-primary/20 text-primary">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground capitalize">Acheteur</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Mon Espace
        </p>
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            asChild
            onClick={onNavigate}
            className={`w-full justify-start gap-3 ${
              isActive(item.href)
                ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
            }`}
          >
            <Link href={item.href}>
              <item.icon className="h-5 w-5" />
              <span className="text-sm font-medium">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <Badge variant="outline" className="ml-auto border-primary/30 bg-primary/10 text-primary">
                  {item.badge}
                </Badge>
              )}
            </Link>
          </Button>
        ))}

        <div className="pt-4 mt-4 border-t border-white/5">
          <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Explorer
          </p>
          <Button
            variant="ghost"
            asChild
            onClick={onNavigate}
            className="w-full justify-start gap-3 text-muted-foreground hover:bg-primary/10 hover:text-primary"
          >
            <Link href="/marche">
              <Store className="h-5 w-5" />
              <span className="text-sm font-medium">Le Marché</span>
            </Link>
          </Button>
        </div>
      </nav>

      <div className="p-4 border-t border-white/5 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm">Déconnexion</span>
        </Button>
      </div>
    </aside>
  )
}

interface BuyerMobileMenuProps {
  open: boolean
  onClose: () => void
}

export function BuyerMobileMenu({ open, onClose }: BuyerMobileMenuProps) {
  const { user, logout } = useAuth()
  const { orders, supportTickets, conversations, messages } = useData()
  const pathname = usePathname()

  if (!user || !open) return null

  const buyerOrders = orders.filter((o) => o.buyerId === user.id)
  const pendingOrders = buyerOrders.filter((o) => o.status === "pending").length
  const openTickets = supportTickets.filter((t) => t.buyerId === user.id && t.status !== "closed").length

  const unreadMessages = conversations
    .filter((c) => c.participantIds.includes(user.id))
    .reduce((sum, c) => sum + c.unreadCount, 0)

  const navItems = [
    { href: "/acheteur", label: "Tableau de bord", icon: LayoutDashboard, badge: undefined },
    { href: "/acheteur/commandes", label: "Commandes", icon: ShoppingCart, badge: pendingOrders },
    { href: "/acheteur/messages", label: "Messages", icon: MessageSquare, badge: unreadMessages },
    { href: "/acheteur/support", label: "Support", icon: LifeBuoy, badge: openTickets },
  ]

  const isActive = (href: string) => {
    if (href === "/acheteur") return pathname === "/acheteur"
    return pathname.startsWith(href)
  }

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <aside className="fixed left-0 top-0 w-64 h-screen bg-card border-r border-white/5 flex flex-col z-50">
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Leaf className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold">TerraFrais</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-primary/30">
              <AvatarFallback className="bg-primary/20 text-primary">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">Acheteur</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              asChild
              onClick={onClose}
              className={`w-full justify-start gap-3 ${
                isActive(item.href)
                  ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`}
            >
              <Link href={item.href}>
                <item.icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <Badge variant="outline" className="ml-auto border-primary/30 bg-primary/10 text-primary">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            </Button>
          ))}

          <div className="pt-4 mt-4 border-t border-white/5">
            <Button
              variant="ghost"
              asChild
              onClick={onClose}
              className="w-full justify-start gap-3 text-muted-foreground hover:bg-primary/10 hover:text-primary"
            >
              <Link href="/marche">
                <Store className="h-5 w-5" />
                <span className="text-sm font-medium">Le Marché</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10"
              onClick={() => { logout(); onClose(); }}
            >
              <LogOut className="h-5 w-5" />
              <span className="text-sm font-medium">Déconnexion</span>
            </Button>
          </div>
        </nav>
      </aside>
    </div>
  )
}