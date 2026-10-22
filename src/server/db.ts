import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "fs";
import path from "path";
import { PLAN_LIMITS, roleForPlan, WOEID } from "@/lib/constants";
import { istDay } from "@/lib/format";
import { engagementScore, trendScore } from "@/lib/score";
import { SEED_TRENDS, snapshotCounts, trendWindows } from "@/lib/seed";
import type { Plan, Platform, Role } from "@/lib/types";
import { DEMO_ADMIN, DEMO_CREATOR, demoHintsEnabled } from "./demo";
import { hashPassword } from "./password";

const SEED_VERSION = "1";

const globalForDb = globalThis as unknown as { __tp?: { db: DatabaseSync; ready: Promise<void> } };

export type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: Role;
  niche: string | null;
  audience: string | null;
  tone: string | null;
  language: string | null;
  platforms: string;
  plan: Plan;
  onboarded: number;
  streak_count: number;
  streak_last_day: string | null;
  idea_points: number;
  badges: string;
  totp_secret: string | null;
  totp_enabled: number;
  created_at: string;
  updated_at: string;
};

export function getDb(): DatabaseSync {
  if (!globalForDb.__tp) {
    const dir = path.join(process.cwd(), "data");
    mkdirSync(dir, { recursive: true });
    const db = new DatabaseSync(path.join(dir, "trendpulse.db"));
    db.exec("PRAGMA journal_mode = WAL;");
    db.exec("PRAGMA foreign_keys = ON;");
    migrate(db);
    globalForDb.__tp = { db, ready: seed(db) };
  }
  return globalForDb.__tp.db;
}

export function dbReady(): Promise<void> {
  getDb();
  return globalForDb.__tp!.ready;
}

