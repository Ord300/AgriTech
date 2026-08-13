import { NextResponse } from "next/server"

const ORANGE_BASE_URL = process.env.ORANGE_BASE_URL || ""
const ORANGE_CLIENT_ID = process.env.ORANGE_CLIENT_ID || ""
const ORANGE_CLIENT_SECRET = process.env.ORANGE_CLIENT_SECRET || ""
const ORANGE_API_KEY = process.env.ORANGE_API_KEY || ""
const ORANGE_SCOPE = process.env.ORANGE_SCOPE || "" 

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { payerPhone, recipientPhone, amount, reference } = body ?? {}

    if (!payerPhone || !recipientPhone || !amount || !reference) {
      return NextResponse.json(
        { success: false, error: "Paramètres manquants pour le paiement Orange Money." },
        { status: 400 },
      )
    }

    const isDemoMode = process.env.NODE_ENV !== "production" && (!ORANGE_BASE_URL || !ORANGE_CLIENT_ID || !ORANGE_CLIENT_SECRET)

    if (isDemoMode) {
      const demoTransactionRef = `OM-DEMO-${Date.now()}`
      console.warn("[ORANGE] Mode démonstration activé: variables d'environnement absentes.")
      return NextResponse.json({
        success: true,
        transactionRef: demoTransactionRef,
        message: "Paiement Orange Money simulé en mode démonstration (configuration absente).",
      })
    }

    if (!ORANGE_BASE_URL || !ORANGE_CLIENT_ID || !ORANGE_CLIENT_SECRET) {
      return NextResponse.json(
        {
          success: false,
          error: "Les variables d'environnement Orange Money ne sont pas configurées. Configurez ORANGE_BASE_URL, ORANGE_CLIENT_ID et ORANGE_CLIENT_SECRET.",
        },
        { status: 500 },
      )
    }

    const authResponse = await fetch(`${ORANGE_BASE_URL}/oauth/v2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${ORANGE_CLIENT_ID}:${ORANGE_CLIENT_SECRET}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        scope: ORANGE_SCOPE || "payments",
      }),
    })

    if (!authResponse.ok) {
      const authText = await authResponse.text()
      return NextResponse.json(
        { success: false, error: `Échec de l'authentification Orange Money: ${authText}` },
        { status: 502 },
      )
    }

    const authPayload = await authResponse.json()
    const accessToken = authPayload.access_token

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: "Token d'accès Orange Money non reçu." },
        { status: 502 },
      )
    }

    const requestPayload = {
      amount: Number(amount),
      currency: "CDF",
      description: `Paiement ${reference}`,
      externalId: reference,
      payer: {
        msisdn: payerPhone.replace(/\s|\+|\-/g, ""),
      },
      recipient: {
        msisdn: recipientPhone.replace(/\s|\+|\-/g, ""),
      },
      callbackUrl: process.env.ORANGE_CALLBACK_URL || "https://example.com/api/payments/orange-money/callback",
    }

    const paymentResponse = await fetch(`${ORANGE_BASE_URL}/orange-money-webpay/1.0.0/transaction`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-API-Key": ORANGE_API_KEY || "",
      },
      body: JSON.stringify(requestPayload),
    })

    const paymentText = await paymentResponse.text()

    if (!paymentResponse.ok) {
      return NextResponse.json(
        { success: false, error: `Erreur API Orange Money: ${paymentText}` },
        { status: 502 },
      )
    }

    const paymentPayload = paymentText ? JSON.parse(paymentText) : {}
    const transactionRef = paymentPayload.data?.transactionId || paymentPayload.transactionId || `OM-${Date.now()}`

    return NextResponse.json({
      success: true,
      transactionRef,
      message: "Demande de paiement Orange Money soumise avec succès.",
    })
  } catch (error) {
    console.error("Orange Money API error:", error)
    return NextResponse.json(
      { success: false, error: "Erreur interne lors du traitement de la transaction Orange Money." },
      { status: 500 },
    )
  }
}
