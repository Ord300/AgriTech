import Link from "next/link"
import Image from "next/image"
import { Leaf, ShieldCheck, Truck, Users, Star, Sprout } from "lucide-react"

const highlights = [
  { icon: ShieldCheck, label: "Produits 100% locaux et traçables" },
  { icon: Truck, label: "Circuit court, du champ à votre table" },
  { icon: Users, label: "500+ agriculteurs partenaires" },
]

export function AuthSidePanel() {
  return (
    <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-emerald-600 to-teal-700 lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-12">
      {/* Grille subtile */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:28px_28px]" />
      {/* Cercles décoratifs animés */}
      <div className="animate-pulse-soft absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div
        className="animate-pulse-soft absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl"
        style={{ animationDelay: "1.5s" }}
      />
      <div
        className="animate-pulse-soft absolute right-1/4 top-1/3 h-40 w-40 rounded-full bg-white/10 blur-2xl"
        style={{ animationDelay: "3s" }}
      />

      {/* Logo */}
      <div className="relative">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="animate-float-y flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur shadow-lg">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">TerraFrais</span>
        </Link>
        <p className="mt-2 text-sm text-white/70">La plateforme circuit court de référence en RDC</p>
      </div>

      {/* Visuel central premium */}
      <div className="relative space-y-6">
        <div>
          <h2 className="text-balance text-3xl font-extrabold leading-tight text-white xl:text-4xl">
            Mangez frais.
            <br />
            <span className="text-white/85">Soutenez local.</span>
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/75">
            Produits cueillis le matin, livrés en 24h. Paiement Mobile Money, traçabilité GPS et vendeurs certifiés.
          </p>
        </div>

        <div className="relative flex items-end gap-4">
          <div className="animate-float relative h-40 w-40 overflow-hidden rounded-[1.5rem] border-4 border-white/20 shadow-2xl xl:h-44 xl:w-44">
            <Image src="/fresh-red-tomatoes-on-vine.jpg" alt="Tomates fraîches" fill sizes="180px" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
          <div className="animate-float-slow relative h-32 w-32 overflow-hidden rounded-2xl border-4 border-white/20 shadow-2xl" style={{ animationDelay: "1s" }}>
            <Image src="/honey-jar-lavender.jpg" alt="Miel artisanal" fill sizes="130px" className="object-cover" />
          </div>
          <div
            className="animate-float-y relative h-28 w-28 overflow-hidden rounded-2xl border-4 border-white/20 shadow-2xl"
            style={{ animationDelay: "0.5s" }}
          >
            <Image src="/red-gala-apples-fresh.jpg" alt="Pommes fraîches" fill sizes="115px" className="object-cover" />
          </div>
          {/* Carte témoignage flottante */}
          <div className="absolute -bottom-6 left-6 hidden rounded-2xl border border-white/15 bg-white/95 p-3 shadow-xl backdrop-blur xl:flex xl:items-center xl:gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-7 w-7 overflow-hidden rounded-full border-2 border-white bg-muted">
                  <Image src={`https://i.pravatar.cc/100?img=${14 + i}`} alt="" width={28} height={28} className="object-cover" />
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 text-xs font-bold">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                4.9/5
                <span className="font-normal text-muted-foreground">(2 400 avis)</span>
              </div>
              <p className="text-xs text-muted-foreground">Adoré par 2 000 familles</p>
            </div>
          </div>
        </div>

      </div>

      {/* Points forts + footer */}
      <div className="relative space-y-4">
        <ul className="space-y-3">
          {highlights.map((item) => (
            <li key={item.label} className="flex items-center gap-3 text-white/90">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                <item.icon className="h-4 w-4 text-white" />
              </span>
              <span className="text-sm font-medium">{item.label}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium text-white backdrop-blur">
          <Sprout className="h-4 w-4" />
          Paiement M-Pesa & Orange Money • Support 7j/7
        </div>
      </div>
    </div>
  )
}
