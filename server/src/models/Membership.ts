import mongoose, { Schema, Document } from "mongoose";

export interface IMembership extends Document {
  membershipId: string;
  membershipName: string;
  durationMonths: number;
  originalPrice: number;
  urPrice: number;
  rewardPoint: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MembershipSchema: Schema = new Schema(
  {
    membershipId: { type: String, required: true, unique: true },
    membershipName: { type: String, required: true },
    durationMonths: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    urPrice: { type: Number, required: true },
    rewardPoint: { type: Number, required: true, default: 0 },
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IMembership>("Membership", MembershipSchema);
