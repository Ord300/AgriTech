import type { Order, Product } from "./types"

/**
 * Module d'analyse intelligente des ventes de l'agriculteur.
 *
 * Moteur heuristique embarqué (aucune API externe requise) : il agrège
 * l'historique des commandes, mesure la vélocité des ventes sur fenêtres
 * glissantes de 7 jours, détecte les tendances et projette la demande
 * des prochains jours. La structure est prête à être remplacée par un
 * appel à un modèle d'IA externe si besoin.
 */

export interface ProductInsight {
  productId: string
  productName: string
  unit: string
  /** Quantité totale vendue (toutes commandes non annulées) */
  totalQuantity: number
  /** Chiffre d'affaires total généré */
  totalRevenue: number
  /** Quantité vendue sur les 7 derniers jours */
  recentQuantity: number
  /** Quantité vendue sur les 7 jours précédents */
  previousQuantity: number
  /** Variation en % entre les deux fenêtres (Infinity traité comme 100) */
  trendPercent: number
  trendDirection: "up" | "down" | "stable"
  /** Score de demande 0-100 (vélocité + tendance + fréquence) */
  demandScore: number
  /** Projection des ventes pour les 7 prochains jours */
  projectedQuantity: number
  /** Stock actuel restant */
  currentStock: number
  /** Jours de stock restants au rythme actuel (null si pas de ventes récentes) */
  daysOfStockLeft: number | null
  restockSuggested: boolean
}

export interface FarmerAiAnalysis {
  bestSeller: ProductInsight | null
  /** Produits triés par score de demande décroissant */
  insights: ProductInsight[]
  /** Produits dont la demande monte (prédiction de ventes à venir) */
  risingProducts: ProductInsight[]
  /** Alertes de réapprovisionnement */
  restockAlerts: ProductInsight[]
  generatedAt: string
}

const DAY_MS = 24 * 60 * 60 * 1000
const WINDOW_DAYS = 7

export function analyzeFarmerSales(
  orders: Order[],
  products: Product[],
  farmerId: string,
): FarmerAiAnalysis {
  const now = Date.now()
  const windowMs = WINDOW_DAYS * DAY_MS

  const farmerOrders = orders.filter(
    (o) => o.farmerId === farmerId && o.status !== "cancelled",
  )

  // Fenêtre d'analyse ancrée sur la vente la plus récente : ainsi l'analyse
  // reste pertinente même sur un historique ancien (données de démonstration).
  const referenceTime = farmerOrders.length
    ? Math.max(...farmerOrders.map((o) => new Date(o.createdAt).getTime()))
    : now

  // Agrégation par produit
  const byProduct = new Map<string, Order[]>()
  for (const order of farmerOrders) {
    const list = byProduct.get(order.productId) ?? []
    list.push(order)
    byProduct.set(order.productId, list)
  }

  const insights: ProductInsight[] = Array.from(byProduct.entries()).map(
    ([productId, productOrders]) => {
      const product = products.find((p) => p.id === productId)
      const productName = productOrders[0]?.productName ?? product?.name ?? "Produit"
      const unit = product?.unit ?? "unité"

      const totalQuantity = productOrders.reduce((sum, o) => sum + o.quantity, 0)
      const totalRevenue = productOrders.reduce((sum, o) => sum + o.totalPrice, 0)

      const recentQuantity = productOrders
        .filter((o) => referenceTime - new Date(o.createdAt).getTime() <= windowMs)
        .reduce((sum, o) => sum + o.quantity, 0)

      const previousQuantity = productOrders
        .filter((o) => {
          const age = referenceTime - new Date(o.createdAt).getTime()
          return age > windowMs && age <= 2 * windowMs
        })
        .reduce((sum, o) => sum + o.quantity, 0)

      // Tendance entre les deux fenêtres
      let trendPercent: number
      if (previousQuantity === 0) {
        trendPercent = recentQuantity > 0 ? 100 : 0
      } else {
        trendPercent = Math.round(((recentQuantity - previousQuantity) / previousQuantity) * 100)
      }
      const trendDirection: ProductInsight["trendDirection"] =
        trendPercent > 10 ? "up" : trendPercent < -10 ? "down" : "stable"

      // Score de demande : vélocité récente (50) + volume total (30) + tendance (20)
      const maxRecent = Math.max(1, ...Array.from(byProduct.values()).map((list) =>
        list
          .filter((o) => referenceTime - new Date(o.createdAt).getTime() <= windowMs)
          .reduce((sum, o) => sum + o.quantity, 0),
      ))
      const maxTotal = Math.max(1, ...Array.from(byProduct.values()).map((list) =>
        list.reduce((sum, o) => sum + o.quantity, 0),
      ))
      const velocityScore = (recentQuantity / maxRecent) * 50
      const volumeScore = (totalQuantity / maxTotal) * 30
      const trendScore = Math.max(0, Math.min(20, 10 + trendPercent / 10))
      const demandScore = Math.round(Math.min(100, velocityScore + volumeScore + trendScore))

      // Projection linéaire sur 7 jours, bornée par la tendance
      const projectedQuantity = Math.max(
        recentQuantity > 0 ? 1 : 0,
        Math.round(recentQuantity * (1 + Math.max(-0.5, Math.min(1, trendPercent / 100)))),
      )

      // Jours de stock restants au rythme des 7 derniers jours
      const currentStock = product?.quantity ?? 0
      const dailyVelocity = recentQuantity / WINDOW_DAYS
      const daysOfStockLeft = dailyVelocity > 0 ? Math.floor(currentStock / dailyVelocity) : null
      const restockSuggested = daysOfStockLeft !== null && daysOfStockLeft <= WINDOW_DAYS

      return {
        productId,
        productName,
        unit,
        totalQuantity,
        totalRevenue,
        recentQuantity,
        previousQuantity,
        trendPercent,
        trendDirection,
        demandScore,
        projectedQuantity,
        currentStock,
        daysOfStockLeft,
        restockSuggested,
      }
    },
  )

  insights.sort((a, b) => b.demandScore - a.demandScore)

  const bestSeller =
    insights.length > 0
      ? [...insights].sort((a, b) => b.totalQuantity - a.totalQuantity)[0]
      : null

  const risingProducts = insights.filter(
    (i) => i.trendDirection === "up" && i.recentQuantity > 0,
  )

  const restockAlerts = insights.filter((i) => i.restockSuggested)

  return {
    bestSeller,
    insights,
    risingProducts,
    restockAlerts,
    generatedAt: new Date().toISOString(),
  }
}
