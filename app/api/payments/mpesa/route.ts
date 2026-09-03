import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { payerPhone, recipientPhone, amount, reference } = body ?? {}

    // Simulation réussie uniquement — pas de validation bloquante
    // On génère toujours une référence de succès, même si des champs manquent
    const demoTransactionRef = `MP-DEMO-${Date.now()}`

    // Petit délai pour simuler le traitement réseau
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json({
      success: true,
      transactionRef: demoTransactionRef,
      message: "Paiement M-Pesa simulé avec succès.",
      payerPhone,
      recipientPhone,
      amount,
      reference,
    })
  } catch (error) {
    // Même en cas d'erreur interne, on simule un succès
    console.warn("MPesa API simulation fallback:", error)
    return NextResponse.json({
      success: true,
      transactionRef: `MP-DEMO-${Date.now()}`,
      message: "Paiement M-Pesa simulé avec succès (fallback).",
    })
  }
}
