import { Router } from "express";
import {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  checkinMember,
  addMembership,
} from "../controllers/member.controller";
import { authenticateToken } from "../middlewares/authenticateToken";
import { authorizeRoles } from "../middlewares/authorizeRoles";

const router = Router();

router.get("/", authenticateToken, getMembers);
router.get("/:id", authenticateToken, getMemberById);
router.post("/", authenticateToken, createMember);
router.put("/:id", authenticateToken, updateMember);
router.delete("/:id", authenticateToken, authorizeRoles("admin"), deleteMember);
router.post("/:id/checkin", authenticateToken, checkinMember);
router.post("/:id/add-membership", authenticateToken, addMembership);

export default router;
