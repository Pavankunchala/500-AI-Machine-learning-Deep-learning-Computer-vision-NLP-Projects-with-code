import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "./db";

export class HttpError extends Error {
  status: number;
  code?: string;
  extra?: Record<string, unknown>;

  constructor(status: number, message: string, code?: string, extra?: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.code = code;
    this.extra = extra;
  }
}

export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim().slice(0, 64);
  return "local";
}

export function assertSameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return;
  let host: string;
  try {
    host = new URL(origin).host;
  } catch {
    throw new HttpError(403, "Cross-origin request blocked.");
  }
  const expected = req.headers.get("host");
  if (!expected || host !== expected) throw new HttpError(403, "Cross-origin request blocked.");
}

export function rateLimit(key: string, limit: number, windowMs: number) {
  const db = getDb();
  const now = Date.now();
  const row = db.prepare("SELECT hits, window_start FROM rate_buckets WHERE key = ?").get(key) as
    | { hits: number; window_start: number }
    | undefined;
  if (!row || now - row.window_start >= windowMs) {
    db.prepare(
      `INSERT INTO rate_buckets (key, hits, window_start) VALUES (?, 1, ?)
       ON CONFLICT(key) DO UPDATE SET hits = 1, window_start = excluded.window_start`,
    ).run(key, now);
    return;
  }
  if (row.hits >= limit) {
    throw new HttpError(429, "Too many requests. Wait a moment and try again.", "RATE_LIMIT");
  }
  db.prepare("UPDATE rate_buckets SET hits = hits + 1 WHERE key = ?").run(key);
}

export async function readJson<T>(req: NextRequest, schema: z.ZodType<T>): Promise<T> {
  const declared = Number(req.headers.get("content-length") || 0);
  if (declared > 20_000) throw new HttpError(413, "Request is too large.");
  const text = await req.text();
  if (text.length > 20_000) throw new HttpError(413, "Request is too large.");
  let body: unknown = {};
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      throw new HttpError(400, "Invalid JSON.");
    }
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const hint =
      process.env.NODE_ENV !== "production" && issue
        ? `${issue.path.join(".") || "body"}: ${issue.message}`
        : "Check the form and try again.";
    throw new HttpError(400, hint);
  }
  return parsed.data;
}

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

type Handler = (req: NextRequest, ctx: { params: Promise<Record<string, string>> }) => Promise<Response>;

export function route(handler: Handler) {
  return async (req: NextRequest, ctx: { params: Promise<Record<string, string>> }) => {
    try {
      if (req.method !== "GET" && req.method !== "HEAD") assertSameOrigin(req);
      const { dbReady } = await import("./db");
      await dbReady();
      return await handler(req, ctx);
    } catch (error) {
      if (error instanceof HttpError) {
        return NextResponse.json({ error: error.message, code: error.code, ...error.extra }, { status: error.status });
      }
      console.error("api_error", error instanceof Error ? error.name : "unknown");
      return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    }
  };
}
