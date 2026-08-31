"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useData } from "@/lib/data-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { CATEGORIES, ORDER_STATUS_LABELS, CERTIFICATION_FEE, CERTIFICATION_REQUEST_STATUS_LABELS, PAYMENT_METHOD_LABELS, type ProductCategory, type Order, type PaymentMethod } from "@/lib/types"
import { readFileAsCompressedDataUrl } from "@/lib/utils"
import {
  Package,
  Plus,
  Settings,
  LogOut,
  Leaf,
  Home,
  Upload,
  X,
  Check,
  Trash2,
  ShoppingCart,
  TrendingUp,
  Menu,
  KeyRound,
  Eye,
  EyeOff,
  MessageSquare,
  Smartphone,
  Sprout,
  ChevronRight,
  Wallet,
  ClipboardList,
  Star,
  BadgeCheck,
  MapPin,
  Navigation,
  ExternalLink,
  Pencil,
} from "lucide-react"
import { LocationMapPicker } from "@/components/location-map-picker"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { OrderChatDialog } from "@/components/order-chat-dialog"
import { MessageNotifications } from "@/components/message-notifications"
import { FarmerAiInsightsPanel } from "@/components/farmer/ai-insights-panel"
import { FarmerSalesCharts } from "@/components/farmer/sales-charts"
import { OrderDetailsDialog } from "@/components/farmer/order-details-dialog"

