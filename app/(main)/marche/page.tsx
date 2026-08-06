"use client"

import { useState, useMemo } from "react"
import { useData } from "@/lib/data-context"
import { useAuth } from "@/lib/auth-context"
import { ProductCard } from "@/components/product-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { CATEGORIES, type Product } from "@/lib/types"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { GuestCheckoutDialog } from "@/components/guest-checkout-dialog"

export default function MarketPage() {
  const { products, addOrder } = useData()
  const { user } = useAuth()
  const { toast } = useToast()

  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string>("all")
  const [location, setLocation] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("recent")
  const [showFilters, setShowFilters] = useState(false)

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [orderQuantity, setOrderQuantity] = useState(1)

  const locations = useMemo(() => {
    const locs = [...new Set(products.map((p) => p.location))]
    return locs.sort()
  }, [products])

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => p.isAvailable && p.quantity > 0)

    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.farmerName.toLowerCase().includes(searchLower),
      )
    }

    if (category !== "all") {
      result = result.filter((p) => p.category === category)
    }

    if (location !== "all") {
      result = result.filter((p) => p.location === location)
    }

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        result.sort((a, b) => b.price - a.price)
        break
      case "recent":
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    return result
  }, [products, search, category, location, sortBy])

  const handleOrder = (product: Product) => {
    if (user?.role === "farmer") {
      toast({
        title: "Action non autorisée",
        description: "Les agriculteurs ne peuvent pas passer de commandes.",
        variant: "destructive",
      })
      return
    }

    setSelectedProduct(product)
    setOrderQuantity(1)
  }

  const confirmOrder = () => {
    if (!selectedProduct || !user) return

    addOrder({
      buyerId: user.id,
      buyerName: user.name,
      buyerPhone: user.phone,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      farmerId: selectedProduct.farmerId,
      farmerName: selectedProduct.farmerName,
      quantity: orderQuantity,
      totalPrice: selectedProduct.price * orderQuantity,
      status: "pending",
    })

    toast({
      title: "Commande passée",
      description: `Votre commande de ${orderQuantity} ${selectedProduct.unit} de ${selectedProduct.name} a été envoyée à ${selectedProduct.farmerName}.`,
    })

    setSelectedProduct(null)
  }

  const clearFilters = () => {
    setSearch("")
    setCategory("all")
    setLocation("all")
    setSortBy("recent")
  }

  const hasActiveFilters = search || category !== "all" || location !== "all"

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Le Marché</h1>
        <p className="mt-2 text-muted-foreground">Découvrez les produits frais de nos agriculteurs locaux</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un produit, un agriculteur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2 sm:w-auto">
            <SlidersHorizontal className="h-4 w-4" />
            Filtres
            {hasActiveFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                !
              </span>
            )}
          </Button>
        </div>

        {showFilters && (
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium">Filtrer les résultats</span>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
                  <X className="h-4 w-4" />
                  Réinitialiser
                </Button>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les catégories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Région</Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les régions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les régions</SelectItem>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Trier par</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Plus récents</SelectItem>
                    <SelectItem value="price-asc">Prix croissant</SelectItem>
                    <SelectItem value="price-desc">Prix décroissant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="mb-4 text-sm text-muted-foreground">
        {filteredProducts.length} produit{filteredProducts.length !== 1 ? "s" : ""} trouvé
        {filteredProducts.length !== 1 ? "s" : ""}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-muted/50 p-12 text-center">
          <p className="text-muted-foreground">Aucun produit ne correspond à vos critères.</p>
          <Button variant="link" onClick={clearFilters} className="mt-2">
            Réinitialiser les filtres
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onOrder={() => handleOrder(product)} />
          ))}
        </div>
      )}

      {/* Order Dialog - Guest or Connected */}
      {user ? (
        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Passer une commande</DialogTitle>
              <DialogDescription>
                {selectedProduct?.name} - {selectedProduct?.farmerName}
              </DialogDescription>
            </DialogHeader>

            {selectedProduct && (
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                  <div>
                    <p className="font-medium">{selectedProduct.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedProduct.price.toFixed(2)} € / {selectedProduct.unit}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Stock: {selectedProduct.quantity} {selectedProduct.unit}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantité ({selectedProduct.unit})</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    max={selectedProduct.quantity}
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(Math.min(Number(e.target.value), selectedProduct.quantity))}
                  />
                </div>

                <div className="rounded-lg bg-primary/10 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total</span>
                    <span className="text-xl font-bold text-primary">
                      {(selectedProduct.price * orderQuantity).toFixed(2)} €
                    </span>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedProduct(null)}>
                Annuler
              </Button>
              <Button onClick={confirmOrder}>Confirmer la commande</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : (
        <GuestCheckoutDialog
          open={!!selectedProduct}
          onOpenChange={(open) => {
            if (!open) setSelectedProduct(null)
          }}
          product={selectedProduct}
          quantity={orderQuantity}
          onQuantityChange={setOrderQuantity}
        />
      )}
    </div>
  )
}
