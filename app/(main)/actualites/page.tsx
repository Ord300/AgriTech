"use client"

import { useData } from "@/lib/data-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Newspaper, Calendar, User } from "lucide-react"

export default function ActualitesPage() {
  const { articles } = useData()

  const sortedArticles = [...(articles || [])].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-4 flex items-center justify-center gap-3">
            <Newspaper className="h-10 w-10 text-primary" />
            Actualités Agricoles
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Découvrez les dernières informations sur le monde paysan, les nouvelles tendances de produits, et les initiatives de nos agriculteurs.
          </p>
        </div>

        {!sortedArticles || sortedArticles.length === 0 ? (
          <Card className="max-w-md mx-auto mt-12 bg-muted/50 border-dashed">
            <CardContent className="flex flex-col items-center p-12 text-center">
              <Newspaper className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-medium">Aucun article disponible</h3>
              <p className="text-muted-foreground mt-2">Revenez plus tard pour lire nos actualités !</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {sortedArticles.map((article) => (
              <Card key={article.id} className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300">
                {article.imageUrl && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={article.imageUrl} 
                      alt="" 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge className="capitalize" variant="secondary">{article.category}</Badge>
                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(article.createdAt).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                  <CardTitle className="text-xl line-clamp-2">{article.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{article.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col font-sans">
                  <div className="text-sm text-foreground mb-6 flex-1 whitespace-pre-wrap leading-relaxed">
                    {article.content}
                  </div>
                  <div className="mt-auto pt-4 border-t flex items-center gap-2 text-sm text-muted-foreground font-medium">
                    <User className="h-4 w-4" />
                    Par {article.authorName}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
    </div>
  )
}
