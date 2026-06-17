"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTierStatistics = exports.deleteTier = exports.updateTier = exports.createTier = exports.getTierById = exports.getTiers = void 0;
const Tier_1 = __importDefault(require("../models/Tier"));
const Member_1 = __importDefault(require("../models/Member"));
const getTiers = async (req, res) => {
    try {
        const tiers = await Tier_1.default.find().sort({ minExpense: 1 });
        const tiersWithCount = await Promise.all(tiers.map(async (tier) => {
            const count = await Member_1.default.countDocuments({ tierId: tier._id });
            return {
                id: tier._id,
                tierId: tier.tierId,
                tierName: tier.tierName,
                minExpense: tier.minExpense,
                maxExpense: tier.maxExpense,
                obtainPoint: tier.obtainPoint,
                description: tier.description,
                memberCount: count,
            };
        }));
        res.json({ success: true, message: "Lấy danh sách hạng thẻ thành công", data: tiersWithCount });
    }
    catch {
        res.status(500).json({ success: false, message: "Lỗi server", data: null });
    }
};
exports.getTiers = getTiers;
const getTierById = async (req, res) => {
    try {
        const tier = await Tier_1.default.findById(req.params.id);
        if (!tier) {
            res.status(404).json({ success: false, message: "Không tìm thấy hạng thẻ", data: null });
            return;
        }
        res.json({ success: true, message: "Lấy thông tin hạng thẻ thành công", data: tier });
    }
    catch {
        res.status(500).json({ success: false, message: "Lỗi server", data: null });
    }
};
exports.getTierById = getTierById;
const createTier = async (req, res) => {
    try {
        const { tierId, tierName, minExpense, maxExpense, obtainPoint, description } = req.body;
        const existing = await Tier_1.default.findOne({ tierId });
        if (existing) {
            res.status(400).json({ success: false, message: "Mã hạng thẻ đã tồn tại", data: null });
            return;
        }
        const tier = await Tier_1.default.create({ tierId, tierName, minExpense, maxExpense, obtainPoint, description });
        res.status(201).json({ success: true, message: "Thêm hạng thẻ thành công", data: tier });
    }
    catch {
        res.status(500).json({ success: false, message: "Lỗi server", data: null });
    }
};
exports.createTier = createTier;
const updateTier = async (req, res) => {
    try {
        const tier = await Tier_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!tier) {
            res.status(404).json({ success: false, message: "Không tìm thấy hạng thẻ", data: null });
            return;
        }
        res.json({ success: true, message: "Cập nhật hạng thẻ thành công", data: tier });
    }
    catch {
        res.status(500).json({ success: false, message: "Lỗi server", data: null });
    }
};
exports.updateTier = updateTier;
const deleteTier = async (req, res) => {
    try {
        const tier = await Tier_1.default.findByIdAndDelete(req.params.id);
        if (!tier) {
            res.status(404).json({ success: false, message: "Không tìm thấy hạng thẻ", data: null });
            return;
        }
        res.json({ success: true, message: "Xóa hạng thẻ thành công", data: { id: req.params.id } });
    }
    catch {
        res.status(500).json({ success: false, message: "Lỗi server", data: null });
    }
};
exports.deleteTier = deleteTier;
const getTierStatistics = async (req, res) => {
    try {
        const tiers = await Tier_1.default.find().sort({ minExpense: 1 });
        const totalMembers = await Member_1.default.countDocuments();
        const stats = await Promise.all(tiers.map(async (tier) => {
            const count = await Member_1.default.countDocuments({ tierId: tier._id });
            return {
                tierName: tier.tierName,
                tierId: tier.tierId,
                memberCount: count,
                percentage: totalMembers > 0 ? parseFloat(((count / totalMembers) * 100).toFixed(2)) : 0,
            };
        }));
        res.json({ success: true, message: "Thống kê phân bổ hạng thẻ thành công", data: stats });
    }
    catch {
        res.status(500).json({ success: false, message: "Lỗi server", data: null });
    }
};
exports.getTierStatistics = getTierStatistics;
