import mongoose, { Schema, Document } from "mongoose";

export interface IGiftRedemption extends Document {
  memberId: mongoose.Types.ObjectId;
  giftId: mongoose.Types.ObjectId;
  pointUsed: number;
  redeemedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const GiftRedemptionSchema: Schema = new Schema(
  {
    memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    giftId: { type: Schema.Types.ObjectId, ref: "Gift", required: true },
    pointUsed: { type: Number, required: true },
    redeemedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IGiftRedemption>("GiftRedemption", GiftRedemptionSchema);
