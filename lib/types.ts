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
  /** Coordonnées GPS pour la traçabilité de l'origine du produit */
  gps?: { lat: number; lng: number }
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

// ============ Panier ============

export interface CartItem {
  productId: string
  productName: string
  farmerId: string
  farmerName: string
  price: number
  unit: string
  quantity: number
  image: string
  location: string
  maxQuantity: number
}

export interface SavedCart {
  id: string
  name: string
  items: CartItem[]
  createdAt: string
}

// ============ Paiements Mobile Money ============

export type PaymentMethod = "mpesa" | "orange_money"

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  mpesa: "M-Pesa",
  orange_money: "Orange Money",
}

export type TransactionStatus = "completed" | "pending" | "failed"

export const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  completed: "Complété",
  pending: "En cours",
  failed: "Échoué",
}

/** Commission prélevée par la plateforme sur chaque transaction (revenu admin) */
export const PLATFORM_COMMISSION_RATE = 0.03

export interface PaymentTransaction {
  id: string
  /** Référence unique retournée par l'opérateur Mobile Money */
  reference: string
  orderIds: string[]
  buyerId: string
  buyerName: string
  /** Numéro Mobile Money utilisé par l'acheteur pour payer */
  buyerPhone: string
  farmerId: string
  farmerName: string
  /** Numéro Mobile Money enregistré de l'agriculteur (bénéficiaire) */
  farmerPhone: string
  method: PaymentMethod
  /** Montant total payé par l'acheteur pour cet agriculteur */
  amount: number
  /** Part de l'administrateur (3%) */
  commission: number
  /** Part reversée à l'agriculteur (97%) */
  farmerAmount: number
  status: TransactionStatus
  createdAt: string
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
  /** Article mis à la une par l'administrateur */
  featured?: boolean
  createdAt: string
}

// ============ Vitrine "Nos Produits du Moment" (accueil) ============

/** Produit mis en avant sur la page d'accueil, géré par l'administrateur */
export interface ShowcaseProduct {
  id: string
  name: string
  category: string
  image: string
  createdAt: string
}

export type NotificationType =
  | "user_registered"
  | "product_added"
  | "product_deleted"
  | "order_created"
  | "order_status_changed"
  | "user_role_changed"
  | "article_published"
  | "article_deleted"
  | "payment_received"

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  actionUser: string
  targetUser?: string
  timestamp: string
  read: boolean
  actionUrl?: string
}

export type SupportTicketType = "complaint" | "question" | "feedback" | "bug_report"
export type SupportTicketStatus = "open" | "in_progress" | "closed"

export interface SupportMessage {
  id: string
  senderName: string
  senderId: string
  content: string
  timestamp: string
}

export interface SupportTicket {
  id: string
  buyerId: string
  buyerName: string
  buyerEmail: string
  type: SupportTicketType
  subject: string
  description: string
  status: SupportTicketStatus
  messages: SupportMessage[]
  createdAt: string
  updatedAt: string
}

// ============ Demandes de création de compte agriculteur ============

export type AccountRequestStatus = "pending" | "approved" | "rejected" | "paid"

export const ACCOUNT_REQUEST_STATUS_LABELS: Record<AccountRequestStatus, string> = {
  pending: "En attente de confirmation",
  approved: "Confirmée - Paiement requis",
  rejected: "Rejetée",
  paid: "Compte créé",
}

/** Frais de création d'un compte agriculteur (en Francs Congolais) */
export const FARMER_ACCOUNT_FEE = 56000

export interface AccountRequest {
  id: string
  name: string
  email: string
  phone: string
  location: string
  /** Mot de passe choisi par le demandeur pour son futur compte */
  password: string
  message?: string
  status: AccountRequestStatus
  paymentMethod?: PaymentMethod
  paymentReference?: string
  paidAt?: string
  createdAt: string
  updatedAt: string
}

export type CertificationRequestStatus = "pending" | "approved" | "rejected" | "paid"

export const CERTIFICATION_REQUEST_STATUS_LABELS: Record<CertificationRequestStatus, string> = {
  pending: "En attente",
  approved: "Approuvée - Paiement requis",
  rejected: "Rejetée",
  paid: "Certifié",
}

/** Frais de certification à payer par l'agriculteur après acceptation (en Francs Congolais) */
export const CERTIFICATION_FEE = 30000

export interface CertificationRequest {
  id: string
  farmerId: string
  farmerName: string
  email: string
  rating: number
  message?: string
  status: CertificationRequestStatus
  feePaid: boolean
  paymentMethod?: PaymentMethod
  paymentReference?: string
  paidAt?: string
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  content: string
  timestamp: string
  read: boolean
}

export interface Conversation {
  id: string
  participantIds: string[]
  participantNames: string[]
  lastMessage?: string
  lastMessageAt: string
  unreadCount: number
}
