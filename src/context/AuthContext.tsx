import { useState, useEffect } from "react"
import type { ReactNode } from "react"
import { AuthContext, type User } from "./auth"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      setLoading(true)
      const res = await fetch("http://localhost:5000/me", {
        credentials: "include",
      })

      if (res.ok) {
        const userData = await res.json()
        setUser(userData)
        setError(null)
      } else {
        setUser(null)
      }
    } catch (err) {
      setUser(null)
      console.error("Auth check failed:", err)
    } finally {
      setLoading(false)
    }
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      })

      if (res.ok) {
        await checkAuth()
        return true
      } else {
        const data = await res.json()
        setError(data.error || "Login failed")
        return false
      }
    } catch (err) {
      setError("Network error")
      console.error("Login error:", err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const signup = async (
    email: string,
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, username, password }),
      })

      if (res.ok) {
        return true
      } else {
        const data = await res.json()
        setError(data.error || "Signup failed")
        return false
      }
    } catch (err) {
      setError("Network error")
      console.error("Signup error:", err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      await fetch("http://localhost:5000/logout", {
        method: "POST",
        credentials: "include",
      })
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      setUser(null)
      setError(null)
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}
