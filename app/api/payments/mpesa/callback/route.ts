import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const payload = await request.json()

    console.log("[MPESA callback]", JSON.stringify(payload, null, 2))

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Callback reçu avec succès.",
    })
  } catch (error) {
    console.error("[MPESA callback error]", error)
    return NextResponse.json(
      { ResultCode: 1, ResultDesc: "Échec de traitement du callback." },
      { status: 400 },
    )
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, service: "mpesa-callback" })
}
