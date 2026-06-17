"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = void 0;
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: "Bạn không có quyền thực hiện chức năng này",
                data: null,
            });
            return;
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
