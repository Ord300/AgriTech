"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Leaf, Users, TrendingUp, ShieldCheck, ArrowRight, Sprout, Handshake, Truck } from "lucide-react"

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      const dashboardLink = user.role === "farmer" ? "/agriculteur" : user.role === "buyer" ? "/acheteur" : "/admin"
      router.replace(dashboardLink)
    }
  }, [user, isLoading, router])

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

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background py-20 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Leaf className="h-4 w-4" />
                Plateforme Agricole Moderne
              </div>
              <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Du Champ à Votre Table, <span className="text-primary">Sans Intermédiaires</span>
              </h1>
              <p className="mt-6 text-pretty text-lg text-muted-foreground lg:text-xl">
                AgriMarché connecte directement les agriculteurs aux consommateurs. Achetez des produits frais, locaux
                et de qualité tout en soutenant l&apos;agriculture locale.
              </p>
              <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
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
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Pourquoi Choisir AgriMarché ?</h2>
              <p className="mt-4 text-muted-foreground">
                Une plateforme conçue pour simplifier le commerce agricole et créer de la valeur pour tous les acteurs.
              </p>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <Card key={feature.title} className="border-0 bg-muted/50">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="bg-muted/30 py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Comment Ça Marche ?</h2>
              <p className="mt-4 text-muted-foreground">
                Commencez à vendre ou acheter des produits agricoles en trois étapes simples.
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {steps.map((item) => (
                <div key={item.step} className="relative text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <Card className="overflow-hidden bg-primary">
              <CardContent className="flex flex-col items-center justify-between gap-6 p-8 text-center md:flex-row md:text-left lg:p-12">
                <div>
                  <h2 className="text-2xl font-bold text-primary-foreground lg:text-3xl">
                    Prêt à Rejoindre la Communauté ?
                  </h2>
                  <p className="mt-2 text-primary-foreground/80">
                    Inscrivez-vous gratuitement en tant qu&apos;acheteur. Les comptes agriculteurs sont créés par l&apos;administrateur.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button size="lg" variant="secondary" asChild>
                    <Link href="/inscription">Créer un compte Acheteur</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
