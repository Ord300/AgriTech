"use client"

import { useState } from "react"

import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, User, Phone, Mail, Calendar, ExternalLink, MessageSquare, ShoppingCart, BadgeCheck, ShieldAlert } from "lucide-react"
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

  return (
    <Card className="group h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <Badge className="absolute left-3 top-3 border-0 bg-card/90 text-foreground shadow-sm backdrop-blur">{categoryLabel}</Badge>
        {!product.isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/60">
            <span className="rounded-md bg-card px-3 py-1 text-sm font-medium">Indisponible</span>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-foreground">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {product.farmerName}
          </span>
          {isFarmerCertified && (
            <span className="flex items-center gap-1 font-medium text-lime-600">
              <BadgeCheck className="h-4 w-4 fill-lime-500/20 text-lime-600" />
              Certifié
            </span>
          )}
          {farmer?.rating && (
            <span className="flex items-center gap-1 text-yellow-600 font-medium">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              {farmer.rating} ({farmer.reviewCount})
            </span>
          )}
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {product.location}
          </span>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-primary">{product.price.toFixed(2)} FC</span>
          <span className="text-sm text-muted-foreground">/ {product.unit}</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Stock: {product.quantity} {product.unit}
        </p>
      </CardContent>
      {showOrderButton && (
        <CardFooter className="flex flex-col gap-2 p-4 pt-0">
          <Button className="w-full gap-2" onClick={handleAddToCart} disabled={!product.isAvailable || product.quantity === 0}>
            <ShoppingCart className="h-4 w-4" />
            Ajouter au panier
          </Button>

          <div className="grid grid-cols-2 gap-2 w-full">
            <Button variant="outline" className="w-full gap-2" onClick={() => setContactDialogOpen(true)}>
              <MessageSquare className="h-4 w-4" />
              Contacter
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full gap-2">
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
                        </div>
                      </div>

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
