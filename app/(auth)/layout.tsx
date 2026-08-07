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
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Colonne formulaire */}
      <div className="flex flex-col bg-background p-6 sm:p-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">TerraFrais</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l&apos;accueil
          </Link>
        </div>

        <main className="flex flex-1 items-center justify-center py-10">{children}</main>
      </div>

      {/* Colonne visuelle animée */}
      <AuthSidePanel />
    </div>
  )
}
