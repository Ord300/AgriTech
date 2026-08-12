import Link from "next/link"
import { Leaf, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react"
import { ScrollReveal } from "@/components/scroll-reveal"

const navigationLinks = [
  { href: "/", label: "Accueil" },
  { href: "/marche", label: "Marché" },
  { href: "/a-propos", label: "À Propos" },
  { href: "/actualites", label: "Actualités" },
  { href: "/contact", label: "Contact" },
]

const userLinks = [
  { href: "/connexion", label: "Connexion" },
  { href: "/inscription", label: "Inscription" },
  { href: "/agriculteur", label: "Espace Agriculteur" },
  { href: "/acheteur", label: "Espace Acheteur" },
]

const socials = [
  { icon: Facebook, label: "Facebook" },
  { icon: Instagram, label: "Instagram" },
  { icon: Twitter, label: "Twitter" },
]

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <ScrollReveal>
            <div className="space-y-4">
              <Link href="/" className="group inline-flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/15 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                  <Leaf className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold">TerraFrais</span>
              </Link>
              <p className="text-sm text-primary-foreground/70">
                Connecter les agriculteurs aux acheteurs pour un commerce plus juste et plus direct.
              </p>
              <div className="flex gap-3 pt-1">
                {socials.map((social) => (
                  <Link
                    key={social.label}
                    href="#"
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/10 transition-all duration-300 hover:-translate-y-1 hover:bg-primary-foreground/20"
                  >
                    <social.icon className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary-foreground/90">
                Navigation
              </h4>
              <ul className="space-y-2 text-sm text-primary-foreground/70">
                {navigationLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-block transition-all duration-300 hover:translate-x-1 hover:text-primary-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary-foreground/90">
                Espace Utilisateur
              </h4>
              <ul className="space-y-2 text-sm text-primary-foreground/70">
                {userLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-block transition-all duration-300 hover:translate-x-1 hover:text-primary-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary-foreground/90">
                Contact
              </h4>
              <ul className="space-y-3 text-sm text-primary-foreground/70">
                <li className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10">
                    <Mail className="h-4 w-4" />
                  </span>
                  ordidimbi@gmail.fr
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10">
                    <Phone className="h-4 w-4" />
                  </span>
                  +243 830 854 244
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <span>
                    République décoratique du congo
                  </span>
                </li>
              </ul>
            </div>
          </ScrollReveal>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-primary-foreground/15 pt-8 text-sm text-primary-foreground/60 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} TerraFrais. Tous droits réservés.</p>
          <p className="inline-flex items-center gap-1.5">
            Fait avec <Leaf className="h-4 w-4" /> pour l&apos;agriculture locale
          </p>
        </div>
      </div>
    </footer>
  )
}
