import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/emailer"

interface EmailNotificationRequest {
  to?: string
  recipientName?: string
  title?: string
  message?: string
  type?: string
  timestamp?: string
  actionUrl?: string
}

const TYPE_LABELS: Record<string, string> = {
  user_registered: "Compte & messages",
  product_added: "Produits",
  product_deleted: "Produits",
  order_created: "Commandes",
  order_status_changed: "Commandes",
  user_role_changed: "Compte",
  article_published: "Actualités",
  article_deleted: "Actualités",
  payment_received: "Paiements",
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function buildHtml({
  recipientName,
  title,
  message,
  type,
  timestamp,
  actionUrl,
}: {
  recipientName: string
  title: string
  message: string
  type: string
  timestamp: string
  actionUrl?: string
}): string {
  const date = new Date(timestamp)
  const formattedDate = isNaN(date.getTime())
    ? timestamp
    : date.toLocaleString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })

  const category = TYPE_LABELS[type] ?? "Notification"
  const link =
    actionUrl && actionUrl.startsWith("http")
      ? actionUrl
      : actionUrl
        ? `https://terrafrais.app${actionUrl}`
        : "https://terrafrais.app"

  return `<!DOCTYPE html>
<html lang="fr">
  <body style="margin:0;padding:0;background-color:#f4f6f4;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f4;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
            <tr>
              <td style="background:#1a3326;padding:24px 32px;">
                <span style="display:inline-block;background:#a3e635;color:#052e16;font-weight:bold;font-size:18px;padding:8px 14px;border-radius:10px;">🌿 TerraFrais</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 4px;color:#6b7f72;font-size:13px;text-transform:uppercase;letter-spacing:1px;">${escapeHtml(category)}</p>
                <h1 style="margin:0 0 16px;color:#14291d;font-size:22px;line-height:1.3;">${escapeHtml(title)}</h1>
                <p style="margin:0 0 20px;color:#37493e;font-size:15px;line-height:1.6;">Bonjour ${escapeHtml(recipientName)},</p>
                <div style="background:#f2f7ef;border-left:4px solid #a3e635;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
                  <p style="margin:0;color:#26402f;font-size:15px;line-height:1.6;">${escapeHtml(message)}</p>
                </div>
                <p style="margin:0 0 24px;color:#6b7f72;font-size:13px;">${escapeHtml(formattedDate)}</p>
                <a href="${link}" style="display:inline-block;background:#a3e635;color:#052e16;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 28px;border-radius:999px;">Voir sur TerraFrais</a>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;border-top:1px solid #e6ece7;">
                <p style="margin:0;color:#9aaea1;font-size:12px;line-height:1.6;">
                  Vous recevez cet e-mail car vous êtes inscrit sur TerraFrais avec cette adresse.
                  <br />© TerraFrais — La plateforme qui connecte agriculteurs et acheteurs.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

export async function POST(request: Request) {
  let body: EmailNotificationRequest

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Corps de requête JSON invalide." }, { status: 400 })
  }

  const { to, recipientName, title, message, type, timestamp, actionUrl } = body

  if (!to || !recipientName || !title || !message) {
    return NextResponse.json(
      { error: "Champs requis manquants : to, recipientName, title, message." },
      { status: 400 }
    )
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json({ error: "Adresse e-mail invalide." }, { status: 400 })
  }

  const result = await sendEmail({
    to,
    subject: `TerraFrais — ${title}`,
    html: buildHtml({
      recipientName,
      title,
      message,
      type: type ?? "",
      timestamp: timestamp ?? new Date().toISOString(),
      actionUrl,
    }),
  })

  if (!result.sent) {
    // 200 avec sent:false : l'e-mail est optionnel, on ne casse pas le flux applicatif
    return NextResponse.json({ sent: false, reason: result.reason })
  }

  return NextResponse.json({ sent: true })
}
