const GAP = 1024;

export function initialOrder(index: number): number {
  return (index + 1) * GAP;
}

export function orderBetween(prev: number | null, next: number | null): number {
  if (prev == null && next == null) return GAP;
  if (prev == null) return (next as number) - GAP;
  if (next == null) return prev + GAP;
  return (prev + next) / 2;
}

export function needsRebalance(prev: number | null, next: number | null): boolean {
  if (prev == null || next == null) return false;
  return next - prev < 1e-6;
}
