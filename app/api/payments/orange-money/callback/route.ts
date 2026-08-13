import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const payload = await request.json()

    console.log("[ORANGE callback]", JSON.stringify(payload, null, 2))

    return NextResponse.json({
      status: "success",
      message: "Callback reçu avec succès.",
    })
  } catch (error) {
    console.error("[ORANGE callback error]", error)
    return NextResponse.json(
      { status: "error", message: "Échec de traitement du callback." },
      { status: 400 },
    )
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, service: "orange-money-callback" })
}
