import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    fetch("http://localhost:5000/me", {
      credentials: "include",
    })
      .then(res => {
        if (res.ok) setAuthorized(true)
        else setAuthorized(false)
      })
  }, [])

  if (authorized === null) return null

  return authorized ? children : <Navigate to="/" />
}