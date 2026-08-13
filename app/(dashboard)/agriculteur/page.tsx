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
import { CATEGORIES, ORDER_STATUS_LABELS, type ProductCategory, type Order } from "@/lib/types"
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
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { OrderChatDialog } from "@/components/order-chat-dialog"
import { MessageNotifications } from "@/components/message-notifications"
import { FarmerAiInsightsPanel } from "@/components/farmer/ai-insights-panel"
import { FarmerSalesCharts } from "@/components/farmer/sales-charts"
import { OrderDetailsDialog } from "@/components/farmer/order-details-dialog"

export default function FarmerDashboard() {
  const { user, logout, isLoading: authLoading, updateUser: updateAuthUser, changePassword } = useAuth()
  const { products, orders, users, addProduct, updateProduct, deleteProduct, updateOrderStatus, updateUser: updateDataUser, transactions, startConversation } = useData()
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "L'image ne doit pas dépasser 2 Mo.",
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setNewProduct({ ...newProduct, image: result })
        setImagePreview(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setAvatarPreview(base64String)
        setProfileData({ ...profileData, avatar: base64String })
      }
      reader.readAsDataURL(file)
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

    addProduct({
      farmerId: user.id,
      farmerName: user.name,
      name: newProduct.name,
      description: newProduct.description,
      category: newProduct.category,
      price: Number.parseFloat(newProduct.price),
      unit: newProduct.unit,
      quantity: Number.parseInt(newProduct.quantity),
      location: newProduct.location || user.location || "Non spécifié",
      image: newProduct.image || `/placeholder.svg?height=300&width=400&query=${encodeURIComponent(newProduct.name + " fresh produce")}`,
      isAvailable: true,
    })

    toast({
      title: "Produit ajouté",
      description: `${newProduct.name} a été ajouté à votre catalogue.`,
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
    setImagePreview(null)
    setIsAddDialogOpen(false)
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
    <div className="farmer-theme min-h-screen bg-background text-foreground flex">
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
              <p className="font-medium text-sm truncate">{user.name}</p>
              <p className="text-xs text-lime-400/80 capitalize">Agriculteur</p>
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
          <div className="h-16 flex items-center justify-between px-4 container">
            <div className="flex items-center gap-4 md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <Menu className="h-5 w-5" />
              </Button>
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime-400">
                  <Leaf className="h-4 w-4 text-emerald-950" />
                </div>
              </Link>
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-semibold">Tableau de Bord</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-sm text-muted-foreground">{user.name}</span>
              <MessageNotifications role="farmer" />
            </div>
          </div>
        </header>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
            <aside className="fixed left-0 top-0 w-64 h-screen bg-sidebar border-r border-white/5 flex flex-col z-50">
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

        <main className="relative container mx-auto px-4 py-8">
          {/* Bannière de bienvenue */}
          <section className="relative mb-8 overflow-hidden rounded-2xl border border-lime-400/20 bg-gradient-to-r from-lime-500/15 via-emerald-500/10 to-card/60 p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-lime-400/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-lime-400/15 shadow-[0_0_25px_rgba(163,230,53,0.25)]">
                  <Sprout className="h-7 w-7 text-lime-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Bonjour, {user.name}</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Voici l&apos;activité de votre exploitation — {pendingOrders.length} commande{pendingOrders.length !== 1 ? "s" : ""} en attente de traitement.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2 border-white/10 bg-transparent">
                      <Settings className="h-4 w-4" />
                      Éditer le profil
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="farmer-theme text-foreground max-w-md">
                    <DialogHeader>
                      <DialogTitle>Éditer le Profil</DialogTitle>
                      <DialogDescription>Mettez à jour vos informations personnelles et votre bio</DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[70vh] overflow-y-auto py-4 pr-2">
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
                    <DialogFooter>
                      <Button variant="outline" className="border-white/10 bg-transparent" onClick={() => setIsProfileDialogOpen(false)}>Annuler</Button>
                      <Button onClick={handleUpdateProfile}>Enregistrer</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 bg-lime-400 text-emerald-950 shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:bg-lime-300">
                      <Plus className="h-4 w-4" />
                      Ajouter un produit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="farmer-theme text-foreground max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Nouveau Produit</DialogTitle>
                      <DialogDescription>Ajoutez un nouveau produit à votre catalogue</DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto py-4 pr-2">
                      <div className="grid gap-4">
                        <div className="grid gap-4 sm:grid-cols-2">
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
                        <div className="grid gap-4 sm:grid-cols-3">
                          <div className="space-y-2">
                            <Label htmlFor="price">Prix (FC) *</Label>
                            <Input
                              id="price"
                              type="number"
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
                          <div className="space-y-2">
                            <Label htmlFor="quantity">Quantité *</Label>
                            <Input
                              id="quantity"
                              type="number"
                              placeholder="100"
                              value={newProduct.quantity}
                              onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Localisation</Label>
                          <Input
                            id="location"
                            placeholder="Ex: Kinshasa / Gombe"
                            value={newProduct.location}
                            onChange={(e) => setNewProduct({ ...newProduct, location: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Image du produit</Label>
                          <div className="mt-1 flex flex-col items-center gap-4 rounded-lg border-2 border-dashed border-white/10 p-4">
                            {imagePreview ? (
                              <div className="relative aspect-video max-h-48 w-full overflow-hidden rounded-md border">
                                <img src={imagePreview} alt="Aperçu" className="h-full w-full object-cover" />
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className="absolute right-2 top-2 h-8 w-8"
                                  onClick={() => {
                                    setImagePreview(null)
                                    setNewProduct({ ...newProduct, image: "" })
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-muted/50 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <Upload className="mb-2 h-8 w-8" />
                                  <p className="mb-1 text-sm font-semibold">Cliquez pour télécharger</p>
                                  <p className="text-xs">PNG, JPG ou WebP (max. 2 Mo)</p>
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                              </label>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" className="border-white/10 bg-transparent" onClick={() => setIsAddDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleAddProduct}>Ajouter</Button>
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
                  <DialogContent className="farmer-theme text-foreground max-w-md">
                    <DialogHeader>
                      <DialogTitle>Renouveler le stock</DialogTitle>
                      <DialogDescription>
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
                          placeholder="Ex: 30"
                          value={restockQuantity}
                          onChange={(e) => setRestockQuantity(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" className="border-white/10 bg-transparent" onClick={() => setIsRestockDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleRestockProduct}>Valider le stock</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" className="gap-2 border-white/10 bg-transparent" onClick={handleContactAdmin}>
                  <MessageSquare className="h-4 w-4" />
                  Contact Support
                </Button>
              </div>
            </div>
          </section>

          {/* Stats Cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="border-white/5 bg-card/60 shadow-lg backdrop-blur-xl transition-colors hover:border-lime-400/20">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.chip}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Assistant IA */}
          <div className="mb-8">
            <FarmerAiInsightsPanel orders={orders} products={products} farmerId={user.id} />
          </div>

          {/* Graphiques de ventes */}
          <div className="mb-8">
            <FarmerSalesCharts orders={farmerOrders} />
          </div>

          {/* Module Commandes */}
          <Card id="module-commandes" className="mb-8 scroll-mt-20 border-white/5 bg-card/60 shadow-lg backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <CardTitle>Module Commandes</CardTitle>
                  <CardDescription>
                    Cliquez sur une commande pour voir le détail, contacter l&apos;acheteur ou rejeter la commande
                  </CardDescription>
                </div>
                {pendingOrders.length > 0 && (
                  <Badge variant="outline" className="border-amber-400/30 bg-amber-400/10 text-amber-300">
                    {pendingOrders.length} en attente
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {farmerOrders.length === 0 ? (
                <div className="rounded-lg border border-dashed border-white/10 p-8 text-center">
                  <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">Aucune commande pour le moment.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {farmerOrders.slice(0, 10).map((order) => (
                    <button
                      key={order.id}
                      onClick={() => handleOpenDetails(order)}
                      className="w-full rounded-xl border border-white/5 bg-card/40 p-4 text-left transition-all hover:border-lime-400/30 hover:bg-lime-400/5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate font-medium">{order.productName}</p>
                            <Badge variant={getStatusBadgeVariant(order.status)}>{ORDER_STATUS_LABELS[order.status]}</Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {order.quantity} unités · {order.totalPrice.toFixed(2)} FC · Client : {order.buyerName}
                            {order.buyerPhone && ` · ${order.buyerPhone}`}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Products Section */}
            <Card id="module-produits" className="scroll-mt-20 border-white/5 bg-card/60 shadow-lg backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Mes Produits</CardTitle>
                <CardDescription>Gérez votre catalogue de produits</CardDescription>
              </CardHeader>
              <CardContent>
                {farmerProducts.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-white/10 p-8 text-center">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">Vous n&apos;avez pas encore de produits.</p>
                    <Button variant="outline" className="mt-4 border-white/10 bg-transparent" onClick={() => setIsAddDialogOpen(true)}>
                      Ajouter mon premier produit
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {farmerProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-card/40 p-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{product.name}</span>
                            <Badge variant="outline" className="border-lime-400/20 text-xs">
                              {CATEGORIES.find((c) => c.value === product.category)?.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {product.price.toFixed(2)} FC / {product.unit} · Stock: {product.quantity}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateProduct(product.id, { isAvailable: !product.isAvailable })}
                          >
                            {product.isAvailable ? (
                              <Check className="h-4 w-4 text-lime-400" />
                            ) : (
                              <X className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-lime-400/30 bg-lime-400/5 text-lime-200"
                            onClick={() => handleOpenRestock(product.id)}
                          >
                            Renouveler
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-8">
              {/* Market Exploration Section */}
              <Card className="border-lime-400/20 bg-gradient-to-r from-lime-500/10 to-emerald-500/5 shadow-lg backdrop-blur-xl">
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <h3 className="text-lg font-semibold">Explorer le Marché</h3>
                    <p className="text-sm text-muted-foreground">
                      Découvrez les produits des autres agriculteurs et les tendances du marché
                    </p>
                  </div>
                  <Button asChild className="gap-2 bg-lime-400 text-emerald-950 hover:bg-lime-300">
                    <Link href="/marche">
                      <ShoppingCart className="h-4 w-4" />
                      Explorer
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Mobile Money Payments Section */}
              <Card className="border-white/5 bg-card/60 shadow-lg backdrop-blur-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5 text-lime-400" />
                        Paiements Mobile Money reçus
                      </CardTitle>
                      <CardDescription>
                        Paiements versés sur votre numéro {user.phone || "enregistré"} — 95% du montant vous revient, 5% de commission plateforme
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-lime-400">{totalPaymentsReceived.toFixed(2)} FC</p>
                      <p className="text-xs text-muted-foreground">Total net reçu</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {farmerPayments.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-white/10 p-8 text-center">
                      <Smartphone className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-4 text-muted-foreground">Aucun paiement reçu pour le moment.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {farmerPayments.map((txn) => (
                        <div key={txn.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-card/40 p-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{txn.buyerName}</p>
                              <Badge variant={txn.method === "mpesa" ? "default" : "secondary"}>
                                {txn.method === "mpesa" ? "M-Pesa" : "Orange Money"}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground font-mono">Réf: {txn.reference}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(txn.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lime-400">+{txn.farmerAmount.toFixed(2)} FC</p>
                            <p className="text-xs text-muted-foreground">
                              sur {txn.amount.toFixed(2)} FC (commission : {txn.commission.toFixed(2)} FC)
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
