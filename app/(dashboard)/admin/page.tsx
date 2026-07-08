"use client"
import { useEffect, useState } from "react"
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
import { ORDER_STATUS_LABELS, CATEGORIES, type User, type ArticleCategory } from "@/lib/types"
import { Leaf, Users, Package, ShoppingCart, TrendingUp, LogOut, Home, Trash2, Menu, Eye, EyeOff, Newspaper, Star, X, BarChart3, DollarSign, Clock, Bell, CheckCircle2, AlertCircle, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip } from "recharts"

export default function AdminDashboard() {
  const { user, logout, isLoading, updateUser: updateAuthUser, changePassword } = useAuth()
  const { products, orders, users, articles, deleteProduct, deleteUser, updateOrderStatus, updateUser, addArticle, deleteArticle, notifications, unreadNotifications, markNotificationAsRead, clearNotifications, supportTickets, addMessageToTicket, updateTicketStatus } = useData()
  const router = useRouter()
  const { toast } = useToast()

  const [isAddFarmerDialogOpen, setIsAddFarmerDialogOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState<"overview" | "users" | "products" | "orders" | "news" | "support" | "security">("overview")
  const [showNotifications, setShowNotifications] = useState(false)
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [ticketReplyText, setTicketReplyText] = useState("")
  const [ticketStatusFilter, setTicketStatusFilter] = useState<"all" | "open" | "in_progress" | "closed">("all")
  const [showFarmerPassword, setShowFarmerPassword] = useState(false)
  const [showFarmerConfirmPassword, setShowFarmerConfirmPassword] = useState(false)
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
  const [showNewMasterPassword, setShowNewMasterPassword] = useState(false)
  const [showConfirmNewMasterPassword, setShowConfirmNewMasterPassword] = useState(false)
  const [showVerifyPassword, setShowVerifyPassword] = useState(false)
  const [showSecurityPasswordField, setShowSecurityPasswordField] = useState(false)
  const [isSecurityUnlocked, setIsSecurityUnlocked] = useState(false)
  const [securityPasswordAttempt, setSecurityPasswordAttempt] = useState("")
  const [isContactProDialogOpen, setIsContactProDialogOpen] = useState(false)

  const [newFarmerData, setNewFarmerData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    password: "",
    confirmPassword: "",
  })

  // State for password visibility
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({})
  const [passwordTargetUser, setPasswordTargetUser] = useState<User | null>(null)
  const [adminPasswordAttempt, setAdminPasswordAttempt] = useState("")

  // Security settings state
  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    newMasterPassword: "",
    confirmNewMasterPassword: "",
  })

  // Article state
  const [isAddArticleDialogOpen, setIsAddArticleDialogOpen] = useState(false)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [newArticleData, setNewArticleData] = useState({
    title: "",
    description: "",
    content: "",
    category: "agriculteurs" as ArticleCategory,
    imageUrl: "",
    authorName: user?.name || "Administrateur",
  })

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.replace("/connexion")
    }
  }, [isLoading, user, router])

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Chargement...</div>
  }

  if (!user || user.role !== "admin") {
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

  const handleTogglePasswordVisibility = (targetUser: User) => {
    if (revealedPasswords[targetUser.id]) {
      setRevealedPasswords((prev) => ({ ...prev, [targetUser.id]: false }))
    } else {
      setPasswordTargetUser(targetUser)
      setAdminPasswordAttempt("")
    }
  }

  const handleChangeConnectionPassword = async () => {
    if (!securityData.currentPassword || !securityData.newPassword || !securityData.confirmNewPassword) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs.", variant: "destructive" })
      return
    }
    if (securityData.newPassword !== securityData.confirmNewPassword) {
      toast({ title: "Erreur", description: "Les nouveaux mots de passe ne correspondent pas.", variant: "destructive" })
      return
    }
    const res = await changePassword(securityData.currentPassword, securityData.newPassword)
    if (res.success) {
      toast({ title: "Succès", description: "Mot de passe de connexion modifié." })
      setSecurityData(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmNewPassword: "" }))
    } else {
      toast({ title: "Erreur", description: res.error, variant: "destructive" })
    }
  }

  const handleChangeMasterPassword = () => {
    if (!securityData.newMasterPassword || !securityData.confirmNewMasterPassword) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs du mot de passe maître.", variant: "destructive" })
      return
    }
    if (securityData.newMasterPassword !== securityData.confirmNewMasterPassword) {
      toast({ title: "Erreur", description: "Les mots de passe maîtres ne correspondent pas.", variant: "destructive" })
      return
    }
    if (securityData.newMasterPassword.length < 6) {
      toast({ title: "Erreur", description: "Le mot de passe maître doit faire au moins 6 caractères.", variant: "destructive" })
      return
    }
    updateAuthUser({ masterPassword: securityData.newMasterPassword })
    toast({ title: "Succès", description: "Mot de passe maître défini avec succès." })
    setSecurityData(prev => ({ ...prev, newMasterPassword: "", confirmNewMasterPassword: "" }))
  }

  const handleVerifyAdminPassword = () => {
    const expectedPassword = user?.masterPassword || user?.password || "password"
    
    if (adminPasswordAttempt === expectedPassword || (!user?.masterPassword && adminPasswordAttempt === "password")) {
      if (passwordTargetUser) {
        setRevealedPasswords((prev) => ({ ...prev, [passwordTargetUser.id]: true }))
        setPasswordTargetUser(null)
        setAdminPasswordAttempt("")
        toast({
          title: "Accès autorisé",
          description: `Le mot de passe de ${passwordTargetUser.name} est maintenant visible.`,
        })
      }
    } else {
      toast({
        title: "Accès refusé",
        description: "Mot de passe administrateur incorrect.",
        variant: "destructive",
      })
    }
  }

  const handleVerifySecurityPassword = () => {
    const expectedPassword = user?.password || "password"
    
    if (securityPasswordAttempt === expectedPassword) {
      setIsSecurityUnlocked(true)
      setSecurityPasswordAttempt("")
      toast({
        title: "Accès autorisé",
        description: "Vous pouvez maintenant accéder à la section sécurité.",
      })
    } else {
      toast({
        title: "Accès refusé",
        description: "Mot de passe de connexion incorrect.",
        variant: "destructive",
      })
    }
  }

  const handleAddArticle = async () => {
    if (!newArticleData.title || !newArticleData.content) {
      toast({ title: "Erreur", description: "Le titre et le contenu sont obligatoires.", variant: "destructive" })
      return
    }

    setIsUploading(true)
    let finalImageUrl = newArticleData.imageUrl

    if (selectedImageFile) {
      try {
        const formData = new FormData()
        formData.append("file", selectedImageFile)

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!res.ok) throw new Error("Échec de l'upload")
        
        const data = await res.json()
        finalImageUrl = data.url
      } catch (error) {
        toast({ title: "Erreur", description: "Le téléchargement de l'image a échoué.", variant: "destructive" })
        setIsUploading(false)
        return
      }
    }

    addArticle({
      title: newArticleData.title,
      description: newArticleData.description,
      content: newArticleData.content,
      category: newArticleData.category,
      authorName: newArticleData.authorName || "Administrateur",
      imageUrl: finalImageUrl || "https://images.unsplash.com/photo-1500937386664-56d1dfef3844?q=80&w=800&auto=format&fit=crop"
    })
    
    toast({ title: "Article publié", description: "L'actualité a été mise en ligne." })
    
    setNewArticleData({
      title: "",
      description: "",
      content: "",
      category: "agriculteurs",
      imageUrl: "",
      authorName: user?.name || "Administrateur",
    })
    setSelectedImageFile(null)
    setIsUploading(false)
    setIsAddArticleDialogOpen(false)
  }

  const handleDeleteArticle = (id: string, title: string) => {
    deleteArticle(id)
    toast({ title: "Article supprimé", description: `L'article "${title}" a été retiré.` })
  }

  const { startConversation } = useData()

  const handleStartConversation = (otherUser: User) => {
    if (!user) return
    const convId = startConversation([user.id, otherUser.id], [user.name, otherUser.name])
    router.push(`/admin/messages`)
    // Note: To jump to specific conversation, I'd need to pass the ID, 
    // but for now, simple redirect is good.
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-card fixed left-0 top-0 h-screen">
        {/* Logo */}
        <div className="p-6 border-b">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">AgriMarché</span>
          </Link>
        </div>

        {/* User Info */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">Administrateur</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <button
            onClick={() => setActiveMenu("overview")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
              activeMenu === "overview"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            <span className="text-sm font-medium">Tableau de bord</span>
          </button>
          
          <button
            onClick={() => setActiveMenu("users")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
              activeMenu === "users"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Users className="h-5 w-5" />
            <span className="text-sm font-medium">Utilisateurs</span>
          </button>

          <button
            onClick={() => setActiveMenu("products")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
              activeMenu === "products"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Package className="h-5 w-5" />
            <span className="text-sm font-medium">Produits</span>
          </button>

          <button
            onClick={() => setActiveMenu("orders")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
              activeMenu === "orders"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="text-sm font-medium">Commandes</span>
          </button>

          <button
            onClick={() => setActiveMenu("news")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
              activeMenu === "news"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Newspaper className="h-5 w-5" />
            <span className="text-sm font-medium">Actualités</span>
          </button>

          <button
            onClick={() => setActiveMenu("support")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
              activeMenu === "support"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-sm font-medium">Support</span>
          </button>

          <Link
            href="/admin/messages"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-muted-foreground hover:bg-muted"
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-sm font-medium">Messages</span>
          </Link>

          <Button 
            variant="outline" 
            className="w-full justify-start gap-3 mt-4"
            onClick={() => setIsContactProDialogOpen(true)}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-sm font-medium">Contacter un Pro</span>
          </Button>


          <button
            onClick={() => setActiveMenu("security")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
              activeMenu === "security"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <TrendingUp className="h-5 w-5" />
            <span className="text-sm font-medium">Sécurité</span>
          </button>
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground" asChild>
            <Link href="/">
              <Home className="h-4 w-4" />
              <span className="text-sm">Accueil</span>
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10" onClick={() => { logout(); }}>
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Déconnexion</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
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
              <button
                onClick={() => { setActiveMenu("overview"); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  activeMenu === "overview"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <BarChart3 className="h-5 w-5" />
                <span className="text-sm font-medium">Tableau de bord</span>
              </button>
              <button
                onClick={() => { setActiveMenu("users"); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  activeMenu === "users"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Users className="h-5 w-5" />
                <span className="text-sm font-medium">Utilisateurs</span>
              </button>
              <button
                onClick={() => { setActiveMenu("products"); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  activeMenu === "products"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Package className="h-5 w-5" />
                <span className="text-sm font-medium">Produits</span>
              </button>
              <button
                onClick={() => { setActiveMenu("orders"); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  activeMenu === "orders"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="text-sm font-medium">Commandes</span>
              </button>
              <button
                onClick={() => { setActiveMenu("news"); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  activeMenu === "news"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Newspaper className="h-5 w-5" />
                <span className="text-sm font-medium">Actualités</span>
              </button>
              <button
                onClick={() => { setActiveMenu("support"); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  activeMenu === "support"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <MessageSquare className="h-5 w-5" />
                <span className="text-sm font-medium">Support</span>
              </button>

              <Link
                href="/admin/messages"
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-muted-foreground hover:bg-muted"
              >
                <MessageSquare className="h-5 w-5" />
                <span className="text-sm font-medium">Messages</span>
              </Link>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 mt-4"
                onClick={() => { setIsContactProDialogOpen(true); setMobileMenuOpen(false); }}
              >
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm font-medium">Contacter un Pro</span>
              </Button>
              <button
                onClick={() => { setActiveMenu("security"); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  activeMenu === "security"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm font-medium">Sécurité</span>
              </button>
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col">
        {/* Top Header */}
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
              <h1 className="text-xl font-semibold">Administration</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-sm text-muted-foreground">{user.name}</span>
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative"
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1 right-1 bg-destructive text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                </Button>
                
                {/* Notifications Panel */}
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-96 max-h-96 overflow-y-auto bg-card border rounded-lg shadow-lg z-50">
                    <div className="p-4 border-b flex items-center justify-between">
                      <h3 className="font-semibold">Notifications</h3>
                      {unreadNotifications > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            notifications.forEach(n => markNotificationAsRead(n.id))
                          }}
                          className="text-xs"
                        >
                          Marquer tout comme lu
                        </Button>
                      )}
                    </div>
                    
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Aucune notification</p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {notifications.slice(0, 10).map((notification) => (
                          <div 
                            key={notification.id}
                            className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                              !notification.read ? 'bg-muted/30' : ''
                            }`}
                            onClick={() => markNotificationAsRead(notification.id)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-1">
                                {!notification.read ? (
                                  <div className="w-2 h-2 bg-primary rounded-full" />
                                ) : (
                                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{notification.title}</p>
                                <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  {new Date(notification.timestamp).toLocaleTimeString('fr-FR', { 
                                    hour: '2-digit', 
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {notifications.length > 10 && (
                          <div className="p-4 text-center text-xs text-muted-foreground">
                            +{notifications.length - 10} autres notifications
                          </div>
                        )}
                      </div>
                    )}
                    
                    {notifications.length > 0 && (
                      <div className="p-3 border-t text-center">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            clearNotifications()
                            setShowNotifications(false)
                            toast({ title: "Tous les notifications ont été supprimées" })
                          }}
                          className="text-xs text-destructive"
                        >
                          Effacer toutes les notifications
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {/* Overview Section */}
        {activeMenu === "overview" && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground">Tableau de bord</h2>
              <p className="text-muted-foreground">Vue d'ensemble de la plateforme</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

            {/* Charts Row 1 */}
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {/* Products by Category */}
              <Card>
                <CardHeader>
                  <CardTitle>Produits par Catégorie</CardTitle>
                  <CardDescription>Répartition des produits</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(
                          products.reduce((acc, p) => {
                            acc[p.category] = (acc[p.category] || 0) + 1
                            return acc
                          }, {} as Record<string, number>)
                        ).map(([key, value]) => ({
                          name: CATEGORIES.find(c => c.value === key)?.label || key,
                          value
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Orders by Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Commandes par Statut</CardTitle>
                  <CardDescription>Distribution des statuts</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(
                          orders.reduce((acc, o) => {
                            acc[o.status] = (acc[o.status] || 0) + 1
                            return acc
                          }, {} as Record<string, number>)
                        ).map(([key, value]) => ({
                          name: ORDER_STATUS_LABELS[key as keyof typeof ORDER_STATUS_LABELS],
                          value
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {['#10b981', '#3b82f6', '#ef4444', '#f59e0b'].map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="mt-8 grid gap-6">
              {/* Revenue Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Tendance des revenus</CardTitle>
                  <CardDescription>Chiffre d'affaires par catégorie</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={Object.entries(
                        products.reduce((acc, p) => {
                          const categoryLabel = CATEGORIES.find(c => c.value === p.category)?.label || p.category
                          acc[categoryLabel] = (acc[categoryLabel] || 0) + (p.price * p.quantity)
                          return acc
                        }, {} as Record<string, number>)
                      ).map(([name, revenue]) => ({
                        name,
                        revenue: Math.round(revenue)
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="revenue" fill="#0ea5e9" name="Revenu (€)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Orders Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Tendances des commandes</CardTitle>
                  <CardDescription>Nombre de commandes par semaine</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={(() => {
                        const data: { week: string; count: number }[] = []
                        for (let i = 3; i >= 0; i--) {
                          const d = new Date()
                          d.setDate(d.getDate() - i * 7)
                          const week = `${d.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}`
                          const count = orders.filter(o => {
                            const oDate = new Date(o.createdAt)
                            return oDate.getTime() >= d.getTime() && oDate.getTime() < (new Date(d.getTime() + 7 * 24 * 60 * 60 * 1000)).getTime()
                          }).length
                          data.push({ week, count })
                        }
                        return data
                      })()}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="count" stroke="#10b981" name="Commandes" strokeWidth={2} dot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Stats Details */}
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Commande moyenne</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : '0'} €
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Par commande</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Taux de conversion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {buyers.length > 0 ? ((orders.length / buyers.length) * 100).toFixed(1) : '0'}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Acheteurs actifs</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Produits disponibles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {products.filter(p => p.isAvailable).length}/{products.length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">En stock</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Notifications */}
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Activité récente</CardTitle>
                      <CardDescription>Notifications en temps réel des actions</CardDescription>
                    </div>
                    {unreadNotifications > 0 && (
                      <Badge variant="destructive">{unreadNotifications} nouvelle(s)</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {notifications.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">Aucune activité pour le moment</p>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {notifications.slice(0, 8).map((notification) => (
                        <div 
                          key={notification.id}
                          className={`p-3 rounded-lg border transition-colors ${
                            !notification.read ? 'bg-muted/50 border-primary/30' : 'border-border'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{notification.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-muted-foreground">
                                  {new Date(notification.timestamp).toLocaleTimeString('fr-FR', { 
                                    hour: '2-digit', 
                                    minute: '2-digit',
                                    second: '2-digit'
                                  })}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {notification.actionUser}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markNotificationAsRead(notification.id)}
                              className="h-6"
                            >
                              {notification.read ? '✓' : ''}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Users Section */}
        {activeMenu === "users" && (
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
                            {farmer.rating && (
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-xs font-medium">{farmer.rating} ({farmer.reviewCount})</span>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                              Mot de passe: {revealedPasswords[farmer.id] ? (
                                <span className="font-mono text-foreground">{farmer.password || "password"}</span>
                              ) : (
                                <span className="font-mono text-muted-foreground">••••••••</span>
                              )}
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-5 w-5 ml-1" 
                                onClick={() => handleTogglePasswordVisibility(farmer)}
                              >
                                {revealedPasswords[farmer.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                              </Button>
                            </p>
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
                            <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                              Mot de passe: {revealedPasswords[buyer.id] ? (
                                <span className="font-mono text-foreground">{buyer.password || "password"}</span>
                              ) : (
                                <span className="font-mono text-muted-foreground">••••••••</span>
                              )}
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-5 w-5 ml-1" 
                                onClick={() => handleTogglePasswordVisibility(buyer)}
                              >
                                {revealedPasswords[buyer.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                              </Button>
                            </p>
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
        )}

        {/* Products Section */}
        {activeMenu === "products" && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground">Produits</h2>
              <p className="text-muted-foreground">Gérez tous les produits de la plateforme</p>
            </div>
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
          </div>
        )}

        {/* Orders Section */}
        {activeMenu === "orders" && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground">Commandes</h2>
              <p className="text-muted-foreground">Historique complet des commandes</p>
            </div>
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
          </div>
        )}

        {/* News Section */}
        {activeMenu === "news" && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground">Actualités</h2>
              <p className="text-muted-foreground">Gérez les articles et actualités</p>
            </div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Actualités ({articles?.length || 0})</CardTitle>
                    <CardDescription>Gérez les articles d'actualité de la plateforme</CardDescription>
                  </div>
                  <Dialog open={isAddArticleDialogOpen} onOpenChange={setIsAddArticleDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Newspaper className="h-4 w-4" />
                        Ajouter un article
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Créer un nouvel article</DialogTitle>
                        <DialogDescription>
                          Publiez une actualité sur le monde agricole, les tendances ou les agriculteurs.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="article-title">Titre</Label>
                          <Input
                            id="article-title"
                            placeholder="Titre accrocheur..."
                            value={newArticleData.title}
                            onChange={(e) => setNewArticleData({ ...newArticleData, title: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="article-desc">Description courte</Label>
                          <Input
                            id="article-desc"
                            placeholder="Résumé en une phrase..."
                            value={newArticleData.description}
                            onChange={(e) => setNewArticleData({ ...newArticleData, description: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="article-category">Catégorie</Label>
                            <Select
                              value={newArticleData.category}
                              onValueChange={(val: any) => setNewArticleData({ ...newArticleData, category: val })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Catégorie" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="agriculteurs">Agriculteurs</SelectItem>
                                <SelectItem value="produits">Produits en Vogue</SelectItem>
                                <SelectItem value="monde">Monde Agricole</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="article-author">Auteur</Label>
                            <Input
                              id="article-author"
                              value={newArticleData.authorName}
                              onChange={(e) => setNewArticleData({ ...newArticleData, authorName: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="article-image-file">Image d'illustration (optionnel)</Label>
                          <div className="flex flex-col gap-3">
                            <Input
                              id="article-image-file"
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setSelectedImageFile(e.target.files[0])
                                  setNewArticleData({ ...newArticleData, imageUrl: "" })
                                }
                              }}
                            />
                            <div className="text-center text-sm text-muted-foreground">ou URL web :</div>
                            <Input
                              id="article-image"
                              placeholder="https://images.unsplash.com/..."
                              value={newArticleData.imageUrl}
                              onChange={(e) => {
                                setNewArticleData({ ...newArticleData, imageUrl: e.target.value })
                                setSelectedImageFile(null)
                              }}
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="article-content">Contenu de l'article</Label>
                          <textarea
                            id="article-content"
                            className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Rédigez le contenu complet ici..."
                            value={newArticleData.content}
                            onChange={(e) => setNewArticleData({ ...newArticleData, content: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddArticleDialogOpen(false)} disabled={isUploading}>
                          Annuler
                        </Button>
                        <Button onClick={handleAddArticle} disabled={isUploading}>
                          {isUploading ? "Publication..." : "Publier"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {!articles || articles.length === 0 ? (
                  <p className="text-muted-foreground">Aucun article publié pour le moment.</p>
                ) : (
                  <div className="space-y-4">
                    {articles.map((article) => (
                      <div key={article.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-lg border p-4">
                        <div className="flex gap-4">
                          {article.imageUrl && (
                            <img src={article.imageUrl} alt="" className="h-16 w-16 rounded-md object-cover hidden sm:block" />
                          )}
                          <div>
                            <p className="font-medium text-lg leading-tight">{article.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs uppercase bg-muted/50">{article.category}</Badge>
                              <span className="text-xs text-muted-foreground">{article.authorName} · {new Date(article.createdAt).toLocaleDateString("fr-FR")}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-1">{article.description}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="shrink-0" onClick={() => handleDeleteArticle(article.id, article.title)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Support Section */}
        {activeMenu === "support" && (
          <div>
            {selectedTicketId ? (
              <>
                <Button variant="ghost" className="mb-6 gap-2" onClick={() => setSelectedTicketId(null)}>
                  <X className="h-4 w-4" />
                  Retour
                </Button>

                {supportTickets.find(t => t.id === selectedTicketId) && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {supportTickets.find(t => t.id === selectedTicketId)?.subject}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            De: <span className="font-medium">{supportTickets.find(t => t.id === selectedTicketId)?.buyerName}</span> • {supportTickets.find(t => t.id === selectedTicketId)?.buyerEmail}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {supportTickets.find(t => t.id === selectedTicketId)?.type === "complaint" ? "Plainte" : supportTickets.find(t => t.id === selectedTicketId)?.type === "question" ? "Question" : supportTickets.find(t => t.id === selectedTicketId)?.type === "feedback" ? "Avis" : "Signalement"}
                          </Badge>
                          <Select value={supportTickets.find(t => t.id === selectedTicketId)?.status || "open"} onValueChange={(status) => updateTicketStatus(selectedTicketId, status as any)}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Ouvert</SelectItem>
                              <SelectItem value="in_progress">En cours</SelectItem>
                              <SelectItem value="closed">Fermé</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      {/* Messages */}
                      <div className="space-y-4 max-h-96 overflow-y-auto border rounded-lg p-4 bg-muted/50">
                        {supportTickets.find(t => t.id === selectedTicketId)?.messages.map((message) => (
                          <div key={message.id} className={`p-4 rounded-lg border ${message.senderId === user?.id ? "bg-primary/10 border-primary/20 ml-8" : "bg-background"}`}>
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium text-sm">{message.senderName}</p>
                              <span className="text-xs text-muted-foreground">{new Date(message.timestamp).toLocaleString("fr-FR")}</span>
                            </div>
                            <p className="text-sm">{message.content}</p>
                          </div>
                        ))}
                      </div>

                      {/* Message Input */}
                      {supportTickets.find(t => t.id === selectedTicketId)?.status !== "closed" && (
                        <div className="flex gap-2">
                          <textarea
                            placeholder="Votre réponse..."
                            value={ticketReplyText}
                            onChange={(e) => setTicketReplyText(e.target.value)}
                            rows={3}
                            className="flex-1 px-3 py-2 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <Button
                            onClick={() => {
                              if (ticketReplyText.trim() && selectedTicketId) {
                                addMessageToTicket(selectedTicketId, {
                                  senderName: user?.name || "Administrateur",
                                  senderId: user?.id || "admin",
                                  content: ticketReplyText,
                                })
                                setTicketReplyText("")
                                toast({
                                  title: "Message envoyé",
                                  description: "Votre réponse a été ajoutée au ticket.",
                                })
                              }
                            }}
                            disabled={!ticketReplyText.trim()}
                            className="self-end"
                          >
                            Envoyer
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-foreground">Support</h2>
                  <p className="text-muted-foreground">Gérez les tickets de support des acheteurs</p>
                </div>

                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Tickets de Support ({supportTickets.length})
                      <Badge variant="secondary">
                        {supportTickets.filter(t => t.status === "open").length} ouvert
                        {supportTickets.filter(t => t.status === "open").length !== 1 ? "s" : ""}
                      </Badge>
                    </CardTitle>
                    <CardDescription>Filtrer par statut</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      {(["all", "open", "in_progress", "closed"] as const).map((status) => (
                        <Button
                          key={status}
                          variant={ticketStatusFilter === status ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTicketStatusFilter(status)}
                        >
                          {status === "all" ? "Tous" : status === "open" ? "Ouvert" : status === "in_progress" ? "En cours" : "Fermé"}
                        </Button>
                      ))}
                    </div>

                    {supportTickets.filter(t =>
                      ticketStatusFilter === "all" || t.status === ticketStatusFilter
                    ).length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">Aucun ticket</p>
                    ) : (
                      <div className="space-y-3">
                        {supportTickets.filter(t =>
                          ticketStatusFilter === "all" || t.status === ticketStatusFilter
                        ).map((ticket) => (
                          <div
                            key={ticket.id}
                            onClick={() => setSelectedTicketId(ticket.id)}
                            className="flex items-start justify-between p-4 rounded-lg border hover:bg-muted cursor-pointer transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{ticket.subject}</span>
                                <Badge variant="outline" className="text-xs">
                                  {ticket.type === "complaint" ? "Plainte" : ticket.type === "question" ? "Question" : ticket.type === "feedback" ? "Avis" : "Signalement"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{ticket.buyerName} • {ticket.buyerEmail}</p>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{ticket.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-muted-foreground">{ticket.messages.length} message{ticket.messages.length > 1 ? "s" : ""}</span>
                                <span className="text-xs text-muted-foreground">{new Date(ticket.updatedAt).toLocaleDateString("fr-FR")}</span>
                              </div>
                            </div>
                            <Badge variant={ticket.status === "open" ? "destructive" : ticket.status === "in_progress" ? "default" : "secondary"}>
                              {ticket.status === "open" ? "Ouvert" : ticket.status === "in_progress" ? "En cours" : "Fermé"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}

        {/* Security Section */}
        {activeMenu === "security" && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground">Sécurité</h2>
              <p className="text-muted-foreground">Gérez vos paramètres de sécurité</p>
            </div>
            {!isSecurityUnlocked ? (
              <Dialog open={!isSecurityUnlocked} onOpenChange={() => {}}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Accès à la section sécurité</DialogTitle>
                    <DialogDescription>
                      Veuillez entrer votre mot de passe de connexion pour accéder aux paramètres de sécurité.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="security-password">Mot de passe de connexion</Label>
                      <div className="relative">
                        <Input
                          id="security-password"
                          type={showSecurityPasswordField ? "text" : "password"}
                          placeholder="Votre mot de passe..."
                          value={securityPasswordAttempt}
                          onChange={(e) => setSecurityPasswordAttempt(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleVerifySecurityPassword()
                          }}
                          className="pr-10"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecurityPasswordField(!showSecurityPasswordField)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                        >
                          {showSecurityPasswordField ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleVerifySecurityPassword} className="w-full">
                      Vérifier
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Mot de passe de connexion</CardTitle>
                  <CardDescription>Modifiez votre mot de passe pour vous connecter à la plateforme</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-pw">Mot de passe actuel</Label>
                    <div className="relative">
                      <Input id="current-pw" type={showCurrentPassword ? "text" : "password"} value={securityData.currentPassword} onChange={e => setSecurityData({...securityData, currentPassword: e.target.value})} className="pr-10" />
                      <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-pw">Nouveau mot de passe</Label>
                    <div className="relative">
                      <Input id="new-pw" type={showNewPassword ? "text" : "password"} value={securityData.newPassword} onChange={e => setSecurityData({...securityData, newPassword: e.target.value})} className="pr-10" />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-new-pw">Confirmer le nouveau mot de passe</Label>
                    <div className="relative">
                      <Input id="confirm-new-pw" type={showConfirmNewPassword ? "text" : "password"} value={securityData.confirmNewPassword} onChange={e => setSecurityData({...securityData, confirmNewPassword: e.target.value})} className="pr-10" />
                      <button type="button" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                        {showConfirmNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button onClick={handleChangeConnectionPassword}>Mettre à jour</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mot de passe maître</CardTitle>
                  <CardDescription>Définissez un mot de passe spécifique pour voir les mots de passe des utilisateurs (min. 6 caractères)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-master">Nouveau mot de passe maître</Label>
                    <div className="relative">
                      <Input id="new-master" type={showNewMasterPassword ? "text" : "password"} value={securityData.newMasterPassword} onChange={e => setSecurityData({...securityData, newMasterPassword: e.target.value})} className="pr-10" />
                      <button type="button" onClick={() => setShowNewMasterPassword(!showNewMasterPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                        {showNewMasterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-master">Confirmer le mot de passe maître</Label>
                    <div className="relative">
                      <Input id="confirm-master" type={showConfirmNewMasterPassword ? "text" : "password"} value={securityData.confirmNewMasterPassword} onChange={e => setSecurityData({...securityData, confirmNewMasterPassword: e.target.value})} className="pr-10" />
                      <button type="button" onClick={() => setShowConfirmNewMasterPassword(!showConfirmNewMasterPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                        {showConfirmNewMasterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button onClick={handleChangeMasterPassword}>Définir le mot de passe maître</Button>
                </CardContent>
              </Card>
            </div>
            )}
          </div>
        )}
        </main>
      </div>

      {/* Password Verification Dialog */}
      <Dialog open={!!passwordTargetUser} onOpenChange={(open) => !open && setPasswordTargetUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vérification de sécurité</DialogTitle>
            <DialogDescription>
              En tant qu'administrateur, veuillez entrer votre mot de passe pour voir les informations d'identification de cet utilisateur.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="admin-verify-password">Mot de passe administrateur</Label>
              <div className="relative">
                <Input
                  id="admin-verify-password"
                  type={showVerifyPassword ? "text" : "password"}
                  placeholder="Votre mot de passe..."
                  value={adminPasswordAttempt}
                  onChange={(e) => setAdminPasswordAttempt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleVerifyAdminPassword()
                  }}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowVerifyPassword(!showVerifyPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showVerifyPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordTargetUser(null)}>
              Annuler
            </Button>
            <Button onClick={handleVerifyAdminPassword}>Vérifier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isContactProDialogOpen} onOpenChange={setIsContactProDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Contacter un Agriculteur</DialogTitle>
            <DialogDescription>
              Sélectionnez un agriculteur pour démarrer une conversation.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto py-4">
            {farmers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Aucun agriculteur inscrit</p>
            ) : (
              <div className="space-y-3">
                {farmers.map((farmer) => (
                  <div key={farmer.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-xs">
                        {farmer.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{farmer.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{farmer.location}</p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="gap-2"
                      onClick={() => {
                        handleStartConversation(farmer)
                        setIsContactProDialogOpen(false)
                      }}
                    >
                      <MessageSquare className="h-4 w-4 text-primary" />
                      Message
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
