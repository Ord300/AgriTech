import nodemailer from "nodemailer"

export interface EmailPayload {
  to: string
  subject: string
  html: string
}

export interface EmailResult {
  sent: boolean
  reason?: string
}

let cachedTransporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter | null {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null

  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  }

  return cachedTransporter
}

export async function sendEmail({ to, subject, html }: EmailPayload): Promise<EmailResult> {
  const transporter = getTransporter()

  if (!transporter) {
    console.warn(
      "[email] Envoi ignoré : SMTP non configuré. Définissez SMTP_HOST, SMTP_USER et SMTP_PASS."
    )
    return { sent: false, reason: "smtp_not_configured" }
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `TerraFrais <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    })
    return { sent: true }
  } catch (error) {
    console.error("[email] Échec de l'envoi :", error)
    return { sent: false, reason: "send_failed" }
  }
}
