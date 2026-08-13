"use client"

import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { analyzeFarmerSales } from "@/lib/ai-insights"
import type { Order, Product } from "@/lib/types"
import { BrainCircuit, PackageX, Sparkles, TrendingDown, TrendingUp, Trophy } from "lucide-react"

interface FarmerAiInsightsPanelProps {
  orders: Order[]
  products: Product[]
  farmerId: string
}

export function FarmerAiInsightsPanel({ orders, products, farmerId }: FarmerAiInsightsPanelProps) {
  const analysis = useMemo(
    () => analyzeFarmerSales(orders, products, farmerId),
    [orders, products, farmerId],
  )

  const { bestSeller, risingProducts, restockAlerts, insights } = analysis

  return (
    <Card className="relative overflow-hidden border-lime-400/20 bg-gradient-to-br from-lime-500/10 via-card/80 to-emerald-500/10 shadow-[0_8px_30px_rgba(163,230,53,0.08)] backdrop-blur-xl">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-lime-400/10 blur-3xl" />
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400/15 shadow-[0_0_15px_rgba(163,230,53,0.25)]">
              <BrainCircuit className="h-5 w-5 text-lime-400" />
            </div>
            <div>
              <CardTitle className="text-base text-foreground">Assistant IA — Analyse & Prédictions</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Analyse de vos ventes et prévisions pour les 7 prochains jours
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="gap-1 border-lime-400/30 text-lime-400">
            <Sparkles className="h-3 w-3" />
            IA
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            L&apos;assistant analysera vos ventes dès que vos premières commandes seront enregistrées.
          </p>
        ) : (
          <div className="space-y-4">
            {/* Produit le plus vendu */}
            {bestSeller && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-400/15">
                  <Trophy className="h-4 w-4 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    Produit le plus vendu : <span className="text-amber-400">{bestSeller.productName}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {bestSeller.totalQuantity} {bestSeller.unit} vendus · {bestSeller.totalRevenue.toFixed(2)} FC de revenus ·
                    score de demande {bestSeller.demandScore}/100
                  </p>
                </div>
              </div>
            )}

            {/* Prédictions de ventes */}
            {risingProducts.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Prédictions de ventes (7 prochains jours)
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {risingProducts.slice(0, 4).map((insight) => (
                    <div key={insight.productId} className="rounded-lg border border-white/5 bg-card/50 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium text-foreground">{insight.productName}</p>
                        <Badge variant="outline" className="shrink-0 gap-1 border-lime-400/30 text-lime-400">
                          <TrendingUp className="h-3 w-3" />
                          +{insight.trendPercent}%
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        ≈ <span className="font-semibold text-foreground">{insight.projectedQuantity} {insight.unit}</span> prévues
                        cette semaine ({insight.recentQuantity} vendues sur 7 jours)
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alertes de réapprovisionnement */}
            {restockAlerts.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Recommandations de stock
                </p>
                {restockAlerts.slice(0, 3).map((insight) => (
                  <div
                    key={insight.productId}
                    className="flex items-start gap-3 rounded-lg border border-orange-400/20 bg-orange-400/5 p-3"
                  >
                    <PackageX className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{insight.productName}</span> : stock épuisé dans
                      environ <span className="font-semibold text-orange-400">{insight.daysOfStockLeft} jour{insight.daysOfStockLeft !== 1 ? "s" : ""}</span> au
                      rythme actuel ({insight.currentStock} {insight.unit} restants). Pensez à réapprovisionner.
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Produits en baisse */}
            {insights.some((i) => i.trendDirection === "down") && (
              <div className="flex flex-wrap gap-2">
                {insights
                  .filter((i) => i.trendDirection === "down")
                  .slice(0, 3)
                  .map((insight) => (
                    <Badge key={insight.productId} variant="outline" className="gap-1 border-white/10 text-muted-foreground">
                      <TrendingDown className="h-3 w-3" />
                      {insight.productName} : {insight.trendPercent}% cette semaine
                    </Badge>
                  ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
