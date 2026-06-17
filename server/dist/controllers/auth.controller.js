"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.refreshToken = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({
                success: false,
                message: "Vui lòng nhập tên đăng nhập và mật khẩu",
                data: null,
            });
            return;
        }
        const user = await User_1.default.findOne({
            $or: [{ username }, { email: username }],
            isActive: true,
        });
        if (!user) {
            res.status(401).json({
                success: false,
                message: "Tên đăng nhập hoặc mật khẩu không đúng",
                data: null,
            });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({
                success: false,
                message: "Tên đăng nhập hoặc mật khẩu không đúng",
                data: null,
            });
            return;
        }
        const accessToken = jsonwebtoken_1.default.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "1h" });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user._id, role: user.role }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" });
        user.refreshToken = refreshToken;
        await user.save();
        res.json({
            success: true,
            message: "Đăng nhập thành công",
            data: {
                accessToken,
                refreshToken,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                },
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server", data: null });
    }
};
exports.login = login;
const refreshToken = async (req, res) => {
    try {
        const { refreshToken: token } = req.body;
        if (!token) {
            res.status(400).json({
                success: false,
                message: "Refresh token không được để trống",
                data: null,
            });
            return;
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET);
        }
        catch {
            res.status(401).json({
                success: false,
                message: "Refresh token không hợp lệ hoặc đã hết hạn",
                data: null,
            });
            return;
        }
        const user = await User_1.default.findOne({ _id: decoded.userId, refreshToken: token });
        if (!user) {
            res.status(401).json({
                success: false,
                message: "Refresh token không hợp lệ hoặc đã hết hạn",
                data: null,
            });
            return;
        }
        const accessToken = jsonwebtoken_1.default.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "1h" });
        res.json({
            success: true,
            message: "Cấp access token mới thành công",
            data: { accessToken },
        });
    }
    catch {
        res.status(500).json({ success: false, message: "Lỗi server", data: null });
    }
};
exports.refreshToken = refreshToken;
const logout = async (req, res) => {
    try {
        if (req.user) {
            await User_1.default.findByIdAndUpdate(req.user.userId, { refreshToken: null });
        }
        res.json({ success: true, message: "Đăng xuất thành công", data: null });
    }
    catch {
        res.status(500).json({ success: false, message: "Lỗi server", data: null });
    }
};
exports.logout = logout;
const getMe = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user?.userId).select("-password -refreshToken");
        if (!user) {
            res.status(404).json({ success: false, message: "Không tìm thấy người dùng", data: null });
            return;
        }
        res.json({
            success: true,
            message: "Lấy thông tin người dùng thành công",
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch {
        res.status(500).json({ success: false, message: "Lỗi server", data: null });
    }
};
exports.getMe = getMe;
