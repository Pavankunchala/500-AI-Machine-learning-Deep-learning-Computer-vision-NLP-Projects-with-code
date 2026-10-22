import { getDb, logUsage } from "./db";

const WINDOW_MS = 15 * 60 * 1000;
const BUDGET = {
  trends: 75,
  "recent-search": 450,
} as const;

type BudgetKey = keyof typeof BUDGET;

export class XRateLimited extends Error {
  retryAt: number;
  constructor(retryAt: number) {
    super("X rate limit reached. The job will wait for the window to reset.");
    this.retryAt = retryAt;
  }
}

function takeBudget(key: BudgetKey) {
  const db = getDb();
  const bucket = `x:${key}`;
  const now = Date.now();
  const row = db.prepare("SELECT hits, window_start FROM rate_buckets WHERE key = ?").get(bucket) as
    | { hits: number; window_start: number }
    | undefined;
  if (!row || now - row.window_start >= WINDOW_MS) {
    db.prepare(
      `INSERT INTO rate_buckets (key, hits, window_start) VALUES (?, 1, ?)
       ON CONFLICT(key) DO UPDATE SET hits = 1, window_start = excluded.window_start`,
    ).run(bucket, now);
    return;
  }
  if (row.hits >= BUDGET[key]) {
    throw new XRateLimited(row.window_start + WINDOW_MS);
  }
  db.prepare("UPDATE rate_buckets SET hits = hits + 1 WHERE key = ?").run(bucket);
}

export function xBudget() {
  const db = getDb();
  const now = Date.now();
  return (Object.keys(BUDGET) as BudgetKey[]).map((key) => {
    const row = db.prepare("SELECT hits, window_start FROM rate_buckets WHERE key = ?").get(`x:${key}`) as
      | { hits: number; window_start: number }
      | undefined;
    const fresh = row && now - row.window_start < WINDOW_MS;
    return { endpoint: key, used: fresh ? row!.hits : 0, limit: BUDGET[key], windowMs: WINDOW_MS };
  });
}

async function xFetch(url: string, endpoint: BudgetKey) {
  const token = process.env.X_BEARER_TOKEN;
  if (!token) return { skipped: true as const };
  takeBudget(endpoint);
  const started = Date.now();
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(12_000),
  });
  logUsage({
    endpoint,
    source: "x-api",
    status: String(response.status),
    latencyMs: Date.now() - started,
    actor: "system",
    detail: new URL(url).pathname,
  });
  if (response.status === 429) {
    const reset = Number(response.headers.get("x-rate-limit-reset") || 0);
    throw new XRateLimited(reset > 0 ? reset * 1000 : Date.now() + WINDOW_MS);
  }
  if (!response.ok) {
    throw new Error(`X request failed with status ${response.status}`);
  }
  return { skipped: false as const, body: await response.json() };
}

export async function fetchTrendsByWoeid(woeid: number) {
  const url = new URL(`https://api.x.com/2/trends/by/woeid/${woeid}`);
  url.searchParams.set("max_trends", "20");
  url.searchParams.set("trend.fields", "trend_name,tweet_count");
  const result = await xFetch(url.toString(), "trends");
  if (result.skipped) return { skipped: true as const, trends: [] as { name: string; tweetCount: number }[] };
  return { skipped: false as const, trends: parseTrends(result.body) };
}

export async function searchRecent(query: string) {
  const url = new URL("https://api.x.com/2/tweets/search/recent");
  url.searchParams.set("query", `${query} -is:retweet`);
  url.searchParams.set("max_results", "10");
  url.searchParams.set("tweet.fields", "created_at,public_metrics,lang,author_id");
  const result = await xFetch(url.toString(), "recent-search");
  if (result.skipped) return { skipped: true as const, posts: [] as ParsedPost[] };
  return { skipped: false as const, posts: parsePosts(result.body) };
}

export type ParsedPost = {
  id: string;
  text: string;
  authorId: string;
  createdAt: string;
  lang: string;
  likes: number;
  reposts: number;
  replies: number;
  quotes: number;
};

function parseTrends(body: unknown): { name: string; tweetCount: number }[] {
  const data = Array.isArray((body as { data?: unknown }).data)
    ? (body as { data: unknown[] }).data
    : Array.isArray(body)
      ? body
      : [];
  return data
    .map((item) => {
      const row = item as Record<string, unknown>;
      const name = String(row.trend_name ?? row.name ?? "").trim();
      const tweetCount = Number(row.tweet_count ?? 0);
      return { name, tweetCount: Number.isFinite(tweetCount) ? tweetCount : 0 };
    })
    .filter((trend) => trend.name);
}

function parsePosts(body: unknown): ParsedPost[] {
  const data = (body as { data?: unknown[] }).data;
  if (!Array.isArray(data)) return [];
  return data
    .map((item) => {
      const row = item as Record<string, unknown>;
      const metrics = (row.public_metrics ?? {}) as Record<string, unknown>;
      const text = String(row.text ?? "").trim();
      if (!text || !row.id) return null;
      return {
        id: String(row.id),
        text,
        authorId: String(row.author_id ?? "unknown"),
        createdAt: String(row.created_at ?? new Date().toISOString()),
        lang: String(row.lang ?? "und"),
        likes: Number(metrics.like_count ?? 0),
        reposts: Number(metrics.retweet_count ?? 0),
        replies: Number(metrics.reply_count ?? 0),
        quotes: Number(metrics.quote_count ?? 0),
      };
    })
    .filter((post): post is ParsedPost => Boolean(post));
}
