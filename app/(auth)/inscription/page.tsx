"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ShoppingCart, Eye, EyeOff, User, Phone, Mail, MapPin, Lock, Info, Sparkles, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react"

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const defaultRole = "buyer" // Toujours buyer par défaut

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: defaultRole as "buyer", // Seulement buyer
    phone: "",
    location: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { register } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    const result = await register(formData)

    if (result.success) {
      toast({
        title: "Inscription réussie",
        description: "Bienvenue sur TerraFrais !",
      })
      router.push("/acheteur")
    } else {
      toast({
        title: "Erreur d'inscription",
        description: result.error,
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  return (
    <div className="animate-menu-in w-full max-w-[560px]">
      <div className="mb-6 text-center lg:text-left">
        <Badge className="rounded-full bg-primary/10 text-primary hover:bg-primary/10">
          <Sparkles className="mr-1 h-3 w-3" />
          Rejoignez 2 000+ familles
        </Badge>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Créez votre compte</h1>
        <p className="mt-2 text-sm text-muted-foreground">Rejoignez TerraFrais en tant qu&apos;acheteur — gratuit, en 30 secondes.</p>
      </div>

      <Card className="rounded-[1.7rem] border-0 bg-card/80 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)] ring-1 ring-border backdrop-blur">
        <CardContent className="p-6 sm:p-7">
          {/* Info : uniquement les comptes acheteurs */}
          <div className="mb-6 flex gap-3 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-card p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow">
              <Info className="h-4 w-4" />
            </span>
            <div className="text-sm leading-relaxed">
              <p className="font-semibold text-foreground">Compte acheteur uniquement</p>
              <p className="text-muted-foreground">
                Les <span className="font-semibold text-foreground">comptes agriculteurs</span> sont créés par l&apos;administration après demande via{" "}
                <Link href="/contact" className="font-semibold text-primary hover:underline">
                  Contact
                </Link>
                .
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold">
                  Nom complet
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Nom Postnom"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="h-12 rounded-xl border-0 bg-muted/60 pl-10 shadow-inner focus-visible:ring-primary"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-semibold">
                  Téléphone
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+243 830 854 244"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-12 rounded-xl border-0 bg-muted/60 pl-10 shadow-inner focus-visible:ring-primary"
                  />
                </div>
              </div>
            </div>

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
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="h-12 rounded-xl border-0 bg-muted/60 pl-10 shadow-inner focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-semibold">
                Localisation / Région
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="Kinshasa / Gombe"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="h-12 rounded-xl border-0 bg-muted/60 pl-10 shadow-inner focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
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
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold">
                  Confirmer
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    minLength={6}
                    className="h-12 rounded-xl border-0 bg-muted/60 pl-10 pr-10 shadow-inner focus-visible:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              En créant un compte, vous acceptez nos conditions d&apos;utilisation et la traçabilité des produits.
            </div>

            <Button
              type="submit"
              className="h-12 w-full rounded-full bg-gradient-to-r from-primary to-emerald-600 text-[15px] font-semibold shadow-lg shadow-primary/20 hover:from-primary/90 hover:to-emerald-600/90"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
              Créer mon compte
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Déjà inscrit ?{" "}
              <Link href="/connexion" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
                Connectez-vous <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
        Données chiffrées • Support WhatsApp 7j/7
      </div>
    </div>
  )
}
