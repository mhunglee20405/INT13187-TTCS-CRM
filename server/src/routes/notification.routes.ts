import { Router } from "express";
import { sendNotification, getNotifications } from "../controllers/notification.controller";
import { authenticateToken } from "../middlewares/authenticateToken";
import { authorizeRoles } from "../middlewares/authorizeRoles";

const router = Router();

router.post("/send", authenticateToken, authorizeRoles("admin"), sendNotification);
router.get("/", authenticateToken, authorizeRoles("admin"), getNotifications);

export default router;
