import { Response } from "express";
import Notification from "../models/Notification";
import Member from "../models/Member";
import { AuthRequest } from "../middlewares/authenticateToken";

export const sendNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, content, targetType, targetValue } = req.body;

    let receiverIds: string[] = [];

    if (targetType === "all") {
      const members = await Member.find({}, "_id");
      receiverIds = members.map((m) => m._id?.toString() || "");
    } else if (targetType === "tier" && targetValue) {
      const { default: Tier } = await import("../models/Tier");
      const tier = await Tier.findOne({ tierId: targetValue });
      if (tier) {
        const members = await Member.find({ tierId: tier._id }, "_id");
        receiverIds = members.map((m) => m._id?.toString() || "");
      }
    } else if (targetType === "member" && targetValue) {
      receiverIds = [targetValue];
    } else if (targetType === "absent_over_5_days") {
      const members = await Member.find({ absentDays: { $gt: 5 } }, "_id");
      receiverIds = members.map((m) => m._id?.toString() || "");
    }

    const notification = await Notification.create({
      title,
      content,
      targetType,
      targetValue: targetValue || null,
      receiverIds,
      sentBy: req.user?.userId,
      type: "manual",
    });

    res.json({
      success: true,
      message: "Gửi thông báo thành công",
      data: {
        notificationId: notification._id,
        title: notification.title,
        targetType: notification.targetType,
        targetValue: notification.targetValue,
        receiverCount: receiverIds.length,
        createdAt: notification.createdAt,
      },
    });
  } catch {
    res.status(500).json({ success: false, message: "Lỗi server", data: null });
  }
};

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const [notifications, total] = await Promise.all([
      Notification.find()
        .populate("sentBy", "username role")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Notification.countDocuments(),
    ]);

    res.json({
      success: true,
      message: "Lấy lịch sử gửi thông báo thành công",
      data: {
        notifications: notifications.map((n) => {
          const user = n.sentBy as unknown as { username: string; role: string };
          return {
            notificationId: n._id,
            title: n.title,
            content: n.content,
            targetType: n.targetType,
            targetValue: n.targetValue,
            receiverCount: n.receiverIds.length,
            type: n.type,
            sentBy: user ? { username: user.username, role: user.role } : null,
            createdAt: n.createdAt,
          };
        }),
        pagination: { page: pageNum, limit: limitNum, totalItems: total, totalPages: Math.ceil(total / limitNum) },
      },
    });
  } catch {
    res.status(500).json({ success: false, message: "Lỗi server", data: null });
  }
};
