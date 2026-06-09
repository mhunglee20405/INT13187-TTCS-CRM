import { Response, NextFunction } from "express";
import { AuthRequest } from "./authenticateToken";

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
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
