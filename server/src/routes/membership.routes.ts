import { Router } from "express";
import {
  getMemberships,
  getMembershipById,
  createMembership,
  updateMembership,
  deleteMembership,
} from "../controllers/membership.controller";
import { authenticateToken } from "../middlewares/authenticateToken";
import { authorizeRoles } from "../middlewares/authorizeRoles";

const router = Router();

router.get("/", authenticateToken, getMemberships);
router.get("/:id", authenticateToken, getMembershipById);
router.post("/", authenticateToken, authorizeRoles("admin"), createMembership);
router.put("/:id", authenticateToken, authorizeRoles("admin"), updateMembership);
router.delete("/:id", authenticateToken, authorizeRoles("admin"), deleteMembership);

export default router;
