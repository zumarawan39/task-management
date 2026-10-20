import { Schema, model, models, type Model, type Types } from "mongoose";
import type { Mood } from "@/lib/types";

export interface IDailyReview {
  userId: Types.ObjectId;
  date: string;
  wentWell: string;
  blockers: string;
  learned: string;
  mood: Mood | null;
  standupText: string;
  stats: {
    planned: number;
    completed: number;
    minutesTracked: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const dailyReviewSchema = new Schema<IDailyReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true },
    wentWell: { type: String, default: "" },
    blockers: { type: String, default: "" },
    learned: { type: String, default: "" },
    mood: { type: Number, min: 1, max: 5, default: null },
    standupText: { type: String, default: "" },
    stats: {
      planned: { type: Number, default: 0 },
      completed: { type: Number, default: 0 },
      minutesTracked: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

dailyReviewSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyReview: Model<IDailyReview> =
  (models.DailyReview as Model<IDailyReview> | undefined) ?? model<IDailyReview>("DailyReview", dailyReviewSchema);
