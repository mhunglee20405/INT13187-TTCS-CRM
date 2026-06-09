export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
};

export const formatDate = (date?: string | Date | null): string => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export const formatDateTime = (date?: string | Date | null): string => {
  if (!date) return "—";
  return new Date(date).toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getTierColor = (tierName?: string): string => {
  switch (tierName?.toLowerCase()) {
    case "bronze": return "badge-bronze";
    case "silver": return "badge-silver";
    case "gold": return "badge-gold";
    case "diamond": return "badge-diamond";
    default: return "bg-gray-700 text-gray-300 border border-gray-600";
  }
};

export const getTierIcon = (tierName?: string): string => {
  switch (tierName?.toLowerCase()) {
    case "bronze": return "🥉";
    case "silver": return "🥈";
    case "gold": return "🥇";
    case "diamond": return "💎";
    default: return "🏅";
  }
};

export const getMembershipColor = (name?: string): string => {
  switch (name?.toLowerCase()) {
    case "classic": return "text-blue-400";
    case "plus": return "text-purple-400";
    case "royal": return "text-amber-400";
    case "signature": return "text-rose-400";
    default: return "text-gray-400";
  }
};
