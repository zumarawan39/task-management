export function formatMinutes(minutes: number): string {
  const rounded = Math.max(0, Math.round(minutes));
  const hours = Math.floor(rounded / 60);
  const rest = rounded % 60;
  if (hours === 0) return `${rest}m`;
  if (rest === 0) return `${hours}h`;
  return `${hours}h ${rest}m`;
}

export function formatClock(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(rest).padStart(2, "0");
  if (hours > 0) return `${hours}:${mm}:${ss}`;
  return `${minutes}:${ss}`;
}

export function closedMinutes(logs: { start: Date | string; end: Date | string | null }[]): number {
  let ms = 0;
  for (const log of logs) {
    if (!log.end) continue;
    const start = new Date(log.start).getTime();
    const end = new Date(log.end).getTime();
    if (Number.isNaN(start) || Number.isNaN(end)) continue;
    ms += Math.max(0, end - start);
  }
  return Math.round(ms / 60000);
}

export function liveSeconds(
  totalMinutes: number,
  logs: { start: string; end: string | null }[],
  now: number,
): number {
  const open = logs.find((log) => log.end == null);
  const base = Math.max(0, totalMinutes) * 60;
  if (!open) return base;
  const started = new Date(open.start).getTime();
  if (Number.isNaN(started)) return base;
  return base + Math.max(0, Math.floor((now - started) / 1000));
}

/** Reads "90", "90m", "2h", "1h30m", "1h 30m" or "1.5h" as minutes; null when it isn't a duration. */
export function parseEstimate(input: string): number | null {
  const value = input.trim().toLowerCase().replace(/\s+/g, "");
  if (!value) return null;
  let minutes: number | null = null;
  if (/^\d+$/.test(value)) minutes = Number(value);
  else if (/^\d+m$/.test(value)) minutes = Number(value.slice(0, -1));
  else if (/^\d+(\.\d+)?h$/.test(value)) minutes = Math.round(Number(value.slice(0, -1)) * 60);
  else {
    const match = /^(\d+)h(\d+)m?$/.exec(value);
    if (match) minutes = Number(match[1]) * 60 + Number(match[2]);
  }
  return minutes != null && minutes > 0 && minutes <= 24 * 60 ? minutes : null;
}
