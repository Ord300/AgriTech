/**
 * Écriture localStorage résiliente au dépassement de quota (QuotaExceededError).
 *
 * En cas d'échec (stockage ~5 Mo saturé par les images base64), on purge
 * une fois les clés reconstruisibles (produits, commandes, transactions,
 * notifications, etc. — elles retombent sur les données mock/vides) puis on
 * réessaie. Les clés essentielles (authentification, demandes) ne sont
 * jamais supprimées afin que la connexion reste toujours possible.
 */

const ESSENTIAL_KEYS = new Set([
  "agrimarche_user",
  "agrimarche_users",
  "agrimarche_account_requests",
  "agrimarche_certification_requests",
])

export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value)
    return true
  } catch {
    // Quota dépassé : purge des données non essentielles puis nouvelle tentative
    try {
      const keysToPurge = Object.keys(localStorage).filter(
        (k) => k.startsWith("agrimarche_") && !ESSENTIAL_KEYS.has(k)
      )
      for (const k of keysToPurge) {
        try {
          localStorage.removeItem(k)
        } catch {
          /* ignore */
        }
      }
      localStorage.setItem(key, value)
      return true
    } catch {
      return false
    }
  }
}
