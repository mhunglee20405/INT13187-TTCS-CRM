import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller";
import { authenticateToken } from "../middlewares/authenticateToken";

const router = Router();

router.get("/stats", authenticateToken, getDashboardStats);

export default router;
