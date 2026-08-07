"use client"

import { useData } from "@/lib/data-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollReveal } from "@/components/scroll-reveal"
import { Newspaper, Calendar, User, Sparkles } from "lucide-react"

export default function ActualitesPage() {
  const { articles } = useData()

  const sortedArticles = [...(articles || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  const [featured, ...rest] = sortedArticles

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <ScrollReveal>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
                <Newspaper className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary">Le Blog Agricole</span>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <h1 className="text-balance text-4xl font-bold text-foreground sm:text-5xl">
                Actualités <span className="text-primary">Agricoles</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <p className="mt-6 text-pretty text-lg text-muted-foreground">
                Découvrez les dernières informations sur le monde paysan, les nouvelles tendances de produits, et les
                initiatives de nos agriculteurs.
              </p>
            </ScrollReveal>
          </div>
        </div>
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {!featured ? (
            <ScrollReveal>
              <Card className="mx-auto mt-4 max-w-md border-dashed bg-muted/50">
                <CardContent className="flex flex-col items-center p-12 text-center">
                  <Newspaper className="mb-4 h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium">Aucun article disponible</h3>
                  <p className="mt-2 text-muted-foreground">Revenez plus tard pour lire nos actualités !</p>
                </CardContent>
              </Card>
            </ScrollReveal>
          ) : (
            <>
              {/* Article à la une */}
              <ScrollReveal>
                <Card className="group mb-12 gap-0 overflow-hidden py-0 transition-shadow duration-300 hover:shadow-xl lg:grid lg:grid-cols-2">
                  {featured.imageUrl && (
                    <div className="relative aspect-video overflow-hidden lg:aspect-auto lg:h-full lg:min-h-[320px]">
                      <img
                        src={featured.imageUrl}
                        alt={featured.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <Badge className="absolute left-4 top-4 gap-1.5 bg-primary text-primary-foreground shadow-lg">
                        <Sparkles className="h-3.5 w-3.5" />
                        À la une
                      </Badge>
                    </div>
                  )}
                  <div className="flex flex-col justify-center p-6 lg:p-10">
                    <div className="mb-3 flex items-center gap-3">
                      <Badge className="capitalize" variant="secondary">
                        {featured.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(featured.createdAt).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground lg:text-3xl">{featured.title}</h2>
                    <p className="mt-3 text-muted-foreground">{featured.description}</p>
                    <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-foreground/80">{featured.content}</p>
                    <div className="mt-6 flex items-center gap-2 border-t pt-4 text-sm font-medium text-muted-foreground">
                      <User className="h-4 w-4" />
                      Par {featured.authorName}
                    </div>
                  </div>
                </Card>
              </ScrollReveal>

              {/* Grille des autres articles */}
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((article, index) => (
                  <ScrollReveal key={article.id} delay={(index % 3) * 100}>
                    <Card className="group flex h-full flex-col gap-0 overflow-hidden py-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                      {article.imageUrl && (
                        <div className="aspect-video w-full overflow-hidden">
                          <img
                            src={article.imageUrl}
                            alt={article.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <CardHeader className="pt-6">
                        <div className="mb-2 flex items-start justify-between">
                          <Badge className="capitalize" variant="secondary">
                            {article.category}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(article.createdAt).toLocaleDateString("fr-FR")}
                          </div>
                        </div>
                        <CardTitle className="line-clamp-2 text-xl transition-colors group-hover:text-primary">
                          {article.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">{article.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-1 flex-col pb-6 font-sans">
                        <div className="mb-6 flex-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                          {article.content}
                        </div>
                        <div className="mt-auto flex items-center gap-2 border-t pt-4 text-sm font-medium text-muted-foreground">
                          <User className="h-4 w-4" />
                          Par {article.authorName}
                        </div>
                      </CardContent>
                    </Card>
                  </ScrollReveal>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
