"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const Member_1 = __importDefault(require("../models/Member"));
const Tier_1 = __importDefault(require("../models/Tier"));
const Checkin_1 = __importDefault(require("../models/Checkin"));
const GiftRedemption_1 = __importDefault(require("../models/GiftRedemption"));
const getDashboardStats = async (req, res) => {
    try {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
        const [totalMembers, newMembersThisMonth, newMembersLastMonth, checkinsToday, checkinsThisMonth, absentOver5, totalRedemptions, tiers,] = await Promise.all([
            Member_1.default.countDocuments(),
            Member_1.default.countDocuments({ createdAt: { $gte: monthStart } }),
            Member_1.default.countDocuments({ createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd } }),
            Checkin_1.default.countDocuments({ checkinTime: { $gte: todayStart } }),
            Checkin_1.default.countDocuments({ checkinTime: { $gte: monthStart } }),
            Member_1.default.countDocuments({ absentDays: { $gt: 5 } }),
            GiftRedemption_1.default.countDocuments(),
            Tier_1.default.find().sort({ minExpense: 1 }),
        ]);
        // Tier distribution
        const tierStats = await Promise.all(tiers.map(async (tier) => {
            const count = await Member_1.default.countDocuments({ tierId: tier._id });
            return {
                tierId: tier.tierId,
                tierName: tier.tierName,
                memberCount: count,
                percentage: totalMembers > 0 ? parseFloat(((count / totalMembers) * 100).toFixed(1)) : 0,
            };
        }));
        // Revenue this month (members who got membership this month)
        const revenueResult = await Member_1.default.aggregate([
            {
                $unwind: "$membershipHistory",
            },
            {
                $match: {
                    "membershipHistory.purchasedAt": {
                        $gte: monthStart,
                        $lt: monthEnd,
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: "$membershipHistory.price",
                    },
                },
            },
        ]);
        const revenueThisMonth = revenueResult[0]?.totalRevenue || 0;
        // Checkins last 7 days
        const checkinTrend = [];
        for (let i = 6; i >= 0; i--) {
            const dayStart = new Date(todayStart);
            dayStart.setDate(dayStart.getDate() - i);
            const dayEnd = new Date(dayStart);
            dayEnd.setDate(dayEnd.getDate() + 1);
            const count = await Checkin_1.default.countDocuments({ checkinTime: { $gte: dayStart, $lt: dayEnd } });
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
    }
    catch {
        res.status(500).json({ success: false, message: "Lỗi server", data: null });
    }
};
exports.getDashboardStats = getDashboardStats;
