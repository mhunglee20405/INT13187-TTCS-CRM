"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const member_routes_1 = __importDefault(require("./routes/member.routes"));
const membership_routes_1 = __importDefault(require("./routes/membership.routes"));
const tier_routes_1 = __importDefault(require("./routes/tier.routes"));
const gift_routes_1 = __importDefault(require("./routes/gift.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const notificationTemplate_routes_1 = __importDefault(require("./routes/notificationTemplate.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error("❌ Missing MONGODB_URI environment variable");
    process.exit(1);
}
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api/members", member_routes_1.default);
app.use("/api/memberships", membership_routes_1.default);
app.use("/api/tiers", tier_routes_1.default);
app.use("/api/gifts", gift_routes_1.default);
app.use("/api/notifications", notification_routes_1.default);
app.use("/api/notification-templates", notificationTemplate_routes_1.default);
app.use("/api/dashboard", dashboard_routes_1.default);
// Health check
app.get("/api/health", (_, res) => {
    res.json({
        success: true,
        message: "Server đang hoạt động",
        data: {
            service: "Gym Membership Management API",
            status: "OK",
            database: mongoose_1.default.connection.readyState === 1 ? "Connected" : "Disconnected",
            timestamp: new Date().toISOString(),
        },
    });
});
// 404
app.use((_, res) => {
    res.status(404).json({
        success: false,
        message: "API không tồn tại",
        data: null,
    });
});
// Connect DB & Start
mongoose_1.default
    .connect(MONGODB_URI)
    .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(Number(PORT), "0.0.0.0", () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
})
    .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
});
exports.default = app;
