"use client"

import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DataProvider, useData } from "@/lib/data-context"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ScrollReveal } from "@/components/scroll-reveal"
import { HeroSlider } from "@/components/hero-slider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CATEGORIES, type ProductCategory } from "@/lib/types"
import {
  Leaf,
  Users,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Sprout,
  Handshake,
  Truck,
  Trophy,
  Star,
  MapPin,
  Sparkles,
  CheckCircle2,
  Quote,
  Clock,
  BadgeCheck,
  Store,
  ArrowUpRight,
  Play,
  Crown,
  Medal,
  Award,
  Package,
  Eye,
} from "lucide-react"

export default function HomePage() {
  return (
    <DataProvider>
      <HomeContent />
    </DataProvider>
  )
}

function HomeContent() {
  const { user, isLoading } = useAuth()
  const { showcaseProducts, orders, users, ratings, products } = useData()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      const dashboardLink = user.role === "farmer" ? "/agriculteur" : user.role === "buyer" ? "/acheteur" : "/admin"
      router.replace(dashboardLink)
    }
  }, [user, isLoading, router])

  const topSeller = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== "cancelled")
    if (validOrders.length === 0) return null
    const referenceTime = Math.max(...validOrders.map((o) => new Date(o.createdAt).getTime()))
    const windowMs = 30 * 24 * 60 * 60 * 1000
    const byFarmer = new Map<string, { name: string; quantity: number; revenue: number }>()
    for (const order of validOrders) {
      if (referenceTime - new Date(order.createdAt).getTime() > windowMs) continue
      const entry = byFarmer.get(order.farmerId) ?? { name: order.farmerName, quantity: 0, revenue: 0 }
      entry.quantity += order.quantity
      entry.revenue += order.totalPrice
      byFarmer.set(order.farmerId, entry)
    }
    if (byFarmer.size === 0) return null
    const [farmerId, stats] = Array.from(byFarmer.entries()).sort(
      (a, b) => b[1].quantity - a[1].quantity || b[1].revenue - a[1].revenue,
    )[0]
    const farmer = users.find((u) => u.id === farmerId)
    return { farmerId, ...stats, name: farmer?.name ?? stats.name, location: farmer?.location, avatar: farmer?.avatar }
  }, [orders, users])

  const bestRated = useMemo(() => {
    if (ratings.length === 0) return null
    const byFarmer = new Map<string, { total: number; count: number }>()
    for (const rating of ratings) {
      const entry = byFarmer.get(rating.farmerId) ?? { total: 0, count: 0 }
      entry.total += rating.stars
      entry.count += 1
      byFarmer.set(rating.farmerId, entry)
    }
    const [farmerId, stats] = Array.from(byFarmer.entries())
      .map(([id, s]) => [id, { ...s, avg: s.total / s.count }] as const)
      .sort((a, b) => b[1].avg - a[1].avg || b[1].count - a[1].count)[0]
    const farmer = users.find((u) => u.id === farmerId)
    return { farmerId, ...stats, name: farmer?.name ?? "Agriculteur", location: farmer?.location, avatar: farmer?.avatar }
  }, [ratings, users])

  if (isLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground animate-pulse">Redirection vers votre espace...</p>
        </div>
      </div>
    )
  }

  const features = [
    {
      icon: Users,
      title: "Connexion Directe",
      description: "Mettez en relation agriculteurs et acheteurs sans intermédiaires pour des prix plus justes et transparents.",
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      icon: BadgeCheck,
      title: "Produits Certifiés",
      description: "Des produits frais, locaux et traçables directement depuis les exploitations agricoles vérifiées.",
      gradient: "from-amber-500 to-orange-600",
    },
    {
      icon: TrendingUp,
      title: "Revenus Équitables",
      description: "Les agriculteurs gardent 97% de leurs ventes. Commission plateforme minimale de 3% seulement.",
      gradient: "from-violet-500 to-purple-600",
    },
    {
      icon: Truck,
      title: "Circuit Ultra-Court",
      description: "Réduisez l'empreinte carbone avec des livraisons locales en 24h du champ à l'assiette.",
      gradient: "from-cyan-500 to-blue-600",
    },
  ]

  const steps = [
    {
      icon: Sprout,
      step: "01",
      title: "Inscrivez-vous",
      description: "Créez votre compte acheteur en 30 secondes. Les comptes agriculteurs sont validés par notre équipe.",
    },
    {
      icon: Store,
      step: "02",
      title: "Explorez le marché",
      description: "Parcourez des centaines de produits frais, filtrez par catégorie, région et disponibilité.",
    },
    {
      icon: Handshake,
      step: "03",
      title: "Commandez direct",
      description: "Panier en un clic, paiement Mobile Money sécurisé et livraison coordonnée avec le producteur.",
    },
  ]

  const testimonials = [
    {
      name: "Maman Chantal",
      role: "Acheteuse • Kinshasa",
      avatar: "",
      text: "Depuis que j'utilise TerraFrais, je reçois des légumes cueillis le matin même. Le goût n'a rien à voir avec le supermarché !",
      stars: 5,
    },
    {
      name: "Gerth KB",
      role: "Producteur • Kinshasa",
      avatar: "",
      text: "Grâce à la vente directe, mes revenus ont augmenté de 40%. Je fixe mes prix et je parle directement à mes clients.",
      stars: 5,
    },
    {
      name: "Roseline DM",
      role: "Acheteuse • Gombe",
      avatar: "",
      text: "Service impeccable, paiement M-Pesa instantané. Et je soutiens directement les agriculteurs de ma région.",
      stars: 5,
    },
  ]

  const showcaseList = showcaseProducts.slice(0, 6)

  // Mappe la catégorie libre d'un ShowcaseProduct (ex: "Légumes", "Produits Laitiers")
  // vers la ProductCategory correspondante pour filtrer le marché
  const showcaseCategoryToSlug = (cat: string): ProductCategory | null => {
    const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
    const nCat = normalize(cat)
    const found = CATEGORIES.find((c) => normalize(c.label) === nCat)
    if (found) return found.value
    // fallback: essaie de matcher directement la valeur (ex: "legumes")
    const byValue = CATEGORIES.find((c) => c.value === nCat)
    return byValue?.value ?? null
  }

  const getShowcaseHref = (cat: string) => {
    const slug = showcaseCategoryToSlug(cat)
    return slug ? `/marche?category=${encodeURIComponent(slug)}` : "/marche"
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden">
          {/* Fond mesh + grille */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.07] via-emerald-50/60 to-amber-50/40 dark:from-primary/10 dark:via-background dark:to-background" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
          <div className="absolute -left-24 -top-24 h-[520px] w-[520px] rounded-full bg-primary/10 blur-[90px]" />
          <div className="absolute -right-32 top-20 h-[420px] w-[420px] rounded-full bg-amber-400/10 blur-[80px]" />
          <div className="absolute left-1/2 bottom-0 h-[300px] w-[800px] -translate-x-1/2 rounded-full bg-emerald-500/5 blur-3xl" />

          <div className="container relative mx-auto px-4 py-10 lg:py-16">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
              {/* Texte hero */}
              <div className="relative text-center lg:text-left">
                <ScrollReveal>
                  <div className="inline-flex items-center gap-2 rounded-full border bg-card/70 px-3.5 py-1.5 text-xs font-medium shadow-sm backdrop-blur">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Sparkles className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-foreground">N°1 Circuit Court en RDC</span>
                    <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-600" />
                      En ligne
                    </span>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={80}>
                  <h1 className="mt-6 text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
                    Du champ
                    <span className="relative ml-2 inline-block">
                      <span className="relative z-10 bg-gradient-to-r from-primary via-emerald-600 to-teal-600 bg-clip-text text-transparent">à votre table</span>
                      <span className="absolute bottom-1 left-0 -z-0 h-3 w-full bg-primary/15 -rotate-[1deg]" />
                    </span>
                    <span className="block text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-muted-foreground mt-1">
                      en moins de 24h
                    </span>
                  </h1>
                </ScrollReveal>

                <ScrollReveal delay={150}>
                  <p className="mx-auto mt-5 max-w-xl text-pretty text-[15px] leading-relaxed text-muted-foreground lg:mx-0 lg:text-[17px]">
                    TerraFrais connecte <span className="font-semibold text-foreground">500+ agriculteurs certifiés</span> à des
                    milliers de foyers. Produits ultra-frais, traçables et au juste prix — sans aucun intermédiaire.
                  </p>
                </ScrollReveal>

                <ScrollReveal delay={200}>
                  <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                    <Button size="lg" asChild className="h-12 rounded-full px-7 text-[15px] font-semibold shadow-lg shadow-primary/20">
                      <Link href="/marche">
                        Explorer le marché
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild className="h-12 rounded-full bg-card/70 px-7 text-[15px] backdrop-blur">
                      <Link href="#comment-ca-marche" className="gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background">
                          <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
                        </span>
                        Comment ça marche
                      </Link>
                    </Button>
                  </div>
                </ScrollReveal>

                {/* Preuve sociale */}
                <ScrollReveal delay={280}>
                  <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
                    <div className="flex items-center">
                      <div className="flex -space-x-2">
                        {[1, 2, 3, 4].map((i) => (
                          <Avatar key={i} className="h-8 w-8 border-2 border-card shadow-sm">
                            <AvatarImage src={`https://i.pravatar.cc/100?img=${12 + i}`} />
                            <AvatarFallback className="text-xs">U{i}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <div className="ml-3 text-left">
                        <div className="flex items-center gap-1 text-sm font-semibold">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          4.9/5
                          <span className="font-normal text-muted-foreground">(2 400 avis)</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Adoré par +2 000 familles</p>
                      </div>
                    </div>
                    <span className="hidden h-10 w-px bg-border sm:block" />
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span className="font-medium">Paiement</span> M-Pesa & Orange Money
                    </div>
                  </div>
                </ScrollReveal>

                {/* Badges chiffres */}
                <ScrollReveal delay={320}>
                  <div className="mt-8 grid grid-cols-3 gap-3 max-w-md mx-auto lg:mx-0">
                    {[
                      { value: "100%", label: "Produits locaux" },
                      { value: "0", label: "Intermédiaire" },
                      { value: "24h", label: "Champ → Assiette" },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-2xl border bg-card/60 p-3 text-center backdrop-blur shadow-sm">
                        <p className="text-lg font-extrabold text-primary">{stat.value}</p>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </ScrollReveal>
              </div>

              {/* Slider hero */}
              <ScrollReveal delay={180} className="relative mx-auto w-full max-w-[560px] lg:max-w-none">
                <div className="relative">
                  {/* décor derrière */}
                  <div className="absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/20 via-emerald-500/15 to-amber-400/20 blur-xl" />
                  <div className="absolute -bottom-4 -right-4 -z-10 h-32 w-32 rounded-3xl bg-gradient-to-br from-primary to-emerald-600 opacity-20 blur-2xl" />

                  <HeroSlider />

                  {/* Floating cards */}
                  <div className="absolute -left-3 top-6 hidden sm:flex items-center gap-3 rounded-2xl border bg-card/90 px-3.5 py-2.5 shadow-xl backdrop-blur md:-left-6">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold leading-none">Livraison 24h</p>
                      <p className="text-[11px] text-muted-foreground">Frais depuis ce matin</p>
                    </div>
                  </div>

                  <div className="absolute -right-3 bottom-8 hidden sm:flex items-center gap-3 rounded-2xl border bg-card/90 px-3.5 py-2.5 shadow-xl backdrop-blur md:-right-6">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold leading-none">Certifié TerraFrais</p>
                      <p className="text-[11px] text-muted-foreground">Qualité contrôlée</p>
                    </div>
                    <Badge className="ml-1 bg-emerald-500 text-white hover:bg-emerald-600">✓</Badge>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* BARRE DE CONFIANCE */}
        <section className="border-y bg-card/50 backdrop-blur">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-muted-foreground">
              <span className="uppercase tracking-widest">Ils nous font confiance</span>
              <div className="flex flex-wrap items-center gap-6 sm:gap-8">
                <span className="inline-flex items-center gap-2"><Store className="h-4 w-4 text-primary" /> 500+ Producteurs</span>
                <span className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> 2 000+ Clients</span>
                <span className="inline-flex items-center gap-2"><Star className="h-4 w-4 text-amber-500" /> 98% Satisfaction</span>
                <span className="inline-flex items-center gap-2"><Leaf className="h-4 w-4 text-primary" /> 100% Local</span>
              </div>
            </div>
          </div>
        </section>

        {/* PRODUITS */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <ScrollReveal>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    Sélection du jour
                  </div>
                  <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Nos produits du moment</h2>
                  <p className="mt-2 max-w-xl text-muted-foreground">
                    Une sélection tordue par nos producteurs partenaires — arrivée ce matin, disponible en quantité limitée.
                  </p>
                </div>
                <Button variant="outline" asChild className="group gap-2 rounded-full">
                  <Link href="/marche">
                    Voir tout le marché
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </Button>
              </div>
            </ScrollReveal>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {showcaseList.map((product, index) => (
                <ScrollReveal key={product.id} delay={index * 70}>
                  <Link href={getShowcaseHref(product.category)} className="group relative block overflow-hidden rounded-[1.7rem] border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                      <div className="absolute left-3 top-3 flex items-center gap-2">
                        <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur shadow">
                          {product.category}
                        </span>
                        {index === 0 && (
                          <span className="rounded-full bg-amber-500 px-2.5 py-1 text-xs font-bold text-white shadow">
                            Nouveau
                          </span>
                        )}
                      </div>
                      <div className="absolute right-3 top-3 flex h-9 w-9 translate-y-1 items-center justify-center rounded-full bg-white/90 opacity-0 shadow backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <ArrowUpRight className="h-4 w-4" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-[18px] font-bold leading-tight text-white drop-shadow">{product.name}</p>
                        <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-white/85">
                          <MapPin className="h-3.5 w-3.5" />
                          Récolté ce matin • Stock limité
                        </p>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* AGRICULTEURS À L'HONNEUR — PREMIUM REDESIGN */}
        {(topSeller || bestRated) && (
          <section className="relative overflow-hidden py-16 lg:py-24">
            {/* fond editorial */}
            <div className="absolute inset-0 bg-gradient-to-b from-amber-50/40 via-white to-emerald-50/30 dark:from-card dark:via-background dark:to-background" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:28px_28px]" />
            <div className="absolute left-1/2 top-0 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-400/10 via-primary/5 to-emerald-400/10 blur-3xl" />

            <div className="container relative mx-auto px-4">
              <ScrollReveal>
                <div className="mx-auto max-w-3xl text-center">
                  <div className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-1.5 text-xs font-semibold shadow-sm dark:bg-card">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                      <Crown className="h-3.5 w-3.5" />
                    </span>
                    Palmarès du mois
                    <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                      <Sparkles className="h-3 w-3" />
                      Édition {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                    </span>
                  </div>
                  <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-[2.5rem]">
                    Nos agriculteurs <span className="bg-gradient-to-r from-amber-600 via-primary to-emerald-600 bg-clip-text text-transparent">à l&apos;honneur</span>
                  </h2>
                  <p className="mx-auto mt-3 max-w-2xl text-pretty text-[15px] leading-relaxed text-muted-foreground">
                    Deux producteurs d&apos;exception sélectionnés chaque mois — l&apos;un pour ses <span className="font-semibold text-foreground">volumes</span>, l&apos;autre pour la <span className="font-semibold text-foreground">confiance</span> de ses clients. Qualité contrôlée, traçabilité totale.
                  </p>
                </div>
              </ScrollReveal>

              <div className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-2">
                {/* MEILLEUR VENDEUR */}
                {topSeller &&
                  (() => {
                    const sellerProducts = products.filter((p) => p.farmerId === topSeller.farmerId).slice(0, 3)
                    return (
                      <ScrollReveal delay={100} variant="zoom">
                        <div className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border bg-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.2)] dark:bg-card">
                          {/* bannière */}
                          <div className="relative h-32 overflow-hidden">
                            <Image
                              src={sellerProducts[0]?.image || "/fresh-red-tomatoes-on-vine.jpg"}
                              alt=""
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-transparent to-transparent" />
                            {/* ruban */}
                            <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg">
                              <Trophy className="h-3.5 w-3.5" />
                              #1 Ventes
                            </div>
                            <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-foreground backdrop-blur">
                              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                              Top perf
                            </div>
                            {/* trait décoratif bas */}
                            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400" />
                          </div>

                          {/* avatar chevauchant */}
                          <div className="relative px-6">
                            <div className="absolute -top-10 left-6 flex items-end gap-3">
                              <div className="relative">
                                <Avatar className="h-[76px] w-[76px] border-4 border-white shadow-xl ring-2 ring-amber-400/30 dark:border-card">
                                  <AvatarImage src={topSeller.avatar} />
                                  <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-xl font-extrabold text-white">
                                    {topSeller.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white shadow-md dark:border-card">
                                  <BadgeCheck className="h-4 w-4" />
                                </span>
                              </div>
                              <div className="mb-2 hidden sm:block">
                                <div className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                                  <Medal className="h-3 w-3" />
                                  Certifié TerraFrais
                                </div>
                              </div>
                            </div>
                          </div>

                          <CardContent className="flex flex-1 flex-col px-6 pb-6 pt-12">
                            <div className="flex-1">
                              <h3 className="text-xl font-extrabold tracking-tight">{topSeller.name}</h3>
                              {topSeller.location && (
                                <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  {topSeller.location} • Envoi 24h
                                </p>
                              )}

                              {/* stats premium */}
                              <div className="mt-5 grid grid-cols-2 gap-3">
                                <div className="group/stat relative overflow-hidden rounded-2xl border bg-gradient-to-br from-amber-500/[0.08] to-orange-500/[0.08] p-3 transition-colors hover:border-amber-500/30">
                                  <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-amber-500/10 blur-xl" />
                                  <p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                                    <Package className="h-3 w-3" />
                                    Unités
                                  </p>
                                  <p className="mt-1 text-2xl font-black tracking-tight text-amber-600 dark:text-amber-400">{topSeller.quantity}</p>
                                  <p className="text-xs text-muted-foreground">vendues ce mois</p>
                                </div>
                                <div className="group/stat relative overflow-hidden rounded-2xl border bg-gradient-to-br from-emerald-500/[0.08] to-teal-500/[0.08] p-3 transition-colors hover:border-emerald-500/30">
                                  <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-emerald-500/10 blur-xl" />
                                  <p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                                    <Award className="h-3 w-3" />
                                    Revenu
                                  </p>
                                  <p className="mt-1 text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">{topSeller.revenue.toFixed(0)}<span className="text-sm font-bold"> FC</span></p>
                                  <p className="text-xs text-muted-foreground">chiffre brut</p>
                                </div>
                              </div>

                              {/* produits miniatures */}
                              {sellerProducts.length > 0 && (
                                <div className="mt-5">
                                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ses produits phares</p>
                                  <div className="mt-2 flex gap-2">
                                    {sellerProducts.map((pp) => (
                                      <div key={pp.id} className="relative h-16 flex-1 overflow-hidden rounded-xl border bg-muted">
                                        <Image src={pp.image} alt={pp.name} fill className="object-cover" sizes="100px" />
                                      </div>
                                    ))}
                                    {sellerProducts.length < 3 &&
                                      Array.from({ length: 3 - sellerProducts.length }).map((_, i) => (
                                        <div key={`ph-${i}`} className="flex flex-1 items-center justify-center rounded-xl border border-dashed bg-muted/40 text-muted-foreground">
                                          <Leaf className="h-4 w-4" />
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <Button asChild className="mt-6 w-full rounded-full bg-gradient-to-r from-amber-500 to-orange-600 font-semibold text-white shadow-lg shadow-amber-500/20 hover:from-amber-600 hover:to-orange-700">
                              <Link href={`/marche?farmer=${encodeURIComponent(topSeller.farmerId)}`} className="gap-2">
                                <Eye className="h-4 w-4" />
                                Voir ses produits
                                <ArrowRight className="h-4 w-4" />
                              </Link>
                            </Button>
                          </CardContent>
                        </div>
                      </ScrollReveal>
                    )
                  })()}

                {/* MIEUX NOTÉ */}
                {bestRated &&
                  (() => {
                    const ratedProducts = products.filter((p) => p.farmerId === bestRated.farmerId).slice(0, 3)
                    return (
                      <ScrollReveal delay={180} variant="zoom">
                        <div className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border bg-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.2)] dark:bg-card">
                          <div className="relative h-32 overflow-hidden">
                            <Image
                              src={ratedProducts[0]?.image || "/red-gala-apples-fresh.jpg"}
                              alt=""
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-transparent" />
                            <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg">
                              <Star className="h-3.5 w-3.5 fill-white" />
                              Mieux noté
                            </div>
                            <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-foreground backdrop-blur">
                              <Crown className="h-3.5 w-3.5 text-amber-500" />
                              Coup de cœur
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />
                          </div>

                          <div className="relative px-6">
                            <div className="absolute -top-10 left-6 flex items-end gap-3">
                              <div className="relative">
                                <Avatar className="h-[76px] w-[76px] border-4 border-white shadow-xl ring-2 ring-emerald-400/30 dark:border-card">
                                  <AvatarImage src={bestRated.avatar} />
                                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-xl font-extrabold text-white">
                                    {bestRated.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-primary text-white shadow-md dark:border-card">
                                  <Star className="h-4 w-4 fill-white" />
                                </span>
                              </div>
                              <div className="mb-2 hidden sm:block">
                                <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                                  <BadgeCheck className="h-3 w-3" />
                                  Noté 5★ par les clients
                                </div>
                              </div>
                            </div>
                          </div>

                          <CardContent className="flex flex-1 flex-col px-6 pb-6 pt-12">
                            <div className="flex-1">
                              <h3 className="text-xl font-extrabold tracking-tight">{bestRated.name}</h3>
                              {bestRated.location && (
                                <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  {bestRated.location} • Livraison locale
                                </p>
                              )}

                              <div className="mt-5 rounded-2xl border bg-gradient-to-br from-primary/[0.06] to-emerald-500/[0.06] p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                      <Star
                                        key={s}
                                        className={`h-5 w-5 ${s <= Math.round(bestRated.avg) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"}`}
                                      />
                                    ))}
                                  </div>
                                  <span className="rounded-full bg-amber-500 px-2.5 py-1 text-xs font-black text-white shadow">{bestRated.avg.toFixed(1)} / 5</span>
                                </div>
                                <div className="mt-3 flex items-end justify-between">
                                  <div>
                                    <p className="text-3xl font-black tracking-tight text-primary">{bestRated.avg.toFixed(1)}</p>
                                    <p className="text-xs font-medium text-muted-foreground">
                                      sur {bestRated.count} avis vérifiés
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                      <CheckCircle2 className="h-3.5 w-3.5" />
                                      100% authentiques
                                    </p>
                                    <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                                      <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500" style={{ width: `${(bestRated.avg / 5) * 100}%` }} />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {ratedProducts.length > 0 && (
                                <div className="mt-5">
                                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ses produits phares</p>
                                  <div className="mt-2 flex gap-2">
                                    {ratedProducts.map((pp) => (
                                      <div key={pp.id} className="relative h-16 flex-1 overflow-hidden rounded-xl border bg-muted">
                                        <Image src={pp.image} alt={pp.name} fill className="object-cover" sizes="100px" />
                                      </div>
                                    ))}
                                    {ratedProducts.length < 3 &&
                                      Array.from({ length: 3 - ratedProducts.length }).map((_, i) => (
                                        <div key={`pr-${i}`} className="flex flex-1 items-center justify-center rounded-xl border border-dashed bg-muted/40 text-muted-foreground">
                                          <Leaf className="h-4 w-4" />
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <Button asChild className="mt-6 w-full rounded-full font-semibold shadow-lg shadow-primary/20">
                              <Link href={`/marche?farmer=${encodeURIComponent(bestRated.farmerId)}`} className="gap-2">
                                <Eye className="h-4 w-4" />
                                Voir ses produits
                                <ArrowRight className="h-4 w-4" />
                              </Link>
                            </Button>
                          </CardContent>
                        </div>
                      </ScrollReveal>
                    )
                  })()}
              </div>

              <ScrollReveal delay={260}>
                <p className="mt-8 text-center text-xs text-muted-foreground">
                  Classement mis à jour quotidiennement • Basé sur les commandes des 30 derniers jours et les avis vérifiés TerraFrais
                </p>
              </ScrollReveal>
            </div>
          </section>
        )}

        {/* FEATURES */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <ScrollReveal>
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Pourquoi choisir TerraFrais ?</h2>
                <p className="mt-3 text-muted-foreground">
                  Une plateforme pensée pour créer de la valeur à chaque maillon — du sillon à l&apos;assiette.
                </p>
              </div>
            </ScrollReveal>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <ScrollReveal key={feature.title} delay={index * 80} variant="zoom">
                  <Card className="group relative h-full overflow-hidden border-0 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
                    <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <CardContent className="p-6">
                      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110`}>
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-[15px] font-bold">{feature.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="comment-ca-marche" className="relative overflow-hidden bg-muted/30 py-16 lg:py-20">
          <div className="absolute inset-0 bg-gradient-to-b from-background to-transparent" />
          <div className="container relative mx-auto px-4">
            <ScrollReveal>
              <div className="mx-auto max-w-2xl text-center">
                <Badge className="rounded-full bg-foreground text-background">Simple & rapide</Badge>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Comment ça marche ?</h2>
                <p className="mt-3 text-muted-foreground">Trois étapes pour passer du clic à la récolte.</p>
              </div>
            </ScrollReveal>

            <div className="relative mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
              {/* ligne connectrice desktop */}
              <div className="absolute left-[16%] right-[16%] top-[42px] hidden h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 md:block" />
              {steps.map((item, index) => (
                <ScrollReveal key={item.step} delay={index * 120}>
                  <div className="group relative rounded-[1.6rem] border bg-card p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform duration-300 group-hover:scale-105">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div className="absolute -top-2 right-6 rounded-full border bg-card px-2.5 py-1 text-xs font-bold shadow-sm">
                      {item.step}
                    </div>
                    <h3 className="mt-4 text-base font-bold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <ScrollReveal>
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
                    <Quote className="h-3.5 w-3.5 text-primary" />
                    Témoignages
                  </div>
                  <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Ils parlent de TerraFrais</h2>
                </div>
                <p className="max-w-md text-sm text-muted-foreground">
                  Des milliers de familles et de producteurs ont déjà adopté le circuit court.
                </p>
              </div>
            </ScrollReveal>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {testimonials.map((t, i) => (
                <ScrollReveal key={t.name} delay={i * 100}>
                  <Card className="h-full border-0 bg-muted/40 shadow-sm transition-all duration-300 hover:shadow-md">
                    <CardContent className="p-6">
                      <div className="flex gap-1">
                        {Array.from({ length: t.stars }).map((_, idx) => (
                          <Star key={idx} className="h-4 w-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="mt-4 text-sm leading-relaxed text-foreground">&quot;{t.text}&quot;</p>
                      <div className="mt-6 flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={`https://i.pravatar.cc/100?img=${20 + i}`} />
                          <AvatarFallback>{t.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold leading-none">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{t.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-16">
          <div className="container mx-auto px-4">
            <ScrollReveal>
              <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-emerald-600 to-teal-600 p-[1px]">
                <div className="rounded-[1.95rem] bg-gradient-to-br from-primary via-emerald-600 to-teal-600">
                  <div className="relative overflow-hidden rounded-[1.95rem] px-6 py-10 lg:px-10 lg:py-12">
                    {/* pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.12),transparent_40%)]" />
                    <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                      <div className="text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                          <Leaf className="h-3.5 w-3.5" />
                          Rejoignez le mouvement local
                        </div>
                        <h2 className="mt-3 text-balance text-2xl font-extrabold tracking-tight text-white lg:text-3xl">
                          Prêt à manger mieux tout en soutenant nos agriculteurs ?
                        </h2>
                        <p className="mx-auto mt-3 max-w-xl text-pretty text-sm leading-relaxed text-white/85 lg:mx-0">
                          Inscription acheteur gratuite et instantanée. Les comptes producteurs sont vérifiés par notre équipe pour garantir qualité et traçabilité.
                        </p>
                        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                          <Button size="lg" variant="secondary" asChild className="h-11 rounded-full bg-white px-6 font-semibold text-primary hover:bg-white/90">
                            <Link href="/inscription">Créer mon compte acheteur</Link>
                          </Button>
                          <Button size="lg" variant="outline" asChild className="h-11 rounded-full border-white/30 bg-transparent px-6 font-semibold text-white hover:bg-white/10 hover:text-white">
                            <Link href="/contact">Devenir agriculteur partenaire</Link>
                          </Button>
                        </div>
                        <p className="mt-3 text-xs text-white/70">Aucune carte bancaire requise • Support WhatsApp 7j/7</p>
                      </div>

                      <div className="relative mx-auto hidden w-full max-w-sm lg:block">
                        <div className="relative rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur shadow-2xl">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary">
                              <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">Commande confirmée</p>
                              <p className="text-xs text-white/80">5 kg Tomates Bio • 22 500 FC</p>
                            </div>
                            <Badge className="ml-auto bg-white text-primary hover:bg-white">Payé</Badge>
                          </div>
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm">
                              <span className="font-medium">M-Pesa</span>
                              <span className="font-bold text-emerald-600">✓ Mobile Money</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-white/80">
                              <span>Producteur: Richard DM • Kasaï</span>
                              <span className="inline-flex items-center gap-1"><Truck className="h-3 w-3" /> 24h</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
