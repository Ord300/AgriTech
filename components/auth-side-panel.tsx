import Link from "next/link"
import Image from "next/image"
import { Leaf, ShieldCheck, Truck, Users } from "lucide-react"

const highlights = [
  { icon: ShieldCheck, label: "Produits 100% locaux et traçables" },
  { icon: Truck, label: "Circuit court, du champ à votre table" },
  { icon: Users, label: "Communauté d'agriculteurs partenaires" },
]

export function AuthSidePanel() {
  return (
    <div className="relative hidden overflow-hidden bg-primary lg:flex lg:flex-col lg:justify-between lg:p-12">
      {/* Cercles décoratifs animés */}
      <div className="animate-pulse-soft absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary-foreground/10 blur-2xl" />
      <div
        className="animate-pulse-soft absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-primary-foreground/10 blur-3xl"
        style={{ animationDelay: "1.5s" }}
      />
      <div
        className="animate-pulse-soft absolute right-1/4 top-1/3 h-40 w-40 rounded-full bg-primary-foreground/5 blur-xl"
        style={{ animationDelay: "3s" }}
      />

      {/* Logo */}
      <div className="relative">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="animate-float-y flex h-11 w-11 items-center justify-center rounded-xl bg-primary-foreground/15">
            <Leaf className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-primary-foreground">TerraFrais</span>
        </Link>
      </div>

      {/* Message + images flottantes */}
      <div className="relative space-y-10">
        
        <div className="relative flex items-end gap-5">
          <div className="animate-float relative h-40 w-40 overflow-hidden rounded-2xl border-4 border-primary-foreground/20 shadow-2xl xl:h-44 xl:w-44">
            <Image
              src="/fresh-red-tomatoes-on-vine.jpg"
              alt="Tomates fraîches"
              fill
              sizes="180px"
              className="object-cover"
            />
          </div>
          <div
            className="animate-float-slow relative h-32 w-32 overflow-hidden rounded-2xl border-4 border-primary-foreground/20 shadow-2xl"
            style={{ animationDelay: "1s" }}
          >
            <Image src="/honey-jar-lavender.jpg" alt="Miel artisanal" fill sizes="130px" className="object-cover" />
          </div>
          <div
            className="animate-float-y relative h-28 w-28 overflow-hidden rounded-2xl border-4 border-primary-foreground/20 shadow-2xl"
            style={{ animationDelay: "0.5s" }}
          >
            <Image src="/red-gala-apples-fresh.jpg" alt="Pommes fraîches" fill sizes="115px" className="object-cover" />
          </div>
        </div>
      </div>

      {/* Points forts */}
      <ul className="relative space-y-3">
        {highlights.map((item) => (
          <li key={item.label} className="flex items-center gap-3 text-primary-foreground/90">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15">
              <item.icon className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium">{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
