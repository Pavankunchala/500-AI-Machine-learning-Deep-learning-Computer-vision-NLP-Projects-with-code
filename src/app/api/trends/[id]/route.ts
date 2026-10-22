import { NextRequest } from "next/server";
import { localPreview } from "@/server/ideas";
import { requireUser } from "@/server/auth";
import { logUsage } from "@/server/db";
import { HttpError, json, rateLimit, route } from "@/server/http";
import { getTrend } from "@/server/trends";

export const GET = route(async (req: NextRequest, ctx) => {
  const user = requireUser(req);
  rateLimit(`trend:${user.id}`, 60, 60 * 1000);
  const { id } = await ctx.params;
  if (!/^[a-z0-9:-]{1,90}$/.test(id)) throw new HttpError(404, "That trend is not in the cache.");
  const started = Date.now();
  const trend = getTrend(id, user);
  const bestAngle = user.onboarded ? localPreview(user, id) : null;
  logUsage({ endpoint: "trends.detail", source: "cache", status: "hit", latencyMs: Date.now() - started, actor: user.id, detail: id });
  return json({ trend, bestAngle });
});
