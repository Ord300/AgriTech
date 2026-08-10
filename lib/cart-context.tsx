"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { CartItem, Product, SavedCart } from "./types"

interface CartContextType {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  isCartOpen: boolean
  setCartOpen: (open: boolean) => void
  isCheckoutOpen: boolean
  setCheckoutOpen: (open: boolean) => void
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  savedCarts: SavedCart[]
  saveCartForLater: () => void
  restoreSavedCart: (id: string) => void
  deleteSavedCart: (id: string) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [savedCarts, setSavedCarts] = useState<SavedCart[]>([])
  const [isCartOpen, setCartOpen] = useState(false)
  const [isCheckoutOpen, setCheckoutOpen] = useState(false)

  useEffect(() => {
    const storedCart = localStorage.getItem("agrimarche_cart")
    const storedSavedCarts = localStorage.getItem("agrimarche_saved_carts")
    if (storedCart) setItems(JSON.parse(storedCart))
    if (storedSavedCarts) setSavedCarts(JSON.parse(storedSavedCarts))
  }, [])

  const saveItems = (newItems: CartItem[]) => {
    setItems(newItems)
    localStorage.setItem("agrimarche_cart", JSON.stringify(newItems))
  }

  const saveSavedCarts = (carts: SavedCart[]) => {
    setSavedCarts(carts)
    localStorage.setItem("agrimarche_saved_carts", JSON.stringify(carts))
  }

  const addToCart = (product: Product, quantity = 1) => {
    const existing = items.find((i) => i.productId === product.id)
    if (existing) {
      saveItems(
        items.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: Math.min(i.quantity + quantity, product.quantity), maxQuantity: product.quantity }
            : i,
        ),
      )
    } else {
      const newItem: CartItem = {
        productId: product.id,
        productName: product.name,
        farmerId: product.farmerId,
        farmerName: product.farmerName,
        price: product.price,
        unit: product.unit,
        quantity: Math.min(quantity, product.quantity),
        image: product.image,
        location: product.location,
        maxQuantity: product.quantity,
      }
      saveItems([...items, newItem])
    }
  }

  const removeFromCart = (productId: string) => {
    saveItems(items.filter((i) => i.productId !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    saveItems(
      items.map((i) =>
        i.productId === productId ? { ...i, quantity: Math.min(quantity, i.maxQuantity) } : i,
      ),
    )
  }

  const clearCart = () => {
    saveItems([])
  }

  const saveCartForLater = () => {
    if (items.length === 0) return
    const savedCart: SavedCart = {
      id: `cart-${Date.now()}`,
      name: `Panier du ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`,
      items,
      createdAt: new Date().toISOString(),
    }
    saveSavedCarts([savedCart, ...savedCarts])
    clearCart()
  }

  const restoreSavedCart = (id: string) => {
    const saved = savedCarts.find((c) => c.id === id)
    if (!saved) return
    // Fusionne le panier enregistré avec le panier courant
    const merged = [...items]
    for (const savedItem of saved.items) {
      const existing = merged.find((i) => i.productId === savedItem.productId)
      if (existing) {
        existing.quantity = Math.min(existing.quantity + savedItem.quantity, existing.maxQuantity)
      } else {
        merged.push({ ...savedItem })
      }
    }
    saveItems(merged)
    saveSavedCarts(savedCarts.filter((c) => c.id !== id))
  }

  const deleteSavedCart = (id: string) => {
    saveSavedCarts(savedCarts.filter((c) => c.id !== id))
  }

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        isCartOpen,
        setCartOpen,
        isCheckoutOpen,
        setCheckoutOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        savedCarts,
        saveCartForLater,
        restoreSavedCart,
        deleteSavedCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
