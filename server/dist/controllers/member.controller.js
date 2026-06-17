"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMembership = exports.checkinMember = exports.deleteMember = exports.updateMember = exports.createMember = exports.getMemberById = exports.getMembers = void 0;
const Member_1 = __importDefault(require("../models/Member"));
const Tier_1 = __importDefault(require("../models/Tier"));
const Membership_1 = __importDefault(require("../models/Membership"));
const Checkin_1 = __importDefault(require("../models/Checkin"));
// Helper to determine tier based on totalExpense
const determineTier = async (totalExpense) => {
    const tiers = await Tier_1.default.find().sort({ minExpense: 1 });
    let matchedTier = tiers[0];
    for (const tier of tiers) {
        if (totalExpense >= tier.minExpense &&
            (tier.maxExpense === null || totalExpense <= tier.maxExpense)) {
            matchedTier = tier;
        }
    }
    return matchedTier;
};
// Helper generate memberId
const generateMemberId = async () => {
    const count = await Member_1.default.countDocuments();
    return `MB${String(count + 1).padStart(3, "0")}`;
};
const expireMembershipIfNeeded = async (member) => {
    if (!member || !member.currentMembershipId || !member.membershipEndDate) {
        return false;
    }
    const now = new Date();
    if (member.membershipEndDate > now) {
        return false;
    }
    member.currentMembershipId = null;
    member.membershipStartDate = null;
    member.membershipEndDate = null;
    await member.save();
    return true;
};
const getMembers = async (req, res) => {
    try {
        const { keyword = "", page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const searchQuery = keyword
            ? {
                $or: [
                    { name: { $regex: keyword, $options: "i" } },
                    { phone: { $regex: keyword, $options: "i" } },
                    { mail: { $regex: keyword, $options: "i" } },
                    { memberId: { $regex: keyword, $options: "i" } },
                ],
            }
            : {};
        const [members, total] = await Promise.all([
            Member_1.default.find(searchQuery)
                .populate("tierId", "tierId tierName")
                .populate("currentMembershipId", "membershipId membershipName")
                .skip(skip)
                .limit(limitNum)
                .sort({ createdAt: -1 }),
            Member_1.default.countDocuments(searchQuery),
        ]);
        for (const member of members) {
            await expireMembershipIfNeeded(member);
        }
        const formatted = members.map((m) => {
            const tier = m.tierId;
            const membership = m.currentMembershipId;
            return {
                id: m._id,
                memberId: m.memberId,
                name: m.name,
                phone: m.phone,
                birthday: m.birthday,
                mail: m.mail,
                point: m.point,
                obtainPoint: m.obtainPoint,
                absentDays: m.absentDays,
                totalExpense: m.totalExpense,
                tier: tier ? { tierId: tier.tierId, tierName: tier.tierName } : null,
                currentMembership: membership
                    ? {
                        membershipId: membership.membershipId,
                        membershipName: membership.membershipName,
                    }
                    : null,
                membershipStartDate: m.membershipStartDate,
                membershipEndDate: m.membershipEndDate,
                lastCheckinDate: m.lastCheckinDate,
                createdAt: m.createdAt,
            };
        });
        res.json({
            success: true,
            message: "Lấy danh sách thành viên thành công",
            data: {
                members: formatted,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    totalItems: total,
                    totalPages: Math.ceil(total / limitNum),
                },
            },
        });
    }
    catch {
        res.status(500).json({ success: false, message: "Lỗi server", data: null });
    }
};
exports.getMembers = getMembers;
const getMemberById = async (req, res) => {
    try {
        const member = await Member_1.default.findById(req.params.id)
            .populate("tierId", "tierId tierName")
            .populate("currentMembershipId", "membershipId membershipName durationMonths urPrice");
        if (!member) {
            res
                .status(404)
                .json({
                success: false,
                message: "Không tìm thấy thành viên",
                data: null,
            });
            return;
        }
        await expireMembershipIfNeeded(member);
        const tier = member.tierId;
        const membership = member.currentMembershipId;
        res.json({
            success: true,
            message: "Lấy thông tin thành viên thành công",
            data: {
                id: member._id,
                memberId: member.memberId,
                name: member.name,
                phone: member.phone,
                birthday: member.birthday,
                mail: member.mail,
                point: member.point,
                obtainPoint: member.obtainPoint,
                absentDays: member.absentDays,
                totalExpense: member.totalExpense,
                tier: tier ? { tierId: tier.tierId, tierName: tier.tierName } : null,
                currentMembership: membership
                    ? {
                        membershipId: membership.membershipId,
                        membershipName: membership.membershipName,
                        durationMonths: membership.durationMonths,
                        urPrice: membership.urPrice,
                    }
                    : null,
                membershipHistory: member.membershipHistory,
                membershipStartDate: member.membershipStartDate,
                membershipEndDate: member.membershipEndDate,
                lastCheckinDate: member.lastCheckinDate,
            },
        });
    }
    catch {
        res.status(500).json({ success: false, message: "Lỗi server", data: null });
    }
};
exports.getMemberById = getMemberById;
const createMember = async (req, res) => {
    try {
        const { name, phone, birthday, mail } = req.body;
        const phoneRegex = /^\d{10}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!name ||
            !phone ||
            !phoneRegex.test(phone) ||
            !mail ||
            !emailRegex.test(mail)) {
            res.status(400).json({
                success: false,
                message: "Tên hoặc số điện thoại của bạn không hợp lệ!",
                errors: [
                    !name && { field: "name", message: "Họ tên không được để trống" },
                    !phone && {
                        field: "phone",
                        message: "Số điện thoại không được để trống",
                    },
                    phone &&
                        !phoneRegex.test(phone) && {
                        field: "phone",
                        message: "Số điện thoại phải bao gồm đúng 10 chữ số",
                    },
                    mail &&
                        !emailRegex.test(mail) && {
                        field: "mail",
                        message: "Email không đúng định dạng",
                    },
                ].filter(Boolean),
            });
            return;
        }
        // Check duplicate
        const existing = await Member_1.default.findOne({
            $or: [{ phone }, ...(mail ? [{ mail }] : [])],
        });
        if (existing) {
            res.status(400).json({
                success: false,
                message: "Email hoặc số điện thoại đã tồn tại",
                data: null,
            });
            return;
        }
        // Get Bronze tier as default
        const bronzeTier = await Tier_1.default.findOne({ tierId: "TIER_BRONZE" });
        if (!bronzeTier) {
            res
                .status(500)
                .json({
                success: false,
                message: "Không tìm thấy hạng Bronze mặc định",
                data: null,
            });
            return;
        }
        const memberId = await generateMemberId();
        const member = await Member_1.default.create({
            memberId,
            name,
            phone,
            birthday: birthday || null,
            mail: mail || null,
            point: 0,
            obtainPoint: 0,
            absentDays: 0,
            totalExpense: 0,
            tierId: bronzeTier._id,
        });
        res.status(201).json({
            success: true,
            message: "Thêm thành viên thành công",
            data: {
                id: member._id,
                memberId: member.memberId,
                name: member.name,
                phone: member.phone,
                birthday: member.birthday,
                mail: member.mail,
                point: member.point,
                obtainPoint: member.obtainPoint,
                absentDays: member.absentDays,
                totalExpense: member.totalExpense,
                tier: { tierId: bronzeTier.tierId, tierName: bronzeTier.tierName },
            },
        });
    }
    catch {
        res.status(500).json({ success: false, message: "Lỗi server", data: null });
    }
};
exports.createMember = createMember;
const updateMember = async (req, res) => {
    try {
        const { name, phone, birthday, mail } = req.body;
        const member = await Member_1.default.findById(req.params.id);
        if (!member) {
            res
                .status(404)
                .json({
                success: false,
                message: "Không tìm thấy thành viên",
                data: null,
            });
            return;
        }
        // Check duplicate phone/mail for other members
        if (phone || mail) {
            const conditions = [];
            if (phone)
                conditions.push({ phone });
            if (mail)
                conditions.push({ mail });
            const existing = await Member_1.default.findOne({
                $or: conditions,
                _id: { $ne: req.params.id },
            });
            if (existing) {
                res.status(400).json({
                    success: false,
                    message: "Email hoặc số điện thoại đã tồn tại",
                    data: null,
                });
                return;
            }
        }
        if (name)
            member.name = name;
        if (phone)
            member.phone = phone;
        if (birthday !== undefined)
            member.birthday = birthday;
        if (mail !== undefined)
            member.mail = mail;
        await member.save();
        res.json({
            success: true,
            message: "Cập nhật thông tin thành viên thành công",
            data: {
                id: member._id,
                memberId: member.memberId,
                name: member.name,
                phone: member.phone,
                birthday: member.birthday,
                mail: member.mail,
            },
        });
    }
    catch {
        res.status(500).json({ success: false, message: "Lỗi server", data: null });
    }
};
exports.updateMember = updateMember;
const deleteMember = async (req, res) => {
    try {
        const member = await Member_1.default.findByIdAndDelete(req.params.id);
        if (!member) {
            res
                .status(404)
                .json({
                success: false,
                message: "Không tìm thấy thành viên",
                data: null,
            });
            return;
        }
        res.json({
            success: true,
            message: "Xóa thành viên thành công",
            data: { id: req.params.id },
        });
    }
    catch {
        res.status(500).json({ success: false, message: "Lỗi server", data: null });
    }
};
exports.deleteMember = deleteMember;
const checkinMember = async (req, res) => {
    try {
        const member = await Member_1.default.findById(req.params.id);
        if (!member) {
            res
                .status(404)
                .json({
                success: false,
                message: "Không tìm thấy thành viên",
                data: null,
            });
            return;
        }
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
        // Check if point already added today
        const existingCheckin = await Checkin_1.default.findOne({
            memberId: member._id,
            checkinTime: { $gte: todayStart, $lt: todayEnd },
            isPointAdded: true,
        });
        let isPointAdded = false;
        let pointAdded = 0;
        if (!existingCheckin) {
            isPointAdded = true;
            pointAdded = 1;
            member.point += 1;
        }
        member.absentDays = 0;
        member.lastCheckinDate = now;
        await member.save();
        await Checkin_1.default.create({
            memberId: member._id,
            checkinTime: now,
            isPointAdded,
            createdBy: req.user?.userId,
        });
        const message = isPointAdded
            ? "Check-in thành công. Thành viên được cộng 1 điểm"
            : "Check-in thành công. Thành viên đã được cộng điểm trong hôm nay";
        res.json({
            success: true,
            message,
            data: {
                memberId: member.memberId,
                name: member.name,
                checkinTime: now,
                isPointAdded,
                pointAdded,
                currentPoint: member.point,
                absentDays: member.absentDays,
            },
        });
    }
    catch {
        res.status(500).json({ success: false, message: "Lỗi server", data: null });
    }
};
exports.checkinMember = checkinMember;
const addMembership = async (req, res) => {
    try {
        const { membershipId } = req.body;
        const member = await Member_1.default.findById(req.params.id).populate("tierId", "tierId tierName");
        if (!member) {
            res
                .status(404)
                .json({
                success: false,
                message: "Không tìm thấy thành viên",
                data: null,
            });
            return;
        }
        const membership = await Membership_1.default.findById(membershipId);
        if (!membership) {
            res
                .status(404)
                .json({
                success: false,
                message: "Không tìm thấy gói tập",
                data: null,
            });
            return;
        }
        const pointBefore = member.point;
        const obtainPointBefore = member.obtainPoint;
        const totalExpenseBefore = member.totalExpense;
        member.point += membership.rewardPoint;
        member.obtainPoint += membership.rewardPoint;
        member.totalExpense += membership.urPrice;
        member.currentMembershipId = membership._id;
        const now = new Date();
        member.membershipHistory ?? (member.membershipHistory = []);
        member.membershipHistory.push({
            membershipId: membership._id,
            price: membership.urPrice,
            purchasedAt: now,
        });
        const endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + membership.durationMonths);
        member.membershipStartDate = now;
        member.membershipEndDate = endDate;
        // Update tier
        const oldTier = member.tierId;
        const newTier = await determineTier(member.totalExpense);
        member.tierId = newTier._id;
        await member.save();
        res.json({
            success: true,
            message: "Nâng cấp gói tập thành công",
            data: {
                member: {
                    memberId: member.memberId,
                    name: member.name,
                    membershipHistory: member.membershipHistory,
                    pointBefore,
                    pointAfter: member.point,
                    obtainPointBefore,
                    obtainPointAfter: member.obtainPoint,
                    totalExpenseBefore,
                    totalExpenseAfter: member.totalExpense,
                },
                membership: {
                    membershipId: membership.membershipId,
                    membershipName: membership.membershipName,
                    durationMonths: membership.durationMonths,
                    urPrice: membership.urPrice,
                    rewardPoint: membership.rewardPoint,
                },
                tier: {
                    oldTier: oldTier?.tierName || "",
                    newTier: newTier.tierName,
                },
                membershipDate: {
                    startDate: member.membershipStartDate,
                    endDate: member.membershipEndDate,
                },
            },
        });
    }
    catch {
        res.status(500).json({ success: false, message: "Lỗi server", data: null });
    }
};
exports.addMembership = addMembership;
