import { z } from "zod";
import { PRIORITIES, RECURRENCE_RULES, STATUSES } from "@/lib/types";

export const dateKeySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a YYYY-MM-DD date");

export const statusSchema = z.enum(STATUSES);
export const prioritySchema = z.enum(PRIORITIES);
export const recurrenceRuleSchema = z.enum(RECURRENCE_RULES);

export const subtaskSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, "Subtask title is required").max(200),
  done: z.boolean().default(false),
});

export const linkSchema = z.object({
  label: z.string().trim().min(1, "Link label is required").max(80),
  url: z.string().trim().url("Enter a valid URL").max(2000),
});

export const recurringSchema = z.object({
  enabled: z.boolean(),
  rule: recurrenceRuleSchema,
});

export const taskCreateSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  notes: z.string().max(100_000).optional(),
  status: statusSchema.optional(),
  priority: prioritySchema.optional(),
  date: dateKeySchema,
  tags: z.array(z.string().trim().min(1).max(40)).max(12).optional(),
  project: z.string().nullable().optional(),
  projectQuery: z.string().trim().min(1).max(80).optional(),
  estimateMinutes: z.number().int().min(1).max(24 * 60).nullable().optional(),
  subtasks: z.array(subtaskSchema).max(50).optional(),
  links: z.array(linkSchema).max(20).optional(),
  recurring: recurringSchema.nullable().optional(),
});

export const taskPatchSchema = taskCreateSchema.partial().extend({
  order: z.number().finite().optional(),
  carriedOverFrom: dateKeySchema.nullable().optional(),
});

export const reorderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        status: statusSchema,
        order: z.number().finite(),
      }),
    )
    .min(1)
    .max(300),
});

export const carryOverSchema = z.object({
  from: dateKeySchema,
  to: dateKeySchema,
});

export const projectCreateSchema = z.object({
  name: z.string().trim().min(1, "Project name is required").max(80),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Use a hex color")
    .optional(),
});

export const projectPatchSchema = projectCreateSchema.partial().extend({
  archived: z.boolean().optional(),
});

export const reviewPutSchema = z.object({
  wentWell: z.string().max(5000).optional(),
  blockers: z.string().max(5000).optional(),
  learned: z.string().max(5000).optional(),
  mood: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).nullable().optional(),
  standupText: z.string().max(20_000).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required").max(200),
});

export const discussionCreateSchema = z.object({
  projectId: z.string().trim().min(1),
  title: z.string().trim().min(1, "Give the tile a title").max(120),
  date: dateKeySchema.optional(),
  notes: z.string().max(100_000).optional(),
});

export const discussionPatchSchema = z
  .object({
    title: z.string().trim().min(1, "Give the tile a title").max(120).optional(),
    date: dateKeySchema.optional(),
    notes: z.string().max(100_000).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, "Nothing to update");

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "Use at least 8 characters").max(200),
});

export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export type TaskPatchInput = z.infer<typeof taskPatchSchema>;
export type ReviewPutInput = z.infer<typeof reviewPutSchema>;

export function zodMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Check the form and try again";
}
