import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  subtitle?: string;
  trend?: number;
  color?: "primary" | "emerald" | "amber" | "rose" | "cyan";
  children?: ReactNode;
}

const colorMap = {
  primary: "from-primary-500/20 to-purple-500/20 border-primary-500/20",
  emerald: "from-emerald-500/20 to-teal-500/20 border-emerald-500/20",
  amber: "from-amber-500/20 to-yellow-500/20 border-amber-500/20",
  rose: "from-rose-500/20 to-pink-500/20 border-rose-500/20",
  cyan: "from-cyan-500/20 to-blue-500/20 border-cyan-500/20",
};

const iconColorMap = {
  primary: "bg-primary-500/20 text-primary-400",
  emerald: "bg-emerald-500/20 text-emerald-400",
  amber: "bg-amber-500/20 text-amber-400",
  rose: "bg-rose-500/20 text-rose-400",
  cyan: "bg-cyan-500/20 text-cyan-400",
};

export default function StatsCard({
  title,
  value,
  icon,
  subtitle,
  trend,
  color = "primary",
}: StatsCardProps) {
  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} border rounded-xl p-5 transition-all duration-200 hover:scale-[1.01]`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-400 font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              <span>{trend >= 0 ? "↑" : "↓"}</span>
              <span>{Math.abs(trend)}% so với tháng trước</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${iconColorMap[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
