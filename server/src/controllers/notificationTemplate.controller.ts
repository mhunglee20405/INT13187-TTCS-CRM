import { Response } from "express";
import NotificationTemplate from "../models/NotificationTemplate";
import { AuthRequest } from "../middlewares/authenticateToken";

export const getTemplates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const templates = await NotificationTemplate.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      message: "Lấy danh sách mẫu thông báo thành công",
      data: templates.map((t) => ({
        id: t._id,
        templateName: t.templateName,
        title: t.title,
        content: t.content,
        createdAt: t.createdAt,
      })),
    });
  } catch {
    res.status(500).json({ success: false, message: "Lỗi server", data: null });
  }
};

export const createTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { templateName, title, content } = req.body;
    const template = await NotificationTemplate.create({
      templateName,
      title,
      content,
      createdBy: req.user?.userId,
    });
    res.status(201).json({ success: true, message: "Thêm mẫu thông báo thành công", data: template });
  } catch {
    res.status(500).json({ success: false, message: "Lỗi server", data: null });
  }
};

export const updateTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const template = await NotificationTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!template) {
      res.status(404).json({ success: false, message: "Không tìm thấy mẫu thông báo", data: null });
      return;
    }
    res.json({ success: true, message: "Cập nhật mẫu thông báo thành công", data: template });
  } catch {
    res.status(500).json({ success: false, message: "Lỗi server", data: null });
  }
};

export const deleteTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const template = await NotificationTemplate.findByIdAndDelete(req.params.id);
    if (!template) {
      res.status(404).json({ success: false, message: "Không tìm thấy mẫu thông báo", data: null });
      return;
    }
    res.json({ success: true, message: "Xóa mẫu thông báo thành công", data: { id: req.params.id } });
  } catch {
    res.status(500).json({ success: false, message: "Lỗi server", data: null });
  }
};
