"use client"

import { useState } from "react"
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
import { Package, Plus, Settings, LogOut, Leaf, Home, Upload, X, User as UserIcon, Check, Trash2, ShoppingCart, Truck, TrendingUp, Menu, KeyRound, Eye, EyeOff, MessageSquare } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { OrderChatDialog } from "@/components/order-chat-dialog"
import { MessageNotifications } from "@/components/message-notifications"

export default function FarmerDashboard() {
  const { user, logout, isLoading: authLoading, updateUser: updateAuthUser, changePassword } = useAuth()
  const { products, orders, users, addProduct, updateProduct, deleteProduct, updateOrderStatus, updateUser: updateDataUser } = useData()
  const router = useRouter()
  const { toast } = useToast()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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

  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center">Chargement...</div>
  }

  if (!user || user.role !== "farmer") {
    router.push("/connexion")
    return null
  }

  const farmerProducts = products.filter((p) => p.farmerId === user.id)
  const farmerOrders = orders.filter((o) => o.farmerId === user.id)
  const pendingOrders = farmerOrders.filter((o) => o.status === "pending")
  const totalRevenue = farmerOrders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.totalPrice, 0)
// turbo
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

  const handleDeleteProduct = (id: string, name: string) => {
    deleteProduct(id)
    toast({
      title: "Produit supprimé",
      description: `${name} a été retiré de votre catalogue.`,
    })
  }

  const handleOrderAction = (orderId: string, status: "confirmed" | "delivered" | "cancelled") => {
    const order = orders.find((o) => o.id === orderId)
    updateOrderStatus(orderId, status)
    toast({
      title: "Commande mise à jour",
      description: `La commande a été marquée comme "${ORDER_STATUS_LABELS[status]}".`,
    })

    // Ouvrir le chat automatiquement quand la commande est confirmée
    if (status === "confirmed" && order) {
      setChatOrder({ ...order, status: "confirmed" })
      setIsChatOpen(true)
    }
  }

  const { startConversation } = useData()

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

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-card fixed left-0 top-0 h-screen">
        <div className="p-6 border-b">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">AgriMarché</span>
          </Link>
        </div>

        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">Agriculteur</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-3" asChild>
            <Link href="/agriculteur">
              <Home className="h-5 w-5" />
              <span className="text-sm font-medium">Tableau de bord</span>
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3" asChild>
            <Link href="/agriculteur/messages">
              <MessageSquare className="h-5 w-5" />
              <span className="text-sm font-medium">Messages</span>
            </Link>
          </Button>
          <Button variant="outline" className="w-full justify-start gap-3 mt-4" onClick={handleContactAdmin}>
            <MessageSquare className="h-5 w-5" />
            <span className="text-sm font-medium">Contacter l'Admin</span>
          </Button>
        </nav>

        <div className="p-4 border-t space-y-2">
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
      <div className="flex-1 md:ml-64 flex flex-col">
        {/* Header - Mobile & Desktop Profile */}
        <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="h-16 flex items-center justify-between px-4 container">
            <div className="flex items-center gap-4 md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <Menu className="h-5 w-5" />
              </Button>
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Leaf className="h-4 w-4 text-primary-foreground" />
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
          <aside className="fixed left-0 top-0 w-64 h-screen bg-card border-r flex flex-col z-50">
            <div className="flex items-center justify-between p-4 border-b">
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
              <Button variant="ghost" className="w-full justify-start gap-2" asChild onClick={() => setMobileMenuOpen(false)}>
                <Link href="/agriculteur/messages">
                  <MessageSquare className="h-4 w-4" />
                  Messages
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => { handleContactAdmin(); setMobileMenuOpen(false); }}>
                <MessageSquare className="h-4 w-4" />
                Contacter l'Admin
              </Button>
              <div className="pt-4 border-t mt-4">
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

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tableau de Bord</h1>
            <p className="text-muted-foreground">Bienvenue, {user.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Éditer le profil
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Éditer le Profil</DialogTitle>
                  <DialogDescription>Mettez à jour vos informations personnelles et votre bio</DialogDescription>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-y-auto py-4 pr-2">
                  <div className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-24 w-24 border-2 border-primary">
                          <AvatarImage src={avatarPreview || ""} />
                          <AvatarFallback className="text-2xl">{profileData.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <label className="absolute -bottom-2 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors">
                          <Upload className="h-4 w-4" />
                          <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                        </label>
                      </div>
                      <p className="text-xs text-muted-foreground">Cliquez sur l'icône pour changer votre photo</p>
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
                      <div className="space-y-3 rounded-lg border p-4">
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
                          className="w-full gap-2"
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
                  <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)}>Annuler</Button>
                  <Button onClick={handleUpdateProfile}>Enregistrer</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Ajouter un produit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
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
                      <SelectContent>
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
                    <Label htmlFor="price">Prix (€) *</Label>
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
                      <SelectContent>
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
                    placeholder="Ex: Provence-Alpes-Côte d'Azur"
                    value={newProduct.location}
                    onChange={(e) => setNewProduct({ ...newProduct, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Image du produit</Label>
                  <div className="mt-1 flex flex-col items-center gap-4 rounded-lg border-2 border-dashed p-4">
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
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddProduct}>Ajouter</Button>
              </DialogFooter>
            </DialogContent>
            </Dialog>

            <Button variant="outline" className="gap-2" onClick={handleContactAdmin}>
              <MessageSquare className="h-4 w-4" />
              Contact Support
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{farmerProducts.length}</p>
                <p className="text-sm text-muted-foreground">Produits</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/50">
                <ShoppingCart className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingOrders.length}</p>
                <p className="text-sm text-muted-foreground">En attente</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                <TrendingUp className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{farmerOrders.length}</p>
                <p className="text-sm text-muted-foreground">Commandes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalRevenue.toFixed(0)} €</p>
                <p className="text-sm text-muted-foreground">Revenus</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Exploration Section */}
        <Card className="mb-8">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <h3 className="text-lg font-semibold">Explorer le Marché</h3>
              <p className="text-sm text-muted-foreground">
                Découvrez les produits des autres agriculteurs et les tendances du marché
              </p>
            </div>
            <Button asChild className="gap-2">
              <Link href="/marche">
                <ShoppingCart className="h-4 w-4" />
                Explorer le marché
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Products Section */}
          <Card>
            <CardHeader>
              <CardTitle>Mes Produits</CardTitle>
              <CardDescription>Gérez votre catalogue de produits</CardDescription>
            </CardHeader>
            <CardContent>
              {farmerProducts.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">Vous n&apos;avez pas encore de produits.</p>
                  <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setIsAddDialogOpen(true)}>
                    Ajouter mon premier produit
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {farmerProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{product.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {CATEGORIES.find((c) => c.value === product.category)?.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {product.price.toFixed(2)} € / {product.unit} · Stock: {product.quantity}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateProduct(product.id, { isAvailable: !product.isAvailable })}
                        >
                          {product.isAvailable ? (
                            <Check className="h-4 w-4 text-primary" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground" />
                          )}
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

          {/* Orders Section */}
          <Card>
            <CardHeader>
              <CardTitle>Commandes Récentes</CardTitle>
              <CardDescription>Gérez les commandes de vos clients</CardDescription>
            </CardHeader>
            <CardContent>
              {farmerOrders.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">Aucune commande pour le moment.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {farmerOrders.slice(0, 10).map((order) => (
                    <div key={order.id} className="rounded-lg border p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{order.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.quantity} unités · {order.totalPrice.toFixed(2)} €
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Client: {order.buyerName}
                            {order.buyerPhone && ` · ${order.buyerPhone}`}
                          </p>
                        </div>
                        <Badge variant={getStatusBadgeVariant(order.status)}>{ORDER_STATUS_LABELS[order.status]}</Badge>
                      </div>
                      {order.status === "pending" && (
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" onClick={() => handleOrderAction(order.id, "confirmed")}>
                            <Check className="mr-1 h-4 w-4" />
                            Confirmer
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleOrderAction(order.id, "cancelled")}
                          >
                            <X className="mr-1 h-4 w-4" />
                            Refuser
                          </Button>
                        </div>
                      )}
                      {order.status === "confirmed" && (
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleOrderAction(order.id, "delivered")}
                          >
                            <Truck className="mr-1 h-4 w-4" />
                            Marquer livrée
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenChat(order)}
                            className="gap-1.5"
                          >
                            <MessageSquare className="h-4 w-4" />
                            Chatter
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>

    {/* Order Chat Dialog */}
    <OrderChatDialog
      open={isChatOpen}
      onOpenChange={setIsChatOpen}
      order={chatOrder}
    />
  </div>
)
}
