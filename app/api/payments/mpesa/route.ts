import { NextResponse } from "next/server"

const MPESA_BASE_URL = process.env.MPESA_BASE_URL || ""
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || ""
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || ""
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE || ""
const MPESA_PASSKEY = process.env.MPESA_PASSKEY || ""
const MPESA_AUTH_TYPE = process.env.MPESA_AUTH_TYPE || ""
const MPESA_CALLBACK_URL = process.env.MPESA_CALLBACK_URL || ""

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { payerPhone, recipientPhone, amount, reference } = body ?? {}

    if (!payerPhone || !recipientPhone || !amount || !reference) {
      return NextResponse.json(
        { success: false, error: "Paramètres manquants pour le paiement M-Pesa." },
        { status: 400 },
      )
    }

    const isDemoMode = process.env.NODE_ENV !== "production" && (!MPESA_BASE_URL || !MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET)

    if (isDemoMode) {
      const demoTransactionRef = `MP-DEMO-${Date.now()}`
      console.warn("[MPESA] Mode démonstration activé: variables d'environnement absentes.")
      return NextResponse.json({
        success: true,
        transactionRef: demoTransactionRef,
        message: "Paiement M-Pesa simulé en mode démonstration (configuration absente).",
      })
    }

    if (!MPESA_BASE_URL || !MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET) {
      return NextResponse.json(
        {
          success: false,
          error: "Les variables d'environnement M-Pesa ne sont pas configurées. Configurez MPESA_BASE_URL, MPESA_CONSUMER_KEY et MPESA_CONSUMER_SECRET.",
        },
        { status: 500 },
      )
    }

    const authResponse = await fetch(`${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString("base64")}`,
      },
    })

    if (!authResponse.ok) {
      const authText = await authResponse.text()
      return NextResponse.json(
        {
          success: false,
          error: `Échec de l'authentification M-Pesa: ${authText}`,
        },
        { status: 502 },
      )
    }

    const authPayload = await authResponse.json()
    const accessToken = authPayload.access_token

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: "Token d'accès M-Pesa non reçu." },
        { status: 502 },
      )
    }

    const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14)
    const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString("base64")

    const payRequest = await fetch(`${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Number(amount),
        PartyA: payerPhone.replace(/\s|\+|\-/g, ""),
        PartyB: MPESA_SHORTCODE,
        PhoneNumber: payerPhone.replace(/\s|\+|\-/g, ""),
        CallBackURL: MPESA_CALLBACK_URL || "https://example.com/api/payments/mpesa/callback",
        AccountReference: recipientPhone || reference,
        TransactionDesc: ` paiement ${reference}`,
      }),
    })

    const paymentText = await payRequest.text()

    if (!payRequest.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Erreur API M-Pesa: ${paymentText}`,
        },
        { status: 502 },
      )
    }

    const paymentPayload = paymentText ? JSON.parse(paymentText) : {}
    const transactionRef = paymentPayload.CheckoutRequestID || `MP-${Date.now()}`

    return NextResponse.json({
      success: true,
      transactionRef,
      message: "Demande de paiement M-Pesa soumise avec succès.",
    })
  } catch (error) {
    console.error("MPesa API error:", error)
    return NextResponse.json(
      { success: false, error: "Erreur interne lors du traitement de la transaction M-Pesa." },
      { status: 500 },
    )
  }
}
