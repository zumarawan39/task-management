export const STATUSES = ["todo", "in_progress", "blocked", "done"] as const;
export type Status = (typeof STATUSES)[number];

export const PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const RECURRENCE_RULES = ["daily", "weekdays", "weekly"] as const;
export type RecurrenceRule = (typeof RECURRENCE_RULES)[number];

export type Mood = 1 | 2 | 3 | 4 | 5;

export type Subtask = {
  id: string;
  title: string;
  done: boolean;
};

export type TaskLink = {
  label: string;
  url: string;
};

export type TimeLog = {
  start: string;
  end: string | null;
};

export type Recurring = {
  enabled: boolean;
  rule: RecurrenceRule;
};

export type ProjectRef = {
  id: string;
  name: string;
  color: string;
};

export type TaskDTO = {
  id: string;
  title: string;
  notes: string;
  status: Status;
  priority: Priority;
  order: number;
  date: string;
  tags: string[];
  project: ProjectRef | null;
  estimateMinutes: number | null;
  timeLogs: TimeLog[];
  totalMinutes: number;
  subtasks: Subtask[];
  links: TaskLink[];
  carriedOverFrom: string | null;
  recurring: Recurring | null;
  recurrenceOf: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProjectDTO = {
  id: string;
  name: string;
  color: string;
  archived: boolean;
};

export type DiscussionDTO = {
  id: string;
  projectId: string;
  title: string;
  notes: string;
  date: string;
  updatedAt: string;
};

export type ReviewStats = {
  planned: number;
  completed: number;
  minutesTracked: number;
};

export type ReviewDTO = {
  id: string | null;
  date: string;
  wentWell: string;
  blockers: string;
  learned: string;
  mood: Mood | null;
  standupText: string;
  stats: ReviewStats;
};

export type ColumnsDTO = Record<Status, TaskDTO[]>;

export type ActiveTimerDTO = {
  taskId: string;
  title: string;
  date: string;
  startedAt: string;
  totalMinutes: number;
};

export type DayStat = {
  date: string;
  planned: number;
  completed: number;
  minutes: number;
};

export type NamedMinutes = {
  name: string;
  minutes: number;
  color: string;
};

export type EstimateRow = {
  id: string;
  title: string;
  date: string;
  estimateMinutes: number;
  totalMinutes: number;
};

export type StatsDTO = {
  from: string;
  to: string;
  days: DayStat[];
  completionRate: { date: string; rate: number }[];
  byProject: NamedMinutes[];
  byTag: NamedMinutes[];
  streak: number;
  bestStreak: number;
  /** Days with a saved review in the 14 days ending today. */
  recentReviews: string[];
  estimates: EstimateRow[];
  totals: {
    planned: number;
    completed: number;
    minutes: number;
    estimated: number;
    actual: number;
    /** Estimates of the tasks counted in actual, for an actual ÷ estimate ratio. */
    trackedEstimate: number;
  };
};

export type ReorderItem = {
  id: string;
  status: Status;
  order: number;
};

export const STATUS_LABEL: Record<Status, string> = {
  todo: "To do",
  in_progress: "In progress",
  blocked: "Blocked",
  done: "Done",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const PROJECT_COLORS = [
  "#1c6b48",
  "#1e4f86",
  "#8a5a12",
  "#b42318",
  "#5b4b8a",
  "#0f6f7a",
  "#3f6212",
  "#9a3412",
] as const;

export const MOODS: { value: Mood; label: string }[] = [
  { value: 1, label: "Drained" },
  { value: 2, label: "Low" },
  { value: 3, label: "Steady" },
  { value: 4, label: "Good" },
  { value: 5, label: "Great" },
];

export function colorForName(name: string): string {
  let hash = 0;
  for (const char of name) hash = (hash + char.charCodeAt(0) * 17) % PROJECT_COLORS.length;
  return PROJECT_COLORS[hash] ?? PROJECT_COLORS[0];
}
