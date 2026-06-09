// Shared TypeScript types across the app

export interface User {
  id: string;
  username: string;
  email: string;
  role: "admin" | "receptionist";
}

export interface Tier {
  id: string;
  tierId: string;
  tierName: string;
  minExpense: number;
  maxExpense: number | null;
  obtainPoint: number;
  description?: string;
  memberCount?: number;
}

export interface Membership {
  id: string;
  membershipId: string;
  membershipName: string;
  durationMonths: number;
  originalPrice: number;
  urPrice: number;
  rewardPoint: number;
  description?: string;
  isActive: boolean;
}

export interface Member {
  id: string;
  memberId: string;
  name: string;
  phone: string;
  birthday?: string;
  mail?: string;
  point: number;
  obtainPoint: number;
  absentDays: number;
  totalExpense: number;
  tier?: { tierId: string; tierName: string };
  currentMembership?: { membershipId: string; membershipName: string; durationMonths?: number; urPrice?: number };
  membershipStartDate?: string;
  membershipEndDate?: string;
  lastCheckinDate?: string;
  createdAt?: string;
}

export interface Gift {
  id: string;
  giftId: string;
  giftName: string;
  requiredPoint: number;
  quantity: number;
  description?: string;
  isActive: boolean;
}

export interface GiftRedemption {
  redemptionId: string;
  member: { memberId: string; name: string };
  gift: { giftId: string; giftName: string };
  pointUsed: number;
  redeemedBy: { username: string; role: string };
  createdAt: string;
}

export interface Notification {
  notificationId: string;
  title: string;
  content: string;
  targetType: "all" | "tier" | "member" | "absent_over_5_days";
  targetValue?: string;
  receiverCount: number;
  type?: string;
  sentBy?: { username: string; role: string };
  createdAt: string;
}

export interface NotificationTemplate {
  id: string;
  templateName: string;
  title: string;
  content: string;
  createdAt?: string;
}

export interface DashboardStats {
  overview: {
    totalMembers: number;
    newMembersThisMonth: number;
    newMembersLastMonth: number;
    memberGrowth: number;
    checkinsToday: number;
    checkinsThisMonth: number;
    absentOver5: number;
    totalRedemptions: number;
    revenueThisMonth: number;
  };
  tierDistribution: {
    tierId: string;
    tierName: string;
    memberCount: number;
    percentage: number;
  }[];
  checkinTrend: { date: string; count: number }[];
}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
