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
import { Leaf, Users, TrendingUp, ShieldCheck, ArrowRight, Sprout, Handshake, Truck, Trophy, Star, MapPin } from "lucide-react"

export default function HomePage() {
  return (
    <DataProvider>
      <HomeContent />
    </DataProvider>
  )
}

function HomeContent() {
  const { user, isLoading } = useAuth()
  const { showcaseProducts, orders, users, ratings } = useData()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      const dashboardLink = user.role === "farmer" ? "/agriculteur" : user.role === "buyer" ? "/acheteur" : "/admin"
      router.replace(dashboardLink)
    }
  }, [user, isLoading, router])

  // Meilleur vendeur du mois : fenêtre glissante de 30 jours ancrée sur la
  // commande la plus récente (robuste aux jeux de données de démonstration).
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

  // Agriculteur le mieux noté : moyenne des étoiles, départagée par le nombre d'avis
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
      description: "Mettez en relation agriculteurs et acheteurs sans intermédiaires pour des prix plus justes.",
    },
    {
      icon: ShieldCheck,
      title: "Produits de Qualité",
      description: "Des produits frais, locaux et traçables directement depuis les exploitations agricoles.",
    },
    {
      icon: TrendingUp,
      title: "Meilleurs Revenus",
      description: "Les agriculteurs gardent une plus grande part de leurs ventes en éliminant les intermédiaires.",
    },
    {
      icon: Truck,
      title: "Circuit Court",
      description: "Réduisez l'empreinte carbone avec des livraisons locales et des chaînes courtes.",
    },
  ]

  const steps = [
    {
      icon: Sprout,
      step: "1",
      title: "Inscrivez-vous",
      description: "Créez votre compte en tant qu'agriculteur ou acheteur en quelques clics.",
    },
    {
      icon: Leaf,
      step: "2",
      title: "Publiez ou Parcourez",
      description: "Les agriculteurs publient leurs produits, les acheteurs parcourent le catalogue.",
    },
    {
      icon: Handshake,
      step: "3",
      title: "Connectez-vous",
      description: "Passez commande directement et établissez des relations durables.",
    },
  ]

  const showcaseList = showcaseProducts

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Texte */}
              <div className="text-center lg:text-left">
                {/* <ScrollReveal>
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                    <Leaf className="h-4 w-4" />
                    Plateforme Agricole Moderne
                  </div>
                </ScrollReveal> */}
                <ScrollReveal delay={100}>
                  <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    Du Champ <span className="text-primary">à Votre Table</span>
                  </h1>
                </ScrollReveal>
                <ScrollReveal delay={200}>
                  <p className="mt-6 text-pretty text-lg text-muted-foreground lg:text-xl">
                    TerraFrais connecte directement les agriculteurs aux consommateurs. Achetez des produits frais,
                    locaux et de qualité tout en soutenant l&apos;agriculture locale.
                  </p>
                </ScrollReveal>
                <ScrollReveal delay={300}>
                  <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                    <Button size="lg" asChild className="text-base">
                      <Link href="/marche">
                        Explorer le Marché
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild className="text-base bg-transparent">
                      <Link href="/inscription">Créer un Compte</Link>
                    </Button>
                  </div>
                </ScrollReveal>
                <ScrollReveal delay={400}>
                  <div className="mt-10 flex items-center justify-center gap-8 lg:justify-start">
                    <div>
                      <p className="text-2xl font-bold text-primary">100%</p>
                      <p className="text-sm text-muted-foreground">Produits locaux</p>
                    </div>
                    <div className="h-10 w-px bg-border" />
                    <div>
                      <p className="text-2xl font-bold text-primary">0</p>
                      <p className="text-sm text-muted-foreground">Intermédiaire</p>
                    </div>
                    <div className="h-10 w-px bg-border" />
                    <div>
                      <p className="text-2xl font-bold text-primary">24h</p>
                      <p className="text-sm text-muted-foreground">Du champ à l&apos;assiette</p>
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              {/* Slider d'images */}
              <ScrollReveal delay={200} className="relative mx-auto w-full max-w-md lg:max-w-none">
                <div className="relative mb-10 lg:mb-0">
                  <HeroSlider />
                </div>
              </ScrollReveal>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        </section>

        {/* Products Gallery Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <ScrollReveal>
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div>
                  <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Nos Produits du Moment</h2>
                  <p className="mt-2 text-muted-foreground">
                    Une sélection de produits frais proposés par nos agriculteurs partenaires.
                  </p>
                </div>
                <Button variant="outline" asChild className="gap-2 bg-transparent">
                  <Link href="/marche">
                    Voir tout le marché
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </ScrollReveal>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {showcaseList.map((product, index) => (
                <ScrollReveal key={product.id} delay={index * 100}>
                  <Link href="/marche" className="group relative block overflow-hidden rounded-2xl shadow-md transition-shadow duration-300 hover:shadow-xl">
                    <div className="relative aspect-[4/3]">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-lg font-semibold text-white">{product.name}</p>
                      <p className="text-sm text-white/80">{product.category}</p>
                    </div>
                    <div className="absolute right-4 top-4 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-card/90 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <ArrowRight className="h-4 w-4 text-foreground" />
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Farmers of the Month Section */}
        {(topSeller || bestRated) && (
          <section className="bg-muted/30 py-20">
            <div className="container mx-auto px-4">
              <ScrollReveal>
                <div className="mx-auto max-w-2xl text-center">
                  <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Nos Agriculteurs à l&apos;Honneur</h2>
                  <p className="mt-4 text-muted-foreground">
                    Découvrez les producteurs qui se distinguent ce mois-ci par leurs ventes et la satisfaction de leurs clients.
                  </p>
                </div>
              </ScrollReveal>

              <div className="mx-auto mt-16 grid max-w-4xl gap-8 md:grid-cols-2">
                {/* Meilleur vendeur du mois */}
                {topSeller && (
                  <ScrollReveal delay={100} variant="zoom">
                    <Card className="group relative h-full overflow-hidden border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-card shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl" />
                      <CardContent className="relative p-8 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30 transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110">
                          <Trophy className="h-7 w-7 text-white" />
                        </div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                          Meilleur vendeur du mois
                        </p>
                        <Avatar className="mx-auto mt-5 h-20 w-20 border-4 border-amber-500/30 shadow-lg">
                          <AvatarImage src={topSeller.avatar} />
                          <AvatarFallback className="bg-amber-500/20 text-2xl font-bold text-amber-600 dark:text-amber-400">
                            {topSeller.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="mt-4 text-xl font-bold text-foreground">{topSeller.name}</h3>
                        {topSeller.location && (
                          <p className="mt-1 flex items-center justify-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            {topSeller.location}
                          </p>
                        )}
                        <div className="mt-5 flex items-center justify-center gap-6 border-t border-border pt-5">
                          <div>
                            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{topSeller.quantity}</p>
                            <p className="text-xs text-muted-foreground">unités vendues</p>
                          </div>
                          <div className="h-8 w-px bg-border" />
                          <div>
                            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{topSeller.revenue.toFixed(0)} FC</p>
                            <p className="text-xs text-muted-foreground">de ventes ce mois-ci</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </ScrollReveal>
                )}

                {/* Agriculteur le mieux noté */}
                {bestRated && (
                  <ScrollReveal delay={200} variant="zoom">
                    <Card className="group relative h-full overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
                      <CardContent className="relative p-8 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/30 transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110">
                          <Star className="h-7 w-7 text-primary-foreground" />
                        </div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                          Agriculteur le mieux noté
                        </p>
                        <Avatar className="mx-auto mt-5 h-20 w-20 border-4 border-primary/30 shadow-lg">
                          <AvatarImage src={bestRated.avatar} />
                          <AvatarFallback className="bg-primary/15 text-2xl font-bold text-primary">
                            {bestRated.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="mt-4 text-xl font-bold text-foreground">{bestRated.name}</h3>
                        {bestRated.location && (
                          <p className="mt-1 flex items-center justify-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            {bestRated.location}
                          </p>
                        )}
                        <div className="mt-5 border-t border-border pt-5">
                          <div className="flex items-center justify-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-5 w-5 ${star <= Math.round(bestRated.avg) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                              />
                            ))}
                          </div>
                          <p className="mt-2 text-2xl font-bold text-primary">{bestRated.avg.toFixed(1)} / 5</p>
                          <p className="text-xs text-muted-foreground">
                            basé sur {bestRated.count} avis client{bestRated.count !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </ScrollReveal>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Features Section */}
        <section className="bg-muted/30 py-20">
          <div className="container mx-auto px-4">
            <ScrollReveal>
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Pourquoi Choisir TerraFrais ?</h2>
                <p className="mt-4 text-muted-foreground">
                  Une plateforme conçue pour simplifier le commerce agricole et créer de la valeur pour tous les
                  acteurs.
                </p>
              </div>
            </ScrollReveal>

            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <ScrollReveal key={feature.title} delay={index * 100} variant="zoom">
                  <Card className="group relative h-full overflow-hidden border-0 bg-card shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <CardContent className="p-6">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/25 transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110">
                        <feature.icon className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <ScrollReveal>
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Comment Ça Marche ?</h2>
                <p className="mt-4 text-muted-foreground">
                  Commencez à vendre ou acheter des produits agricoles en trois étapes simples.
                </p>
              </div>
            </ScrollReveal>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {steps.map((item, index) => (
                <ScrollReveal key={item.step} delay={index * 150}>
                  <div className="group relative text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-transform duration-300 group-hover:scale-110">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-2 text-muted-foreground">{item.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="pb-20">
          <div className="container mx-auto px-4">
            <ScrollReveal>
              <Card className="overflow-hidden bg-primary">
                <CardContent className="flex flex-col items-center justify-between gap-6 p-8 text-center md:flex-row md:text-left lg:p-12">
                  <div>
                    <h2 className="text-2xl font-bold text-primary-foreground lg:text-3xl">
                      Prêt à Rejoindre la Communauté ?
                    </h2>
                    <p className="mt-2 text-primary-foreground/80">
                      Inscrivez-vous gratuitement en tant qu&apos;acheteur. Les comptes agriculteurs sont créés par
                      l&apos;administrateur.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button size="lg" variant="secondary" asChild>
                      <Link href="/contact">Créer un compte Agriculteur</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
