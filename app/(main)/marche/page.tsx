"use client"

import { useState, useMemo } from "react"
import { useData } from "@/lib/data-context"
import { ProductCard } from "@/components/product-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CATEGORIES, type ProductCategory } from "@/lib/types"
import {
  Search,
  SlidersHorizontal,
  X,
  Leaf,
  MapPin,
  Package,
  LayoutGrid,
  Carrot,
  Apple,
  Wheat,
  Milk,
  Beef,
  Egg,
  Hexagon,
  ArrowUpDown,
  SearchX,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

const CATEGORY_ICONS: Record<ProductCategory, LucideIcon> = {
  legumes: Carrot,
  fruits: Apple,
  cereales: Wheat,
  "produits-laitiers": Milk,
  viandes: Beef,
  oeufs: Egg,
  miel: Hexagon,
  autres: Package,
}

export default function MarketPage() {
  const { products } = useData()

  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string>("all")
  const [location, setLocation] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("recent")
  const [showFilters, setShowFilters] = useState(false)

  const availableProducts = useMemo(() => products.filter((p) => p.isAvailable && p.quantity > 0), [products])

  const stats = useMemo(() => {
    const farmers = new Set(availableProducts.map((p) => p.farmerId))
    const regions = new Set(availableProducts.map((p) => p.location))
    return {
      products: availableProducts.length,
      farmers: farmers.size,
      regions: regions.size,
    }
  }, [availableProducts])

  const locations = useMemo(() => {
    const locs = [...new Set(products.map((p) => p.location))]
    return locs.sort()
  }, [products])

  const filteredProducts = useMemo(() => {
    let result = [...availableProducts]

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
  }, [availableProducts, search, category, location, sortBy])

  const clearFilters = () => {
    setSearch("")
    setCategory("all")
    setLocation("all")
    setSortBy("recent")
  }

  const activeFiltersCount = (search ? 1 : 0) + (category !== "all" ? 1 : 0) + (location !== "all" ? 1 : 0)
  const hasActiveFilters = activeFiltersCount > 0

  const activeCategory = CATEGORIES.find((c) => c.value === category)

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <div className="flex flex-col items-center text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Leaf className="h-4 w-4" />
              Produits frais & locaux
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Le <span className="text-primary">Marché</span>
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
              Découvrez les produits frais de nos agriculteurs locaux, directement du champ à votre table.
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      </section>

      {/* Sticky toolbar : search + sort + filters */}
      <div className="sticky top-16 z-30 mt-6 border-y bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un produit, un agriculteur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-full bg-card pl-10"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Effacer la recherche"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full rounded-full bg-card sm:w-[180px]">
                <ArrowUpDown className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Plus récents</SelectItem>
                <SelectItem value="price-asc">Prix croissant</SelectItem>
                <SelectItem value="price-desc">Prix décroissant</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={showFilters || location !== "all" ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className={cn("gap-2 rounded-full", !showFilters && location === "all" && "bg-card")}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtres
              {location !== "all" && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground text-xs font-bold text-primary">
                  1
                </span>
              )}
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="border-t bg-card/50">
            <div className="container mx-auto animate-menu-in px-4 py-4">
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
                    <SelectTrigger className="bg-card">
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
                    <SelectTrigger className="bg-card">
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
                    <SelectTrigger className="bg-card">
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
          </div>
        )}
      </div>
      

      <div className="container mx-auto px-4 py-8">
        {/* Results count + active filters */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{filteredProducts.length}</span> produit
            {filteredProducts.length !== 1 ? "s" : ""} trouvé{filteredProducts.length !== 1 ? "s" : ""}
          </p>
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="group inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium transition-colors hover:border-destructive/50 hover:text-destructive"
                >
                  <Search className="h-3 w-3 text-muted-foreground" />
                  &quot;{search}&quot;
                  <X className="h-3 w-3 text-muted-foreground group-hover:text-destructive" />
                </button>
              )}
              {activeCategory && (
                <button
                  onClick={() => setCategory("all")}
                  className="group inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium transition-colors hover:border-destructive/50 hover:text-destructive"
                >
                  {activeCategory.label}
                  <X className="h-3 w-3 text-muted-foreground group-hover:text-destructive" />
                </button>
              )}
              {location !== "all" && (
                <button
                  onClick={() => setLocation("all")}
                  className="group inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium transition-colors hover:border-destructive/50 hover:text-destructive"
                >
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  {location}
                  <X className="h-3 w-3 text-muted-foreground group-hover:text-destructive" />
                </button>
              )}
            </div>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/30 px-6 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <SearchX className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Aucun produit trouvé</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Aucun produit ne correspond à vos critères. Essayez de modifier votre recherche ou vos filtres.
            </p>
            <Button variant="outline" onClick={clearFilters} className="mt-6 gap-2 rounded-full bg-card">
              <X className="h-4 w-4" />
              Réinitialiser les filtres
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-up"
                style={{ animationDelay: `${Math.min(index, 11) * 50}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category chips */}
      <div className="container mx-auto px-4 pt-8">
        <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Button
            variant={category === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setCategory("all")}
            className={cn(
              "shrink-0 gap-2 rounded-full",
              category !== "all" && "bg-card hover:bg-primary/10 hover:text-primary",
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            Tous
          </Button>
          {CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.value]
            const isActive = category === cat.value
            return (
              <Button
                key={cat.value}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(isActive ? "all" : cat.value)}
                className={cn(
                  "shrink-0 gap-2 rounded-full",
                  !isActive && "bg-card hover:bg-primary/10 hover:text-primary",
                )}
              >
                <Icon className="h-4 w-4" />
                {cat.label}
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
