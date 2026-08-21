import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollReveal } from "@/components/scroll-reveal"
import { Leaf, Target, Heart, Globe, ShieldCheck } from "lucide-react"

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: "Notre Mission",
      description:
        "Créer un pont direct entre les agriculteurs et les consommateurs pour un commerce plus équitable et transparent.",
    },
    {
      icon: Heart,
      title: "Nos Valeurs",
      description: "Nous croyons en l'agriculture durable, le commerce équitable et le soutien aux producteurs locaux.",
    },
    {
      icon: Globe,
      title: "Notre Impact",
      description: "Réduire l'empreinte carbone en favorisant les circuits courts et l'économie locale.",
    },
  ]

  const highlights = [
    "Une rémunération juste pour les producteurs",
    "Des produits frais, traçables et de saison",
    "Une plateforme simple, accessible à tous",
  ]

  const stats = [
    { value: "100%", label: "Produits locaux" },
    { value: "0", label: "Intermédiaire" },
    { value: "24h", label: "Du champ à la table" },
    { value: "7j/7", label: "Accompagnement" },
  ]

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            {/* <ScrollReveal>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
                <Leaf className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary">Notre Histoire</span>
              </div>
            </ScrollReveal> */}
            <ScrollReveal delay={100}>
              <h1 className="text-balance text-4xl font-bold text-foreground sm:text-5xl">
                À Propos de <span className="text-primary">TerraFrais</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <p className="mt-6 text-pretty text-lg text-muted-foreground">
                TerraFrais est née d&apos;une conviction simple : les agriculteurs méritent une rémunération juste pour
                leur travail, et les consommateurs méritent des produits frais et de qualité.
              </p>
            </ScrollReveal>
          </div>
        </div>
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      </section>

      {/* Histoire avec image */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto grid items-center gap-12 px-4 lg:grid-cols-2 lg:gap-16">
          <ScrollReveal variant="left">
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border-4 border-card shadow-2xl">
                <Image
                  src="/fresh-milk-bottle-farm.jpg"
                  alt="Produits fermiers frais de nos exploitations partenaires"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-4 animate-float-y rounded-2xl border bg-card/95 px-5 py-4 shadow-xl backdrop-blur sm:-right-6">
                <p className="text-2xl font-bold text-primary">100%</p>
                <p className="text-sm text-muted-foreground">Circuit court</p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="right">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Une agriculture plus humaine</h2>
              <p className="mt-4 text-muted-foreground">
                Derrière chaque produit, il y a un agriculteur, une famille et un savoir-faire. Notre plateforme
                supprime les intermédiaires pour que cette valeur revienne à ceux qui la créent.
              </p>
              <p className="mt-4 text-muted-foreground">
                Nous travaillons chaque jour pour rapprocher les champs de votre assiette, en toute transparence.
              </p>
              <ul className="mt-6 space-y-3">
                {highlights.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                    </span>
                    <span className="text-sm text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Valeurs */}
      <section className="bg-muted/30 py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Ce Qui Nous Anime</h2>
              <p className="mt-4 text-muted-foreground">
                Trois engagements guident chacune de nos décisions.
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {values.map((value, index) => (
              <ScrollReveal key={value.title} delay={index * 120} variant="zoom">
                <Card className="group relative h-full overflow-hidden border-0 bg-card shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/25 transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110">
                      <value.icon className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">{value.title}</h3>
                    <p className="mt-3 text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Bandeau de chiffres */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="grid gap-8 rounded-3xl bg-primary p-8 text-center text-primary-foreground shadow-xl shadow-primary/20 sm:grid-cols-2 lg:grid-cols-4 lg:p-12">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-4xl font-bold">{stat.value}</p>
                  <p className="mt-1 text-sm text-primary-foreground/80">{stat.label}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Engagements par public */}
      <section className="pb-16 lg:pb-20">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-foreground">Notre Engagement</h2>
              <p className="mt-4 text-muted-foreground">
                Nous nous engageons à offrir une plateforme simple, accessible à tous, même aux utilisateurs peu
                familiarisés avec le numérique.
              </p>
            </div>
          </ScrollReveal>

          <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
            <ScrollReveal variant="left">
              <div className="h-full rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                <h4 className="font-semibold text-foreground">Pour les Agriculteurs</h4>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 shrink-0 text-primary" />
                    Visibilité accrue de vos produits
                  </li>
                  <li className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 shrink-0 text-primary" />
                    Gestion simplifiée des commandes
                  </li>
                  <li className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 shrink-0 text-primary" />
                    Accès direct aux acheteurs
                  </li>
                  <li className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 shrink-0 text-primary" />
                    Meilleure marge sur vos ventes
                  </li>
                </ul>
              </div>
            </ScrollReveal>
            <ScrollReveal variant="right">
              <div className="h-full rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                <h4 className="font-semibold text-foreground">Pour les Acheteurs</h4>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 shrink-0 text-primary" />
                    Produits frais et locaux
                  </li>
                  <li className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 shrink-0 text-primary" />
                    Traçabilité garantie
                  </li>
                  <li className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 shrink-0 text-primary" />
                    Prix justes et transparents
                  </li>
                  <li className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 shrink-0 text-primary" />
                    Soutien à l&apos;agriculture locale
                  </li>
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  )
}
