import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import {
  ProtectedRoute,
  AdminRoute,
  GuestRoute,
} from "./components/routing/Guards";
import ToastContainer from "./components/ui/Toast";

import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import MembersPage from "./pages/members/MembersPage";
import MemberDetailPage from "./pages/members/MemberDetailPage";
import MemberFormPage from "./pages/members/MemberFormPage";
import MembershipsPage from "./pages/memberships/MembershipsPage";
import TiersPage from "./pages/tiers/TiersPage";
import GiftsPage from "./pages/gifts/GiftsPage";
import NotificationsPage from "./pages/notifications/NotificationsPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Guest only */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Authenticated */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/members" element={<MembersPage />} />
            <Route path="/members/new" element={<MemberFormPage />} />
            <Route path="/members/:id" element={<MemberDetailPage />} />
            <Route path="/gifts" element={<GiftsPage />} />

            {/* Admin only */}
            <Route element={<AdminRoute />}>
              <Route path="/memberships" element={<MembershipsPage />} />
              <Route path="/tiers" element={<TiersPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/templates" element={<NotificationsPage />} />
            </Route>
          </Route>

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </AuthProvider>
  );
}
