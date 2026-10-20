import { addDays, format, isValid, parse } from "date-fns";

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

export function formatDayKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function todayKey(now = new Date()): string {
  return formatDayKey(now);
}

export function parseDayKey(value: string): Date | null {
  if (!DATE_KEY.test(value)) return null;
  const date = parse(value, "yyyy-MM-dd", new Date());
  if (!isValid(date)) return null;
  if (format(date, "yyyy-MM-dd") !== value) return null;
  return date;
}

export function shiftDay(key: string, days: number): string {
  const date = parseDayKey(key);
  if (!date) return key;
  return formatDayKey(addDays(date, days));
}

export function formatMonth(key: string): string {
  const date = parseDayKey(key);
  return date ? format(date, "MMMM") : "";
}

export function formatWeekday(key: string): string {
  const date = parseDayKey(key);
  return date ? format(date, "EEEE") : "";
}

export function formatDayNumber(key: string): string {
  const date = parseDayKey(key);
  return date ? format(date, "d") : "";
}

export function formatLong(key: string): string {
  const date = parseDayKey(key);
  return date ? format(date, "EEEE, d MMMM yyyy") : key;
}

export function formatShort(key: string): string {
  const date = parseDayKey(key);
  return date ? format(date, "d MMM") : key;
}

export function eachDateKey(from: string, to: string): string[] {
  const start = parseDayKey(from);
  const end = parseDayKey(to);
  if (!start || !end || start > end) return [];
  const keys: string[] = [];
  let cursor = start;
  while (cursor <= end) {
    keys.push(formatDayKey(cursor));
    cursor = addDays(cursor, 1);
  }
  return keys;
}

export function isWeekday(key: string): boolean {
  const date = parseDayKey(key);
  if (!date) return false;
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

export function sameWeekday(a: string, b: string): boolean {
  const left = parseDayKey(a);
  const right = parseDayKey(b);
  if (!left || !right) return false;
  return left.getDay() === right.getDay();
}

export function formatTitle(key: string): string {
  const date = parseDayKey(key);
  return date ? format(date, "EEEE, MMM d") : key;
}

export function formatMonthDay(key: string): string {
  const date = parseDayKey(key);
  return date ? format(date, "MMM d") : key;
}
