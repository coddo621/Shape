import { createContext } from "react"
import type { FormSettings } from "@/types/form"

export interface User {
  id: number
  username: string
  email: string
  dark_mode: boolean
  defaultFormSettings?: FormSettings
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<boolean>
  signup: (email: string, username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  toggleDarkMode: () => Promise<void>
  updatePreferences: (updates: { dark_mode?: boolean; defaultFormSettings?: FormSettings }) => Promise<boolean>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
