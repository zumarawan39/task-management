import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  name: string;
  passwordHash?: string;
  githubId?: string;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    passwordHash: { type: String },
    githubId: { type: String },
  },
  { timestamps: true },
);

export const User: Model<IUser> = (models.User as Model<IUser> | undefined) ?? model<IUser>("User", userSchema);
