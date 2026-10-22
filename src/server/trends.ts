import { trendScore } from "@/lib/score";
import type { Niche, RangeKey, Sentiment, TrendCard, TrendDetail, TrendStatus } from "@/lib/types";
import { bumpDaily, getDb, limitsFor, type UserRow } from "./db";
import { HttpError } from "./http";
import { istDay, previousDay } from "@/lib/format";

type TrendRow = {
  id: string;
  name: string;
  woeid: number;
  region: TrendCard["region"];
  category: Niche;
  language: TrendCard["language"];
  captured_at: string;
  growth_rate: number;
  growth_pct: number;
  growth_window: RangeKey;
  post_volume: number;
  post_count: number;
  unique_authors: number;
  like_count: number;
  repost_count: number;
  reply_count: number;
  quote_count: number;
  engagement_rate: number;
  sentiment_json: string;
  status: TrendStatus;
  emotion: TrendCard["emotion"];
  summary: string;
  why_trending: string;
  questions_json: string;
  hashtags_json: string;
  keywords_json: string;
  relevance_json: string;
  sparkline_json: string;
  windows_json: string;
  origin: string;
  first_hunter_user_id: string | null;
};

export type TrendFilters = {
  region: string;
  niche: string;
  language: string;
  range: RangeKey;
  status: string;
  q: string;
};

export function listTrends(filters: TrendFilters, user: UserRow): { trends: TrendCard[]; capturedAt: string | null; origin: string } {
  const rows = (getDb()
    .prepare(
      `SELECT * FROM trends
       WHERE (? = 'all' OR category = ?)
         AND (? = 'all' OR language = ?)
         AND (? = 'all' OR status = ?)
         AND (? = '' OR name LIKE ? ESCAPE '\\')
       ORDER BY growth_pct DESC`,
    )
    .all(
      filters.niche,
      filters.niche,
      filters.language,
      filters.language,
      filters.status,
      filters.status,
      filters.q,
      `%${filters.q.replace(/[\\%_]/g, "\\$&")}%`,
    ) as TrendRow[]).filter((row) => regionMatches(filters.region, row.region));

  const niche = (filters.niche !== "all" ? filters.niche : user.niche || "education") as Niche;
  const cards = rows
    .filter((row) => (JSON.parse(row.windows_json) as string[]).includes(filters.range))
    .map((row) => toCard(row, user.id, niche))
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  const capturedAt = rows.reduce<string | null>((latest, row) => {
    if (!latest || row.captured_at > latest) return row.captured_at;
    return latest;
  }, null);
  const origin = rows.some((row) => row.origin === "x-api") ? (rows.every((row) => row.origin === "x-api") ? "x-api" : "mixed") : "demo-cache";
  return { trends: cards, capturedAt, origin };
}

