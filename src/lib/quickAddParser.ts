import type { Priority } from "@/lib/types";

const PRIORITY_TOKEN =
  /!(low|medium|high|urgent|l|m|h|u)(?=\s|$)/i;
const TAG_TOKEN = /#([a-z0-9][\w-]*)/gi;
const PROJECT_TOKEN = /@([a-z0-9][\w-]*)/i;
const ESTIMATE_TOKEN = /~(\d+)\s*(h|m)\b|~(\d+)\s*h\s*(\d+)\s*m\b/i;

const PRIORITY_MAP: Record<string, Priority> = {
  l: "low",
  low: "low",
  m: "medium",
  medium: "medium",
  h: "high",
  high: "high",
  u: "urgent",
  urgent: "urgent",
};

export type QuickAddParsed = {
  title: string;
  tags: string[];
  priority: Priority | null;
  estimateMinutes: number | null;
  projectQuery: string | null;
};

export function parseQuickAdd(input: string): QuickAddParsed {
  let working = input.trim();
  let priority: Priority | null = null;
  let estimateMinutes: number | null = null;
  let projectQuery: string | null = null;
  const tags: string[] = [];

  const priorityMatch = working.match(PRIORITY_TOKEN);
  if (priorityMatch?.[1]) {
    priority = PRIORITY_MAP[priorityMatch[1].toLowerCase()] ?? null;
    working = working.replace(priorityMatch[0], " ");
  }

  const estimateMatch = working.match(ESTIMATE_TOKEN);
  if (estimateMatch) {
    if (estimateMatch[3] && estimateMatch[4]) {
      estimateMinutes = Number(estimateMatch[3]) * 60 + Number(estimateMatch[4]);
    } else if (estimateMatch[1] && estimateMatch[2]) {
      const amount = Number(estimateMatch[1]);
      estimateMinutes = estimateMatch[2].toLowerCase() === "h" ? amount * 60 : amount;
    }
    working = working.replace(estimateMatch[0], " ");
  }

  const projectMatch = working.match(PROJECT_TOKEN);
  if (projectMatch?.[1]) {
    projectQuery = projectMatch[1];
    working = working.replace(projectMatch[0], " ");
  }

  for (const match of working.matchAll(TAG_TOKEN)) {
    if (match[1]) tags.push(match[1].toLowerCase());
  }
  working = working.replace(TAG_TOKEN, " ");

  return {
    title: working.replace(/\s+/g, " ").trim(),
    tags,
    priority,
    estimateMinutes,
    projectQuery,
  };
}

export type QuickAddToken = {
  text: string;
  kind: "text" | "space" | "priority" | "tag" | "project" | "estimate" | "invalid";
  start: number;
};

const WHOLE_PRIORITY = /^!(low|medium|high|urgent|l|m|h|u)$/i;
const WHOLE_TAG = /^#[a-z0-9][\w-]*$/i;
const WHOLE_PROJECT = /^@[a-z0-9][\w-]*$/i;
const WHOLE_ESTIMATE = /^~(\d+(h|m)|\d+h\d+m)$/i;

/** Splits raw input into highlightable pieces without changing a single character. */
export function tokenizeQuickAdd(input: string): QuickAddToken[] {
  const tokens: QuickAddToken[] = [];
  for (const match of input.matchAll(/\s+|\S+/g)) {
    const text = match[0];
    const start = match.index ?? 0;
    let kind: QuickAddToken["kind"] = "text";
    if (/^\s+$/.test(text)) kind = "space";
    else if (WHOLE_PRIORITY.test(text)) kind = "priority";
    else if (WHOLE_TAG.test(text)) kind = "tag";
    else if (WHOLE_PROJECT.test(text)) kind = "project";
    else if (WHOLE_ESTIMATE.test(text)) kind = "estimate";
    else if (/^[~!]\S/.test(text)) kind = "invalid";
    tokens.push({ text, kind, start });
  }
  return tokens;
}
