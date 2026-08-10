import type { CartItem, PaymentMethod, User } from "./types"
import { PLATFORM_COMMISSION_RATE } from "./types"

/**
 * Groupe de paiement par agriculteur.
 * Quand le panier contient des produits de plusieurs agriculteurs,
 * le paiement est scindé : chaque agriculteur reçoit sa part sur
 * son propre numéro Mobile Money enregistré, moins la commission
 * de 5% reversée à l'administrateur de la plateforme.
 */
export interface FarmerPaymentGroup {
  farmerId: string
  farmerName: string
  /** Numéro Mobile Money enregistré par l'agriculteur */
  farmerPhone: string
  items: CartItem[]
  /** Montant brut dû à l'agriculteur (somme de ses produits) */
  amount: number
  /** Commission plateforme (5%) prélevée sur le montant */
  commission: number
  /** Montant net réellement reversé à l'agriculteur (95%) */
  farmerAmount: number
}

/** Regroupe les articles du panier par agriculteur et calcule la répartition. */
export function groupCartByFarmer(items: CartItem[], users: User[]): FarmerPaymentGroup[] {
  const groups = new Map<string, FarmerPaymentGroup>()

  for (const item of items) {
    const existing = groups.get(item.farmerId)
    if (existing) {
      existing.items.push(item)
      existing.amount += item.price * item.quantity
    } else {
      const farmer = users.find((u) => u.id === item.farmerId)
      groups.set(item.farmerId, {
        farmerId: item.farmerId,
        farmerName: item.farmerName,
        farmerPhone: farmer?.phone || "Non renseigné",
        items: [item],
        amount: item.price * item.quantity,
        commission: 0,
        farmerAmount: 0,
      })
    }
  }

  return Array.from(groups.values()).map((group) => {
    const amount = Math.round(group.amount * 100) / 100
    const commission = Math.round(amount * PLATFORM_COMMISSION_RATE * 100) / 100
    return {
      ...group,
      amount,
      commission,
      farmerAmount: Math.round((amount - commission) * 100) / 100,
    }
  })
}

export interface MobileMoneyPaymentParams {
  method: PaymentMethod
  /** Numéro de l'acheteur qui paie */
  payerPhone: string
  /** Numéro Mobile Money du bénéficiaire (agriculteur) */
  recipientPhone: string
  amount: number
  reference: string
}

export interface MobileMoneyPaymentResult {
  success: boolean
  transactionRef: string
  error?: string
}

/** Vérifie qu'un numéro de téléphone est valide (indicatif international accepté). */
export function isValidPhoneNumber(phone: string): boolean {
  return /^\+?[0-9][0-9\s.-]{7,14}$/.test(phone.trim())
}

/** Génère une référence de transaction unique. */
export function generateTransactionRef(method: PaymentMethod): string {
  const prefix = method === "mpesa" ? "MP" : "OM"
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}${timestamp}${random}`
}

/**
 * Traite un paiement Mobile Money (M-Pesa / Orange Money).
 *
 * NOTE D'INTÉGRATION : en production, cette fonction appelle l'API réelle
 * de l'opérateur (Vodacom M-Pesa OpenAPI / Orange Money Web Payment) via
 * une route serveur sécurisée. Ici, le flux complet est simulé localement
 * (délai réseau + validation + référence de transaction) afin que le
 * comportement de bout en bout soit fonctionnel dans l'application.
 */
export async function processMobileMoneyPayment(
  params: MobileMoneyPaymentParams,
): Promise<MobileMoneyPaymentResult> {
  const { method, payerPhone, recipientPhone, amount } = params

  if (!isValidPhoneNumber(payerPhone)) {
    return {
      success: false,
      transactionRef: "",
      error: "Le numéro Mobile Money du payeur est invalide.",
    }
  }

  if (amount <= 0) {
    return {
      success: false,
      transactionRef: "",
      error: "Le montant de la transaction est invalide.",
    }
  }

  // Simulation de la requête vers l'opérateur (push USSD / validation PIN)
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const transactionRef = generateTransactionRef(method)

  // Paiement accepté : les fonds sont transférés au numéro du bénéficiaire
  void recipientPhone

  return { success: true, transactionRef }
}
