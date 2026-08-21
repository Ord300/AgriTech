"use client"
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useData } from "@/lib/data-context"
import { useCart } from "@/lib/cart-context"
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
import { ORDER_STATUS_LABELS, CATEGORIES, ACCOUNT_REQUEST_STATUS_LABELS, FARMER_ACCOUNT_FEE, type User, type ArticleCategory, type AccountRequestStatus } from "@/lib/types"
import { Leaf, Users, Package, ShoppingCart, TrendingUp, LogOut, Home, Trash2, Menu, Eye, EyeOff, Newspaper, Star, X, BarChart3, DollarSign, Clock, Bell, CheckCircle2, AlertCircle, MessageSquare, ShieldCheck, LifeBuoy, MessagesSquare, UserPlus, UserCog, Save, Plus, Upload, ClipboardList, Check, Ban, type LucideIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ConversationList } from "@/components/messaging/conversation-list"
import { ChatWindow } from "@/components/messaging/chat-window"
import { useToast } from "@/hooks/use-toast"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, AreaChart, Area } from "recharts"

export default function AdminDashboard() {
  const { user, logout, isLoading, updateUser: updateAuthUser, changePassword } = useAuth()
  const { products, orders, users, articles, deleteProduct, deleteUser, updateOrderStatus, updateUser, addArticle, deleteArticle, notifications, unreadNotifications, markNotificationAsRead, clearNotifications, supportTickets, addMessageToTicket, updateTicketStatus, conversations, messages, sendMessage, startConversation, transactions, showcaseProducts, addShowcaseProduct, deleteShowcaseProduct, accountRequests, updateAccountRequestStatus } = useData()
  const { totalItems, setCartOpen } = useCart()
  const router = useRouter()
  const { toast } = useToast()

  const [isAddFarmerDialogOpen, setIsAddFarmerDialogOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState<"overview" | "users" | "products" | "orders" | "payments" | "news" | "showcase" | "support" | "requests" | "security" | "messages" | "contact" | "profile">("overview")
  const [showNotifications, setShowNotifications] = useState(false)
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [ticketReplyText, setTicketReplyText] = useState("")
  const [ticketStatusFilter, setTicketStatusFilter] = useState<"all" | "open" | "in_progress" | "closed">("all")
  const [requestStatusFilter, setRequestStatusFilter] = useState<"all" | AccountRequestStatus>("all")
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

  // Messaging state
  const [selectedConvId, setSelectedConvId] = useState<string | undefined>(undefined)

  // Profile state
  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
    location: "",
    description: "",
    avatar: "",
  })
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

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

  // Showcase ("Nos Produits du Moment") state
  const [isAddShowcaseDialogOpen, setIsAddShowcaseDialogOpen] = useState(false)
  const [showcaseImagePreview, setShowcaseImagePreview] = useState<string | null>(null)
  const [newShowcaseData, setNewShowcaseData] = useState({
    name: "",
    category: "Légumes",
    image: "",
  })

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.replace("/connexion")
    }
  }, [isLoading, user, router])

  // Ouvrir directement une section via ?section= (ex: /admin?section=messages)
  useEffect(() => {
    const section = new URLSearchParams(window.location.search).get("section")
    const validSections = ["overview", "users", "products", "orders", "payments", "news", "showcase", "support", "requests", "security", "messages", "contact", "profile"] as const
    if (section && (validSections as readonly string[]).includes(section)) {
      setActiveMenu(section as typeof activeMenu)
    }
  }, [])

  // Synchroniser le formulaire de profil avec l'utilisateur connecté
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        phone: user.phone || "",
        location: user.location || "",
        description: user.description || "",
        avatar: user.avatar || "",
      })
      setAvatarPreview(user.avatar || null)
    }
  }, [user])

  // Sélectionner automatiquement la première conversation de l'admin
  useEffect(() => {
    if (user && !selectedConvId) {
      const firstConv = conversations.find(c => c.participantIds.includes(user.id))
      if (firstConv) {
        setSelectedConvId(firstConv.id)
      }
    }
  }, [user, conversations, selectedConvId])

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
  const openTicketsCount = supportTickets.filter((t) => t.status === "open").length
  const pendingRequestsCount = accountRequests.filter((r) => r.status === "pending").length
  const totalCommissions = transactions
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.commission, 0)
  const totalPaidToFarmers = transactions
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.farmerAmount, 0)

  const sectionLabels: Record<typeof activeMenu, string> = {
    overview: "Tableau de bord",
    users: "Gestion des utilisateurs",
    products: "Gestion des produits",
    orders: "Suivi des commandes",
    payments: "Paiements & commissions",
    news: "Actualités",
    showcase: "Produits du moment",
    support: "Support client",
    requests: "Demandes de comptes agriculteurs",
    security: "Sécurité du compte",
    messages: "Messages",
    contact: "Contacter un Pro",
    profile: "Mon profil",
  }

  const mainMenuItems: { key: typeof activeMenu; label: string; icon: LucideIcon }[] = [
    { key: "overview", label: "Tableau de bord", icon: BarChart3 },
    { key: "users", label: "Utilisateurs", icon: Users },
    { key: "products", label: "Produits", icon: Package },
    { key: "orders", label: "Commandes", icon: ShoppingCart },
    { key: "payments", label: "Paiements", icon: DollarSign },
    { key: "news", label: "Actualités", icon: Newspaper },
    { key: "showcase", label: "Produits du moment", icon: Star },
    { key: "support", label: "Support", icon: LifeBuoy },
    { key: "requests", label: "Demandes", icon: ClipboardList },
  ]

  const communicationMenuItems: { key: typeof activeMenu; label: string; icon: LucideIcon }[] = [
    { key: "messages", label: "Messages", icon: MessagesSquare },
    { key: "contact", label: "Contacter un Pro", icon: UserPlus },
  ]

  const accountMenuItems: { key: typeof activeMenu; label: string; icon: LucideIcon }[] = [
    { key: "profile", label: "Mon Profil", icon: UserCog },
    { key: "security", label: "Sécurité", icon: ShieldCheck },
  ]

  const renderMenuButton = (
    item: { key: typeof activeMenu; label: string; icon: LucideIcon },
    onNavigate?: () => void,
  ) => (
    <button
      key={item.key}
      onClick={() => {
        setActiveMenu(item.key)
        onNavigate?.()
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeMenu === item.key
          ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-[0_0_15px_rgba(192,38,211,0.4)] font-semibold border-l-4 border-white/20"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:translate-x-1"
        }`}
    >
      <item.icon className={`h-5 w-5 shrink-0 ${activeMenu === item.key ? 'text-white' : ''}`} />
      <span className="text-sm">{item.label}</span>
      {item.key === "support" && openTicketsCount > 0 && (
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]">
          {openTicketsCount}
        </span>
      )}
      {item.key === "requests" && pendingRequestsCount > 0 && (
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-xs font-bold text-white shadow-[0_0_10px_rgba(245,158,11,0.5)]">
          {pendingRequestsCount}
        </span>
      )}
    </button>
  )

  // Label personnalisé pour les camemberts : texte blanc lisible sur thème sombre
  const renderPieLabel = ({ cx, cy, midAngle, outerRadius, name, value }: any) => {
    const RADIAN = Math.PI / 180
    const radius = outerRadius + 16
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    return (
      <text
        x={x}
        y={y}
        fill="rgba(255,255,255,0.85)"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={11}
        fontWeight={500}
      >
        {`${name}: ${value}`}
      </text>
    )
  }

  const chartTooltipStyle = {
    backgroundColor: 'rgba(24, 24, 40, 0.95)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
  } as const

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

  const handleShowcaseImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setNewShowcaseData({ ...newShowcaseData, image: result })
        setShowcaseImagePreview(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddShowcase = () => {
    if (!newShowcaseData.name || !newShowcaseData.category) {
      toast({
        title: "Erreur",
        description: "Veuillez renseigner le nom et la catégorie du produit.",
        variant: "destructive",
      })
      return
    }
    addShowcaseProduct({
      name: newShowcaseData.name,
      category: newShowcaseData.category,
      image:
        newShowcaseData.image ||
        `/placeholder.svg?height=300&width=400&query=${encodeURIComponent(newShowcaseData.name + " fresh produce")}`,
    })
    toast({
      title: "Produit mis en avant",
      description: `${newShowcaseData.name} apparaît désormais dans "Nos Produits du Moment" sur l'accueil.`,
    })
    setNewShowcaseData({ name: "", category: "Légumes", image: "" })
    setShowcaseImagePreview(null)
    setIsAddShowcaseDialogOpen(false)
  }

  const handleDeleteShowcase = (id: string, name: string) => {
    deleteShowcaseProduct(id)
    toast({
      title: "Retiré de la vitrine",
      description: `${name} n'apparaît plus dans "Nos Produits du Moment".`,
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

  const handleApproveRequest = (id: string, name: string) => {
    updateAccountRequestStatus(id, "approved")
    toast({
      title: "Demande confirmée",
      description: `La demande de ${name} est confirmée. Le paiement des frais de création (${FARMER_ACCOUNT_FEE.toFixed(2).replace(".", ",")} FC) est maintenant attendu.`,
    })
  }

  const handleRejectRequest = (id: string, name: string) => {
    updateAccountRequestStatus(id, "rejected")
    toast({
      title: "Demande rejetée",
      description: `La demande de ${name} a été rejetée.`,
    })
  }

  const adminConversations = conversations.filter(c => c.participantIds.includes(user.id))
  const selectedConv = conversations.find(c => c.id === selectedConvId)
  const otherParticipantId = selectedConv?.participantIds.find(id => id !== user.id)
  const otherParticipant = users.find(u => u.id === otherParticipantId)
  const currentMessages = messages.filter(m => m.conversationId === selectedConvId)

  const handleStartConversation = (otherUser: User) => {
    if (!user) return
    const convId = startConversation([user.id, otherUser.id], [user.name, otherUser.name])
    setSelectedConvId(convId)
    setActiveMenu("messages")
  }

  const handleSendMessage = (content: string) => {
    if (selectedConvId && user) {
      sendMessage(selectedConvId, user.id, content)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        const base64String = reader.result as string
        setAvatarPreview(base64String)
        setProfileData({ ...profileData, avatar: base64String })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpdateProfile = () => {
    if (!user) return
    if (!profileData.name.trim()) {
      toast({ title: "Erreur", description: "Le nom est obligatoire.", variant: "destructive" })
      return
    }
    updateAuthUser(profileData)
    updateUser(user.id, profileData)
    toast({ title: "Profil mis à jour", description: "Vos informations ont été enregistrées avec succès." })
  }

  return (
    <div className="admin-theme min-h-screen bg-background text-foreground flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground fixed left-0 top-0 h-screen">
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
              <Leaf className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <span className="text-lg font-bold">TerraFrais</span>
            <span className="rounded bg-sidebar-accent px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sidebar-accent-foreground">
              Admin
            </span>
          </Link>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground font-medium">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/60 capitalize">Administrateur</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            Menu
          </p>
          {mainMenuItems.map((item) => renderMenuButton(item))}

          <p className="px-3 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            Communication
          </p>
          {communicationMenuItems.map((item) => renderMenuButton(item))}

          <p className="px-3 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            Compte
          </p>
          {accountMenuItems.map((item) => renderMenuButton(item))}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-sidebar-border space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            asChild
          >
            <Link href="/">
              <Home className="h-4 w-4" />
              <span className="text-sm">Accueil</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-red-400 hover:bg-sidebar-accent hover:text-red-300"
            onClick={() => { logout(); }}
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Déconnexion</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <aside className="fixed left-0 top-0 w-64 h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col z-50">
            <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
              <span className="font-bold">Menu</span>
              <Button
                variant="ghost"
                size="icon"
                className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                Menu
              </p>
              {mainMenuItems.map((item) => renderMenuButton(item, () => setMobileMenuOpen(false)))}

              <p className="px-3 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                Communication
              </p>
              {communicationMenuItems.map((item) => renderMenuButton(item, () => setMobileMenuOpen(false)))}

              <p className="px-3 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                Compte
              </p>
              {accountMenuItems.map((item) => renderMenuButton(item, () => setMobileMenuOpen(false)))}
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
              <p className="text-xs text-muted-foreground">Administration</p>
              <h1 className="text-lg font-semibold leading-tight text-foreground">{sectionLabels[activeMenu]}</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-sm text-muted-foreground">{user.name}</span>
              <Button
                variant="outline"
                size="icon"
                className="relative bg-transparent"
                onClick={() => setCartOpen(true)}
                aria-label="Ouvrir le panier"
              >
                <ShoppingCart className="h-4 w-4" />
                {totalItems > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground">
                    {totalItems}
                  </span>
                )}
              </Button>
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
                            className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${!notification.read ? 'bg-muted/30' : ''
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
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Overview Section */}
          {activeMenu === "overview" && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">Tableau de bord</h2>
                <p className="text-sm text-muted-foreground">Vue d'ensemble de la plateforme</p>
              </div>

              {/* Stats Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Card 1: Users (Pink/Purple Gradient) */}
                <Card className="border-0 bg-gradient-to-br from-fuchsia-500 via-purple-600 to-indigo-600 text-white shadow-[0_8px_30px_rgba(192,38,211,0.3)]">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-extrabold tracking-tight">{userCount}</p>
                      <p className="text-xs font-medium text-white/80 uppercase tracking-wider">Utilisateurs</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Card 2: Revenue (Cyan/Blue Gradient) */}
                <Card className="border-0 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 text-white shadow-[0_8px_30px_rgba(6,182,212,0.3)]">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-extrabold tracking-tight">{totalRevenue.toFixed(0)} FC</p>
                      <p className="text-xs font-medium text-white/80 uppercase tracking-wider">Volume total</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Card 3: Products (Dark with glowing cyan) */}
                <Card className="border border-white/5 bg-card/80 backdrop-blur-xl shadow-lg relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardContent className="flex items-center gap-3 p-4 relative z-10">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.3)]">
                      <Package className="h-5 w-5 text-sky-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-extrabold tracking-tight text-foreground">{products.length}</p>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Produits</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Card 4: Orders (Dark with glowing amber/orange) */}
                <Card className="border border-white/5 bg-card/80 backdrop-blur-xl shadow-lg relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardContent className="flex items-center gap-3 p-4 relative z-10">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                      <ShoppingCart className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-extrabold tracking-tight text-foreground">{orders.length}</p>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Commandes</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row 1 */}
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {/* Products by Category */}
                <Card className="border border-white/5 bg-card/60 backdrop-blur-xl shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-foreground">Produits par Catégorie</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">Répartition des produits</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={230}>
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
                          label={renderPieLabel}
                          innerRadius={55}
                          outerRadius={72}
                          paddingAngle={4}
                          dataKey="value"
                          stroke="none"
                        >
                          {/* Neon color palette */}
                          {['#00f2fe', '#4facfe', '#f093fb', '#f5576c', '#8b5cf6', '#e81cff', '#06b6d4', '#eab308'].map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={chartTooltipStyle}
                          itemStyle={{ color: '#fff' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Orders by Status */}
                <Card className="border border-white/5 bg-card/60 backdrop-blur-xl shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-foreground">Commandes par Statut</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">Distribution des statuts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={230}>
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
                          label={renderPieLabel}
                          innerRadius={55}
                          outerRadius={72}
                          paddingAngle={4}
                          dataKey="value"
                          stroke="none"
                        >
                          {/* Neon status colors */}
                          {['#eab308', '#00f2fe', '#4ade80', '#f43f5e'].map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={chartTooltipStyle}
                          itemStyle={{ color: '#fff' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row 2 */}
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {/* Revenue Trend */}
                <Card className="border border-white/5 bg-card/60 backdrop-blur-xl shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-foreground">Tendance des revenus</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">Chiffre d'affaires par catégorie</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={240}>
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
                        margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00f2fe" stopOpacity={1} />
                            <stop offset="100%" stopColor="#4facfe" stopOpacity={0.55} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 11 }} axisLine={false} tickLine={false} dy={6} />
                        <YAxis tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v} FC`} />
                        <Tooltip
                          contentStyle={chartTooltipStyle}
                          itemStyle={{ color: '#fff' }}
                          labelStyle={{ color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}
                          cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                          formatter={(value: any) => [`${value} FC`, 'Revenu']}
                        />
                        <Bar dataKey="revenue" fill="url(#colorRevenue)" name="Revenu (FC)" radius={[5, 5, 0, 0]} barSize={28} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Orders Trend */}
                <Card className="border border-white/5 bg-card/60 backdrop-blur-xl shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-foreground">Tendances des commandes</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">Nombre de commandes par semaine</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={240}>
                      <AreaChart
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
                        margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#e14eca" stopOpacity={0.45} />
                            <stop offset="100%" stopColor="#e14eca" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                        <XAxis dataKey="week" tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 11 }} axisLine={false} tickLine={false} dy={6} />
                        <YAxis tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip
                          contentStyle={chartTooltipStyle}
                          itemStyle={{ color: '#fff' }}
                          labelStyle={{ color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}
                          cursor={{ stroke: 'rgba(225,78,202,0.4)', strokeWidth: 1 }}
                          formatter={(value: any) => [`${value}`, 'Commandes']}
                        />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="#e14eca"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#colorOrders)"
                          name="Commandes"
                          dot={{ r: 3, fill: '#e14eca', strokeWidth: 0 }}
                          activeDot={{ r: 5, fill: '#e14eca', stroke: 'rgba(255,255,255,0.3)', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Stats Details */}
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-emerald-500/20 bg-emerald-500/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-emerald-500 uppercase tracking-wider">Commissions plateforme (3%)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold text-emerald-500">
                      {totalCommissions.toFixed(2)} FC
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {transactions.length} transaction{transactions.length > 1 ? "s" : ""} Mobile Money
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Commande moyenne</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">
                      {orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : '0'} FC
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Par commande</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Taux de conversion</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">
                      {buyers.length > 0 ? ((orders.length / buyers.length) * 100).toFixed(1) : '0'}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Acheteurs actifs</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Produits disponibles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">
                      {products.filter(p => p.isAvailable).length}/{products.length}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">En stock</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Notifications */}
              <div className="mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">Activité récente</CardTitle>
                        <CardDescription className="text-xs">Notifications en temps réel des actions</CardDescription>
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
                      <div className="space-y-2.5 max-h-80 overflow-y-auto">
                        {notifications.slice(0, 8).map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-3 rounded-lg border transition-colors ${!notification.read ? 'bg-muted/50 border-primary/30' : 'border-border'
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
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-foreground">Utilisateurs</h2>
                <p className="text-muted-foreground">Gérez les comptes de la plateforme</p>
              </div>
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
                        <DialogContent className="admin-theme">
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
                                placeholder="Richard DM"
                                value={newFarmerData.name}
                                onChange={(e) => setNewFarmerData({ ...newFarmerData, name: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="farmer-email">Adresse email</Label>
                              <Input
                                id="farmer-email"
                                type="email"
                                placeholder="exemple@gmail.com"
                                value={newFarmerData.email}
                                onChange={(e) => setNewFarmerData({ ...newFarmerData, email: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="farmer-phone">Téléphone</Label>
                              <Input
                                id="farmer-phone"
                                placeholder="+243 6 12 34 56 78"
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
                                <SelectContent className="admin-theme">
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
                                <SelectContent className="admin-theme">
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
                              {product.price.toFixed(2)} FC / {product.unit} · Stock: {product.quantity}
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

          {/* Showcase Section ("Nos Produits du Moment" visible sur l'accueil) */}
          {activeMenu === "showcase" && (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-foreground">Produits du Moment</h2>
                <p className="text-muted-foreground">Gérez la vitrine "Nos Produits du Moment" affichée sur la page d'accueil</p>
              </div>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Vitrine de l'accueil ({showcaseProducts.length})</CardTitle>
                      <CardDescription>Ces produits sont visibles par tous les visiteurs dans la section "Nos Produits du Moment"</CardDescription>
                    </div>
                    <Dialog open={isAddShowcaseDialogOpen} onOpenChange={setIsAddShowcaseDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="gap-2">
                          <Plus className="h-4 w-4" />
                          Ajouter un produit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="admin-theme max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Mettre un produit en avant</DialogTitle>
                          <DialogDescription>
                            Ce produit apparaîtra dans la section "Nos Produits du Moment" de la page d'accueil.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="showcase-name">Nom du produit *</Label>
                            <Input
                              id="showcase-name"
                              placeholder="Ex: Bananes douces"
                              value={newShowcaseData.name}
                              onChange={(e) => setNewShowcaseData({ ...newShowcaseData, name: e.target.value })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="showcase-category">Catégorie *</Label>
                            <Select
                              value={newShowcaseData.category}
                              onValueChange={(val) => setNewShowcaseData({ ...newShowcaseData, category: val })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Catégorie" />
                              </SelectTrigger>
                              <SelectContent className="admin-theme">
                                {CATEGORIES.map((cat) => (
                                  <SelectItem key={cat.value} value={cat.label}>
                                    {cat.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label>Image du produit</Label>
                            <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed p-4">
                              {showcaseImagePreview ? (
                                <div className="relative aspect-video max-h-48 w-full overflow-hidden rounded-md border">
                                  <img src={showcaseImagePreview} alt="Aperçu" className="h-full w-full object-cover" />
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute right-2 top-2 h-8 w-8"
                                    onClick={() => {
                                      setShowcaseImagePreview(null)
                                      setNewShowcaseData({ ...newShowcaseData, image: "" })
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-muted/50 transition-colors">
                                  <Upload className="mb-2 h-8 w-8" />
                                  <p className="text-sm font-semibold">Cliquez pour télécharger</p>
                                  <p className="text-xs">PNG, JPG ou WebP (max. 2 Mo)</p>
                                  <input type="file" className="hidden" accept="image/*" onChange={handleShowcaseImageChange} />
                                </label>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Sans image, un visuel de remplacement sera généré automatiquement.
                            </p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddShowcaseDialogOpen(false)}>
                            Annuler
                          </Button>
                          <Button onClick={handleAddShowcase}>Mettre en avant</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {showcaseProducts.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-8 text-center">
                      <Star className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-4 text-muted-foreground">Aucun produit en vitrine pour le moment.</p>
                      <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setIsAddShowcaseDialogOpen(true)}>
                        Ajouter le premier produit
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {showcaseProducts.map((item) => (
                        <div key={item.id} className="group relative overflow-hidden rounded-xl border">
                          <div className="relative aspect-[4/3]">
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <p className="font-semibold text-white">{item.name}</p>
                              <p className="text-xs text-white/80">{item.category}</p>
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                            onClick={() => handleDeleteShowcase(item.id, item.name)}
                          >
                            <Trash2 className="h-4 w-4" />
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
                              {order.quantity} unités · {order.totalPrice.toFixed(2)} FC
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

          {/* Payments Section */}
          {activeMenu === "payments" && (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-foreground">Paiements & Commissions</h2>
                <p className="text-muted-foreground">Transactions Mobile Money (M-Pesa / Orange Money) et revenus de la plateforme</p>
              </div>

              {/* Payment Stats */}
              <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <Card className="border-emerald-500/20 bg-emerald-500/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-emerald-500 uppercase tracking-wider">Revenus plateforme (3%)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-emerald-500">{totalCommissions.toFixed(2)} FC</div>
                    <p className="text-xs text-muted-foreground mt-1">Commission sur chaque transaction</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Reversé aux agriculteurs (97%)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalPaidToFarmers.toFixed(2)} FC</div>
                    <p className="text-xs text-muted-foreground mt-1">Versé sur leurs numéros Mobile Money</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{transactions.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Paiements Mobile Money traités</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Toutes les Transactions ({transactions.length})</CardTitle>
                  <CardDescription>Chaque paiement est versé à l'agriculteur (97%), la plateforme perçoit 3%</CardDescription>
                </CardHeader>
                <CardContent>
                  {transactions.length === 0 ? (
                    <p className="text-muted-foreground">Aucune transaction pour le moment</p>
                  ) : (
                    <div className="space-y-3">
                      {transactions.map((txn) => (
                        <div key={txn.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{txn.farmerName}</p>
                              <Badge variant={txn.method === "mpesa" ? "default" : "secondary"}>
                                {txn.method === "mpesa" ? "M-Pesa" : "Orange Money"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Payé par {txn.buyerName} ({txn.buyerPhone}) → {txn.farmerPhone}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                              Réf: {txn.reference}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(txn.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          <div className="text-right text-sm">
                            <p className="font-bold">{txn.amount.toFixed(2)} FC</p>
                            <p className="text-xs text-muted-foreground">Agriculteur : {txn.farmerAmount.toFixed(2)} FC</p>
                            <p className="text-xs font-medium text-emerald-500">Commission : +{txn.commission.toFixed(2)} FC</p>
                          </div>
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
                      <DialogContent className="admin-theme max-w-2xl max-h-[90vh] overflow-y-auto">
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
                                <SelectContent className="admin-theme">
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
                              <SelectContent className="admin-theme">
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

          {/* Account Requests Section */}
          {activeMenu === "requests" && (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-foreground">Demandes de comptes agriculteurs</h2>
                <p className="text-muted-foreground">
                  Confirmez les demandes reçues via la page Contact. Une fois confirmée, l&apos;utilisateur paie les frais de création de {FARMER_ACCOUNT_FEE.toFixed(2).replace(".", ",")} FC pour activer son compte.
                </p>
              </div>

              {/* Stats rapides */}
              <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-amber-500/20 bg-amber-500/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-amber-500 uppercase tracking-wider">En attente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold text-amber-500">
                      {accountRequests.filter((r) => r.status === "pending").length}
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-sky-500/20 bg-sky-500/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-sky-500 uppercase tracking-wider">Confirmées (paiement attendu)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold text-sky-500">
                      {accountRequests.filter((r) => r.status === "approved").length}
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-emerald-500/20 bg-emerald-500/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-emerald-500 uppercase tracking-wider">Comptes créés (payés)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold text-emerald-500">
                      {accountRequests.filter((r) => r.status === "paid").length}
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-emerald-500/20 bg-emerald-500/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-emerald-500 uppercase tracking-wider">Frais de création perçus</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold text-emerald-500">
                      {(accountRequests.filter((r) => r.status === "paid").length * FARMER_ACCOUNT_FEE).toFixed(2).replace(".", ",")} FC
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Demandes ({accountRequests.length})
                    <Badge variant="secondary">
                      {pendingRequestsCount} en attente
                    </Badge>
                  </CardTitle>
                  <CardDescription>Filtrer par statut</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {(["all", "pending", "approved", "paid", "rejected"] as const).map((status) => (
                      <Button
                        key={status}
                        variant={requestStatusFilter === status ? "default" : "outline"}
                        size="sm"
                        onClick={() => setRequestStatusFilter(status)}
                      >
                        {status === "all" ? "Toutes" : ACCOUNT_REQUEST_STATUS_LABELS[status]}
                      </Button>
                    ))}
                  </div>

                  {accountRequests.filter((r) => requestStatusFilter === "all" || r.status === requestStatusFilter).length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Aucune demande</p>
                  ) : (
                    <div className="space-y-3">
                      {accountRequests
                        .filter((r) => requestStatusFilter === "all" || r.status === requestStatusFilter)
                        .map((request) => (
                          <div key={request.id} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className="font-medium">{request.name}</span>
                                  <Badge
                                    variant={
                                      request.status === "pending"
                                        ? "outline"
                                        : request.status === "approved"
                                          ? "default"
                                          : request.status === "paid"
                                            ? "secondary"
                                            : "destructive"
                                    }
                                  >
                                    {ACCOUNT_REQUEST_STATUS_LABELS[request.status]}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{request.email} • {request.phone}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {request.location} • Envoyée le {new Date(request.createdAt).toLocaleDateString("fr-FR")}
                                </p>
                                {request.message && (
                                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2 italic">&quot;{request.message}&quot;</p>
                                )}
                                {request.status === "paid" && request.paymentReference && (
                                  <p className="text-xs text-emerald-500 mt-2">
                                    Payé le {request.paidAt ? new Date(request.paidAt).toLocaleDateString("fr-FR") : "-"} • Réf. <span className="font-mono">{request.paymentReference}</span>
                                  </p>
                                )}
                              </div>

                              {request.status === "pending" && (
                                <div className="flex shrink-0 gap-2">
                                  <Button
                                    size="sm"
                                    className="gap-1"
                                    onClick={() => handleApproveRequest(request.id, request.name)}
                                  >
                                    <Check className="h-4 w-4" />
                                    Confirmer
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="gap-1"
                                    onClick={() => handleRejectRequest(request.id, request.name)}
                                  >
                                    <Ban className="h-4 w-4" />
                                    Rejeter
                                  </Button>
                                </div>
                              )}

                              {request.status === "approved" && (
                                <Badge variant="outline" className="shrink-0 gap-1 border-amber-500/40 text-amber-500">
                                  <Clock className="h-3 w-3" />
                                  Paiement de {FARMER_ACCOUNT_FEE.toFixed(2).replace(".", ",")} FC attendu
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Messages Section */}
          {activeMenu === "messages" && (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-foreground">Messages</h2>
                <p className="text-muted-foreground">Échangez avec les agriculteurs et les acheteurs</p>
              </div>
              <div className="flex h-[calc(100vh-16rem)] min-h-[400px] rounded-xl border bg-card overflow-hidden shadow-sm">
                <div className="w-80 flex-shrink-0 hidden sm:block">
                  <ConversationList
                    conversations={adminConversations}
                    selectedId={selectedConvId}
                    onSelect={setSelectedConvId}
                    currentUserId={user.id}
                  />
                </div>
                <div className="flex-1">
                  <ChatWindow
                    messages={currentMessages}
                    otherParticipant={otherParticipant}
                    currentUserId={user.id}
                    onSendMessage={handleSendMessage}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contact Pro Section */}
          {activeMenu === "contact" && (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-foreground">Contacter un Pro</h2>
                <p className="text-muted-foreground">Sélectionnez un agriculteur pour démarrer une conversation</p>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Agriculteurs ({farmers.length})</CardTitle>
                  <CardDescription>Cliquez sur "Message" pour ouvrir une conversation directe</CardDescription>
                </CardHeader>
                <CardContent>
                  {farmers.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Aucun agriculteur inscrit</p>
                  ) : (
                    <div className="space-y-3">
                      {farmers.map((farmer) => (
                        <div key={farmer.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar>
                              <AvatarImage src={farmer.avatar} />
                              <AvatarFallback>{farmer.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{farmer.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{farmer.location || farmer.email}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="gap-2"
                            onClick={() => handleStartConversation(farmer)}
                          >
                            <MessageSquare className="h-4 w-4 text-primary" />
                            Message
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Profile Section */}
          {activeMenu === "profile" && (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-foreground">Mon Profil</h2>
                <p className="text-muted-foreground">Modifiez vos informations personnelles</p>
              </div>
              <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle>Photo de profil</CardTitle>
                    <CardDescription>Votre avatar visible sur la plateforme</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center gap-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={avatarPreview || undefined} />
                      <AvatarFallback className="text-2xl">{profileData.name.charAt(0).toUpperCase() || "A"}</AvatarFallback>
                    </Avatar>
                    <div className="w-full">
                      <Label htmlFor="admin-avatar" className="sr-only">Changer la photo</Label>
                      <Input id="admin-avatar" type="file" accept="image/*" onChange={handleAvatarChange} />
                      <p className="text-xs text-muted-foreground mt-2 text-center">Max. 2 Mo</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Informations personnelles</CardTitle>
                    <CardDescription>Mettez à jour vos coordonnées et votre description</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="profile-name">Nom complet</Label>
                      <Input
                        id="profile-name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="profile-email">Adresse email</Label>
                      <Input id="profile-email" value={user.email} disabled />
                      <p className="text-xs text-muted-foreground">L'email de connexion ne peut pas être modifié.</p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="profile-phone">Téléphone</Label>
                        <Input
                          id="profile-phone"
                          placeholder="+243 6 12 34 56 78"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="profile-location">Localisation</Label>
                        <Input
                          id="profile-location"
                          placeholder="Région, Ville"
                          value={profileData.location}
                          onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="profile-description">Bio / Description</Label>
                      <textarea
                        id="profile-description"
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Quelques mots à propos de vous..."
                        value={profileData.description}
                        onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
                      />
                    </div>
                    <Button onClick={handleUpdateProfile} className="gap-2">
                      <Save className="h-4 w-4" />
                      Enregistrer les modifications
                    </Button>
                  </CardContent>
                </Card>
              </div>
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
                <Dialog open={!isSecurityUnlocked} onOpenChange={() => { }}>
                  <DialogContent className="admin-theme sm:max-w-md">
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
                          <Input id="current-pw" type={showCurrentPassword ? "text" : "password"} value={securityData.currentPassword} onChange={e => setSecurityData({ ...securityData, currentPassword: e.target.value })} className="pr-10" />
                          <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-pw">Nouveau mot de passe</Label>
                        <div className="relative">
                          <Input id="new-pw" type={showNewPassword ? "text" : "password"} value={securityData.newPassword} onChange={e => setSecurityData({ ...securityData, newPassword: e.target.value })} className="pr-10" />
                          <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-new-pw">Confirmer le nouveau mot de passe</Label>
                        <div className="relative">
                          <Input id="confirm-new-pw" type={showConfirmNewPassword ? "text" : "password"} value={securityData.confirmNewPassword} onChange={e => setSecurityData({ ...securityData, confirmNewPassword: e.target.value })} className="pr-10" />
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
                          <Input id="new-master" type={showNewMasterPassword ? "text" : "password"} value={securityData.newMasterPassword} onChange={e => setSecurityData({ ...securityData, newMasterPassword: e.target.value })} className="pr-10" />
                          <button type="button" onClick={() => setShowNewMasterPassword(!showNewMasterPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                            {showNewMasterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-master">Confirmer le mot de passe maître</Label>
                        <div className="relative">
                          <Input id="confirm-master" type={showConfirmNewMasterPassword ? "text" : "password"} value={securityData.confirmNewMasterPassword} onChange={e => setSecurityData({ ...securityData, confirmNewMasterPassword: e.target.value })} className="pr-10" />
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
        <DialogContent className="admin-theme">
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

    </div>
  )
}
