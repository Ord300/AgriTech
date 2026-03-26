"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, User, LogOut, LayoutDashboard, ShoppingBag, Leaf } from "lucide-react"
import { useState } from "react"

export function Header() {
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const getDashboardLink = () => {
    if (!user) return "/connexion"
    switch (user.role) {
      case "farmer":
        return "/agriculteur"
      case "buyer":
        return "/acheteur"
      case "admin":
        return "/admin"
      default:
        return "/"
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">AgriMarché</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Accueil
          </Link>
          <Link
            href="/marche"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Marché
          </Link>
          <Link
            href="/a-propos"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            À Propos
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href={getDashboardLink()} className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Tableau de bord
                  </Link>
                </DropdownMenuItem>
                {user.role === "buyer" && (
                  <DropdownMenuItem asChild>
                    <Link href="/acheteur/commandes" className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4" />
                      Mes commandes
                    </Link>
                  </DropdownMenuItem>
                )}
                {user.role === "farmer" && (
                  <DropdownMenuItem asChild>
                    <Link href="/marche" className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4" />
                      Explorer le marché
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="flex items-center gap-2 text-destructive">
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden gap-2 sm:flex">
              <Button variant="ghost" asChild>
                <Link href="/connexion">Connexion</Link>
              </Button>
              <Button asChild>
                <Link href="/inscription">Inscription</Link>
              </Button>
            </div>
          )}

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t bg-card p-4 md:hidden">
          <nav className="flex flex-col gap-3">
            <Link
              href="/"
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              onClick={() => setMobileMenuOpen(false)}
            >
              Accueil
            </Link>
            <Link
              href="/marche"
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              onClick={() => setMobileMenuOpen(false)}
            >
              Marché
            </Link>
            <Link
              href="/a-propos"
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              onClick={() => setMobileMenuOpen(false)}
            >
              À Propos
            </Link>
            {!user && (
              <div className="flex flex-col gap-2 border-t pt-3">
                <Button variant="outline" asChild>
                  <Link href="/connexion" onClick={() => setMobileMenuOpen(false)}>
                    Connexion
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/inscription" onClick={() => setMobileMenuOpen(false)}>
                    Inscription
                  </Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
