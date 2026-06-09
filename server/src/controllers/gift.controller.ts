import { Request, Response } from "express";
import Gift from "../models/Gift";
import GiftRedemption from "../models/GiftRedemption";
import Member from "../models/Member";
import Notification from "../models/Notification";
import { AuthRequest } from "../middlewares/authenticateToken";

export const getGifts = async (req: Request, res: Response): Promise<void> => {
  try {
    const gifts = await Gift.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      message: "Lấy danh sách quà tặng thành công",
      data: gifts.map((g) => ({
        id: g._id,
        giftId: g.giftId,
        giftName: g.giftName,
        requiredPoint: g.requiredPoint,
        quantity: g.quantity,
        description: g.description,
        isActive: g.isActive,
      })),
    });
  } catch {
    res.status(500).json({ success: false, message: "Lỗi server", data: null });
  }
};

export const createGift = async (req: Request, res: Response): Promise<void> => {
  try {
    const { giftId, giftName, requiredPoint, quantity, description } = req.body;
    const existing = await Gift.findOne({ giftId });
    if (existing) {
      res.status(400).json({ success: false, message: "Mã quà đã tồn tại", data: null });
      return;
    }
    const gift = await Gift.create({ giftId, giftName, requiredPoint, quantity, description });
    res.status(201).json({ success: true, message: "Thêm quà tặng thành công", data: gift });
  } catch {
    res.status(500).json({ success: false, message: "Lỗi server", data: null });
  }
};

export const updateGift = async (req: Request, res: Response): Promise<void> => {
  try {
    const gift = await Gift.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!gift) {
      res.status(404).json({ success: false, message: "Không tìm thấy quà tặng", data: null });
      return;
    }
    res.json({ success: true, message: "Cập nhật quà tặng thành công", data: gift });
  } catch {
    res.status(500).json({ success: false, message: "Lỗi server", data: null });
  }
};

export const deleteGift = async (req: Request, res: Response): Promise<void> => {
  try {
    const gift = await Gift.findByIdAndDelete(req.params.id);
    if (!gift) {
      res.status(404).json({ success: false, message: "Không tìm thấy quà tặng", data: null });
      return;
    }
    res.json({ success: true, message: "Xóa quà tặng thành công", data: { id: req.params.id } });
  } catch {
    res.status(500).json({ success: false, message: "Lỗi server", data: null });
  }
};

export const redeemGift = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { memberId, giftId } = req.body;

    const member = await Member.findById(memberId);
    if (!member) {
      res.status(404).json({ success: false, message: "Không tìm thấy thành viên", data: null });
      return;
    }

    const gift = await Gift.findById(giftId);
    if (!gift || !gift.isActive) {
      res.status(404).json({ success: false, message: "Không tìm thấy quà tặng", data: null });
      return;
    }

    if (gift.quantity <= 0) {
      res.status(400).json({
        success: false,
        message: "Quà tặng đã hết số lượng",
        data: { giftId: gift.giftId, giftName: gift.giftName, quantity: 0 },
      });
      return;
    }

    if (member.point < gift.requiredPoint) {
      res.status(400).json({
        success: false,
        message: "Thành viên không đủ điểm để đổi quà",
        data: { currentPoint: member.point, requiredPoint: gift.requiredPoint },
      });
      return;
    }

    const pointBefore = member.point;
    member.point -= gift.requiredPoint;
    await member.save();

    gift.quantity -= 1;
    await gift.save();

    const redemption = await GiftRedemption.create({
      memberId: member._id,
      giftId: gift._id,
      pointUsed: gift.requiredPoint,
      redeemedBy: req.user?.userId,
    });

    // Auto notification
    await Notification.create({
      title: "Đổi quà thành công",
      content: `Bạn đã đổi thành công quà: ${gift.giftName}. Số điểm đã sử dụng: ${gift.requiredPoint}.`,
      targetType: "member",
      targetValue: member._id?.toString(),
      receiverIds: [member._id],
      sentBy: req.user?.userId,
      type: "auto_gift_redeem",
    });

    res.json({
      success: true,
      message: "Đổi quà thành công",
      data: {
        redemptionId: redemption._id,
        member: {
          memberId: member.memberId,
          name: member.name,
          pointBefore,
          pointAfter: member.point,
        },
        gift: {
          giftId: gift.giftId,
          giftName: gift.giftName,
          requiredPoint: gift.requiredPoint,
          quantityAfter: gift.quantity,
        },
        createdAt: redemption.createdAt,
      },
    });
  } catch {
    res.status(500).json({ success: false, message: "Lỗi server", data: null });
  }
};

export const getRedemptionHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const [history, total] = await Promise.all([
      GiftRedemption.find()
        .populate("memberId", "memberId name")
        .populate("giftId", "giftId giftName")
        .populate("redeemedBy", "username role")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      GiftRedemption.countDocuments(),
    ]);

    res.json({
      success: true,
      message: "Lấy lịch sử đổi quà thành công",
      data: {
        history: history.map((h) => {
          const m = h.memberId as unknown as { memberId: string; name: string };
          const g = h.giftId as unknown as { giftId: string; giftName: string };
          const u = h.redeemedBy as unknown as { username: string; role: string };
          return {
            redemptionId: h._id,
            member: m ? { memberId: m.memberId, name: m.name } : null,
            gift: g ? { giftId: g.giftId, giftName: g.giftName } : null,
            pointUsed: h.pointUsed,
            redeemedBy: u ? { username: u.username, role: u.role } : null,
            createdAt: h.createdAt,
          };
        }),
        pagination: { page: pageNum, limit: limitNum, totalItems: total, totalPages: Math.ceil(total / limitNum) },
      },
    });
  } catch {
    res.status(500).json({ success: false, message: "Lỗi server", data: null });
  }
};
