import mongoose, { Schema, Document } from "mongoose";

export type NotificationTargetType = "all" | "tier" | "member" | "absent_over_5_days";

export interface INotification extends Document {
  title: string;
  content: string;
  targetType: NotificationTargetType;
  targetValue?: string;
  receiverIds: mongoose.Types.ObjectId[];
  sentBy: mongoose.Types.ObjectId;
  type?: string;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    targetType: {
      type: String,
      enum: ["all", "tier", "member", "absent_over_5_days"],
      required: true,
    },
    targetValue: { type: String, default: null },
    receiverIds: [{ type: Schema.Types.ObjectId, ref: "Member" }],
    sentBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, default: "manual" },
  },
  { timestamps: true }
);

export default mongoose.model<INotification>("Notification", NotificationSchema);
