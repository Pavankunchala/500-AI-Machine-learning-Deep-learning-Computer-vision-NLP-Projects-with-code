import { NICHE_LABEL } from "@/lib/constants";
import type { AlertChannel, Niche } from "@/lib/types";
import { decrypt, encrypt } from "./crypto";
import { getDb, logUsage, type UserRow } from "./db";

const COOLDOWN_MS = 6 * 60 * 60 * 1000;

export function listAlerts(userId: string) {
  const rows = getDb()
    .prepare("SELECT id, niche, threshold, channel, destination, last_sent_at, active, created_at FROM alerts WHERE user_id = ? ORDER BY created_at DESC")
    .all(userId) as {
    id: string;
    niche: Niche;
    threshold: number;
    channel: AlertChannel;
    destination: string | null;
    last_sent_at: string | null;
    active: number;
    created_at: string;
  }[];
  return rows.map((row) => ({
    id: row.id,
    niche: row.niche,
    threshold: row.threshold,
    channel: row.channel,
    destination: row.destination ? mask(decrypt(row.destination)) : null,
    lastSentAt: row.last_sent_at,
    active: row.active === 1,
    createdAt: row.created_at,
  }));
}

function mask(value: string) {
  if (value.length <= 4) return "••••";
  return `${"•".repeat(Math.max(0, value.length - 4))}${value.slice(-4)}`;
}

export function saveAlert(user: UserRow, input: { niche: Niche; threshold: number; channel: AlertChannel; destination?: string }) {
  const db = getDb();
  const destination =
    input.channel === "whatsapp" && input.destination ? encrypt(input.destination) : input.channel === "email" ? encrypt(user.email) : null;
  const existing = db
    .prepare("SELECT id FROM alerts WHERE user_id = ? AND niche = ? AND channel = ?")
    .get(user.id, input.niche, input.channel) as { id: string } | undefined;
  const now = new Date().toISOString();
  if (existing) {
    db.prepare("UPDATE alerts SET threshold = ?, destination = ?, active = 1 WHERE id = ?").run(input.threshold, destination, existing.id);
    return existing.id;
  }
  const id = crypto.randomUUID();
  db.prepare(
    `INSERT INTO alerts (id, user_id, niche, threshold, channel, destination, last_sent_at, active, created_at)
     VALUES (?, ?, ?, ?, ?, ?, NULL, 1, ?)`,
  ).run(id, user.id, input.niche, input.threshold, input.channel, destination, now);
  return id;
}

export function setAlertActive(userId: string, id: string, active: boolean) {
  const result = getDb().prepare("UPDATE alerts SET active = ? WHERE id = ? AND user_id = ?").run(active ? 1 : 0, id, userId);
  return result.changes > 0;
}

export async function evaluateAlerts(user: UserRow) {
  const db = getDb();
  const alerts = db
    .prepare("SELECT * FROM alerts WHERE user_id = ? AND active = 1")
    .all(user.id) as {
    id: string;
    niche: Niche;
    threshold: number;
    channel: AlertChannel;
    last_sent_at: string | null;
  }[];
  const created: string[] = [];
  for (const alert of alerts) {
    if (alert.last_sent_at && Date.now() - Date.parse(alert.last_sent_at) < COOLDOWN_MS) continue;
    const hit = db
      .prepare(
        `SELECT id, name, growth_pct, why_trending FROM trends
         WHERE category = ? AND growth_pct >= ? AND status = 'rising'
         ORDER BY growth_pct DESC LIMIT 1`,
      )
      .get(alert.niche, alert.threshold) as { id: string; name: string; growth_pct: number; why_trending: string } | undefined;
    if (!hit) continue;
    const label = NICHE_LABEL.en[alert.niche];
    const title = `${label} trend rising fast: ${hit.name}`;
    let body = `${hit.why_trending} Threshold on this alert: ${alert.threshold}% growth.`;
    const delivery = await deliver(alert.channel, user, title, body);
    body = `${body} ${delivery}`;
    const now = new Date().toISOString();
    db.prepare(
      `INSERT INTO notifications (id, user_id, title, body, trend_id, channel, read, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
    ).run(crypto.randomUUID(), user.id, title, body.trim(), hit.id, alert.channel, now);
    db.prepare("UPDATE alerts SET last_sent_at = ? WHERE id = ?").run(now, alert.id);
    logUsage({ endpoint: "alerts", source: "cache", status: "sent", latencyMs: 0, actor: user.id, detail: alert.channel });
    created.push(hit.id);
  }
  return created;
}

async function deliver(channel: AlertChannel, user: UserRow, title: string, body: string): Promise<string> {
  if (channel === "inapp" || channel === "push") {
    return channel === "push"
      ? "Push delivery is previewed in the app. No device push token is stored yet."
      : "Saved in the app.";
  }
  if (channel === "email") {
    if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) {
      return "Email was not sent because no email provider key is configured.";
    }
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: process.env.RESEND_FROM, to: user.email, subject: title, text: body }),
    });
    return response.ok ? "Email sent." : "Email provider returned an error. The in-app alert is saved.";
  }
  return "WhatsApp was not sent because no WhatsApp provider is configured. The alert is saved in the app.";
}

export function listNotifications(userId: string) {
  return getDb()
    .prepare(
      `SELECT id, title, body, trend_id, channel, read, created_at FROM notifications
       WHERE user_id = ? ORDER BY created_at DESC LIMIT 30`,
    )
    .all(userId) as {
    id: string;
    title: string;
    body: string;
    trend_id: string | null;
    channel: string;
    read: number;
    created_at: string;
  }[];
}

export function markNotificationsRead(userId: string) {
  getDb().prepare("UPDATE notifications SET read = 1 WHERE user_id = ?").run(userId);
}
