"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useData } from "@/lib/data-context"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollReveal } from "@/components/scroll-reveal"
import { cn } from "@/lib/utils"
import type { AccountRequest, PaymentMethod } from "@/lib/types"
import { ACCOUNT_REQUEST_STATUS_LABELS, FARMER_ACCOUNT_FEE, PAYMENT_METHOD_LABELS } from "@/lib/types"
import { isValidPhoneNumber, processMobileMoneyPayment } from "@/lib/payment"
import {
  Leaf,
  User,
  Phone,
  Mail,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  FileText,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Smartphone,
  CreditCard,
  ShieldCheck,
  UserPlus,
  AlertCircle,
} from "lucide-react"

const FEE_LABEL = `${FARMER_ACCOUNT_FEE.toFixed(2).replace(".", ",")} FC`

const steps = [
  {
    icon: FileText,
    title: "1. Envoyez votre demande",
    description: "Remplissez le formulaire ci-dessous pour demander la création de votre compte agriculteur à l'administrateur.",
  },
  {
    icon: ShieldCheck,
    title: "2. Confirmation de l'administrateur",
    description: "L'administrateur examine votre demande et la confirme. Suivez son statut avec votre adresse email.",
  },
  {
    icon: CreditCard,
    title: `3. Payez les frais de création (${FEE_LABEL})`,
    description: "Une fois confirmée, réglez les frais de création par Mobile Money pour activer et accéder à votre compte.",
  },
]

