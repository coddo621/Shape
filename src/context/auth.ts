import { createContext } from "react"

export interface User {
  id: number
  username: string
  email: string
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<boolean>
  signup: (email: string, username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
