import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { PLAN_LIMITS } from "@/lib/constants";
import type { Platform, PublicUser } from "@/lib/types";
import { decrypt } from "./crypto";
import { getDb, usageFor, type UserRow } from "./db";
import { HttpError } from "./http";

export const ACCESS_COOKIE = "tp_access";
export const REFRESH_COOKIE = "tp_refresh";
const ACCESS_MS = 30 * 60 * 1000;
const REFRESH_MS = 14 * 24 * 60 * 60 * 1000;

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function newToken(): string {
  return randomBytes(32).toString("base64url");
}

export function publicUser(row: UserRow): PublicUser {
  const limits = PLAN_LIMITS[row.plan];
  const usage = usageFor(row.id);
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    plan: row.plan,
    niche: row.niche as PublicUser["niche"],
    audience: row.audience as PublicUser["audience"],
    tone: row.tone as PublicUser["tone"],
    language: row.language as PublicUser["language"],
    platforms: JSON.parse(row.platforms) as Platform[],
    onboarded: row.onboarded === 1,
    streak: row.streak_count,
    points: row.idea_points,
    badges: JSON.parse(row.badges) as string[],
    totpEnabled: row.totp_enabled === 1,
    limits: { views: limits.views, ai: limits.ai, export: [...limits.export] },
    usage,
  };
}

export function findUserByEmail(email: string): UserRow | undefined {
  return getDb().prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase()) as UserRow | undefined;
}

export function findUserById(id: string): UserRow | undefined {
  return getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined;
}

export function userFromAccessToken(token: string | undefined): UserRow | null {
  if (!token) return null;
  const row = getDb()
    .prepare(
      `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.access_hash = ? AND s.revoked = 0 AND s.access_expires_at > ?`,
    )
    .get(hashToken(token), new Date().toISOString()) as UserRow | undefined;
  return row ?? null;
}

export function requireUser(req: NextRequest): UserRow {
  const user = userFromAccessToken(req.cookies.get(ACCESS_COOKIE)?.value);
  if (!user) throw new HttpError(401, "Sign in to continue.", "AUTH");
  return user;
}

export function requireAdmin(req: NextRequest): UserRow {
  const user = requireUser(req);
  if (user.role !== "admin") throw new HttpError(403, "Admin only.", "FORBIDDEN");
  return user;
}

export function totpSecret(row: UserRow): string | null {
  if (!row.totp_secret) return null;
  const plain = decrypt(row.totp_secret);
  return plain || null;
}

export function createSession(userId: string, userAgent: string | null): { access: string; refresh: string } {
  const access = newToken();
  const refresh = newToken();
  const now = Date.now();
  getDb()
    .prepare(
      `INSERT INTO sessions (
        id, user_id, access_hash, refresh_hash, access_expires_at, refresh_expires_at, user_agent, revoked, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
    )
    .run(
      crypto.randomUUID(),
      userId,
      hashToken(access),
      hashToken(refresh),
      new Date(now + ACCESS_MS).toISOString(),
      new Date(now + REFRESH_MS).toISOString(),
      userAgent?.slice(0, 180) ?? null,
      new Date(now).toISOString(),
    );
  return { access, refresh };
}

export function rotateRefresh(refreshToken: string | undefined, userAgent: string | null): { access: string; refresh: string } | null {
  if (!refreshToken) return null;
  const db = getDb();
  const hashed = hashToken(refreshToken);
  const now = new Date().toISOString();
  const current = db
    .prepare(
      `SELECT id, user_id FROM sessions
       WHERE refresh_hash = ? AND revoked = 0 AND refresh_expires_at > ?`,
    )
    .get(hashed, now) as { id: string; user_id: string } | undefined;
  if (!current) {
    const reused = db
      .prepare("SELECT user_id FROM sessions WHERE previous_refresh_hash = ?")
      .get(hashed) as { user_id: string } | undefined;
    if (reused) {
      db.prepare("UPDATE sessions SET revoked = 1 WHERE user_id = ?").run(reused.user_id);
    }
    return null;
  }
  const access = newToken();
  const refresh = newToken();
  const at = Date.now();
  db.prepare(
    `UPDATE sessions
     SET previous_refresh_hash = refresh_hash,
         access_hash = ?,
         refresh_hash = ?,
         access_expires_at = ?,
         refresh_expires_at = ?,
         user_agent = ?
     WHERE id = ?`,
  ).run(
    hashToken(access),
    hashToken(refresh),
    new Date(at + ACCESS_MS).toISOString(),
    new Date(at + REFRESH_MS).toISOString(),
    userAgent?.slice(0, 180) ?? null,
    current.id,
  );
  return { access, refresh };
}

export function revokeAccess(token: string | undefined) {
  if (!token) return;
  getDb().prepare("UPDATE sessions SET revoked = 1 WHERE access_hash = ?").run(hashToken(token));
}

export function revokeAll(userId: string) {
  getDb().prepare("UPDATE sessions SET revoked = 1 WHERE user_id = ?").run(userId);
}

export function attachSession(res: NextResponse, tokens: { access: string; refresh: string }) {
  const secure = process.env.NODE_ENV === "production";
  res.cookies.set(ACCESS_COOKIE, tokens.access, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: ACCESS_MS / 1000,
  });
  res.cookies.set(REFRESH_COOKIE, tokens.refresh, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/api/auth",
    maxAge: REFRESH_MS / 1000,
  });
}

export function clearSession(res: NextResponse) {
  const secure = process.env.NODE_ENV === "production";
  res.cookies.set(ACCESS_COOKIE, "", { httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: 0 });
  res.cookies.set(REFRESH_COOKIE, "", { httpOnly: true, sameSite: "lax", secure, path: "/api/auth", maxAge: 0 });
}

export function listSessions(userId: string, currentAccess: string | undefined) {
  const currentHash = currentAccess ? hashToken(currentAccess) : "";
  const rows = getDb()
    .prepare(
      `SELECT id, user_agent, created_at, access_hash, revoked FROM sessions
       WHERE user_id = ? AND revoked = 0 ORDER BY created_at DESC LIMIT 12`,
    )
    .all(userId) as { id: string; user_agent: string | null; created_at: string; access_hash: string; revoked: number }[];
  return rows.map((row) => ({
    id: row.id,
    userAgent: row.user_agent || "Unknown device",
    createdAt: row.created_at,
    current: row.access_hash === currentHash,
  }));
}
