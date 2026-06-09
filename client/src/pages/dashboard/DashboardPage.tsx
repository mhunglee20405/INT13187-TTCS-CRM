import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import Layout from "../../components/layout/Layout";
import StatsCard from "../../components/ui/StatsCard";
import { PageLoader } from "../../components/ui/LoadingSpinner";
import { dashboardApi } from "../../api";
import { DashboardStats } from "../../types";
import { formatCurrency } from "../../utils";

const TIER_COLORS: Record<string, string> = {
  Bronze: "#cd7f32",
  Silver: "#c0c0c0",
  Gold: "#ffd700",
  Diamond: "#b9f2ff",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getStats()
      .then((res) => setStats(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout title="Dashboard"><PageLoader /></Layout>;
  if (!stats) return null;

  const { overview, tierDistribution, checkinTrend } = stats;

  return (
    <Layout title="Dashboard" subtitle="Tổng quan hệ thống phòng tập">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Tổng thành viên"
          value={overview.totalMembers.toLocaleString()}
          icon="👥"
          subtitle={`+${overview.newMembersThisMonth} tháng này`}
          trend={overview.memberGrowth}
          color="primary"
        />
        <StatsCard
          title="Check-in hôm nay"
          value={overview.checkinsToday.toLocaleString()}
          icon="✅"
          subtitle={`${overview.checkinsThisMonth} lượt tháng này`}
          color="emerald"
        />
        <StatsCard
          title="Vắng > 5 ngày"
          value={overview.absentOver5.toLocaleString()}
          icon="⚠️"
          subtitle="Thành viên cần nhắc nhở"
          color="amber"
        />
        <StatsCard
          title="Doanh thu tháng này"
          value={formatCurrency(overview.revenueThisMonth)}
          icon="💰"
          subtitle={`${overview.totalRedemptions} lượt đổi quà`}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Check-in Trend Chart */}
        <div className="xl:col-span-2 card">
          <h3 className="text-base font-semibold text-white mb-4">📈 Lượt check-in 7 ngày qua</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={checkinTrend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                tickFormatter={(v) => {
                  const d = new Date(v);
                  return `${d.getDate()}/${d.getMonth() + 1}`;
                }}
              />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e1e35", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }}
                labelFormatter={(v) => {
                  const d = new Date(v);
                  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
                }}
              />
              <Bar dataKey="count" fill="url(#barGrad)" radius={[4, 4, 0, 0]} name="Lượt check-in" />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#4338ca" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tier Distribution */}
        <div className="card">
          <h3 className="text-base font-semibold text-white mb-4">🏆 Phân bổ hạng thẻ</h3>
          {tierDistribution.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={tierDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="memberCount"
                    nameKey="tierName"
                  >
                    {tierDistribution.map((entry) => (
                      <Cell key={entry.tierId} fill={TIER_COLORS[entry.tierName] || "#6366f1"} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e1e35", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {tierDistribution.map((t) => (
                  <div key={t.tierId} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: TIER_COLORS[t.tierName] || "#6366f1" }} />
                      <span className="text-gray-400">{t.tierName}</span>
                    </div>
                    <span className="text-white font-medium">{t.memberCount} ({t.percentage}%)</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">Chưa có dữ liệu</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 card">
        <h3 className="text-base font-semibold text-white mb-4">⚡ Truy cập nhanh</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: "➕", label: "Thêm thành viên", href: "/members/new" },
            { icon: "✅", label: "Check-in", href: "/members?action=checkin" },
            { icon: "🏋️", label: "Nâng cấp gói", href: "/members" },
            { icon: "🎁", label: "Đổi quà", href: "/gifts" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary-500/30 transition-all duration-200 group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
              <span className="text-xs text-gray-400 group-hover:text-white transition-colors text-center">{item.label}</span>
            </a>
          ))}
        </div>
      </div>
    </Layout>
  );
}
