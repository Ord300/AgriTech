import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { payerPhone, recipientPhone, amount, reference } = body ?? {}

    // Simulation réussie uniquement — pas de validation bloquante
    const demoTransactionRef = `OM-DEMO-${Date.now()}`

    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json({
      success: true,
      transactionRef: demoTransactionRef,
      message: "Paiement Orange Money simulé avec succès.",
      payerPhone,
      recipientPhone,
      amount,
      reference,
    })
  } catch (error) {
    console.warn("Orange Money API simulation fallback:", error)
    return NextResponse.json({
      success: true,
      transactionRef: `OM-DEMO-${Date.now()}`,
      message: "Paiement Orange Money simulé avec succès (fallback).",
    })
  }
}
