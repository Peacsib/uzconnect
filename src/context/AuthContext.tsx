"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useSession, signIn, signOut, SessionProvider } from "next-auth/react"
import { AuthUser, mockUsers } from "@/utils/mockData"

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

function AuthInnerProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("wrl_user")
      if (stored) {
        try { return JSON.parse(stored) } catch (_) {}
      }
    }
    return null
  })

  useEffect(() => {
    if (session?.user) {
      const u: AuthUser = {
        id: (session.user as any).id || "u1",
        name: session.user.name || "User",
        email: session.user.email || "",
        role: ((session.user as any).role || "student") as any,
        avatar: session.user.image || undefined,
      }
      setUser(u)
      if (typeof window !== "undefined") {
        localStorage.setItem("wrl_user", JSON.stringify(u))
      }
    } else if (status === "unauthenticated" && !localStorage.getItem("wrl_user")) {
      setUser(null)
    }
  }, [session, status])

  const login = useCallback(async (username: string, password: string) => {
    try {
      const res = await signIn("credentials", {
        email: username,
        password,
        redirect: false,
      })

      if (res?.error) {
        const matched = Object.values(mockUsers).find(
          (m) =>
            (m.email.toLowerCase() === username.toLowerCase() ||
             (username.toUpperCase() === "R2421428" && m.role === "student")) &&
            m.password === password
        )

        if (matched) {
          const u: AuthUser = {
            id: matched.id,
            name: matched.name,
            email: matched.email,
            role: matched.role,
          }
          setUser(u)
          localStorage.setItem("wrl_user", JSON.stringify(u))
          return true
        }

        return false
      }

      return true
    } catch (e) {
      console.error("Login failed:", e)
      return false
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      setUser(null)
      if (typeof window !== "undefined") {
        localStorage.removeItem("wrl_user")
      }
      await signOut({ redirect: false })
    } catch (e) {
      console.error("Logout error:", e)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        isLoading: status === "loading",
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthInnerProvider>{children}</AuthInnerProvider>
    </SessionProvider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
