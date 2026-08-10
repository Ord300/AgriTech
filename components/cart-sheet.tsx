"use client"

import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, Trash2, ShoppingCart, Save, History, ArrowRight } from "lucide-react"

export function CartSheet() {
  const {
    items,
    totalPrice,
    isCartOpen,
    setCartOpen,
    setCheckoutOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    savedCarts,
    saveCartForLater,
    restoreSavedCart,
    deleteSavedCart,
  } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()

  const handleSaveForLater = () => {
    saveCartForLater()
    toast({
      title: "Panier enregistré",
      description: "Votre panier a été enregistré. Vous pourrez le retrouver et le payer plus tard.",
    })
  }

  const handleOrder = () => {
    if (user?.role === "farmer") {
      toast({
        title: "Action non autorisée",
        description: "Les agriculteurs ne peuvent pas passer de commandes.",
        variant: "destructive",
      })
      return
    }
    setCartOpen(false)
    setCheckoutOpen(true)
  }

  return (
    <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Mon panier
            {items.length > 0 && (
              <Badge variant="secondary">{items.length} produit{items.length > 1 ? "s" : ""}</Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            Ajoutez des produits, enregistrez votre panier pour plus tard ou commandez directement.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-4 p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
                <ShoppingCart className="h-10 w-10 text-muted-foreground" />
                <p className="mt-3 font-medium">Votre panier est vide</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Parcourez le marché et ajoutez des produits.
                </p>
                <Button asChild variant="outline" className="mt-4 gap-2 bg-transparent">
                  <Link href="/marche" onClick={() => setCartOpen(false)}>
                    Découvrir le marché
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3 rounded-lg border p-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-medium">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">{item.farmerName}</p>
                          <p className="text-sm font-semibold text-primary">
                            {item.price.toFixed(2)} € / {item.unit}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeFromCart(item.productId)}
                          aria-label={`Retirer ${item.productName}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 bg-transparent"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 bg-transparent"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= item.maxQuantity}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm font-bold">
                          {(item.price * item.quantity).toFixed(2)} €
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  variant="ghost"
                  size="sm"
                  className="self-end text-muted-foreground"
                  onClick={clearCart}
                >
                  Vider le panier
                </Button>
              </>
            )}

            {/* Paniers enregistrés pour plus tard */}
            {savedCarts.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="flex items-center gap-2 text-sm font-semibold">
                    <History className="h-4 w-4" />
                    Paniers enregistrés ({savedCarts.length})
                  </h4>
                  {savedCarts.map((cart) => {
                    const total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
                    return (
                      <div key={cart.id} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{cart.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {cart.items.length} produit{cart.items.length > 1 ? "s" : ""} · {total.toFixed(2)} €
                            </p>
                          </div>
                          <div className="flex shrink-0 gap-1">
                            <Button size="sm" variant="outline" className="bg-transparent" onClick={() => restoreSavedCart(cart.id)}>
                              Reprendre
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => deleteSavedCart(cart.id)}
                              aria-label="Supprimer ce panier enregistré"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        {items.length > 0 && (
          <SheetFooter className="border-t p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total</span>
              <span className="text-xl font-bold text-primary">{totalPrice.toFixed(2)} €</span>
            </div>
            <Button className="w-full gap-2" onClick={handleOrder}>
              Commander
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="w-full gap-2 bg-transparent" onClick={handleSaveForLater}>
              <Save className="h-4 w-4" />
              Enregistrer le panier pour payer plus tard
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
