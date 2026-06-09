import { Request, Response } from "express";
import Tier from "../models/Tier";
import Member from "../models/Member";

export const getTiers = async (req: Request, res: Response): Promise<void> => {
  try {
    const tiers = await Tier.find().sort({ minExpense: 1 });
    const tiersWithCount = await Promise.all(
      tiers.map(async (tier) => {
        const count = await Member.countDocuments({ tierId: tier._id });
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
      })
    );
    res.json({ success: true, message: "Lấy danh sách hạng thẻ thành công", data: tiersWithCount });
  } catch {
    res.status(500).json({ success: false, message: "Lỗi server", data: null });
  }
};

export const getTierById = async (req: Request, res: Response): Promise<void> => {
  try {
    const tier = await Tier.findById(req.params.id);
    if (!tier) {
      res.status(404).json({ success: false, message: "Không tìm thấy hạng thẻ", data: null });
      return;
    }
    res.json({ success: true, message: "Lấy thông tin hạng thẻ thành công", data: tier });
  } catch {
    res.status(500).json({ success: false, message: "Lỗi server", data: null });
  }
};

export const createTier = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tierId, tierName, minExpense, maxExpense, obtainPoint, description } = req.body;
    const existing = await Tier.findOne({ tierId });
    if (existing) {
      res.status(400).json({ success: false, message: "Mã hạng thẻ đã tồn tại", data: null });
      return;
    }
    const tier = await Tier.create({ tierId, tierName, minExpense, maxExpense, obtainPoint, description });
    res.status(201).json({ success: true, message: "Thêm hạng thẻ thành công", data: tier });
  } catch {
    res.status(500).json({ success: false, message: "Lỗi server", data: null });
  }
};

export const updateTier = async (req: Request, res: Response): Promise<void> => {
  try {
    const tier = await Tier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!tier) {
      res.status(404).json({ success: false, message: "Không tìm thấy hạng thẻ", data: null });
      return;
    }
    res.json({ success: true, message: "Cập nhật hạng thẻ thành công", data: tier });
  } catch {
    res.status(500).json({ success: false, message: "Lỗi server", data: null });
  }
};

export const deleteTier = async (req: Request, res: Response): Promise<void> => {
  try {
    const tier = await Tier.findByIdAndDelete(req.params.id);
    if (!tier) {
      res.status(404).json({ success: false, message: "Không tìm thấy hạng thẻ", data: null });
      return;
    }
    res.json({ success: true, message: "Xóa hạng thẻ thành công", data: { id: req.params.id } });
  } catch {
    res.status(500).json({ success: false, message: "Lỗi server", data: null });
  }
};

export const getTierStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const tiers = await Tier.find().sort({ minExpense: 1 });
    const totalMembers = await Member.countDocuments();
    const stats = await Promise.all(
      tiers.map(async (tier) => {
        const count = await Member.countDocuments({ tierId: tier._id });
        return {
          tierName: tier.tierName,
          tierId: tier.tierId,
          memberCount: count,
          percentage: totalMembers > 0 ? parseFloat(((count / totalMembers) * 100).toFixed(2)) : 0,
        };
      })
    );
    res.json({ success: true, message: "Thống kê phân bổ hạng thẻ thành công", data: stats });
  } catch {
    res.status(500).json({ success: false, message: "Lỗi server", data: null });
  }
};
