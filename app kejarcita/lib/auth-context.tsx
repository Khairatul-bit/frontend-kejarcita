"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type User, getStoredUser, setStoredUser, MOCK_USERS } from "./store"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => { success: boolean; message: string }
  signup: (name: string, email: string, password: string, role: "student" | "teacher", extra?: string) => { success: boolean; message: string }
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = getStoredUser()
    setUser(stored)
    setIsLoading(false)
  }, [])

  function login(email: string, password: string): { success: boolean; message: string } {
    const found = MOCK_USERS.find((u) => u.email === email)
    if (!found) return { success: false, message: "Email tidak ditemukan." }
    if (password.length < 4) return { success: false, message: "Kata sandi salah." }
    setUser(found)
    setStoredUser(found)
    return { success: true, message: "Berhasil masuk!" }
  }

  function signup(
    name: string,
    email: string,
    password: string,
    role: "student" | "teacher",
    extra?: string
  ): { success: boolean; message: string } {
    if (!name || !email || !password) return { success: false, message: "Semua kolom wajib diisi." }
    if (password.length < 6) return { success: false, message: "Kata sandi minimal 6 karakter." }
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      avatar: name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
      ...(role === "student" ? { class: extra || "Kelas 10A" } : { subject: extra || "Umum" }),
    }
    setUser(newUser)
    setStoredUser(newUser)
    return { success: true, message: "Akun berhasil dibuat!" }
  }

  function logout() {
    setUser(null)
    setStoredUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
