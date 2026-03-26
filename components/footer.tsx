import Link from "next/link"
import { Leaf, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">AgriMarché</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Connecter les agriculteurs aux acheteurs pour un commerce plus juste et plus direct.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Navigation</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/marche" className="hover:text-foreground">
                  Marché
                </Link>
              </li>
              <li>
                <Link href="/a-propos" className="hover:text-foreground">
                  À Propos
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Espace Utilisateur</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/connexion" className="hover:text-foreground">
                  Connexion
                </Link>
              </li>
              <li>
                <Link href="/inscription" className="hover:text-foreground">
                  Inscription
                </Link>
              </li>
              <li>
                <Link href="/agriculteur" className="hover:text-foreground">
                  Espace Agriculteur
                </Link>
              </li>
              <li>
                <Link href="/acheteur" className="hover:text-foreground">
                  Espace Acheteur
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Contact</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                ordidimbi@gmail.fr
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                +243 830 854 244
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>
                  123 Rue de l&apos;Agriculture
                  <br />
                  0001 Kinshasa, RDC
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} AgriMarché. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}