function migrate(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      niche TEXT,
      audience TEXT,
      tone TEXT,
      language TEXT,
      platforms TEXT NOT NULL DEFAULT '[]',
      plan TEXT NOT NULL,
      onboarded INTEGER NOT NULL DEFAULT 0,
      streak_count INTEGER NOT NULL DEFAULT 0,
      streak_last_day TEXT,
      idea_points INTEGER NOT NULL DEFAULT 0,
      badges TEXT NOT NULL DEFAULT '[]',
      totp_secret TEXT,
      totp_enabled INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      access_hash TEXT NOT NULL,
      refresh_hash TEXT NOT NULL,
      previous_refresh_hash TEXT,
      access_expires_at TEXT NOT NULL,
      refresh_expires_at TEXT NOT NULL,
      user_agent TEXT,
      revoked INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS trends (
      id TEXT PRIMARY KEY,
      x_trend_id TEXT,
      name TEXT NOT NULL,
      woeid INTEGER NOT NULL,
      region TEXT NOT NULL,
      category TEXT NOT NULL,
      language TEXT NOT NULL,
      first_seen_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL,
      captured_at TEXT NOT NULL,
      current_score REAL NOT NULL,
      growth_rate REAL NOT NULL,
      growth_pct REAL NOT NULL,
      growth_window TEXT NOT NULL,
      post_volume REAL NOT NULL,
      post_count INTEGER NOT NULL,
      unique_authors INTEGER NOT NULL,
      like_count INTEGER NOT NULL,
      repost_count INTEGER NOT NULL,
      reply_count INTEGER NOT NULL,
      quote_count INTEGER NOT NULL,
      engagement_rate REAL NOT NULL,
      sentiment_score REAL NOT NULL,
      sentiment_json TEXT NOT NULL,
      status TEXT NOT NULL,
      emotion TEXT NOT NULL,
      summary TEXT NOT NULL,
      why_trending TEXT NOT NULL,
      questions_json TEXT NOT NULL,
      hashtags_json TEXT NOT NULL,
      keywords_json TEXT NOT NULL,
      relevance_json TEXT NOT NULL,
      sparkline_json TEXT NOT NULL,
      windows_json TEXT NOT NULL,
      origin TEXT NOT NULL,
      first_hunter_user_id TEXT,
      raw_payload TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS trend_snapshots (
      id TEXT PRIMARY KEY,
      trend_id TEXT NOT NULL,
      captured_at TEXT NOT NULL,
      post_count INTEGER NOT NULL,
      like_count INTEGER NOT NULL,
      repost_count INTEGER NOT NULL,
      reply_count INTEGER NOT NULL,
      quote_count INTEGER NOT NULL,
      unique_authors INTEGER NOT NULL,
      score REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      x_post_id TEXT,
      trend_id TEXT NOT NULL,
      author_id TEXT NOT NULL,
      author_label TEXT NOT NULL,
      text TEXT NOT NULL,
      like_count INTEGER NOT NULL,
      repost_count INTEGER NOT NULL,
      reply_count INTEGER NOT NULL,
      quote_count INTEGER NOT NULL,
      posted_at TEXT NOT NULL,
      language TEXT NOT NULL,
      sentiment TEXT NOT NULL,
      engagement_score REAL NOT NULL,
      origin TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS content_ideas (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      trend_id TEXT NOT NULL,
      platform TEXT NOT NULL,
      format TEXT NOT NULL,
      hook TEXT NOT NULL,
      outline TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      strength_json TEXT,
      awarded TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS idea_cache (
      cache_key TEXT PRIMARY KEY,
      trend_id TEXT NOT NULL,
      payload TEXT NOT NULL,
      source TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      niche TEXT NOT NULL,
      threshold REAL NOT NULL,
      channel TEXT NOT NULL,
      destination TEXT,
      last_sent_at TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      trend_id TEXT,
      channel TEXT NOT NULL,
      read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS api_usage (
      id TEXT PRIMARY KEY,
      endpoint TEXT NOT NULL,
      source TEXT NOT NULL,
      status TEXT NOT NULL,
      latency_ms INTEGER NOT NULL,
      units INTEGER NOT NULL DEFAULT 1,
      actor TEXT,
      detail TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS daily_usage (
      user_id TEXT NOT NULL,
      day TEXT NOT NULL,
      trend_views INTEGER NOT NULL DEFAULT 0,
      ai_generations INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, day)
    );
    CREATE TABLE IF NOT EXISTS trend_views (
      user_id TEXT NOT NULL,
      trend_id TEXT NOT NULL,
      day TEXT NOT NULL,
      PRIMARY KEY (user_id, trend_id, day)
    );
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      payload TEXT NOT NULL,
      run_after TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      last_error TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      actor_id TEXT,
      action TEXT NOT NULL,
      detail TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS rate_buckets (
      key TEXT PRIMARY KEY,
      hits INTEGER NOT NULL,
      window_start INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_trends_filter ON trends(region, category, language, status);
    CREATE INDEX IF NOT EXISTS idx_posts_trend ON posts(trend_id);
    CREATE INDEX IF NOT EXISTS idx_ideas_user ON content_ideas(user_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_usage_time ON api_usage(created_at);
    CREATE INDEX IF NOT EXISTS idx_sessions_access ON sessions(access_hash);
    CREATE INDEX IF NOT EXISTS idx_sessions_refresh ON sessions(refresh_hash);
  `);
}

async function seed(db: DatabaseSync) {
  seedTrends(db);
  if (!demoHintsEnabled()) return;
  const count = db.prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number };
  if (count.n > 0) return;
  const now = new Date().toISOString();
  const insert = db.prepare(`
    INSERT INTO users (
      id, email, password_hash, name, role, niche, audience, tone, language, platforms,
      plan, onboarded, streak_count, idea_points, badges, totp_enabled, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, '[]', 0, ?, ?)
  `);
  insert.run(
    crypto.randomUUID(),
    DEMO_CREATOR.email,
    await hashPassword(DEMO_CREATOR.password),
    DEMO_CREATOR.name,
    "creator_pro",
    "education",
    "students",
    "educational",
    "en",
    JSON.stringify(["x", "instagram"] satisfies Platform[]),
    "creator",
    1,
    now,
    now,
  );
  insert.run(
    crypto.randomUUID(),
    DEMO_ADMIN.email,
    await hashPassword(DEMO_ADMIN.password),
    DEMO_ADMIN.name,
    "admin",
    "business",
    "founders",
    "professional",
    "en",
    JSON.stringify(["x", "linkedin"] satisfies Platform[]),
    "agency",
    1,
    now,
    now,
  );
}

function seedTrends(db: DatabaseSync) {
  const current = db.prepare("SELECT value FROM meta WHERE key = 'seed'").get() as { value: string } | undefined;
  if (current?.value === SEED_VERSION) return;
  const now = new Date();
  db.exec("BEGIN");
  try {
    db.exec("DELETE FROM posts; DELETE FROM trend_snapshots; DELETE FROM trends; DELETE FROM idea_cache;");
    const insertTrend = db.prepare(`
      INSERT INTO trends (
        id, x_trend_id, name, woeid, region, category, language, first_seen_at, last_seen_at, captured_at,
        current_score, growth_rate, growth_pct, growth_window, post_volume, post_count, unique_authors,
        like_count, repost_count, reply_count, quote_count, engagement_rate, sentiment_score, sentiment_json,
        status, emotion, summary, why_trending, questions_json, hashtags_json, keywords_json, relevance_json,
        sparkline_json, windows_json, origin, first_hunter_user_id, raw_payload
      ) VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'demo-cache', NULL, ?)
    `);
    const insertSnap = db.prepare(`
      INSERT INTO trend_snapshots (
        id, trend_id, captured_at, post_count, like_count, repost_count, reply_count, quote_count, unique_authors, score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertPost = db.prepare(`
      INSERT INTO posts (
        id, x_post_id, trend_id, author_id, author_label, text, like_count, repost_count, reply_count, quote_count,
        posted_at, language, sentiment, engagement_score, origin
      ) VALUES (?, NULL, ?, ?, 'Snapshot sample', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'demo-cache')
    `);
    for (const trend of SEED_TRENDS) {
      const captured = now.toISOString();
      const score = trendScore(trend.growthRate, trend.engagementRate, trend.postVolume, trend.relevance[trend.niche]);
      const sentimentScore = (trend.sentiment.positive - trend.sentiment.negative) / 100;
      insertTrend.run(
        trend.id,
        trend.name,
        WOEID[trend.region],
        trend.region,
        trend.niche,
        trend.language,
        captured,
        captured,
        captured,
        score,
        trend.growthRate,
        trend.growthPct,
        trend.windowKey,
        trend.postVolume,
        trend.postCount,
        trend.uniqueAuthors,
        trend.likes,
        trend.reposts,
        trend.replies,
        trend.quotes,
        trend.engagementRate,
        sentimentScore,
        JSON.stringify(trend.sentiment),
        trend.status,
        trend.emotion,
        trend.summary,
        trend.why,
        JSON.stringify(trend.questions),
        JSON.stringify(trend.hashtags),
        JSON.stringify(trend.keywords),
        JSON.stringify(trend.relevance),
        JSON.stringify(trend.spark),
        JSON.stringify(trendWindows(trend)),
        JSON.stringify({ origin: "demo-cache", id: trend.id }),
      );
      const counts = snapshotCounts(trend.postCount, trend.spark);
      counts.forEach((count, index) => {
        const at = new Date(now.getTime() - (counts.length - 1 - index) * 15 * 60 * 1000).toISOString();
        const ratio = count / trend.postCount;
        insertSnap.run(
          `${trend.id}:snap:${index}`,
          trend.id,
          at,
          count,
          Math.round(trend.likes * ratio),
          Math.round(trend.reposts * ratio),
          Math.round(trend.replies * ratio),
          Math.round(trend.quotes * ratio),
          Math.max(1, Math.round(trend.uniqueAuthors * ratio)),
          score,
        );
      });
      trend.posts.forEach((post, index) => {
        insertPost.run(
          `${trend.id}:post:${index}`,
          trend.id,
          `sample:${trend.id}:${index + 1}`,
          post.text,
          post.likes,
          post.reposts,
          post.replies,
          post.quotes,
          new Date(now.getTime() - post.minutesAgo * 60 * 1000).toISOString(),
          trend.language,
          post.sentiment,
          engagementScore(post.likes, post.reposts, post.replies, post.quotes),
        );
      });
    }
    db.prepare(
      "INSERT INTO meta (key, value) VALUES ('seed', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    ).run(SEED_VERSION);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function logUsage(entry: {
  endpoint: string;
  source: string;
  status: string;
  latencyMs: number;
  units?: number;
  actor?: string | null;
  detail?: string | null;
}) {
  getDb()
    .prepare(
      `INSERT INTO api_usage (id, endpoint, source, status, latency_ms, units, actor, detail, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      crypto.randomUUID(),
      entry.endpoint,
      entry.source,
      entry.status,
      entry.latencyMs,
      entry.units ?? 1,
      entry.actor ?? null,
      entry.detail ?? null,
      new Date().toISOString(),
    );
}

export function audit(actorId: string | null, action: string, detail?: string) {
  getDb()
    .prepare("INSERT INTO audit_log (id, actor_id, action, detail, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(crypto.randomUUID(), actorId, action, detail ?? null, new Date().toISOString());
}

export function usageFor(userId: string) {
  const day = istDay();
  const row = getDb()
    .prepare("SELECT trend_views, ai_generations FROM daily_usage WHERE user_id = ? AND day = ?")
    .get(userId, day) as { trend_views: number; ai_generations: number } | undefined;
  return { views: row?.trend_views ?? 0, ai: row?.ai_generations ?? 0, day };
}

export function limitsFor(plan: Plan) {
  return PLAN_LIMITS[plan];
}

export function bumpDaily(userId: string, field: "trend_views" | "ai_generations") {
  const day = istDay();
  getDb()
    .prepare(
      `INSERT INTO daily_usage (user_id, day, trend_views, ai_generations)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(user_id, day) DO UPDATE SET ${field} = ${field} + 1`,
    )
    .run(userId, day, field === "trend_views" ? 1 : 0, field === "ai_generations" ? 1 : 0);
}

export { roleForPlan };
