import { Router } from "express";
import {
  getTiers,
  getTierById,
  createTier,
  updateTier,
  deleteTier,
  getTierStatistics,
} from "../controllers/tier.controller";
import { authenticateToken } from "../middlewares/authenticateToken";
import { authorizeRoles } from "../middlewares/authorizeRoles";

const router = Router();

router.get("/", authenticateToken, getTiers);
router.get("/statistics", authenticateToken, getTierStatistics);
router.get("/:id", authenticateToken, getTierById);
router.post("/", authenticateToken, authorizeRoles("admin"), createTier);
router.put("/:id", authenticateToken, authorizeRoles("admin"), updateTier);
router.delete("/:id", authenticateToken, authorizeRoles("admin"), deleteTier);

export default router;
