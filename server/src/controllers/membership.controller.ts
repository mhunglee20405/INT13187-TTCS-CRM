import { Request, Response } from "express";
import Membership from "../models/Membership";

export const getMemberships = async (req: Request, res: Response): Promise<void> => {
  try {
    const memberships = await Membership.find().sort({ urPrice: 1 });
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
  } catch {
    res.status(500).json({ success: false, message: "Lỗi server", data: null });
  }
};

export const getMembershipById = async (req: Request, res: Response): Promise<void> => {
  try {
    const membership = await Membership.findById(req.params.id);
    if (!membership) {
      res.status(404).json({ success: false, message: "Không tìm thấy gói tập", data: null });
      return;
    }
    res.json({ success: true, message: "Lấy thông tin gói tập thành công", data: membership });
  } catch {
    res.status(500).json({ success: false, message: "Lỗi server", data: null });
  }
};

export const createMembership = async (req: Request, res: Response): Promise<void> => {
  try {
    const { membershipId, membershipName, durationMonths, originalPrice, urPrice, rewardPoint, description } = req.body;

    const existing = await Membership.findOne({ membershipId });
    if (existing) {
      res.status(400).json({ success: false, message: "Mã gói tập đã tồn tại", data: null });
      return;
    }

    const membership = await Membership.create({
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
  } catch {
    res.status(500).json({ success: false, message: "Lỗi server", data: null });
  }
};

export const updateMembership = async (req: Request, res: Response): Promise<void> => {
  try {
    const membership = await Membership.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!membership) {
      res.status(404).json({ success: false, message: "Không tìm thấy gói tập", data: null });
      return;
    }
    res.json({ success: true, message: "Cập nhật gói tập thành công", data: membership });
  } catch {
    res.status(500).json({ success: false, message: "Lỗi server", data: null });
  }
};

export const deleteMembership = async (req: Request, res: Response): Promise<void> => {
  try {
    const membership = await Membership.findByIdAndDelete(req.params.id);
    if (!membership) {
      res.status(404).json({ success: false, message: "Không tìm thấy gói tập", data: null });
      return;
    }
    res.json({ success: true, message: "Xóa gói tập thành công", data: { id: req.params.id } });
  } catch {
    res.status(500).json({ success: false, message: "Lỗi server", data: null });
  }
};
