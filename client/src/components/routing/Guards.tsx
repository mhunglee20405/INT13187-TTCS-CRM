import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext"; // Thêm một nốt ../
import LoadingSpinner from "../ui/LoadingSpinner";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-dark-900"><LoadingSpinner size="lg" text="Đang kiểm tra đăng nhập..." /></div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export function AdminRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export function GuestRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
