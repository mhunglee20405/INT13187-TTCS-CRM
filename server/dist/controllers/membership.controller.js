"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMembership = exports.updateMembership = exports.createMembership = exports.getMembershipById = exports.getMemberships = void 0;
const Membership_1 = __importDefault(require("../models/Membership"));
const getMemberships = async (req, res) => {
    try {
        const memberships = await Membership_1.default.find().sort({ urPrice: 1 });
        res.json({
            success: true,
            message: "Lấy danh sách gói tập thành công",
            data: memberships.map((m) => ({
                id: m._id,
                membershipId: m.membershipId,
                membershipName: m.membershipName,
                durationMonths: m.durationMonths,
                originalPrice: m.originalPrice,
                urPrice: m.urPrice,
                rewardPoint: m.rewardPoint,
                description: m.description,
                isActive: m.isActive,
            })),
        });
    }
    catch {
        res.status(500).json({ success: false, message: "Lỗi server", data: null });
    }
};
exports.getMemberships = getMemberships;
const getMembershipById = async (req, res) => {
    try {
        const membership = await Membership_1.default.findById(req.params.id);
        if (!membership) {
            res.status(404).json({ success: false, message: "Không tìm thấy gói tập", data: null });
            return;
        }
        res.json({ success: true, message: "Lấy thông tin gói tập thành công", data: membership });
    }
    catch {
        res.status(500).json({ success: false, message: "Lỗi server", data: null });
    }
};
exports.getMembershipById = getMembershipById;
const createMembership = async (req, res) => {
    try {
        const { membershipId, membershipName, durationMonths, originalPrice, urPrice, rewardPoint, description } = req.body;
        const existing = await Membership_1.default.findOne({ membershipId });
        if (existing) {
            res.status(400).json({ success: false, message: "Mã gói tập đã tồn tại", data: null });
            return;
        }
        const membership = await Membership_1.default.create({
            membershipId,
            membershipName,
            durationMonths,
            originalPrice,
            urPrice,
            rewardPoint: rewardPoint ?? Math.floor(urPrice / 100000),
            description,
        });
        res.status(201).json({
            success: true,
            message: "Thêm gói tập thành công",
            data: {
                id: membership._id,
                membershipId: membership.membershipId,
                membershipName: membership.membershipName,
                durationMonths: membership.durationMonths,
                originalPrice: membership.originalPrice,
                urPrice: membership.urPrice,
                rewardPoint: membership.rewardPoint,
                description: membership.description,
                isActive: membership.isActive,
            },
        });
    }
    catch {
        res.status(500).json({ success: false, message: "Lỗi server", data: null });
    }
};
exports.createMembership = createMembership;
const updateMembership = async (req, res) => {
    try {
        const membership = await Membership_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!membership) {
            res.status(404).json({ success: false, message: "Không tìm thấy gói tập", data: null });
            return;
        }
        res.json({ success: true, message: "Cập nhật gói tập thành công", data: membership });
    }
    catch {
        res.status(500).json({ success: false, message: "Lỗi server", data: null });
    }
};
exports.updateMembership = updateMembership;
const deleteMembership = async (req, res) => {
    try {
        const membership = await Membership_1.default.findByIdAndDelete(req.params.id);
        if (!membership) {
            res.status(404).json({ success: false, message: "Không tìm thấy gói tập", data: null });
            return;
        }
        res.json({ success: true, message: "Xóa gói tập thành công", data: { id: req.params.id } });
    }
    catch {
        res.status(500).json({ success: false, message: "Lỗi server", data: null });
    }
};
exports.deleteMembership = deleteMembership;
