"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedemptionHistory = exports.redeemGift = exports.deleteGift = exports.updateGift = exports.createGift = exports.getGifts = void 0;
require("dotenv/config");
const nodemailer_1 = __importDefault(require("nodemailer"));
const Gift_1 = __importDefault(require("../models/Gift"));
const GiftRedemption_1 = __importDefault(require("../models/GiftRedemption"));
const Member_1 = __importDefault(require("../models/Member"));
const Notification_1 = __importDefault(require("../models/Notification"));
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
// KIỂM TRA EMAIL HỢP LỆ
// Member model của bạn dùng field: mail
// ==========================================
const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
// ==========================================
// CHỐNG LỖI HTML CƠ BẢN
// ==========================================
const escapeHtml = (text) => {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};
const getGifts = async (req, res) => {
    try {
        const gifts = await Gift_1.default.find().sort({ createdAt: -1 });
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
    }
    catch (error) {
        console.error("❌ Lỗi getGifts:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server",
            data: null,
        });
    }
};
exports.getGifts = getGifts;
const createGift = async (req, res) => {
    try {
        let { giftId, giftName, requiredPoint, quantity, description } = req.body;
        // ==========================================
        // VALIDATION BACKEND
        // ==========================================
        if (!giftId || !giftId.trim() || !giftName || !giftName.trim()) {
            res.status(400).json({
                success: false,
                message: "Thiếu mã quà hoặc tên quà",
                data: null,
            });
            return;
        }
        if (!Number.isInteger(requiredPoint) || requiredPoint <= 0) {
            res.status(400).json({
                success: false,
                message: "Điểm cần đổi phải là số nguyên dương (> 0)",
                data: null,
            });
            return;
        }
        if (!Number.isInteger(quantity) || quantity < 0) {
            res.status(400).json({
                success: false,
                message: "Số lượng phải là số nguyên không âm (>= 0)",
                data: null,
            });
            return;
        }
        giftId = giftId.trim().toUpperCase();
        const existing = await Gift_1.default.findOne({ giftId });
        if (existing) {
            res.status(400).json({
                success: false,
                message: "Mã quà đã tồn tại",
                data: null,
            });
            return;
        }
        const gift = await Gift_1.default.create({
            giftId,
            giftName,
            requiredPoint,
            quantity,
            description,
        });
        res.status(201).json({
            success: true,
            message: "Thêm quà tặng thành công",
            data: gift,
        });
    }
    catch (error) {
        console.error("❌ Lỗi createGift:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server",
            data: null,
        });
    }
};
exports.createGift = createGift;
const updateGift = async (req, res) => {
    try {
        const { requiredPoint, quantity, giftId } = req.body;
        // ==========================================
        // VALIDATION UPDATE
        // ==========================================
        if (requiredPoint !== undefined &&
            (!Number.isInteger(requiredPoint) || requiredPoint <= 0)) {
            res.status(400).json({
                success: false,
                message: "Điểm cần đổi phải là số nguyên dương",
                data: null,
            });
            return;
        }
        if (quantity !== undefined &&
            (!Number.isInteger(quantity) || quantity < 0)) {
            res.status(400).json({
                success: false,
                message: "Số lượng phải là số nguyên không âm",
                data: null,
            });
            return;
        }
        if (giftId) {
            req.body.giftId = giftId.trim().toUpperCase();
        }
        const gift = await Gift_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!gift) {
            res.status(404).json({
                success: false,
                message: "Không tìm thấy quà tặng",
                data: null,
            });
            return;
        }
        res.json({
            success: true,
            message: "Cập nhật quà tặng thành công",
            data: gift,
        });
    }
    catch (error) {
        console.error("❌ Lỗi updateGift:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server",
            data: null,
        });
    }
};
exports.updateGift = updateGift;
const deleteGift = async (req, res) => {
    try {
        const gift = await Gift_1.default.findByIdAndDelete(req.params.id);
        if (!gift) {
            res.status(404).json({
                success: false,
                message: "Không tìm thấy quà tặng",
                data: null,
            });
            return;
        }
        res.json({
            success: true,
            message: "Xóa quà tặng thành công",
            data: { id: req.params.id },
        });
    }
    catch (error) {
        console.error("❌ Lỗi deleteGift:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server",
            data: null,
        });
    }
};
exports.deleteGift = deleteGift;
// ==========================================
// ĐỔI QUÀ + TẠO THÔNG BÁO + GỬI EMAIL
// ==========================================
const redeemGift = async (req, res) => {
    try {
        const { memberId, giftId } = req.body;
        const member = await Member_1.default.findById(memberId);
        if (!member) {
            res.status(404).json({
                success: false,
                message: "Không tìm thấy thành viên",
                data: null,
            });
            return;
        }
        const gift = await Gift_1.default.findById(giftId);
        if (!gift || !gift.isActive) {
            res.status(404).json({
                success: false,
                message: "Không tìm thấy quà tặng",
                data: null,
            });
            return;
        }
        if (gift.quantity <= 0) {
            res.status(400).json({
                success: false,
                message: "Quà tặng đã hết số lượng",
                data: {
                    giftId: gift.giftId,
                    giftName: gift.giftName,
                    quantity: 0,
                },
            });
            return;
        }
        if (member.point < gift.requiredPoint) {
            res.status(400).json({
                success: false,
                message: "Thành viên không đủ điểm để đổi quà",
                data: {
                    currentPoint: member.point,
                    requiredPoint: gift.requiredPoint,
                },
            });
            return;
        }
        const pointBefore = member.point;
        member.point -= gift.requiredPoint;
        await member.save();
        gift.quantity -= 1;
        await gift.save();
        const redemption = await GiftRedemption_1.default.create({
            memberId: member._id,
            giftId: gift._id,
            pointUsed: gift.requiredPoint,
            redeemedBy: req.user?.userId,
        });
        const notificationTitle = "Đổi quà thành công";
        const notificationContent = `Bạn đã đổi thành công quà: ${gift.giftName}. Số điểm đã sử dụng: ${gift.requiredPoint}. Số điểm còn lại: ${member.point}.`;
        await Notification_1.default.create({
            title: notificationTitle,
            content: notificationContent,
            targetType: "member",
            targetValue: member._id?.toString(),
            receiverIds: [member._id],
            sentBy: req.user?.userId,
            type: "auto_gift_redeem",
        });
        // ==========================================
        // GỬI EMAIL THÔNG BÁO ĐỔI QUÀ THÀNH CÔNG
        // ==========================================
        let emailSent = false;
        let emailMessageId = null;
        try {
            const memberEmail = member.mail?.trim();
            console.log("Email thành viên đổi quà:", memberEmail);
            if (process.env.MAIL_USER &&
                process.env.MAIL_PASS &&
                memberEmail &&
                isValidEmail(memberEmail)) {
                const safeMemberName = escapeHtml(member.name);
                const safeGiftName = escapeHtml(gift.giftName);
                const safeGiftId = escapeHtml(gift.giftId);
                const mailOptions = {
                    from: `"Hệ thống Quản lý PITGYM" <${process.env.MAIL_USER}>`,
                    to: memberEmail,
                    subject: `[PITGYM] Đổi quà thành công - ${gift.giftName}`,
                    html: `
            <div style="
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              background-color: #ffffff;
            ">
              <div style="
                background-color: #4f46e5;
                padding: 18px;
                border-radius: 10px 10px 0 0;
                text-align: center;
              ">
                <h2 style="
                  color: #ffffff;
                  margin: 0;
                  font-size: 22px;
                ">
                  ĐỔI QUÀ THÀNH CÔNG
                </h2>
              </div>

              <div style="padding: 22px 10px; color: #111827;">
                <p style="font-size: 15px; margin-bottom: 12px;">
                  Xin chào <b>${safeMemberName}</b>,
                </p>

                <p style="font-size: 15px; line-height: 1.6;">
                  Bạn đã đổi quà thành công tại hệ thống PITGYM.
                </p>

                <div style="
                  margin-top: 18px;
                  padding: 16px;
                  background-color: #f9fafb;
                  border-left: 4px solid #4f46e5;
                  border-radius: 8px;
                ">
                  <p style="margin: 6px 0; font-size: 14px;">
                    <b>Mã quà:</b> ${safeGiftId}
                  </p>

                  <p style="margin: 6px 0; font-size: 14px;">
                    <b>Tên quà:</b> ${safeGiftName}
                  </p>

                  <p style="margin: 6px 0; font-size: 14px;">
                    <b>Số điểm đã sử dụng:</b> ${gift.requiredPoint}
                  </p>

                  <p style="margin: 6px 0; font-size: 14px;">
                    <b>Điểm trước khi đổi:</b> ${pointBefore}
                  </p>

                  <p style="margin: 6px 0; font-size: 14px;">
                    <b>Điểm còn lại:</b> ${member.point}
                  </p>
                </div>

                <p style="
                  font-size: 12px;
                  color: #6b7280;
                  margin-top: 24px;
                  text-align: center;
                  border-top: 1px solid #f3f4f6;
                  padding-top: 16px;
                ">
                  Đây là email tự động từ hệ thống quản lý thành viên PITGYM.
                  Vui lòng không phản hồi lại email này.
                </p>
              </div>
            </div>
          `,
                };
                const info = await transporter.sendMail(mailOptions);
                emailSent = true;
                emailMessageId = info.messageId;
                console.log("✅ Gửi email đổi quà thành công");
                console.log("Message ID:", info.messageId);
                console.log("Response:", info.response);
            }
            else {
                console.log("⚠️ Không gửi email đổi quà vì member.mail trống, email không hợp lệ hoặc thiếu MAIL_USER/MAIL_PASS.");
            }
        }
        catch (emailError) {
            console.error("❌ Lỗi gửi email đổi quà:", emailError);
        }
        res.json({
            success: true,
            message: emailSent
                ? "Đổi quà thành công và đã gửi email thông báo"
                : "Đổi quà thành công nhưng chưa gửi được email thông báo",
            data: {
                redemptionId: redemption._id,
                member: {
                    memberId: member.memberId,
                    name: member.name,
                    mail: member.mail,
                    pointBefore,
                    pointAfter: member.point,
                },
                gift: {
                    giftId: gift.giftId,
                    giftName: gift.giftName,
                    requiredPoint: gift.requiredPoint,
                    quantityAfter: gift.quantity,
                },
                emailSent,
                emailMessageId,
                createdAt: redemption.createdAt,
            },
        });
    }
    catch (error) {
        console.error("❌ Lỗi redeemGift:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server",
            data: null,
        });
    }
};
exports.redeemGift = redeemGift;
const getRedemptionHistory = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const [history, total] = await Promise.all([
            GiftRedemption_1.default.find()
                .populate("memberId", "memberId name")
                .populate("giftId", "giftId giftName")
                .populate("redeemedBy", "username role")
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum),
            GiftRedemption_1.default.countDocuments(),
        ]);
        res.json({
            success: true,
            message: "Lấy lịch sử đổi quà thành công",
            data: {
                history: history.map((h) => {
                    const m = h.memberId;
                    const g = h.giftId;
                    const u = h.redeemedBy;
                    return {
                        redemptionId: h._id,
                        member: m
                            ? {
                                memberId: m.memberId,
                                name: m.name,
                            }
                            : null,
                        gift: g
                            ? {
                                giftId: g.giftId,
                                giftName: g.giftName,
                            }
                            : null,
                        pointUsed: h.pointUsed,
                        redeemedBy: u
                            ? {
                                username: u.username,
                                role: u.role,
                            }
                            : null,
                        createdAt: h.createdAt,
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
        console.error("❌ Lỗi getRedemptionHistory:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server",
            data: null,
        });
    }
};
exports.getRedemptionHistory = getRedemptionHistory;
