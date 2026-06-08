import { useState, useEffect } from "react"
import type { ReactNode } from "react"
import { AuthContext, type User } from "./auth"
import type { FormSettings } from "@/types/form"
import { API, apiCall } from "@/constants/api"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    // Apply dark mode to document when user changes
    if (user?.dark_mode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [user?.dark_mode])

  const checkAuth = async () => {
    try {
      setLoading(true)
      const res = await apiCall<User>(API.AUTH.ME)

      if (res.ok && res.data) {
        setUser(res.data)
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

      const res = await apiCall(API.AUTH.LOGIN, {
        method: "POST",
        body: JSON.stringify({ username, password }),
      })

      if (res.ok) {
        await checkAuth()
        return true
      } else {
        setError(res.error || "Login failed")
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

      const res = await apiCall(API.AUTH.SIGNUP, {
        method: "POST",
        body: JSON.stringify({ email, username, password }),
      })

      if (res.ok) {
        return true
      } else {
        setError(res.error || "Signup failed")
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
      await apiCall(API.AUTH.LOGOUT, { method: "POST" })
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      setUser(null)
      setError(null)
      setLoading(false)
    }
  }

  const updatePreferences = async (
    updates: { dark_mode?: boolean; defaultFormSettings?: FormSettings }
  ) => {
    if (!user) return false

    try {
      const res = await apiCall(API.AUTH.PREFERENCES, {
        method: "PUT",
        body: JSON.stringify(updates),
      })

      if (res.ok) {
        setUser((prev) =>
          prev
            ? {
                ...prev,
                dark_mode: updates.dark_mode ?? prev.dark_mode,
                defaultFormSettings:
                  updates.defaultFormSettings ?? prev.defaultFormSettings,
              }
            : prev
        )
        return true
      }
    } catch (err) {
      console.error("Failed to update preferences:", err)
    }

    return false
  }

  const toggleDarkMode = async () => {
    if (!user) return

    const newDarkMode = !user.dark_mode
    await updatePreferences({ dark_mode: newDarkMode })
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, logout, checkAuth, toggleDarkMode, updatePreferences }}>
      {children}
    </AuthContext.Provider>
  )
}
