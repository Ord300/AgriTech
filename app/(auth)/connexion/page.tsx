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
    <div className="animate-menu-in w-full max-w-[440px] px-1 max-[360px]:px-0">
      <div className="mb-4 max-[360px]:mb-3 sm:mb-6 text-center lg:text-left">
        <Badge className="rounded-full bg-primary/10 text-primary hover:bg-primary/10 text-xs max-[360px]:text-[11px] px-2.5 py-0.5">
          <Sprout className="mr-1 h-3 w-3 max-[360px]:h-2.5 max-[360px]:w-2.5" />
          Ravie de vous revoir
        </Badge>
        <h1 className="mt-2.5 sm:mt-3 text-2xl max-[360px]:text-xl sm:text-3xl font-extrabold tracking-tight text-foreground">Bon retour !</h1>
        <p className="mt-1.5 sm:mt-2 text-xs max-[360px]:text-[11px] sm:text-sm leading-relaxed text-muted-foreground">Connectez-vous à votre espace TerraFrais — acheteur, agriculteur ou admin.</p>
      </div>

      <Card className="rounded-2xl max-[360px]:rounded-xl sm:rounded-[1.7rem] border-0 bg-card/80 shadow-[0_15px_40px_-20px_rgba(0,0,0,0.15)] sm:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)] ring-1 ring-border backdrop-blur overflow-hidden">
        <CardContent className="p-4 max-[360px]:p-3.5 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-4 max-[360px]:space-y-3 sm:space-y-5">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="email" className="text-xs max-[360px]:text-[11px] sm:text-sm font-semibold">
                Adresse email
              </Label>
              <div className="relative">
                <Mail className="absolute left-2.5 sm:left-3.5 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10 max-[360px]:h-9 sm:h-12 rounded-xl border-0 bg-muted/60 pl-8 max-[360px]:pl-7 sm:pl-10 shadow-inner focus-visible:ring-primary text-sm max-[360px]:text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="password" className="text-xs max-[360px]:text-[11px] sm:text-sm font-semibold">
                  Mot de passe
                </Label>
                <Link href="#" className="text-[11px] max-[360px]:text-[10px] sm:text-xs font-medium text-primary hover:underline shrink-0">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-2.5 sm:left-3.5 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-10 max-[360px]:h-9 sm:h-12 rounded-xl border-0 bg-muted/60 pl-8 max-[360px]:pl-7 sm:pl-10 pr-9 sm:pr-10 shadow-inner focus-visible:ring-primary text-sm max-[360px]:text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="h-10 max-[360px]:h-9 sm:h-12 w-full rounded-full bg-gradient-to-r from-primary to-emerald-600 text-sm max-[360px]:text-xs sm:text-[15px] font-semibold shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:from-primary/90 hover:to-emerald-600/90"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />}
              Se connecter
            </Button>

            <div className="flex items-center gap-2 sm:gap-3 py-0.5 sm:py-1">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[11px] max-[360px]:text-[10px] sm:text-xs text-muted-foreground">ou</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <p className="text-center text-xs max-[360px]:text-[11px] sm:text-sm text-muted-foreground">
              Pas encore de compte ?{" "}
              <Link href="/inscription" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
                Inscrivez-vous <ArrowRight className="h-3 w-3 max-[360px]:h-2.5 max-[360px]:w-2.5 sm:h-3.5 sm:w-3.5" />
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>

      <div className="mt-4 max-[360px]:mt-3 sm:mt-6 flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 max-[360px]:gap-1 rounded-full border bg-card/60 px-3 max-[360px]:px-2.5 sm:px-4 py-2 max-[360px]:py-1.5 sm:py-2.5 text-xs max-[360px]:text-[11px] sm:text-xs shadow-sm backdrop-blur text-center leading-relaxed">
        <Sparkles className="h-3 w-3 max-[360px]:h-2.5 max-[360px]:w-2.5 sm:h-3.5 sm:w-3.5 text-primary shrink-0" />
        <span className="font-medium">Agriculteurs ?</span>
        <span className="text-muted-foreground">Demandez votre compte via</span>
        <Link href="/contact" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
          Contact <ArrowRight className="h-3 w-3 max-[360px]:h-2.5 max-[360px]:w-2.5 sm:h-3 sm:w-3" />
        </Link>
      </div>
    </div>
  )
}
