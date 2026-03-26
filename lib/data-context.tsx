"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Product, Order, User } from "./types"
import { mockProducts, mockOrders, mockUsers } from "./mock-data"

interface DataContextType {
  products: Product[]
  orders: Order[]
  users: User[]
  deleteUser: (id: string) => void
  addProduct: (product: Omit<Product, "id" | "createdAt">) => void
  updateProduct: (id: string, updates: Partial<Product>) => void
  deleteProduct: (id: string) => void
  addOrder: (order: Omit<Order, "id" | "createdAt">) => void
  updateOrderStatus: (id: string, status: Order["status"]) => void
  updateUser: (id: string, updates: Partial<User>) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    const storedProducts = localStorage.getItem("agrimarche_products")
    const storedOrders = localStorage.getItem("agrimarche_orders")
    const storedUsers = localStorage.getItem("agrimarche_users")

    setProducts(storedProducts ? JSON.parse(storedProducts) : mockProducts)
    setOrders(storedOrders ? JSON.parse(storedOrders) : mockOrders)
    setUsers(storedUsers ? JSON.parse(storedUsers) : mockUsers)
  }, [])

  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts)
    localStorage.setItem("agrimarche_products", JSON.stringify(newProducts))
  }

  const saveOrders = (newOrders: Order[]) => {
    setOrders(newOrders)
    localStorage.setItem("agrimarche_orders", JSON.stringify(newOrders))
  }

  const saveUsers = (newUsers: User[]) => {
    setUsers(newUsers)
    localStorage.setItem("agrimarche_users", JSON.stringify(newUsers))
  }

  const addProduct = (product: Omit<Product, "id" | "createdAt">) => {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
    }
    saveProducts([...products, newProduct])
  }

  const updateProduct = (id: string, updates: Partial<Product>) => {
    saveProducts(products.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }

  const deleteProduct = (id: string) => {
    saveProducts(products.filter((p) => p.id !== id))
  }

  const addOrder = (order: Omit<Order, "id" | "createdAt">) => {
    const newOrder: Order = {
      ...order,
      id: `order-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
    }
    saveOrders([...orders, newOrder])

    const product = products.find((p) => p.id === order.productId)
    if (product) {
      updateProduct(product.id, { quantity: product.quantity - order.quantity })
    }
  }

  const updateOrderStatus = (id: string, status: Order["status"]) => {
    saveOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)))
  }

  const updateUser = (id: string, updates: Partial<User>) => {
    saveUsers(users.map((u) => (u.id === id ? { ...u, ...updates } : u)))
  }

  const deleteUser = (id: string) => {
    saveUsers(users.filter((u) => u.id !== id))
  }

  return (
    <DataContext.Provider
      value={{
        products,
        orders,
        users,
        deleteUser,
        addProduct,
        updateProduct,
        deleteProduct,
        addOrder,
        updateOrderStatus,
        updateUser,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
