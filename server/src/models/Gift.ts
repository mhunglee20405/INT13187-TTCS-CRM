import mongoose, { Schema, Document } from "mongoose";

export interface IGift extends Document {
  giftId: string;
  giftName: string;
  requiredPoint: number;
  quantity: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GiftSchema: Schema = new Schema(
  {
    giftId: { type: String, required: true, unique: true },
    giftName: { type: String, required: true },
    requiredPoint: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 0 },
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IGift>("Gift", GiftSchema);
