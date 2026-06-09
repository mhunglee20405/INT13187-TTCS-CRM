import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.routes";
import memberRoutes from "./routes/member.routes";
import membershipRoutes from "./routes/membership.routes";
import tierRoutes from "./routes/tier.routes";
import giftRoutes from "./routes/gift.routes";
import notificationRoutes from "./routes/notification.routes";
import notificationTemplateRoutes from "./routes/notificationTemplate.routes";
import dashboardRoutes from "./routes/dashboard.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/memberships", membershipRoutes);
app.use("/api/tiers", tierRoutes);
app.use("/api/gifts", giftRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/notification-templates", notificationTemplateRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Health check
app.get("/api/health", (_, res) => {
  res.json({
    success: true,
    message: "Server đang hoạt động",
    data: {
      service: "Gym Membership Management API",
      status: "OK",
      database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
      timestamp: new Date().toISOString(),
    },
  });
});

// 404
app.use((_, res) => {
  res.status(404).json({ success: false, message: "API không tồn tại", data: null });
});

// Connect DB & Start
mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });

export default app;
