import mongoose, { Schema, Document } from "mongoose";

export interface INotificationTemplate extends Document {
  templateName: string;
  title: string;
  content: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationTemplateSchema: Schema = new Schema(
  {
    templateName: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model<INotificationTemplate>(
  "NotificationTemplate",
  NotificationTemplateSchema
);
