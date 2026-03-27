"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "./types"
import { mockUsers } from "./mock-data"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
}

interface RegisterData {
  email: string
  password: string
  name: string
  role: "farmer" | "buyer"
  phone?: string
  location?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("agrimarche_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const storedUsers = localStorage.getItem("agrimarche_users")
    // Pour les comptes mock sans mot de passe, on leur attribue "password" par défaut
    const baseUsers: User[] = mockUsers.map((u) => ({ ...u, password: u.password ?? "password" }))
    const users: User[] = storedUsers ? JSON.parse(storedUsers) : baseUsers

    const foundUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase())

    if (!foundUser) {
      return { success: false, error: "Email ou mot de passe incorrect" }
    }

    const userPassword = foundUser.password ?? "password"
    if (password !== userPassword) {
      return { success: false, error: "Email ou mot de passe incorrect" }
    }

    setUser(foundUser)
    localStorage.setItem("agrimarche_user", JSON.stringify(foundUser))
    return { success: true }
  }

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const storedUsers = localStorage.getItem("agrimarche_users")
    // Initialise la liste avec les comptes mock (mot de passe par défaut: "password")
    const baseUsers: User[] = mockUsers.map((u) => ({ ...u, password: u.password ?? "password" }))
    const users: User[] = storedUsers ? JSON.parse(storedUsers) : [...baseUsers]

    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, error: "Cet email est déjà utilisé" }
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email: data.email,
      name: data.name,
      role: data.role,
      password: data.password,
      phone: data.phone,
      location: data.location,
      createdAt: new Date().toISOString().split("T")[0],
    }

    users.push(newUser)
    localStorage.setItem("agrimarche_users", JSON.stringify(users))
    setUser(newUser)
    localStorage.setItem("agrimarche_user", JSON.stringify(newUser))

    return { success: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("agrimarche_user")
  }

  const updateUser = (updates: Partial<User>) => {
    if (!user) return
    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    localStorage.setItem("agrimarche_user", JSON.stringify(updatedUser))

    // Also update in the global users list
    const storedUsers = localStorage.getItem("agrimarche_users")
    if (storedUsers) {
      const users: User[] = JSON.parse(storedUsers)
      const updatedUsers = users.map((u) => (u.id === user.id ? updatedUser : u))
      localStorage.setItem("agrimarche_users", JSON.stringify(updatedUsers))
    }
  }

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "Utilisateur non connecté" }

    const storedUsers = localStorage.getItem("agrimarche_users")
    const baseUsers: User[] = mockUsers.map((u) => ({ ...u, password: u.password ?? "password" }))
    const users: User[] = storedUsers ? JSON.parse(storedUsers) : baseUsers

    const foundUser = users.find((u) => u.id === user.id)
    const userPassword = foundUser?.password ?? "password"

    if (currentPassword !== userPassword) {
      return { success: false, error: "Le mot de passe actuel est incorrect" }
    }

    if (newPassword.length < 6) {
      return { success: false, error: "Le nouveau mot de passe doit contenir au moins 6 caractères" }
    }

    const updatedUser = { ...user, password: newPassword }
    const updatedUsers = users.map((u) => (u.id === user.id ? { ...u, password: newPassword } : u))

    localStorage.setItem("agrimarche_users", JSON.stringify(updatedUsers))
    localStorage.setItem("agrimarche_user", JSON.stringify(updatedUser))
    setUser(updatedUser)

    return { success: true }
  }

  return <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser, changePassword }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
