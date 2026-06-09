import { Router } from "express";
import {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "../controllers/notificationTemplate.controller";
import { authenticateToken } from "../middlewares/authenticateToken";
import { authorizeRoles } from "../middlewares/authorizeRoles";

const router = Router();

router.get("/", authenticateToken, authorizeRoles("admin"), getTemplates);
router.post("/", authenticateToken, authorizeRoles("admin"), createTemplate);
router.put("/:id", authenticateToken, authorizeRoles("admin"), updateTemplate);
router.delete("/:id", authenticateToken, authorizeRoles("admin"), deleteTemplate);

export default router;
