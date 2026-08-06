"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useData } from "@/lib/data-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Eye, EyeOff, User, Phone, Mail, MapPin, Lock, CheckCircle2, ShoppingCart } from "lucide-react"
import type { Product } from "@/lib/types"

interface GuestCheckoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  quantity: number
  onQuantityChange: (quantity: number) => void
}

type CheckoutStep = "order" | "contact" | "login" | "register" | "success"

export function GuestCheckoutDialog({
  open,
  onOpenChange,
  product,
  quantity,
  onQuantityChange,
}: GuestCheckoutDialogProps) {
  const { login, register, checkEmailExists } = useAuth()
  const { addOrder } = useData()
  const { toast } = useToast()

  const [step, setStep] = useState<CheckoutStep>("order")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Contact info
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")

  // Login/Register
  const [password, setPassword] = useState("")
  const [location, setLocation] = useState("")

  const resetForm = () => {
    setStep("order")
    setName("")
    setPhone("")
    setEmail("")
    setPassword("")
    setLocation("")
    setShowPassword(false)
    setIsLoading(false)
  }

  const handleClose = (open: boolean) => {
    onOpenChange(open)
    if (!open) {
      resetForm()
    }
  }

  const handleContinueToContact = () => {
    if (!product) return
    setStep("contact")
  }

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

    // Vérifier si l'email existe déjà
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

    if (result.success) {
      // Récupérer l'ID de l'utilisateur connecté depuis le localStorage
      const storedUser = localStorage.getItem("agrimarche_user")
      const loggedInUser = storedUser ? JSON.parse(storedUser) : null
      // Connecté, on passe la commande
      placeOrder(loggedInUser?.id)
    } else {
      toast({
        title: "Erreur de connexion",
        description: result.error,
        variant: "destructive",
      })
      setIsLoading(false)
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

    if (result.success) {
      // Récupérer l'ID de l'utilisateur créé depuis le localStorage
      const storedUser = localStorage.getItem("agrimarche_user")
      const newUser = storedUser ? JSON.parse(storedUser) : null
      // Compte créé, on passe la commande
      placeOrder(newUser?.id)
    } else {
      toast({
        title: "Erreur d'inscription",
        description: result.error,
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const placeOrder = (loggedInUserId?: string) => {
    if (!product) return

    // Utiliser l'ID de l'utilisateur connecté si disponible, sinon un ID invité
    const buyerId = loggedInUserId ?? `guest-${Date.now()}`
    const buyerName = name

    addOrder({
      buyerId,
      buyerName,
      buyerPhone: phone,
      productId: product.id,
      productName: product.name,
      farmerId: product.farmerId,
      farmerName: product.farmerName,
      quantity,
      totalPrice: product.price * quantity,
      status: "pending",
    })

    toast({
      title: "Commande passée",
      description: `Votre commande de ${quantity} ${product.unit} de ${product.name} a été envoyée à ${product.farmerName}.`,
    })

    setIsLoading(false)

    // Si un compte a été connecté/créé, le parent va détecter que l'utilisateur
    // est connecté et basculer vers l'autre dialog. On ferme donc proprement.
    if (loggedInUserId) {
      handleClose(false)
    } else {
      setStep("success")
    }
  }

  const handleBack = () => {
    if (step === "login" || step === "register") {
      setStep("contact")
    } else if (step === "contact") {
      setStep("order")
    }
  }

  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "order" && "Passer une commande"}
            {step === "contact" && "Vos coordonnées"}
            {step === "login" && "Connexion"}
            {step === "register" && "Créer votre compte"}
            {step === "success" && "Commande confirmée"}
          </DialogTitle>
          <DialogDescription>
            {step === "order" && `${product.name} - ${product.farmerName}`}
            {step === "contact" && "Renseignez vos coordonnées pour finaliser votre commande."}
            {step === "login" && "Cet email est déjà enregistré. Connectez-vous pour continuer."}
            {step === "register" && "Créez votre compte acheteur pour finaliser votre commande."}
            {step === "success" && "Votre commande a bien été enregistrée."}
          </DialogDescription>
        </DialogHeader>

        {/* Étape 1 : Récapitulatif de la commande */}
        {step === "order" && (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between rounded-lg bg-muted p-4">
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-muted-foreground">
                  {product.price.toFixed(2)} € / {product.unit}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Stock: {product.quantity} {product.unit}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guest-quantity">Quantité ({product.unit})</Label>
              <Input
                id="guest-quantity"
                type="number"
                min={1}
                max={product.quantity}
                value={quantity}
                onChange={(e) => onQuantityChange(Math.min(Number(e.target.value), product.quantity))}
              />
            </div>

            <div className="rounded-lg bg-primary/10 p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total</span>
                <span className="text-xl font-bold text-primary">
                  {(product.price * quantity).toFixed(2)} €
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
              <div className="flex items-start gap-2">
                <ShoppingCart className="h-4 w-4 mt-0.5 shrink-0" />
                <p>
                  Vous pouvez passer votre commande <strong>sans créer de compte</strong>. 
                  Nous vous demanderons simplement vos coordonnées à l'étape suivante.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Étape 2 : Coordonnées */}
        {step === "contact" && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="guest-name" className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Nom complet
              </Label>
              <Input
                id="guest-name"
                placeholder="Jean Dupont"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guest-phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Téléphone
              </Label>
              <Input
                id="guest-phone"
                type="tel"
                placeholder="+33 6 12 34 56 78"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guest-email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Adresse email
              </Label>
              <Input
                id="guest-email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Si votre email est déjà enregistré, nous vous demanderons votre mot de passe pour vous connecter.
              Sinon, vous pourrez créer votre compte avec votre localisation.
            </p>
          </div>
        )}

        {/* Étape 3a : Connexion */}
        {step === "login" && (
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="font-medium">Compte trouvé</p>
              <p className="text-muted-foreground">{email}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guest-login-password" className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                Mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="guest-login-password"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Connectez-vous pour finaliser votre commande. Vos coordonnées seront pré-remplies à l'avenir.
            </p>
          </div>
        )}

        {/* Étape 3b : Inscription */}
        {step === "register" && (
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="font-medium">Nouveau compte</p>
              <p className="text-muted-foreground">{name} • {email}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guest-register-location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Localisation / Région
              </Label>
              <Input
                id="guest-register-location"
                placeholder="Provence-Alpes-Côte d'Azur"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guest-register-password" className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                Mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="guest-register-password"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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

        {/* Étape 4 : Succès */}
        {step === "success" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-center">
              <p className="font-medium text-lg">Merci {name} !</p>
              <p className="text-sm text-muted-foreground mt-1">
                Votre commande de {quantity} {product.unit} de {product.name} a été envoyée à {product.farmerName}.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {email} recevra une confirmation par email.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          {step !== "success" && (
            <div className="flex gap-2">
              {step !== "order" && (
                <Button variant="outline" onClick={handleBack}>
                  Retour
                </Button>
              )}
              <Button variant="outline" onClick={() => handleClose(false)}>
                Annuler
              </Button>
            </div>
          )}

          {step === "order" && (
            <Button onClick={handleContinueToContact}>
              Continuer
            </Button>
          )}

          {step === "contact" && (
            <Button onClick={handleContactSubmit}>
              Continuer
            </Button>
          )}

          {step === "login" && (
            <Button onClick={handleLogin} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Se connecter et commander
            </Button>
          )}

          {step === "register" && (
            <Button onClick={handleRegister} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer mon compte et commander
            </Button>
          )}

          {step === "success" && (
            <Button onClick={() => handleClose(false)} className="w-full sm:w-auto">
              Fermer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}