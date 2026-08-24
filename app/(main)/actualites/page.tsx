"use client"

import { useState } from "react"
import { useData } from "@/lib/data-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollReveal } from "@/components/scroll-reveal"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Newspaper, Calendar, User, Sparkles, ArrowRight, Clock3 } from "lucide-react"
import type { Article } from "@/lib/types"

const CATEGORY_LABELS: Record<Article["category"], string> = {
  agriculteurs: "Agriculteurs",
  produits: "Produits en vogue",
  monde: "Monde agricole",
}

export default function ActualitesPage() {
  const { articles } = useData()
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)

  const sortedArticles = [...(articles || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  // L'article mis à la une par l'admin, sinon le plus récent
  const featured = sortedArticles.find((a) => a.featured) ?? sortedArticles[0]
  const rest = sortedArticles.filter((a) => a.id !== featured?.id)

  return (
    <div>
      {/* Hero compact */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background py-10 lg:py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <ScrollReveal delay={100}>
              <h1 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
                Actualités <span className="text-primary">Agricoles</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
                Le monde paysan, les tendances de produits et les initiatives de nos agriculteurs.
              </p>
            </ScrollReveal>
          </div>
        </div>
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      </section>

      <section className="py-10 lg:py-12">
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
              {/* Article à la une — format compact */}
              <ScrollReveal>
                <Card className="group mb-10 gap-0 overflow-hidden py-0 transition-shadow duration-300 hover:shadow-lg lg:grid lg:grid-cols-[0.9fr_1.1fr]">
                  {featured.imageUrl && (
                    <div className="relative aspect-video overflow-hidden lg:aspect-auto lg:h-full lg:min-h-[200px]">
                      <img
                        src={featured.imageUrl}
                        alt={featured.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <Badge className="absolute left-3 top-3 gap-1 bg-primary px-2.5 py-1 text-xs text-primary-foreground shadow-md">
                        <Sparkles className="h-3 w-3" />
                        À la une
                      </Badge>
                    </div>
                  )}
                  <div className="flex flex-col justify-center p-5 lg:p-6">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {CATEGORY_LABELS[featured.category]}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(featured.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <h2 className="line-clamp-2 text-xl font-bold leading-snug text-foreground lg:text-2xl">
                      {featured.title}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{featured.description}</p>

                    <button
                      onClick={() => setSelectedArticle(featured)}
                      className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-md border border-primary/30 bg-primary/5 px-3.5 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                    >
                      Lire l&apos;article
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>

                    <div className="mt-4 flex items-center gap-2 border-t pt-3 text-xs font-medium text-muted-foreground">
                      <User className="h-3.5 w-3.5" />
                      Par {featured.authorName}
                    </div>
                  </div>
                </Card>
              </ScrollReveal>

              {/* Grille des autres articles */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((article, index) => (
                  <ScrollReveal key={article.id} delay={(index % 3) * 100}>
                    <Card className="group flex h-full flex-col gap-0 overflow-hidden py-0 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
                      {article.imageUrl && (
                        <div className="relative aspect-[16/9] w-full cursor-pointer overflow-hidden">
                          <img
                            src={article.imageUrl}
                            alt={article.title}
                            onClick={() => setSelectedArticle(article)}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <Badge variant="secondary" className="absolute left-3 top-3 text-[11px] shadow-sm">
                            {CATEGORY_LABELS[article.category]}
                          </Badge>
                        </div>
                      )}
                      <CardHeader className="space-y-1.5 px-4 pt-4">
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(article.createdAt).toLocaleDateString("fr-FR")}
                        </div>
                        <CardTitle
                          onClick={() => setSelectedArticle(article)}
                          className="line-clamp-2 cursor-pointer text-base leading-snug transition-colors group-hover:text-primary"
                        >
                          {article.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 text-xs">{article.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="mt-auto flex items-center justify-between px-4 pb-4 pt-2">
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <User className="h-3.5 w-3.5" />
                          {article.authorName.split(" ")[0]}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 px-2 text-xs text-primary hover:text-primary"
                          onClick={() => setSelectedArticle(article)}
                        >
                          Lire
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </CardContent>
                    </Card>
                  </ScrollReveal>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Dialog de lecture d'article */}
      <Dialog open={!!selectedArticle} onOpenChange={(open) => !open && setSelectedArticle(null)}>
        <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-2xl">
          {selectedArticle && (
            <>
              {selectedArticle.imageUrl && (
                <div className="relative aspect-video w-full overflow-hidden">
                  <img src={selectedArticle.imageUrl} alt={selectedArticle.title} className="h-full w-full object-cover" />
                  <Badge className="absolute left-4 top-4 gap-1 border-0 bg-primary/95 text-primary-foreground shadow-md backdrop-blur">
                    <Sparkles className="h-3 w-3" />
                    {CATEGORY_LABELS[selectedArticle.category]}
                  </Badge>
                </div>
              )}
              <div className="p-6">
                <DialogHeader className="items-start space-y-2 text-left">
                  <DialogTitle className="pr-6 text-left text-xl font-bold leading-snug sm:text-2xl">
                    {selectedArticle.title}
                  </DialogTitle>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {selectedArticle.authorName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(selectedArticle.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock3 className="h-3.5 w-3.5" />
                      {Math.max(1, Math.ceil(selectedArticle.content.split(/\s+/).length / 200))} min de lecture
                    </span>
                  </div>
                </DialogHeader>
                {selectedArticle.description && (
                  <p className="mt-4 border-l-2 border-primary/50 pl-3 text-sm italic text-muted-foreground">
                    {selectedArticle.description}
                  </p>
                )}
                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {selectedArticle.content}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
