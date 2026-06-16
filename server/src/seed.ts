import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User";
import Tier from "./models/Tier";
import Membership from "./models/Membership";
import Gift from "./models/Gift";

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("✅ Connected to MongoDB");

    // Seed Tiers
    const tierCount = await Tier.countDocuments();
    if (tierCount === 0) {
      await Tier.insertMany([
        {
          tierId: "TIER_BRONZE",
          tierName: "Bronze",
          minExpense: 0,
          maxExpense: 3000000,
          obtainPoint: 0,
          description: "Hạng thành viên cơ bản",
        },
        {
          tierId: "TIER_SILVER",
          tierName: "Silver",
          minExpense: 3000001,
          maxExpense: 10000000,
          obtainPoint: 30,
          description: "Hạng thành viên bạc",
        },
        {
          tierId: "TIER_GOLD",
          tierName: "Gold",
          minExpense: 10000001,
          maxExpense: 20000000,
          obtainPoint: 100,
          description: "Hạng thành viên vàng",
        },
        {
          tierId: "TIER_DIAMOND",
          tierName: "Diamond",
          minExpense: 20000000,
          maxExpense: null,
          obtainPoint: 200,
          description: "Hạng thành viên kim cương",
        },
      ]);
      console.log("✅ Seeded Tiers");
    }

    // Seed Memberships
    const membershipCount = await Membership.countDocuments();
    if (membershipCount === 0) {
      await Membership.insertMany([
        {
          membershipId: "CLASSIC",
          membershipName: "Classic",
          durationMonths: 3,
          originalPrice: 1200000,
          urPrice: 1200000,
          rewardPoint: 12,
          description: "Gói Classic 3 tháng",
        },
        {
          membershipId: "PLUS",
          membershipName: "Plus",
          durationMonths: 14,
          originalPrice: 4800000,
          urPrice: 4800000,
          rewardPoint: 48,
          description: "Gói Plus 1 năm + 2 tháng",
        },
        {
          membershipId: "ROYAL",
          membershipName: "Royal",
          durationMonths: 28,
          originalPrice: 16800000,
          urPrice: 16800000,
          rewardPoint: 168,
          description: "Gói Royal 2 năm + 4 tháng",
        },
        {
          membershipId: "SIGNATURE",
          membershipName: "Signature",
          durationMonths: 30,
          originalPrice: 32600000,
          urPrice: 32600000,
          rewardPoint: 326,
          description: "Gói Signature 2 năm + 6 tháng",
        },
      ]);
      console.log("✅ Seeded Memberships");
    }

    // Seed Gifts
    const giftCount = await Gift.countDocuments();
    if (giftCount === 0) {
      await Gift.insertMany([
        {
          giftId: "GIFT001",
          giftName: "Bình nước thể thao",
          requiredPoint: 50,
          quantity: 20,
          description: "Bình nước inox cao cấp",
        },
        {
          giftId: "GIFT002",
          giftName: "Áo tập gym",
          requiredPoint: 120,
          quantity: 10,
          description: "Áo tập chất liệu thoáng mát",
        },
        {
          giftId: "GIFT003",
          giftName: "Khăn tập gym",
          requiredPoint: 30,
          quantity: 50,
          description: "Khăn tập dùng trong phòng gym",
        },
        {
          giftId: "GIFT004",
          giftName: "Găng tay tập gym",
          requiredPoint: 80,
          quantity: 15,
          description: "Găng tay bảo vệ tay khi tập",
        },
      ]);
      console.log("✅ Seeded Gifts");
    }

    // Seed Admin user
    const adminExists = await User.findOne({ username: "admin" });
    if (!adminExists) {
      const hashed = await bcrypt.hash("admin123", 10);
      await User.create({
        username: "admin",
        email: "admin@gym.com",
        password: hashed,
        role: "admin",
        isActive: true,
      });
      console.log("✅ Seeded Admin: username=admin, password=admin123");
    }

    // Seed Receptionist user
    const receptionistExists = await User.findOne({ username: "letanvien" });
    if (!receptionistExists) {
      const hashed = await bcrypt.hash("letanvien123", 10);
      await User.create({
        username: "letanvien",
        email: "letanvien@gym.com",
        password: hashed,
        role: "receptionist",
        isActive: true,
      });
      console.log(
        "✅ Seeded Receptionist: username=letanvien, password=letanvien123",
      );
    }

    console.log("🎉 Seed completed!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
};

seed();
