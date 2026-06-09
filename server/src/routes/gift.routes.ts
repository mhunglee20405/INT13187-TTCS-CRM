import { Router } from "express";
import {
  getGifts,
  createGift,
  updateGift,
  deleteGift,
  redeemGift,
  getRedemptionHistory,
} from "../controllers/gift.controller";
import { authenticateToken } from "../middlewares/authenticateToken";
import { authorizeRoles } from "../middlewares/authorizeRoles";

const router = Router();

router.get("/", authenticateToken, getGifts);
router.post("/", authenticateToken, authorizeRoles("admin"), createGift);
router.put("/:id", authenticateToken, authorizeRoles("admin"), updateGift);
router.delete("/:id", authenticateToken, authorizeRoles("admin"), deleteGift);
router.post("/redeem", authenticateToken, redeemGift);
router.get("/redemptions/history", authenticateToken, authorizeRoles("admin"), getRedemptionHistory);

export default router;
