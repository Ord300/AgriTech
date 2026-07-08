"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Product, Order, User, Article, Rating, Notification, SupportTicket, SupportMessage } from "./types"
import { mockProducts, mockOrders, mockUsers, mockArticles, mockRatings } from "./mock-data"

interface DataContextType {
  products: Product[]
  orders: Order[]
  users: User[]
  articles: Article[]
  notifications: Notification[]
  unreadNotifications: number
  supportTickets: SupportTicket[]
  deleteUser: (id: string) => void
  addProduct: (product: Omit<Product, "id" | "createdAt">) => void
  updateProduct: (id: string, updates: Partial<Product>) => void
  deleteProduct: (id: string) => void
  addOrder: (order: Omit<Order, "id" | "createdAt">) => void
  updateOrderStatus: (id: string, status: Order["status"]) => void
  updateUser: (id: string, updates: Partial<User>) => void
  addArticle: (article: Omit<Article, "id" | "createdAt">) => void
  updateArticle: (id: string, updates: Partial<Article>) => void
  deleteArticle: (id: string) => void
  ratings: Rating[]
  addRating: (rating: Omit<Rating, "id" | "createdAt">) => void
  markNotificationAsRead: (id: string) => void
  clearNotifications: () => void
  createSupportTicket: (ticket: Omit<SupportTicket, "id" | "createdAt" | "updatedAt" | "messages">) => void
  addMessageToTicket: (ticketId: string, message: Omit<SupportMessage, "id" | "timestamp">) => void
  updateTicketStatus: (ticketId: string, status: SupportTicket["status"]) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [ratings, setRatings] = useState<Rating[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([])

  useEffect(() => {
    const storedProducts = localStorage.getItem("agrimarche_products")
    const storedOrders = localStorage.getItem("agrimarche_orders")
    const storedUsers = localStorage.getItem("agrimarche_users")
    const storedArticles = localStorage.getItem("agrimarche_articles")
    const storedRatings = localStorage.getItem("agrimarche_ratings")
    const storedNotifications = localStorage.getItem("agrimarche_notifications")
    const storedTickets = localStorage.getItem("agrimarche_support_tickets")

    setProducts(storedProducts ? JSON.parse(storedProducts) : mockProducts)
    setOrders(storedOrders ? JSON.parse(storedOrders) : mockOrders)
    setUsers(storedUsers ? JSON.parse(storedUsers) : mockUsers)
    setArticles(storedArticles ? JSON.parse(storedArticles) : mockArticles)
    setRatings(storedRatings ? JSON.parse(storedRatings) : mockRatings)
    setNotifications(storedNotifications ? JSON.parse(storedNotifications) : [])
    setSupportTickets(storedTickets ? JSON.parse(storedTickets) : [])
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

  const saveArticles = (newArticles: Article[]) => {
    setArticles(newArticles)
    localStorage.setItem("agrimarche_articles", JSON.stringify(newArticles))
  }

  const saveRatings = (newRatings: Rating[]) => {
    setRatings(newRatings)
    localStorage.setItem("agrimarche_ratings", JSON.stringify(newRatings))
  }

  const saveNotifications = (newNotifications: Notification[]) => {
    setNotifications(newNotifications)
    localStorage.setItem("agrimarche_notifications", JSON.stringify(newNotifications))
  }

  const addNotification = (notification: Omit<Notification, "id" | "timestamp">) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
    }
    saveNotifications([newNotification, ...notifications])
  }

  const saveSupportTickets = (newTickets: SupportTicket[]) => {
    setSupportTickets(newTickets)
    localStorage.setItem("agrimarche_support_tickets", JSON.stringify(newTickets))
  }

  const createSupportTicket = (ticket: Omit<SupportTicket, "id" | "createdAt" | "updatedAt" | "messages">) => {
    const newTicket: SupportTicket = {
      ...ticket,
      id: `ticket-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [{
        id: `msg-${Date.now()}`,
        senderName: ticket.buyerName,
        senderId: ticket.buyerId,
        content: ticket.description,
        timestamp: new Date().toISOString(),
      }],
    }
    saveSupportTickets([newTicket, ...supportTickets])
    addNotification({
      type: "user_registered",
      title: "Nouveau ticket de support",
      message: `${ticket.buyerName} a créé un ticket: "${ticket.subject}"`,
      actionUser: ticket.buyerName,
      read: false,
    })
  }

  const addMessageToTicket = (ticketId: string, message: Omit<SupportMessage, "id" | "timestamp">) => {
    const updatedTickets = supportTickets.map((ticket) => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          messages: [
            ...ticket.messages,
            {
              id: `msg-${Date.now()}`,
              ...message,
              timestamp: new Date().toISOString(),
            },
          ],
          updatedAt: new Date().toISOString(),
        }
      }
      return ticket
    })
    saveSupportTickets(updatedTickets)
  }

  const updateTicketStatus = (ticketId: string, status: SupportTicket["status"]) => {
    const updatedTickets = supportTickets.map((ticket) => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          status,
          updatedAt: new Date().toISOString(),
        }
      }
      return ticket
    })
    saveSupportTickets(updatedTickets)
  }

  const unreadNotifications = notifications.filter(n => !n.read).length

  const addProduct = (product: Omit<Product, "id" | "createdAt">) => {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
    }
    saveProducts([...products, newProduct])
    addNotification({
      type: "product_added",
      title: "Nouveau produit ajouté",
      message: `${product.farmerName} a ajouté "${product.name}" à la plateforme`,
      actionUser: product.farmerName,
      read: false,
    })
  }

  const updateProduct = (id: string, updates: Partial<Product>) => {
    saveProducts(products.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }

  const deleteProduct = (id: string) => {
    const product = products.find((p) => p.id === id)
    if (product) {
      addNotification({
        type: "product_deleted",
        title: "Produit supprimé",
        message: `Le produit "${product.name}" de ${product.farmerName} a été supprimé`,
        actionUser: "Admin",
        read: false,
      })
    }
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

    addNotification({
      type: "order_created",
      title: "Nouvelle commande",
      message: `${order.buyerName} a commandé ${order.quantity} unité(s) de ${order.productName}`,
      actionUser: order.buyerName,
      targetUser: order.farmerName,
      read: false,
    })
  }

  const updateOrderStatus = (id: string, status: Order["status"]) => {
    const order = orders.find((o) => o.id === id)
    saveOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)))
    
    if (order) {
      addNotification({
        type: "order_status_changed",
        title: `Commande ${status === "delivered" ? "livrée" : status === "confirmed" ? "confirmée" : "annulée"}`,
        message: `La commande de ${order.buyerName} pour "${order.productName}" est maintenant ${status === "delivered" ? "livrée" : status === "confirmed" ? "confirmée" : "annulée"}`,
        actionUser: "Admin",
        targetUser: order.buyerName,
        read: false,
      })
    }
  }

  const updateUser = (id: string, updates: Partial<User>) => {
    const user = users.find((u) => u.id === id)
    const oldRole = user?.role
    saveUsers(users.map((u) => (u.id === id ? { ...u, ...updates } : u)))
    
    if (updates.role && user && oldRole !== updates.role) {
      addNotification({
        type: "user_role_changed",
        title: "Rôle utilisateur modifié",
        message: `Le rôle de ${user.name} a été changé de ${oldRole} à ${updates.role}`,
        actionUser: "Admin",
        targetUser: user.name,
        read: false,
      })
    }
  }

  const deleteUser = (id: string) => {
    const user = users.find((u) => u.id === id)
    if (user) {
      addNotification({
        type: "user_role_changed",
        title: "Utilisateur supprimé",
        message: `L'utilisateur ${user.name} (${user.role}) a été supprimé de la plateforme`,
        actionUser: "Admin",
        read: false,
      })
    }
    saveUsers(users.filter((u) => u.id !== id))
  }

  const addArticle = (article: Omit<Article, "id" | "createdAt">) => {
    const newArticle: Article = {
      ...article,
      id: `article-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
    }
    saveArticles([...articles, newArticle])
    
    addNotification({
      type: "article_published",
      title: "Nouvel article publié",
      message: `"${article.title}" a été publié par ${article.authorName}`,
      actionUser: article.authorName,
      read: false,
    })
  }

  const updateArticle = (id: string, updates: Partial<Article>) => {
    saveArticles(articles.map((a) => (a.id === id ? { ...a, ...updates } : a)))
  }

  const deleteArticle = (id: string) => {
    const article = articles.find((a) => a.id === id)
    if (article) {
      addNotification({
        type: "article_deleted",
        title: "Article supprimé",
        message: `L'article "${article.title}" a été supprimé`,
        actionUser: "Admin",
        read: false,
      })
    }
    saveArticles(articles.filter((a) => a.id !== id))
  }

  const markNotificationAsRead = (id: string) => {
    saveNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const clearNotifications = () => {
    saveNotifications([])
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
        articles,
        addArticle,
        updateArticle,
        deleteArticle,
        ratings,
        notifications,
        unreadNotifications,
        markNotificationAsRead,
        clearNotifications,
        supportTickets,
        createSupportTicket,
        addMessageToTicket,
        updateTicketStatus,
        addRating: (rating: Omit<Rating, "id" | "createdAt">) => {
          const newRating: Rating = {
            ...rating,
            id: `rating-${Date.now()}`,
            createdAt: new Date().toISOString().split("T")[0],
          }
          const newRatings = [...ratings, newRating]
          saveRatings(newRatings)

          // Update farmer average rating
          const farmerRatings = newRatings.filter((r) => r.farmerId === rating.farmerId)
          const avgRating = farmerRatings.reduce((acc, r) => acc + r.stars, 0) / farmerRatings.length
          updateUser(rating.farmerId, {
            rating: Number(avgRating.toFixed(1)),
            reviewCount: farmerRatings.length,
          })
        },
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
