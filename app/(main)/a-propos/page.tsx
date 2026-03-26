import { Card, CardContent } from "@/components/ui/card"
import { Leaf, Target, Heart, Globe } from "lucide-react"

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

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
          <Leaf className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-primary">Notre Histoire</span>
        </div>
        <h1 className="text-4xl font-bold text-foreground">À Propos d&apos;AgriMarché</h1>
        <p className="mt-6 text-lg text-muted-foreground">
          AgriMarché est née d&apos;une conviction simple : les agriculteurs méritent une rémunération juste pour leur
          travail, et les consommateurs méritent des produits frais et de qualité.
        </p>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-3">
        {values.map((value) => (
          <Card key={value.title} className="border-0 bg-muted/50">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <value.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">{value.title}</h3>
              <p className="mt-3 text-muted-foreground">{value.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-16 rounded-2xl bg-primary/5 p-8 lg:p-12">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-foreground">Notre Engagement</h2>
          <p className="mt-4 text-muted-foreground">
            Nous nous engageons à offrir une plateforme simple, accessible à tous, même aux utilisateurs peu
            familiarisés avec le numérique. Chaque fonctionnalité est pensée pour faciliter le quotidien des
            agriculteurs et des acheteurs.
          </p>
          <div className="mt-8 grid gap-4 text-left sm:grid-cols-2">
            <div className="rounded-lg bg-card p-4">
              <h4 className="font-semibold text-foreground">Pour les Agriculteurs</h4>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>Visibilité accrue de vos produits</li>
                <li>Gestion simplifiée des commandes</li>
                <li>Accès direct aux acheteurs</li>
                <li>Meilleure marge sur vos ventes</li>
              </ul>
            </div>
            <div className="rounded-lg bg-card p-4">
              <h4 className="font-semibold text-foreground">Pour les Acheteurs</h4>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>Produits frais et locaux</li>
                <li>Traçabilité garantie</li>
                <li>Prix justes et transparents</li>
                <li>Soutien à l&apos;agriculture locale</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
