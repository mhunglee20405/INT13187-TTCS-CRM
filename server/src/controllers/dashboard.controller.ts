import { Response } from "express";
import Member from "../models/Member";
import Tier from "../models/Tier";
import Checkin from "../models/Checkin";
import GiftRedemption from "../models/GiftRedemption";
import Notification from "../models/Notification";
import { AuthRequest } from "../middlewares/authenticateToken";

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalMembers,
      newMembersThisMonth,
      newMembersLastMonth,
      checkinsToday,
      checkinsThisMonth,
      absentOver5,
      totalRedemptions,
      tiers,
    ] = await Promise.all([
      Member.countDocuments(),
      Member.countDocuments({ createdAt: { $gte: monthStart } }),
      Member.countDocuments({ createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd } }),
      Checkin.countDocuments({ checkinTime: { $gte: todayStart } }),
      Checkin.countDocuments({ checkinTime: { $gte: monthStart } }),
      Member.countDocuments({ absentDays: { $gt: 5 } }),
      GiftRedemption.countDocuments(),
      Tier.find().sort({ minExpense: 1 }),
    ]);

    // Tier distribution
    const tierStats = await Promise.all(
      tiers.map(async (tier) => {
        const count = await Member.countDocuments({ tierId: tier._id });
        return {
          tierId: tier.tierId,
          tierName: tier.tierName,
          memberCount: count,
          percentage: totalMembers > 0 ? parseFloat(((count / totalMembers) * 100).toFixed(1)) : 0,
        };
      })
    );

    // Revenue this month (members who got membership this month)
    const membersWithMembership = await Member.find({ membershipStartDate: { $gte: monthStart } })
      .populate("currentMembershipId", "urPrice");
    const revenueThisMonth = membersWithMembership.reduce((sum, m) => {
      const ms = m.currentMembershipId as unknown as { urPrice: number } | null;
      return sum + (ms?.urPrice || 0);
    }, 0);

    // Checkins last 7 days
    const checkinTrend = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(todayStart);
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const count = await Checkin.countDocuments({ checkinTime: { $gte: dayStart, $lt: dayEnd } });
      checkinTrend.push({
        date: dayStart.toISOString().split("T")[0],
        count,
      });
    }

    res.json({
      success: true,
      message: "Lấy thống kê dashboard thành công",
      data: {
        overview: {
          totalMembers,
          newMembersThisMonth,
          newMembersLastMonth,
          memberGrowth: newMembersLastMonth > 0
            ? parseFloat((((newMembersThisMonth - newMembersLastMonth) / newMembersLastMonth) * 100).toFixed(1))
            : 100,
          checkinsToday,
          checkinsThisMonth,
          absentOver5,
          totalRedemptions,
          revenueThisMonth,
        },
        tierDistribution: tierStats,
        checkinTrend,
      },
    });
  } catch {
    res.status(500).json({ success: false, message: "Lỗi server", data: null });
  }
};
