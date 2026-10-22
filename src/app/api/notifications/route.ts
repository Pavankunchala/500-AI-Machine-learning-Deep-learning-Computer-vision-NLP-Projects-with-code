import { NextRequest } from "next/server";
import { listNotifications, markNotificationsRead } from "@/server/alerts";
import { requireUser } from "@/server/auth";
import { json, route } from "@/server/http";

export const GET = route(async (req: NextRequest) => {
  const user = requireUser(req);
  const items = listNotifications(user.id).map((row) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    trendId: row.trend_id,
    channel: row.channel,
    read: row.read === 1,
    createdAt: row.created_at,
  }));
  return json({ items });
});

export const POST = route(async (req: NextRequest) => {
  const user = requireUser(req);
  markNotificationsRead(user.id);
  return json({ ok: true });
});
