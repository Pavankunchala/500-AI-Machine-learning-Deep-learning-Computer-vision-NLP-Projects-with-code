import { cacheKey, defaultProfile, generateIdeaPack, hookAt, type IdeaContext } from "@/lib/ideas";
import type { CreatorProfile, HookStrength, IdeaPack, IdeaStatus, Spice } from "@/lib/types";
import { bumpDaily, getDb, limitsFor, logUsage, type UserRow } from "./db";
import { HttpError } from "./http";
import { createPack } from "./llm";
import { loadTrendRow } from "./trends";

export function profileFromUser(user: UserRow): CreatorProfile {
  if (!user.niche || !user.audience || !user.tone || !user.language) {
    return defaultProfile(user.niche as CreatorProfile["niche"] | null, user.language as CreatorProfile["language"] | null);
  }
  return {
    niche: user.niche as CreatorProfile["niche"],
    audience: user.audience as CreatorProfile["audience"],
    tone: user.tone as CreatorProfile["tone"],
    language: user.language as CreatorProfile["language"],
    platforms: JSON.parse(user.platforms) as CreatorProfile["platforms"],
  };
}

function contextFor(trendId: string, user: UserRow, spice: Spice, variant = 0): IdeaContext {
  const row = loadTrendRow(trendId);
  if (!row) throw new HttpError(404, "That trend is not in the cache.");
  if (!user.onboarded) throw new HttpError(400, "Finish your creator profile first.");
  return {
    trend: {
      name: row.name,
      summary: row.summary,
      why: row.why_trending,
      questions: JSON.parse(row.questions_json) as string[],
      emotion: row.emotion,
      growthPct: row.growth_pct,
      windowKey: row.growth_window,
      sentiment: JSON.parse(row.sentiment_json),
      niche: row.category,
    },
    profile: profileFromUser(user),
    spice,
    variant,
  };
}

export async function getOrCreatePack(user: UserRow, trendId: string, spice: Spice) {
  const ctx = contextFor(trendId, user, spice, 0);
  const key = cacheKey(trendId, ctx.profile, spice);
  const db = getDb();
  const cached = db.prepare("SELECT payload, source, created_at FROM idea_cache WHERE cache_key = ?").get(key) as
    | { payload: string; source: string; created_at: string }
    | undefined;
  if (cached) {
    logUsage({ endpoint: "ideas", source: "cache", status: "hit", latencyMs: 0, actor: user.id, detail: trendId });
    return { pack: JSON.parse(cached.payload) as IdeaPack, source: cached.source, cached: true, createdAt: cached.created_at };
  }
  const limits = limitsFor(user.plan);
  const { istDay } = await import("@/lib/format");
  const usage = db.prepare("SELECT ai_generations FROM daily_usage WHERE user_id = ? AND day = ?").get(user.id, istDay()) as
    | { ai_generations: number }
    | undefined;
  const count = usage?.ai_generations ?? 0;
  if (count >= limits.ai) {
    throw new HttpError(402, `This plan includes ${limits.ai} fresh idea packs a day. Cached packs are still free to open.`, "PLAN_LIMIT", {
      limit: limits.ai,
      used: count,
    });
  }
  const posts = db.prepare("SELECT text, origin FROM posts WHERE trend_id = ?").all(trendId) as { text: string; origin: string }[];
  const started = Date.now();
  const created = await createPack(ctx, posts);
  db.prepare("INSERT INTO idea_cache (cache_key, trend_id, payload, source, created_at) VALUES (?, ?, ?, ?, ?)").run(
    key,
    trendId,
    JSON.stringify(created.pack),
    created.source,
    new Date().toISOString(),
  );
  bumpDaily(user.id, "ai_generations");
  logUsage({
    endpoint: "ideas",
    source: created.source,
    status: "ok",
    latencyMs: Date.now() - started,
    actor: user.id,
    detail: trendId,
  });
  return { pack: created.pack, source: created.source, cached: false, createdAt: new Date().toISOString() };
}

export function rewriteHook(user: UserRow, trendId: string, index: number, spice: Spice, variant: number) {
  const ctx = contextFor(trendId, user, spice, variant);
  const hook = hookAt(ctx, index);
  logUsage({ endpoint: "ideas.hook", source: "local", status: "ok", latencyMs: 0, actor: user.id, detail: trendId });
  return hook;
}