export default function FarmerDashboard() {
  const { user, logout, isLoading: authLoading, updateUser: updateAuthUser, changePassword } = useAuth()
  const { products, orders, users, addProduct, updateProduct, deleteProduct, updateOrderStatus, updateUser: updateDataUser, transactions, startConversation, certificationRequests, createCertificationRequest, payCertificationFee } = useData()
  const router = useRouter()
  const { toast } = useToast()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [restockProductId, setRestockProductId] = useState<string | null>(null)
  const [restockQuantity, setRestockQuantity] = useState("")
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    category: "legumes" as ProductCategory,
    price: "",
    unit: "kg",
    quantity: "",
    location: user?.location || "",
    image: "",
  })
  const [mapLocation, setMapLocation] = useState<{ lat: string; lng: string; displayName: string } | null>(null)
  const [isEditLocationDialogOpen, setIsEditLocationDialogOpen] = useState(false)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [editMapLocation, setEditMapLocation] = useState<{ lat: string; lng: string; displayName: string } | null>(null)
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    location: user?.location || "",
    description: user?.description || "",
    avatar: user?.avatar || "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null)
  const [chatOrder, setChatOrder] = useState<Order | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [detailsOrder, setDetailsOrder] = useState<Order | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isCertificationDialogOpen, setIsCertificationDialogOpen] = useState(false)
  const [certificationMessage, setCertificationMessage] = useState("")
  const [isCertPayDialogOpen, setIsCertPayDialogOpen] = useState(false)
  const [certPayMethod, setCertPayMethod] = useState<PaymentMethod>("mpesa")
  const [certPayPhone, setCertPayPhone] = useState("")

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "farmer")) {
      router.push("/connexion")
    }
  }, [authLoading, user, router])

  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center">Chargement...</div>
  }

  if (!user || user.role !== "farmer") {
    return null
  }

  const farmerProducts = products.filter((p) => p.farmerId === user.id)
  const farmerOrders = orders.filter((o) => o.farmerId === user.id)
  const pendingOrders = farmerOrders.filter((o) => o.status === "pending")
  const totalRevenue = farmerOrders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.totalPrice, 0)
  const farmerPayments = transactions.filter((t) => t.farmerId === user.id && t.status === "completed")
  const totalPaymentsReceived = farmerPayments.reduce((sum, t) => sum + t.farmerAmount, 0)
  const farmerRating = user.rating ?? 0
  const myCertificationRequests = certificationRequests.filter((r) => r.farmerId === user.id)
  const pendingCertification = myCertificationRequests.find((r) => r.status === "pending")
  const approvedCertification = myCertificationRequests.find((r) => r.status === "approved")
  const certifiedRequest = myCertificationRequests.find((r) => r.status === "paid")
  const certAttentionCount = (pendingCertification ? 1 : 0) + (approvedCertification ? 1 : 0)

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "L'image ne doit pas dépasser 5 Mo.",
          variant: "destructive",
        })
        return
      }

      try {
        // Compression canvas : évite de saturer le localStorage en base64
        const result = await readFileAsCompressedDataUrl(file, 800, 0.72)
        setNewProduct({ ...newProduct, image: result })
        setImagePreview(result)
      } catch {
        toast({
          title: "Erreur",
          description: "Impossible de charger cette image.",
          variant: "destructive",
        })
      }
    }
  }



  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const base64String = await readFileAsCompressedDataUrl(file, 256, 0.75)
        setAvatarPreview(base64String)
        setProfileData({ ...profileData, avatar: base64String })
      } catch {
        /* ignore */
      }
    }
  }

  const handleUpdateProfile = () => {
    if (!user) return
    updateAuthUser(profileData)
    updateDataUser(user.id, profileData)
    setIsProfileDialogOpen(false)
  }

  const handleChangePassword = async () => {
    if (!passwordData.newPassword || !passwordData.currentPassword) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive",
      })
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les nouveaux mots de passe ne correspondent pas.",
        variant: "destructive",
      })
      return
    }
    setIsChangingPassword(true)
    const result = await changePassword(passwordData.currentPassword, passwordData.newPassword)
    setIsChangingPassword(false)
    if (result.success) {
      toast({
        title: "Mot de passe modifié",
        description: "Votre mot de passe a été mis à jour avec succès.",
      })
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setIsProfileDialogOpen(false)
    } else {
      toast({
        title: "Erreur",
        description: result.error,
        variant: "destructive",
      })
    }
  }

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.quantity) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      })
      return
    }

    if (!mapLocation) {
      toast({
        title: "Localisation requise",
        description: "Veuillez rechercher et cibler l'emplacement sur la carte.",
        variant: "destructive",
      })
      return
    }

    const gps = { lat: parseFloat(mapLocation.lat), lng: parseFloat(mapLocation.lng) }

    addProduct({
      farmerId: user.id,
      farmerName: user.name,
      name: newProduct.name,
      description: newProduct.description,
      category: newProduct.category,
      price: Number.parseFloat(newProduct.price),
      unit: newProduct.unit,
      quantity: Number.parseInt(newProduct.quantity),
      location: mapLocation.displayName || newProduct.location || user.location || "Non spécifié",
      gps,
      image: newProduct.image || `/placeholder.svg?height=300&width=400&query=${encodeURIComponent(newProduct.name + " fresh produce")}`,
      isAvailable: true,
    })

    toast({
      title: "Produit ajouté",
      description: `${newProduct.name} a été ajouté à votre catalogue. Origine GPS enregistrée.`,
    })

    setNewProduct({
      name: "",
      description: "",
      category: "legumes",
      price: "",
      unit: "kg",
      quantity: "",
      location: user.location || "",
      image: "",
    })
    setMapLocation(null)
    setImagePreview(null)
    setIsAddDialogOpen(false)
  }

  const handleOpenEditLocation = (product: import("@/lib/types").Product) => {
    setEditingProductId(product.id)
    if (product.gps) {
      setEditMapLocation({
        lat: product.gps.lat.toFixed(6),
        lng: product.gps.lng.toFixed(6),
        displayName: product.location,
      })
    } else {
      // Pré-remplit avec la localisation texte si pas de GPS, l'utilisateur ciblera sur la carte
      setEditMapLocation(null)
    }
    setIsEditLocationDialogOpen(true)
  }

  const handleSaveEditLocation = () => {
    if (!editingProductId) return
    if (!editMapLocation) {
      toast({
        title: "Localisation requise",
        description: "Veuillez rechercher et cibler l'emplacement sur la carte.",
        variant: "destructive",
      })
      return
    }
    const product = products.find((p) => p.id === editingProductId)
    if (!product) return
    const gps = { lat: parseFloat(editMapLocation.lat), lng: parseFloat(editMapLocation.lng) }
    updateProduct(editingProductId, {
      location: editMapLocation.displayName,
      gps,
    })
    toast({
      title: "Localisation mise à jour",
      description: `${product.name} — nouvelle origine : ${editMapLocation.displayName}`,
    })
    setIsEditLocationDialogOpen(false)
    setEditingProductId(null)
    setEditMapLocation(null)
  }

  const handleOpenRestock = (productId: string) => {
    const product = products.find((item) => item.id === productId)
    if (!product) return

    setRestockProductId(productId)
    setRestockQuantity("")
    setIsRestockDialogOpen(true)
  }

  const handleRestockProduct = () => {
    if (!restockProductId) return

    const quantityToAdd = Number.parseInt(restockQuantity, 10)
    const product = products.find((item) => item.id === restockProductId)

    if (!product) {
      toast({
        title: "Produit introuvable",
        description: "Impossible de renouveler ce stock.",
        variant: "destructive",
      })
      return
    }

    if (!Number.isFinite(quantityToAdd) || quantityToAdd <= 0) {
      toast({
        title: "Quantité invalide",
        description: "Saisissez un nombre d'unités supérieur à zéro.",
        variant: "destructive",
      })
      return
    }

    const updatedQuantity = product.quantity + quantityToAdd
    updateProduct(restockProductId, { quantity: updatedQuantity })

    toast({
      title: "Stock renouvelé",
      description: `${product.name} a été réapprovisionné de ${quantityToAdd} ${product.unit}. Nouveau stock : ${updatedQuantity}.`,
    })

    setRestockProductId(null)
    setRestockQuantity("")
    setIsRestockDialogOpen(false)
  }

  const handleDeleteProduct = (id: string, name: string) => {
    deleteProduct(id)
    toast({
      title: "Produit supprimé",
      description: `${name} a été retiré de votre catalogue.`,
    })
  }

  const handleOpenDetails = (order: Order) => {
    setDetailsOrder(order)
    setIsDetailsOpen(true)
  }

  const handleDetailsUpdateStatus = (orderId: string, status: Order["status"]) => {
    const order = orders.find((o) => o.id === orderId)
    updateOrderStatus(orderId, status)
    toast({
      title: status === "cancelled" ? "Commande rejetée" : "Commande mise à jour",
      description: `La commande a été marquée comme "${ORDER_STATUS_LABELS[status]}".`,
    })
    setDetailsOrder((prev) => (prev && prev.id === orderId ? { ...prev, status } : prev))
    setIsDetailsOpen(false)

    // Ouvrir le chat automatiquement quand la commande est confirmée
    if (status === "confirmed" && order) {
      setChatOrder({ ...order, status: "confirmed" })
      setIsChatOpen(true)
    }
  }

  const handleDetailsContact = (order: Order) => {
    setIsDetailsOpen(false)
    setChatOrder(order)
    setIsChatOpen(true)
  }

  const handleOpenChat = (order: Order) => {
    setChatOrder(order)
    setIsChatOpen(true)
  }

  const handleContactAdmin = () => {
    if (!user) return
    const adminUser = users.find((u) => u.role === "admin")
    if (adminUser) {
      startConversation([user.id, adminUser.id], [user.name, adminUser.name])
      router.push("/agriculteur/messages")
    }
  }

  const handleSubmitCertificationRequest = () => {
    if (!user) return

    if (approvedCertification) {
      toast({
        title: "Déjà certifié",
        description: "Votre compte est déjà certifié par l'administrateur.",
        variant: "destructive",
      })
      return
    }

    if (pendingCertification) {
      toast({
        title: "Demande en cours",
        description: "Vous avez déjà une demande de certification en attente.",
        variant: "destructive",
      })
      return
    }

    // Condition : note minimale de 4 étoiles
    if (farmerRating < 4) {
      toast({
        title: "Conditions non remplies",
        description: "Vous avez besoin d'au moins 4 étoiles pour demander la certification.",
        variant: "destructive",
      })
      return
    }

    createCertificationRequest(user.id, user.name, user.email, farmerRating, certificationMessage.trim() || undefined)

    toast({
      title: "Demande soumise",
      description:
        "Votre demande de certification a été envoyée à l'administrateur. Les frais de 56 000 FC ne seront dus qu'en cas d'acceptation.",
    })

    setIsCertificationDialogOpen(false)
    setCertificationMessage("")
  }

  const handlePayCertificationFee = () => {
    if (!user || !approvedCertification) return

    if (!certPayPhone.trim()) {
      toast({
        title: "Numéro requis",
        description: "Veuillez renseigner votre numéro Mobile Money.",
        variant: "destructive",
      })
      return
    }

    const reference = `CERT-${Date.now()}`
    payCertificationFee(approvedCertification.id, certPayMethod, reference)

    toast({
      title: "Paiement effectué",
      description: `Frais de certification de ${CERTIFICATION_FEE.toLocaleString("fr-FR")} FC payés. Votre badge « Certifié » est désormais visible sur le marché.`,
    })

    setIsCertPayDialogOpen(false)
    setCertPayPhone("")
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default"
      case "delivered":
        return "secondary"
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const stats = [
    { label: "Produits", value: String(farmerProducts.length), icon: Package, chip: "bg-lime-400/15 text-lime-400" },
    { label: "En attente", value: String(pendingOrders.length), icon: ShoppingCart, chip: "bg-amber-400/15 text-amber-400" },
    { label: "Commandes", value: String(farmerOrders.length), icon: TrendingUp, chip: "bg-emerald-400/15 text-emerald-400" },
    { label: "Revenus", value: `${totalRevenue.toFixed(0)} FC`, icon: Wallet, chip: "bg-teal-400/15 text-teal-300" },
  ]

  return (
    <div className="farmer-theme min-h-screen bg-background text-foreground flex overflow-x-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-sidebar/80 backdrop-blur-xl fixed left-0 top-0 h-screen">
        <div className="p-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime-400 shadow-[0_0_20px_rgba(163,230,53,0.35)]">
              <Leaf className="h-5 w-5 text-emerald-950" />
            </div>
            <span className="text-lg font-bold">TerraFrais</span>
          </Link>
        </div>

        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-lime-400/30">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-lime-400/20 text-lime-300">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="flex items-center gap-1 font-medium text-sm truncate">
                {user.name}
                {certifiedRequest && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-lime-400" />}
              </p>
              <p className="text-xs text-lime-400/80 capitalize">
                Agriculteur{certifiedRequest ? " certifié" : ""}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-3 bg-lime-400/10 text-lime-300 hover:bg-lime-400/15 hover:text-lime-200" asChild>
            <Link href="/agriculteur">
              <Home className="h-5 w-5" />
              <span className="text-sm font-medium">Tableau de bord</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:bg-lime-400/10 hover:text-lime-200"
            onClick={() => scrollToSection("module-commandes")}
          >
            <ClipboardList className="h-5 w-5" />
            <span className="text-sm font-medium">Commandes</span>
            {pendingOrders.length > 0 && (
              <Badge variant="outline" className="ml-auto border-amber-400/30 bg-amber-400/10 text-amber-300">
                {pendingOrders.length}
              </Badge>
            )}
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:bg-lime-400/10 hover:text-lime-200"
            onClick={() => scrollToSection("module-produits")}
          >
            <Package className="h-5 w-5" />
            <span className="text-sm font-medium">Produits</span>
            {farmerProducts.length > 0 && (
              <Badge variant="outline" className="ml-auto border-lime-400/30 bg-lime-400/10 text-lime-300">
                {farmerProducts.length}
              </Badge>
            )}
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:bg-lime-400/10 hover:text-lime-200"
            onClick={() => scrollToSection("module-certification")}
          >
            <Star className="h-5 w-5" />
            <span className="text-sm font-medium">Certification</span>
            {certAttentionCount > 0 && (
              <Badge variant="outline" className="ml-auto border-amber-400/30 bg-amber-400/10 text-amber-300">
                {certAttentionCount}
              </Badge>
            )}
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:bg-lime-400/10 hover:text-lime-200" asChild>
            <Link href="/agriculteur/messages">
              <MessageSquare className="h-5 w-5" />
              <span className="text-sm font-medium">Messages</span>
            </Link>
          </Button>
          <Button variant="outline" className="w-full justify-start gap-3 mt-4 border-lime-400/20 bg-transparent text-lime-300 hover:bg-lime-400/10 hover:text-lime-200" onClick={handleContactAdmin}>
            <MessageSquare className="h-5 w-5" />
            <span className="text-sm font-medium">Contacter l&apos;Admin</span>
          </Button>
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground" asChild>
            <Link href="/marche">
              <ShoppingCart className="h-4 w-4" />
              <span className="text-sm">Le Marché</span>
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10" onClick={logout}>
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Déconnexion</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="relative flex-1 md:ml-64 flex flex-col">
        {/* Décor d'arrière-plan */}
        <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-lime-500/10 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 -left-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

        {/* Header - Mobile & Desktop Profile */}
        <header className="sticky top-0 z-40 border-b border-white/5 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-13 max-[360px]:h-12 sm:h-16 items-center justify-between gap-2 px-2.5 max-[360px]:px-2 sm:px-4 container">
            <div className="flex items-center gap-1.5 sm:gap-4 md:hidden shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8 max-[360px]:h-7 max-[360px]:w-7 sm:h-9 sm:w-9 shrink-0" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Link href="/" className="flex items-center gap-1.5 sm:gap-2">
                <div className="flex h-7 w-7 max-[360px]:h-7 max-[360px]:w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-lime-400">
                  <Leaf className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-950" />
                </div>
                <span className="hidden max-[360px]:hidden xs:inline text-sm font-bold sm:hidden">TerraFrais</span>
              </Link>
            </div>
            <div className="hidden md:block min-w-0">
              <h1 className="text-base font-semibold sm:text-xl truncate">Tableau de Bord</h1>
            </div>
            <div className="flex items-center gap-1.5 max-[360px]:gap-1 sm:gap-3 lg:gap-4 shrink-0">
              <span className="hidden sm:inline max-w-[100px] lg:max-w-[160px] truncate text-sm text-muted-foreground">{user.name}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleContactAdmin}
                className="hidden sm:inline-flex gap-1.5 border-lime-400/20 bg-transparent text-lime-300 hover:bg-lime-400/10 hover:text-lime-200 h-8 max-[360px]:h-7 text-xs sm:text-sm px-2.5 sm:px-3"
              >
                <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden lg:inline">Contacter admin</span>
                <span className="lg:hidden">Admin</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleContactAdmin}
                aria-label="Contacter admin"
                title="Contacter admin"
                className="sm:hidden h-8 w-8 max-[360px]:h-7 max-[360px]:w-7 border-lime-400/20 bg-transparent text-lime-300 hover:bg-lime-400/10 shrink-0"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
              <MessageNotifications role="farmer" />
            </div>
          </div>
        </header>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <aside className="fixed left-0 top-0 w-[280px] max-w-[85vw] h-[100dvh] bg-sidebar border-r border-white/5 flex flex-col z-50 shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <span className="font-bold">Menu</span>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                <Button variant="ghost" className="w-full justify-start gap-2" asChild onClick={() => setMobileMenuOpen(false)}>
                  <Link href="/agriculteur">
                    <Home className="h-4 w-4" />
                    Tableau de bord
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={() => { scrollToSection("module-commandes"); setMobileMenuOpen(false); }}
                >
                  <ClipboardList className="h-4 w-4" />
                  Commandes
                  {pendingOrders.length > 0 && (
                    <Badge variant="outline" className="ml-auto border-amber-400/30 bg-amber-400/10 text-amber-300">
                      {pendingOrders.length}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={() => { scrollToSection("module-produits"); setMobileMenuOpen(false); }}
                >
                  <Package className="h-4 w-4" />
                  Produits
                  {farmerProducts.length > 0 && (
                    <Badge variant="outline" className="ml-auto border-lime-400/30 bg-lime-400/10 text-lime-300">
                      {farmerProducts.length}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={() => { scrollToSection("module-certification"); setMobileMenuOpen(false); }}
                >
                  <Star className="h-4 w-4" />
                  Certification
                  {certAttentionCount > 0 && (
                    <Badge variant="outline" className="ml-auto border-amber-400/30 bg-amber-400/10 text-amber-300">
                      {certAttentionCount}
                    </Badge>
                  )}
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2" asChild onClick={() => setMobileMenuOpen(false)}>
                  <Link href="/agriculteur/messages">
                    <MessageSquare className="h-4 w-4" />
                    Messages
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" onClick={() => { handleContactAdmin(); setMobileMenuOpen(false); }}>
                  <MessageSquare className="h-4 w-4" />
                  Contacter l&apos;Admin
                </Button>
                <div className="pt-4 border-t border-white/5 mt-4">
                  <Button variant="ghost" className="w-full justify-start gap-2" asChild onClick={() => setMobileMenuOpen(false)}>
                    <Link href="/marche">
                      <ShoppingCart className="h-4 w-4" />
                      Marché
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-2 text-destructive" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </Button>
                </div>
              </nav>
            </aside>
          </div>
        )}

        <main className="relative container mx-auto px-2.5 max-[360px]:px-2 py-5 max-[360px]:py-4 sm:px-4 sm:py-8 overflow-x-hidden">
          {/* Bannière de bienvenue */}
          <section className="relative mb-5 max-[360px]:mb-4 sm:mb-8 overflow-hidden rounded-xl sm:rounded-2xl border border-lime-400/20 bg-gradient-to-r from-lime-500/15 via-emerald-500/10 to-card/60 p-3 max-[360px]:p-2.5 sm:p-6 lg:p-8">
            <div className="pointer-events-none absolute -right-16 -top-20 h-40 w-40 sm:h-64 sm:w-64 rounded-full bg-lime-400/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 left-1/3 h-36 w-36 sm:h-48 sm:w-48 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="relative flex flex-col justify-between gap-3 sm:gap-6 lg:flex-row lg:items-center">
              <div className="flex items-start gap-2.5 sm:gap-4 min-w-0">
                <div className="flex h-10 w-10 max-[360px]:h-9 max-[360px]:w-9 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-lime-400/15 shadow-[0_0_25px_rgba(163,230,53,0.25)]">
                  <Sprout className="h-5 w-5 max-[360px]:h-4 max-[360px]:w-4 sm:h-7 sm:w-7 text-lime-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg max-[360px]:text-base sm:text-2xl lg:text-3xl font-bold text-foreground truncate leading-tight">Bonjour, {user.name}</h1>
                  <p className="mt-1 text-[11px] max-[360px]:text-[10px] sm:text-sm leading-relaxed text-muted-foreground line-clamp-2">
                    Voici l&apos;activité de votre exploitation — {pendingOrders.length} commande{pendingOrders.length !== 1 ? "s" : ""} en attente.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 max-[360px]:gap-1.5 sm:flex-row sm:flex-wrap sm:items-center">
                <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-center gap-2 border-white/10 bg-transparent text-xs sm:text-sm h-9 max-[360px]:h-8 sm:w-auto">
                      <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Éditer le profil
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="farmer-theme text-foreground flex max-h-[92vh] w-[calc(100%-1rem)] max-[360px]:w-[calc(100%-0.75rem)] max-w-md flex-col gap-0 p-0 sm:w-full">
                    <DialogHeader className="shrink-0 border-b border-white/5 px-4 max-[360px]:px-3 pb-4 pt-5 max-[360px]:pt-4 sm:px-6 sm:pt-6">
                      <DialogTitle className="text-left text-base max-[360px]:text-sm">Éditer le Profil</DialogTitle>
                      <DialogDescription className="text-left text-xs max-[360px]:text-[11px] sm:text-sm">Mettez à jour vos informations personnelles et votre bio</DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto px-4 max-[360px]:px-3 py-4 max-[360px]:py-3 sm:px-6">
                      <div className="space-y-6">
                        {/* Avatar Upload */}
                        <div className="flex flex-col items-center gap-4">
                          <div className="relative">
                            <Avatar className="h-24 w-24 border-2 border-lime-400/50">
                              <AvatarImage src={avatarPreview || ""} />
                              <AvatarFallback className="text-2xl">{profileData.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <label className="absolute -bottom-2 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-lime-400 text-emerald-950 shadow-lg hover:bg-lime-300 transition-colors">
                              <Upload className="h-4 w-4" />
                              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                            </label>
                          </div>
                          <p className="text-xs text-muted-foreground">Cliquez sur l&apos;icône pour changer votre photo</p>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="profile-name">Nom complet</Label>
                            <Input
                              id="profile-name"
                              value={profileData.name}
                              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            />
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="profile-phone">Téléphone</Label>
                              <Input
                                id="profile-phone"
                                value={profileData.phone}
                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="profile-location">Localisation</Label>
                              <Input
                                id="profile-location"
                                value={profileData.location}
                                onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="profile-description">Bio / Description</Label>
                            <Textarea
                              id="profile-description"
                              placeholder="Décrivez votre exploitation, vos méthodes de culture..."
                              className="min-h-[100px]"
                              value={profileData.description}
                              onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
                            />
                          </div>

                          {/* Section changement de mot de passe */}
                          <div className="space-y-3 rounded-lg border border-white/10 p-4">
                            <div className="flex items-center gap-2">
                              <KeyRound className="h-4 w-4 text-muted-foreground" />
                              <h4 className="text-sm font-semibold">Changer le mot de passe</h4>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="current-password">Mot de passe actuel</Label>
                              <div className="relative">
                                <Input
                                  id="current-password"
                                  type={showCurrentPassword ? "text" : "password"}
                                  placeholder="Votre mot de passe actuel"
                                  value={passwordData.currentPassword}
                                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                  className="pr-10"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                  tabIndex={-1}
                                >
                                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="new-password">Nouveau mot de passe</Label>
                              <div className="relative">
                                <Input
                                  id="new-password"
                                  type={showNewPassword ? "text" : "password"}
                                  placeholder="Min. 6 caractères"
                                  value={passwordData.newPassword}
                                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                  className="pr-10"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                  tabIndex={-1}
                                >
                                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="confirm-new-password">Confirmer le nouveau mot de passe</Label>
                              <div className="relative">
                                <Input
                                  id="confirm-new-password"
                                  type={showConfirmNewPassword ? "text" : "password"}
                                  placeholder="Répétez le nouveau mot de passe"
                                  value={passwordData.confirmPassword}
                                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                  className="pr-10"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                  tabIndex={-1}
                                >
                                  {showConfirmNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              className="w-full gap-2 border-white/10 bg-transparent"
                              onClick={handleChangePassword}
                              disabled={isChangingPassword}
                            >
                              <KeyRound className="h-4 w-4" />
                              {isChangingPassword ? "Modification..." : "Modifier le mot de passe"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter className="shrink-0 border-t border-white/5 px-4 max-[360px]:px-3 py-3 max-[360px]:py-2.5 sm:px-6 sm:py-4 flex-col-reverse gap-2 sm:flex-row">
                      <Button variant="outline" className="w-full border-white/10 bg-transparent sm:w-auto h-9 max-[360px]:h-8 text-sm max-[360px]:text-xs" onClick={() => setIsProfileDialogOpen(false)}>Annuler</Button>
                      <Button onClick={handleUpdateProfile} className="w-full sm:w-auto h-9 max-[360px]:h-8 text-sm max-[360px]:text-xs">Enregistrer</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="w-full justify-center gap-2 bg-lime-400 text-emerald-950 shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:bg-lime-300 text-xs sm:text-sm h-9 max-[360px]:h-8 sm:w-auto">
                      <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Ajouter un produit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="farmer-theme text-foreground flex max-h-[92vh] w-[calc(100%-1rem)] max-[360px]:w-[calc(100%-0.75rem)] max-w-[420px] flex-col gap-0 p-0 sm:max-w-2xl sm:w-full">
                    <DialogHeader className="shrink-0 border-b border-white/5 px-4 max-[360px]:px-3 pb-3 max-[360px]:pb-2 pt-5 max-[360px]:pt-4 sm:px-6 sm:pt-6">
                      <DialogTitle className="text-left text-base max-[360px]:text-sm sm:text-xl">Nouveau Produit</DialogTitle>
                      <DialogDescription className="text-left text-xs max-[360px]:text-[11px] sm:text-sm">Ajoutez un nouveau produit — ciblez l&apos;origine sur la carte</DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto px-4 max-[360px]:px-3 py-4 max-[360px]:py-3 sm:px-6">
                      <div className="grid gap-3 sm:gap-4">
                        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="name">Nom du produit *</Label>
                            <Input
                              id="name"
                              placeholder="Ex: Tomates Bio"
                              value={newProduct.name}
                              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="category">Catégorie *</Label>
                            <Select
                              value={newProduct.category}
                              onValueChange={(v) => setNewProduct({ ...newProduct, category: v as ProductCategory })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="farmer-theme">
                                {CATEGORIES.map((cat) => (
                                  <SelectItem key={cat.value} value={cat.value}>
                                    {cat.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            placeholder="Décrivez votre produit..."
                            value={newProduct.description}
                            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3">
                          <div className="space-y-2">
                            <Label htmlFor="price">Prix (FC) *</Label>
                            <Input
                              id="price"
                              type="number"
                              inputMode="decimal"
                              step="0.01"
                              placeholder="4.50"
                              value={newProduct.price}
                              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="unit">Unité</Label>
                            <Select value={newProduct.unit} onValueChange={(v) => setNewProduct({ ...newProduct, unit: v })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="farmer-theme">
                                <SelectItem value="kg">kg</SelectItem>
                                <SelectItem value="litre">litre</SelectItem>
                                <SelectItem value="pièce">pièce</SelectItem>
                                <SelectItem value="botte">botte</SelectItem>
                                <SelectItem value="douzaine">douzaine</SelectItem>
                                <SelectItem value="pot">pot</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-2 space-y-2 sm:col-span-1">
                            <Label htmlFor="quantity">Quantité *</Label>
                            <Input
                              id="quantity"
                              type="number"
                              inputMode="numeric"
                              placeholder="100"
                              value={newProduct.quantity}
                              onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:p-3">
                          <Label className="flex items-center gap-1.5 text-sm">
                            <MapPin className="h-3.5 w-3.5 text-lime-400" />
                            Localisation & traçabilité GPS *
                          </Label>
                          <p className="text-[11px] leading-relaxed text-muted-foreground">
                            Recherchez sur la carte puis cliquez pour cibler l&apos;emplacement exact du champ. La localisation sera automatiquement utilisée pour la traçabilité.
                          </p>
                          <LocationMapPicker value={mapLocation} onChange={setMapLocation} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Image du produit</Label>
                          <div className="mt-1 flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-white/10 p-3 sm:p-4">
                            {imagePreview ? (
                              <div className="relative aspect-video max-h-40 w-full overflow-hidden rounded-md border sm:max-h-48">
                                <img src={imagePreview} alt="Aperçu" className="h-full w-full object-cover" />
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className="absolute right-2 top-2 h-7 w-7 sm:h-8 sm:w-8"
                                  onClick={() => {
                                    setImagePreview(null)
                                    setNewProduct({ ...newProduct, image: "" })
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <label className="flex h-28 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md text-muted-foreground hover:bg-muted/30 transition-colors sm:h-32">
                                <div className="flex flex-col items-center justify-center py-4">
                                  <Upload className="mb-2 h-7 w-7 sm:h-8 sm:w-8" />
                                  <p className="mb-1 text-sm font-semibold">Cliquez pour télécharger</p>
                                  <p className="text-xs text-center px-2">PNG, JPG ou WebP (max. 5 Mo)</p>
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                              </label>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter className="shrink-0 border-t border-white/5 px-4 max-[360px]:px-3 py-3 max-[360px]:py-2.5 sm:px-6 sm:py-4 flex-col-reverse gap-2 sm:flex-row">
                      <Button variant="outline" className="w-full border-white/10 bg-transparent sm:w-auto h-9 max-[360px]:h-8 text-sm max-[360px]:text-xs" onClick={() => setIsAddDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleAddProduct} className="w-full sm:w-auto h-9 max-[360px]:h-8 text-sm max-[360px]:text-xs">Ajouter le produit</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={isRestockDialogOpen} onOpenChange={(open) => {
                  setIsRestockDialogOpen(open)
                  if (!open) {
                    setRestockProductId(null)
                    setRestockQuantity("")
                  }
                }}>
                  <DialogContent className="farmer-theme text-foreground w-[calc(100%-1rem)] max-[360px]:w-[calc(100%-0.75rem)] max-w-md sm:w-full">
                    <DialogHeader className="px-4 max-[360px]:px-3 pt-4 sm:pt-5">
                      <DialogTitle className="text-left text-base max-[360px]:text-sm">Renouveler le stock</DialogTitle>
                      <DialogDescription className="text-left text-xs max-[360px]:text-[11px] sm:text-sm">
                        Ajoutez des unités à {products.find((item) => item.id === restockProductId)?.name ?? "ce produit"}.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <div className="space-y-2">
                        <Label htmlFor="restock-quantity">Nombre d&apos;unités à ajouter</Label>
                        <Input
                          id="restock-quantity"
                          type="number"
                          min="1"
                          inputMode="numeric"
                          placeholder="Ex: 30"
                          value={restockQuantity}
                          onChange={(e) => setRestockQuantity(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter className="flex-col-reverse gap-2 sm:flex-row px-4 max-[360px]:px-3 pb-4 max-[360px]:pb-3 sm:px-6">
                      <Button variant="outline" className="w-full border-white/10 bg-transparent sm:w-auto h-9 max-[360px]:h-8 text-sm max-[360px]:text-xs" onClick={() => setIsRestockDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleRestockProduct} className="w-full sm:w-auto h-9 max-[360px]:h-8 text-sm max-[360px]:text-xs">Valider le stock</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog
                  open={isEditLocationDialogOpen}
                  onOpenChange={(open) => {
                    setIsEditLocationDialogOpen(open)
                    if (!open) {
                      setEditingProductId(null)
                      setEditMapLocation(null)
                    }
                  }}
                >
                  <DialogContent className="farmer-theme text-foreground flex max-h-[92vh] w-[calc(100%-1rem)] max-[360px]:w-[calc(100%-0.75rem)] max-w-2xl flex-col gap-0 p-0 sm:w-full">
                    <DialogHeader className="shrink-0 border-b border-white/5 px-4 max-[360px]:px-3 pb-4 pt-5 max-[360px]:pt-4 sm:px-6 sm:pt-6">
                      <DialogTitle className="flex items-center gap-2 text-left text-[15px] max-[360px]:text-sm sm:text-lg">
                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-sky-400" />
                        Modifier la localisation
                      </DialogTitle>
                      <DialogDescription className="text-left text-xs max-[360px]:text-[11px] sm:text-sm leading-relaxed">
                        {editingProductId
                          ? `Produit : ${products.find((p) => p.id === editingProductId)?.name ?? ""} — recherchez puis ciblez le nouvel emplacement sur la carte.`
                          : "Recherchez puis ciblez l'emplacement sur la carte."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto px-4 max-[360px]:px-3 py-4 max-[360px]:py-3 sm:px-6">
                      {editingProductId && products.find((p) => p.id === editingProductId)?.location && !editMapLocation && (
                        <p className="mb-3 rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-xs text-muted-foreground">
                          Localisation actuelle : <span className="font-medium text-foreground">{products.find((p) => p.id === editingProductId)?.location}</span>
                          {products.find((p) => p.id === editingProductId)?.gps && (
                            <span className="font-mono">
                              {" "}
                              — {products.find((p) => p.id === editingProductId)?.gps?.lat.toFixed(6)},{" "}
                              {products.find((p) => p.id === editingProductId)?.gps?.lng.toFixed(6)}
                            </span>
                          )}
                        </p>
                      )}
                      <LocationMapPicker value={editMapLocation} onChange={setEditMapLocation} />
                    </div>
                    <DialogFooter className="shrink-0 border-t border-white/5 px-4 py-3 sm:px-6 sm:py-4 flex-col-reverse gap-2 sm:flex-row">
                      <Button
                        variant="outline"
                        className="w-full border-white/10 bg-transparent sm:w-auto"
                        onClick={() => setIsEditLocationDialogOpen(false)}
                      >
                        Annuler
                      </Button>
                      <Button onClick={handleSaveEditLocation} className="w-full gap-2 bg-sky-500 hover:bg-sky-600 text-white sm:w-auto">
                        <Navigation className="h-4 w-4" />
                        Enregistrer
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" size="sm" className="w-full justify-center gap-2 border-white/10 bg-transparent text-xs sm:text-sm h-9 max-[360px]:h-8 sm:w-auto" onClick={handleContactAdmin}>
                  <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Contact Support
                </Button>
              </div>
            </div>
          </section>

{/* Stats Cards */}
          <div className="mb-5 sm:mb-8 grid grid-cols-1 min-[360px]:grid-cols-2 gap-2.5 max-[360px]:gap-2 sm:gap-4 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="border-white/5 bg-card/60 shadow-lg backdrop-blur-xl transition-colors hover:border-lime-400/20 overflow-hidden">
                <CardContent className="flex items-center gap-2.5 max-[360px]:gap-2 p-2.5 max-[360px]:p-2 sm:gap-4 sm:p-5">
                  <div className={`flex h-9 w-9 max-[360px]:h-8 max-[360px]:w-8 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg sm:rounded-xl ${stat.chip}`}>
                    <stat.icon className="h-4 w-4 max-[360px]:h-3.5 max-[360px]:w-3.5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm max-[360px]:text-[13px] font-bold leading-tight sm:text-xl lg:text-2xl">{stat.value}</p>
                    <p className="truncate text-[11px] max-[360px]:text-[10px] sm:text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Certification Request Section */}
          <Card id="module-certification" className="mb-5 max-[360px]:mb-4 sm:mb-8 scroll-mt-20 border-white/5 bg-card/60 shadow-lg backdrop-blur-xl overflow-hidden">
            <CardHeader className="p-3 max-[360px]:p-2.5 sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-[15px] max-[360px]:text-sm sm:text-lg">
                    <Star className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-lime-400" />
                    Certification
                  </CardTitle>
                  <CardDescription className="text-xs max-[360px]:text-[11px] sm:text-sm mt-1">Demandez le badge officiel</CardDescription>
                </div>
                {certifiedRequest && (
                  <Badge variant="outline" className="w-fit shrink-0 border-lime-400/30 bg-lime-400/10 text-lime-300">
                    <BadgeCheck className="mr-1 h-3 w-3" />
                    Certifié
                  </Badge>
                )}
                {!certifiedRequest && approvedCertification && (
                  <Badge variant="outline" className="w-fit shrink-0 border-amber-400/30 bg-amber-400/10 text-amber-300">
                    Paiement requis
                  </Badge>
                )}
                {!certifiedRequest && !approvedCertification && pendingCertification && (
                  <Badge variant="outline" className="w-fit shrink-0 border-sky-400/30 bg-sky-400/10 text-sky-300">
                    {CERTIFICATION_REQUEST_STATUS_LABELS.pending}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-3 max-[360px]:p-2.5 pt-0 sm:p-6 sm:pt-0">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between gap-2 rounded-lg border border-white/5 bg-card/40 p-2.5 max-[360px]:p-2 sm:p-4">
                  <span className="text-xs max-[360px]:text-[11px] sm:text-sm text-muted-foreground">Votre note actuelle</span>
                  <div className="flex items-center gap-1 max-[360px]:gap-1 sm:gap-2 shrink-0">
                    <span className="text-sm max-[360px]:text-xs sm:text-lg font-bold">{farmerRating}</span>
                    <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs max-[360px]:text-[11px] sm:text-sm text-muted-foreground">/ 5</span>
                  </div>
                </div>

                {certifiedRequest ? (
                  <p className="text-sm text-lime-300">
                    Votre compte est certifié : le badge « Certifié » est visible par les acheteurs
                    dans les informations du vendeur sur le marché.
                  </p>
                ) : approvedCertification ? (
                  <div className="space-y-3 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 sm:p-4">
                    <p className="text-xs sm:text-sm font-medium text-amber-300">
                      Demande approuvée ! Réglez les frais pour finaliser votre badge.
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-base sm:text-lg font-mono font-bold text-foreground">
                        {CERTIFICATION_FEE.toLocaleString("fr-FR")} FC
                      </span>
                      <Button
                        onClick={() => {
                          setCertPayPhone(user.phone || "")
                          setIsCertPayDialogOpen(true)
                        }}
                        className="w-full justify-center gap-2 bg-lime-400 text-emerald-950 shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:bg-lime-300 sm:w-auto"
                      >
                        <BadgeCheck className="h-4 w-4" />
                        Payer et obtenir le badge
                      </Button>
                    </div>
                  </div>
                ) : farmerRating >= 4 ? (
                  <>
                    <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                      Vous remplissez la condition des 4 étoiles minimum. Envoyez une demande à
                      l&apos;administrateur : si elle est acceptée, vous devrez régler les frais de{" "}
                      {CERTIFICATION_FEE.toLocaleString("fr-FR")} FC.
                    </p>
                    <Button
                      onClick={() => setIsCertificationDialogOpen(true)}
                      className="w-full justify-center gap-2 bg-lime-400 text-emerald-950 shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:bg-lime-300 sm:w-auto"
                    >
                      <Star className="h-4 w-4" />
                      Demander une certification
                    </Button>
                  </>
                ) : (
                  <p className="text-xs sm:text-sm text-destructive">
                    Note insuffisante : il faut au moins 4 étoiles pour pouvoir demander la certification.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dialog : demande de certification */}
          <Dialog open={isCertificationDialogOpen} onOpenChange={setIsCertificationDialogOpen}>
            <DialogContent className="farmer-theme text-foreground w-[calc(100%-1rem)] max-w-md sm:w-full">
              <DialogHeader>
                <DialogTitle className="text-left">Demande de Certification</DialogTitle>
                <DialogDescription className="text-left text-xs sm:text-sm">Soumettez votre demande à l&apos;administrateur</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1 rounded-lg border border-white/10 p-3">
                  <p className="text-sm font-medium">Conditions</p>
                  <p className="text-xs text-muted-foreground">
                    ✓ Note minimale de 4 étoiles (votre note : {farmerRating}/5)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ✓ Frais de {CERTIFICATION_FEE.toLocaleString("fr-FR")} FC à payer uniquement si
                    l&apos;administrateur accepte votre demande
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certification-message">Message (optionnel)</Label>
                  <Textarea
                    id="certification-message"
                    placeholder="Expliquez pourquoi vous méritez la certification..."
                    value={certificationMessage}
                    onChange={(e) => setCertificationMessage(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
              <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
                <Button variant="outline" className="w-full border-white/10 bg-transparent sm:w-auto" onClick={() => setIsCertificationDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSubmitCertificationRequest} className="w-full sm:w-auto">Envoyer la demande</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog : paiement des frais de certification */}
          <Dialog open={isCertPayDialogOpen} onOpenChange={setIsCertPayDialogOpen}>
            <DialogContent className="farmer-theme text-foreground w-[calc(100%-1rem)] max-w-md sm:w-full">
              <DialogHeader>
                <DialogTitle className="text-left text-base sm:text-lg">Paiement des frais de certification</DialogTitle>
                <DialogDescription className="text-left text-xs sm:text-sm">
                  Finalisez votre certification en réglant {CERTIFICATION_FEE.toLocaleString("fr-FR")} FC via Mobile Money
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Méthode de paiement</Label>
                  <Select value={certPayMethod} onValueChange={(v) => setCertPayMethod(v as PaymentMethod)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="farmer-theme">
                      <SelectItem value="mpesa">{PAYMENT_METHOD_LABELS.mpesa}</SelectItem>
                      <SelectItem value="orange_money">{PAYMENT_METHOD_LABELS.orange_money}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cert-pay-phone">Numéro Mobile Money</Label>
                  <Input
                    id="cert-pay-phone"
                    placeholder="Ex : 081 234 5678"
                    value={certPayPhone}
                    onChange={(e) => setCertPayPhone(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Une fois le paiement confirmé, votre badge « Certifié » sera immédiatement
                  visible dans les informations du vendeur sur le marché.
                </p>
              </div>
              <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
                <Button variant="outline" className="w-full border-white/10 bg-transparent sm:w-auto" onClick={() => setIsCertPayDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handlePayCertificationFee} className="w-full justify-center gap-2 sm:w-auto">
                  <BadgeCheck className="h-4 w-4" />
                  Payer {CERTIFICATION_FEE.toLocaleString("fr-FR")} FC
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Assistant IA */}
          <div className="mb-6 sm:mb-8">
            <FarmerAiInsightsPanel orders={orders} products={products} farmerId={user.id} />
          </div>

          {/* Graphiques de ventes */}
          <div className="mb-8">
            <FarmerSalesCharts orders={farmerOrders} />
          </div>

          {/* Module Commandes */}
          <Card id="module-commandes" className="mb-5 max-[360px]:mb-4 sm:mb-8 scroll-mt-20 border-white/5 bg-card/60 shadow-lg backdrop-blur-xl overflow-hidden">
            <CardHeader className="p-3 max-[360px]:p-2.5 sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <CardTitle className="text-[15px] max-[360px]:text-sm sm:text-lg">Module Commandes</CardTitle>
                  <CardDescription className="text-xs max-[360px]:text-[11px] sm:text-sm leading-relaxed">
                    Cliquez sur une commande pour voir le détail, contacter ou rejeter
                  </CardDescription>
                </div>
                {pendingOrders.length > 0 && (
                  <Badge variant="outline" className="w-fit shrink-0 border-amber-400/30 bg-amber-400/10 text-amber-300 text-xs max-[360px]:text-[11px]">
                    {pendingOrders.length} en attente
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-3 max-[360px]:p-2.5 pt-0 sm:p-6 sm:pt-0">
              {farmerOrders.length === 0 ? (
                <div className="rounded-lg border border-dashed border-white/10 p-5 max-[360px]:p-4 sm:p-8 text-center">
                  <ShoppingCart className="mx-auto h-9 w-9 max-[360px]:h-8 max-[360px]:w-8 sm:h-12 sm:w-12 text-muted-foreground" />
                  <p className="mt-3 text-xs sm:text-sm text-muted-foreground">Aucune commande pour le moment.</p>
                </div>
              ) : (
                <div className="space-y-2 max-[360px]:space-y-1.5 sm:space-y-3">
                  {farmerOrders.slice(0, 10).map((order) => (
                    <button
                      key={order.id}
                      onClick={() => handleOpenDetails(order)}
                      className="w-full rounded-xl border border-white/5 bg-card/40 p-2.5 max-[360px]:p-2 sm:p-4 text-left transition-all hover:border-lime-400/30 hover:bg-lime-400/5"
                    >
                      <div className="flex items-start justify-between gap-1.5 sm:gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1 max-[360px]:gap-1 sm:gap-2">
                            <p className="truncate text-sm max-[360px]:text-xs sm:text-[15px] font-medium">{order.productName}</p>
                            <Badge variant={getStatusBadgeVariant(order.status)} className="text-[10px] max-[360px]:text-[9px] sm:text-xs shrink-0 px-1.5 py-0">{ORDER_STATUS_LABELS[order.status]}</Badge>
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs max-[360px]:text-[11px] leading-relaxed text-muted-foreground sm:text-sm">
                            {order.quantity} unités · {order.totalPrice.toFixed(2)} FC · <span className="font-medium text-foreground">{order.buyerName}</span>
                            {order.buyerPhone && ` · ${order.buyerPhone}`}
                          </p>
                          <p className="mt-0.5 text-[11px] max-[360px]:text-[10px] sm:text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <ChevronRight className="mt-1 h-3.5 w-3.5 max-[360px]:h-3 max-[360px]:w-3 sm:h-5 sm:w-5 shrink-0 text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-5 max-[360px]:gap-4 sm:gap-6 lg:grid-cols-2 lg:gap-8">
            {/* Products Section */}
            <Card id="module-produits" className="scroll-mt-20 border-white/5 bg-card/60 shadow-lg backdrop-blur-xl overflow-hidden">
              <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 p-3 max-[360px]:p-2.5 sm:p-6 pb-3 sm:pb-6">
                <div className="min-w-0">
                  <CardTitle className="text-[15px] max-[360px]:text-sm sm:text-lg">Mes Produits</CardTitle>
                  <CardDescription className="text-xs max-[360px]:text-[11px] sm:text-sm">Gérez votre catalogue</CardDescription>
                </div>
                <Button size="sm" className="shrink-0 gap-1 h-8 max-[360px]:h-7 text-xs sm:h-9 sm:gap-1.5 bg-lime-400 text-emerald-950 hover:bg-lime-300 sm:hidden" onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Ajouter
                </Button>
                <Button size="sm" variant="outline" className="hidden shrink-0 gap-1.5 border-white/10 sm:inline-flex" onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Ajouter
                </Button>
              </CardHeader>
              <CardContent className="p-3 max-[360px]:p-2.5 pt-0 sm:p-6 sm:pt-0">
                {farmerProducts.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-white/10 p-6 max-[360px]:p-4 sm:p-8 text-center">
                    <Package className="mx-auto h-10 w-10 max-[360px]:h-8 max-[360px]:w-8 sm:h-12 sm:w-12 text-muted-foreground" />
                    <p className="mt-3 text-xs sm:text-sm text-muted-foreground">Vous n&apos;avez pas encore de produits.</p>
                    <Button variant="outline" size="sm" className="mt-3 sm:mt-4 border-white/10 bg-transparent text-xs sm:text-sm h-8 max-[360px]:h-7" onClick={() => setIsAddDialogOpen(true)}>
                      Ajouter mon premier produit
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-[360px]:space-y-2 sm:space-y-3">
                    {farmerProducts.map((product) => (
                      <div key={product.id} className="flex flex-col gap-2.5 max-[360px]:gap-2 rounded-xl border border-white/5 bg-card/40 p-2.5 max-[360px]:p-2 sm:flex-row sm:items-start sm:justify-between sm:p-4 overflow-hidden">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1 max-[360px]:gap-1 sm:gap-2">
                            <span className="text-sm max-[360px]:text-xs sm:text-[15px] font-medium truncate max-w-[120px] max-[360px]:max-w-[100px] sm:max-w-none">{product.name}</span>
                            <Badge variant="outline" className="border-lime-400/20 text-[10px] max-[360px]:text-[9px] sm:text-xs px-1.5 py-0">
                              {CATEGORIES.find((c) => c.value === product.category)?.label}
                            </Badge>
                            {product.gps && (
                              <Badge className="gap-1 border-emerald-500/30 bg-emerald-500/20 text-[10px] max-[360px]:text-[9px] sm:text-xs px-1.5 py-0 text-emerald-300">
                                <Navigation className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                GPS
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1 text-xs max-[360px]:text-[11px] sm:text-sm text-muted-foreground">
                            {product.price.toFixed(2)} FC / {product.unit} · Stock: {product.quantity}
                          </p>
                          <p className="truncate text-xs max-[360px]:text-[11px] text-muted-foreground">{product.location}</p>
                          {product.gps && (
                            <a
                              href={`https://www.google.com/maps?q=${product.gps.lat},${product.gps.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-400 hover:bg-emerald-500/20 sm:text-xs"
                            >
                              <MapPin className="h-3 w-3" />
                              {product.gps.lat.toFixed(4)}, {product.gps.lng.toFixed(4)} — Voir trace
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-1 max-[360px]:gap-0.5 sm:gap-1.5 self-stretch sm:self-auto">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 max-[360px]:h-6 max-[360px]:w-6 sm:h-9 sm:w-9 shrink-0"
                            onClick={() => updateProduct(product.id, { isAvailable: !product.isAvailable })}
                            title={product.isAvailable ? "Disponible" : "Indisponible"}
                          >
                            {product.isAvailable ? (
                              <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-lime-400" />
                            ) : (
                              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 max-[360px]:h-6 flex-1 border-lime-400/30 bg-lime-400/5 text-[11px] max-[360px]:text-[10px] sm:text-xs text-lime-200 sm:h-9 sm:flex-none px-2 max-[360px]:px-1.5 sm:px-3"
                            onClick={() => handleOpenRestock(product.id)}
                          >
                            Renouveler
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 max-[360px]:h-6 max-[360px]:w-6 sm:h-9 sm:w-9 shrink-0"
                            onClick={() => handleOpenEditLocation(product)}
                            title="Modifier la localisation"
                          >
                            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-sky-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 max-[360px]:h-6 max-[360px]:w-6 sm:h-9 sm:w-9 shrink-0 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                          >
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-5 max-[360px]:space-y-4 sm:space-y-8">
              {/* Market Exploration Section */}
              <Card className="border-lime-400/20 bg-gradient-to-r from-lime-500/10 to-emerald-500/5 shadow-lg backdrop-blur-xl overflow-hidden">
                <CardContent className="flex flex-col gap-3 max-[360px]:gap-2 p-3 max-[360px]:p-2.5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <div className="min-w-0">
                    <h3 className="text-[15px] max-[360px]:text-sm sm:text-lg font-semibold">Explorer le Marché</h3>
                    <p className="mt-1 text-xs max-[360px]:text-[11px] sm:text-sm leading-relaxed text-muted-foreground">
                      Découvrez les produits des autres agriculteurs et les tendances du marché
                    </p>
                  </div>
                  <Button asChild size="sm" className="w-full justify-center gap-2 bg-lime-400 text-emerald-950 hover:bg-lime-300 text-xs sm:text-sm h-9 max-[360px]:h-8 sm:w-auto shrink-0">
                    <Link href="/marche">
                      <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Explorer
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Mobile Money Payments Section */}
              <Card className="border-white/5 bg-card/60 shadow-lg backdrop-blur-xl overflow-hidden">
                <CardHeader className="p-3 max-[360px]:p-2.5 sm:p-6">
                  <div className="flex flex-col gap-2.5 sm:gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-[15px] max-[360px]:text-sm sm:text-lg">
                        <Smartphone className="h-4 w-4 max-[360px]:h-3.5 max-[360px]:w-3.5 sm:h-5 sm:w-5 shrink-0 text-lime-400" />
                        Paiements Mobile Money reçus
                      </CardTitle>
                      <CardDescription className="mt-1 text-xs max-[360px]:text-[11px] sm:text-sm leading-relaxed">
                        Paiements versés sur votre numéro {user.phone || "enregistré"} — 97% vous revient, 3% commission
                      </CardDescription>
                    </div>
                    <div className="shrink-0 text-left sm:text-right bg-white/[0.04] sm:bg-transparent rounded-lg p-2 sm:p-0 border sm:border-0 border-white/5">
                      <p className="text-lg max-[360px]:text-base sm:text-2xl font-bold text-lime-400">{totalPaymentsReceived.toFixed(2)} FC</p>
                      <p className="text-[11px] max-[360px]:text-[10px] sm:text-xs text-muted-foreground">Total net reçu</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3 max-[360px]:p-2.5 pt-0 sm:p-6 sm:pt-0">
                  {farmerPayments.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-white/10 p-5 max-[360px]:p-4 sm:p-8 text-center">
                      <Smartphone className="mx-auto h-9 w-9 max-[360px]:h-8 max-[360px]:w-8 sm:h-12 sm:w-12 text-muted-foreground" />
                      <p className="mt-3 text-xs sm:text-sm text-muted-foreground">Aucun paiement reçu pour le moment.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-[360px]:space-y-1.5 sm:space-y-3">
                      {farmerPayments.map((txn) => (
                        <div key={txn.id} className="flex flex-col gap-1.5 max-[360px]:gap-1 rounded-xl border border-white/5 bg-card/40 p-2.5 max-[360px]:p-2 sm:flex-row sm:items-center sm:justify-between sm:p-4 overflow-hidden">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1 max-[360px]:gap-1 sm:gap-2">
                              <p className="truncate text-sm max-[360px]:text-xs sm:text-sm font-medium max-w-[110px] max-[360px]:max-w-[90px] sm:max-w-none">{txn.buyerName}</p>
                              <Badge variant={txn.method === "mpesa" ? "default" : "secondary"} className="text-[10px] max-[360px]:text-[9px] sm:text-xs shrink-0 px-1.5 py-0">
                                {txn.method === "mpesa" ? "M-Pesa" : "Orange Money"}
                              </Badge>
                            </div>
                            <p className="truncate text-[11px] max-[360px]:text-[10px] sm:text-xs text-muted-foreground font-mono">Réf: {txn.reference}</p>
                            <p className="text-[11px] max-[360px]:text-[10px] sm:text-xs text-muted-foreground">
                              {new Date(txn.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          <div className="shrink-0 text-left sm:text-right flex flex-row sm:flex-col justify-between items-center sm:items-end gap-2 border-t sm:border-0 border-white/5 pt-1.5 sm:pt-0 mt-1 sm:mt-0">
                            <p className="text-sm max-[360px]:text-xs sm:text-base font-bold text-lime-400">+{txn.farmerAmount.toFixed(2)} FC</p>
                            <p className="text-[11px] max-[360px]:text-[10px] sm:text-xs text-muted-foreground text-right">
                              sur {txn.amount.toFixed(2)} FC
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Order Details Dialog */}
      <OrderDetailsDialog
        order={detailsOrder}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onContact={handleDetailsContact}
        onUpdateStatus={handleDetailsUpdateStatus}
      />

      {/* Order Chat Dialog */}
      <OrderChatDialog
        open={isChatOpen}
        onOpenChange={setIsChatOpen}
        order={chatOrder}
      />
    </div>
  )
}
