import { Schema, model, models, type Model, type Types } from "mongoose";
import type { Priority, RecurrenceRule, Status } from "@/lib/types";

export interface ITimeLog {
  start: Date;
  end: Date | null;
}

export interface ISubtask {
  _id: Types.ObjectId;
  title: string;
  done: boolean;
}

export interface ILink {
  label: string;
  url: string;
}

export interface ITask {
  userId: Types.ObjectId;
  title: string;
  notes: string;
  status: Status;
  priority: Priority;
  order: number;
  date: string;
  tags: string[];
  project: Types.ObjectId | null;
  estimateMinutes: number | null;
  timeLogs: ITimeLog[];
  totalMinutes: number;
  subtasks: ISubtask[];
  links: ILink[];
  carriedOverFrom: string | null;
  recurring: { enabled: boolean; rule: RecurrenceRule } | null;
  recurrenceOf: Types.ObjectId | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const timeLogSchema = new Schema<ITimeLog>(
  {
    start: { type: Date, required: true },
    end: { type: Date, default: null },
  },
  { _id: false },
);

const subtaskSchema = new Schema<ISubtask>({
  title: { type: String, required: true, maxlength: 200 },
  done: { type: Boolean, required: true, default: false },
});

const linkSchema = new Schema<ILink>(
  {
    label: { type: String, required: true, maxlength: 80 },
    url: { type: String, required: true, maxlength: 2000 },
  },
  { _id: false },
);

const taskSchema = new Schema<ITask>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, maxlength: 200 },
    notes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["todo", "in_progress", "blocked", "done"],
      default: "todo",
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
      required: true,
    },
    order: { type: Number, required: true, default: 1024 },
    date: { type: String, required: true },
    tags: { type: [String], default: [] },
    project: { type: Schema.Types.ObjectId, ref: "Project", default: null },
    estimateMinutes: { type: Number, default: null },
    timeLogs: { type: [timeLogSchema], default: [] },
    totalMinutes: { type: Number, required: true, default: 0 },
    subtasks: { type: [subtaskSchema], default: [] },
    links: { type: [linkSchema], default: [] },
    carriedOverFrom: { type: String, default: null },
    recurring: {
      type: new Schema(
        {
          enabled: { type: Boolean, required: true },
          rule: { type: String, enum: ["daily", "weekdays", "weekly"], required: true },
        },
        { _id: false },
      ),
      default: null,
    },
    recurrenceOf: { type: Schema.Types.ObjectId, ref: "Task", default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

taskSchema.index({ userId: 1, date: 1, status: 1, order: 1 });
taskSchema.index({ title: "text", notes: "text" });
taskSchema.index(
  { userId: 1, recurrenceOf: 1, date: 1 },
  { unique: true, partialFilterExpression: { recurrenceOf: { $type: "objectId" } } },
);

export const Task: Model<ITask> =
  (models.Task as Model<ITask> | undefined) ?? model<ITask>("Task", taskSchema);
