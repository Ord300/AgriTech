"use client"

import { useState } from "react"

import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, User, Phone, Mail, Calendar, ExternalLink, MessageSquare, ShoppingCart, BadgeCheck, ShieldAlert, Navigation } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Product } from "@/lib/types"
import { CATEGORIES } from "@/lib/types"
import { useData } from "@/lib/data-context"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StarRating } from "./star-rating"
import { FarmerRatings } from "./farmer-ratings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star } from "lucide-react"
import { ContactFarmerDialog } from "./contact-farmer-dialog"
interface ProductCardProps {
  product: Product
  showOrderButton?: boolean
}

export function ProductCard({ product, showOrderButton = true }: ProductCardProps) {
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const { users, products, certificationRequests } = useData()
  const { addToCart, setCartOpen } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()
  const categoryLabel = CATEGORIES.find((c) => c.value === product.category)?.label || product.category

  const farmer = users.find((u) => u.id === product.farmerId)
  const farmerProducts = products.filter((p) => p.farmerId === product.farmerId && p.id !== product.id)
  const isFarmerCertified = certificationRequests.some(
    (r) => r.farmerId === product.farmerId && r.status === "paid"
  )

  const handleAddToCart = () => {
    if (user?.role === "farmer") {
      toast({
        title: "Action non autorisée",
        description: "Les agriculteurs ne peuvent pas passer de commandes.",
        variant: "destructive",
      })
      return
    }
    addToCart(product)
    toast({
      title: "Produit ajouté au panier",
      description: `${product.name} a été ajouté à votre panier.`,
      action: (
        <Button variant="outline" size="sm" onClick={() => setCartOpen(true)}>
          Voir
        </Button>
      ),
    })
  }

  const lowStock = product.quantity > 0 && product.quantity <= 10
  const outOfStock = !product.isAvailable || product.quantity === 0

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden rounded-[1.6rem] border-0 bg-card shadow-sm ring-1 ring-border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/10 hover:ring-primary/10">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <Badge className="border-0 bg-white/95 px-2.5 py-1 text-xs font-semibold text-foreground shadow backdrop-blur">{categoryLabel}</Badge>
          {lowStock && !outOfStock && (
            <Badge variant="destructive" className="border-0 px-2 py-1 text-xs font-bold shadow">
              Stock faible
            </Badge>
          )}
        </div>
        <div className="absolute right-3 top-3 flex flex-col items-end gap-2">
          {product.gps && (
            <Badge className="gap-1 border-0 bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white shadow">
              <Navigation className="h-3 w-3" />
              GPS tracé
            </Badge>
          )}
          {isFarmerCertified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-xs font-bold text-lime-700 shadow backdrop-blur">
              <BadgeCheck className="h-3.5 w-3.5 text-lime-600" />
              Certifié
            </span>
          )}
        </div>
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-[1px]">
            <span className="rounded-full bg-white px-4 py-2 text-sm font-bold shadow">Indisponible</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
            <div className={`h-2 w-2 rounded-full ${outOfStock ? "bg-red-400" : lowStock ? "bg-amber-400" : "bg-emerald-400"}`} />
            {outOfStock ? "Rupture" : lowStock ? `Plus que ${product.quantity}` : `${product.quantity} dispo.`}
          </div>
        </div>
      </div>
      <CardContent className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-[17px] font-extrabold leading-tight text-foreground">{product.name}</h3>
          {farmer?.rating ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              {farmer.rating}
            </span>
          ) : null}
        </div>
        <p className="mt-1 line-clamp-2 min-h-[2.6em] text-[13px] leading-relaxed text-muted-foreground">{product.description}</p>

        <div className="mt-3 flex items-center gap-2">
          <Avatar className="h-7 w-7 border">
            <AvatarImage src={farmer?.avatar} alt={product.farmerName} />
            <AvatarFallback className="text-xs font-bold">{product.farmerName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold leading-none">{product.farmerName}</p>
            <p className="text-xs text-muted-foreground">{farmer?.reviewCount ? `${farmer.reviewCount} avis` : "Nouveau vendeur"}</p>
          </div>
        </div>

        {product.gps ? (
          <a
            href={`https://www.google.com/maps?q=${product.gps.lat},${product.gps.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-all hover:bg-emerald-500 hover:text-white hover:border-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500 dark:hover:text-white"
          >
            <Navigation className="h-3.5 w-3.5" />
            Voir trace GPS
            <ExternalLink className="h-3 w-3 opacity-70" />
          </a>
        ) : (
          <span className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            Traçabilité à venir
          </span>
        )}

        <div className="mt-3 flex items-end justify-between gap-3 border-t pt-3">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-[22px] font-black leading-none text-primary">{product.price.toFixed(0)}</span>
              <span className="text-xs font-bold text-primary">FC</span>
              <span className="text-xs text-muted-foreground">/ {product.unit}</span>
            </div>
            <p className="mt-1 text-xs font-medium text-muted-foreground">Stock : {product.quantity} {product.unit}</p>
          </div>
          <span className={`hidden h-2 w-2 shrink-0 rounded-full sm:block ${outOfStock ? "bg-red-500" : "bg-emerald-500"}`} />
        </div>
      </CardContent>
      {showOrderButton && (
        <CardFooter className="flex flex-col gap-2 p-4 pt-0">
          <Button
            className="w-full gap-2 rounded-full font-semibold shadow-md shadow-primary/20 hover:shadow-lg"
            onClick={handleAddToCart}
            disabled={outOfStock}
          >
            <ShoppingCart className="h-4 w-4" />
            Ajouter au panier
          </Button>

          <div className="grid grid-cols-2 gap-2 w-full">
            <Button variant="outline" className="w-full gap-2 rounded-full" onClick={() => setContactDialogOpen(true)}>
              <MessageSquare className="h-4 w-4" />
              Contacter
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full gap-2 rounded-full">
                  <ExternalLink className="h-4 w-4" />
                  Voir vendeur
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
              <DialogHeader className="p-6 pb-0">
                <DialogTitle className="text-2xl">Informations du Vendeur</DialogTitle>
                <DialogDescription>
                  Détails sur l'agriculteur et ses autres produits disponibles.
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-8">
                  <Tabs defaultValue="info" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="info">Informations</TabsTrigger>
                      <TabsTrigger value="reviews">Avis ({farmer?.reviewCount || 0})</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="info" className="space-y-6 pt-4">
                      {/* Farmer Info */}
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="flex flex-col items-center gap-4 rounded-xl bg-primary/5 p-6 text-center">
                          <Avatar className="h-24 w-24 border-2 border-primary">
                            <AvatarImage src={farmer?.avatar} alt={product.farmerName} />
                            <AvatarFallback className="text-3xl font-bold bg-primary text-primary-foreground">
                              {product.farmerName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="flex flex-wrap items-center justify-center gap-2 text-xl font-bold">
                              {product.farmerName}
                              {isFarmerCertified && (
                                <Badge className="gap-1 border-0 bg-lime-500 text-white">
                                  <BadgeCheck className="h-3.5 w-3.5" />
                                  Certifié
                                </Badge>
                              )}
                            </h3>
                            <Badge variant="secondary" className="mt-1">Agriculteur</Badge>
                            {farmer?.rating && (
                              <div className="mt-2 flex items-center justify-center gap-1">
                                <StarRating rating={farmer.rating} size="sm" />
                                <span className="text-sm font-medium">({farmer.reviewCount})</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4 pt-4">
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <Phone className="h-4 w-4 text-primary" />
                            <span>{farmer?.phone || "Non renseigné"}</span>
                          </div>
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <Mail className="h-4 w-4 text-primary" />
                            <span>{farmer?.email}</span>
                          </div>
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span>{product.location}</span>
                          </div>
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span>Inscrit le {farmer?.createdAt ? new Date(farmer.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : "Inconnu"}</span>
                          </div>
                          {product.gps && (
                            <div className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-emerald-700 dark:text-emerald-300">
                              <Navigation className="h-4 w-4 shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold">Origine tracée GPS</p>
                                <p className="font-mono text-xs text-muted-foreground">
                                  {product.gps.lat.toFixed(6)}, {product.gps.lng.toFixed(6)}
                                </p>
                              </div>
                              <a
                                href={`https://www.google.com/maps?q=${product.gps.lat},${product.gps.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-600"
                              >
                                Voir
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Carte GPS – traçabilité origine */}
                      {product.gps && (
                        <div className="space-y-3 rounded-xl border border-emerald-500/20 bg-card p-3">
                          <h4 className="flex items-center gap-2 text-sm font-semibold">
                            <MapPin className="h-4 w-4 text-emerald-600" />
                            Localisation exacte du champ
                          </h4>
                          <div className="overflow-hidden rounded-lg border">
                            <iframe
                              title={`Carte ${product.name}`}
                              width="100%"
                              height="180"
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                              src={`https://www.openstreetmap.org/export/embed.html?bbox=${product.gps.lng - 0.02},${product.gps.lat - 0.02},${product.gps.lng + 0.02},${product.gps.lat + 0.02}&layer=mapnik&marker=${product.gps.lat},${product.gps.lng}`}
                              style={{ border: 0 }}
                            />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <a
                              href={`https://www.google.com/maps?q=${product.gps.lat},${product.gps.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                            >
                              <Navigation className="h-3.5 w-3.5" />
                              Ouvrir dans Google Maps
                            </a>
                            <a
                              href={`https://www.openstreetmap.org/?mlat=${product.gps.lat}&mlon=${product.gps.lng}#map=15/${product.gps.lat}/${product.gps.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted"
                            >
                              OpenStreetMap
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Coordonnées enregistrées par l&apos;agriculteur lors de l&apos;ajout du produit — permet à l&apos;acheteur de vérifier l&apos;origine.
                          </p>
                        </div>
                      )}

                      {/* Farmer Description */}
                      {farmer?.description && (
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold border-b pb-2">À propos de l'agriculteur</h4>
                          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {farmer.description}
                          </p>
                        </div>
                      )}

                      {/* Avertissement vigilance acheteurs */}
                      <div
                        className={cn(
                          "flex items-start gap-3 rounded-xl border p-4",
                          isFarmerCertified
                            ? "border-lime-500/30 bg-lime-500/5"
                            : "border-amber-500/40 bg-amber-500/10"
                        )}
                      >
                        <ShieldAlert
                          className={cn(
                            "mt-0.5 h-5 w-5 shrink-0",
                            isFarmerCertified ? "text-lime-600" : "text-amber-600"
                          )}
                        />
                        <div className="text-sm">
                          {isFarmerCertified ? (
                            <>
                              <p className="font-semibold text-lime-700 dark:text-lime-400">
                                Vendeur certifié par l&apos;administration
                              </p>
                              <p className="mt-1 text-muted-foreground">
                                L&apos;identité de cet agriculteur a été vérifiée et il a réglé les
                                frais de certification. Vous pouvez acheter en confiance, tout en
                                restant attentif comme pour tout achat en ligne.
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="font-semibold text-amber-700 dark:text-amber-400">
                                Vendeur non certifié — soyez prudent
                              </p>
                              <p className="mt-1 text-muted-foreground">
                                Attention : des personnes mal intentionnées peuvent se faire passer
                                pour des agriculteurs. Vérifiez les avis clients, privilégiez les
                                profils « Certifié » et payez uniquement via la plateforme. Ne
                                versez jamais d&apos;acompte en dehors de TerraFrais et ne partagez
                                jamais vos codes Mobile Money.
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Other Products */}
                      {farmerProducts.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold border-b pb-2">Autres produits de ce vendeur</h4>
                          <div className="grid gap-4 sm:grid-cols-2">
                            {farmerProducts.map((p) => (
                              <div key={p.id} className="flex gap-3 rounded-lg border p-3 items-center">
                                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border">
                                  <Image
                                    src={p.image || "/placeholder.svg"}
                                    alt={p.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{p.name}</p>
                                  <p className="text-sm text-primary font-bold">{p.price.toFixed(2)} FC / {p.unit}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="reviews" className="pt-4">
                      <FarmerRatings farmerId={product.farmerId} />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          </div>
          <ContactFarmerDialog
            open={contactDialogOpen}
            onOpenChange={setContactDialogOpen}
            farmerId={product.farmerId}
            farmerName={product.farmerName}
          />
        </CardFooter>
      )}
    </Card>
  )
}
