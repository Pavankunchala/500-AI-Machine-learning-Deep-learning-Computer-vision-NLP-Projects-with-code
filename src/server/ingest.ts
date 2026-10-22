import { WOEID } from "@/lib/constants";
import { growthPercent, normalizeTo100, trendScore } from "@/lib/score";
import type { Region } from "@/lib/types";
import { audit, getDb, logUsage } from "./db";
import { fetchTrendsByWoeid, searchRecent, XRateLimited } from "./x-client";

const REGIONS = Object.keys(WOEID) as Region[];

export async function enqueueIngestion(actorId: string) {
  const db = getDb();
  const existing = db
    .prepare("SELECT id FROM jobs WHERE type = 'ingest' AND status IN ('pending', 'running')")
    .get() as { id: string } | undefined;
  if (existing) return { queued: false, message: "An ingestion job is already queued.", jobId: existing.id };
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO jobs (id, type, status, payload, run_after, attempts, created_at, updated_at)
     VALUES (?, 'ingest', 'pending', '{}', ?, 0, ?, ?)`,
  ).run(id, now, now, now);
  audit(actorId, "ingest.enqueue", id);
  const result = await processDueJobs();
  return { queued: true, jobId: id, ...result };
}

export async function processDueJobs() {
  const db = getDb();
  const now = new Date().toISOString();
  const jobs = db
    .prepare("SELECT id, attempts FROM jobs WHERE type = 'ingest' AND status = 'pending' AND run_after <= ? ORDER BY created_at ASC LIMIT 1")
    .all(now) as { id: string; attempts: number }[];
  const summaries: string[] = [];
  for (const job of jobs) {
    db.prepare("UPDATE jobs SET status = 'running', updated_at = ? WHERE id = ?").run(new Date().toISOString(), job.id);
    try {
      const summary = await runIngestion();
      db.prepare("UPDATE jobs SET status = 'done', last_error = NULL, updated_at = ? WHERE id = ?").run(new Date().toISOString(), job.id);
      summaries.push(summary);
    } catch (error) {
      if (error instanceof XRateLimited) {
        const attempts = job.attempts + 1;
        const status = attempts >= 4 ? "failed" : "pending";
        db.prepare("UPDATE jobs SET status = ?, attempts = ?, run_after = ?, last_error = ?, updated_at = ? WHERE id = ?").run(
          status,
          attempts,
          new Date(error.retryAt).toISOString(),
          "rate_limited",
          new Date().toISOString(),
          job.id,
        );
        summaries.push(status === "failed" ? "Ingestion stopped after repeated X rate limits." : "X rate limit hit. Job will resume when the window resets.");
      } else {
        const attempts = job.attempts + 1;
        db.prepare("UPDATE jobs SET status = ?, attempts = ?, last_error = ?, updated_at = ? WHERE id = ?").run(
          attempts >= 3 ? "failed" : "pending",
          attempts,
          "ingest_failed",
          new Date().toISOString(),
          job.id,
        );
        summaries.push("Ingestion failed. The previous cache is unchanged.");
      }
    }
  }
  if (!jobs.length) summaries.push("No ingestion job was due.");
  return { summary: summaries.join(" ") };
}

async function runIngestion(): Promise<string> {
  if (!process.env.X_BEARER_TOKEN) {
    logUsage({
      endpoint: "ingest",
      source: "cache",
      status: "skipped",
      latencyMs: 0,
      actor: "system",
      detail: "X bearer token is not set. No X request was made.",
    });
    return "X bearer token is not set. Served the stored snapshot. No X request was made.";
  }
  let replaced = 0;
  for (const region of REGIONS) {
    const fetched = await fetchTrendsByWoeid(WOEID[region]);
    if (fetched.skipped || fetched.trends.length === 0) continue;
    replaced += replaceRegion(region, fetched.trends);
    const top = [...fetched.trends].sort((a, b) => b.tweetCount - a.tweetCount).slice(0, 5);
    for (const trend of top) {
      const recent = await searchRecent(trend.name);
      if (!recent.skipped && recent.posts.length) storePosts(region, trend.name, recent.posts);
    }
  }
  return replaced
    ? `Stored ${replaced} trends from X. Recent search ran only for the top five names in each region that returned data.`
    : "X returned no trends. The previous cache is unchanged.";
}

function replaceRegion(region: Region, trends: { name: string; tweetCount: number }[]) {
  const db = getDb();
  const volumes = normalizeTo100(trends.map((trend) => trend.tweetCount));
  const now = new Date().toISOString();
  db.exec("BEGIN");
  try {
    const oldIds = db.prepare("SELECT id FROM trends WHERE region = ? AND origin = 'demo-cache'").all(region) as { id: string }[];
    for (const old of oldIds) {
      db.prepare("DELETE FROM posts WHERE trend_id = ?").run(old.id);
      db.prepare("DELETE FROM trend_snapshots WHERE trend_id = ?").run(old.id);
      db.prepare("DELETE FROM trends WHERE id = ?").run(old.id);
    }
    const upsert = db.prepare("SELECT id, post_count, first_seen_at FROM trends WHERE region = ? AND lower(name) = lower(?) AND origin = 'x-api'");
    let count = 0;
    trends.forEach((trend, index) => {
      const existing = upsert.get(region, trend.name) as { id: string; post_count: number; first_seen_at: string } | undefined;
      const growthPct = existing ? growthPercent(existing.post_count, trend.tweetCount) : 0;
      const growthRate = Math.max(0, Math.min(100, growthPct));
      const id = existing?.id ?? `x:${region}:${slug(trend.name)}`;
      const score = trendScore(growthRate, 50, volumes[index] ?? 0, 50);
      const status = growthPct >= 80 ? "rising" : growthPct < 0 ? "cooling" : "peaking";
      const payload = {
        id,
        name: trend.name,
        region,
        woeid: WOEID[region],
        category: "tech",
        language: "en",
        growthPct,
        postCount: trend.tweetCount,
        origin: "x-api",
      };
      if (existing) {
        db.prepare(
          `UPDATE trends SET post_count = ?, growth_pct = ?, growth_rate = ?, post_volume = ?, current_score = ?, status = ?,
           last_seen_at = ?, captured_at = ?, raw_payload = ? WHERE id = ?`,
        ).run(trend.tweetCount, growthPct, growthRate, volumes[index] ?? 0, score, status, now, now, JSON.stringify(payload), id);
      } else {
        db.prepare(
          `INSERT INTO trends (
            id, x_trend_id, name, woeid, region, category, language, first_seen_at, last_seen_at, captured_at,
            current_score, growth_rate, growth_pct, growth_window, post_volume, post_count, unique_authors,
            like_count, repost_count, reply_count, quote_count, engagement_rate, sentiment_score, sentiment_json,
            status, emotion, summary, why_trending, questions_json, hashtags_json, keywords_json, relevance_json,
            sparkline_json, windows_json, origin, raw_payload
          ) VALUES (
            ?, NULL, ?, ?, ?, 'tech', 'en', ?, ?, ?,
            ?, ?, ?, '3h', ?, ?, 0,
            0, 0, 0, 0, 50, 0, '{"positive":0,"negative":0,"neutral":100}',
            ?, 'curiosity', ?, ?, '[]', '[]', '[]', ?,
            ?, '["3h","12h","24h","7d"]', 'x-api', ?
          )`,
        ).run(
          id,
          trend.name,
          WOEID[region],
          region,
          now,
          now,
          now,
          score,
          growthRate,
          growthPct,
          volumes[index] ?? 0,
          trend.tweetCount,
          status,
          `First stored pull from X for ${trend.name}. Filed under tech until a niche is classified.`,
          growthPct
            ? `Posts moved ${growthPct}% versus the previous stored count.`
            : "First cached pull from X for this name. Growth versus a previous window is not available yet.",
          JSON.stringify({ tech: 70, finance: 40, fitness: 34, movies: 34, spirituality: 34, education: 50, business: 55 }),
          JSON.stringify([trend.tweetCount]),
          JSON.stringify(payload),
        );
      }
      db.prepare(
        `INSERT INTO trend_snapshots (id, trend_id, captured_at, post_count, like_count, repost_count, reply_count, quote_count, unique_authors, score)
         VALUES (?, ?, ?, ?, 0, 0, 0, 0, 0, ?)`,
      ).run(`${id}:${now}`, id, now, trend.tweetCount, score);
      count += 1;
    });
    db.exec("COMMIT");
    return count;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function storePosts(region: Region, name: string, posts: Awaited<ReturnType<typeof searchRecent>>["posts"]) {
  const db = getDb();
  const trend = db.prepare("SELECT id, language FROM trends WHERE region = ? AND lower(name) = lower(?) AND origin = 'x-api'").get(region, name) as
    | { id: string; language: string }
    | undefined;
  if (!trend) return;
  const insert = db.prepare(
    `INSERT INTO posts (
      id, x_post_id, trend_id, author_id, author_label, text, like_count, repost_count, reply_count, quote_count,
      posted_at, language, sentiment, engagement_score, origin
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'neutral', ?, 'x-api')
    ON CONFLICT(id) DO NOTHING`,
  );
  for (const post of posts) {
    insert.run(
      `xpost:${post.id}`,
      post.id,
      trend.id,
      post.authorId,
      "X post",
      post.text,
      post.likes,
      post.reposts,
      post.replies,
      post.quotes,
      post.createdAt,
      post.lang || trend.language,
      post.likes + post.reposts * 2 + post.replies * 1.5 + post.quotes * 2,
    );
  }
}

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "trend";
}

export function listJobs() {
  return getDb()
    .prepare("SELECT id, type, status, attempts, last_error, run_after, created_at, updated_at FROM jobs ORDER BY created_at DESC LIMIT 12")
    .all() as {
    id: string;
    type: string;
    status: string;
    attempts: number;
    last_error: string | null;
    run_after: string;
    created_at: string;
    updated_at: string;
  }[];
}

let timer: NodeJS.Timeout | undefined;

export function startScheduler() {
  if (timer) return;
  timer = setInterval(() => {
    void enqueueIngestion("system").catch(() => undefined);
  }, 15 * 60 * 1000);
  timer.unref?.();
}
