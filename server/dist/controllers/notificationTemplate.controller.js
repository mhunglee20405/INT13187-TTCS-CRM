"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTemplate = exports.updateTemplate = exports.createTemplate = exports.getTemplates = void 0;
const NotificationTemplate_1 = __importDefault(require("../models/NotificationTemplate"));
const getTemplates = async (req, res) => {
    try {
        const templates = await NotificationTemplate_1.default.find().sort({ createdAt: -1 });
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
    }
    catch {
        res.status(500).json({ success: false, message: "Lỗi server", data: null });
    }
};
exports.getTemplates = getTemplates;
const createTemplate = async (req, res) => {
    try {
        const { templateName, title, content } = req.body;
        const template = await NotificationTemplate_1.default.create({
            templateName,
            title,
            content,
            createdBy: req.user?.userId,
        });
        res.status(201).json({ success: true, message: "Thêm mẫu thông báo thành công", data: template });
    }
    catch {
        res.status(500).json({ success: false, message: "Lỗi server", data: null });
    }
};
exports.createTemplate = createTemplate;
const updateTemplate = async (req, res) => {
    try {
        const template = await NotificationTemplate_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!template) {
            res.status(404).json({ success: false, message: "Không tìm thấy mẫu thông báo", data: null });
            return;
        }
        res.json({ success: true, message: "Cập nhật mẫu thông báo thành công", data: template });
    }
    catch {
        res.status(500).json({ success: false, message: "Lỗi server", data: null });
    }
};
exports.updateTemplate = updateTemplate;
const deleteTemplate = async (req, res) => {
    try {
        const template = await NotificationTemplate_1.default.findByIdAndDelete(req.params.id);
        if (!template) {
            res.status(404).json({ success: false, message: "Không tìm thấy mẫu thông báo", data: null });
            return;
        }
        res.json({ success: true, message: "Xóa mẫu thông báo thành công", data: { id: req.params.id } });
    }
    catch {
        res.status(500).json({ success: false, message: "Lỗi server", data: null });
    }
};
exports.deleteTemplate = deleteTemplate;
