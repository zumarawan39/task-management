import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IDiscussion {
  userId: Types.ObjectId;
  project: Types.ObjectId;
  title: string;
  notes: string;
  date: string;
  createdAt: Date;
  updatedAt: Date;
}

const discussionSchema = new Schema<IDiscussion>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    notes: { type: String, default: "" },
    date: { type: String, required: true },
  },
  { timestamps: true },
);

discussionSchema.index({ userId: 1, project: 1, updatedAt: -1 });

export const Discussion: Model<IDiscussion> =
  (models.Discussion as Model<IDiscussion> | undefined) ?? model<IDiscussion>("Discussion", discussionSchema);
