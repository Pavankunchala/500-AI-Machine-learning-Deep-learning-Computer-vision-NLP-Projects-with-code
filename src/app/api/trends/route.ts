import { NextRequest } from "next/server";
import { LANGUAGES, NICHES, RANGES, REGIONS, STATUSES } from "@/lib/types";
import type { RangeKey } from "@/lib/types";
import { evaluateAlerts } from "@/server/alerts";
import { findUserById, publicUser, requireUser } from "@/server/auth";
import { logUsage } from "@/server/db";
import { json, rateLimit, route } from "@/server/http";
import { listTrends, touchStreak } from "@/server/trends";

function oneOf<T extends string>(allowed: readonly T[], value: string | null, fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export const GET = route(async (req: NextRequest) => {
  const user = requireUser(req);
  rateLimit(`trends:${user.id}`, 60, 60 * 1000);
  const params = req.nextUrl.searchParams;
  const started = Date.now();
  const filters = {
    region: oneOf(["all", ...REGIONS], params.get("region"), "india"),
    niche: oneOf(["all", ...NICHES], params.get("niche"), "all"),
    language: oneOf(["all", ...LANGUAGES], params.get("language"), "all"),
    range: oneOf(RANGES, params.get("range"), "24h") as RangeKey,
    status: oneOf(["all", ...STATUSES], params.get("status"), "all"),
    q: (params.get("q") || "").trim().slice(0, 80),
  };
  const streak = touchStreak(user);
  await evaluateAlerts(user);
  const result = listTrends(filters, user);
  logUsage({
    endpoint: "trends.list",
    source: "cache",
    status: "hit",
    latencyMs: Date.now() - started,
    actor: user.id,
    detail: result.origin,
  });
  const fresh = findUserById(user.id);
  return json({ ...result, streak, user: publicUser(fresh ?? user) });
});
