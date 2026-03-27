"use client"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useData } from "@/lib/data-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ORDER_STATUS_LABELS, CATEGORIES, type User } from "@/lib/types"
import { Leaf, Users, Package, ShoppingCart, TrendingUp, LogOut, Home, Trash2, Menu, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminDashboard() {
  const { user, logout, isLoading } = useAuth()
  const { products, orders, users, deleteProduct, deleteUser, updateOrderStatus, updateUser } = useData()
  const router = useRouter()
  const { toast } = useToast()

  const [isAddFarmerDialogOpen, setIsAddFarmerDialogOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showFarmerPassword, setShowFarmerPassword] = useState(false)
  const [showFarmerConfirmPassword, setShowFarmerConfirmPassword] = useState(false)
  const [newFarmerData, setNewFarmerData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    password: "",
    confirmPassword: "",
  })

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Chargement...</div>
  }

  if (!user || user.role !== "admin") {
    router.push("/connexion")
    return null
  }

  const farmers = users.filter((u) => u.role === "farmer")
  const buyers = users.filter((u) => u.role === "buyer")
  const admins = users.filter((u) => u.role === "admin")
  const userCount = users.length
  const totalRevenue = orders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.totalPrice, 0)

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

  const handleDeleteProduct = (id: string, name: string) => {
    deleteProduct(id)
    toast({
      title: "Produit supprimé",
      description: `${name} a été retiré de la plateforme.`,
    })
  }

  const handleDeleteUser = (id: string, name: string) => {
    if (id === user?.id) {
      toast({
        title: "Action interdite",
        description: "Vous ne pouvez pas supprimer votre compte administrateur en cours.",
        variant: "destructive",
      })
      return
    }
    deleteUser(id)
    toast({
      title: "Utilisateur supprimé",
      description: `${name} a été retiré de la plateforme.`,
    })
  }

  const handleRoleChange = (id: string, role: "farmer" | "buyer" | "admin") => {
    if (id === user?.id && role !== "admin") {
      toast({
        title: "Action interdite",
        description: "Vous ne pouvez pas modifier votre propre rôle d'administrateur.",
        variant: "destructive",
      })
      return
    }
    updateUser(id, { role })
    toast({
      title: "Rôle mis à jour",
      description: "Le rôle de l'utilisateur a été modifié avec succès.",
    })
  }

  const handleAddFarmer = () => {
    if (!newFarmerData.name || !newFarmerData.email) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      })
      return
    }

    if (!newFarmerData.password) {
      toast({
        title: "Erreur",
        description: "Veuillez définir un mot de passe temporaire.",
        variant: "destructive",
      })
      return
    }

    if (newFarmerData.password.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères.",
        variant: "destructive",
      })
      return
    }

    if (newFarmerData.password !== newFarmerData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      })
      return
    }

    // Vérifier si l'email existe déjà
    if (users.some(u => u.email.toLowerCase() === newFarmerData.email.toLowerCase())) {
      toast({
        title: "Erreur",
        description: "Cet email est déjà utilisé.",
        variant: "destructive",
      })
      return
    }

    const newFarmer: User = {
      id: `user-${Date.now()}`,
      email: newFarmerData.email,
      name: newFarmerData.name,
      role: "farmer",
      password: newFarmerData.password,
      phone: newFarmerData.phone,
      location: newFarmerData.location,
      createdAt: new Date().toISOString().split("T")[0],
    }

    // Charger la liste existante (avec les mocks si rien en localStorage)
    const storedUsers = localStorage.getItem("agrimarche_users")
    const existingUsers: User[] = storedUsers ? JSON.parse(storedUsers) : users
    const updatedUsers = [...existingUsers, newFarmer]
    localStorage.setItem("agrimarche_users", JSON.stringify(updatedUsers))

    window.location.reload()

    toast({
      title: "Agriculteur ajouté",
      description: `${newFarmerData.name} a été ajouté en tant qu'agriculteur.`,
    })

    setNewFarmerData({
      name: "",
      email: "",
      phone: "",
      location: "",
      password: "",
      confirmPassword: "",
    })
    setIsAddFarmerDialogOpen(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">AgriMarché</span>
            </Link>
            <Badge variant="destructive" className="max-[374px]:hidden">Admin</Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{user.name}</span>
            <div className="hidden items-center gap-1 sm:flex">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                  <Home className="h-5 w-5" />
                  <span className="sr-only">Accueil</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Déconnexion</span>
              </Button>
            </div>
            <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="sticky top-16 z-40 border-t border-b bg-card p-4 sm:hidden">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 pb-3 border-b">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive">
                <span className="text-sm font-medium text-destructive-foreground">
                  A
                </span>
              </div>
              <div>
                <p className="font-medium text-sm">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
            </div>
            <nav className="flex flex-col gap-2">
              <Button variant="ghost" className="justify-start gap-2" asChild onClick={() => setMobileMenuOpen(false)}>
                <Link href="/">
                  <Home className="h-4 w-4" />
                  Accueil
                </Link>
              </Button>
              <Button variant="ghost" className="justify-start gap-2 text-destructive hover:text-destructive" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
            </nav>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Administration</h1>
          <p className="text-muted-foreground">Gérez la plateforme AgriMarché</p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{userCount}</p>
                <p className="text-sm text-muted-foreground">Utilisateurs</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/50">
                <Package className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{products.length}</p>
                <p className="text-sm text-muted-foreground">Produits</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                <ShoppingCart className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{orders.length}</p>
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
                <p className="text-sm text-muted-foreground">Volume total</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="products">Produits</TabsTrigger>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Agriculteurs ({farmers.length})</CardTitle>
                      <CardDescription>Liste des agriculteurs inscrits</CardDescription>
                    </div>
                    <Dialog open={isAddFarmerDialogOpen} onOpenChange={setIsAddFarmerDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="gap-2">
                          <Users className="h-4 w-4" />
                          Ajouter Agriculteur
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Ajouter un nouvel agriculteur</DialogTitle>
                          <DialogDescription>
                            Créez un compte agriculteur pour un nouveau producteur.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="farmer-name">Nom complet</Label>
                            <Input
                              id="farmer-name"
                              placeholder="Jean Dupont"
                              value={newFarmerData.name}
                              onChange={(e) => setNewFarmerData({ ...newFarmerData, name: e.target.value })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="farmer-email">Adresse email</Label>
                            <Input
                              id="farmer-email"
                              type="email"
                              placeholder="jean.dupont@email.com"
                              value={newFarmerData.email}
                              onChange={(e) => setNewFarmerData({ ...newFarmerData, email: e.target.value })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="farmer-phone">Téléphone</Label>
                            <Input
                              id="farmer-phone"
                              placeholder="+33 6 12 34 56 78"
                              value={newFarmerData.phone}
                              onChange={(e) => setNewFarmerData({ ...newFarmerData, phone: e.target.value })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="farmer-location">Localisation</Label>
                            <Input
                              id="farmer-location"
                              placeholder="Région, Ville"
                              value={newFarmerData.location}
                              onChange={(e) => setNewFarmerData({ ...newFarmerData, location: e.target.value })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="farmer-password">Mot de passe temporaire *</Label>
                            <div className="relative">
                              <Input
                                id="farmer-password"
                                type={showFarmerPassword ? "text" : "password"}
                                placeholder="Min. 6 caractères"
                                value={newFarmerData.password}
                                onChange={(e) => setNewFarmerData({ ...newFarmerData, password: e.target.value })}
                                className="pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowFarmerPassword(!showFarmerPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                tabIndex={-1}
                              >
                                {showFarmerPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="farmer-confirm-password">Confirmer le mot de passe *</Label>
                            <div className="relative">
                              <Input
                                id="farmer-confirm-password"
                                type={showFarmerConfirmPassword ? "text" : "password"}
                                placeholder="Répétez le mot de passe"
                                value={newFarmerData.confirmPassword}
                                onChange={(e) => setNewFarmerData({ ...newFarmerData, confirmPassword: e.target.value })}
                                className="pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowFarmerConfirmPassword(!showFarmerConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                tabIndex={-1}
                              >
                                {showFarmerConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddFarmerDialogOpen(false)}>
                            Annuler
                          </Button>
                          <Button onClick={handleAddFarmer}>Ajouter l'agriculteur</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {farmers.length === 0 ? (
                    <p className="text-muted-foreground">Aucun agriculteur inscrit</p>
                  ) : (
                    <div className="space-y-3">
                      {farmers.map((farmer: User) => (
                        <div key={farmer.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <p className="font-medium">{farmer.name}</p>
                            <p className="text-sm text-muted-foreground">{farmer.email}</p>
                            <p className="text-xs text-muted-foreground">{farmer.location}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select
                              value={farmer.role}
                              onValueChange={(value) => handleRoleChange(farmer.id, value as "farmer" | "buyer" | "admin")}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Rôle" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="farmer">Agriculteur</SelectItem>
                                <SelectItem value="buyer">Acheteur</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => handleDeleteUser(farmer.id, farmer.name)}
                            >
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Acheteurs ({buyers.length})</CardTitle>
                  <CardDescription>Liste des acheteurs inscrits</CardDescription>
                </CardHeader>
                <CardContent>
                  {buyers.length === 0 ? (
                    <p className="text-muted-foreground">Aucun acheteur inscrit</p>
                  ) : (
                    <div className="space-y-3">
                      {buyers.map((buyer: User) => (
                        <div key={buyer.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <p className="font-medium">{buyer.name}</p>
                            <p className="text-sm text-muted-foreground">{buyer.email}</p>
                            <p className="text-xs text-muted-foreground">{buyer.location}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select
                              value={buyer.role}
                              onValueChange={(value) => handleRoleChange(buyer.id, value as "farmer" | "buyer" | "admin")}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Rôle" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="farmer">Agriculteur</SelectItem>
                                <SelectItem value="buyer">Acheteur</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => handleDeleteUser(buyer.id, buyer.name)}
                            >
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Tous les Produits ({products.length})</CardTitle>
                <CardDescription>Gérez les produits de la plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <p className="text-muted-foreground">Aucun produit sur la plateforme</p>
                ) : (
                  <div className="space-y-3">
                    {products.map((product) => (
                      <div key={product.id} className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{product.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {CATEGORIES.find((c) => c.value === product.category)?.label}
                            </Badge>
                            {!product.isAvailable && (
                              <Badge variant="secondary" className="text-xs">
                                Indisponible
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {product.price.toFixed(2)} € / {product.unit} · Stock: {product.quantity}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Par {product.farmerName} · {product.location}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Toutes les Commandes ({orders.length})</CardTitle>
                <CardDescription>Historique des commandes sur la plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <p className="text-muted-foreground">Aucune commande sur la plateforme</p>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <p className="font-medium">{order.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.quantity} unités · {order.totalPrice.toFixed(2)} €
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Acheteur: {order.buyerName} · Vendeur: {order.farmerName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                        <Badge variant={getStatusBadgeVariant(order.status)}>{ORDER_STATUS_LABELS[order.status]}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