export function getTrend(id: string, user: UserRow): TrendDetail {
  const row = getDb().prepare("SELECT * FROM trends WHERE id = ?").get(id) as TrendRow | undefined;
  if (!row) throw new HttpError(404, "That trend is not in the cache.");
  const gate = recordView(user, id);
  if (!gate.ok) {
    throw new HttpError(402, `Free plan includes ${gate.limit} new trend deep-dives a day.`, "PLAN_LIMIT", {
      limit: gate.limit,
      used: gate.used,
    });
  }
  const niche = (user.niche || row.category) as Niche;
  const card = toCard(row, user.id, niche);
  const posts = getDb()
    .prepare(
      `SELECT id, text, like_count, repost_count, reply_count, quote_count, sentiment, posted_at, language, origin, author_label, x_post_id
       FROM posts WHERE trend_id = ? ORDER BY engagement_score DESC LIMIT 8`,
    )
    .all(id) as {
    id: string;
    text: string;
    like_count: number;
    repost_count: number;
    reply_count: number;
    quote_count: number;
    sentiment: "positive" | "negative" | "neutral";
    posted_at: string;
    language: string;
    origin: string;
    author_label: string;
    x_post_id: string | null;
  }[];
  const snapshots = getDb()
    .prepare(
      `SELECT captured_at, post_count, score FROM trend_snapshots WHERE trend_id = ? ORDER BY captured_at ASC`,
    )
    .all(id) as { captured_at: string; post_count: number; score: number }[];
  return {
    ...card,
    uniqueAuthors: row.unique_authors,
    likes: row.like_count,
    reposts: row.repost_count,
    replies: row.reply_count,
    quotes: row.quote_count,
    sentiment: JSON.parse(row.sentiment_json) as Sentiment,
    questions: JSON.parse(row.questions_json) as string[],
    hashtags: JSON.parse(row.hashtags_json) as string[],
    keywords: JSON.parse(row.keywords_json) as string[],
    woeid: row.woeid,
    snapshots: snapshots.map((snap) => ({ capturedAt: snap.captured_at, postCount: snap.post_count, score: snap.score })),
    posts: posts.map((post) => ({
      id: post.id,
      text: post.text,
      likes: post.like_count,
      reposts: post.repost_count,
      replies: post.reply_count,
      quotes: post.quote_count,
      sentiment: post.sentiment,
      postedAt: post.posted_at,
      language: post.language,
      origin: post.origin,
      authorLabel: post.author_label,
      xPostId: post.x_post_id,
    })),
  };
}

function regionMatches(filter: string, region: string) {
  if (filter === "all") return true;
  if (filter === "india") return region === "india" || region === "bengaluru" || region === "mumbai" || region === "delhi";
  return filter === region;
}

function toCard(row: TrendRow, userId: string, niche: Niche): TrendCard {
  const relevance = JSON.parse(row.relevance_json) as Partial<Record<Niche, number>>;
  const score = Math.round(
    trendScore(row.growth_rate, row.engagement_rate, row.post_volume, relevance[niche] ?? relevance[row.category] ?? 40),
  );
  return {
    id: row.id,
    name: row.name,
    niche: row.category,
    region: row.region,
    language: row.language,
    status: row.status,
    emotion: row.emotion,
    growthPct: row.growth_pct,
    windowKey: row.growth_window,
    postCount: row.post_count,
    score,
    spark: JSON.parse(row.sparkline_json) as number[],
    summary: row.summary,
    why: row.why_trending,
    capturedAt: row.captured_at,
    origin: row.origin,
    hunter: row.first_hunter_user_id === userId ? "you" : row.first_hunter_user_id ? "claimed" : "open",
  };
}

function recordView(user: UserRow, trendId: string): { ok: true } | { ok: false; used: number; limit: number } {
  const db = getDb();
  const day = istDay();
  const seen = db.prepare("SELECT 1 AS ok FROM trend_views WHERE user_id = ? AND trend_id = ? AND day = ?").get(user.id, trendId, day);
  if (seen) return { ok: true };
  const limits = limitsFor(user.plan);
  const usedRow = db.prepare("SELECT trend_views FROM daily_usage WHERE user_id = ? AND day = ?").get(user.id, day) as
    | { trend_views: number }
    | undefined;
  const used = usedRow?.trend_views ?? 0;
  if (limits.views !== null && used >= limits.views) return { ok: false, used, limit: limits.views };
  db.prepare("INSERT INTO trend_views (user_id, trend_id, day) VALUES (?, ?, ?)").run(user.id, trendId, day);
  bumpDaily(user.id, "trend_views");
  return { ok: true };
}

export function touchStreak(user: UserRow) {
  const today = istDay();
  if (user.streak_last_day === today) return user.streak_count;
  const next = user.streak_last_day === previousDay(today) ? user.streak_count + 1 : 1;
  getDb()
    .prepare("UPDATE users SET streak_count = ?, streak_last_day = ?, updated_at = ? WHERE id = ?")
    .run(next, today, new Date().toISOString(), user.id);
  return next;
}

export function loadTrendRow(id: string): TrendRow | undefined {
  return getDb().prepare("SELECT * FROM trends WHERE id = ?").get(id) as TrendRow | undefined;
}

export type { TrendRow };
