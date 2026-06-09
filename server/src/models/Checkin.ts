import mongoose, { Schema, Document } from "mongoose";

export interface ICheckin extends Document {
  memberId: mongoose.Types.ObjectId;
  checkinTime: Date;
  isPointAdded: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const CheckinSchema: Schema = new Schema(
  {
    memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    checkinTime: { type: Date, required: true, default: Date.now },
    isPointAdded: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ICheckin>("Checkin", CheckinSchema);