export default function ContactPage() {
  const { accountRequests, createAccountRequest, payAccountRequest } = useData()
  const { checkEmailExists } = useAuth()
  const { toast } = useToast()

  // ----- Formulaire de demande -----
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    password: "",
    confirmPassword: "",
    message: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requestSent, setRequestSent] = useState(false)

  // ----- Suivi de demande -----
  const [trackingEmail, setTrackingEmail] = useState("")
  const [trackedRequest, setTrackedRequest] = useState<AccountRequest | null | "not_found">(null)

  // ----- Paiement -----
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mpesa")
  const [payerPhone, setPayerPhone] = useState("")
  const [isPaying, setIsPaying] = useState(false)
  const [paymentDone, setPaymentDone] = useState<{ reference: string } | null>(null)

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.location.trim()) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      })
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({
        title: "Email invalide",
        description: "Veuillez saisir une adresse email valide.",
        variant: "destructive",
      })
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: "Mot de passe invalide",
        description: "Le mot de passe doit contenir au moins 6 caractères.",
        variant: "destructive",
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      })
      return
    }

    if (checkEmailExists(formData.email)) {
      toast({
        title: "Email déjà utilisé",
        description: "Un compte existe déjà avec cette adresse email.",
        variant: "destructive",
      })
      return
    }

    const existingRequest = accountRequests.find(
      (r) => r.email.toLowerCase() === formData.email.toLowerCase() && r.status !== "rejected"
    )
    if (existingRequest) {
      toast({
        title: "Demande déjà envoyée",
        description: "Une demande existe déjà pour cet email. Utilisez le suivi de demande.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 500))

    createAccountRequest({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      location: formData.location.trim(),
      password: formData.password,
      message: formData.message.trim() || undefined,
    })

    setIsSubmitting(false)
    setRequestSent(true)
    setTrackingEmail(formData.email.trim())
    toast({
      title: "Demande envoyée",
      description: "Votre demande a été transmise à l'administrateur.",
    })
  }

  const handleTrackRequest = () => {
    if (!trackingEmail.trim()) {
      toast({
        title: "Email requis",
        description: "Veuillez saisir l'adresse email utilisée lors de la demande.",
        variant: "destructive",
      })
      return
    }

    const found = accountRequests
      .filter((r) => r.email.toLowerCase() === trackingEmail.trim().toLowerCase())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]

    setTrackedRequest(found ?? "not_found")
    setPaymentDone(null)
    if (found) {
      setPayerPhone(found.phone || "")
    }
  }

  const handlePayFee = async () => {
    if (!trackedRequest || trackedRequest === "not_found") return

    if (!isValidPhoneNumber(payerPhone)) {
      toast({
        title: "Numéro invalide",
        description: "Veuillez saisir un numéro Mobile Money valide (ex : +243 812 345 678).",
        variant: "destructive",
      })
      return
    }

    setIsPaying(true)

    // Le paiement est versé à la plateforme (administrateur) comme frais de création
    const result = await processMobileMoneyPayment({
      method: paymentMethod,
      payerPhone,
      recipientPhone: "Plateforme TerraFrais",
      amount: FARMER_ACCOUNT_FEE,
      reference: trackedRequest.id,
    })

    setIsPaying(false)

    if (!result.success) {
      toast({
        title: "Échec du paiement",
        description: result.error || "Le paiement n'a pas abouti. Veuillez réessayer.",
        variant: "destructive",
      })
      return
    }

    payAccountRequest(trackedRequest.id, paymentMethod, result.transactionRef)
    setPaymentDone({ reference: result.transactionRef })
    setTrackedRequest({ ...trackedRequest, status: "paid", paymentReference: result.transactionRef })
    toast({
      title: "Paiement confirmé",
      description: "Votre compte agriculteur est maintenant actif. Vous pouvez vous connecter.",
    })
  }

  const statusBadge = (status: AccountRequest["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />{ACCOUNT_REQUEST_STATUS_LABELS.pending}</Badge>
      case "approved":
        return <Badge variant="default" className="gap-1"><CheckCircle2 className="h-3 w-3" />{ACCOUNT_REQUEST_STATUS_LABELS.approved}</Badge>
      case "rejected":
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />{ACCOUNT_REQUEST_STATUS_LABELS.rejected}</Badge>
      case "paid":
        return <Badge variant="secondary" className="gap-1"><CheckCircle2 className="h-3 w-3" />{ACCOUNT_REQUEST_STATUS_LABELS.paid}</Badge>
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            {/* <ScrollReveal>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
                <UserPlus className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary">Devenir Agriculteur Partenaire</span>
              </div>
            </ScrollReveal> */}
            <ScrollReveal delay={100}>
              <h1 className="text-balance text-4xl font-bold text-foreground sm:text-5xl">
                Contactez <span className="text-primary">l&apos;Administrateur</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <p className="mt-6 text-pretty text-lg text-muted-foreground">
                Vous souhaitez vendre vos produits sur TerraFrais ? Demandez la création de votre compte
                agriculteur auprès de l&apos;administrateur. Après confirmation, des frais de création de{" "}
                <span className="font-semibold text-foreground">{FEE_LABEL}</span> vous donneront accès à votre compte.
              </p>
            </ScrollReveal>
          </div>
        </div>
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      </section>

      {/* Formulaire + Suivi */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <Card className="mx-auto max-w-2xl shadow-lg">
              <Tabs defaultValue={requestSent ? "suivi" : "demande"} key={requestSent ? "suivi" : "demande"}>
                <CardHeader>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="demande" className="gap-2">
                      <FileText className="h-4 w-4" />
                      Nouvelle demande
                    </TabsTrigger>
                    <TabsTrigger value="suivi" className="gap-2">
                      <Search className="h-4 w-4" />
                      Suivre ma demande
                    </TabsTrigger>
                  </TabsList>
                  <CardDescription className="pt-2">
                    Les comptes agriculteurs sont créés par l&apos;administrateur. Les acheteurs peuvent{" "}
                    <Link href="/inscription" className="font-medium text-primary hover:underline">
                      s&apos;inscrire directement
                    </Link>
                    .
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {/* ========== Onglet : Nouvelle demande ========== */}
                  <TabsContent value="demande" className="mt-0">
                    {requestSent ? (
                      <div className="flex flex-col items-center gap-4 py-8 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                          <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                        <div>
                          <p className="text-lg font-medium">Demande envoyée avec succès !</p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            L&apos;administrateur va examiner votre demande. Revenez sur cette page et utilisez
                            l&apos;onglet <span className="font-medium text-foreground">« Suivre ma demande »</span> avec
                            votre email <span className="font-medium text-foreground">{formData.email}</span> pour
                            connaître sa décision et payer les frais de création de {FEE_LABEL}.
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setRequestSent(false)
                            setFormData({
                              name: "",
                              email: "",
                              phone: "",
                              location: "",
                              password: "",
                              confirmPassword: "",
                              message: "",
                            })
                          }}
                        >
                          Faire une autre demande
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitRequest} className="space-y-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="contact-name">Nom complet *</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="contact-name"
                                placeholder="Richard DM"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="pl-10"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="contact-phone">Téléphone *</Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="contact-phone"
                                type="tel"
                                placeholder="+243 830 854 244"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                required
                                className="pl-10"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="contact-email">Adresse email *</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="contact-email"
                              type="email"
                              placeholder="votre@email.com"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              required
                              className="pl-10"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Cet email servira d&apos;identifiant de connexion et de suivi de votre demande.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="contact-location">Localisation / Région *</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="contact-location"
                              placeholder="Kinshasa / Gombe"
                              value={formData.location}
                              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                              required
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="contact-password">Mot de passe *</Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="contact-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                minLength={6}
                                className="pl-10 pr-10"
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
                          <div className="space-y-2">
                            <Label htmlFor="contact-confirm">Confirmer *</Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="contact-confirm"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                                minLength={6}
                                className="pl-10 pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                tabIndex={-1}
                              >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="contact-message">Présentation de votre exploitation (optionnel)</Label>
                          <Textarea
                            id="contact-message"
                            placeholder="Décrivez votre exploitation, vos cultures, votre expérience..."
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            rows={4}
                          />
                        </div>

                        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
                          <p className="flex items-start gap-2">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <span>
                              Des frais de création de <span className="font-semibold">{FEE_LABEL}</span> seront à
                              régler uniquement après la confirmation de votre demande par l&apos;administrateur.
                            </span>
                          </p>
                        </div>

                        <Button type="submit" className="w-full shadow-md shadow-primary/20" disabled={isSubmitting}>
                          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Envoyer ma demande à l&apos;administrateur
                        </Button>
                      </form>
                    )}
                  </TabsContent>

                  {/* ========== Onglet : Suivi + Paiement ========== */}
                  <TabsContent value="suivi" className="mt-0 space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="tracking-email">Adresse email de la demande</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="tracking-email"
                            type="email"
                            placeholder="votre@email.com"
                            value={trackingEmail}
                            onChange={(e) => setTrackingEmail(e.target.value)}
                            className="pl-10"
                            onKeyDown={(e) => e.key === "Enter" && handleTrackRequest()}
                          />
                        </div>
                        <Button onClick={handleTrackRequest} variant="outline" className="gap-2 bg-transparent">
                          <Search className="h-4 w-4" />
                          Rechercher
                        </Button>
                      </div>
                    </div>

                    {trackedRequest === "not_found" && (
                      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-8 text-center">
                        <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">
                          Aucune demande trouvée pour cette adresse email.
                        </p>
                      </div>
                    )}

                    {trackedRequest && trackedRequest !== "not_found" && (
                      <div className="space-y-4">
                        {/* Résumé de la demande */}
                        <div className="rounded-lg border p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium">{trackedRequest.name}</p>
                              <p className="text-sm text-muted-foreground">{trackedRequest.email}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Envoyée le {new Date(trackedRequest.createdAt).toLocaleDateString("fr-FR")}
                              </p>
                            </div>
                            {statusBadge(trackedRequest.status)}
                          </div>
                        </div>

                        {/* Statut : en attente */}
                        {trackedRequest.status === "pending" && (
                          <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                            <div className="text-sm">
                              <p className="font-medium">En cours d&apos;examen</p>
                              <p className="mt-1 text-muted-foreground">
                                L&apos;administrateur n&apos;a pas encore traité votre demande. Revenez plus tard pour
                                vérifier son statut.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Statut : rejetée */}
                        {trackedRequest.status === "rejected" && (
                          <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                            <div className="text-sm">
                              <p className="font-medium">Demande rejetée</p>
                              <p className="mt-1 text-muted-foreground">
                                Votre demande n&apos;a pas été retenue. Vous pouvez soumettre une nouvelle demande avec
                                des informations complémentaires.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Statut : confirmée -> paiement des frais */}
                        {trackedRequest.status === "approved" && !paymentDone && (
                          <div className="space-y-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                              <div className="text-sm">
                                <p className="font-medium">Votre demande a été confirmée !</p>
                                <p className="mt-1 text-muted-foreground">
                                  Pour activer votre compte agriculteur, veuillez régler les frais de création de{" "}
                                  <span className="font-semibold text-foreground">{FEE_LABEL}</span> via Mobile Money.
                                </p>
                              </div>
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

                            <div className="space-y-2">
                              <Label htmlFor="fee-payer-phone" className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                Votre numéro {PAYMENT_METHOD_LABELS[paymentMethod]}
                              </Label>
                              <Input
                                id="fee-payer-phone"
                                type="tel"
                                placeholder="+243 812 345 678"
                                value={payerPhone}
                                onChange={(e) => setPayerPhone(e.target.value)}
                              />
                              <p className="text-xs text-muted-foreground">
                                Vous recevrez une demande de confirmation sur ce numéro.
                              </p>
                            </div>

                            <div className="flex items-center justify-between rounded-lg bg-background p-3 text-sm">
                              <span className="font-medium">Frais de création du compte</span>
                              <span className="font-bold text-primary">{FEE_LABEL}</span>
                            </div>

                            <Button onClick={handlePayFee} className="w-full gap-2" disabled={isPaying}>
                              {isPaying ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Paiement en cours...
                                </>
                              ) : (
                                <>
                                  <Smartphone className="h-4 w-4" />
                                  Payer {FEE_LABEL}
                                </>
                              )}
                            </Button>
                          </div>
                        )}

                        {/* Statut : payé / compte créé */}
                        {(trackedRequest.status === "paid" || paymentDone) && (
                          <div className="space-y-4">
                            <div className="flex flex-col items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/5 p-6 text-center">
                              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                                <CheckCircle2 className="h-7 w-7 text-green-600" />
                              </div>
                              <div>
                                <p className="font-medium">Votre compte agriculteur est actif !</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  Les frais de création de {FEE_LABEL} ont été payés
                                  {(paymentDone?.reference || trackedRequest.paymentReference) && (
                                    <>
                                      {" "}(réf.{" "}
                                      <span className="font-mono">
                                        {paymentDone?.reference || trackedRequest.paymentReference}
                                      </span>
                                      )
                                    </>
                                  )}
                                  . Connectez-vous avec votre email et le mot de passe choisi lors de la demande.
                                </p>
                              </div>
                              <Button asChild className="gap-2">
                                <Link href="/connexion">
                                  <Leaf className="h-4 w-4" />
                                  Se connecter à mon compte
                                </Link>
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </ScrollReveal>
        </div>
      </section>

      {/* Étapes du processus */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <ScrollReveal key={step.title} delay={index * 100}>
                <Card className="h-full transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                      <step.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
