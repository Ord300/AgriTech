import type React from "react"
import Link from "next/link"
import { ArrowLeft, Leaf } from "lucide-react"
import { AuthSidePanel } from "@/components/auth-side-panel"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      {/* Colonne formulaire */}
      <div className="relative flex flex-col bg-gradient-to-b from-background via-background to-muted/20 p-6 sm:p-8 lg:p-10">
        {/* Fond décoratif */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl" />

        <div className="relative flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/20 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">TerraFrais</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3.5 py-1.5 text-sm font-medium text-muted-foreground shadow-sm transition-all hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l&apos;accueil
          </Link>
        </div>

        <main className="relative flex flex-1 items-center justify-center py-8 sm:py-10">{children}</main>

        <p className="relative text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} TerraFrais • Paiement sécurisé Mobile Money
        </p>
      </div>

      {/* Colonne visuelle animée */}
      <AuthSidePanel />
    </div>
  )
}
