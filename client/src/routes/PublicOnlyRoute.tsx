import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";

/** Routes (login/signup) that an authenticated user should not see. */
export function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
