import { Router } from "express";
import { login, refreshToken, logout, getMe } from "../controllers/auth.controller";
import { authenticateToken } from "../middlewares/authenticateToken";

const router = Router();

router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/logout", authenticateToken, logout);
router.get("/me", authenticateToken, getMe);

export default router;
