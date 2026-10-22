import { NextRequest } from "next/server";
import { requireAdmin } from "@/server/auth";
import { getDb } from "@/server/db";
import { json, route } from "@/server/http";
import { listJobs } from "@/server/ingest";
import { xBudget } from "@/server/x-client";

export const GET = route(async (req: NextRequest) => {
  requireAdmin(req);
  const db = getDb();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const totals = db
    .prepare(
      `SELECT source, status, COUNT(*) AS n, SUM(units) AS units
       FROM api_usage WHERE created_at >= ? GROUP BY source, status ORDER BY n DESC`,
    )
    .all(since) as { source: string; status: string; n: number; units: number }[];
  const recent = db
    .prepare(
      `SELECT endpoint, source, status, latency_ms, detail, created_at
       FROM api_usage ORDER BY created_at DESC LIMIT 40`,
    )
    .all() as { endpoint: string; source: string; status: string; latency_ms: number; detail: string | null; created_at: string }[];
  const users = db
    .prepare("SELECT id, email, name, plan, role, created_at FROM users ORDER BY created_at DESC LIMIT 50")
    .all() as { id: string; email: string; name: string; plan: string; role: string; created_at: string }[];
  const counts = {
    trends: (db.prepare("SELECT COUNT(*) AS n FROM trends").get() as { n: number }).n,
    posts: (db.prepare("SELECT COUNT(*) AS n FROM posts").get() as { n: number }).n,
    ideas: (db.prepare("SELECT COUNT(*) AS n FROM content_ideas").get() as { n: number }).n,
    cachePacks: (db.prepare("SELECT COUNT(*) AS n FROM idea_cache").get() as { n: number }).n,
  };
  return json({
    totals,
    recent,
    users,
    counts,
    jobs: listJobs(),
    budget: xBudget(),
    xConfigured: Boolean(process.env.X_BEARER_TOKEN),
    llmConfigured: Boolean(process.env.LLM_API_KEY),
  });
});
