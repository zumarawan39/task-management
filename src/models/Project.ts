import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IProject {
  userId: Types.ObjectId;
  name: string;
  color: string;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    color: { type: String, required: true, default: "#1c6b48" },
    archived: { type: Boolean, required: true, default: false },
  },
  { timestamps: true },
);

projectSchema.index({ userId: 1, name: 1 });

export const Project: Model<IProject> =
  (models.Project as Model<IProject> | undefined) ?? model<IProject>("Project", projectSchema);
