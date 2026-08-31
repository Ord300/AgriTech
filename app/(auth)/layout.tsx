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
      <div className="relative flex flex-col bg-gradient-to-b from-background via-background to-muted/20 p-4 max-[360px]:p-3 sm:p-8 lg:p-10 overflow-x-hidden">
        {/* Fond décoratif */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="pointer-events-none absolute -top-24 right-0 h-60 w-60 max-[360px]:h-48 max-[360px]:w-48 sm:h-72 sm:w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-60 w-60 max-[360px]:h-48 max-[360px]:w-48 sm:h-64 sm:w-64 rounded-full bg-emerald-500/5 blur-3xl" />

        <div className="relative flex items-center justify-between gap-2">
          <Link href="/" className="group flex items-center gap-1.5 sm:gap-2.5">
            <div className="flex h-8 w-8 max-[360px]:h-7 max-[360px]:w-7 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/20 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 shrink-0">
              <Leaf className="h-4 w-4 max-[360px]:h-3.5 max-[360px]:w-3.5 sm:h-5 sm:w-5 text-primary-foreground" />
            </div>
            <span className="text-lg max-[360px]:text-base sm:text-xl font-bold tracking-tight text-foreground">TerraFrais</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1 max-[360px]:gap-1 sm:gap-1.5 rounded-full border bg-card px-2.5 max-[360px]:px-2 sm:px-3.5 py-1.5 max-[360px]:py-1 text-xs max-[360px]:text-[11px] sm:text-sm font-medium text-muted-foreground shadow-sm transition-all hover:bg-muted hover:text-foreground shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5 max-[360px]:h-3 max-[360px]:w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline sm:inline">Retour à l&apos;accueil</span>
            <span className="xs:hidden sm:hidden">Retour</span>
          </Link>
        </div>

        <main className="relative flex flex-1 items-center justify-center py-6 max-[360px]:py-4 sm:py-10">{children}</main>

        <p className="relative text-center text-[11px] max-[360px]:text-[10px] sm:text-xs leading-relaxed text-muted-foreground px-2">
          © {new Date().getFullYear()} TerraFrais • Paiement sécurisé Mobile Money
        </p>
      </div>

      {/* Colonne visuelle animée */}
      <AuthSidePanel />
    </div>
  )
}
