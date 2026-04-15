import { Navigate } from "react-router-dom"
import { useAuth } from "./context/useAuth"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f1f3f4]">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  return user ? children : <Navigate to="/" replace />
}