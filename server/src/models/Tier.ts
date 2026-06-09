import mongoose, { Schema, Document } from "mongoose";

export interface ITier extends Document {
  tierId: string;
  tierName: string;
  minExpense: number;
  maxExpense: number | null;
  obtainPoint: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TierSchema: Schema = new Schema(
  {
    tierId: { type: String, required: true, unique: true },
    tierName: { type: String, required: true },
    minExpense: { type: Number, required: true, default: 0 },
    maxExpense: { type: Number, default: null },
    obtainPoint: { type: Number, required: true, default: 0 },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model<ITier>("Tier", TierSchema);
