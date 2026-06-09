import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: "📊", adminOnly: false },
  { to: "/members", label: "Thành viên", icon: "👥", adminOnly: false },
  { to: "/memberships", label: "Gói tập", icon: "🏋️", adminOnly: true },
  { to: "/tiers", label: "Hạng thẻ", icon: "🏆", adminOnly: true },
  { to: "/gifts", label: "Quà tặng", icon: "🎁", adminOnly: true },
  { to: "/notifications", label: "Thông báo", icon: "🔔", adminOnly: true },
  // { to: "/templates", label: "Mẫu thông báo", icon: "📝", adminOnly: true },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const filteredNav = navItems.filter((item) => !item.adminOnly || isAdmin());

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-dark-800 border-r border-white/10 flex flex-col z-30">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center text-lg font-bold shadow-lg shadow-primary-500/30">
            💪
          </div>
          <div>
            <h1 className="text-lg font-bold text-gradient">GymPro</h1>
            <p className="text-xs text-gray-500">Quản lý phòng tập</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.username}</p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role === "admin" ? "Quản trị viên" : "Lễ tân"}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full btn-secondary btn-sm flex items-center justify-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
          id="logout-btn"
        >
          <span>🚪</span>
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
