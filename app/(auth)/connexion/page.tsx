"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Eye, EyeOff, Mail, Lock, Sprout, ShieldCheck, ArrowRight, Sparkles } from "lucide-react"

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
    <div className="animate-menu-in w-full max-w-[440px]">
      <div className="mb-6 text-center lg:text-left">
        <Badge className="rounded-full bg-primary/10 text-primary hover:bg-primary/10">
          <Sprout className="mr-1 h-3 w-3" />
          Ravie de vous revoir
        </Badge>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground">Bon retour !</h1>
        <p className="mt-2 text-sm text-muted-foreground">Connectez-vous à votre espace TerraFrais — acheteur, agriculteur ou admin.</p>
      </div>

      <Card className="rounded-[1.7rem] border-0 bg-card/80 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)] ring-1 ring-border backdrop-blur">
        <CardContent className="p-6 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">
                Adresse email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-xl border-0 bg-muted/60 pl-10 shadow-inner focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold">
                  Mot de passe
                </Label>
                <Link href="#" className="text-xs font-medium text-primary hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 rounded-xl border-0 bg-muted/60 pl-10 pr-10 shadow-inner focus-visible:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="h-12 w-full rounded-full bg-gradient-to-r from-primary to-emerald-600 text-[15px] font-semibold shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:from-primary/90 hover:to-emerald-600/90"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
              Se connecter
            </Button>

            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">ou</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Pas encore de compte ?{" "}
              <Link href="/inscription" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
                Inscrivez-vous <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center justify-center gap-2 rounded-full border bg-card/60 px-4 py-2.5 text-xs shadow-sm backdrop-blur">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span className="font-medium">Agriculteurs ?</span>
        <span className="text-muted-foreground">Demandez votre compte via</span>
        <Link href="/contact" className="font-semibold text-primary hover:underline">
          Contact
        </Link>
      </div>
    </div>
  )
}
