"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Eye, EyeOff, Mail, Lock } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const result = await login(email, password)

    if (result.success) {
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur TerraFrais !",
      })
      router.push("/")
      router.refresh()
    } else {
      toast({
        title: "Erreur de connexion",
        description: result.error,
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  return (
    <div className="animate-menu-in w-full max-w-md">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Bon retour !</h1>
        <p className="mt-2 text-muted-foreground">Connectez-vous à votre espace TerraFrais</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Adresse email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Comptes de démonstration :</p>
          <ul className="mt-1 space-y-1">
            <li>Agriculteur : jean.dupont@email.com</li>
            <li>Acheteur : pierre.bernard@email.com</li>
            <li>Admin : admin@agrimarche.fr</li>
          </ul>
          <p className="mt-1 text-xs">(Entrez n&apos;importe quel mot de passe)</p>
        </div>

        <Button
          type="submit"
          className="h-11 w-full shadow-md shadow-primary/20 transition-shadow hover:shadow-lg"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Se connecter
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="font-medium text-primary hover:underline">
            Inscrivez-vous
          </Link>
        </p>
      </form>
    </div>
  )
}
