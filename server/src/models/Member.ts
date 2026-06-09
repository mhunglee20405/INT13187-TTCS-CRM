import mongoose, { Schema, Document } from "mongoose";

export interface IMember extends Document {
  memberId: string;
  name: string;
  phone: string;
  birthday?: Date;
  mail?: string;
  point: number;
  obtainPoint: number;
  absentDays: number;
  totalExpense: number;
  tierId: mongoose.Types.ObjectId;
  currentMembershipId?: mongoose.Types.ObjectId;
  membershipStartDate?: Date;
  membershipEndDate?: Date;
  lastCheckinDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema: Schema = new Schema(
  {
    memberId: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    birthday: { type: Date, default: null },
    mail: { type: String, default: null, trim: true, lowercase: true },
    point: { type: Number, default: 0 },
    obtainPoint: { type: Number, default: 0 },
    absentDays: { type: Number, default: 0 },
    totalExpense: { type: Number, default: 0 },
    tierId: { type: Schema.Types.ObjectId, ref: "Tier", required: true },
    currentMembershipId: { type: Schema.Types.ObjectId, ref: "Membership", default: null },
    membershipStartDate: { type: Date, default: null },
    membershipEndDate: { type: Date, default: null },
    lastCheckinDate: { type: Date, default: null },
  },
  { timestamps: true }
);

// Index for search
MemberSchema.index({ name: "text", phone: "text", mail: "text" });

export default mongoose.model<IMember>("Member", MemberSchema);
