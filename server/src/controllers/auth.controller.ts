import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { AuthRequest } from "../middlewares/authenticateToken";

export const login = async (req: Request, res: Response): Promise<void> => {
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

    const user = await User.findOne({
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

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "Tên đăng nhập hoặc mật khẩu không đúng",
        data: null,
      });
      return;
    }

    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" } as jwt.SignOptions
    );

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
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", data: null });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
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

    let decoded: { userId: string; role: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as {
        userId: string;
        role: string;
      };
    } catch {
      res.status(401).json({
        success: false,
        message: "Refresh token không hợp lệ hoặc đã hết hạn",
        data: null,
      });
      return;
    }

    const user = await User.findOne({ _id: decoded.userId, refreshToken: token });
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Refresh token không hợp lệ hoặc đã hết hạn",
        data: null,
      });
      return;
    }

    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" } as jwt.SignOptions
    );

    res.json({
      success: true,
      message: "Cấp access token mới thành công",
      data: { accessToken },
    });
  } catch {
    res.status(500).json({ success: false, message: "Lỗi server", data: null });
  }
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user.userId, { refreshToken: null });
    }
    res.json({ success: true, message: "Đăng xuất thành công", data: null });
  } catch {
    res.status(500).json({ success: false, message: "Lỗi server", data: null });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId).select("-password -refreshToken");
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
  } catch {
    res.status(500).json({ success: false, message: "Lỗi server", data: null });
  }
};
