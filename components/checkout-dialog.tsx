"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useData } from "@/lib/data-context"
import { useCart } from "@/lib/cart-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Loader2,
  Eye,
  EyeOff,
  User,
  Phone,
  Mail,
  MapPin,
  Lock,
  CheckCircle2,
  Smartphone,
  ShoppingBag,
  ShieldAlert,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { PaymentMethod } from "@/lib/types"
import { PAYMENT_METHOD_LABELS } from "@/lib/types"
import {
  groupCartByFarmer,
  processMobileMoneyPayment,
  type FarmerPaymentGroup,
} from "@/lib/payment"

type CheckoutStep =
  | "recap"
  | "contact"
  | "login"
  | "register"
  | "payment"
  | "processing"
  | "success"

interface CompletedPayment {
  group: FarmerPaymentGroup
  transactionRef: string
}

export function CheckoutDialog() {
  const { user, login, register, checkEmailExists } = useAuth()
  const { users, addOrders, addTransactions } = useData()
  const { items, totalPrice, clearCart, isCheckoutOpen, setCheckoutOpen } = useCart()
  const { toast } = useToast()

  const [step, setStep] = useState<CheckoutStep>("recap")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Infos personnelles / livraison
  const [buyerId, setBuyerId] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [location, setLocation] = useState("")

  // Connexion / inscription
  const [password, setPassword] = useState("")

  // Paiement
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mpesa")
  const [payerPhone, setPayerPhone] = useState("")
  const [completedPayments, setCompletedPayments] = useState<CompletedPayment[]>([])

  // Répartition par agriculteur (paiement séparé par vendeur)
  const farmerGroups = useMemo(() => groupCartByFarmer(items, users), [items, users])
  const totalCommission = farmerGroups.reduce((sum, g) => sum + g.commission, 0)

  // À l'ouverture : récupérer les infos de l'utilisateur connecté,
  // sinon démarrer par la demande des infos personnelles (invité).
  useEffect(() => {
    if (!isCheckoutOpen) return
    if (user) {
      setBuyerId(user.id)
      setName(user.name || "")
      setPhone(user.phone || "")
      setEmail(user.email || "")
      setLocation(user.location || "")
      setPayerPhone(user.phone || "")
      setStep("recap")
    } else {
      setBuyerId("")
      setStep("contact")
    }
  }, [isCheckoutOpen, user])

  const resetAndClose = (open: boolean) => {
    setCheckoutOpen(open)
    if (!open) {
      setStep("recap")
      setPassword("")
      setShowPassword(false)
      setIsLoading(false)
      setPaymentMethod("mpesa")
      setCompletedPayments([])
    }
  }

  // ---------- Étape invité : coordonnées ----------
  const handleContactSubmit = () => {
    if (!name.trim() || !phone.trim() || !email.trim()) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      })
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Email invalide",
        description: "Veuillez saisir une adresse email valide.",
        variant: "destructive",
      })
      return
    }

    // Comme dans le système actuel : email connu -> connexion, sinon -> création de compte
    if (checkEmailExists(email)) {
      setStep("login")
    } else {
      setStep("register")
    }
  }

  const handleLogin = async () => {
    if (!password) {
      toast({
        title: "Mot de passe requis",
        description: "Veuillez saisir votre mot de passe.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    const result = await login(email, password)
    setIsLoading(false)

    if (result.success) {
      const storedUser = localStorage.getItem("agrimarche_user")
      const loggedInUser = storedUser ? JSON.parse(storedUser) : null
      setBuyerId(loggedInUser?.id ?? "")
      setName(loggedInUser?.name || name)
      setLocation(loggedInUser?.location || "")
      setPayerPhone(loggedInUser?.phone || phone)
      setStep("recap")
    } else {
      toast({
        title: "Erreur de connexion",
        description: result.error,
        variant: "destructive",
      })
    }
  }

  const handleRegister = async () => {
    if (!password || password.length < 6) {
      toast({
        title: "Mot de passe invalide",
        description: "Le mot de passe doit contenir au moins 6 caractères.",
        variant: "destructive",
      })
      return
    }

    if (!location.trim()) {
      toast({
        title: "Localisation requise",
        description: "Veuillez renseigner votre localisation / région.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    const result = await register({
      email,
      password,
      name,
      role: "buyer",
      phone,
      location,
    })
    setIsLoading(false)

    if (result.success) {
      const storedUser = localStorage.getItem("agrimarche_user")
      const newUser = storedUser ? JSON.parse(storedUser) : null
      setBuyerId(newUser?.id ?? "")
      setPayerPhone(phone)
      setStep("recap")
    } else {
      toast({
        title: "Erreur d'inscription",
        description: result.error,
        variant: "destructive",
      })
    }
  }

  // ---------- Paiement Mobile Money ----------
  const handleGoToPayment = () => {
    if (!location.trim()) {
      toast({
        title: "Localisation requise",
        description: "Veuillez renseigner votre localisation pour la livraison.",
        variant: "destructive",
      })
      return
    }
    if (!phone.trim()) {
      toast({
        title: "Téléphone requis",
        description: "Veuillez renseigner votre numéro de téléphone.",
        variant: "destructive",
      })
      return
    }
    setPayerPhone((prev) => prev || phone)
    setStep("payment")
  }

  const handleConfirmPayment = async () => {
    setStep("processing")

    // 1. Créer les commandes (une par produit du panier)
    const createdOrders = addOrders(
      items.map((item) => ({
        buyerId,
        buyerName: name,
        buyerPhone: phone,
        productId: item.productId,
        productName: item.productName,
        farmerId: item.farmerId,
        farmerName: item.farmerName,
        quantity: item.quantity,
        totalPrice: item.price * item.quantity,
        status: "pending" as const,
      })),
    )

    // 2. Payer chaque agriculteur séparément sur son numéro enregistré
    const results: CompletedPayment[] = []
    for (const group of farmerGroups) {
      const groupOrderIds = createdOrders
        .filter((o) => o.farmerId === group.farmerId)
        .map((o) => o.id)

      const payment = await processMobileMoneyPayment({
        method: paymentMethod,
        payerPhone,
        recipientPhone: group.farmerPhone,
        amount: group.amount,
        reference: groupOrderIds.join(","),
      })

      results.push({ group, transactionRef: payment.transactionRef })
    }

    // 3. Enregistrer les transactions (97% agriculteur, 3% admin)
    addTransactions(
      results.map(({ group, transactionRef }) => ({
        reference: transactionRef,
        orderIds: createdOrders.filter((o) => o.farmerId === group.farmerId).map((o) => o.id),
        buyerId,
        buyerName: name,
        buyerPhone: payerPhone,
        farmerId: group.farmerId,
        farmerName: group.farmerName,
        farmerPhone: group.farmerPhone,
        method: paymentMethod,
        amount: group.amount,
        commission: group.commission,
        farmerAmount: group.farmerAmount,
        status: "completed" as const,
      })),
    )

    setCompletedPayments(results)
    clearCart()
    setStep("success")
  }

  const handleBack = () => {
    if (step === "login" || step === "register") {
      setStep("contact")
    } else if (step === "payment") {
      setStep("recap")
    }
  }

  return (
    <Dialog open={isCheckoutOpen} onOpenChange={resetAndClose}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-lg">
        <DialogHeader className="shrink-0">
          <DialogTitle>
            {step === "recap" && "Finaliser la commande"}
            {step === "contact" && "Vos coordonnées"}
            {step === "login" && "Connexion"}
            {step === "register" && "Créer votre compte"}
            {step === "payment" && "Paiement Mobile Money"}
            {step === "processing" && "Paiement en cours"}
            {step === "success" && "Paiement confirmé"}
          </DialogTitle>
          <DialogDescription>
            {step === "recap" && "Vérifiez vos informations et vos produits avant de payer."}
            {step === "contact" && "Renseignez vos coordonnées pour finaliser votre commande."}
            {step === "login" && "Cet email est déjà enregistré. Connectez-vous pour continuer."}
            {step === "register" && "Créez votre compte acheteur pour finaliser votre commande."}
            {step === "payment" && "Chaque agriculteur est payé directement sur son numéro enregistré."}
            {step === "processing" && "Traitement de votre paiement..."}
            {step === "success" && "Votre commande a été payée et transmise aux agriculteurs."}
          </DialogDescription>
        </DialogHeader>

        {/* Liste défilante : les produits restent visibles et consultables même nombreux */}
        <div className="min-h-0 flex-1 overflow-y-auto pr-2">
          {/* ---------- Étape : Coordonnées (invité) ---------- */}
          {step === "contact" && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="checkout-name" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Nom complet
                </Label>
                <Input
                  id="checkout-name"
                  placeholder="Roseline DM"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkout-phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Téléphone
                </Label>
                <Input
                  id="checkout-phone"
                  type="tel"
                  placeholder="+243 812 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkout-email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Adresse email
                </Label>
                <Input
                  id="checkout-email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Si votre email est déjà enregistré, nous vous demanderons votre mot de passe pour vous
                connecter. Sinon, vous pourrez créer votre compte avec votre localisation.
              </p>
            </div>
          )}

          {/* ---------- Étape : Connexion ---------- */}
          {step === "login" && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p className="font-medium">Compte trouvé</p>
                <p className="text-muted-foreground">{email}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkout-login-password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  Mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="checkout-login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ---------- Étape : Inscription ---------- */}
          {step === "register" && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p className="font-medium">Nouveau compte</p>
                <p className="text-muted-foreground">
                  {name} • {email}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkout-register-location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Localisation / Région
                </Label>
                <Input
                  id="checkout-register-location"
                  placeholder="Kinshasa / Gombe"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkout-register-password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  Mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="checkout-register-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Créez votre compte acheteur pour suivre vos commandes et faciliter vos prochains achats.
              </p>
            </div>
          )}

          {/* ---------- Étape : Récapitulatif ---------- */}
          {step === "recap" && (
            <div className="space-y-4 py-2">
              {/* Informations personnelles (récupérées du compte si connecté) */}
              <div className="space-y-3 rounded-lg border p-4">
                <h4 className="flex items-center gap-2 text-sm font-semibold">
                  <User className="h-4 w-4 text-primary" />
                  Vos informations
                  {user && <Badge variant="secondary">Compte connecté</Badge>}
                </h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="recap-name" className="text-xs">Nom complet</Label>
                    <Input
                      id="recap-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={!!user}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="recap-phone" className="text-xs">Téléphone</Label>
                    <Input
                      id="recap-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="recap-location" className="text-xs">Localisation / Adresse de livraison</Label>
                    <Input
                      id="recap-location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Kinshasa / Gombe"
                    />
                  </div>
                </div>
              </div>

              {/* Liste des produits sélectionnés */}
              <div className="space-y-2">
                <h4 className="flex items-center gap-2 text-sm font-semibold">
                  <ShoppingBag className="h-4 w-4 text-primary" />
                  Produits sélectionnés ({items.length})
                </h4>
                <div className="divide-y rounded-lg border">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between gap-3 p-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.farmerName} · {item.quantity} {item.unit} × {item.price.toFixed(2)} FC
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold">
                        {(item.price * item.quantity).toFixed(2)} FC
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between rounded-lg bg-primary/10 p-4">
                  <span className="font-medium">Total à payer</span>
                  <span className="text-xl font-bold text-primary">{totalPrice.toFixed(2)} FC</span>
                </div>
              </div>
            </div>
          )}

          {/* ---------- Étape : Paiement Mobile Money ---------- */}
          {step === "payment" && (
            <div className="space-y-4 py-2">
              {/* Avertissement vigilance avant paiement */}
              <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-amber-700 dark:text-amber-400">
                    Achetez en toute vigilance :
                  </span>{" "}
                  vérifiez le profil du vendeur (badge « Certifié », avis clients) avant de
                  confirmer. TerraFrais verse les fonds directement aux numéros Mobile Money des
                  agriculteurs enregistrés. Refusez toute demande de paiement direct ou de
                  changement de numéro reçue en dehors de la plateforme.
                </p>
              </div>

              {/* Choix de l'opérateur */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("mpesa")}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors",
                    paymentMethod === "mpesa"
                      ? "border-green-600 bg-green-50 dark:bg-green-950/30"
                      : "border-border hover:border-green-300",
                  )}
                >
                  <Smartphone className={cn("h-6 w-6", paymentMethod === "mpesa" ? "text-green-600" : "text-muted-foreground")} />
                  <span className="text-sm font-semibold">M-Pesa</span>
                  {paymentMethod === "mpesa" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("orange_money")}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors",
                    paymentMethod === "orange_money"
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30"
                      : "border-border hover:border-orange-300",
                  )}
                >
                  <Smartphone className={cn("h-6 w-6", paymentMethod === "orange_money" ? "text-orange-500" : "text-muted-foreground")} />
                  <span className="text-sm font-semibold">Orange Money</span>
                  {paymentMethod === "orange_money" && <CheckCircle2 className="h-4 w-4 text-orange-500" />}
                </button>
              </div>

              {/* Numéro du payeur */}
              <div className="space-y-2">
                <Label htmlFor="payer-phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Votre numéro {PAYMENT_METHOD_LABELS[paymentMethod]}
                </Label>
                <Input
                  id="payer-phone"
                  type="tel"
                  placeholder="+243 812 345 678"
                  value={payerPhone}
                  onChange={(e) => setPayerPhone(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Vous recevrez une demande de confirmation sur ce numéro.
                </p>
              </div>

              {/* Répartition du paiement par agriculteur */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">
                  Répartition du paiement ({farmerGroups.length} agriculteur{farmerGroups.length > 1 ? "s" : ""})
                </h4>
                <div className="space-y-2">
                  {farmerGroups.map((group) => (
                    <div key={group.farmerId} className="rounded-lg border p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{group.farmerName}</p>
                        <p className="font-bold">{group.amount.toFixed(2)} FC</p>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {group.items.length} produit{group.items.length > 1 ? "s" : ""} · Versé au {group.farmerPhone}
                      </p>
                      <div className="mt-2 flex items-center justify-between border-t pt-2 text-xs">
                        <span className="text-muted-foreground">Commission plateforme (3%)</span>
                        <span className="text-muted-foreground">- {group.commission.toFixed(2)} FC</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-green-700 dark:text-green-400">Net pour l&apos;agriculteur</span>
                        <span className="font-semibold text-green-700 dark:text-green-400">{group.farmerAmount.toFixed(2)} FC</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between rounded-lg bg-primary/10 p-3 text-sm">
                  <span className="font-medium">Total débité de votre compte {PAYMENT_METHOD_LABELS[paymentMethod]}</span>
                  <span className="font-bold text-primary">{totalPrice.toFixed(2)} FC</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Commission totale de la plateforme : {totalCommission.toFixed(2)} FC (3% par transaction).
                </p>
              </div>
            </div>
          )}

          {/* ---------- Étape : Traitement ---------- */}
          {step === "processing" && (
            <div className="flex flex-col items-center gap-4 py-10">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="text-center">
                <p className="font-medium">Paiement {PAYMENT_METHOD_LABELS[paymentMethod]} en cours...</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Validez la transaction sur votre téléphone ({payerPhone}).
                </p>
              </div>
            </div>
          )}

          {/* ---------- Étape : Succès ---------- */}
          {step === "success" && (
            <div className="space-y-4 py-2">
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium">Merci {name} !</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Votre paiement {PAYMENT_METHOD_LABELS[paymentMethod]} a été effectué avec succès.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Détail des transactions</h4>
                {completedPayments.map(({ group, transactionRef }) => (
                  <div key={transactionRef} className="rounded-lg border p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{group.farmerName}</p>
                      <p className="font-bold">{group.amount.toFixed(2)} FC</p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Référence : <span className="font-mono">{transactionRef}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Versé au {group.farmerPhone} · Net agriculteur : {group.farmerAmount.toFixed(2)} FC
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}


        </div>

        <DialogFooter className="shrink-0 flex-col gap-2 sm:flex-row sm:justify-between">
          {(step === "contact" || step === "login" || step === "register" || step === "recap" || step === "payment") && (
            <div className="flex gap-2">
              {(step === "login" || step === "register" || step === "payment") && (
                <Button variant="outline" onClick={handleBack} disabled={isLoading}>
                  Retour
                </Button>
              )}
              <Button variant="outline" onClick={() => resetAndClose(false)} disabled={isLoading}>
                Annuler
              </Button>
            </div>
          )}

          {step === "contact" && (
            <Button onClick={handleContactSubmit}>Continuer</Button>
          )}

          {step === "login" && (
            <Button onClick={handleLogin} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Se connecter
            </Button>
          )}

          {step === "register" && (
            <Button onClick={handleRegister} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer mon compte
            </Button>
          )}

          {step === "recap" && (
            <Button onClick={handleGoToPayment} className="gap-2">
              <Smartphone className="h-4 w-4" />
              Payer ma commande
            </Button>
          )}

          {step === "payment" && (
            <Button onClick={handleConfirmPayment} className="gap-2">
              <Smartphone className="h-4 w-4" />
              Confirmer le paiement de {totalPrice.toFixed(2)} FC
            </Button>
          )}

          {step === "success" && (
            <Button onClick={() => resetAndClose(false)} className="w-full sm:w-auto">
              Fermer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
