import { Response } from "express";
import Notification from "../models/Notification";
import Member from "../models/Member";
import { AuthRequest } from "../middlewares/authenticateToken";

export const sendNotification = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
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

export const getNotifications = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
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

    const memberIds = notifications
      .filter((n) => n.targetType === "member" && n.targetValue)
      .map((n) => n.targetValue as string)
      .filter((id) => /^[a-fA-F0-9]{24}$/.test(id)); // Đảm bảo đúng định dạng ObjectId

    const tierIds = notifications
      .filter((n) => n.targetType === "tier" && n.targetValue)
      .map((n) => n.targetValue as string);

    const members = await Member.find({ _id: { $in: memberIds } }, "_id name");
    const { default: Tier } = await import("../models/Tier");
    const tiers = await Tier.find(
      { tierId: { $in: tierIds } },
      "tierId tierName",
    );

    // Tạo Map để tra cứu siêu tốc
    const memberMap = new Map(members.map((m) => [m._id.toString(), m.name]));
    const tierMap = new Map(tiers.map((t) => [t.tierId, t.tierName]));
    // --- KẾT THÚC XỬ LÝ ID ---

    res.json({
      success: true,
      message: "Lấy lịch sử gửi thông báo thành công",
      data: {
        notifications: notifications.map((n) => {
          const user = n.sentBy as unknown as {
            username: string;
            role: string;
          };

          // Phân loại tên hiển thị rõ ràng dựa theo yêu cầu của bạn
          let targetName = "";
          if (n.targetType === "all") {
            targetName = "All";
          } else if (n.targetType === "absent_over_5_days") {
            targetName = "Vắng > 5 ngày";
          } else if (n.targetType === "tier") {
            const tName = tierMap.get(n.targetValue || "");
            targetName = tName
              ? `Hạng thẻ: ${tName}`
              : `Hạng thẻ ẩn (${n.targetValue})`;
          } else if (n.targetType === "member") {
            const mName = memberMap.get(n.targetValue || "");
            targetName = mName ? mName : "Thành viên (đã xóa)";
          } else {
            targetName = n.targetType;
          }

          return {
            notificationId: n._id,
            title: n.title,
            content: n.content,
            targetType: n.targetType,
            targetValue: n.targetValue,
            targetName: targetName,
            receiverCount: n.receiverIds.length,
            type: n.type,
            sentBy: user ? { username: user.username, role: user.role } : null,
            createdAt: n.createdAt,
          };
        }),
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalItems: total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch {
    res.status(500).json({ success: false, message: "Lỗi server", data: null });
  }
};