export function saveIdea(input: {
  user: UserRow;
  trendId: string;
  platform: string;
  format: string;
  hook: string;
  outline: string;
  strength: HookStrength | null;
}) {
  const db = getDb();
  const trend = loadTrendRow(input.trendId);
  if (!trend) throw new HttpError(404, "That trend is not in the cache.");
  const existing = db
    .prepare("SELECT id FROM content_ideas WHERE user_id = ? AND trend_id = ? AND hook = ?")
    .get(input.user.id, input.trendId, input.hook) as { id: string } | undefined;
  if (existing) return { id: existing.id, created: false, points: input.user.idea_points, badges: JSON.parse(input.user.badges) as string[] };

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO content_ideas (
      id, user_id, trend_id, platform, format, hook, outline, status, notes, strength_json, awarded, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'to_create', '', ?, 'save', ?, ?)`,
  ).run(id, input.user.id, input.trendId, input.platform, input.format, input.hook, input.outline, input.strength ? JSON.stringify(input.strength) : null, now, now);

  let badges = JSON.parse(input.user.badges) as string[];
  const points = input.user.idea_points + 10;
  if (trend.status === "rising" && !trend.first_hunter_user_id) {
    db.prepare("UPDATE trends SET first_hunter_user_id = ? WHERE id = ? AND first_hunter_user_id IS NULL").run(input.user.id, input.trendId);
    if (!badges.includes("trend_hunter")) badges = [...badges, "trend_hunter"];
  }
  db.prepare("UPDATE users SET idea_points = ?, badges = ?, updated_at = ? WHERE id = ?").run(points, JSON.stringify(badges), now, input.user.id);
  return { id, created: true, points, badges };
}

export function updateIdea(userId: string, ideaId: string, patch: { status?: IdeaStatus; notes?: string }) {
  const db = getDb();
  const row = db.prepare("SELECT * FROM content_ideas WHERE id = ? AND user_id = ?").get(ideaId, userId) as
    | { status: IdeaStatus; awarded: string }
    | undefined;
  if (!row) throw new HttpError(404, "That idea is not on your board.");
  const flags = new Set(row.awarded.split(",").filter(Boolean));
  let delta = 0;
  const status = patch.status ?? row.status;
  if (status === "posted" && !flags.has("posted")) {
    flags.add("posted");
    delta += 5;
  }
  if (status === "performed" && !flags.has("performed")) {
    flags.add("performed");
    delta += 15;
  }
  const now = new Date().toISOString();
  db.prepare(
    `UPDATE content_ideas SET status = ?, notes = COALESCE(?, notes), awarded = ?, updated_at = ? WHERE id = ?`,
  ).run(status, patch.notes ?? null, [...flags].join(","), now, ideaId);
  if (delta) {
    db.prepare("UPDATE users SET idea_points = idea_points + ?, updated_at = ? WHERE id = ?").run(delta, now, userId);
  }
  const user = db.prepare("SELECT idea_points, badges FROM users WHERE id = ?").get(userId) as { idea_points: number; badges: string };
  return { points: user.idea_points, badges: JSON.parse(user.badges) as string[] };
}

export function deleteIdea(userId: string, ideaId: string) {
  const result = getDb().prepare("DELETE FROM content_ideas WHERE id = ? AND user_id = ?").run(ideaId, userId);
  if (result.changes === 0) throw new HttpError(404, "That idea is not on your board.");
}

export function listBoard(userId: string) {
  return getDb()
    .prepare(
      `SELECT c.id, c.trend_id, t.name AS trend_name, c.platform, c.format, c.hook, c.outline, c.status, c.notes, c.strength_json, c.created_at
       FROM content_ideas c LEFT JOIN trends t ON t.id = c.trend_id
       WHERE c.user_id = ? ORDER BY c.created_at DESC`,
    )
    .all(userId) as {
    id: string;
    trend_id: string;
    trend_name: string | null;
    platform: string;
    format: string;
    hook: string;
    outline: string;
    status: IdeaStatus;
    notes: string;
    strength_json: string | null;
    created_at: string;
  }[];
}

export function localPreview(user: UserRow, trendId: string) {
  const ctx = contextFor(trendId, user, "base", 0);
  return generateIdeaPack(ctx).best_angle;
}
