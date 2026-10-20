import { Types } from "mongoose";
import { closedMinutes } from "@/lib/duration";
import {
  PRIORITIES,
  RECURRENCE_RULES,
  STATUSES,
  type ColumnsDTO,
  type Priority,
  type ProjectDTO,
  type ProjectRef,
  type RecurrenceRule,
  type Recurring,
  type ReviewDTO,
  type Status,
  type TaskDTO,
} from "@/lib/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (isRecord(value) && "_id" in value) return String(value._id);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
}

function asId(value: unknown): string {
  if (isRecord(value) && "_id" in value) return String(value._id);
  return String(value ?? "");
}

function asStatus(value: unknown): Status {
  return STATUSES.includes(value as Status) ? (value as Status) : "todo";
}

function asPriority(value: unknown): Priority {
  return PRIORITIES.includes(value as Priority) ? (value as Priority) : "medium";
}

function asRule(value: unknown): RecurrenceRule | null {
  return RECURRENCE_RULES.includes(value as RecurrenceRule) ? (value as RecurrenceRule) : null;
}

function projectRef(value: unknown): ProjectRef | null {
  if (!isRecord(value) || !("name" in value) || !("_id" in value)) return null;
  return {
    id: String(value._id),
    name: asString(value.name),
    color: asString(value.color, "#1c6b48"),
  };
}

function iso(value: unknown): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(asString(value));
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function toTaskDTO(input: unknown): TaskDTO {
  if (!isRecord(input)) throw new Error("Invalid task");
  const logs = Array.isArray(input.timeLogs) ? input.timeLogs.filter(isRecord) : [];
  const subtasks = Array.isArray(input.subtasks) ? input.subtasks.filter(isRecord) : [];
  const links = Array.isArray(input.links) ? input.links.filter(isRecord) : [];
  const tags = Array.isArray(input.tags) ? input.tags.map((tag) => asString(tag)).filter(Boolean) : [];
  let recurring: Recurring | null = null;
  if (isRecord(input.recurring)) {
    const rule = asRule(input.recurring.rule);
    if (rule) recurring = { enabled: Boolean(input.recurring.enabled), rule };
  }
  return {
    id: asId(input),
    title: asString(input.title),
    notes: asString(input.notes),
    status: asStatus(input.status),
    priority: asPriority(input.priority),
    order: typeof input.order === "number" ? input.order : 1024,
    date: asString(input.date),
    tags,
    project: projectRef(input.project),
    estimateMinutes: typeof input.estimateMinutes === "number" ? input.estimateMinutes : null,
    timeLogs: logs.map((log) => ({
      start: iso(log.start) ?? new Date(0).toISOString(),
      end: iso(log.end),
    })),
    totalMinutes: typeof input.totalMinutes === "number" ? input.totalMinutes : closedMinutes(logs.map((log) => ({
      start: log.start instanceof Date || typeof log.start === "string" ? log.start : new Date(0),
      end: log.end instanceof Date || typeof log.end === "string" ? log.end : null,
    }))),
    subtasks: subtasks.map((item) => ({
      id: asId(item),
      title: asString(item.title),
      done: Boolean(item.done),
    })),
    links: links.map((link) => ({ label: asString(link.label), url: asString(link.url) })),
    carriedOverFrom: typeof input.carriedOverFrom === "string" ? input.carriedOverFrom : null,
    recurring,
    recurrenceOf: input.recurrenceOf ? String(input.recurrenceOf) : null,
    completedAt: iso(input.completedAt),
    createdAt: iso(input.createdAt) ?? new Date(0).toISOString(),
    updatedAt: iso(input.updatedAt) ?? new Date(0).toISOString(),
  };
}

export function toProjectDTO(input: unknown): ProjectDTO {
  if (!isRecord(input)) throw new Error("Invalid project");
  return {
    id: asId(input),
    name: asString(input.name),
    color: asString(input.color, "#1c6b48"),
    archived: Boolean(input.archived),
  };
}

export function toReviewDTO(input: unknown, date: string, stats: ReviewDTO["stats"]): ReviewDTO {
  if (!input || !isRecord(input)) {
    return {
      id: null,
      date,
      wentWell: "",
      blockers: "",
      learned: "",
      mood: null,
      standupText: "",
      stats,
    };
  }
  const mood = input.mood;
  return {
    id: asId(input),
    date: asString(input.date, date),
    wentWell: asString(input.wentWell),
    blockers: asString(input.blockers),
    learned: asString(input.learned),
    mood: mood === 1 || mood === 2 || mood === 3 || mood === 4 || mood === 5 ? mood : null,
    standupText: asString(input.standupText),
    stats: isRecord(input.stats)
      ? {
          planned: typeof input.stats.planned === "number" ? input.stats.planned : stats.planned,
          completed: typeof input.stats.completed === "number" ? input.stats.completed : stats.completed,
          minutesTracked:
            typeof input.stats.minutesTracked === "number" ? input.stats.minutesTracked : stats.minutesTracked,
        }
      : stats,
  };
}

export function groupDTO(tasks: TaskDTO[]): ColumnsDTO {
  const columns: ColumnsDTO = { todo: [], in_progress: [], blocked: [], done: [] };
  for (const task of tasks) columns[task.status].push(task);
  return columns;
}

export function userObjectId(userId: string): Types.ObjectId {
  return new Types.ObjectId(userId);
}
