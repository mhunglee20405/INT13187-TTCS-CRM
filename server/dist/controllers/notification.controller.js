"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotifications = exports.sendNotification = void 0;
require("dotenv/config");
const nodemailer_1 = __importDefault(require("nodemailer"));
const Notification_1 = __importDefault(require("../models/Notification"));
const Member_1 = __importDefault(require("../models/Member"));
// ==========================================
// CẤU HÌNH GỬI MAIL GMAIL SMTP
// ==========================================
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});
// ==========================================
// CÁC FIELD CẦN LẤY TỪ MEMBER
// Quan trọng: model Member của bạn dùng field "mail"
// ==========================================
const MEMBER_SELECT_FIELDS = "_id memberId name mail email Email gmail Gmail absentDays tierId";
// ==========================================
// KIỂM TRA OBJECT ID MONGODB
// ==========================================
const isMongoObjectId = (id) => {
    return /^[a-fA-F0-9]{24}$/.test(id);
};
// ==========================================
// KIỂM TRA EMAIL HỢP LỆ
// ==========================================
const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
// ==========================================
// CHỐNG LỖI HTML INJECTION CƠ BẢN
// ==========================================
const escapeHtml = (text) => {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};
// ==========================================
// GỬI THÔNG BÁO + GỬI EMAIL THẬT
// ==========================================
const sendNotification = async (req, res) => {
    try {
        const { title, content, targetType, targetValue } = req.body;
        console.log("=== LỆNH GỬI THÔNG BÁO TỪ FE ===");
        console.log("Tiêu đề:", title);
        console.log("Nội dung:", content);
        console.log("Loại đối tượng targetType:", targetType);
        console.log("Giá trị targetValue:", targetValue);
        // ==========================================
        // 0. VALIDATE DỮ LIỆU ĐẦU VÀO
        // ==========================================
        if (!title || !content || !targetType) {
            res.status(400).json({
                success: false,
                message: "Thiếu title, content hoặc targetType",
                data: null,
            });
            return;
        }
        if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
            console.error("❌ Thiếu MAIL_USER hoặc MAIL_PASS trong file .env");
            res.status(500).json({
                success: false,
                message: "Server chưa cấu hình tài khoản gửi email",
                data: null,
            });
            return;
        }
        let receiverIds = [];
        let targetMembers = [];
        // ==========================================
        // 1. LẤY DANH SÁCH THÀNH VIÊN THEO targetType
        // ==========================================
        if (targetType === "all") {
            targetMembers = await Member_1.default.find({}, MEMBER_SELECT_FIELDS);
        }
        else if (targetType === "tier" && targetValue) {
            const { default: Tier } = await Promise.resolve().then(() => __importStar(require("../models/Tier")));
            const tierValue = String(targetValue);
            const tierConditions = [{ tierId: tierValue }];
            if (isMongoObjectId(tierValue)) {
                tierConditions.push({ _id: tierValue });
            }
            const tier = await Tier.findOne({
                $or: tierConditions,
            });
            if (tier) {
                targetMembers = await Member_1.default.find({ tierId: tier._id }, MEMBER_SELECT_FIELDS);
            }
        }
        else if (targetType === "member" && targetValue) {
            const memberValue = String(targetValue);
            const memberConditions = [{ memberId: memberValue }];
            if (isMongoObjectId(memberValue)) {
                memberConditions.push({ _id: memberValue });
            }
            targetMembers = await Member_1.default.find({
                $or: memberConditions,
            }, MEMBER_SELECT_FIELDS);
        }
        else if (targetType === "absent_over_5_days") {
            targetMembers = await Member_1.default.find({ absentDays: { $gt: 5 } }, MEMBER_SELECT_FIELDS);
        }
        receiverIds = targetMembers
            .map((m) => m._id?.toString() || "")
            .filter(Boolean);
        console.log(`Tìm thấy ${targetMembers.length} thành viên phù hợp trong database.`);
        console.log("DEBUG targetMembers:", targetMembers.map((m) => m.toObject()));
        // ==========================================
        // 2. LƯU LỊCH SỬ THÔNG BÁO VÀO DATABASE
        // ==========================================
        const notification = await Notification_1.default.create({
            title,
            content,
            targetType,
            targetValue: targetValue || null,
            receiverIds,
            sentBy: req.user?.userId,
            type: "manual",
        });
        // ==========================================
        // 3. LẤY DANH SÁCH EMAIL TỪ MEMBER
        // Model Member của bạn dùng field "mail"
        // ==========================================
        const emailList = [];
        targetMembers.forEach((m) => {
            const possibleEmail = m.mail || m.email || m.Email || m.gmail || m.Gmail;
            if (possibleEmail &&
                typeof possibleEmail === "string" &&
                isValidEmail(possibleEmail.trim())) {
                emailList.push(possibleEmail.trim());
            }
        });
        const uniqueEmailList = [...new Set(emailList)];
        console.log("Danh sách Email thực tế sẽ nhận thư:", uniqueEmailList);
        // ==========================================
        // 4. GỬI EMAIL THẬT BẰNG NODEMAILER
        // ==========================================
        let emailSent = false;
        let emailMessageId = null;
        if (uniqueEmailList.length > 0) {
            const titleText = String(title);
            const contentText = String(content);
            const safeTitle = escapeHtml(titleText);
            const safeContent = escapeHtml(contentText).replace(/\n/g, "<br/>");
            const mailOptions = {
                from: `"Hệ thống Quản lý" <${process.env.MAIL_USER}>`,
                // Mail hệ thống nhận bản gốc.
                // Người nhận thật nằm trong BCC để không thấy email của nhau.
                to: process.env.MAIL_USER,
                // Danh sách email thật sẽ nhận thư.
                bcc: uniqueEmailList,
                subject: `[Thông báo] ${titleText}`,
                html: `
          <div style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #e0e0e0;
            border-radius: 12px;
            background-color: #ffffff;
          ">
            <div style="
              background-color: #4f46e5;
              padding: 15px;
              border-radius: 8px 8px 0 0;
              text-align: center;
            ">
              <h2 style="
                color: #ffffff;
                margin: 0;
                font-size: 20px;
              ">
                THÔNG BÁO MỚI
              </h2>
            </div>

            <div style="padding: 20px 10px; color: #333333;">
              <p style="
                font-size: 16px;
                font-weight: bold;
                color: #111827;
                margin-bottom: 15px;
              ">
                Tiêu đề: ${safeTitle}
              </p>

              <div style="
                font-size: 14px;
                line-height: 1.6;
                background-color: #f9fafb;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #4f46e5;
                white-space: pre-wrap;
              ">
                ${safeContent}
              </div>

              <p style="
                font-size: 12px;
                color: #6b7280;
                margin-top: 25px;
                text-align: center;
                border-top: 1px solid #f3f4f6;
                padding-top: 15px;
              ">
                Đây là email tự động từ hệ thống quản lý thành viên.
                Vui lòng không phản hồi lại email này.
              </p>
            </div>
          </div>
        `,
            };
            const info = await transporter.sendMail(mailOptions);
            emailSent = true;
            emailMessageId = info.messageId;
            console.log("✅ Gửi Email thật thành công");
            console.log("Message ID:", info.messageId);
            console.log("Response:", info.response);
        }
        else {
            console.log("⚠️ Không gửi Email vì danh sách email trống hoặc email không hợp lệ.");
        }
        // ==========================================
        // 5. TRẢ RESPONSE VỀ FRONTEND
        // ==========================================
        res.json({
            success: true,
            message: emailSent
                ? "Gửi thông báo và Email thành công"
                : "Đã lưu thông báo nhưng không gửi Email vì không có email hợp lệ",
            data: {
                notificationId: notification._id,
                title: notification.title,
                targetType: notification.targetType,
                targetValue: notification.targetValue,
                receiverCount: receiverIds.length,
                emailReceiverCount: uniqueEmailList.length,
                emailSent,
                emailMessageId,
                createdAt: notification.createdAt,
            },
        });
    }
    catch (error) {
        console.error("❌ Lỗi crash hàm sendNotification:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi gửi thông báo hoặc email",
            data: null,
        });
    }
};
exports.sendNotification = sendNotification;
// ==========================================
// LẤY LỊCH SỬ GỬI THÔNG BÁO
// ==========================================
const getNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const [notifications, total] = await Promise.all([
            Notification_1.default.find()
                .populate("sentBy", "username role")
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum),
            Notification_1.default.countDocuments(),
        ]);
        const memberTargetValues = notifications
            .filter((n) => n.targetType === "member" && n.targetValue)
            .map((n) => String(n.targetValue));
        const memberObjectIds = memberTargetValues.filter((id) => isMongoObjectId(id));
        const memberCustomIds = memberTargetValues;
        const tierIds = notifications
            .filter((n) => n.targetType === "tier" && n.targetValue)
            .map((n) => String(n.targetValue));
        const [members, tiers] = await Promise.all([
            Member_1.default.find({
                $or: [
                    { _id: { $in: memberObjectIds } },
                    { memberId: { $in: memberCustomIds } },
                ],
            }, "_id memberId name"),
            Promise.resolve().then(() => __importStar(require("../models/Tier"))).then(async ({ default: Tier }) => {
                const tierObjectIds = tierIds.filter((id) => isMongoObjectId(id));
                return Tier.find({
                    $or: [
                        { tierId: { $in: tierIds } },
                        { _id: { $in: tierObjectIds } },
                    ],
                }, "_id tierId tierName");
            }),
        ]);
        const memberMap = new Map();
        members.forEach((m) => {
            if (m._id) {
                memberMap.set(m._id.toString(), m.name);
            }
            if (m.memberId) {
                memberMap.set(m.memberId.toString(), m.name);
            }
        });
        const tierMap = new Map();
        tiers.forEach((t) => {
            if (t.tierId) {
                tierMap.set(t.tierId.toString(), t.tierName);
            }
            if (t._id) {
                tierMap.set(t._id.toString(), t.tierName);
            }
        });
        res.json({
            success: true,
            message: "Lấy lịch sử gửi thông báo thành công",
            data: {
                notifications: notifications.map((n) => {
                    const user = n.sentBy;
                    let targetName = "";
                    const currentTargetValue = n.targetValue ? String(n.targetValue) : "";
                    if (n.targetType === "all") {
                        targetName = "All";
                    }
                    else if (n.targetType === "absent_over_5_days") {
                        targetName = "Vắng > 5 ngày";
                    }
                    else if (n.targetType === "tier") {
                        const tName = tierMap.get(currentTargetValue);
                        targetName = tName ? tName : `Hạng thẻ (${currentTargetValue})`;
                    }
                    else if (n.targetType === "member") {
                        const mName = memberMap.get(currentTargetValue);
                        targetName = mName ? mName : "Thành viên đã xóa";
                    }
                    else {
                        targetName = n.targetType;
                    }
                    return {
                        notificationId: n._id,
                        title: n.title,
                        content: n.content,
                        targetType: n.targetType,
                        targetValue: n.targetValue,
                        targetName,
                        receiverCount: n.receiverIds.length,
                        type: n.type,
                        sentBy: user
                            ? {
                                username: user.username,
                                role: user.role,
                            }
                            : null,
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
    }
    catch (error) {
        console.error("❌ Lỗi getNotifications:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server",
            data: null,
        });
    }
};
exports.getNotifications = getNotifications;
