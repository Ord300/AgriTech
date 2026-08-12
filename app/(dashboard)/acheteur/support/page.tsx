"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useData } from "@/lib/data-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BuyerSidebar, BuyerMobileMenu } from "@/components/buyer/buyer-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import type { SupportTicketType } from "@/lib/types"
import { Plus, MessageSquare, AlertCircle, HelpCircle, Lightbulb, Bug, ArrowLeft, Clock, CheckCircle, AlertCircleIcon, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SupportPage() {
  const { user, isLoading } = useAuth()
  const { supportTickets, createSupportTicket, addMessageToTicket } = useData()
  const router = useRouter()
  const { toast } = useToast()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [ticketFilter, setTicketFilter] = useState<"all" | "open" | "in_progress" | "closed">("all")
  
  const [formData, setFormData] = useState({
    type: "question" as SupportTicketType,
    subject: "",
    description: "",
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "buyer")) {
      router.push("/connexion")
    }
  }, [isLoading, user, router])

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Chargement...</div>
  }

  if (!user || user.role !== "buyer") {
    return null
  }

  const userTickets = supportTickets.filter((t) => t.buyerId === user.id)
  const selectedTicket = selectedTicketId ? supportTickets.find((t) => t.id === selectedTicketId) : null

  const handleCreateTicket = () => {
    if (!formData.subject.trim() || !formData.description.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive",
      })
      return
    }

    createSupportTicket({
      buyerId: user.id,
      buyerName: user.name,
      buyerEmail: user.email || "",
      type: formData.type,
      subject: formData.subject,
      description: formData.description,
      status: "open",
    })

    setFormData({
      type: "question",
      subject: "",
      description: "",
    })
    setIsCreateDialogOpen(false)
    toast({
      title: "Ticket créé",
      description: "Votre ticket de support a été créé. L'administrateur vous répondra bientôt.",
    })
  }

  const handleSendMessage = () => {
    if (!selectedTicket || !newMessage.trim()) return

    addMessageToTicket(selectedTicket.id, {
      senderName: user.name,
      senderId: user.id,
      content: newMessage,
    })

    setNewMessage("")
    toast({
      title: "Message envoyé",
      description: "Votre message a été ajouté au ticket.",
    })
  }

  const getTicketIcon = (type: SupportTicketType) => {
    switch (type) {
      case "complaint":
        return <AlertCircle className="h-4 w-4" />
      case "question":
        return <HelpCircle className="h-4 w-4" />
      case "feedback":
        return <Lightbulb className="h-4 w-4" />
      case "bug_report":
        return <Bug className="h-4 w-4" />
    }
  }

  const getTicketTypeLabel = (type: SupportTicketType) => {
    switch (type) {
      case "complaint":
        return "Plainte"
      case "question":
        return "Question"
      case "feedback":
        return "Avis"
      case "bug_report":
        return "Signalement"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "destructive"
      case "in_progress":
        return "default"
      case "closed":
        return "secondary"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open":
        return "Ouvert"
      case "in_progress":
        return "En cours"
      case "closed":
        return "Fermé"
    }
  }

  const getTypeColor = (type: SupportTicketType) => {
    switch (type) {
      case "complaint":
        return "text-red-600 bg-red-50 border-red-200"
      case "question":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "feedback":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "bug_report":
        return "text-orange-600 bg-orange-50 border-orange-200"
    }
  }

  if (selectedTicket) {
    return (
      <div className="min-h-screen bg-background">
        <BuyerSidebar />
        <BuyerMobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        <div className="relative md:ml-64 flex flex-col bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto px-4 py-6">
          <Button
            variant="ghost"
            className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => setSelectedTicketId(null)}
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la liste
          </Button>

          {/* Header */}
          <Card className="mb-6 border-l-4 border-l-primary shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {getTicketIcon(selectedTicket.type)}
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{selectedTicket.subject}</CardTitle>
                      <CardDescription className="mt-1">
                        Ticket #{selectedTicket.id.slice(-6).toUpperCase()}
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 text-right">
                  <Badge variant={getStatusColor(selectedTicket.status)}>
                    {getStatusLabel(selectedTicket.status)}
                  </Badge>
                  <Badge variant="outline">{getTicketTypeLabel(selectedTicket.type)}</Badge>
                </div>
              </div>
              <Separator className="mt-4" />
              <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(selectedTicket.createdAt).toLocaleDateString("fr-FR")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>{selectedTicket.messages.length} message{selectedTicket.messages.length > 1 ? "s" : ""}</span>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Messages Container */}
          <div className="space-y-4">
            {/* Description initiale */}
            <Card className="bg-muted/50 border-muted">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex-none">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                      {user.name.charAt(0)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">{user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(selectedTicket.createdAt).toLocaleString("fr-FR")}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">{selectedTicket.messages[0]?.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Autres messages */}
            {selectedTicket.messages.slice(1).map((message, idx) => (
              <Card key={message.id} className={`border-l-4 ${message.senderId === user.id ? "border-l-primary bg-primary/5" : "border-l-green-500 bg-green-50/30"}`}>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="flex-none">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        message.senderId === user.id 
                          ? "bg-primary/20 text-primary" 
                          : "bg-green-200 text-green-700"
                      }`}>
                        {message.senderName.charAt(0)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{message.senderName}</span>
                          {message.senderId !== user.id && (
                            <Badge variant="outline" className="text-xs">Support</Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(message.timestamp).toLocaleString("fr-FR")}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed break-words">{message.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Message Input */}
          {selectedTicket.status !== "closed" && (
            <Card className="mt-6 border-t-2 border-t-primary/20">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Label htmlFor="reply" className="text-base font-semibold">Ajouter une réponse</Label>
                  <div className="flex gap-3">
                    <Textarea
                      id="reply"
                      placeholder="Tapez votre message ici..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows={3}
                      className="flex-1 resize-none"
                    />
                    <div className="flex flex-col gap-2 self-end">
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="gap-2"
                        size="sm"
                      >
                        <Send className="h-4 w-4" />
                        Envoyer
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Appuyez sur Entrée + Maj pour une nouvelle ligne</p>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedTicket.status === "closed" && (
            <Card className="mt-6 bg-secondary/10 border-secondary/20">
              <CardContent className="p-6 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-secondary" />
                <div>
                  <p className="font-medium text-sm">Ticket fermé</p>
                  <p className="text-xs text-muted-foreground">Ce ticket est fermé et les réponses sont désactivées.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <BuyerSidebar />
      <BuyerMobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <div className="relative md:ml-64 flex flex-col bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground">Support</h1>
              <p className="text-muted-foreground mt-1">Gérez vos tickets de support et communiquez avec notre équipe</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2 shadow-lg">
                  <Plus className="h-5 w-5" />
                  Créer un ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Créer un ticket de support</DialogTitle>
                  <DialogDescription>
                    Nous sommes là pour vous aider. Décrivez votre problème ou question ci-dessous.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-5 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type" className="text-base font-semibold">Type de demande</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, type: value as SupportTicketType })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="question">
                          <div className="flex items-center gap-2">
                            <HelpCircle className="h-4 w-4" />
                            <span>Question</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="complaint">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            <span>Plainte</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="feedback">
                          <div className="flex items-center gap-2">
                            <Lightbulb className="h-4 w-4" />
                            <span>Avis / Suggestion</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="bug_report">
                          <div className="flex items-center gap-2">
                            <Bug className="h-4 w-4" />
                            <span>Signaler un problème</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.type === "question" && "Posez une question sur l'utilisation de la plateforme"}
                      {formData.type === "complaint" && "Signalez un problème ou une insatisfaction"}
                      {formData.type === "feedback" && "Partagez vos suggestions pour améliorer le service"}
                      {formData.type === "bug_report" && "Reportez un dysfonctionnement technique"}
                    </p>
                  </div>
                  <Separator />
                  <div className="grid gap-2">
                    <Label htmlFor="subject" className="text-base font-semibold">Sujet</Label>
                    <Input
                      id="subject"
                      placeholder="Titre court et descriptif..."
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="text-base"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description" className="text-base font-semibold">Description détaillée</Label>
                    <Textarea
                      id="description"
                      placeholder="Décrivez votre situation en détail pour nous aider au mieux..."
                      rows={5}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="resize-none"
                    />
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreateTicket}>
                    Créer le ticket
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-50/50 border-blue-200/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-3xl font-bold text-foreground">{userTickets.length}</p>
                  </div>
                  <MessageSquare className="h-10 w-10 text-blue-500/30" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-red-50 to-red-50/50 border-red-200/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Ouvert</p>
                    <p className="text-3xl font-bold text-red-600">{userTickets.filter(t => t.status === "open").length}</p>
                  </div>
                  <AlertCircle className="h-10 w-10 text-red-500/30" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-50 to-amber-50/50 border-amber-200/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">En cours</p>
                    <p className="text-3xl font-bold text-amber-600">{userTickets.filter(t => t.status === "in_progress").length}</p>
                  </div>
                  <Clock className="h-10 w-10 text-amber-500/30" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-50/50 border-green-200/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Fermé</p>
                    <p className="text-3xl font-bold text-green-600">{userTickets.filter(t => t.status === "closed").length}</p>
                  </div>
                  <CheckCircle className="h-10 w-10 text-green-500/30" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tickets Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Mes tickets</CardTitle>
                <CardDescription>Cliquez sur un ticket pour voir les détails</CardDescription>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              {(["all", "open", "in_progress", "closed"] as const).map((status) => (
                <Button
                  key={status}
                  variant={ticketFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTicketFilter(status)}
                >
                  {status === "all" ? "Tous" : status === "open" ? "Ouvert" : status === "in_progress" ? "En cours" : "Fermé"}
                </Button>
              ))}
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            {userTickets.filter(t =>
              ticketFilter === "all" || t.status === ticketFilter
            ).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <MessageSquare className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun ticket</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  {ticketFilter === "all" 
                    ? "Vous n'avez pas encore créé de ticket. Créez-en un pour nous contacter!"
                    : `Aucun ticket ${ticketFilter === "open" ? "ouvert" : ticketFilter === "in_progress" ? "en cours" : "fermé"}`}
                </p>
                {ticketFilter === "all" && (
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Créer mon premier ticket
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                )}
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {userTickets.filter(t =>
                  ticketFilter === "all" || t.status === ticketFilter
                ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).map((ticket) => (
                  <Card
                    key={ticket.id}
                    className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50 h-full"
                    onClick={() => setSelectedTicketId(ticket.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className={`p-2 rounded-lg border ${getTypeColor(ticket.type)}`}>
                          {getTicketIcon(ticket.type)}
                        </div>
                        <Badge 
                          variant={ticket.status === "open" ? "destructive" : ticket.status === "in_progress" ? "default" : "secondary"}
                          className="shrink-0"
                        >
                          {getStatusLabel(ticket.status)}
                        </Badge>
                      </div>
                      <div className="mb-3">
                        <h3 className="font-semibold line-clamp-2 mb-1">{ticket.subject}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{ticket.description}</p>
                      </div>
                      <Separator className="my-3" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{ticket.messages.length}</span>
                        </div>
                        <span>{new Date(ticket.updatedAt).toLocaleDateString("fr-FR")}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}
