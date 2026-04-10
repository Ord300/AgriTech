export type UserRole = "farmer" | "buyer" | "admin"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  password?: string
  masterPassword?: string
  phone?: string
  location?: string
  avatar?: string
  description?: string
  createdAt: string
  rating?: number
  reviewCount?: number
}

export interface Rating {
  id: string
  farmerId: string
  authorId: string
  authorName: string
  stars: number
  comment: string
  createdAt: string
}

export interface Product {
  id: string
  farmerId: string
  farmerName: string
  name: string
  description: string
  category: ProductCategory
  price: number
  unit: string
  quantity: number
  location: string
  image: string
  createdAt: string
  isAvailable: boolean
}

export type ProductCategory =
  | "legumes"
  | "fruits"
  | "cereales"
  | "produits-laitiers"
  | "viandes"
  | "oeufs"
  | "miel"
  | "autres"

export const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "legumes", label: "Légumes" },
  { value: "fruits", label: "Fruits" },
  { value: "cereales", label: "Céréales" },
  { value: "produits-laitiers", label: "Produits Laitiers" },
  { value: "viandes", label: "Viandes" },
  { value: "oeufs", label: "Oeufs" },
  { value: "miel", label: "Miel" },
  { value: "autres", label: "Autres" },
]

export interface Order {
  id: string
  buyerId: string
  buyerName: string
  buyerPhone?: string
  productId: string
  productName: string
  farmerId: string
  farmerName: string
  quantity: number
  totalPrice: number
  status: OrderStatus
  createdAt: string
}

export type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled"

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  delivered: "Livrée",
  cancelled: "Annulée",
}

export type ArticleCategory = "agriculteurs" | "produits" | "monde"

export interface Article {
  id: string
  title: string
  description: string
  content: string
  category: ArticleCategory
  imageUrl: string
  authorName: string
  createdAt: string
}
