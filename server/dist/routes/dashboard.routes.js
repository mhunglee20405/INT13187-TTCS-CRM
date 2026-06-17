"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const authenticateToken_1 = require("../middlewares/authenticateToken");
const router = (0, express_1.Router)();
router.get("/stats", authenticateToken_1.authenticateToken, dashboard_controller_1.getDashboardStats);
exports.default = router;
