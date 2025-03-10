import { useAuthStore } from "@/stores/authStore"
import { Navigate, useLocation } from "react-router-dom"

interface AuthRouteProps {
  children: React.ReactNode
}

export default function AuthRoute({ children }: AuthRouteProps) {
  const token = useAuthStore((state) => state.token)
  const location = useLocation()

  // TODO: check if token is expired
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
