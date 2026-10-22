/** Weighted trend score. Each input is already on a 0–100 scale. */
export function trendScore(growthRate: number, engagementRate: number, postVolume: number, creatorRelevance: number): number {
  const g = clamp(growthRate);
  const e = clamp(engagementRate);
  const v = clamp(postVolume);
  const r = clamp(creatorRelevance);
  return round1(0.35 * g + 0.25 * e + 0.2 * v + 0.2 * r);
}

export function clamp(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, n));
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function engagementScore(likes: number, reposts: number, replies: number, quotes: number): number {
  return likes + reposts * 2 + replies * 1.5 + quotes * 2;
}

export function normalizeTo100(values: number[]): number[] {
  const max = Math.max(...values, 1);
  return values.map((value) => Math.round((Math.max(0, value) / max) * 100));
}

export function growthPercent(previous: number, next: number): number {
  if (previous <= 0) return 0;
  return Math.round(((next - previous) / previous) * 100);
}
